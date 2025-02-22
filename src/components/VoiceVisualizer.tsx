
import { useEffect, useRef } from "react";

interface VoiceVisualizerProps {
  isRecording: boolean;
  audioContext: AudioContext | null;
  mediaStream: MediaStream | null;
}

const VoiceVisualizer = ({ isRecording, audioContext, mediaStream }: VoiceVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const analyzerRef = useRef<AnalyserNode | null>(null);

  useEffect(() => {
    if (!isRecording || !audioContext || !mediaStream || !canvasRef.current) return;

    const analyzer = audioContext.createAnalyser();
    analyzerRef.current = analyzer;
    analyzer.fftSize = 512; // Increased for more detailed visualization
    
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyzer);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      
      animationFrameRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);

      // Clear canvas with pure black
      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the waveform visualization
      const centerY = canvas.height / 2;
      const lineWidth = 2;
      const gap = 1;
      const totalWidth = (lineWidth + gap) * bufferLength;
      const startX = (canvas.width - totalWidth) / 2;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = lineWidth;

      for (let i = 0; i < bufferLength; i++) {
        const x = startX + i * (lineWidth + gap);
        const height = (dataArray[i] / 255) * (canvas.height / 2);
        
        // Draw vertical line
        ctx.beginPath();
        ctx.moveTo(x, centerY - height);
        ctx.lineTo(x, centerY + height);
        
        // Create gradient effect
        const gradient = ctx.createLinearGradient(x, centerY - height, x, centerY + height);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.95)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
        
        ctx.strokeStyle = gradient;
        ctx.stroke();
      }

      // Add glow effect
      ctx.filter = 'blur(2px)';
      ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < bufferLength; i++) {
        const x = startX + i * (lineWidth + gap);
        const height = (dataArray[i] / 255) * (canvas.height / 2);
        
        ctx.beginPath();
        ctx.moveTo(x, centerY - height);
        ctx.lineTo(x, centerY + height);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.stroke();
      }
      ctx.filter = 'none';
      ctx.globalCompositeOperation = 'source-over';
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      source.disconnect();
      analyzer.disconnect();
    };
  }, [isRecording, audioContext, mediaStream]);

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={200}
      className="w-full h-48 rounded-lg bg-black"
    />
  );
};

export default VoiceVisualizer;
