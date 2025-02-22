
import { ArrowLeft, Upload, Mic, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/use-toast";

const SpeakingCoach = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
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

    toast({
      title: "File uploaded",
      description: "Your audio file has been uploaded successfully",
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/mp3' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'recording.mp3';
        a.click();
        URL.revokeObjectURL(url);
        toast({
          title: "Recording saved",
          description: "Your recording has been saved as MP3",
        });
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Your microphone is now recording",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Permission denied",
        description: "Please allow microphone access to record",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-black/95 to-slate-900/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-8">
          <Link to="/">
            <Button variant="ghost" className="text-white/70 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="rounded-full p-2 hover:bg-white/10"
            onClick={() => toast({ title: "Profile", description: "Profile functionality coming soon!" })}
          >
            <UserRound className="h-6 w-6 text-white/70" />
          </Button>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-6">Speaking Coach</h1>
        <div className="grid gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">Welcome to Your Personal Speaking Coach</h2>
            <p className="text-white/70 mb-4">
              Here you'll find tools and resources to improve your public speaking skills:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2 mb-6">
              <li>Real-time feedback on your speech patterns</li>
              <li>Personalized improvement suggestions</li>
              <li>Practice exercises and drills</li>
              <li>Progress tracking and analytics</li>
            </ul>

            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="audio/*"
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-white/10 hover:bg-white/20 text-white"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Audio File
              </Button>
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                className={`${
                  isRecording 
                    ? "bg-red-500 hover:bg-red-600" 
                    : "bg-white/10 hover:bg-white/20"
                } text-white`}
              >
                <Mic className="h-4 w-4 mr-2" />
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingCoach;
