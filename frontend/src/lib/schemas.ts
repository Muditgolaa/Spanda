// The single source of truth for every message on the wire. One Socket.IO event ("message") carries all of them; `type` is the discriminator.
import { z } from "zod";

// A client in a room (with circle position).
export const ClientSchema = z.object({
  clientId: z.string(),
  username: z.string(),
  socketId: z.string().optional(),
  x: z.number().optional(),
  y: z.number().optional(),
});
export type Client = z.infer<typeof ClientSchema>;

// ── Server → ONE socket (unicast) ────────────────────────────────
export const ConnectedSchema = z.object({
  type: z.literal("CONNECTED"),
  clientId: z.string(),
});

export const NtpResponseSchema = z.object({
  type: z.literal("NTP_RESPONSE"),
  t0: z.number(),
  t1: z.number(),
  t2: z.number(),
});

// ── Server → whole room (broadcast) ──────────────────────────────
export const ClientChangeSchema = z.object({
  type: z.literal("CLIENT_CHANGE"),
  clients: z.array(ClientSchema),
});

// ── Client → server (requests) ───────────────────────────────────
export const NtpRequestSchema = z.object({
  type: z.literal("NTP_REQUEST"),
  t0: z.number(),
});
export const PlaySchema = z.object({
  type: z.literal("PLAY"),
  audioId: z.string(),
  trackTimeSeconds: z.number(),
});
export const PauseSchema = z.object({
  type: z.literal("PAUSE"),
});
export const ReorderSchema = z.object({
  type: z.literal("REORDER"),
  clientId: z.string(),
});


// ── Server → room: scheduled action wrapper ──────────────────────
export const ScheduledActionSchema = z.object({
    type: z.literal("SCHEDULED_ACTION"),
    action: z.discriminatedUnion("type", [PlaySchema, PauseSchema]),
    serverTimeToExecute: z.number(),
});


// Client → server: I finished uploading a file to Cloudinary.
export const UploadCompleteSchema = z.object({
    type: z.literal("UPLOAD_COMPLETE"),
    audioId: z.string(),
    name: z.string(),
});

// Server → room: a new shared track exists at this URL.
export const NewAudioSourceSchema = z.object({
    type: z.literal("NEW_AUDIO_SOURCE"),
    audioId: z.string(),
    name: z.string(),
});

// Everything the CLIENT can SENT & RECEIVE.
export const WSRequest = z.discriminatedUnion("type", [
  NtpRequestSchema,
  PlaySchema,
  PauseSchema,
  ReorderSchema,
  UploadCompleteSchema, 
]);

export const WSResponse = z.discriminatedUnion("type", [
  ConnectedSchema,
  ClientChangeSchema,
  NtpResponseSchema,
  ScheduledActionSchema,
  NewAudioSourceSchema, 
]);

export type WSRequest = z.infer<typeof WSRequest>;
export type WSResponse = z.infer<typeof WSResponse>;