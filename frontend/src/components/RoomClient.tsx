"use client";

import Link from "next/link";
import { useRoomStore } from "@/store/roomStore";
import WebSocketManager from "@/components/WebSocketManager";
import SyncProgress from "@/components/SyncProgress";
import StartSystem from "@/components/StartSystem";
import AudioControls from "@/components/AudioControls";

export default function RoomClient({
    roomId,
    username,
}: {
    roomId: string;
    username: string;
}) {
    const clients = useRoomStore((s) => s.clients);
    const myClientId = useRoomStore((s) => s.myClientId);

    return (
        <main className="min-h-screen p-8 max-w-2xl mx-auto">
            {/* headless — mounts the socket */}
            <WebSocketManager roomId={roomId} username={username} />
            <div className="mb-6">
                <SyncProgress />
                <div className="mb-6 space-y-4">
                    <StartSystem />
                    <AudioControls />
                </div>
            </div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Room {roomId}</h1>
                    <p className="text-sm text-muted-foreground">You are {username}</p>
                </div>
                <Link href="/" className="text-sm underline">
                    Leave
                </Link>
            </div>

            <h2 className="text-lg font-semibold mb-2">
                In this room ({clients.length})
            </h2>
            <ul className="space-y-2">
                {clients.map((c) => (
                    <li key={c.clientId} className="rounded-md border p-3">
                        {c.username}
                        {c.clientId === myClientId && (
                            <span className="text-xs text-muted-foreground"> (you)</span>
                        )}
                    </li>
                ))}
            </ul>
        </main>
    );
}