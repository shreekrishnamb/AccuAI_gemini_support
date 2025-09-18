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
    const audioBuffer = Buffer.from(
      dataURI.substring(dataURI.indexOf(',') + 1),
      'base64'
    );
    const reader = new wav.Reader();
    const pcmData: Buffer[] = [];
    return new Promise((resolve, reject) => {
        reader.on('data', (chunk) => {
            pcmData.push(chunk);
        });

        reader.on('end', () => {
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
                resolve('data:audio/wav;base64,' + Buffer.concat(bufs).toString('base64'));
            });
            writer.on('error', reject);
            writable.pipe(writer);
        });
        reader.on('error', reject);

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
    const wavAudio = await toWav(input.audio);
    const {text} = await ai.generate({
        model: 'gemini-1.5-flash-latest',
        prompt: [
            {text: 'Transcribe the following audio:'},
            {media: {url: wavAudio}}
        ],
    });
    
    return { transcription: text };
  }
);
