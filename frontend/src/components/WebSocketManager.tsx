"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useRoomStore } from "@/store/roomStore";
import { useSyncStore, TOTAL_MEASUREMENTS } from "@/store/syncStore";
import { WSResponse } from "@/lib/schemas";
import { epochNow } from "@/lib/epochNow";
import { computeSample, estimateOffset, estimateRtt } from "@/lib/ntp";
import type { NtpSample } from "@/lib/ntp";

export default function WebSocketManager({
  roomId,
  username,
}: {
  roomId: string;
  username: string;
}) {
  const socketRef = useRef<Socket | null>(null);
  const samplesRef = useRef<NtpSample[]>([]); // collected across the 40-sample loop

  const setRoom = useRoomStore((s) => s.setRoom);
  const setMyClientId = useRoomStore((s) => s.setMyClientId);
  const setClients = useRoomStore((s) => s.setClients);

  const setProgress = useSyncStore((s) => s.setProgress);
  const setSynced = useSyncStore((s) => s.setSynced);
  const resetSync = useSyncStore((s) => s.reset);

  useEffect(() => {
    setRoom(roomId, username);
    resetSync();
    samplesRef.current = [];

    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
      query: { roomId, username },
    });
    socketRef.current = socket;

    // Fire ONE ntp request, stamping our send time t0.
    const sendNtp = () => {
      socket.emit("message", { type: "NTP_REQUEST", t0: epochNow() });
    };

    // Start the loop as soon as we're connected.
    socket.on("connect", () => sendNtp());

    socket.on("message", (raw: unknown) => {
      const result = WSResponse.safeParse(raw);
      if (!result.success) {
        console.error("Rejected malformed message:", result.error.issues, raw);
        return;
      }

      const msg = result.data;
      switch (msg.type) {
        case "CONNECTED":
          setMyClientId(msg.clientId);
          break;

        case "CLIENT_CHANGE":
          setClients(msg.clients);
          break;

        case "NTP_RESPONSE": {
          const t3 = epochNow(); // client receive time
          samplesRef.current.push(computeSample(msg.t0, msg.t1, msg.t2, t3));

          const n = samplesRef.current.length;
          setProgress(n);

          if (n < TOTAL_MEASUREMENTS) {
            setTimeout(sendNtp, 30); // self-perpetuating: 40 samples, 30ms apart
          } else {
            const offset = estimateOffset(samplesRef.current);
            const rtt = estimateRtt(samplesRef.current);
            setSynced(offset, rtt);
            console.log(
              `Synced → offset ${offset.toFixed(2)}ms, rtt ${rtt.toFixed(2)}ms`,
            );
          }
          break;
        }
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [
    roomId,
    username,
    setRoom,
    setMyClientId,
    setClients,
    setProgress,
    setSynced,
    resetSync,
  ]);

  return null;
}