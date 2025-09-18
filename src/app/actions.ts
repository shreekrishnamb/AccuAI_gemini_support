'use server';

import { improveTranslationQuality } from '@/ai/flows/improve-translation-quality';
import { suggestTranslationLanguages } from '@/ai/flows/suggest-translation-languages';
import { answerQuestionAboutText } from '@/ai/flows/answer-question-about-text';
import { transcribeAudio as transcribeAudioFlow } from '@/ai/flows/transcribe-audio';


export async function translateText(
  text: string,
  sourceLanguage: string,
  targetLanguage: string
): Promise<string> {
  if (!text) {
    return '';
  }

  try {
    const result = await improveTranslationQuality({
      originalText: text,
      translatedText: '',
      userFeedback: 'Please translate this text.',
      sourceLanguage: sourceLanguage,
      targetLanguage: targetLanguage,
    });
    return result.improvedTranslation;
  } catch (error) {
    console.error('Translation failed:', error);
    return 'Error: Could not translate text.';
  }
}

export async function detectLanguage(text: string): Promise<string | null> {
  if (!text) {
    return null;
  }
  try {
    const result = await suggestTranslationLanguages({ speechInput: text });
    return result.sourceLanguage;
  } catch (error) {
    console.error('Language detection failed:', error);
    return null;
  }
}

export async function answerQuestion(
  text: string,
  question: string
): Promise<string> {
  if (!text || !question) {
    return '';
  }
  try {
    const result = await answerQuestionAboutText({ text, question });
    return result.answer;
  } catch (error) {
    console.error('Question answering failed:', error);
    return 'Error: Could not get an answer.';
  }
}

export async function transcribeAudio(audioDataUri: string): Promise<string> {
  console.log('transcribeAudio action received data URI of length:', audioDataUri.length);
  if (!audioDataUri) {
    return '';
  }
  try {
    const result = await transcribeAudioFlow({ audio: audioDataUri });
    console.log('Transcription successful in action:', result.transcription);
    return result.transcription;
  } catch (error) {
    console.error('Transcription failed in action:', error);
    return 'Error: Could not transcribe audio.';
  }
}
