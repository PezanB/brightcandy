
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getSystemPromptForRole = (role: string) => {
  switch (role) {
    case 'admin':
      return `You are a Strategic Data Operations AI assistant focused on:
- Database integration and systems connectivity
- Data security and compliance management
- Cross-platform data synchronization
- System performance optimization
- Data governance and quality control
- Technical infrastructure planning

When discussing metrics or performance indicators, always provide numerical data for visualization.
Your responses should include relevant metrics formatted as JSON arrays for visualization.`;

    case 'manager':
      return `You are a Sales Team Management AI assistant focused on:
- Sales team performance optimization
- Revenue growth strategies
- Team development and coaching
- Market expansion planning
- Resource allocation and budgeting
- KPI tracking and analysis

When discussing performance or metrics, always provide numerical data for visualization.
Your responses should include relevant KPIs formatted as JSON arrays for visualization.`;

    case 'rep':
      return `You are a Sales Representative AI assistant focused on:
- Direct sales techniques and best practices
- Customer relationship building
- Sales pipeline management
- Product positioning and value proposition
- Negotiation strategies
- Deal closing techniques

When discussing sales performance or metrics, always provide numerical data for visualization.
Your responses should include relevant metrics formatted as JSON arrays for visualization.`;

    default:
      return `You are a general Sales AI assistant. Provide helpful guidance on sales-related topics while maintaining a professional and supportive tone. When discussing any metrics or performance indicators, include numerical data for visualization.`;
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
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt + '\nWhen providing numerical data, ALWAYS format it as JSON arrays with "name" and "value" properties, surrounded by triple backticks. Example: ```[{"name": "Revenue", "value": 100000}, {"name": "Growth", "value": 25}]``` Make sure to include numerical data in EVERY response.'
          },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Extract JSON data for charts using triple backticks
    let chartData = null;
    try {
      const matches = content.match(/```([\s\S]*?)```/);
      if (matches && matches[1]) {
        const jsonStr = matches[1].trim();
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          chartData = parsed;
        }
      }
    } catch (e) {
      console.log('No valid chart data found in response');
    }

    return new Response(JSON.stringify({ 
      response: {
        role: 'assistant',
        content: content.replace(/```[\s\S]*?```/g, '').trim() // Remove JSON data from displayed response
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
