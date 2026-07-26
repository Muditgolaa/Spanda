// The entire "database" of the app: an in-memory Map of rooms.
// It vanishes when the server restarts 

const rooms = new Map(); // roomId -> { clients: Map<clientId, client> }

// Add a client to a room, creating the room on first join.
export function addClient(roomId, client) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, { clients: new Map() });
  }
  rooms.get(roomId).clients.set(client.clientId, client);
}

// Remove a client; if that empties the room, delete the room entirely (cleanup).
export function removeClient(roomId, clientId) {
  const room = rooms.get(roomId);
  if (!room) return;
  room.clients.delete(clientId);
  if (room.clients.size === 0) {
    rooms.delete(roomId);
  }
}

// The current list of clients in a room, as a plain array (safe to send over the wire).
export function getClients(roomId) {
  const room = rooms.get(roomId);
  return room ? Array.from(room.clients.values()) : [];
}