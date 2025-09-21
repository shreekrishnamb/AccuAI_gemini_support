
"use client";

import { Trash2 } from 'lucide-react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { languages } from '@/lib/languages';
import type { SavedPhrase } from '@/lib/types';

interface SavedPhrasesProps {
  savedPhrases: SavedPhrase[];
  onRemovePhrase: (id: string) => void;
  onSelectPhrase: (phrase: SavedPhrase) => void;
}

export function SavedPhrases({ savedPhrases, onRemovePhrase, onSelectPhrase }: SavedPhrasesProps) {
  if (savedPhrases.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Card className="w-full shadow-2xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Saved Phrases</CardTitle>
          <CardDescription>
            Your saved phrases are stored locally on your device and are not sent to any servers.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {savedPhrases.map((phrase, index) => (
            <div key={phrase.id}>
              <div className="flex justify-between items-start gap-4">
                <button 
                  className="flex-grow text-left group"
                  onClick={() => onSelectPhrase(phrase)}
                >
                  <p className="text-sm text-muted-foreground group-hover:text-primary">
                    {languages.find(l => l.value === phrase.sourceLang)?.label}
                  </p>
                  <p className="font-semibold group-hover:text-primary">{phrase.sourceText}</p>
                  <p className="text-sm text-muted-foreground mt-2 group-hover:text-primary">
                    {languages.find(l => l.value === phrase.targetLang)?.label}
                  </p>
                  <p className="group-hover:text-primary">{phrase.translatedText}</p>
                </button>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" onClick={() => onRemovePhrase(phrase.id)}>
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Remove phrase</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              {index < savedPhrases.length - 1 && <Separator className="mt-4" />}
            </div>
          ))}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
