"use client";

import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/store/audioStore";
import { emitMessage } from "@/lib/socketBus";

export default function SpatialControls() {
    const isStarted = useAudioStore((s) => s.isStarted);
    if (!isStarted) return null;

    return (
        <div className="flex flex-wrap items-center gap-2 rounded-md border p-4">
            <span className="mr-2 text-sm font-semibold">Spatial audio</span>
            <Button size="sm" onClick={() => emitMessage({ type: "START_SPATIAL_AUDIO" })}>
                Circle
            </Button>
            <Button
                size="sm"
                onClick={() => emitMessage({ type: "START_SPIRAL_SPATIAL_AUDIO" })}
            >
                Infinity ∞
            </Button>
            <Button
                size="sm"
                variant="outline"
                onClick={() => emitMessage({ type: "STOP_SPATIAL_AUDIO" })}
            >
                Stop
            </Button>
        </div>
    );
}