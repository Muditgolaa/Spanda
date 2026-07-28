// "use client";

// import { Button } from "@/components/ui/button";
// import { useSyncStore } from "@/store/syncStore";
// import { useRoomStore } from "@/store/roomStore";
// import { useAudioStore } from "@/store/audioStore";
// import { emitMessage } from "@/lib/socketBus";

// export default function StatusBar() {
//   const offset = useSyncStore((s) => s.offsetEstimate);
//   const rtt = useSyncStore((s) => s.rtt);
//   const isSynced = useSyncStore((s) => s.isSynced);
//   const clients = useRoomStore((s) => s.clients);
//   const currentTrackId = useAudioStore((s) => s.currentTrackId);
//   const isStarted = useAudioStore((s) => s.isStarted);

//   if (!isStarted) return null;

//   // Re-align everyone by re-broadcasting PLAY from the start.
//   function fullSync() {
//     if (!currentTrackId) return;
//     emitMessage({ type: "PLAY", audioId: currentTrackId, trackTimeSeconds: 0 });
//   }

//   return (
//     <div className="flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900 p-4 text-sm">
//       <div className="flex gap-4 text-muted-foreground">
//         <span>
//           {isSynced ? "●" : "○"} offset {offset.toFixed(1)}ms
//         </span>
//         <span>RTT {rtt.toFixed(1)}ms</span>
//         <span>
//           {clients.length} device{clients.length === 1 ? "" : "s"}
//         </span>
//       </div>
//       <Button
//         size="sm"
//         variant="secondary"
//         onClick={fullSync}
//         disabled={!currentTrackId}
//       >
//         Full Sync
//       </Button>
//     </div>
//   );
// }