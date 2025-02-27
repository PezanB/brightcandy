
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Helper function to preprocess and summarize financial data
const summarizeFinancialData = (data: any[]) => {
  if (!data || data.length === 0) return "No data available";
  
  // Extract all numeric fields from the first data item to determine possible metrics
  const firstItem = data[0];
  const numericFields = Object.entries(firstItem)
    .filter(([_, value]) => typeof value === 'number')
    .map(([key]) => key);

  // Calculate metrics for each company
  const companies = [...new Set(data.map(item => item['Company Name']))];
  const metrics = companies.slice(0, 12).map(company => {
    const companyData = data.filter(item => item['Company Name'] === company);
    const result: any = { name: company };
    
    // Include all numeric fields in the result
    numericFields.forEach(field => {
      const total = companyData.reduce((sum, item) => sum + (item[field] || 0), 0);
      result[field] = total;
    });
    
    return result;
  });

  // Create a summary of the data
  let summary = `Financial Data Analysis Summary:\n`;
  summary += `Total Companies: ${companies.length}\n`;
  numericFields.forEach(field => {
    const total = metrics.reduce((sum, item) => sum + item[field], 0);
    summary += `Total ${field}: $${total.toFixed(2)}\n`;
  });
  
  return {
    summary,
    data: metrics
  };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, baseData, role = 'default' } = await req.json();
    console.log('Processing request with data length:', baseData?.length || 0);

    const processedData = summarizeFinancialData(baseData);

    const systemMessage = {
      role: 'system',
      content: `You are a financial analyst specializing in company revenue analysis. When analyzing data, focus on trends and provide clear insights about all available metrics. Include visualizations when relevant.

Here is the current financial data context:
${typeof processedData === 'string' ? processedData : processedData.summary}`
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [systemMessage, ...messages],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return new Response(JSON.stringify({
      response: {
        role: 'assistant',
        content: content
      },
      chartData: typeof processedData === 'string' ? null : processedData.data
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
