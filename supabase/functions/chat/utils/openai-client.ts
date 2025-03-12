
// Call OpenAI API with the appropriate configuration

// Get OpenAI API key from environment variable
const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

// Make a request to OpenAI API
export const callOpenAI = async (messages: any[], requestId: string) => {
  console.log(`Making OpenAI request for ${requestId}`);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`OpenAI API error (${requestId}):`, errorText);
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  console.log(`Request ${requestId} completed successfully`);
  
  return content;
};
