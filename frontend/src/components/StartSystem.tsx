"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAudioStore } from "@/store/audioStore";
import { useSyncStore } from "@/store/syncStore";
import { buildAudioGraph, loadTrack, BUNDLED_TRACKS } from "@/lib/audio";

export default function StartSystem() {
    const isSynced = useSyncStore((s) => s.isSynced);
    const isStarted = useAudioStore((s) => s.isStarted);
    const setGraph = useAudioStore((s) => s.setGraph);
    const addTrack = useAudioStore((s) => s.addTrack);
    const setCurrentTrack = useAudioStore((s) => s.setCurrentTrack);
    const setStarted = useAudioStore((s) => s.setStarted);
    const [loading, setLoading] = useState(false);

    async function start() {
        setLoading(true);
        try {
            // iOS: route to the playback audio session if the API exists.
            const nav = navigator as unknown as { audioSession?: { type: string } };
            if (nav.audioSession) nav.audioSession.type = "playback";

            const { ctx, masterGain, analyser } = buildAudioGraph();
            await ctx.resume(); // ← the autoplay unlock; must run inside this click
            setGraph(ctx, masterGain, analyser);

            // Decode all bundled tracks in parallel.
            const decoded = await Promise.all(
                BUNDLED_TRACKS.map((m) => loadTrack(ctx, m)),
            );
            decoded.forEach(addTrack);
            // Also decode any uploaded tracks that arrived before we hit Start.
            const { sources } = useAudioStore.getState();
            await Promise.all(
                sources.map((s) =>
                    loadTrack(ctx, { id: s.audioId, name: s.name, url: s.audioId })
                        .then(addTrack)
                        .catch((err) => console.error("Decode failed:", err)),
                ),
            );
            if (decoded[0]) setCurrentTrack(decoded[0].id);

            // Keep the screen awake during a session (ignore if unsupported).
            try {
                const n = navigator as unknown as {
                    wakeLock?: { request: (t: "screen") => Promise<unknown> };
                };
                await n.wakeLock?.request("screen");
            } catch {
                /* wake lock is best-effort */
            }

            setStarted(true);
        } finally {
            setLoading(false);
        }
    }

    if (isStarted) return null;

    return (
        <Button className="w-full" disabled={!isSynced || loading} onClick={start}>
            {loading ? "Starting…" : isSynced ? "Start System" : "Waiting for sync…"}
        </Button>
    );
}