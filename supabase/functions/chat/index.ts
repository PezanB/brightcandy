
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils/cors.ts";
import { summarizeData, generateChartData, generateFallbackChartData } from "./utils/data-processor.ts";
import { getGeneralSystemPrompt, getDataSystemPrompt } from "./utils/system-prompts.ts";
import { callOpenAI } from "./utils/openai-client.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, baseData, role } = await req.json();
    console.log('Processing request with data length:', baseData?.length || 0);

    const requestId = crypto.randomUUID();
    console.log(`Processing request ${requestId}`);

    // For general conversation without data
    if (!baseData || baseData.length === 0) {
      console.log(`Request ${requestId} has no data, proceeding with general conversation`);
      
      const systemMessage = {
        role: 'system',
        content: getGeneralSystemPrompt()
      };
      
      const content = await callOpenAI([systemMessage, ...messages], requestId);
      
      return new Response(JSON.stringify({
        response: {
          role: 'assistant',
          content: content
        },
        chartData: null,
        requestId: requestId
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // If we have data, proceed with data analysis
    const dataContext = summarizeData(baseData);
    console.log('Data context generated for request', requestId);

    const systemMessage = {
      role: 'system',
      content: getDataSystemPrompt(dataContext)
    };

    const content = await callOpenAI([systemMessage, ...messages], requestId);
    
    // Always generate chart data when we have base data
    let chartData = generateChartData(baseData, dataContext);
    
    // If we couldn't generate chart data automatically, use a simplified version
    if (!chartData && baseData.length > 0) {
      chartData = generateFallbackChartData(baseData);
    }

    console.log(`Chart data for request ${requestId}:`, chartData ? `Generated (${chartData.length} items)` : 'None generated');

    return new Response(JSON.stringify({
      response: {
        role: 'assistant',
        content: content
      },
      chartData: chartData,
      requestId: requestId
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      errorId: crypto.randomUUID() 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
