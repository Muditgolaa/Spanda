import { create } from "zustand";
import type { Track } from "@/lib/audio";

type AudioState = {
  ctx: AudioContext | null;
  masterGain: GainNode | null;
  analyser: AnalyserNode | null;
  tracks: Track[];
  sources: { audioId: string; name: string }[]; // ← NEW: lightweight catalog
  currentTrackId: string | null;
  isStarted: boolean;
  isPlaying: boolean;
  setGraph: (
    ctx: AudioContext,
    masterGain: GainNode,
    analyser: AnalyserNode,
  ) => void;
  reset: () => void;
  addTrack: (t: Track) => void;
  addSource: (s: { audioId: string; name: string }) => void; // ← NEW
  setCurrentTrack: (id: string) => void;
  setStarted: (v: boolean) => void;
  setPlaying: (v: boolean) => void;
};

export const useAudioStore = create<AudioState>((set) => ({
  ctx: null,
  masterGain: null,
  analyser: null,
  tracks: [],
  sources: [], // ← NEW
  currentTrackId: null,
  isStarted: false,
  isPlaying: false,
  setGraph: (ctx, masterGain, analyser) => set({ ctx, masterGain, analyser }),
  reset: () =>
    set({
      ctx: null,
      masterGain: null,
      analyser: null,
      tracks: [],
      sources: [],
      currentTrackId: null,
      isStarted: false,
      isPlaying: false,
    }),
  addTrack: (t) =>
    set((s) =>
      s.tracks.some((x) => x.id === t.id) ? s : { tracks: [...s.tracks, t] },
    ),
  addSource: (s) =>
    set((st) =>
      st.sources.some((x) => x.audioId === s.audioId)
        ? st
        : { sources: [...st.sources, s] },
    ), // ← NEW
  setCurrentTrack: (currentTrackId) => set({ currentTrackId }),
  setStarted: (isStarted) => set({ isStarted }),
  setPlaying: (isPlaying) => set({ isPlaying }),
}));
