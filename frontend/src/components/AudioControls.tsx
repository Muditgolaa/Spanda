"use client";

import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/store/audioStore";
import { emitMessage } from "@/lib/socketBus";

export default function AudioControls() {
  const tracks = useAudioStore((s) => s.tracks);
  const currentTrackId = useAudioStore((s) => s.currentTrackId);
  const isStarted = useAudioStore((s) => s.isStarted);
  const isPlaying = useAudioStore((s) => s.isPlaying);
  const setCurrentTrack = useAudioStore((s) => s.setCurrentTrack);

  if (!isStarted) return null;

  // These only EMIT. The actual scheduling happens when SCHEDULED_ACTION comesback to every device (including this one), so all devices schedule alike.
  function play() {
    if (!currentTrackId) return;
    emitMessage({ type: "PLAY", audioId: currentTrackId, trackTimeSeconds: 0 });
  }
  function pause() {
    emitMessage({ type: "PAUSE" });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <Button onClick={play} disabled={!currentTrackId}>
          {isPlaying ? "Restart (synced)" : "Play (synced)"}
        </Button>
        <Button variant="outline" onClick={pause} disabled={!isPlaying}>
          Pause
        </Button>
      </div>

      {/* pick which track everyone will play */}
      <div className="flex flex-wrap gap-2">
        {tracks.map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={t.id === currentTrackId ? "default" : "secondary"}
            onClick={() => setCurrentTrack(t.id)}
          >
            {t.name}
          </Button>
        ))}
      </div>
    </div>
  );
}