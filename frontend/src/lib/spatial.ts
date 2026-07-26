// frontend/src/lib/spatial.ts
import { useAudioStore } from "@/store/audioStore";
import { useRoomStore } from "@/store/roomStore";

// Ramp MY master gain toward the value the server computed for me.
export function applyGains(
  gains: Record<string, { gain: number; rampTime: number }>,
) {
  const { masterGain, ctx } = useAudioStore.getState();
  const { myClientId } = useRoomStore.getState();
  if (!masterGain || !ctx || !myClientId) return;

  const mine = gains[myClientId];
  if (!mine) return;

  const now = ctx.currentTime;
  const g = masterGain.gain;
  g.cancelScheduledValues(now);
  g.setValueAtTime(g.value, now); // anchor at the current value
  g.linearRampToValueAtTime(mine.gain, now + Math.max(0.01, mine.rampTime));
}