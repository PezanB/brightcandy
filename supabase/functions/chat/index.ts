
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Helper function to preprocess and summarize financial data with company revenue focus
const summarizeFinancialData = (data: any[]) => {
  if (!data || data.length === 0) return "No data available";
  
  // Calculate key company metrics
  const companies = [...new Set(data.map(item => item['Company Name']))];
  const revenueByCompany = companies.map(company => {
    const companyData = data.filter(item => item['Company Name'] === company);
    const revenue = companyData.reduce((sum, item) => sum + (item['Revenue Generated'] || 0), 0);
    return { company, revenue };
  }).sort((a, b) => b.revenue - a.revenue);

  const totalRevenue = revenueByCompany.reduce((sum, item) => sum + item.revenue, 0);
  const avgRevenue = totalRevenue / companies.length;
  
  // Create a detailed summary
  let summary = `Financial Data Analysis Summary:\n`;
  summary += `Total Companies: ${companies.length}\n`;
  summary += `Total Revenue Across All Companies: $${totalRevenue.toFixed(2)}\n`;
  summary += `Average Revenue per Company: $${avgRevenue.toFixed(2)}\n\n`;
  
  summary += `Top 5 Companies by Revenue:\n`;
  revenueByCompany.slice(0, 5).forEach(({ company, revenue }) => {
    summary += `- ${company}: $${revenue.toFixed(2)} (${((revenue/totalRevenue)*100).toFixed(2)}% of total)\n`;
  });
  
  return {
    summary,
    data: revenueByCompany.slice(0, 12).map(({ company, revenue }) => ({
      name: company,
      sdwan: revenue * 0.4, // Example split of revenue across products
      ipflex: revenue * 0.35,
      hisae: revenue * 0.25
    }))
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
      content: `You are a financial analyst specializing in company revenue analysis. When analyzing data, focus on revenue trends and provide clear insights. Include visualizations when relevant.

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

    // Send both the AI response and the chart data
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

