import { create } from "zustand";

export type Client = {
  clientId: string;
  username: string;
  socketId?: string;
};

type RoomState = {
  roomId: string | null;
  username: string | null;
  myClientId: string | null; // the id assigned by server to me
  clients: Client[];         // everyone in room
  setRoom: (roomId: string, username: string) => void;
  setMyClientId: (id: string) => void;
  setClients: (clients: Client[]) => void;
  reset: () => void;
};

// A global store that lives outside React. The socket handler writes to it, and any component can read from it without prop-drilling.
export const useRoomStore = create<RoomState>((set) => ({
  roomId: null,
  username: null,
  myClientId: null,
  clients: [],
  setRoom: (roomId, username) => set({ roomId, username }),
  setMyClientId: (myClientId) => set({ myClientId }),
  setClients: (clients) => set({ clients }),
  reset: () =>
    set({ roomId: null, username: null, myClientId: null, clients: [] }),
}));