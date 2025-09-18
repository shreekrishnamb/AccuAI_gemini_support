'use server';

/**
 * @fileOverview A flow that answers a user's question about a given text.
 *
 * - answerQuestionAboutText - A function that handles answering the question.
 * - AnswerQuestionAboutTextInput - The input type for the answerQuestionAboutText function.
 * - AnswerQuestionAboutTextOutput - The return type for the answerQuestionAboutText function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnswerQuestionAboutTextInputSchema = z.object({
  text: z.string().describe('The text that the user wants to ask a question about. This is the context for the question.'),
  question: z.string().describe('The user\'s question about the provided text.'),
});
export type AnswerQuestionAboutTextInput = z.infer<typeof AnswerQuestionAboutTextInputSchema>;

const AnswerQuestionAboutTextOutputSchema = z.object({
  answer: z.string().describe('The answer to the user\'s question, based on the provided text.'),
});
export type AnswerQuestionAboutTextOutput = z.infer<typeof AnswerQuestionAboutTextOutputSchema>;

export async function answerQuestionAboutText(
  input: AnswerQuestionAboutTextInput
): Promise<AnswerQuestionAboutTextOutput> {
  return answerQuestionAboutTextFlow(input);
}

const prompt = ai.definePrompt({
  name: 'answerQuestionAboutTextPrompt',
  input: {schema: AnswerQuestionAboutTextInputSchema},
  output: {schema: AnswerQuestionAboutTextOutputSchema},
  prompt: `You are an intelligent assistant. You will be given a text and a question about that text. Your task is to provide a clear and concise answer to the question based *only* on the information present in the given text.

Context Text:
"""
{{{text}}}
"""

User's Question:
"{{{question}}}"

Answer:`,
});

const answerQuestionAboutTextFlow = ai.defineFlow(
  {
    name: 'answerQuestionAboutTextFlow',
    inputSchema: AnswerQuestionAboutTextInputSchema,
    outputSchema: AnswerQuestionAboutTextOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
