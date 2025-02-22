
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
    analyzer.fftSize = 256; // Increased for smoother visualization
    
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyzer);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyzer.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const timeDataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!isRecording) return;
      
      animationFrameRef.current = requestAnimationFrame(draw);
      analyzer.getByteFrequencyData(dataArray);
      analyzer.getByteTimeDomainData(timeDataArray);

      // Clear canvas with semi-transparent black
      ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw frequency bars
      const barWidth = (canvas.width / bufferLength) * 2;
      let x = 0;

      ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * (canvas.height / 2);
        ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth - 1, barHeight);
        x += barWidth;
      }

      // Draw waveform
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.lineWidth = 2;

      const sliceWidth = canvas.width / bufferLength;
      x = 0;

      ctx.moveTo(0, canvas.height * 0.75);
      for (let i = 0; i < bufferLength; i++) {
        const v = timeDataArray[i] / 128.0;
        const y = (v * canvas.height / 4) + (canvas.height * 0.75);
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height * 0.75);
      ctx.stroke();

      // Add subtle glow effect
      ctx.filter = 'blur(1px)';
      ctx.globalCompositeOperation = 'lighter';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();
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
      width={600}
      height={200}
      className="w-full h-48 rounded-lg bg-black/90 backdrop-blur-sm"
    />
  );
};

export default VoiceVisualizer;
