// The single source of truth for every message on the wire. One Socket.IO event ("message") carries all of them; the `type` field is the discriminator. The client validates every inbound frame against these schemas.
import { z } from "zod";

// A client in a room.
export const ClientSchema = z.object({
  clientId: z.string(),
  username: z.string(),
  socketId: z.string().optional(),
});
export type Client = z.infer<typeof ClientSchema>;

// Server → ONE socket (unicast) 
export const ConnectedSchema = z.object({
  type: z.literal("CONNECTED"),
  clientId: z.string(),
});

// Server → whole room (broadcast) 
export const ClientChangeSchema = z.object({
  type: z.literal("CLIENT_CHANGE"),
  clients: z.array(ClientSchema),
});

// Everything the CLIENT can RECEIVE, unioned by the `type` discriminator. We add NTP_RESPONSE, SCHEDULED_ACTION, etc. to this list in later steps.
export const WSResponse = z.discriminatedUnion("type", [
  ConnectedSchema,
  ClientChangeSchema,
]);
export type WSResponse = z.infer<typeof WSResponse>;