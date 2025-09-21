
"use client";

import { ArrowRightLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { languages } from '@/lib/languages';

interface LanguageSelectorsProps {
  sourceLang: string;
  targetLang: string;
  setSourceLang: (lang: string) => void;
  setTargetLang: (lang: string) => void;
  handleSwapLanguages: () => void;
  isUIBlocked: boolean;
}

export function LanguageSelectors({
  sourceLang,
  targetLang,
  setSourceLang,
  setTargetLang,
  handleSwapLanguages,
  isUIBlocked,
}: LanguageSelectorsProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-4xl bg-card border rounded-lg p-4 shadow-2xl">
      <Select value={sourceLang} onValueChange={setSourceLang} disabled={isUIBlocked}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Source language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button variant="ghost" size="icon" onClick={handleSwapLanguages} disabled={isUIBlocked}>
        <ArrowRightLeft className="h-5 w-5" />
      </Button>

      <Select value={targetLang} onValueChange={setTargetLang} disabled={isUIBlocked}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Target language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.value} value={lang.value}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
