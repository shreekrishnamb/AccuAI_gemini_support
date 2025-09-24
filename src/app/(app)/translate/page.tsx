
"use client";

import { useTranslation } from '@/hooks/use-translation';
import { LanguageSelectors } from '@/components/app/LanguageSelectors';
import { TranslationCard } from '@/components/app/Translation-card';
import { CommonPhrases } from '@/components/app/CommonPhrases';
import { SavedPhrases } from '@/components/app/SavedPhrases';
import { AskAboutTranslation } from '@/components/app/AskAboutTranslation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Home } from 'lucide-react';

export default function TranslatePage() {
  const {
    sourceLang,
    targetLang,
    sourceText,
    translatedText,
    isTranslating,
    isTranscribing,
    isClient,
    savedPhrases,
    isCurrentPhraseSaved,
    setSourceLang,
    setTargetLang,
    setSourceText,
    setTranslatedText,
    setIsTranscribing,
    handleTranslate,
    handleSwapLanguages,
    handleSavePhrase,
    handleRemovePhrase,
    handleSelectPhrase,
  } = useTranslation();
  
  const isUIBlocked = isTranslating || isTranscribing;

  if (!isClient) {
    return null; // or a loading skeleton
  }

  return (
    <div className="flex w-full flex-col items-center gap-6">
        <div className="w-full max-w-4xl flex justify-start">
            <Button asChild variant="outline">
                <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    Back to Home
                </Link>
            </Button>
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
          setTranslatedText={setTranslatedText}
          isTranslating={isTranslating}
          isTranscribing={isTranscribing}
          setIsTranscribing={setIsTranscribing}
          handleTranslate={handleTranslate}
          handleSavePhrase={handleSavePhrase}
          isCurrentPhraseSaved={isCurrentPhraseSaved}
          isUIBlocked={isUIBlocked}
          sourceLang={sourceLang}
          targetLang={targetLang}
        >
          <AskAboutTranslation 
            translatedText={translatedText}
          />
        </TranslationCard>
        
        <CommonPhrases
          onPhraseClick={(phrase) => {
            setSourceText(phrase);
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
    </div>
  );
}
