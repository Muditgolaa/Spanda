import { create } from "zustand";
import type { Track } from "@/lib/audio";

type AudioState = {
  ctx: AudioContext | null;
  masterGain: GainNode | null;
  analyser: AnalyserNode | null;
  tracks: Track[];
  currentTrackId: string | null;
  isStarted: boolean; // audio unlocked via the gesture
  isPlaying: boolean;
  setGraph: (
    ctx: AudioContext,
    masterGain: GainNode,
    analyser: AnalyserNode,
  ) => void;
  addTrack: (t: Track) => void;
  setCurrentTrack: (id: string) => void;
  setStarted: (v: boolean) => void;
  setPlaying: (v: boolean) => void;
};

export const useAudioStore = create<AudioState>((set) => ({
  ctx: null,
  masterGain: null,
  analyser: null,
  tracks: [],
  currentTrackId: null,
  isStarted: false,
  isPlaying: false,
  setGraph: (ctx, masterGain, analyser) => set({ ctx, masterGain, analyser }),
  addTrack: (t) =>
    set((s) =>
      s.tracks.some((x) => x.id === t.id) ? s : { tracks: [...s.tracks, t] },
    ),
  setCurrentTrack: (currentTrackId) => set({ currentTrackId }),
  setStarted: (isStarted) => set({ isStarted }),
  setPlaying: (isPlaying) => set({ isPlaying }),
}));