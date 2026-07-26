"use client";

import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/store/audioStore";
import { emitMessage } from "@/lib/socketBus";

export default function SpatialControls() {
  const isStarted = useAudioStore((s) => s.isStarted);
  if (!isStarted) return null;

  return (
    <div  className="rounded-xl border border-neutral-800 bg-neutral-900 p-4">
    
      <p className="mb-3 text-sm font-semibold">Spatial audio</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" onClick={() => emitMessage({ type: "START_SPATIAL_AUDIO" })}>
          ● Circle
        </Button>
        <Button
          size="sm"
          onClick={() => emitMessage({ type: "START_SPIRAL_SPATIAL_AUDIO" })}
        >
          ∞ Infinity
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => emitMessage({ type: "STOP_SPATIAL_AUDIO" })}
        >
          Stop
        </Button>
      </div>
    </div>
  );
}