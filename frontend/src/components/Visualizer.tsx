"use client";

import { useEffect, useRef } from "react";
import { useAudioStore } from "@/store/audioStore";

export default function Visualizer() {
  const analyser = useAudioStore((s) => s.analyser);
  const isStarted = useAudioStore((s) => s.isStarted);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bins = analyser.frequencyBinCount;
    const data = new Uint8Array(bins);

    const size = 320;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const baseRadius = 70;
    let angleOffset = 0;

    const draw = () => {
      analyser.getByteFrequencyData(data);
      ctx.clearRect(0, 0, size, size);

      const bars = 96;
      const step = Math.floor(bins / bars);

      for (let i = 0; i < bars; i++) {
        const v = data[i * step] / 255;
        const len = v * 70;
        const angle = (i / bars) * Math.PI * 2 + angleOffset;

        const x1 = cx + Math.cos(angle) * baseRadius;
        const y1 = cy + Math.sin(angle) * baseRadius;
        const x2 = cx + Math.cos(angle) * (baseRadius + len);
        const y2 = cy + Math.sin(angle) * (baseRadius + len);

        const hue = 200 + v * 120;
        ctx.strokeStyle = `hsl(${hue}, 90%, ${55 + v * 20}%)`;
        ctx.lineWidth = 3;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      angleOffset += 0.003;
      rafRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [analyser]);

  if (!isStarted) return null;

  return (
    <div className="relative flex justify-center rounded-md border bg-neutral-950 p-4">
      <canvas ref={canvasRef} style={{ width: 320, height: 320 }} />
      {!isPlaying && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-neutral-400">
          Press Play to see the visualizer
        </span>
      )}
    </div>
  );
}