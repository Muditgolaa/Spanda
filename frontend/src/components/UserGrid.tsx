"use client";

import { useRoomStore } from "@/store/roomStore";
import { emitMessage } from "@/lib/socketBus";

const SIZE = 320; // px on screen for the 100x100 virtual grid

export default function UserGrid() {
  const clients = useRoomStore((s) => s.clients);
  const myClientId = useRoomStore((s) => s.myClientId);

  return (
    <div className="rounded-md border p-4">
      <div
        className="relative mx-auto rounded-full bg-muted/30"
        style={{ width: SIZE, height: SIZE }}
      >
        {/* center of the room */}
        <div
          className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted-foreground/50"
          style={{ left: SIZE / 2, top: SIZE / 2 }}
        />

        {clients.map((c) => {
          const px = ((c.x ?? 50) / 100) * SIZE; // grid coord → screen px
          const py = ((c.y ?? 50) / 100) * SIZE;
          const isMe = c.clientId === myClientId;
          return (
            <button
              key={c.clientId}
              onClick={() =>
                emitMessage({ type: "REORDER", clientId: c.clientId })
              }
              className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 focus:outline-none"
              style={{ left: px, top: py }}
              title="Click to reseat"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-medium ${
                  isMe
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {c.username.slice(0, 2).toUpperCase()}
              </span>
              <span className="text-xs text-muted-foreground">
                {c.username}
                {isMe ? " (you)" : ""}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        {clients.length} in room · click a user to reseat
      </p>
    </div>
  );
}