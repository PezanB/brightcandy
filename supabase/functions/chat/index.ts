
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
  
  // Calculate key metrics
  const totalRevenue = data.reduce((sum, item) => sum + (item['Revenue Generated'] || 0), 0);
  const totalCollections = data.reduce((sum, item) => sum + (item['Collections Received'] || 0), 0);
  const totalOutstanding = data.reduce((sum, item) => sum + (item['Outstanding Amount'] || 0), 0);
  
  // Get unique companies
  const companies = [...new Set(data.map(item => item['Company Name']))];
  
  // Create a summary
  let summary = `Financial Data Analysis Summary:\n`;
  summary += `Total Records: ${data.length}\n`;
  summary += `Number of Companies: ${companies.length}\n`;
  summary += `Total Revenue: $${totalRevenue.toFixed(2)}\n`;
  summary += `Total Collections: $${totalCollections.toFixed(2)}\n`;
  summary += `Total Outstanding: $${totalOutstanding.toFixed(2)}\n\n`;
  
  summary += `Available Fields for Analysis:\n`;
  summary += `- Company Name (for company-specific analysis)\n`;
  summary += `- Revenue Generated (total sales/income)\n`;
  summary += `- Collections Received (actual payments received)\n`;
  summary += `- Outstanding Amount (pending payments)\n`;
  summary += `- Payment Status\n`;
  summary += `- Date (for temporal analysis)\n\n`;
  
  summary += `Sample Data Point:\n${JSON.stringify(data[0], null, 2)}\n`;
  
  return summary;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, baseData, role = 'default' } = await req.json();
    console.log('Processing request with data length:', baseData?.length || 0);

    // Create a detailed system message for financial analysis
    const systemMessage = {
      role: 'system',
      content: `You are a financial data analysis assistant specializing in revenue, collections, and payment analysis. 
      
When analyzing data, follow these guidelines:
1. Always provide specific numerical insights
2. When relevant, include visualization data in this format:
   \`\`\`[{"name": "Category", "value": 123.45}]\`\`\`
3. For comparisons, use both absolute values and percentages
4. Round numbers to 2 decimal places
5. Use clear business terminology
6. When showing trends, sort data chronologically
7. For company comparisons, focus on key metrics like revenue and collection rates

Here is the current financial data context:
${summarizeFinancialData(baseData)}`
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
