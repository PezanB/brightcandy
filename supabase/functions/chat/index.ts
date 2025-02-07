
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

When discussing metrics or performance indicators, ALWAYS provide numerical data for visualization.
Your responses MUST include relevant metrics formatted as JSON arrays with "name" and "value" properties, surrounded by triple backticks like this:
\`\`\`[{"name": "Metric 1", "value": 100}, {"name": "Metric 2", "value": 200}]\`\`\``;

    case 'manager':
      return `You are a Sales Team Management AI assistant focused on:
- Sales team performance optimization
- Revenue growth strategies
- Team development and coaching
- Market expansion planning
- Resource allocation and budgeting
- KPI tracking and analysis

When discussing performance or metrics, ALWAYS provide numerical data for visualization.
Your responses MUST include relevant metrics formatted as JSON arrays with "name" and "value" properties, surrounded by triple backticks like this:
\`\`\`[{"name": "Revenue", "value": 100000}, {"name": "Growth", "value": 25}]\`\`\``;

    case 'rep':
      return `You are a Sales Representative AI assistant focused on:
- Direct sales techniques and best practices
- Customer relationship building
- Sales pipeline management
- Product positioning and value proposition
- Negotiation strategies
- Deal closing techniques

When discussing sales performance or metrics, ALWAYS provide numerical data for visualization.
Your responses MUST include relevant metrics formatted as JSON arrays with "name" and "value" properties, surrounded by triple backticks like this:
\`\`\`[{"name": "Deals Closed", "value": 12}, {"name": "Revenue", "value": 50000}]\`\`\``;

    default:
      return `You are a general Sales AI assistant. Provide helpful guidance on sales-related topics while maintaining a professional and supportive tone. When discussing any metrics or performance indicators, ALWAYS include numerical data for visualization formatted as JSON arrays with "name" and "value" properties, surrounded by triple backticks.`;
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
            content: systemPrompt + '\n\nIMPORTANT: You MUST ALWAYS include a data visualization array in your response, formatted as a JSON array with "name" and "value" properties, surrounded by triple backticks. Example: ```[{"name": "Metric 1", "value": 100}]```'
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
    
    // Extract JSON data for charts
    let chartData = null;
    try {
      const matches = content.match(/```([\s\S]*?)```/);
      if (matches && matches[1]) {
        const jsonStr = matches[1].trim();
        console.log('Extracted JSON string:', jsonStr);
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          chartData = parsed;
          console.log('Successfully parsed chart data:', chartData);
        }
      }
    } catch (e) {
      console.error('Error parsing chart data:', e);
      console.log('No valid chart data found in response');
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

