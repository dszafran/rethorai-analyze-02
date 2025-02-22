
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
    analyzer.fftSize = 128; // Reduced for crisper visualization
    
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

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = canvas.width / 2;
      
      // Draw bars in both directions from the center
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height / 2);
        
        // Create gradient for bars
        const gradient = ctx.createLinearGradient(0, canvas.height / 2 - barHeight, 0, canvas.height / 2 + barHeight);
        gradient.addColorStop(0, "rgba(234, 56, 76, 0.8)");
        gradient.addColorStop(1, "rgba(234, 56, 76, 0.4)");
        
        ctx.fillStyle = gradient;
        
        // Draw bar upward from center
        ctx.fillRect(
          x, 
          canvas.height / 2 - barHeight, 
          barWidth, 
          barHeight
        );
        
        // Draw bar downward from center (mirror)
        ctx.fillRect(
          x, 
          canvas.height / 2, 
          barWidth, 
          barHeight
        );
        
        // Draw bar on the left side (mirror)
        ctx.fillRect(
          canvas.width - x - barWidth, 
          canvas.height / 2 - barHeight, 
          barWidth, 
          barHeight
        );
        
        ctx.fillRect(
          canvas.width - x - barWidth, 
          canvas.height / 2, 
          barWidth, 
          barHeight
        );
        
        x += barWidth + 1;
      }
      
      // Add glow effect
      ctx.globalCompositeOperation = "lighter";
      ctx.filter = "blur(4px)";
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = "rgba(234, 56, 76, 0.2)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.filter = "none";
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
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
      width={300}
      height={100}
      className="w-full h-24 rounded-lg bg-black/20 backdrop-blur-sm"
    />
  );
};

export default VoiceVisualizer;
