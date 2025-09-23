
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { languages } from '@/lib/languages';
import { translateText } from '@/app/actions';
import { SavedPhrase } from '@/lib/types';

export function useTranslation() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('hi');
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
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast({
            variant: "destructive",
            title: "Error loading saved phrases",
            description: errorMessage
        });
      }
    }
  }, [toast]);

  const handleTranslate = useCallback(async (textToTranslate?: string) => {
    const text = textToTranslate ?? sourceText;
    if (!text.trim()) {
        setTranslatedText('');
        return;
    };

    setIsTranslating(true);
    setTranslatedText(''); // Clear previous translation

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
  }, [sourceText, sourceLang, targetLang, toast]);
  
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
  };
}
