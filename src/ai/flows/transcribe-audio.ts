'use server';

/**
 * @fileOverview A flow that transcribes audio to text.
 *
 * - transcribeAudio - A function that handles the transcription.
 * - TranscribeAudioInput - The input type for the transcribeAudio function.
 * - TranscribeAudioOutput - The return type for the transcribeAudio function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranscribeAudioInputSchema = z.object({
  audio: z.string().describe("The audio to transcribe, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type TranscribeAudioInput = z.infer<typeof TranscribeAudioInputSchema>;

const TranscribeAudioOutputSchema = z.object({
  transcription: z.string().describe('The transcribed text from the audio.'),
});
export type TranscribeAudioOutput = z.infer<typeof TranscribeAudioOutputSchema>;

export async function transcribeAudio(input: TranscribeAudioInput): Promise<TranscribeAudioOutput> {
  return transcribeAudioFlow(input);
}

const transcribeAudioFlow = ai.defineFlow(
  {
    name: 'transcribeAudioFlow',
    inputSchema: TranscribeAudioInputSchema,
    outputSchema: TranscribeAudioOutputSchema,
  },
  async (input) => {
    console.log('transcribeAudioFlow started.');
    try {
      const mimeType = input.audio.substring(5, input.audio.indexOf(';'));
      console.log('Audio MIME type:', mimeType);
      
      console.log('Sending to Gemini for transcription...');
      const {text} = await ai.generate({
          model: 'gemini-1.5-flash-latest',
          prompt: [
              {text: 'Transcribe the following audio:'},
              {media: {url: input.audio, contentType: mimeType}}
          ],
      });
      
      console.log('Gemini transcription result:', text);
      return { transcription: text };

    } catch (e) {
      console.error('Error in transcribeAudioFlow:', e);
      // Re-throw the error to be caught by the action
      throw e;
    }
  }
);

    