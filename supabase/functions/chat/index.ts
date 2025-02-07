
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getSystemPromptForRole = (role: string) => {
  switch (role) {
    case 'admin':
      return `You are a Strategic Data Operations AI assistant. When discussing metrics, ALWAYS include a data visualization section at the end of your response with this exact format:

\`\`\`[{"name": "Manufacturing", "value": 450000}, {"name": "Technology", "value": 680000}, {"name": "Healthcare", "value": 520000}]\`\`\``;

    case 'manager':
      return `You are a Sales Team Management AI assistant. When discussing metrics, ALWAYS include a data visualization section at the end of your response with this exact format:

\`\`\`[{"name": "Q1 Revenue", "value": 250000}, {"name": "Q2 Revenue", "value": 310000}, {"name": "Q3 Revenue", "value": 280000}]\`\`\``;

    case 'rep':
      return `You are a Sales Representative AI assistant. When discussing metrics, ALWAYS include a data visualization section at the end of your response with this exact format:

\`\`\`[{"name": "Closed Deals", "value": 45}, {"name": "Pipeline Value", "value": 280000}, {"name": "Win Rate", "value": 65}]\`\`\``;

    default:
      return `You are a Sales AI assistant. When discussing any metrics, ALWAYS include a data visualization section at the end of your response with this exact format:

\`\`\`[{"name": "Q1 Sales", "value": 150000}, {"name": "Q2 Sales", "value": 180000}, {"name": "Q3 Sales", "value": 220000}]\`\`\``;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { messages, role } = await req.json();
    console.log('Processing request for role:', role);

    const systemPrompt = getSystemPromptForRole(role);
    console.log('Using system prompt:', systemPrompt);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `${systemPrompt}\n\nIMPORTANT: You must ALWAYS include the data visualization section at the end of your response following the exact format shown above. The data must be relevant to the discussion and appear as the last element in your response.`
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

    console.log('Final response:', { content: cleanedContent, chartData });

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
