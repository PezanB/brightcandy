
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

You specialize in providing guidance on connecting and managing various databases, ensuring data integrity, and optimizing system architecture. Focus on technical, infrastructure-level discussions and solutions. Always consider security, scalability, and system integration in your responses.`;

    case 'manager':
      return `You are a Sales Team Management AI assistant focused on:
- Sales team performance optimization
- Revenue growth strategies
- Team development and coaching
- Market expansion planning
- Resource allocation and budgeting
- KPI tracking and analysis

You excel at providing strategic guidance for managing sales teams and driving growth. Focus on team-level strategies, performance metrics, and organizational development. Your responses should help managers improve team efficiency, develop talent, and achieve sales targets.`;

    case 'rep':
      return `You are a Sales Representative AI assistant focused on:
- Direct sales techniques and best practices
- Customer relationship building
- Sales pipeline management
- Product positioning and value proposition
- Negotiation strategies
- Deal closing techniques

Your expertise is in practical, day-to-day sales activities. Provide actionable advice for improving individual sales performance, handling customer interactions, and closing deals. Focus on specific techniques and approaches that help sales representatives succeed in their daily work.`;

    default:
      return `You are a general Sales AI assistant. Provide helpful guidance on sales-related topics while maintaining a professional and supportive tone.`;
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
            content: systemPrompt + '\nWhen providing numerical data, please format it as JSON arrays with "name" and "value" properties for easy visualization.'
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
    
    // Try to extract JSON data for charts
    let chartData = null;
    try {
      // Look for JSON array in the response
      const jsonMatch = content.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        chartData = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.log('No valid chart data found in response');
    }

    return new Response(JSON.stringify({ 
      response: data.choices[0].message,
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
