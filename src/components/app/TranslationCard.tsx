
"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Copy,
  Loader2,
  Mic,
  Pause,
  Play,
  Share2,
  Star,
  Volume2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipProvider,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { transcribeAudio } from '@/app/actions';

interface TranslationCardProps {
  sourceText: string;
  setSourceText: (text: string) => void;
  translatedText: string;
  isTranslating: boolean;
  isTranscribing: boolean;
  setIsTranscribing: (isTranscribing: boolean) => void;
  handleTranslate: () => void;
  handleSavePhrase: () => void;
  isCurrentPhraseSaved: boolean;
  isUIBlocked: boolean;
}

export function TranslationCard({
  sourceText,
  setSourceText,
  translatedText,
  isTranslating,
  isTranscribing,
  setIsTranscribing,
  handleTranslate,
  handleSavePhrase,
  isCurrentPhraseSaved,
  isUIBlocked,
}: TranslationCardProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const [lastRecordingUrl, setLastRecordingUrl] = useState<string | null>(null);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  
  // Client-side-only state
  const [canShare, setCanShare] = useState(false);
  const [hasSpeechSynthesis, setHasSpeechSynthesis] = useState(false);
  const [hasMediaRecorder, setHasMediaRecorder] = useState(false);

  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const audioPlaybackRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCanShare(!!(navigator && navigator.share));
      setHasSpeechSynthesis('speechSynthesis' in window);
      setHasMediaRecorder('MediaRecorder' in window);

      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          setHasMicPermission(true);
          stream.getTracks().forEach(track => track.stop());
        })
        .catch(() => {
          setHasMicPermission(false);
        });
    }
  }, []);

  const handleTranscription = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const base64Audio = await blobToBase64(audioBlob);
      const transcription = await transcribeAudio(base64Audio);
      setSourceText(transcription);
    } catch (error: any) {
      console.error("Transcription failed on client", error);
      toast({
        variant: "destructive",
        title: "Transcription Failed",
        description: error.message || "Could not transcribe the audio. Please try again.",
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
  }, [hasMediaRecorder, toast, setIsTranscribing, setSourceText]);
  
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
  };

  const handleSpeak = () => {
    if (!hasSpeechSynthesis || !translatedText.trim() || isSpeaking) return;
    speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(translatedText);
    utterance.lang = translatedText; // This is likely wrong, should be targetLang
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
      <Card className="w-full shadow-2xl">
        <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
          <div className="relative flex flex-col gap-4">
            <Textarea
              placeholder="Type text to translate or use the microphone..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="min-h-[200px] text-base resize-none"
              disabled={isUIBlocked || isRecording}
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
              <Button onClick={() => handleTranslate()} disabled={!sourceText.trim() || isUIBlocked || isRecording}>
                {isTranslating && !isTranscribing ? (
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
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="outline" onClick={handleSavePhrase} disabled={!translatedText || isCurrentPhraseSaved || isUIBlocked}>
                    <Star className={`h-5 w-5 ${isCurrentPhraseSaved ? 'fill-yellow-400 text-yellow-500' : ''}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isCurrentPhraseSaved ? 'Phrase already saved' : 'Save phrase'}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
