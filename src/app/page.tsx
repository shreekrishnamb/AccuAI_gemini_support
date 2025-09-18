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
  CardHeader,
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
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const { toast } = useToast();
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    setIsClient(true);
  }, []);

  const canShare = isClient && typeof navigator !== 'undefined' && !!navigator.share;
  const hasSpeechRecognition = isClient && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const hasSpeechSynthesis = isClient && 'speechSynthesis' in window;
  const hasMediaRecorder = isClient && 'MediaRecorder' in window;

  const initializeMedia = useCallback(async () => {
    if (!hasSpeechRecognition || !hasMediaRecorder) return null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Speech Recognition setup
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

      recognition.onend = () => {
        setIsRecording(false);
        mediaRecorderRef.current?.stop();
      };

      recognition.onerror = (event: any) => {
        if (event.error === 'no-speech') {
          setIsRecording(false);
          mediaRecorderRef.current?.stop();
          return;
        }
        console.error('Speech recognition error:', event.error);
        toast({
          variant: 'destructive',
          title: 'Speech Recognition Error',
          description: event.error,
        });
        setIsRecording(false);
        mediaRecorderRef.current?.stop();
      };
      speechRecognitionRef.current = recognition;

      // Media Recorder setup
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
      };
      mediaRecorderRef.current = mediaRecorder;
      
      return true;

    } catch (err) {
      console.error('Error accessing microphone:', err);
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access in your browser settings.',
      });
      return false;
    }
  }, [hasSpeechRecognition, hasMediaRecorder, sourceLang, toast]);

  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    setIsTranslating(true);
    setTranslatedText('');
    const detected = await detectLanguage(sourceText);
    if (detected && languages.some(l => l.value.startsWith(detected))) {
      setSourceLang(detected);
    }
    const translation = await translateText(sourceText, detected || sourceLang, targetLang);
    setTranslatedText(translation);
    setIsTranslating(false);
  }, [sourceText, sourceLang, targetLang]);


  const handleMicClick = async () => {
    if (isRecording) {
      speechRecognitionRef.current?.stop();
      // MediaRecorder is stopped in recognition.onend
    } else {
      const mediaInitialized = await initializeMedia();
      if (!mediaInitialized) return;

      setSourceText('');
      setTranslatedText('');
      setRecordedAudioUrl(null);
      audioChunksRef.current = [];

      speechRecognitionRef.current?.start();
      mediaRecorderRef.current?.start();
      setIsRecording(true);
    }
  };
  
  const handleSwapLanguages = () => {
    if(isTranslating) return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(''); // Clear translation to avoid confusion
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
  
  const handlePlayRecording = () => {
    if (!recordedAudioUrl || isPlayingRecording) return;
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.play();
    }
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
  
  useEffect(() => {
    if (recordedAudioUrl) {
      const audio = new Audio(recordedAudioUrl);
      audio.onplay = () => setIsPlayingRecording(true);
      audio.onpause = () => setIsPlayingRecording(false);
      audio.onended = () => setIsPlayingRecording(false);
      audioPlaybackRef.current = audio;
    }
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    }
  }, [recordedAudioUrl]);

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
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <Textarea
                placeholder="Type or speak..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[200px] text-base resize-none"
                disabled={isTranslating || isRecording}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
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
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="outline" onClick={handlePlayRecording} disabled={!recordedAudioUrl || isPlayingRecording || isRecording}>
                        <Play className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{!recordedAudioUrl ? "No recording to play" : "Play recording"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button onClick={handleTranslate} disabled={!sourceText.trim() || isTranslating || isRecording}>
                  {isTranslating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Translating...
                    </>
                  ) : (
                    'Translate'
                  )}
                </Button>
              </div>
            </div>
            <div className="relative flex flex-col gap-4">
              <Textarea
                placeholder="Translation"
                value={translatedText}
                readOnly
                className="min-h-[200px] text-base resize-none bg-muted/50"
              />
              {isTranslating && !translatedText && (
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
