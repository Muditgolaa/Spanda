import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import { nanoid } from "nanoid";
import "dotenv/config";
import { epochNow } from "./epochNow.js";
import {
  addClient,
  removeClient,
  getClients,
  reorderClient,
  addTrack,
  getTracks,
} from "./roomManager.js";

const PORT = process.env.PORT || 8080;

const app = express();
app.use(cors());

app.get("/health", (_req, res) => res.json({ ok: true }));

// Socket.IO needs a raw HTTP server to attach to.
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*" }, // dev only — we lock this to our Vercel URL before deploy
});

io.on("connection", (socket) => {
  // The frontend sends these in the connection handshake (see Step 2).
  const { roomId, username } = socket.handshake.query;

  // Refuse malformed connections.
  if (!roomId || !username) {
    socket.disconnect(true);
    return;
  }

  // Mint a unique identity for this connection.
  const clientId = nanoid();
  socket.data.clientId = clientId;
  socket.data.roomId = roomId;

  // Put this socket into the room and record it in memory.
  socket.join(roomId);
  addClient(roomId, { clientId, username, socketId: socket.id });
  console.log(`[+] ${username} (${clientId}) joined room ${roomId}`);

  // 1) Unicast: tell THIS client its own id.
  socket.emit("message", { type: "CONNECTED", clientId });

  // Answer NTP time requests. We stamp t1 (receive) and t2 (send) and echo t0.
  socket.on("message", (msg) => {
    if (msg?.type === "UPLOAD_COMPLETE") {
      addTrack(roomId, { audioId: msg.audioId, name: msg.name });
      io.to(roomId).emit("message", {
        type: "NEW_AUDIO_SOURCE",
        audioId: msg.audioId,
        name: msg.name,
      });
      return;
    }
    if (msg?.type === "NTP_REQUEST") {
      const t1 = epochNow(); // moment the server received the request
      socket.emit("message", {
        type: "NTP_RESPONSE",
        t0: msg.t0, // client's send time
        t1, // server receive time
        t2: epochNow(), // server send time
      });
    }
    if (msg?.type === "REORDER") {
      reorderClient(roomId, msg.clientId);
      io.to(roomId).emit("message", {
        type: "CLIENT_CHANGE",
        clients: getClients(roomId),
      });
      return;
    }
    // REUPLOAD: give the newcomer any tracks the room already has.
    for (const t of getTracks(roomId)) {
      socket.emit("message", {
        type: "NEW_AUDIO_SOURCE",
        audioId: t.audioId,
        name: t.name,
      });
    }
    // Play/Pause: stamp a future execute-time and fan out to the whole room.
    if (msg?.type === "PLAY" || msg?.type === "PAUSE") {
      io.to(roomId).emit("message", {
        type: "SCHEDULED_ACTION",
        action: msg, // the original PLAY/PAUSE, untouched
        serverTimeToExecute: epochNow() + 750, // 750ms lead time
      });
    }
  });

  // 2) Broadcast: tell EVERYONE in the room the new user list.
  io.to(roomId).emit("message", {
    type: "CLIENT_CHANGE",
    clients: getClients(roomId),
  });

  socket.on("disconnect", () => {
    removeClient(roomId, clientId);
    console.log(`[-] ${username} (${clientId}) left room ${roomId}`);
    io.to(roomId).emit("message", {
      type: "CLIENT_CHANGE",
      clients: getClients(roomId),
    });
  });
});

httpServer.listen(PORT, () => {
  console.log(`Spanda backend listening on http://localhost:${PORT}`);
});
