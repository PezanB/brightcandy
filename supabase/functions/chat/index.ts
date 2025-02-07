
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const getSystemPromptForRole = (role: string) => {
  switch (role) {
    case 'admin':
      return `You are an expert Sales Operations AI assistant with deep knowledge in:
- Sales strategy and organizational planning
- Cross-team performance optimization
- Enterprise-level CRM management
- Advanced sales analytics and forecasting
- Resource allocation and budgeting
- Market expansion strategy

Provide strategic, high-level guidance focused on organizational growth and efficiency. Consider company-wide impacts and long-term planning in your responses.`;

    case 'manager':
      return `You are an expert Sales Manager AI assistant with deep knowledge in:
- Team performance management
- Pipeline optimization and forecasting
- Sales coaching and development
- Territory management
- Customer relationship strategies
- Performance metrics analysis

Focus on tactical, team-level guidance that helps improve team performance and achieve sales targets. Provide actionable insights for managing and developing sales representatives.`;

    case 'rep':
      return `You are an expert Sales Representative AI assistant with deep knowledge in:
- Deal closing techniques
- Customer relationship building
- Sales presentation skills
- Objection handling
- Product positioning
- Time management and prioritization

Provide practical, deal-level advice focused on improving individual sales performance. Offer specific techniques and approaches for handling customer interactions and closing deals.`;

    default:
      return `You are a general Sales AI assistant. Provide helpful guidance on sales-related topics.`;
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
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    return new Response(JSON.stringify({ response: data.choices[0].message }), {
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
