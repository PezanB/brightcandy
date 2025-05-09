
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { text, voice } = await req.json()

    if (!text) {
      throw new Error('Text is required')
    }

    // Log request details but not the full text (which could be long)
    console.log(`TTS Request: text length=${text.length}, voice=${voice || 'nova'}`);

    // Optimize text - we'll process in smaller chunks if needed
    const optimizedText = text.length > 4000 ? text.substring(0, 4000) : text;

    // Direct fetch to OpenAI API with simpler implementation
    const apiResponse = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'tts-1', // Using standard model for better performance
        input: optimizedText,
        voice: voice || 'nova',
        response_format: 'mp3',
        speed: 1.1, // Slightly increase speed for better responsiveness
      }),
    });

    if (!apiResponse.ok) {
      const errorText = await apiResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${apiResponse.status} ${apiResponse.statusText}`);
    }

    // Get binary audio data
    const audioArrayBuffer = await apiResponse.arrayBuffer();
    
    // More efficient base64 conversion
    const audioBytes = new Uint8Array(audioArrayBuffer);
    const binaryString = new Array(audioBytes.length);
    for (let i = 0; i < audioBytes.length; i++) {
      binaryString[i] = String.fromCharCode(audioBytes[i]);
    }
    
    const base64Audio = btoa(binaryString.join(''));

    console.log('TTS successful, returning audio data');

    return new Response(
      JSON.stringify({ audioContent: base64Audio }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (error) {
    console.error("TTS Error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  }
})
