// In-memory rooms. Now also maintains an ordered seating list and positions each client on a circle in a 100x100 virtual grid.

const rooms = new Map(); // roomId -> { clients: Map<clientId, client>, order: string[] }

const GRID = 100;
const CENTER = GRID / 2; // 50,50
const RADIUS = 25;

// Lay the clients out evenly on a circle, in `order`.
function positionClients(room) {
  const n = Math.max(1, room.order.length);
  room.order.forEach((clientId, i) => {
    const client = room.clients.get(clientId);
    if (!client) return;
    const angle = (2 * Math.PI * i) / n - Math.PI / 2; // first seat at the top
    client.x = CENTER + RADIUS * Math.cos(angle);
    client.y = CENTER + RADIUS * Math.sin(angle);
  });
}

export function addClient(roomId, client) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { clients: new Map(), order: [], tracks: [] });
  }
  const room = rooms.get(roomId);
  room.clients.set(client.clientId, client);
  room.order.push(client.clientId);
  positionClients(room);
}

export function removeClient(roomId, clientId) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.clients.delete(clientId);
  room.order = room.order.filter((id) => id !== clientId);
  if (room.clients.size === 0) {
    rooms.delete(roomId); // cleanup empty room
  } else {
    positionClients(room); // re-circle the survivors
  }
}

// Move a client to the front of the seating order, then re-circle.
export function reorderClient(roomId, clientId) {
  const room = rooms.get(roomId);
  if (!room || !room.clients.has(clientId)) return;
  room.order = [clientId, ...room.order.filter((id) => id !== clientId)];
  positionClients(room);
}

// Clients in seating order, each carrying its x,y.
export function getClients(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return room.order.map((id) => room.clients.get(id));
}

// A room's uploaded tracks (deduped by audioId).
export function addTrack(roomId, track) {
  const room = rooms.get(roomId);
  if (!room) return;
  if (!room.tracks.some((t) => t.audioId === track.audioId)) {
    room.tracks.push(track);
  }
}

export function getTracks(roomId) {
  const room = rooms.get(roomId);
  return room ? room.tracks : [];
}