"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRoomStore } from "@/store/roomStore";
import { useAudioStore } from "@/store/audioStore";
import { emitMessage } from "@/lib/socketBus";

export default function Uploader() {
  const roomId = useRoomStore((s) => s.roomId);
  const isStarted = useAudioStore((s) => s.isStarted);
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  if (!isStarted) return null;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !roomId) return;
    setBusy(true);
    try {
      const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

      const form = new FormData();
      form.append("file", file);
      form.append("upload_preset", preset);
      form.append("folder", `spanda/room-${roomId}`); // scoped per room

      // Audio is uploaded via the "auto"/video resource type on Cloudinary.
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/auto/upload`,
        { method: "POST", body: form },
      );
      const data = await res.json();
      if (!data.secure_url) {
        throw new Error(data?.error?.message || "Upload failed");
      }

      // The Cloudinary URL becomes the shared audioId.
      emitMessage({
        type: "UPLOAD_COMPLETE",
        audioId: data.secure_url,
        name: file.name,
      });
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + (err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="audio/*"
        hidden
        onChange={handleFile}
      />
      <Button
        variant="outline"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
      >
        {busy ? "Uploading…" : "Upload track"}
      </Button>
    </div>
  );
}