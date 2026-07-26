import { create } from "zustand";

export const TOTAL_MEASUREMENTS = 40;

type SyncState = {
  offsetEstimate: number; // add to my clock to get server time
  rtt: number;            // averaged round-trip of the best half
  isSynced: boolean;
  measurements: number;   // 0..40 progress
  totalMeasurements: number;
  setProgress: (measurements: number) => void;
  setSynced: (offsetEstimate: number, rtt: number) => void;
  reset: () => void;
};

export const useSyncStore = create<SyncState>((set) => ({
  offsetEstimate: 0,
  rtt: 0,
  isSynced: false,
  measurements: 0,
  totalMeasurements: TOTAL_MEASUREMENTS,
  setProgress: (measurements) => set({ measurements }),
  setSynced: (offsetEstimate, rtt) =>
    set({ offsetEstimate, rtt, isSynced: true }),
  reset: () =>
    set({ offsetEstimate: 0, rtt: 0, isSynced: false, measurements: 0 }),
}));