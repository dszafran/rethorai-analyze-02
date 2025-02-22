import { useState, useRef, useEffect } from "react";
import { Upload, UserRound, Home, FileText, Mic, AudioWaveform, HelpCircle, ArrowRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { PlayCircle, StopCircle } from "lucide-react";
import { Link } from "react-router-dom";
import DebateScoreCard from "@/components/DebateScoreCard";
import RecordButton from "@/components/RecordButton";
import VoiceVisualizer from "@/components/VoiceVisualizer";

const Index = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('audio/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload an audio file",
      });
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    toast({
      title: "File uploaded",
      description: "Your audio file is ready for analysis",
    });
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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      setAudioContext(audioCtx);
      setMediaStream(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setMediaStream(null);
        toast({
          title: "Recording completed",
          description: "Your recording is ready for playback",
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak clearly into your microphone",
      });
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    }
  };

  useEffect(() => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.onended = () => setIsPlaying(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioUrl, mediaStream]);

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
      setIsPlaying(false);
      toast({
        title: "Recording deleted",
        description: "Your recording has been removed",
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-black/95 to-slate-900/20">
      {/* Navigation Bar */}
      <nav className="px-6 py-4 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="text-2xl font-bold text-white">RethorAI</div>
            <div className="hidden md:flex items-center gap-6">
              <Link to="/">
                <Button variant="ghost" className="text-white/70 hover:text-white">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link to="/speaking-coach">
                <Button variant="ghost" className="text-white/70 hover:text-white">
                  <Mic className="h-4 w-4 mr-2" />
                  Speaking Coach
                </Button>
              </Link>
              <Link to="/speech-summary">
                <Button variant="ghost" className="text-white/70 hover:text-white">
                  <AudioWaveform className="h-4 w-4 mr-2" />
                  Speech Summary
                </Button>
              </Link>
              <Button variant="ghost" className="text-white/70 hover:text-white">
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              className="rounded-full p-2 hover:bg-white/10"
              onClick={() => toast({ title: "Profile", description: "Profile functionality coming soon!" })}
            >
              <UserRound className="h-6 w-6 text-white/70" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="text-center max-w-3xl mx-auto mb-36">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from 0% from-white/90 via-white to-white/50 tracking-tight mb-6">
            Your Rhetoric, Enhanced
          </h1>
          <p className="text-xl text-white/70">
            Dive into speech analysis, where innovative AI technology meets debate expertise
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-24 flex flex-col items-center">
          <div className="flex items-center gap-12 mb-12">
            <button
              onClick={handleUploadClick}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <Upload size={48} />
            </button>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className="p-2 text-white/70 hover:text-white transition-colors"
            >
              <Mic size={48} />
            </button>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />
          {isRecording && (
            <div className="w-full max-w-lg">
              <VoiceVisualizer
                isRecording={isRecording}
                audioContext={audioContext}
                mediaStream={mediaStream}
              />
            </div>
          )}
          {audioUrl && (
            <div className="flex flex-col items-center gap-2 w-full max-w-lg">
              <audio ref={audioPlayerRef} src={audioUrl} />
              <div className="flex gap-2 w-full">
                <Button
                  onClick={togglePlayback}
                  variant="outline"
                  className="flex-1 bg-white/5 hover:bg-white/10 text-white border-white/20 flex items-center gap-2 font-medium tracking-wide"
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
                <Button
                  onClick={deleteRecording}
                  variant="outline"
                  className="bg-white/5 hover:bg-white/10 text-white border-white/20"
                >
                  <X size={20} />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Dashboard Section */}
        <div className="grid gap-6 md:grid-cols-2 max-w-5xl mx-auto">
          <div className="h-full">
            <DebateScoreCard />
          </div>
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-3">Key Insights</h3>
              <ul className="space-y-2 text-white/70">
                <li>• Strong evidence presentation and logical flow</li>
                <li>• Excellent time management throughout</li>
                <li>• Room for improvement in rebuttal techniques</li>
                <li>• Consistent speaking clarity and pace</li>
              </ul>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-3">Recommendations</h3>
              <ul className="space-y-2 text-white/70">
                <li>• Practice anticipating counter-arguments</li>
                <li>• Focus on strengthening rebuttal responses</li>
                <li>• Maintain current time management strategies</li>
                <li>• Consider incorporating more varied evidence types</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
