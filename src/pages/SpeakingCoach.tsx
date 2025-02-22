
import { ArrowLeft, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import ConversationWidget from "@/components/ConversationWidget";

const SpeakingCoach = () => {
  const { toast } = useToast();

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
          </div>
          <ConversationWidget />
        </div>
      </div>
    </div>
  );
};

export default SpeakingCoach;
