
// Converts a server-stamped SCHEDULED_ACTION into a sample-accurate audio-clock schedule using this device's NTP offset.
import { useAudioStore } from "@/store/audioStore";
import { useSyncStore } from "@/store/syncStore";
import { epochNow } from "@/lib/epochNow";

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
  source.onended = () => {
    if (activeSource === source) {
      activeSource = null;
      setPlaying(false);
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