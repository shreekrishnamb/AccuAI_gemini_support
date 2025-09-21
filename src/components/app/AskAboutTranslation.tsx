
"use client";

import { useState } from 'react';
import { HelpCircle, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { answerQuestion } from '@/app/actions';
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';


interface AskAboutTranslationProps {
  translatedText: string;
}

export function AskAboutTranslation({ translatedText }: AskAboutTranslationProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleAskQuestion = async () => {
    if (!question.trim() || !translatedText.trim()) return;
    setIsAnswering(true);
    setAnswer('');
    const result = await answerQuestion(translatedText, question);
    setAnswer(result);
    setIsAnswering(false);
  };
  
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setQuestion('');
      setAnswer('');
      setIsAnswering(false);
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                        <Button
                            size="icon"
                            className="ai-button"
                            disabled={!translatedText}
                        >
                            <HelpCircle className="h-5 w-5" />
                        </Button>
                    </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Ask about the translation</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Ask about the Translation</SheetTitle>
          <SheetDescription>
            Ask Gemini a question about the translated text.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-4">
          <div>
            <Label htmlFor="question-input" className="mb-2">Your Question</Label>
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
      </SheetContent>
    </Sheet>
  );
}
