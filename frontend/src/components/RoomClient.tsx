// frontend/src/components/RoomClient.tsx
"use client";

import { useEffect, ReactNode } from "react";
import Link from "next/link";
import WebSocketManager from "@/components/WebSocketManager";
import SyncProgress from "@/components/SyncProgress";
import StartSystem from "@/components/StartSystem";
import Visualizer from "@/components/Visualizer";
import AudioControls from "@/components/AudioControls";
import Uploader from "@/components/Uploader";
import Queue from "@/components/Queue";
import UserGrid from "@/components/UserGrid";
import SpatialControls from "@/components/SpatialControls";
import { useAudioStore } from "@/store/audioStore";
import { useSyncStore } from "@/store/syncStore";
import { useQueueStore } from "@/store/queueStore";
import { useRoomStore } from "@/store/roomStore";
import { stopAllPlayback } from "@/lib/playback";
import { emitMessage } from "@/lib/socketBus";

function HeaderStatus() {
    const isSynced = useSyncStore((s) => s.isSynced);
    const offset = useSyncStore((s) => s.offsetEstimate);
    const rtt = useSyncStore((s) => s.rtt);
    const clients = useRoomStore((s) => s.clients);
    const currentTrackId = useAudioStore((s) => s.currentTrackId);
    const isStarted = useAudioStore((s) => s.isStarted);

    return (
        <div className="flex items-center gap-4 text-xs text-neutral-400">
            <span className={`flex items-center gap-1.5 ${isSynced ? "text-cyan-400" : "text-neutral-500"}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isSynced ? "animate-pulse bg-cyan-400" : "bg-neutral-500"}`} />
                {isSynced ? "Synced" : "Syncing…"}
            </span>
            <span className="hidden md:inline">offset {offset.toFixed(1)}ms</span>
            <span className="hidden md:inline">RTT {rtt.toFixed(1)}ms</span>
            <span>
                {clients.length} device{clients.length === 1 ? "" : "s"}
            </span>
            {isStarted && (
                <button
                    onClick={() =>
                        currentTrackId &&
                        emitMessage({ type: "PLAY", audioId: currentTrackId, trackTimeSeconds: 0 })
                    }
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-neutral-200 hover:bg-white/10"
                >
                    Full Sync
                </button>
            )}
        </div>
    );
}

function SectionTitle({ children }: { children: ReactNode }) {
    return (
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
            {children}
        </p>
    );
}

export default function RoomClient({
    roomId,
    username,
}: {
    roomId: string;
    username: string;
}) {
    useEffect(() => {
        return () => {
            stopAllPlayback();
            const { ctx } = useAudioStore.getState();
            if (ctx && ctx.state !== "closed") ctx.close().catch(() => { });
            useAudioStore.getState().reset();
            useSyncStore.getState().reset();
            useQueueStore.getState().clear();
            useRoomStore.getState().reset();
        };
    }, []);

    return (
        <div className="relative min-h-screen bg-[#080810] text-neutral-100">
            {/* ambient brand glow */}
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(60%_45%_at_50%_0%,rgba(168,85,247,0.14),transparent)]" />

            <WebSocketManager roomId={roomId} username={username} />

            {/* top status bar */}
            <header className="sticky top-0 z-20 border-b border-white/10 bg-black/50 backdrop-blur">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                        <img src="/spanda-mark.svg" alt="" className="h-7 w-7" />
                        <span className="bg-gradient-to-r from-fuchsia-400 to-violet-400 bg-clip-text text-lg font-bold text-transparent">
                            Spanda
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-xs">
                            #{roomId}
                        </span>
                        <div className="ml-2 hidden sm:block">
                            <HeaderStatus />
                        </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-neutral-400">
                        <span className="hidden sm:inline">{username}</span>
                        <Link href="/" className="hover:text-white">
                            Leave
                        </Link>
                    </div>
                </div>
            </header>

            {/* 3-column shell */}
            <div className="relative grid grid-cols-1 gap-4 p-4 lg:grid-cols-[240px_1fr_340px]">
                {/* LEFT — actions / effects */}
                <aside className="order-2 space-y-6 lg:order-none">
                    <div>
                        <SectionTitle>Audio effects</SectionTitle>
                        <SpatialControls />
                    </div>
                    <div>
                        <SectionTitle>Library</SectionTitle>
                        <Uploader />
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-xs text-neutral-400">
                        <p className="mb-2 font-semibold text-neutral-300">Tips</p>
                        <ul className="list-disc space-y-1 pl-4">
                            <li>Open the same room on multiple devices.</li>
                            <li>Hit Full Sync if a device drifts.</li>
                            <li>Avoid Bluetooth for lowest latency.</li>
                        </ul>
                    </div>
                </aside>

                {/* CENTER — player + queue */}
                <main className="order-1 space-y-4 lg:order-none"> 
                    <SyncProgress />
                    <StartSystem />
                    <Visualizer />
                    <AudioControls />
                    <div>
                        <SectionTitle>Now playing</SectionTitle>
                        <Queue />
                    </div>
                </main>

                {/* RIGHT — spatial */}
                <aside className="order-3 lg:order-none"> 
                    <SectionTitle>Spatial audio</SectionTitle>
                    <UserGrid />
                </aside>
            </div>
        </div>
    );
}