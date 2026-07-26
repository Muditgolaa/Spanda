// A tiny module holder so non-socket components (like AudioControls) can emit without prop-drilling the socket around.
import type { Socket } from "socket.io-client";

let socket: Socket | null = null;

export function setSocket(s: Socket | null) {
  socket = s;
}

export function emitMessage(msg: unknown) {
  socket?.emit("message", msg);
}