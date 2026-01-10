'use server';

export async function transcribeAudio(formData: FormData, apiKey: string) {
  const file = formData.get('file') as Blob;
  if (!file) {
    return { text: '', error: 'No file provided' };
  }

  if (!apiKey) {
      return { text: '', error: 'No API Key provided' };
  }

  try {
    const groqFormData = new FormData();
    groqFormData.append('file', file);
    groqFormData.append('model', 'distil-whisper-large-v3-en');
    groqFormData.append('response_format', 'json');
    groqFormData.append('temperature', '0');
    groqFormData.append('prompt', 'Transcribe the following audio with correct punctuation and capitalization.');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: groqFormData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API Error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return { text: data.text, error: null };
  } catch (error: unknown) {
    console.error('Transcription failed:', error);
    const message = error instanceof Error ? error.message : 'Transcription failed';
    return { text: '', error: message };
  }
}
