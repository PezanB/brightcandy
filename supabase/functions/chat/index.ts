
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Helper function to summarize data for the AI
const summarizeData = (data: any[]) => {
  if (!data || data.length === 0) return "No data available";
  
  // Create a summary of the data structure and sample values
  const sample = data[0];
  const fields = Object.keys(sample);
  
  let summary = `Data summary (${data.length} records):\n`;
  summary += `Fields available: ${fields.join(', ')}\n\n`;
  summary += `Sample record:\n${JSON.stringify(sample, null, 2)}\n\n`;
  
  // Add basic statistics if numeric fields exist
  const numericFields = fields.filter(field => 
    typeof sample[field] === 'number' && !field.toLowerCase().includes('id'));
  
  if (numericFields.length > 0) {
    summary += "Aggregated values:\n";
    numericFields.forEach(field => {
      const values = data.map(item => item[field]).filter(v => typeof v === 'number');
      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      summary += `${field}: Total = ${sum.toFixed(2)}, Average = ${avg.toFixed(2)}\n`;
    });
  }
  
  return summary;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, baseData } = await req.json();
    console.log('Processing request with data length:', baseData?.length || 0);

    // Create a system message with summarized data
    const systemMessage = {
      role: 'system',
      content: `You are a data analysis assistant. Help users understand their data and provide insights. 
      When discussing metrics or providing analysis, if there are quantitative results that could be visualized, 
      include them in a specific JSON format like this:
      \`\`\`[{"name": "Category1", "value": 123}, {"name": "Category2", "value": 456}]\`\`\`
      
      Here is the data context:
      ${summarizeData(baseData)}`
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
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    // Try to extract chart data if present
    let chartData = null;
    try {
      const matches = content.match(/```([\s\S]*?)```/);
      if (matches && matches[1]) {
        const jsonStr = matches[1].trim();
        chartData = JSON.parse(jsonStr);
      }
    } catch (e) {
      console.error('Error extracting chart data:', e);
    }

    // Clean the content by removing the JSON code block
    const cleanedContent = content.replace(/```[\s\S]*?```/g, '').trim();

    return new Response(JSON.stringify({
      response: {
        role: 'assistant',
        content: cleanedContent
      },
      chartData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
