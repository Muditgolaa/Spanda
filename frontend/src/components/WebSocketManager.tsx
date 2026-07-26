"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useRoomStore } from "@/store/roomStore";

// Renders nothing. Its whole job is to own the socket connection and funnel inbound messages into the Zustand store.
export default function WebSocketManager({
  roomId,
  username,
}: {
  roomId: string;
  username: string;
}) {
  const socketRef = useRef<Socket | null>(null);
  const setRoom = useRoomStore((s) => s.setRoom);
  const setMyClientId = useRoomStore((s) => s.setMyClientId);
  const setClients = useRoomStore((s) => s.setClients);

  useEffect(() => {
    setRoom(roomId, username);

    // Connect, passing roomId + username in the handshake query - exactly what the backend reads in socket.handshake.query.
    const socket = io(process.env.NEXT_PUBLIC_BACKEND_URL!, {
      query: { roomId, username },
    });
    socketRef.current = socket;

    // ONE event, switch on msg.type — our tiny typed protocol.
    socket.on("message", (msg: { type: string; [key: string]: unknown }) => {
      switch (msg.type) {
        case "CONNECTED":
          setMyClientId(msg.clientId as string);
          break;
        case "CLIENT_CHANGE":
          setClients(msg.clients as never);
          break;
        default:
          break;
      }
    });

    // Clean up on unmount so we don't leak sockets.
    return () => {
      socket.disconnect();
    };
  }, [roomId, username, setRoom, setMyClientId, setClients]);

  return null;
}