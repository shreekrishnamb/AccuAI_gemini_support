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
import { translateText, detectLanguage, answerQuestion } from '@/app/actions';
import { Logo } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isAnswering, setIsAnswering] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

  const { toast } = useToast();
  const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);


  useEffect(() => {
    console.log("Component mounted");
    setIsClient(true);
  }, []);

  const canShare = isClient && typeof navigator !== 'undefined' && !!navigator.share;
  const hasSpeechRecognition = isClient && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  const hasSpeechSynthesis = isClient && 'speechSynthesis' in window;
  const hasMediaRecorder = isClient && 'MediaRecorder' in window;

  const initializeMedia = useCallback(async () => {
    console.log("Attempting to initialize media...");
    if (!hasSpeechRecognition || !hasMediaRecorder) {
        console.log("Speech recognition or MediaRecorder not supported.");
        return;
    }

    try {
      console.log("Requesting microphone permission...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log("Microphone permission granted.");
      setHasMicPermission(true);

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = sourceLang;
      console.log("SpeechRecognition initialized with lang:", sourceLang);

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
        console.log("Speech recognition result:", { finalTranscript, interimTranscript });
        setSourceText(finalTranscript + interimTranscript);
      };

      recognition.onend = () => {
        console.log("Speech recognition ended.");
        setIsRecording(false);
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            console.log("Stopping media recorder from onend.");
            mediaRecorderRef.current.stop();
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech') {
          toast({
            variant: 'destructive',
            title: 'Speech Recognition Error',
            description: event.error,
          });
        }
        setIsRecording(false);
         if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            console.log("Stopping media recorder from onerror.");
            mediaRecorderRef.current.stop();
        }
      };
      speechRecognitionRef.current = recognition;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log("MediaRecorder data available, chunk size:", event.data.size);
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        console.log("MediaRecorder stopped.");
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        console.log("Created audio URL:", audioUrl, "from blob size:", audioBlob.size);
        setRecordedAudioUrl(audioUrl);
      };
      mediaRecorderRef.current = mediaRecorder;
      console.log("MediaRecorder initialized.");
      
    } catch (err) {
      console.error('Error accessing microphone:', err);
      setHasMicPermission(false);
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please allow microphone access in your browser settings.',
      });
    }
  }, [hasSpeechRecognition, hasMediaRecorder, sourceLang, toast]);

  useEffect(() => {
    initializeMedia();
  }, [initializeMedia]);


  const handleTranslate = useCallback(async () => {
    if (!sourceText.trim()) return;
    console.log("Translate button clicked.");
    setIsTranslating(true);
    setTranslatedText('');
    console.log("Detecting language for:", sourceText);
    const detected = await detectLanguage(sourceText);
    console.log("Detected language:", detected);
    if (detected && languages.some(l => l.value.startsWith(detected))) {
      setSourceLang(detected);
    }
    console.log("Translating text from", detected || sourceLang, "to", targetLang);
    const translation = await translateText(sourceText, detected || sourceLang, targetLang);
    console.log("Translation result:", translation);
    setTranslatedText(translation);
    setIsTranslating(false);
  }, [sourceText, sourceLang, targetLang]);


  const handleMicClick = async () => {
    if (isRecording) {
      console.log("Stopping recording...");
      speechRecognitionRef.current?.stop();
    } else {
      if(hasMicPermission === false){
        console.log("Mic permission not granted. Re-initializing media.");
        initializeMedia();
        return;
      }
      console.log("Starting recording...");
      setSourceText('');
      setTranslatedText('');
      setRecordedAudioUrl(null);
      audioChunksRef.current = [];
      
      if(speechRecognitionRef.current) {
        speechRecognitionRef.current.lang = sourceLang;
        console.log("Set speech recognition language to:", sourceLang);
      }

      speechRecognitionRef.current?.start();
      mediaRecorderRef.current?.start();
      setIsRecording(true);
    }
  };
  
  const handleSwapLanguages = () => {
    if(isTranslating) return;
    console.log("Swapping languages.");
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(''); 
  };

  const handleSpeak = () => {
    if (!hasSpeechSynthesis || !translatedText.trim() || isSpeaking) return;
    console.log("Speaking translation...");
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = targetLang;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { console.log("Speaking finished."); setIsSpeaking(false); };
    utterance.onerror = () => { console.error("Speech synthesis error."); setIsSpeaking(false); };
    speechSynthesis.speak(utterance);
  };
  
  const handlePlayRecording = () => {
    if (!recordedAudioUrl || isPlayingRecording) return;
    console.log("Playing recording from URL:", recordedAudioUrl);
    if (audioPlaybackRef.current) {
      audioPlaybackRef.current.play();
    }
  };

  const handleCopy = () => {
    if (!translatedText) return;
    console.log("Copying translation to clipboard.");
    navigator.clipboard.writeText(translatedText);
    toast({ title: 'Copied to clipboard!' });
  };

  const handleShare = async () => {
    if (canShare && translatedText) {
      console.log("Sharing translation.");
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
    console.log("Asking question:", question);
    setIsAnswering(true);
    setAnswer('');
    const result = await answerQuestion(translatedText, question);
    console.log("Answer received:", result);
    setAnswer(result);
    setIsAnswering(false);
  };
  
  useEffect(() => {
    if (recordedAudioUrl) {
      console.log("New recorded audio URL available. Creating Audio object.");
      const audio = new Audio(recordedAudioUrl);
      audio.onplay = () => { console.log("Audio playback started."); setIsPlayingRecording(true); };
      audio.onpause = () => { console.log("Audio playback paused."); setIsPlayingRecording(false); };
      audio.onended = () => { console.log("Audio playback ended."); setIsPlayingRecording(false); };
      audio.onerror = (e) => { console.error("Audio playback error:", e); setIsPlayingRecording(false); };
      audioPlaybackRef.current = audio;
    }
    return () => {
      if (recordedAudioUrl) {
        console.log("Revoking audio URL:", recordedAudioUrl);
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
              <Select value={sourceLang} onValueChange={(value) => { console.log("Source language changed to:", value); setSourceLang(value);}} disabled={isTranslating || isRecording}>
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

              <Select value={targetLang} onValueChange={(value) => { console.log("Target language changed to:", value); setTargetLang(value);}} disabled={isTranslating || isRecording}>
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
                      <Button size="icon" onClick={handleMicClick} disabled={!hasSpeechRecognition || isTranslating || hasMicPermission === null}>
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
                        {isPlayingRecording ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{!recordedAudioUrl ? "No recording to play" : isPlayingRecording ? "Pause playback" : "Play recording"}</p>
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
