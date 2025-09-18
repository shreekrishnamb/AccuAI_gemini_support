'use server';

/**
 * @fileOverview A flow that suggests the most likely source language for speech input and a set of commonly used target languages.
 *
 * - suggestTranslationLanguages - A function that suggests translation languages.
 * - SuggestTranslationLanguagesInput - The input type for the suggestTranslationLanguages function.
 * - SuggestTranslationLanguagesOutput - The return type for the suggestTranslationLanguages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTranslationLanguagesInputSchema = z.object({
  speechInput: z.string().describe('The speech input from the user.'),
});
export type SuggestTranslationLanguagesInput = z.infer<typeof SuggestTranslationLanguagesInputSchema>;

const SuggestTranslationLanguagesOutputSchema = z.object({
  sourceLanguage: z.string().describe('The most likely source language of the speech input.'),
  targetLanguages: z.array(z.string()).describe('A set of commonly used target languages.'),
});
export type SuggestTranslationLanguagesOutput = z.infer<typeof SuggestTranslationLanguagesOutputSchema>;

export async function suggestTranslationLanguages(input: SuggestTranslationLanguagesInput): Promise<SuggestTranslationLanguagesOutput> {
  return suggestTranslationLanguagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTranslationLanguagesPrompt',
  input: {schema: SuggestTranslationLanguagesInputSchema},
  output: {schema: SuggestTranslationLanguagesOutputSchema},
  prompt: `Given the following speech input, suggest the most likely source language and a set of commonly used target languages for translation.

Speech Input: {{{speechInput}}}

Format the output as a JSON object with "sourceLanguage" and "targetLanguages" fields. The targetLanguages field should be an array of language codes, such as ["en", "es", "fr"].  The sourceLanguage should be the language code of the detected language.
`,
});

const suggestTranslationLanguagesFlow = ai.defineFlow(
  {
    name: 'suggestTranslationLanguagesFlow',
    inputSchema: SuggestTranslationLanguagesInputSchema,
    outputSchema: SuggestTranslationLanguagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
