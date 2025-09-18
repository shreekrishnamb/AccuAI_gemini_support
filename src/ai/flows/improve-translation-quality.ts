'use server';

/**
 * @fileOverview Implements a flow to improve translation quality based on user feedback and updated AI models.
 *
 * - improveTranslationQuality - A function that handles the process of improving translation quality.
 * - ImproveTranslationQualityInput - The input type for the improveTranslationQuality function.
 * - ImproveTranslationQualityOutput - The return type for the improveTranslationQuality function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveTranslationQualityInputSchema = z.object({
  originalText: z.string().describe('The original text that was translated.'),
  translatedText: z.string().describe('The translated text provided by the app.'),
  userFeedback: z
    .string()
    .describe(
      'User feedback on the quality of the translated text.  This should include specific examples of what was wrong with the translation, and how it could be improved.'
    ),
  sourceLanguage: z.string().describe('The original language of the text.'),
  targetLanguage: z.string().describe('The language to which the text was translated.'),
});
export type ImproveTranslationQualityInput = z.infer<typeof ImproveTranslationQualityInputSchema>;

const ImproveTranslationQualityOutputSchema = z.object({
  improvedTranslation: z
    .string()
    .describe(
      'The improved translated text, incorporating user feedback and updated AI models.'
    ),
  explanation: z
    .string()
    .describe(
      'Explanation of the changes made to the translation, based on user feedback and any updated AI models used.  It should describe why the changes were made.'
    ),
});
export type ImproveTranslationQualityOutput = z.infer<typeof ImproveTranslationQualityOutputSchema>;

export async function improveTranslationQuality(
  input: ImproveTranslationQualityInput
): Promise<ImproveTranslationQualityOutput> {
  return improveTranslationQualityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveTranslationQualityPrompt',
  input: {schema: ImproveTranslationQualityInputSchema},
  output: {schema: ImproveTranslationQualityOutputSchema},
  prompt: `You are an AI translation improvement expert. You will receive the original text, the translated text, and user feedback on the translation.

Your task is to improve the translation based on the user feedback, and to explain the changes you made.

Original Text: {{{originalText}}}
Translated Text: {{{translatedText}}}
User Feedback: {{{userFeedback}}}
Source Language: {{{sourceLanguage}}}
Target Language: {{{targetLanguage}}}

Improved Translation:`,
});

const improveTranslationQualityFlow = ai.defineFlow(
  {
    name: 'improveTranslationQualityFlow',
    inputSchema: ImproveTranslationQualityInputSchema,
    outputSchema: ImproveTranslationQualityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
