"use client";

import { useRef, useState } from "react";
import { Plus } from "lucide-react";
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
      form.append("folder", `spanda/room-${roomId}`);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloud}/auto/upload`,
        { method: "POST", body: form },
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error(data?.error?.message || "Upload failed");
      emitMessage({ type: "UPLOAD_COMPLETE", audioId: data.secure_url, name: file.name });
    } catch (err) {
      console.error(err);
      alert("Upload failed: " + (err as Error).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <>
      <input ref={inputRef} type="file" accept="audio/*" hidden onChange={handleFile} />
      <button
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-left transition hover:bg-white/10 disabled:opacity-50"
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white">
          <Plus className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-medium text-neutral-200">
            {busy ? "Uploading…" : "Upload audio"}
          </p>
          <p className="text-xs text-neutral-500">Add music to the room</p>
        </div>
      </button>
    </>
  );
}