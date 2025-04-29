
// Default ElevenLabs API key to use if none is found
export const DEFAULT_ELEVENLABS_API_KEY = "6c1d5adfc11823cd6bc67739ba2cdb98"; // This is a demo key

// Fetch the ElevenLabs API key from localStorage
export const fetchApiKey = async (uid: string) => {
  try {
    // Use localStorage instead of Supabase
    const storedKey = localStorage.getItem(`elevenlabs_key_${uid}`);
    return storedKey || null;
  } catch (error) {
    console.error('Error in fetchApiKey:', error);
    return null;
  }
};

// Save the ElevenLabs API key to localStorage
export const saveApiKey = async (uid: string, apiKey: string) => {
  try {
    // Save to localStorage instead of Supabase
    localStorage.setItem(`elevenlabs_key_${uid}`, apiKey);
    return true;
  } catch (error) {
    console.error('Error in saveApiKey:', error);
    return false;
  }
};
