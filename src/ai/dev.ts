import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-translation-languages.ts';
import '@/ai/flows/improve-translation-quality.ts';
import '@/ai/flows/answer-question-about-text.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/translate-text.ts';
