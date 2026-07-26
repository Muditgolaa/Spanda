// Web Audio helpers: build the graph once, and fetch+decode tracks into buffers.
export type Track = { id: string; name: string; buffer: AudioBuffer };

export const BUNDLED_TRACKS = [
  { id: "track-1", name: "Track 1", url: "/tracks/track1.mp3" },
  { id: "track-2", name: "Track 2", url: "/tracks/track2.mp3" },
];

// Build the persistent part of the graph: masterGain → analyser → speakers. A fresh AudioBufferSourceNode is created per play and connected to masterGain.
export function buildAudioGraph() {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  const ctx = new AudioCtx();

  const masterGain = ctx.createGain();
  masterGain.gain.value = 1; // spatial audio modulates this later

  const analyser = ctx.createAnalyser();
  analyser.fftSize = 2048; // feeds the visualizer later

  masterGain.connect(analyser);
  analyser.connect(ctx.destination);

  return { ctx, masterGain, analyser };
}

// Fetch a file and turn the compressed MP3 into a raw, schedulable AudioBuffer.
export async function loadTrack(
  ctx: AudioContext,
  meta: { id: string; name: string; url: string },
): Promise<Track> {
  const res = await fetch(meta.url);
  const arrayBuffer = await res.arrayBuffer();
  const buffer = await ctx.decodeAudioData(arrayBuffer);
  return { id: meta.id, name: meta.name, buffer };
}