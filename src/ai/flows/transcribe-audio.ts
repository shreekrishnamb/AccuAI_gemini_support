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
import wav from 'wav';
import { Readable } from 'stream';

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

async function toWav(
  dataURI: string,
): Promise<string> {
    console.log('toWav started for data URI:', dataURI.substring(0, 50) + '...');
    const audioBuffer = Buffer.from(
      dataURI.substring(dataURI.indexOf(',') + 1),
      'base64'
    );
    console.log('Converted data URI to buffer of length:', audioBuffer.length);

    const reader = new wav.Reader();
    const pcmData: Buffer[] = [];
    
    return new Promise((resolve, reject) => {
        reader.on('format', (format) => {
          console.log('WAV reader format:', format);
        });

        reader.on('data', (chunk) => {
            pcmData.push(chunk);
        });

        reader.on('end', () => {
            console.log('WAV reader finished. Total PCM chunks:', pcmData.length);
            const totalPcmLength = pcmData.reduce((acc, b) => acc + b.length, 0);
            console.log('Total PCM data length:', totalPcmLength);
            if (totalPcmLength === 0) {
              return reject(new Error("PCM data is empty, cannot create WAV."));
            }

            const writer = new wav.Writer({
                channels: 1,
                sampleRate: 16000,
                bitDepth: 16,
            });
            const writable = new Readable({
                read() {
                    this.push(Buffer.concat(pcmData));
                    this.push(null);
                }
            });
            
            const bufs: Buffer[] = [];
            writer.on('data', (d) => bufs.push(d));
            writer.on('end', () => {
                const finalWavBuffer = Buffer.concat(bufs);
                console.log('WAV writer finished. Final WAV buffer length:', finalWavBuffer.length);
                resolve('data:audio/wav;base64,' + finalWavBuffer.toString('base64'));
            });
            writer.on('error', (err) => {
              console.error('WAV writer error:', err);
              reject(err);
            });

            writable.pipe(writer);
        });

        reader.on('error', (err) => {
          console.error('WAV reader error:', err);
          reject(err);
        });

        const readable = new Readable();
        readable.push(audioBuffer);
        readable.push(null);
        readable.pipe(reader);
    });
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
      const wavAudio = await toWav(input.audio);
      console.log('Successfully converted to WAV:', wavAudio.substring(0, 50) + '...');
      
      console.log('Sending to Gemini for transcription...');
      const {text} = await ai.generate({
          model: 'gemini-1.5-flash-latest',
          prompt: [
              {text: 'Transcribe the following audio:'},
              {media: {url: wavAudio, contentType: 'audio/wav'}}
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
