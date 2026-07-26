"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useRoomStore } from "@/store/roomStore";
import { useSyncStore, TOTAL_MEASUREMENTS } from "@/store/syncStore";
import { WSResponse } from "@/lib/schemas";
import { epochNow } from "@/lib/epochNow";
import { computeSample, estimateOffset, estimateRtt } from "@/lib/ntp";
import type { NtpSample } from "@/lib/ntp";
import { setSocket, emitMessage } from "@/lib/socketBus";
import { scheduledPlay, scheduledPause } from "@/lib/playback";
import { useAudioStore } from "@/store/audioStore";
import { loadTrack } from "@/lib/audio";
import { applyGains } from "@/lib/spatial";

export default function WebSocketManager({
    roomId,
    username,
}: {
    roomId: string;
    username: string;
}) {
    const socketRef = useRef<Socket | null>(null);
    const samplesRef = useRef<NtpSample[]>([]);

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
        setSocket(socket); // make it available to AudioControls / StatusBar

        const sendNtp = () => {
            emitMessage({ type: "NTP_REQUEST", t0: epochNow() });
        };

        socket.on("connect", () => sendNtp());

        socket.on("message", (raw: unknown) => {
            const result = WSResponse.safeParse(raw);
            if (!result.success) {
                console.error("Rejected malformed message:", result.error.issues, raw);
                return;
            }

            const msg = result.data;
            switch (msg.type) {
                case "SPATIAL_GAINS":
                    applyGains(msg.gains);
                    break;
                    
                case "CONNECTED":
                    setMyClientId(msg.clientId);
                    break;

                case "CLIENT_CHANGE":
                    setClients(msg.clients);
                    break;

                case "NEW_AUDIO_SOURCE": {
                    const { audioId, name } = msg;
                    const audio = useAudioStore.getState();
                    audio.addSource({ audioId, name }); // remember it regardless of Start

                    // If audio is already unlocked, fetch + decode it now.
                    if (audio.ctx) {
                        loadTrack(audio.ctx, { id: audioId, name, url: audioId })
                            .then((t) => useAudioStore.getState().addTrack(t))
                            .catch((err) => console.error("Decode failed:", err));
                    }
                    break;
                }

                case "NTP_RESPONSE": {
                    const t3 = epochNow();
                    samplesRef.current.push(computeSample(msg.t0, msg.t1, msg.t2, t3));
                    const n = samplesRef.current.length;
                    setProgress(n);
                    if (n < TOTAL_MEASUREMENTS) {
                        setTimeout(sendNtp, 30);
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

                case "SCHEDULED_ACTION": {
                    const { action, serverTimeToExecute } = msg;
                    if (action.type === "PLAY") {
                        scheduledPlay(
                            action.audioId,
                            action.trackTimeSeconds,
                            serverTimeToExecute,
                        );
                    } else {
                        scheduledPause(serverTimeToExecute);
                    }
                    break;
                }
            }
        });

        return () => {
            setSocket(null);
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