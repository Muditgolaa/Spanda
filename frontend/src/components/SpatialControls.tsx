"use client";

import { useState, ReactNode } from "react";
import { RotateCw, Infinity as InfinityIcon, Square } from "lucide-react";
import { useAudioStore } from "@/store/audioStore";
import { emitMessage } from "@/lib/socketBus";

type Mode = "rotation" | "infinity" | null;

function Effect({
  active,
  icon,
  label,
  desc,
  onStart,
}: {
  active: boolean;
  icon: ReactNode;
  label: string;
  desc: string;
  onStart: () => void;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 transition ${
        active ? "border-fuchsia-500/40 bg-fuchsia-500/10" : "border-white/10 bg-white/[0.03]"
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-fuchsia-500/20 to-violet-500/20 text-fuchsia-300">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-neutral-200">{label}</p>
        <p className="truncate text-xs text-neutral-500">{desc}</p>
      </div>
      <button
        onClick={onStart}
        disabled={active}
        className="rounded-full bg-gradient-to-br from-fuchsia-500 to-violet-600 px-3 py-1 text-xs font-medium text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {active ? "Running" : "Start"}
      </button>
    </div>
  );
}

export default function SpatialControls() {
  const isStarted = useAudioStore((s) => s.isStarted);
  const [active, setActive] = useState<Mode>(null);
  if (!isStarted) return null;

  function start(mode: Mode, type: string) {
    setActive(mode);
    emitMessage({ type });
  }
  function stop() {
    setActive(null);
    emitMessage({ type: "STOP_SPATIAL_AUDIO" });
  }

  return (
    <div className="space-y-2">
      <Effect
        active={active === "rotation"}
        icon={<RotateCw className="h-4 w-4" />}
        label="Rotation"
        desc="Orbit the sound in a circle"
        onStart={() => start("rotation", "START_SPATIAL_AUDIO")}
      />
      <Effect
        active={active === "infinity"}
        icon={<InfinityIcon className="h-4 w-4" />}
        label="Infinity"
        desc="Figure-eight sweep"
        onStart={() => start("infinity", "START_SPIRAL_SPATIAL_AUDIO")}
      />
      {active && (
        <button
          onClick={stop}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] py-2 text-xs text-neutral-300 transition hover:bg-white/10"
        >
          <Square className="h-3 w-3" /> Stop effects
        </button>
      )}
    </div>
  );
}