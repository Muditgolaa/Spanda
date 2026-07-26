"use client";

import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/store/audioStore";
import { useQueueStore } from "@/store/queueStore";
import { emitMessage } from "@/lib/socketBus";

export default function Queue() {
  const tracks = useAudioStore((s) => s.tracks);
  const isStarted = useAudioStore((s) => s.isStarted);
  const queue = useQueueStore((s) => s.queue);
  const addToQueue = useQueueStore((s) => s.addToQueue);
  const removeAt = useQueueStore((s) => s.removeAt);
  const clear = useQueueStore((s) => s.clear);

  if (!isStarted) return null;

  const nameOf = (id: string) =>
    tracks.find((t) => t.id === id)?.name ?? id;

  function playQueue() {
    if (queue[0]) {
      emitMessage({ type: "PLAY", audioId: queue[0], trackTimeSeconds: 0 });
    }
  }

  return (
    <div className="space-y-3 rounded-md border p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Queue ({queue.length})</h3>
        <div className="flex gap-2">
          <Button size="sm" onClick={playQueue} disabled={queue.length === 0}>
            Play queue
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={clear}
            disabled={queue.length === 0}
          >
            Clear
          </Button>
        </div>
      </div>

      {queue.length > 0 && (
        <ol className="list-inside list-decimal space-y-1 text-sm">
          {queue.map((id, i) => (
            <li key={`${id}-${i}`} className="flex items-center justify-between">
              <span className="truncate">{nameOf(id)}</span>
              <button
                className="text-xs text-muted-foreground underline"
                onClick={() => removeAt(i)}
              >
                remove
              </button>
            </li>
          ))}
        </ol>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {tracks.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant="secondary"
            onClick={() => addToQueue(t.id)}
          >
            + {t.name}
          </Button>
        ))}
      </div>
    </div>
  );
}