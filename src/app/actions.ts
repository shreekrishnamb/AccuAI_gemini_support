'use server';

import { improveTranslationQuality } from '@/ai/flows/improve-translation-quality';
import { suggestTranslationLanguages } from '@/ai/flows/suggest-translation-languages';

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
