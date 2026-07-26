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

export default function RoomClient({
  roomId,
  username,
}: {
  roomId: string;
  username: string;
}) {
  return (
    <main className="mx-auto min-h-screen max-w-2xl space-y-6 p-8">
      {/* headless — mounts the socket */}
      <WebSocketManager roomId={roomId} username={username} />

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Room {roomId}</h1>
          <p className="text-sm text-muted-foreground">You are {username}</p>
        </div>
        <Link href="/" className="text-sm underline">
          Leave
        </Link>
      </div>

      {/* sync + audio */}
      <SyncProgress />
      <div className="space-y-4">
        <StartSystem />
        <StatusBar />
        <Visualizer />
        <AudioControls />
        <Uploader />
        <Queue />
      </div>

      {/* who's in the room */}
      <UserGrid />
    </main>
  );
}