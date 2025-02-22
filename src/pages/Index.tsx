
import { useState, useRef, useEffect } from "react";
import { Upload, UserRound, Home, FileText, Mic, AudioWaveform, HelpCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnalysisCard from "@/components/AnalysisCard";
import { useToast } from "@/components/ui/use-toast";
import { PlayCircle, StopCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    };
  }, [audioUrl]);

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
              <Link to="/analysis">
                <Button variant="ghost" className="text-white/70 hover:text-white">
                  <AudioWaveform className="h-4 w-4 mr-2" />
                  Analyze Speech
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
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from 0% from-white/90 via-white to-white/50 tracking-tight mb-6">
            Your Rhetoric, Enhanced
          </h1>
          <p className="text-xl text-white/70">
            Dive into speech analysis, where innovative AI technology meets debate expertise
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-8">
            <div className="flex flex-col items-center gap-6">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                className="hidden"
              />
              <Button
                onClick={handleUploadClick}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white transition-all duration-300 py-6 text-lg flex items-center gap-3 font-medium tracking-wide rounded-xl"
              >
                <Upload size={24} />
                Upload Audio File
              </Button>
              {audioUrl && (
                <div className="flex flex-col items-center gap-2 w-full">
                  <audio ref={audioPlayerRef} src={audioUrl} />
                  <Button
                    onClick={togglePlayback}
                    variant="outline"
                    className="w-full bg-white/5 hover:bg-white/10 text-white border-white/20 flex items-center gap-2 font-medium tracking-wide"
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <AnalysisCard title="Speech Analysis">
            <div className="space-y-3 text-white/70">
              <p className="text-lg">Upload your audio to analyze your debate performance.</p>
              <p>We'll help you identify:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>Logical fallacies</li>
                <li>Emotional responses</li>
                <li>Argument structure</li>
                <li>Voice confidence</li>
              </ul>
            </div>
          </AnalysisCard>

          <AnalysisCard title="Improvement Tips">
            <div className="space-y-3 text-white/70">
              <p className="text-lg">Your personalized coaching will include:</p>
              <ul className="list-disc list-inside space-y-2">
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
