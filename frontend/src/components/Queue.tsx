"use client";

import { Plus, X } from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { useQueueStore } from "@/store/queueStore";
import { emitMessage } from "@/lib/socketBus";

function fmt(t: number) {
  if (!isFinite(t) || t < 0) t = 0;
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function Queue() {
  const tracks = useAudioStore((s) => s.tracks);
  const isStarted = useAudioStore((s) => s.isStarted);
  const currentTrackId = useAudioStore((s) => s.currentTrackId);
  const queue = useQueueStore((s) => s.queue);
  const addToQueue = useQueueStore((s) => s.addToQueue);
  const removeAt = useQueueStore((s) => s.removeAt);

  if (!isStarted) return null;
  const trackOf = (id: string) => tracks.find((t) => t.id === id);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
        {queue.length === 0 ? (
          <p className="p-6 text-center text-sm text-neutral-500">
            Queue is empty — add tracks below.
          </p>
        ) : (
          queue.map((id, i) => {
            const t = trackOf(id);
            const active = id === currentTrackId;
            return (
              <div
                key={`${id}-${i}`}
                className={`group flex items-center gap-3 border-b border-white/5 px-4 py-3 last:border-0 ${
                  active ? "bg-fuchsia-500/10" : "hover:bg-white/5"
                }`}
              >
                <span className={`w-5 text-center text-sm tabular-nums ${active ? "text-fuchsia-400" : "text-neutral-500"}`}>
                  {active ? "♪" : i + 1}
                </span>
                <button
                  onClick={() => emitMessage({ type: "PLAY", audioId: id, trackTimeSeconds: 0 })}
                  className={`flex-1 truncate text-left text-sm ${active ? "font-medium text-white" : "text-neutral-200"}`}
                >
                  {t?.name ?? id}
                </button>
                <span className="text-xs tabular-nums text-neutral-500">
                  {t ? fmt(t.buffer.duration) : "--:--"}
                </span>
                <button
                  onClick={() => removeAt(i)}
                  className="text-neutral-500 opacity-0 transition hover:text-white group-hover:opacity-100"
                  title="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {tracks.map((t) => (
          <button
            key={t.id}
            onClick={() => addToQueue(t.id)}
            className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-300 transition hover:bg-white/10"
          >
            <Plus className="h-3 w-3" /> {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}