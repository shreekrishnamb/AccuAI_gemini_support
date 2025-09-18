"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRightLeft,
  Copy,
  Loader2,
  Mic,
  Pause,
  Play,
  Share2,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { languages } from '@/lib/languages';
import { translateText, detectLanguage } from '@/app/actions';
import { Logo } from '@/components/icons';

type SpeechRecognition = any;

export default function Home() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [canShare, setCanShare] = useState(false);

  const { toast } = useToast();
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setIsClient(true);
    setCanShare(typeof navigator !== 'undefined' && !!navigator.share);
  }, []);

  const hasSpeechRecognition = isClient && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const hasSpeechSynthesis = isClient && 'speechSynthesis' in window;

  useEffect(() => {
    if (!hasSpeechRecognition) return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = sourceLang;

    recognition.onresult = (event: any) => {
      let interimTranscript = '';
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      setSourceText(finalTranscript + interimTranscript);
    };

    recognition.onend = async () => {
      setIsRecording(false);
      if (sourceText.trim()) {
        setIsTranslating(true);
        const detected = await detectLanguage(sourceText);
        if (detected && languages.some(l => l.value.startsWith(detected))) {
          setSourceLang(detected);
        }
        const translation = await translateText(sourceText, detected || sourceLang, targetLang);
        setTranslatedText(translation);
        setIsTranslating(false);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      toast({
        variant: 'destructive',
        title: 'Speech Recognition Error',
        description: event.error,
      });
      setIsRecording(false);
    };

    speechRecognitionRef.current = recognition;
  }, [hasSpeechRecognition, sourceLang, toast, sourceText, targetLang]);


  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    const translation = await translateText(sourceText, sourceLang, targetLang);
    setTranslatedText(translation);
    setIsTranslating(false);
  }, [sourceText, sourceLang, targetLang]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      if (sourceText.trim() && !isRecording) {
        handleTranslate();
      }
    }, 1000);

    return () => clearTimeout(debounceTimeout);
  }, [sourceText, isRecording, handleTranslate]);

  const handleMicClick = () => {
    if (isRecording) {
      speechRecognitionRef.current?.stop();
    } else {
      setSourceText('');
      setTranslatedText('');
      speechRecognitionRef.current?.start();
    }
    setIsRecording(!isRecording);
  };
  
  const handleSwapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleSpeak = () => {
    if (!hasSpeechSynthesis || !translatedText.trim() || isSpeaking) return;

    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };

  const handleCopy = () => {
    if (!translatedText) return;
    navigator.clipboard.writeText(translatedText);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleShare = async () => {
    if (canShare && translatedText) {
      try {
        await navigator.share({
          title: 'AccuAI Translation',
          text: translatedText,
        });
      } catch (error) {
        console.error('Sharing failed', error);
      }
    }
  };

  return (
    <TooltipProvider>
      <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center text-center mb-8">
          <Logo />
          <h1 className="text-4xl sm:text-5xl font-bold font-headline mt-4">AccuAI</h1>
          <p className="text-muted-foreground mt-2">Your AI-Powered Speech Translator</p>
        </div>
        <Card className="w-full max-w-4xl shadow-2xl">
          <CardHeader>
             <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Select value={sourceLang} onValueChange={setSourceLang} disabled={isTranslating || isRecording}>
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

              <Button variant="ghost" size="icon" onClick={handleSwapLanguages} disabled={isTranslating}>
                <ArrowRightLeft className="h-5 w-5" />
              </Button>

              <Select value={targetLang} onValueChange={setTargetLang} disabled={isTranslating || isRecording}>
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
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-2">
              <Textarea
                placeholder="Type or speak..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[200px] text-base resize-none"
                disabled={isTranslating || isRecording}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{sourceText.length} / 5000</span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" onClick={handleMicClick} disabled={!hasSpeechRecognition || isTranslating}>
                      {isRecording ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mic className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{!hasSpeechRecognition ? 'Speech recognition not supported' : isRecording ? 'Stop recording' : 'Start recording'}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            <div className="relative space-y-2">
              <Textarea
                placeholder="Translation"
                value={translatedText}
                readOnly
                className="min-h-[200px] text-base resize-none bg-muted/50"
              />
              {isTranslating && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
               <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" onClick={handleSpeak} disabled={!translatedText || !hasSpeechSynthesis || isTranslating}>
                      {isSpeaking ? <Pause className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{!hasSpeechSynthesis ? 'Text-to-speech not supported' : 'Listen to translation'}</p>
                  </TooltipContent>
                </Tooltip>
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" onClick={handleCopy} disabled={!translatedText || isTranslating}>
                      <Copy className="h-5 w-5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Copy translation</p>
                  </TooltipContent>
                </Tooltip>
                {canShare && (
                   <Tooltip>
                    <TooltipTrigger asChild>
                       <Button size="icon" variant="outline" onClick={handleShare} disabled={!translatedText || isTranslating}>
                          <Share2 className="h-5 w-5" />
                       </Button>
                    </TooltipTrigger>
                     <TooltipContent>
                       <p>Share translation</p>
                     </TooltipContent>
                   </Tooltip>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </TooltipProvider>
  );
}
