
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getSystemPromptForRole = (role: string, baseData: any[] = []) => {
  const dataContext = baseData.length > 0 
    ? `\n\nHere is the context data to analyze:\n${JSON.stringify(baseData, null, 2)}`
    : '';

  switch (role) {
    case 'admin':
      return `You are a Strategic Data Operations AI assistant. You have access to business data that you can analyze to provide insights. When discussing metrics or analysis, ALWAYS include relevant data visualization using this exact format:

\`\`\`[{"name": "Category1", "value": 450000}, {"name": "Category2", "value": 680000}]\`\`\`${dataContext}`;

    case 'manager':
      return `You are a Sales Team Management AI assistant. You have access to sales data that you can analyze to provide insights. When discussing metrics or analysis, ALWAYS include relevant data visualization using this exact format:

\`\`\`[{"name": "Q1", "value": 250000}, {"name": "Q2", "value": 310000}]\`\`\`${dataContext}`;

    default:
      return `You are a helpful AI assistant with analytical capabilities. You have access to business data that you can analyze to provide insights. When discussing metrics or analysis, ALWAYS include relevant data visualization using this exact format:

\`\`\`[{"name": "Metric1", "value": 150000}, {"name": "Metric2", "value": 180000}]\`\`\`${dataContext}`;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, role, baseData } = await req.json();
    console.log('Processing request for role:', role);
    console.log('Base data provided:', baseData);

    const systemPrompt = getSystemPromptForRole(role, baseData);
    console.log('Using system prompt:', systemPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('Raw AI response:', content);

    // Extract JSON data for charts
    let chartData = null;
    try {
      const matches = content.match(/```([\s\S]*?)```/);
      if (matches && matches[1]) {
        const jsonStr = matches[1].trim();
        console.log('Extracted JSON string:', jsonStr);
        try {
          const parsed = JSON.parse(jsonStr);
          if (Array.isArray(parsed) && parsed.length > 0 && 
              parsed.every(item => item.name && typeof item.value === 'number')) {
            chartData = parsed;
            console.log('Successfully parsed chart data:', chartData);
          } else {
            console.log('Parsed data is not in the correct format');
          }
        } catch (parseError) {
          console.error('Error parsing JSON:', parseError);
        }
      } else {
        console.log('No JSON data found in triple backticks');
      }
    } catch (e) {
      console.error('Error extracting chart data:', e);
    }

    // Remove the JSON data from the displayed response
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
