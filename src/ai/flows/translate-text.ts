
'use server';

/**
 * @fileOverview A flow that translates text from a source language to a target language.
 *
 * - translateText - A function that handles the translation.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateTextInputSchema = z.object({
  text: z.string().describe('The text to be translated.'),
  sourceLang: z.string().describe('The source language of the text.'),
  targetLang: z.string().describe('The target language for the translation.'),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translation: z.string().describe('The translated text.'),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

const TranslateTextOutputWithUsageSchema = z.object({
    translation: z.string().describe('The translated text.'),
    usage: z.object({
      inputTokens: z.number(),
      outputTokens: z.number(),
      totalTokens: z.number(),
    }).optional(),
});
export type TranslateTextOutputWithUsage = z.infer<typeof TranslateTextOutputWithUsageSchema>;


export async function translateText(
  input: TranslateTextInput
): Promise<TranslateTextOutputWithUsage> {
  return translateTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `Translate the following text from {{{sourceLang}}} to {{{targetLang}}}.

Text:
"""
{{{text}}}
"""

Translation:`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputWithUsageSchema,
  },
  async (input) => {
    const response = await prompt(input);
    const usage = response.usage;
    const output = response.output!;

    return {
      translation: output.translation,
      usage: {
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        totalTokens: usage.totalTokens,
      },
    };
  }
);
