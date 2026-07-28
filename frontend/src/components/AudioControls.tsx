"use client";

import { useEffect, useState } from "react";
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { useQueueStore } from "@/store/queueStore";
import { emitMessage } from "@/lib/socketBus";
import { getPlaybackProgress } from "@/lib/playback";

function fmt(t: number) {
    if (!isFinite(t) || t < 0) t = 0;
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AudioControls() {
    const isStarted = useAudioStore((s) => s.isStarted);
    const isPlaying = useAudioStore((s) => s.isPlaying);
    const tracks = useAudioStore((s) => s.tracks);
    const currentTrackId = useAudioStore((s) => s.currentTrackId);
    const queue = useQueueStore((s) => s.queue);
    const shuffle = useQueueStore((s) => s.shuffle);
    const repeat = useQueueStore((s) => s.repeat);
    const toggleShuffle = useQueueStore((s) => s.toggleShuffle);
    const cycleRepeat = useQueueStore((s) => s.cycleRepeat);

    const [progress, setProgress] = useState<{ elapsed: number; duration: number } | null>(null);
    useEffect(() => {
        const id = setInterval(() => setProgress(getPlaybackProgress()), 250);
        return () => clearInterval(id);
    }, []);

    if (!isStarted) return null;

    const current = tracks.find((t) => t.id === currentTrackId);
    const elapsed = progress?.elapsed ?? 0;
    const duration = progress?.duration ?? current?.buffer.duration ?? 0;
    const pct = duration ? Math.min(100, (elapsed / duration) * 100) : 0;

    function playPause() {
        if (isPlaying) return emitMessage({ type: "PAUSE" });
        const id = currentTrackId ?? queue[0] ?? tracks[0]?.id;
        if (id) emitMessage({ type: "PLAY", audioId: id, trackTimeSeconds: 0 });
    }
    function neighbor(dir: 1 | -1) {
        const list = queue.length ? queue : tracks.map((t) => t.id);
        if (!list.length) return;
        const idx = currentTrackId ? list.indexOf(currentTrackId) : -1;
        const nextIdx = idx === -1 ? 0 : (idx + dir + list.length) % list.length;
        emitMessage({ type: "PLAY", audioId: list[nextIdx], trackTimeSeconds: 0 });
    }

    function seek(e: React.MouseEvent<HTMLDivElement>) {
        const id = currentTrackId ?? queue[0] ?? tracks[0]?.id;
        if (!id || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
        emitMessage({ type: "PLAY", audioId: id, trackTimeSeconds: frac * duration });
    }

    const icon = "flex h-9 w-9 items-center justify-center rounded-full text-neutral-300 transition hover:bg-white/10";

    return (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <div className="flex items-center justify-center gap-2">
                <button onClick={toggleShuffle} className={`${icon} ${shuffle ? "text-cyan-400" : ""}`} title="Shuffle">
                    <Shuffle className="h-4 w-4" />
                </button>
                <button onClick={() => neighbor(-1)} className={icon} title="Previous">
                    <SkipBack className="h-5 w-5" />
                </button>
                <button
                    onClick={playPause}
                    disabled={tracks.length === 0}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 text-white shadow-lg shadow-fuchsia-500/30 transition hover:brightness-110 disabled:opacity-40"
                >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 translate-x-0.5" />}
                </button>
                <button onClick={() => neighbor(1)} className={icon} title="Next">
                    <SkipForward className="h-5 w-5" />
                </button>
                <button onClick={cycleRepeat} className={`${icon} ${repeat !== "off" ? "text-cyan-400" : ""}`} title={`Repeat: ${repeat}`}>
                    {repeat === "one" ? <Repeat1 className="h-4 w-4" /> : <Repeat className="h-4 w-4" />}
                </button>
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
                <span className="tabular-nums">{fmt(elapsed)}</span>
                <div onClick={seek} className="relative h-2 flex-1 cursor-pointer overflow-hidden rounded-full bg-white/10">
                    <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-fuchsia-500 to-violet-500" style={{ width: `${pct}%` }} />
                </div>
                <span className="tabular-nums">{fmt(duration)}</span>
            </div>

            <p className="mt-2 truncate text-center text-sm text-neutral-300">
                {current ? current.name : "No track selected"}
            </p>
        </div>
    );
}