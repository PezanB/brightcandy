
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Helper function to summarize data for context
const summarizeData = (data: any[]) => {
  if (!data || data.length === 0) return "No data available";
  
  // Get all column names from the first row
  const columns = Object.keys(data[0]);
  
  // Calculate basic statistics for numeric columns
  const stats: Record<string, any> = {};
  columns.forEach(column => {
    const values = data.map(row => row[column]);
    if (typeof values[0] === 'number') {
      const sum = values.reduce((a, b) => a + b, 0);
      stats[column] = {
        min: Math.min(...values),
        max: Math.max(...values),
        avg: sum / values.length,
        total: sum
      };
    } else if (typeof values[0] === 'string') {
      const uniqueValues = new Set(values);
      stats[column] = {
        uniqueValues: uniqueValues.size,
        examples: Array.from(uniqueValues).slice(0, 3)
      };
    }
  });

  return {
    summary: `Dataset Summary:
    Total Records: ${data.length}
    Columns: ${columns.join(', ')}
    Column Statistics: ${JSON.stringify(stats, null, 2)}`,
    columns,
    stats
  };
};

// Helper function to generate chart data for visualization
const generateChartData = (baseData: any[], dataContext: any) => {
  if (!baseData || baseData.length === 0 || !dataContext || !dataContext.stats) {
    return null;
  }
  
  // Get numeric columns for potential visualization
  const numericColumns = Object.keys(dataContext.stats).filter(
    col => dataContext.stats[col].avg !== undefined
  );
  
  if (numericColumns.length === 0) {
    return null;
  }
  
  // Generate chart data for the first 10 rows (or less if fewer rows exist)
  const chartData = baseData.slice(0, Math.min(10, baseData.length)).map(row => {
    const chartRow: any = { name: row[dataContext.columns[0]] || 'Unnamed' };
    numericColumns.forEach(col => {
      chartRow[col] = row[col];
    });
    return chartRow;
  });
  
  return chartData.length > 0 ? chartData : null;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, baseData } = await req.json();
    console.log('Processing request with data length:', baseData?.length || 0);

    const requestId = crypto.randomUUID();
    console.log(`Processing request ${requestId}`);

    // Skip analysis if no data is provided
    if (!baseData || baseData.length === 0) {
      console.log(`Request ${requestId} has no data, proceeding with general conversation`);
      
      // For general conversation without data
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openAIApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a helpful AI assistant capable of answering general questions.`
            },
            ...messages
          ],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`OpenAI API error (${requestId}):`, errorText);
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0].message.content;
      console.log(`Request ${requestId} completed successfully (general mode)`);

      return new Response(JSON.stringify({
        response: {
          role: 'assistant',
          content: content
        },
        chartData: null,
        requestId: requestId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If we have data, proceed with data analysis
    const dataContext = summarizeData(baseData);
    console.log('Data context generated:', typeof dataContext === 'string' ? dataContext : 'Complex data structure');

    const systemMessage = {
      role: 'system',
      content: `You are a data analysis assistant capable of answering any questions about the provided dataset. 
      
Here's the current data context:
${typeof dataContext === 'string' ? dataContext : dataContext.summary}

Instructions:
1. Analyze the data thoroughly and provide detailed insights
2. Use specific numbers and statistics when relevant
3. If asked for calculations, show your work
4. When appropriate, suggest visualizations that might help understand the data better
5. If you need clarification about any aspect of the data, ask for it
6. You can perform any type of analysis requested on the data
7. ALWAYS include relevant numeric data in your response that can be visualized`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`OpenAI API error (${requestId}):`, errorText);
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log(`Request ${requestId} completed successfully (data analysis mode)`);

    // Always generate chart data when we have base data
    let chartData = generateChartData(baseData, dataContext);
    
    // If we couldn't generate chart data automatically, use a simplified version
    if (!chartData && baseData.length > 0) {
      // Fallback: create simplified chart data from the first few rows
      const firstRow = baseData[0];
      const columns = Object.keys(firstRow);
      
      // Find potential numeric columns
      const potentialNumericColumns = columns.filter(col => 
        typeof firstRow[col] === 'number' || 
        !isNaN(parseFloat(firstRow[col]))
      );
      
      if (potentialNumericColumns.length > 0) {
        // Use the first non-numeric column as the name if available, otherwise use index
        const nameColumn = columns.find(col => 
          typeof firstRow[col] === 'string' && isNaN(parseFloat(firstRow[col]))
        ) || 'index';
        
        chartData = baseData.slice(0, 10).map((row, index) => {
          const chartRow: any = { 
            name: nameColumn === 'index' ? `Item ${index + 1}` : row[nameColumn] || `Item ${index + 1}`
          };
          
          potentialNumericColumns.forEach(col => {
            // Ensure we're storing numeric values
            const value = typeof row[col] === 'number' ? 
              row[col] : 
              parseFloat(row[col]) || 0;
            
            chartRow[col] = value;
          });
          
          return chartRow;
        });
      }
    }

    console.log(`Chart data for request ${requestId}:`, chartData ? `Generated (${chartData.length} items)` : 'None generated');

    return new Response(JSON.stringify({
      response: {
        role: 'assistant',
        content: content
      },
      chartData: chartData,
      requestId: requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      errorId: crypto.randomUUID() 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
