import { useState, useRef, useEffect } from "react";
import { Upload, UserRound, Home, FileText, Mic, AudioWaveform, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnalysisCard from "@/components/AnalysisCard";
import { useToast } from "@/components/ui/use-toast";
import { PlayCircle, StopCircle } from "lucide-react";
import { Link } from "react-router-dom";
import DebateScoreCard from "@/components/DebateScoreCard";

const Index = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const initializeRecorder = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder.current = new MediaRecorder(stream);

        mediaRecorder.current.ondataavailable = (event) => {
          audioChunks.current.push(event.data);
        };

        mediaRecorder.current.onstop = () => {
          const audioBlob = new Blob(audioChunks.current, { type: 'audio/wav' });
          const url = URL.createObjectURL(audioBlob);
          setAudioURL(url);
          audioChunks.current = []; // Clear chunks for next recording
        };
      } catch (error) {
        console.error("Error initializing media recorder:", error);
        toast({
          title: "Error",
          description: "Failed to initialize audio recording. Please check your microphone permissions.",
          variant: "destructive",
        });
      }
    };

    initializeRecorder();

    return () => {
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
      }
    };
  }, [toast]);

  const startRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'inactive') {
      audioChunks.current = []; // Ensure previous chunks are cleared
      mediaRecorder.current.start();
      setIsRecording(true);
      toast({
        title: "Recording...",
        description: "Your audio is being recorded.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
      mediaRecorder.current.stop();
      setIsRecording(false);
      toast({
        title: "Recording stopped",
        description: "Processing your audio...",
      });
    }
  };

  const uploadAudio = async (audioFile: File) => {
    const formData = new FormData();
    formData.append("audio", audioFile);

    try {
      const response = await fetch("http://localhost:8000/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setTranscription(result.transcription);
      setAnalysis(result.analysis);
      toast({
        title: "Analysis Complete",
        description: "Results are ready to view.",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload and analyze audio.",
        variant: "destructive",
      });
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      await uploadAudio(file);
    }
  };

  const handleRecordingUpload = async () => {
    if (audioURL) {
      try {
        const response = await fetch(audioURL);
        const blob = await response.blob();
        const audioFile = new File([blob], "recording.wav", { type: "audio/wav" });
        await uploadAudio(audioFile);
      } catch (error) {
        console.error("Error uploading recording:", error);
        toast({
          title: "Upload Failed",
          description: "Failed to upload the recording.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "No Recording Found",
        description: "Please make a recording first.",
        variant: "warning",
      });
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-black/95 to-slate-900/20">
      {/* Navigation Bar */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="ghost" className="text-white/70 hover:text-white">
              <Home className="h-4 w-4 mr-2" />
              Home
            </Button>
          </div>
          <div className="space-x-2">
            <Button variant="ghost" className="rounded-full p-2 hover:bg-white/10">
              <HelpCircle className="h-6 w-6 text-white/70" />
            </Button>
            <Button variant="ghost" className="rounded-full p-2 hover:bg-white/10" onClick={() => toast({ title: "Profile", description: "Profile functionality coming soon!" })}>
              <UserRound className="h-6 w-6 text-white/70" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-12">
          {/* Title and Upload Section */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Unleash Your Speaking Potential
            </h1>
            <p className="text-lg text-white/70 mb-8">
              Get instant feedback on your speeches and presentations.
            </p>
            <div className="space-x-4">
              <Button asChild>
                <label htmlFor="upload-input" className="cursor-pointer">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Audio
                  <input id="upload-input" type="file" accept="audio/*" className="hidden" onChange={handleFileChange} />
                </label>
              </Button>
              {isRecording ? (
                <Button variant="destructive" onClick={stopRecording}>
                  <StopCircle className="h-4 w-4 mr-2 animate-pulse" />
                  Stop Recording
                </Button>
              ) : (
                <Button variant="outline" onClick={startRecording}>
                  <Mic className="h-4 w-4 mr-2" />
                  Start Recording
                </Button>
              )}
              {audioURL && (
                <Button onClick={handleRecordingUpload}>
                  <AudioWaveform className="h-4 w-4 mr-2" />
                  Upload Recording
                </Button>
              )}
              <Link to="/speech-summary">
                <Button>
                  View Example <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Example Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-7xl mx-auto mb-16">
            <div className="h-full">
              <DebateScoreCard />
            </div>
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

          {/* Remove the existing analysis cards since we've moved their content up */}
        </div>
      </div>
    </div>
  );
};

export default Index;
