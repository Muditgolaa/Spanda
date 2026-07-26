// Converts a server-stamped SCHEDULED_ACTION into a sample-accurate audio-clock schedule using this device's NTP offset.
import { useAudioStore } from "@/store/audioStore";
import { useSyncStore } from "@/store/syncStore";
import { epochNow } from "@/lib/epochNow";
import { useQueueStore } from "@/store/queueStore";
import { useRoomStore } from "@/store/roomStore";
import { emitMessage } from "@/lib/socketBus";

// The currently-playing source node. One-shot, so we track it to stop/replace.
let activeSource: AudioBufferSourceNode | null = null;

function stopActive(when?: number) {
  if (!activeSource) return;
  try {
    when === undefined ? activeSource.stop() : activeSource.stop(when);
  } catch {
    /* stopped */
  }
}

// When a track ends on its own, the ONE driver (first-seat client) advances the queue with a fresh, re-synced PLAY. Others just follow the broadcast.
function handleNaturalEnd(endedAudioId: string) {
  const { queue } = useQueueStore.getState();
  const { clients, myClientId } = useRoomStore.getState();

  const driverId = clients[0]?.clientId;
  if (!driverId || driverId !== myClientId) return; // I'm not the driver

  const idx = queue.indexOf(endedAudioId);
  const next = idx >= 0 ? queue[idx + 1] : undefined;
  if (next) {
    emitMessage({ type: "PLAY", audioId: next, trackTimeSeconds: 0 });
  }
}

export function scheduledPlay(
  audioId: string,
  trackTimeSeconds: number,
  serverTimeToExecute: number,
) {
  const { ctx, masterGain, tracks, setPlaying, setCurrentTrack } =
    useAudioStore.getState();
  const { offsetEstimate } = useSyncStore.getState();
  if (!ctx || !masterGain) return;

  const track = tracks.find((t) => t.id === audioId);
  if (!track) return;

  stopActive(); // replace any current playback
  activeSource = null;

  // My estimate of "current server time" is epochNow() + offset.
  const waitSeconds =
    (serverTimeToExecute - (epochNow() + offsetEstimate)) / 1000;
  const when = ctx.currentTime + Math.max(0, waitSeconds);

  const source = ctx.createBufferSource(); // fresh node every play (one-shot)
  source.buffer = track.buffer;
  source.connect(masterGain);
  const expectedEnd = when + track.buffer.duration; // audio-clock time it should finish
  source.onended = () => {
    if (activeSource !== source) return; 
    activeSource = null;
    setPlaying(false);
    // Natural end = we reached (near) the expected finish, not a manual stop.
    if (ctx.currentTime >= expectedEnd - 0.5) {
      handleNaturalEnd(audioId);
    }
  };
  source.start(when, trackTimeSeconds); // hands the time to the audio hardware clock
  activeSource = source;

  setCurrentTrack(audioId);
  setPlaying(true);
}

export function scheduledPause(serverTimeToExecute: number) {
  const { ctx, setPlaying } = useAudioStore.getState();
  const { offsetEstimate } = useSyncStore.getState();
  if (!ctx) return;

  const waitSeconds =
    (serverTimeToExecute - (epochNow() + offsetEstimate)) / 1000;
  stopActive(ctx.currentTime + Math.max(0, waitSeconds));
  setPlaying(false);
}
