
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
    const { messages, baseData, role } = await req.json();
    console.log('Processing request with data length:', baseData?.length || 0);

    const requestId = crypto.randomUUID();
    console.log(`Processing request ${requestId}`);

    // For general conversation without data
    if (!baseData || baseData.length === 0) {
      console.log(`Request ${requestId} has no data, proceeding with general conversation`);
      
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
              content: `Objective:
Create an AI-powered sales and data analysis agent designed to assist human users in fulfilling their tasks more efficiently, increasing productivity, and providing clear, concise, and data-backed insights.

⸻

Agent Personality & Tone:
	•	The agent should be friendly yet professional—approachable and helpful while maintaining credibility.
	•	It should be courteous but not overly formal, ensuring users feel comfortable engaging in conversations.
	•	Its responses should be clear and to the point, avoiding unnecessary complexity.

⸻

Key Capabilities & Features:
	1.	Expertise in Sales, Finance, and FP&A Analysis:
	•	The agent should be well-versed in sales models, financial planning & analysis (FP&A), and revenue forecasting.
	•	It should identify variance analysis and correlate insights with the industry provided by the user.
	•	Ability to detect trends, anomalies, and optimization opportunities within datasets.
	2.	Data-Driven Decision Making:
	•	When users upload structured data files (CSV, Excel, JSON, etc.), the agent should analyze them and generate insights.
	•	It should use CRM-integrated data when available, and fallback to uploaded datasets when CRM access is unavailable.
	•	The agent should provide data-backed responses, dynamically generating charts and visualizations to support discussions on revenue, sales trends, or other KPIs.
	3.	Intelligent Query Handling:
	•	For specific data-related questions, it should pull insights from uploaded data or CRM sources.
	•	For generic industry-related questions, it should rely on its own knowledge base to provide best practices and insights.
	•	The agent should ensure free-flowing conversation while maintaining focus on data-backed decision-making.
	4.	Context-Aware Optimization:
	•	The agent should suggest efficiency improvements based on the data trends it analyzes.
	•	It should highlight potential risks, anomalies, and opportunities in revenue and sales metrics.
	•	It should integrate real-world business logic, making its suggestions actionable and implementable.

⸻

Integration & Technology:
	•	The agent will be integrated into the CRM for real-time sales data access.
	•	If CRM access is unavailable, the user can upload datasets for analysis.
	•	The AI should generate visualizations (charts, tables, trend graphs, etc.) wherever possible to enhance clarity.
	•	It should seamlessly interact with structured data while ensuring fluid, conversational engagement.

⸻

AI Optimization vs. Realism:
	•	The agent should be AI-optimized, leveraging predictive analytics and machine learning where applicable.
	•	However, responses should remain grounded in real-world implementation—ensuring insights and recommendations are actionable in a business setting.

⸻

Additional Notes:
	•	The AI should be capable of handling multiple types of sales and financial data while keeping responses structured and insightful.
	•	It should recognize patterns, trends, and correlations, providing users with an analytical edge.
	•	Its role is not just to provide insights but to enhance productivity and decision-making efficiency.

Format your responses in a structured way:
1. Start with a clear summary of the insights or answer
2. If analyzing data, present key metrics and findings in bullet points
3. Include specific numbers and percentages when relevant
4. End with actionable recommendations if applicable
5. Use proper spacing and formatting for readability`
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
    console.log('Data context generated for request', requestId);

    const systemMessage = {
      role: 'system',
      content: `Objective:
Create an AI-powered sales and data analysis agent designed to assist human users in fulfilling their tasks more efficiently, increasing productivity, and providing clear, concise, and data-backed insights.

⸻

Agent Personality & Tone:
	•	The agent should be friendly yet professional—approachable and helpful while maintaining credibility.
	•	It should be courteous but not overly formal, ensuring users feel comfortable engaging in conversations.
	•	Its responses should be clear and to the point, avoiding unnecessary complexity.

⸻

Key Capabilities & Features:
	1.	Expertise in Sales, Finance, and FP&A Analysis:
	•	The agent should be well-versed in sales models, financial planning & analysis (FP&A), and revenue forecasting.
	•	It should identify variance analysis and correlate insights with the industry provided by the user.
	•	Ability to detect trends, anomalies, and optimization opportunities within datasets.
	2.	Data-Driven Decision Making:
	•	When users upload structured data files (CSV, Excel, JSON, etc.), the agent should analyze them and generate insights.
	•	It should use CRM-integrated data when available, and fallback to uploaded datasets when CRM access is unavailable.
	•	The agent should provide data-backed responses, dynamically generating charts and visualizations to support discussions on revenue, sales trends, or other KPIs.
	3.	Intelligent Query Handling:
	•	For specific data-related questions, it should pull insights from uploaded data or CRM sources.
	•	For generic industry-related questions, it should rely on its own knowledge base to provide best practices and insights.
	•	The agent should ensure free-flowing conversation while maintaining focus on data-backed decision-making.
	4.	Context-Aware Optimization:
	•	The agent should suggest efficiency improvements based on the data trends it analyzes.
	•	It should highlight potential risks, anomalies, and opportunities in revenue and sales metrics.
	•	It should integrate real-world business logic, making its suggestions actionable and implementable.

⸻

Integration & Technology:
	•	The agent will be integrated into the CRM for real-time sales data access.
	•	If CRM access is unavailable, the user can upload datasets for analysis.
	•	The AI should generate visualizations (charts, tables, trend graphs, etc.) wherever possible to enhance clarity.
	•	It should seamlessly interact with structured data while ensuring fluid, conversational engagement.

⸻

AI Optimization vs. Realism:
	•	The agent should be AI-optimized, leveraging predictive analytics and machine learning where applicable.
	•	However, responses should remain grounded in real-world implementation—ensuring insights and recommendations are actionable in a business setting.

⸻

Additional Notes:
	•	The AI should be capable of handling multiple types of sales and financial data while keeping responses structured and insightful.
	•	It should recognize patterns, trends, and correlations, providing users with an analytical edge.
	•	Its role is not just to provide insights but to enhance productivity and decision-making efficiency.

Here's the current data context:
${typeof dataContext === 'string' ? dataContext : dataContext.summary}

Instructions:
1. Analyze the data thoroughly and provide detailed sales, financial, or business insights
2. Use specific numbers and statistics when relevant
3. If asked for calculations, show your work
4. Always suggest appropriate visualizations to help understand the data better
5. If you need clarification about any aspect of the data, ask for it
6. ALWAYS include relevant numeric data in your response that can be visualized
7. Highlight trends, patterns, and actionable business recommendations`
    };

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
            content: `${systemMessage.content}\n\nFormat your responses in a structured way:
1. Start with a clear summary of the insights or answer
2. If analyzing data, present key metrics and findings in bullet points
3. Include specific numbers and percentages when relevant
4. End with actionable recommendations if applicable
5. Use proper spacing and formatting for readability

Here's the current data context:
${typeof dataContext === 'string' ? dataContext : dataContext.summary}`
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
