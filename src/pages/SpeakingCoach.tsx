
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const SpeakingCoach = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-black via-black/95 to-slate-900/20">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <Link to="/">
          <Button variant="ghost" className="text-white/70 hover:text-white mb-8">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Button>
        </Link>
        
        <h1 className="text-4xl font-bold text-white mb-6">Speaking Coach</h1>
        <div className="grid gap-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
            <h2 className="text-2xl font-semibold text-white mb-4">Welcome to Your Personal Speaking Coach</h2>
            <p className="text-white/70 mb-4">
              Here you'll find tools and resources to improve your public speaking skills:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-2">
              <li>Real-time feedback on your speech patterns</li>
              <li>Personalized improvement suggestions</li>
              <li>Practice exercises and drills</li>
              <li>Progress tracking and analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakingCoach;
