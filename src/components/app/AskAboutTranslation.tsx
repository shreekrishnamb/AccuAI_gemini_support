
"use client";

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
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
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const suggestedQuestions = [
  "Explain this in simpler terms.",
  "Is this a formal or informal translation?",
  "Provide a few alternative ways to say this.",
  "What is the cultural context of this phrase?",
];

interface AskAboutTranslationProps {
  translatedText: string;
}

export function AskAboutTranslation({ translatedText }: AskAboutTranslationProps) {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

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

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <SheetTrigger asChild>
                        <Button
                            className="ai-button"
                            disabled={!translatedText}
                        >
                            <Sparkles className="h-5 w-5" />
                            Ask AI
                        </Button>
                    </SheetTrigger>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Ask AI about the translation</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>

      <SheetContent 
        side={isMobile ? 'bottom' : 'right'}
        className={cn({
            "sm:max-w-lg": !isMobile,
            "h-[80vh]": isMobile,
          })}
      >
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

          <Separator className="my-4" />

          <div>
            <h3 className="mb-3 font-semibold">Suggestions</h3>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((q) => (
                <Button
                  key={q}
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => handleSuggestionClick(q)}
                  disabled={isAnswering}
                >
                  {q}
                </Button>
              ))}
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  );
}
