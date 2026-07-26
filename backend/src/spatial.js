// Moves a virtual sound source around the room and broadcasts per-client gains.
import { getClients } from "./roomManager.js";

const CENTER = 50; // center of the 100x100 grid
const ORBIT_RADIUS = 40; // how far the source swings from center

const timers = new Map(); // roomId -> intervalId

// Distance-based falloff: closer = louder, with a floor so no one goes silent.
function computeGains(roomId, sx, sy, rampTime) {
  const gains = {};
  for (const c of getClients(roomId)) {
    const dx = (c.x ?? CENTER) - sx;
    const dy = (c.y ?? CENTER) - sy;
    const distSq = dx * dx + dy * dy;
    const gain = Math.max(0.15, 1 - 0.0005 * distSq);
    gains[c.clientId] = { gain, rampTime };
  }
  return gains;
}

function broadcast(io, roomId, gains) {
  io.to(roomId).emit("message", { type: "SPATIAL_GAINS", gains });
}

function clear(roomId) {
  const id = timers.get(roomId);
  if (id) {
    clearInterval(id);
    timers.delete(roomId);
  }
}

export function startCircle(io, roomId) {
  clear(roomId);
  let angle = 0;
  const tickMs = 50;
  const id = setInterval(() => {
    angle += 0.05;
    const sx = CENTER + ORBIT_RADIUS * Math.cos(angle);
    const sy = CENTER + ORBIT_RADIUS * Math.sin(angle);
    broadcast(io, roomId, computeGains(roomId, sx, sy, tickMs / 1000));
  }, tickMs);
  timers.set(roomId, id);
}

export function startSpiral(io, roomId) {
  clear(roomId);
  let t = 0;
  const tickMs = 33; // ~30fps
  const id = setInterval(() => {
    t += 0.06;
    // figure-eight (lemniscate of Gerono)
    const sx = CENTER + ORBIT_RADIUS * Math.cos(t);
    const sy = CENTER + ORBIT_RADIUS * Math.sin(t) * Math.cos(t);
    broadcast(io, roomId, computeGains(roomId, sx, sy, tickMs / 1000));
  }, tickMs);
  timers.set(roomId, id);
}

export function stopSpatial(io, roomId) {
  clear(roomId);
  // neutral gains — everyone back to full volume
  const gains = {};
  for (const c of getClients(roomId)) {
    gains[c.clientId] = { gain: 1, rampTime: 0.2 };
  }
  broadcast(io, roomId, gains);
}

export function setManualSource(io, roomId, x, y) {
  clear(roomId); // manual overrides any orbit
  broadcast(io, roomId, computeGains(roomId, x, y, 0.15));
}

export function cleanupRoom(roomId) {
  clear(roomId);
}