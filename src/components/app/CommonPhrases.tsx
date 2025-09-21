
"use client";

import { MessageSquareQuote } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const commonPhrasesList = [
  "Hello, how are you?",
  "Thank you so much.",
  "Where is the nearest restroom?",
  "How much does this cost?",
  "I need help, please.",
  "Good morning!",
  "Can you speak slower?",
  "I don't understand.",
];

interface CommonPhrasesProps {
  onPhraseClick: (phrase: string) => void;
  isUIBlocked: boolean;
}

export function CommonPhrases({ onPhraseClick, isUIBlocked }: CommonPhrasesProps) {
  return (
    <Card className="w-full shadow-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Common Phrases</h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {commonPhrasesList.map((phrase) => (
            <Button
              key={phrase}
              variant="outline"
              className="rounded-full"
              onClick={() => onPhraseClick(phrase)}
              disabled={isUIBlocked}
            >
              {phrase}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
