
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { languages } from '@/lib/languages';
import { translateText } from '@/app/actions';
import { SavedPhrase } from '@/lib/types';

const REQUEST_COUNT_KEY = 'apiRequestCount';
const DAILY_LIMIT = 250;

export function useTranslation() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [savedPhrases, setSavedPhrases] = useState<SavedPhrase[]>([]);
  const [requestCount, setRequestCount] = useState({ count: 0, date: new Date().toISOString().split('T')[0] });


  const { toast } = useToast();

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined') {
      try {
        const storedPhrases = localStorage.getItem('savedPhrases');
        if (storedPhrases) {
          setSavedPhrases(JSON.parse(storedPhrases));
        }

        const storedCount = localStorage.getItem(REQUEST_COUNT_KEY);
        const today = new Date().toISOString().split('T')[0];
        if (storedCount) {
            const parsedCount = JSON.parse(storedCount);
            if(parsedCount.date === today) {
                setRequestCount(parsedCount);
            } else {
                // Reset count for a new day
                localStorage.setItem(REQUEST_COUNT_KEY, JSON.stringify({ count: 0, date: today }));
            }
        }
      } catch (error) {
        console.error("Failed to load from localStorage:", error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({
            variant: "destructive",
            title: "Error loading from storage",
            description: errorMessage
        });
      }
    }
  }, [toast]);

  const incrementRequestCount = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setRequestCount(prev => {
        const newCount = prev.date === today ? prev.count + 1 : 1;
        const newCountState = { count: newCount, date: today };
        try {
            localStorage.setItem(REQUEST_COUNT_KEY, JSON.stringify(newCountState));
            console.log(`API Request Count: ${newCount} / ${DAILY_LIMIT}`);
        } catch (error) {
            console.error("Failed to save request count:", error);
        }
        return newCountState;
    });
  }, []);

  const handleTranslate = useCallback(async (textToTranslate?: string) => {
    const text = textToTranslate ?? sourceText;
    if (!text.trim()) {
        setTranslatedText('');
        return;
    };

    setIsTranslating(true);
    setTranslatedText(''); // Clear previous translation
    incrementRequestCount();

    try {
        const { translation } = await translateText(text, sourceLang, targetLang);
        setTranslatedText(translation);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({
            variant: "destructive",
            title: "Translation Failed",
            description: errorMessage,
        });
    } finally {
        setIsTranslating(false);
    }
  }, [sourceText, sourceLang, targetLang, toast, incrementRequestCount]);
  
  const handleSwapLanguages = useCallback(() => {
    if(isTranslating || isTranscribing) return;
    const currentSourceText = sourceText;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(currentSourceText);
  }, [isTranslating, isTranscribing, sourceLang, targetLang, sourceText, translatedText]);
  
  const handleSavePhrase = useCallback(() => {
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
    try {
        localStorage.setItem('savedPhrases', JSON.stringify(updatedPhrases));
        toast({ title: 'Phrase saved!' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Failed to save phrase:", error);
        toast({
            variant: "destructive",
            title: "Error saving phrase",
            description: errorMessage,
        });
    }
  }, [sourceText, translatedText, sourceLang, targetLang, savedPhrases, toast]);

  const handleRemovePhrase = useCallback((id: string) => {
    const updatedPhrases = savedPhrases.filter(p => p.id !== id);
    setSavedPhrases(updatedPhrases);
    try {
        localStorage.setItem('savedPhrases', JSON.stringify(updatedPhrases));
        toast({ title: 'Phrase removed.' });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error("Failed to remove phrase:", error);
        toast({
            variant: "destructive",
            title: "Error removing phrase",
            description: errorMessage,
        });
    }
  }, [savedPhrases, toast]);

  const handleSelectPhrase = useCallback((phrase: SavedPhrase) => {
    setSourceText(phrase.sourceText);
    setTranslatedText(phrase.translatedText);
    setSourceLang(phrase.sourceLang);
    setTargetLang(phrase.targetLang);
  }, []);

  const isCurrentPhraseSaved = savedPhrases.some(
    p => p.sourceText === sourceText && p.translatedText === translatedText
  );

  return {
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
    incrementRequestCount,
  };
}
