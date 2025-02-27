
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
  
  summary += `\nAvailable Fields for Analysis:\n`;
  summary += `- Company Name: ${companies.length} unique companies\n`;
  summary += `- Revenue Generated: Range from $${Math.min(...revenueByCompany.map(c => c.revenue)).toFixed(2)} to $${Math.max(...revenueByCompany.map(c => c.revenue)).toFixed(2)}\n`;
  summary += `- Collections Received: For payment analysis\n`;
  summary += `- Outstanding Amount: For accounts receivable analysis\n`;
  summary += `- Date: For temporal revenue trends\n\n`;
  
  summary += `Example Company Profile:\n${JSON.stringify(revenueByCompany[0], null, 2)}\n`;
  
  return summary;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, baseData, role = 'default' } = await req.json();
    console.log('Processing request with data length:', baseData?.length || 0);

    // Create a detailed system message focused on company revenue analysis
    const systemMessage = {
      role: 'system',
      content: `You are a financial analyst specializing in company revenue analysis and benchmarking.

When analyzing company revenue data, follow these guidelines:
1. Identify and compare top-performing companies
2. Calculate and explain revenue distributions and market share
3. Highlight significant revenue patterns or outliers
4. When showing rankings or comparisons, include visualization data in this format:
   \`\`\`[{"name": "Company Name", "value": revenue_amount}]\`\`\`
5. Use percentages to show relative performance
6. Round monetary values to 2 decimal places
7. Focus on actionable insights about revenue patterns

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
