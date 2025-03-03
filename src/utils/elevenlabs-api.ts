
import { supabase } from "@/integrations/supabase/client";

// Default ElevenLabs API key to use if none is found
export const DEFAULT_ELEVENLABS_API_KEY = "6c1d5adfc11823cd6bc67739ba2cdb98"; // This is a demo key

// Fetch the ElevenLabs API key from Supabase
export const fetchApiKey = async (uid: string) => {
  try {
    const { data, error } = await supabase
      .from('api_keys')
      .select('key_value')
      .eq('user_id', uid)
      .eq('key_name', 'elevenlabs')
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching API key:', error);
      return null;
    }
    
    return data?.key_value || null;
  } catch (error) {
    console.error('Error in fetchApiKey:', error);
    return null;
  }
};

// Save the ElevenLabs API key to Supabase
export const saveApiKey = async (uid: string, apiKey: string) => {
  try {
    // First check if an API key already exists
    const { data, error: fetchError } = await supabase
      .from('api_keys')
      .select('id')
      .eq('user_id', uid)
      .eq('key_name', 'elevenlabs')
      .maybeSingle();
    
    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is the "no rows found" error
      console.error('Error checking existing API key:', fetchError);
      return false;
    }
    
    if (data) {
      // Update existing key
      const { error: updateError } = await supabase
        .from('api_keys')
        .update({ key_value: apiKey, updated_at: new Date().toISOString() })
        .eq('id', data.id);
      
      if (updateError) {
        console.error('Error updating API key:', updateError);
        return false;
      }
    } else {
      // Insert new key
      const { error: insertError } = await supabase
        .from('api_keys')
        .insert([
          { 
            user_id: uid, 
            key_name: 'elevenlabs', 
            key_value: apiKey 
          }
        ]);
      
      if (insertError) {
        console.error('Error inserting API key:', insertError);
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error in saveApiKey:', error);
    return false;
  }
};
