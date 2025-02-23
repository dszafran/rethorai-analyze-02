
import { useState, useRef } from "react";
import { Upload, UserRound, Home, Mic, AudioWaveform, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AnalysisResult } from "@/types/analysis";
import AnalysisSections from "@/components/AnalysisSections";

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'audio/webm') {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please upload a WebM audio file",
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://frequent-nat-agme-5eaaebcf.koyeb.app/audio', {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const data = await response.json();
      setAnalysisData(data);
      
      toast({
        title: "Analysis complete",
        description: "Your audio has been analyzed successfully",
      });
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        variant: "destructive",
        title: "Analysis failed",
        description: "There was an error analyzing your audio file",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-black/95 to-slate-900/20">
      {/* Navigation Bar */}
      <nav className="px-6 py-4 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="text-2xl font-bold text-white">RhetorAI</div>
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
          <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white/90 via-white to-white/50 tracking-tight mb-6">
            Your Rhetoric, Enhanced
          </h1>
          <p className="text-xl text-white/70">
            Upload your WebM audio file for instant speech analysis
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center gap-8 mb-12">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/webm"
              className="hidden"
            />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    onClick={handleUploadClick}
                    className="bg-white/10 hover:bg-white/20 text-white p-8 rounded-full"
                    disabled={isAnalyzing}
                  >
                    <Upload className="w-8 h-8" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Upload WebM audio</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {isAnalyzing && (
              <p className="text-white/70">Analyzing your audio...</p>
            )}
          </div>

          {analysisData && (
            <AnalysisSections data={analysisData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Index;
