// Converts a server-stamped SCHEDULED_ACTION into a sample-accurate audio-clock schedule using this device's NTP offset.
import { useAudioStore } from "@/store/audioStore";
import { useSyncStore } from "@/store/syncStore";
import { epochNow } from "@/lib/epochNow";
import { useQueueStore } from "@/store/queueStore";
import { useRoomStore } from "@/store/roomStore";
import { emitMessage } from "@/lib/socketBus";

// The currently-playing source node. One-shot, so we track it to stop/replace.
let activeSource: AudioBufferSourceNode | null = null;
let playState: {
  startAudioTime: number;
  startOffset: number;
  duration: number;
} | null = null;

function stopActive(when?: number) {
  if (!activeSource) return;
  try {
    when === undefined ? activeSource.stop() : activeSource.stop(when);
  } catch {
    /* stopped */
  }
}

// When a track ends on its own, the ONE driver (first-seat client) advances the queue with a fresh, re-synced PLAY. Others just follow the broadcast.
function pickNext(
  queue: string[],
  ended: string,
  shuffle: boolean,
  repeat: "off" | "all" | "one",
) {
  if (repeat === "one") return ended;
  if (queue.length === 0) return undefined;
  if (shuffle) {
    if (queue.length === 1) return repeat === "all" ? queue[0] : undefined;
    let n = ended;
    while (n === ended) n = queue[Math.floor(Math.random() * queue.length)];
    return n;
  }
  const idx = queue.indexOf(ended);
  const next = queue[idx + 1];
  return next ?? (repeat === "all" ? queue[0] : undefined);
}

function handleNaturalEnd(endedAudioId: string) {
  const { queue, shuffle, repeat } = useQueueStore.getState();
  const { clients, myClientId } = useRoomStore.getState();
  const { tracks } = useAudioStore.getState();

  const driverId = clients[0]?.clientId;
  if (!driverId || driverId !== myClientId) return; // only the driver advances

  // Advance within the queue if the ended song is queued; otherwise walk the library.
  const inQueue = queue.includes(endedAudioId);
  const list = inQueue ? queue : tracks.map((t) => t.id);

  const next = pickNext(list, endedAudioId, shuffle, repeat);
  if (next) emitMessage({ type: "PLAY", audioId: next, trackTimeSeconds: 0 });
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

  playState = {
    startAudioTime: when,
    startOffset: trackTimeSeconds,
    duration: track.buffer.duration,
  };

  const source = ctx.createBufferSource(); // fresh node every play (one-shot)
  source.buffer = track.buffer;
  source.connect(masterGain);
  const expectedEnd = when + (track.buffer.duration - trackTimeSeconds); // account for start offset
  source.onended = () => {
    if (activeSource !== source) return;
    activeSource = null;
    playState = null;
    setPlaying(false);
    if (ctx.currentTime >= expectedEnd - 0.5) handleNaturalEnd(audioId);
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
  playState = null;
  setPlaying(false);
}

export function stopAllPlayback() {
  stopActive();
  playState = null;
  activeSource = null;
}

export function getPlaybackProgress() {
  const { ctx } = useAudioStore.getState();
  if (!ctx || !playState) return null;
  const elapsed = Math.min(
    playState.duration,
    Math.max(
      0,
      ctx.currentTime - playState.startAudioTime + playState.startOffset,
    ),
  );
  return { elapsed, duration: playState.duration };
}
