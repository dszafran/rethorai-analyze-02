
import { useState, useRef, useEffect } from "react";
import { Upload, UserRound, Home, FileText, Mic, AudioWaveform, HelpCircle, ArrowRight, X, Square, Play, ChartBar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import DebateScoreCard from "@/components/DebateScoreCard";
import RecordButton from "@/components/RecordButton";
import VoiceVisualizer from "@/components/VoiceVisualizer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const Index = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [recordingFormat, setRecordingFormat] = useState<string>('audio/webm');
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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

  const getSupportedMimeType = () => {
    const types = [
      'audio/mp3',
      'audio/mpeg',
      'audio/webm'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return 'audio/webm'; // Fallback format
  };

  const exportAudio = async () => {
    if (!audioUrl) {
      toast({
        variant: "destructive",
        title: "No audio to export",
        description: "Please record or upload audio first",
      });
      return;
    }

    try {
      setIsExporting(true);
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      
      // Prepare FormData with the correct extension based on format
      const formData = new FormData();
      const extension = recordingFormat.includes('mp3') || recordingFormat.includes('mpeg') ? 'mp3' : 'webm';
      formData.append('audio', blob, `recording.${extension}`);

      // This is where you'll make the API call to your Python backend
      // Example of how the API call would look:
      // const response = await fetch('YOUR_PYTHON_BACKEND_URL/upload', {
      //   method: 'POST',
      //   body: formData,
      // });

      toast({
        title: "Export ready",
        description: `Audio ready to send (${extension} format)`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        variant: "destructive",
        title: "Export failed",
        description: "There was an error preparing the audio",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioCtx = new AudioContext();
      setAudioContext(audioCtx);
      setMediaStream(stream);

      const mimeType = getSupportedMimeType();
      setRecordingFormat(mimeType);
      console.log('Recording using format:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setMediaStream(null);
        toast({
          title: "Recording completed",
          description: `Recording saved in ${mimeType.includes('mp3') || mimeType.includes('mpeg') ? 'MP3' : 'WebM'} format`,
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

  const handleDownload = () => {
    if (!audioUrl) return;
    
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `recording.${recordingFormat.includes('mp3') || recordingFormat.includes('mpeg') ? 'mp3' : 'webm'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Download started",
      description: "Your audio file is being downloaded",
    });
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
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Home className="h-4 w-4 mr-2" />
                  Home
                </Button>
              </Link>
              <Link to="/speaking-coach">
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                  <Mic className="h-4 w-4 mr-2" />
                  Speaking Coach
                </Button>
              </Link>
              <Link to="/speech-summary">
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
                  <AudioWaveform className="h-4 w-4 mr-2" />
                  Speech Summary
                </Button>
              </Link>
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/10">
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
          <div className="flex flex-col items-center gap-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className="p-6 text-white/70 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full"
                  >
                    <Mic size={64} />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Record</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          {isRecording && (
            <div className="w-full max-w-lg mt-6">
              <VoiceVisualizer
                isRecording={isRecording}
                audioContext={audioContext}
                mediaStream={mediaStream}
              />
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />
          
          {audioUrl && (
            <div className="flex flex-col items-center gap-4 w-full max-w-lg mt-6">
              <audio ref={audioPlayerRef} src={audioUrl} />
              <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 flex gap-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={togglePlayback}
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        {isPlaying ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isPlaying ? 'Stop' : 'Play'} audio</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={deleteRecording}
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete audio</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={exportAudio}
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                        disabled={isExporting}
                      >
                        <ChartBar className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Analyse</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleDownload}
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <Download className="w-5 h-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Download recording</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={handleUploadClick}
                        variant="ghost"
                        size="icon"
                        className="text-white/70 hover:text-white hover:bg-white/10"
                      >
                        <Upload className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Upload audio</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          )}

          {!audioUrl && (
            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 flex gap-2 mt-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleUploadClick}
                      variant="ghost"
                      size="icon"
                      className="text-white/70 hover:text-white hover:bg-white/10"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Upload audio</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          )}
        </div>

        {/* Dashboard Section */}
        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          <div className="h-full max-w-sm">
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
