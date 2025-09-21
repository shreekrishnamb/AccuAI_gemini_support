
"use client";

import { useState } from 'react';
import { HelpCircle, Loader2 } from 'lucide-react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { answerQuestion } from '@/app/actions';

interface AskAboutTranslationProps {
  translatedText: string;
}

export function AskAboutTranslation({ translatedText }: AskAboutTranslationProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim() || !translatedText.trim()) return;
    setIsAnswering(true);
    setAnswer('');
    const result = await answerQuestion(translatedText, question);
    setAnswer(result);
    setIsAnswering(false);
  };

  if (!translatedText) {
    return null;
  }

  return (
    <Card className="w-full shadow-2xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <HelpCircle className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Ask about the Translation</h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div>
            <Label htmlFor="question-input">Your Question</Label>
            <Input
              id="question-input"
              placeholder="e.g., Explain this in simpler terms."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isAnswering}
            />
          </div>
          <Button onClick={handleAskQuestion} disabled={!question.trim() || isAnswering}>
            {isAnswering ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Getting Answer...
              </>
            ) : (
              'Ask Gemini'
            )}
          </Button>
          {isAnswering && !answer && (
             <div className="flex items-center justify-center p-8">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
             </div>
          )}
          {answer && (
            <div className="p-4 bg-muted/50 rounded-md border">
              <p className="font-semibold mb-2">Answer:</p>
              <div className="prose prose-sm max-w-none">{answer}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
