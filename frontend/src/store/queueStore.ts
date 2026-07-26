import { create } from "zustand";

type QueueState = {
  queue: string[]; // audioIds, in play order
  addToQueue: (audioId: string) => void;
  removeAt: (index: number) => void;
  clear: () => void;
};

export const useQueueStore = create<QueueState>((set) => ({
  queue: [],
  addToQueue: (audioId) => set((s) => ({ queue: [...s.queue, audioId] })),
  removeAt: (index) =>
    set((s) => ({ queue: s.queue.filter((_, i) => i !== index) })),
  clear: () => set({ queue: [] }),
}));