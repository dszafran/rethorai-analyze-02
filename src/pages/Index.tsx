
import { useState, useRef, useEffect } from "react";
import RecordButton from "@/components/RecordButton";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import AnalysisCard from "@/components/AnalysisCard";
import { useToast } from "@/components/ui/use-toast";
import { PlayCircle, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const context = new AudioContext();
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(audioUrl);
      };

      setMediaStream(stream);
      setAudioContext(context);
      setIsRecording(true);
      setAudioUrl(null);
      
      mediaRecorderRef.current.start();
      
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaStream) {
      mediaRecorderRef.current.stop();
      mediaStream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setMediaStream(null);
      
      toast({
        title: "Recording stopped",
        description: "Processing your recording...",
      });
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current || !audioUrl) return;

    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [mediaStream, audioUrl]);

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-theme-red">RethorAI</h1>
          <p className="text-white/70">Your AI-powered debate coach</p>
        </div>

        <div className="glass-panel p-8 space-y-6">
          <div className="flex flex-col items-center gap-6">
            <VoiceVisualizer
              isRecording={isRecording}
              audioContext={audioContext}
              mediaStream={mediaStream}
            />
            <div className="flex flex-col items-center gap-4">
              <RecordButton isRecording={isRecording} onClick={toggleRecording} />
              {audioUrl && (
                <div className="flex flex-col items-center gap-2">
                  <audio ref={audioPlayerRef} src={audioUrl} />
                  <Button
                    onClick={togglePlayback}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isPlaying ? (
                      <>
                        <StopCircle size={20} />
                        Stop Playback
                      </>
                    ) : (
                      <>
                        <PlayCircle size={20} />
                        Play Recording
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnalysisCard title="Speech Analysis">
            <div className="space-y-2 text-white/70">
              <p>Start recording to analyze your debate performance.</p>
              <p>We'll help you identify:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Logical fallacies</li>
                <li>Emotional responses</li>
                <li>Argument structure</li>
                <li>Voice confidence</li>
              </ul>
            </div>
          </AnalysisCard>

          <AnalysisCard title="Improvement Tips">
            <div className="space-y-2 text-white/70">
              <p>Your personalized coaching will include:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Rhetoric enhancement suggestions</li>
                <li>Stress management techniques</li>
                <li>Structure improvements</li>
                <li>Practice exercises</li>
              </ul>
            </div>
          </AnalysisCard>
        </div>
      </div>
    </div>
  );
};

export default Index;
