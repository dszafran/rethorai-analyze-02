
import { Mic } from "lucide-react";

interface RecordButtonProps {
  isRecording: boolean;
  onClick: () => void;
}

const RecordButton = ({ isRecording, onClick }: RecordButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={`relative p-6 rounded-full transition-all duration-300 ${
        isRecording
          ? "bg-theme-red text-white"
          : "bg-white/10 hover:bg-theme-red/20 text-theme-red"
      }`}
    >
      <Mic size={32} className="relative z-10" />
      {isRecording && <div className="recording-pulse" />}
    </button>
  );
};

export default RecordButton;
