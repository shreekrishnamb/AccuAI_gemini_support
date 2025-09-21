
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { languages } from '@/lib/languages';
import { translateText, detectLanguage, transcribeAudio } from '@/app/actions';
import { Logo } from '@/components/icons';
import { SavedPhrase } from '@/lib/types';

import { LanguageSelectors } from '@/components/app/LanguageSelectors';
import { TranslationCard } from '@/components/app/TranslationCard';
import { CommonPhrases } from '@/components/app/CommonPhrases';
import { SavedPhrases } from '@/components/app/SavedPhrases';
import { AskAboutTranslation } from '@/components/app/AskAboutTranslation';

export default function Home() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      try {
        const storedPhrases = localStorage.getItem('savedPhrases');
        if (storedPhrases) {
          setSavedPhrases(JSON.parse(storedPhrases));
        }
      } catch (error) {
        console.error("Failed to load saved phrases:", error);
      }
    }
  }, []);

  const handleTranslate = useCallback(async (textToTranslate?: string) => {
    const text = textToTranslate || sourceText;
    if (!text.trim()) return;
    setIsTranslating(true);
    setTranslatedText('');
    const detected = await detectLanguage(text);
    if (detected && languages.some(l => l.value.startsWith(detected))) {
      setSourceLang(detected);
    }
    const translation = await translateText(text, detected || sourceLang, targetLang);
    setTranslatedText(translation);
    setIsTranslating(false);
  }, [sourceText, sourceLang, targetLang]);
  
  const handleSwapLanguages = () => {
    if(isTranslating || isTranscribing) return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(''); 
  };
  
  const handleSavePhrase = () => {
    if (!sourceText.trim() || !translatedText.trim()) return;

    const newPhrase: SavedPhrase = {
      id: new Date().toISOString(),
      sourceText,
      translatedText,
      sourceLang,
      targetLang,
    };
    
    const updatedPhrases = [...savedPhrases, newPhrase];
    setSavedPhrases(updatedPhrases);
    localStorage.setItem('savedPhrases', JSON.stringify(updatedPhrases));
    toast({ title: 'Phrase saved!' });
  };

  const handleRemovePhrase = (id: string) => {
    const updatedPhrases = savedPhrases.filter(p => p.id !== id);
    setSavedPhrases(updatedPhrases);
    localStorage.setItem('savedPhrases', JSON.stringify(updatedPhrases));
    toast({ title: 'Phrase removed.' });
  };

  const handleSelectPhrase = (phrase: SavedPhrase) => {
    setSourceText(phrase.sourceText);
    setTranslatedText(phrase.translatedText);
    setSourceLang(phrase.sourceLang);
    setTargetLang(phrase.targetLang);
  };
  
  const isUIBlocked = isTranslating || isTranscribing;

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <main className="flex min-h-screen w-full flex-col items-center gap-6 bg-background p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col items-center text-center">
        <Logo />
        <h1 className="text-4xl sm:text-5xl font-bold font-headline mt-4">AccuAI</h1>
        <p className="text-muted-foreground mt-2">Your AI-Powered Speech Translator</p>
      </div>

      <div className="w-full max-w-4xl flex flex-col gap-6">
        <LanguageSelectors
          sourceLang={sourceLang}
          targetLang={targetLang}
          setSourceLang={setSourceLang}
          setTargetLang={setTargetLang}
          handleSwapLanguages={handleSwapLanguages}
          isUIBlocked={isUIBlocked}
        />
        
        <TranslationCard
          sourceText={sourceText}
          setSourceText={setSourceText}
          translatedText={translatedText}
          isTranslating={isTranslating}
          isTranscribing={isTranscribing}
          setIsTranscribing={setIsTranscribing}
          handleTranslate={handleTranslate}
          handleSavePhrase={handleSavePhrase}
          isCurrentPhraseSaved={savedPhrases.some(
            p => p.sourceText === sourceText && p.translatedText === translatedText
          )}
          isUIBlocked={isUIBlocked}
          sourceLang={sourceLang}
          targetLang={targetLang}
        >
          <AskAboutTranslation translatedText={translatedText} />
        </TranslationCard>
        
        <CommonPhrases
          onPhraseClick={(phrase) => {
            setSourceText(phrase);
            setTranslatedText('');
            handleTranslate(phrase);
          }}
          isUIBlocked={isUIBlocked}
        />

        <SavedPhrases 
          savedPhrases={savedPhrases}
          onRemovePhrase={handleRemovePhrase}
          onSelectPhrase={handleSelectPhrase}
        />

      </div>
    </main>
  );
}
