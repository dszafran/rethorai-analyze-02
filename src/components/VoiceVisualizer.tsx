
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
    analyzer.fftSize = 256;
    
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

      ctx.fillStyle = "rgb(0, 0, 0)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgb(234, 56, 76)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
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
