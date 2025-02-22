
import { useState, useRef, useEffect } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import AnalysisCard from "@/components/AnalysisCard";
import { useToast } from "@/components/ui/use-toast";
import { PlayCircle, StopCircle } from "lucide-react";

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
    <div className="min-h-screen w-full bg-black p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#ff4d4d] to-[#ff0000] bg-clip-text text-transparent tracking-tight">
            RethorAI
          </h1>
          <p className="text-white/70 font-light tracking-wide">Your AI-powered debate coach</p>
        </div>

        <div className="bg-black/30 rounded-xl p-8">
          <div className="flex flex-col items-center gap-6">
            <div className="w-full max-w-md">
              <div className="flex flex-col items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="audio/*"
                  className="hidden"
                />
                <Button
                  onClick={handleUploadClick}
                  className="w-full bg-gradient-to-r from-[#ff4d4d] to-[#ff0000] hover:from-[#ff6666] hover:to-[#ff1a1a] text-white transition-all duration-300 py-6 text-lg flex items-center gap-3 font-medium tracking-wide"
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
                      className="w-full bg-white/5 hover:bg-white/10 text-white flex items-center gap-2 font-medium tracking-wide"
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnalysisCard title="Speech Analysis">
            <div className="space-y-2 text-white/70">
              <p>Upload your audio to analyze your debate performance.</p>
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
