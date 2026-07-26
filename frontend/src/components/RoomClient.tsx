"use client";

import Link from "next/link";
import WebSocketManager from "@/components/WebSocketManager";
import SyncProgress from "@/components/SyncProgress";
import StartSystem from "@/components/StartSystem";
import StatusBar from "@/components/StatusBar";
import Visualizer from "@/components/Visualizer";
import AudioControls from "@/components/AudioControls";
import Uploader from "@/components/Uploader";
import Queue from "@/components/Queue";
import UserGrid from "@/components/UserGrid";
import SpatialControls from "@/components/SpatialControls";

export default function RoomClient({
    roomId,
    username,
}: {
    roomId: string;
    username: string;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-black text-neutral-100">
            <WebSocketManager roomId={roomId} username={username} />

            <header className="sticky top-0 z-10 border-b border-white/10 bg-black/40 backdrop-blur">
                <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">

                    <div className="flex items-center gap-2">
                        <img src="/spanda-mark.svg" alt="" className="h-7 w-7" />
                        <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-xl font-bold tracking-tight text-transparent">
                            Spanda
                        </span>
                        <span className="rounded-full border border-neutral-800 bg-neutral-900 px-2 py-0.5 font-mono text-sm">
                            {roomId}
                        </span>
                    </div>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 font-mono text-sm">
                        {roomId}
                    </span>

                    <div className="flex items-center gap-4">
                        <span className="hidden text-xs text-neutral-400 sm:inline">
                            {username}
                        </span>
                        <Link
                            href="/"
                            className="text-sm text-neutral-300 underline-offset-4 hover:underline"
                        >
                            Leave
                        </Link>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl space-y-5 px-4 py-6">
                <SyncProgress />
                <StartSystem />
                <StatusBar />

                {/* hero */}
                <Visualizer />

                {/* controls + queue side by side on desktop */}
                <div className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-5">
                        <AudioControls />
                        <SpatialControls />
                        <Uploader />
                    </div>
                    <Queue />
                </div>

                <UserGrid />
            </main>
        </div>
    );
}