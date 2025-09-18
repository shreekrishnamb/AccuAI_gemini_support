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
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [lastRecordingUrl, setLastRecordingUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);

  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    setIsClient(true);
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        setHasMicPermission(true);
        stream.getTracks().forEach(track => track.stop());
      })
      .catch(() => {
        setHasMicPermission(false);
      });
  }, []);

  const canShare = isClient && typeof navigator !== 'undefined' && !!navigator.share;
  const hasSpeechSynthesis = isClient && 'speechSynthesis' in window;
  const hasMediaRecorder = isClient && 'MediaRecorder' in window;

  const handleTranslate = useCallback(async (textToTranslate?: string) => {
    const text = textToTranslate || sourceText;
    if (!text.trim()) return;
    setIsTranslating(true);
    setTranslatedText('');
    const detected = await detectLanguage(text);
    if (detected && languages.some(l => l.value.startsWith(detected))) {
      setSourceLang(detected);
    }
    const translation = await translateText(text, detected || sourceLang, targetLang);
    setTranslatedText(translation);
    setIsTranslating(false);
  }, [sourceText, sourceLang, targetLang]);
  
  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    console.log('handleTranscription called with blob:', audioBlob);
    try {
      const base64Audio = await blobToBase64(audioBlob);
      console.log('Audio converted to Base64, length:', base64Audio.length);
      const transcription = await transcribeAudio(base64Audio);
      if (transcription.startsWith('Error:')) {
        toast({
          variant: "destructive",
          title: "Transcription Failed",
          description: transcription,
        });
      } else {
        setSourceText(transcription);
        await handleTranslate(transcription);
      }
    } catch (error) {
      console.error("Transcription failed on client", error);
      toast({
        variant: "destructive",
        title: "Transcription Failed",
        description: "Could not transcribe the audio. Please try again.",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleStopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  }, []);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleStartRecording = useCallback(async () => {
    if (!hasMediaRecorder) {
      toast({
        variant: 'destructive',
        title: 'Recording not supported',
        description: 'Your browser does not support audio recording.',
      });
      return;
    }
    setLastRecordingUrl(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }, 
      });
      audioStreamRef.current = stream;
      setHasMicPermission(true);

      const mimeTypes = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/ogg;codecs=opus',
      ];
      const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));

      if (!supportedMimeType) {
        toast({
            variant: 'destructive',
            title: 'Recording format not supported',
            description: 'No supported audio format found for your browser.',
        });
        return;
      }
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType: supportedMimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        
        const audioUrl = URL.createObjectURL(audioBlob);
        setLastRecordingUrl(audioUrl);
        
        audioChunksRef.current = [];
        
        if (audioStreamRef.current) {
          audioStreamRef.current.getTracks().forEach(track => track.stop());
          audioStreamRef.current = null;
        }
        setIsRecording(false);
        await handleTranscription(audioBlob);
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
  
  const handleMicClick = () => {
    if (isRecording) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handlePlayRecording = () => {
    if (lastRecordingUrl) {
      if (audioPlaybackRef.current && !audioPlaybackRef.current.paused) {
        audioPlaybackRef.current.pause();
        audioPlaybackRef.current.currentTime = 0;
        setIsPlayingRecording(false);
      } else {
        const audio = new Audio(lastRecordingUrl);
        audio.play();
        audio.onplay = () => setIsPlayingRecording(true);
        audio.onpause = () => setIsPlayingRecording(false);
        audio.onended = () => setIsPlayingRecording(false);
        audio.onerror = (e) => { console.error("Audio playback error:", e); setIsPlayingRecording(false); };
        audioPlaybackRef.current = audio;
      }
    }
    return () => {
      if (audioPlaybackRef.current) {
        audioPlaybackRef.current.pause();
        audioPlaybackRef.current = null;
      }
    };
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
  
  const isUIBlocked = isTranslating || isTranscribing || isRecording;

  if (!isClient) {
    return null;
  }

  return (
    <TooltipProvider>
      <main className="flex min-h-screen w-full flex-col items-center gap-6 bg-background p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col items-center text-center">
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
            <div className="relative flex flex-col gap-4">
              <Textarea
                placeholder="Type text to translate or use the microphone..."
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                className="min-h-[200px] text-base resize-none"
                disabled={isUIBlocked}
              />
              {hasMicPermission === false && (
                <p className="text-sm text-destructive -mt-2">Microphone access denied.</p>
              )}
               {(isTranscribing || isTranslating) && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                   <p className="ml-2 text-lg">{isTranscribing ? 'Transcribing...' : 'Translating...'}</p>
                </div>
              )}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="icon"
                          variant={isRecording ? 'destructive' : 'outline'}
                          onClick={handleMicClick} 
                          disabled={hasMicPermission === false || !hasMediaRecorder || isTranscribing}
                        >
                          {isRecording ? <Pause className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isRecording ? 'Stop recording' : 'Start recording'}</p>
                      </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={handlePlayRecording}
                        disabled={!lastRecordingUrl || isRecording || isTranscribing}
                      >
                        {isPlayingRecording ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{!lastRecordingUrl ? "No recording to play" : isPlayingRecording ? "Pause recording" : "Play last recording"}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <Button onClick={() => handleTranslate()} disabled={!sourceText.trim() || isUIBlocked}>
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
              {isTranslating && !translatedText && !isTranscribing && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                   <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
               <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" onClick={handleSpeak} disabled={!translatedText || !hasSpeechSynthesis || isUIBlocked}>
                      {isSpeaking ? <Pause className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{!hasSpeechSynthesis ? 'Text-to-speech not supported' : 'Listen to translation'}</p>
                  </TooltipContent>
                </Tooltip>
                 <Tooltip>
                  <TooltipTrigger asChild>
                    <Button size="icon" variant="outline" onClick={handleCopy} disabled={!translatedText || isUIBlocked}>
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
                       <Button size="icon" variant="outline" onClick={handleShare} disabled={!translatedText || isUIBlocked}>
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
          <Card className="w-full max-w-4xl shadow-2xl">
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
