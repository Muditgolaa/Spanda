"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/store/audioStore";

export default function AudioControls() {
  const ctx = useAudioStore((s) => s.ctx);
  const masterGain = useAudioStore((s) => s.masterGain);
  const tracks = useAudioStore((s) => s.tracks);
  const currentTrackId = useAudioStore((s) => s.currentTrackId);
  const isStarted = useAudioStore((s) => s.isStarted);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const setPlaying = useAudioStore((s) => s.setPlaying);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  if (!isStarted) return null;

  const current = tracks.find((t) => t.id === currentTrackId);

  function playLocal() {
    if (!ctx || !masterGain || !current) return;
    // Source nodes are ONE-SHOT: you must create a fresh one every play.
    const source = ctx.createBufferSource();
    source.buffer = current.buffer;
    source.connect(masterGain);
    source.onended = () => setPlaying(false);
    source.start(); // immediate — local test only; Step 6 schedules this
    sourceRef.current = source;
    setPlaying(true);
  }

  function stopLocal() {
    sourceRef.current?.stop();
    sourceRef.current = null;
    setPlaying(false);
  }

  return (
    <div className="flex items-center gap-3">
      <Button onClick={playLocal} disabled={isPlaying || !current}>
        Play (local test)
      </Button>
      <Button variant="outline" onClick={stopLocal} disabled={!isPlaying}>
        Stop
      </Button>
      <span className="text-sm text-muted-foreground">
        {current ? current.name : "No track"}
      </span>
    </div>
  );
}