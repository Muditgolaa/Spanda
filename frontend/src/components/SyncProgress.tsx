"use client";

import { useSyncStore } from "@/store/syncStore";
import { Progress } from "@/components/ui/progress";

export default function SyncProgress() {
  const measurements = useSyncStore((s) => s.measurements);
  const total = useSyncStore((s) => s.totalMeasurements);
  const isSynced = useSyncStore((s) => s.isSynced);
  const offset = useSyncStore((s) => s.offsetEstimate);
  const rtt = useSyncStore((s) => s.rtt);

  if (isSynced) {
    return (
      <div className="rounded-md border p-4 text-sm">
        <span className="font-medium text-green-600">● Synced</span>
        <span className="ml-3 text-muted-foreground">
          offset {offset.toFixed(1)}ms · RTT {rtt.toFixed(1)}ms
        </span>
      </div>
    );
  }

  return (
    <div className="rounded-md border p-4 space-y-2">
      <div className="flex justify-between text-sm">
        <span>Syncing clock…</span>
        <span className="text-muted-foreground">
          {measurements}/{total}
        </span>
      </div>
      <Progress value={Math.round((measurements / total) * 100)} />
    </div>
  );
}