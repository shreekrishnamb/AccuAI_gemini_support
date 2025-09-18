"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  ArrowRightLeft,
  Copy,
  HelpCircle,
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
import { translateText, detectLanguage, answerQuestion, transcribeAudio } from '@/app/actions';
import { Logo } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Home() {
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('es');
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [recordedAudioUrl, setRecordedAudioUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Check for microphone permission on initial load
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setHasMicPermission(true);
        // Stop tracks to release microphone, we will request it again when needed
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {
        setHasMicPermission(false);
      });
  }, []);

  const canShare = isClient && typeof navigator !== 'undefined' && !!navigator.share;
  const hasSpeechSynthesis = isClient && 'speechSynthesis' in window;
  const hasMediaRecorder = isClient && 'MediaRecorder' in window;


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

  const handleStopRecording = useCallback(async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudioUrl(audioUrl);
        
        setIsTranscribing(true);
        setSourceText('Transcribing audio...');

        try {
          // Convert blob to base64 data URI
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          reader.onloadend = async () => {
            const base64Audio = reader.result as string;
            const transcriptionResult = await transcribeAudio(base64Audio);
            if (transcriptionResult) {
              setSourceText(transcriptionResult);
            } else {
              setSourceText('');
              toast({
                variant: 'destructive',
                title: 'Transcription Failed',
                description: 'Could not transcribe the audio.',
              });
            }
            setIsTranscribing(false);
          };
        } catch (error) {
          console.error('Transcription error:', error);
          setSourceText('');
          toast({
            variant: 'destructive',
            title: 'Transcription Error',
            description: 'An error occurred during transcription.',
          });
          setIsTranscribing(false);
        }

        audioChunksRef.current = [];
        if(audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        }
      };
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  }, [toast]);

  const handleStartRecording = useCallback(async () => {
    if (!hasMediaRecorder) {
      toast({
        variant: 'destructive',
        title: 'Recording not supported',
        description: 'Your browser does not support audio recording.',
      });
      return;
    }
    setSourceText('');
    setTranslatedText('');
    setRecordedAudioUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;
      setHasMicPermission(true);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setHasMicPermission(false);
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access in your browser settings.',
      });
    }
  }, [hasMediaRecorder, toast]);

  const handleMicClick = async () => {
    if (isRecording) {
      await handleStopRecording();
    } else {
      await handleStartRecording();
    }
  };
  
  const handleSwapLanguages = () => {
    if(isTranslating || isTranscribing) return;
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(''); 
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
    if (!recordedAudioUrl) return;
    if (audioPlaybackRef.current) {
      if (audioPlaybackRef.current.paused) {
        audioPlaybackRef.current.play();
      } else {
        audioPlaybackRef.current.pause();
        audioPlaybackRef.current.currentTime = 0;
      }
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

  const handleAskQuestion = async () => {
    if (!question.trim() || !translatedText.trim()) return;
    setIsAnswering(true);
    setAnswer('');
    const result = await answerQuestion(translatedText, question);
    setAnswer(result);
    setIsAnswering(false);
  };
  
  useEffect(() => {
    if (recordedAudioUrl) {
      const audio = new Audio(recordedAudioUrl);
      audio.onplay = () => setIsPlayingRecording(true);
      audio.onpause = () => setIsPlayingRecording(false);
      audio.onended = () => setIsPlayingRecording(false);
      audio.onerror = (e) => { console.error("Audio playback error:", e); setIsPlayingRecording(false); };
      audioPlaybackRef.current = audio;
    }
    return () => {
      if (recordedAudioUrl) {
        URL.revokeObjectURL(recordedAudioUrl);
      }
    }
  }, [recordedAudioUrl]);

  const isUIBlocked = isTranslating || isRecording || isTranscribing;

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
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <Textarea
                placeholder={isTranscribing ? "Transcribing audio..." : "Type or speak..."}
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[200px] text-base resize-none"
                disabled={isUIBlocked}
              />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                   <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" onClick={handleMicClick} disabled={!hasMediaRecorder || isTranslating || isTranscribing || hasMicPermission === null}>
                        {isRecording ? <Pause className="h-5 w-5 text-red-500" /> : <Mic className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{!hasMediaRecorder ? 'Audio recording not supported' : isRecording ? 'Stop recording' : 'Start recording'}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="outline" onClick={handlePlayRecording} disabled={!recordedAudioUrl || isRecording}>
                        {isPlayingRecording ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{!recordedAudioUrl ? "No recording to play" : isPlayingRecording ? "Pause playback" : "Play recording"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button onClick={handleTranslate} disabled={!sourceText.trim() || isUIBlocked}>
                  {isTranslating || isTranscribing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isTranscribing ? 'Transcribing...' : 'Translating...'}
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

        {translatedText && (
          <Card className="w-full max-w-4xl shadow-2xl mt-6">
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
        )}
      </main>
    </TooltipProvider>
  );
}
