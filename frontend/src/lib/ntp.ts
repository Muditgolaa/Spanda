// The NTP offset/round-trip math, plus averaging with outlier rejection.
export type NtpSample = { offset: number; rtt: number };

// From the four timestamps, compute this sample's clock offset + round-trip delay.
//   offset = how far my clock is ahead of (or behind) the server's
//   rtt    = network round trip, minus the server's think-time
export function computeSample(
  t0: number, // c send
  t1: number, // s receive
  t2: number, // s send
  t3: number, // c receive
): NtpSample {
  const offset = (t1 - t0 + (t2 - t3)) / 2;
  const rtt = t3 - t0 - (t2 - t1);
  return { offset, rtt };
}

// Keep only the best (lowest-rtt) half of samples, then average.
function bestHalf(samples: NtpSample[]): NtpSample[] {
  const sorted = [...samples].sort((a, b) => a.rtt - b.rtt);
  const keep = Math.max(1, Math.floor(sorted.length / 2));
  return sorted.slice(0, keep);
}

// The averaged offset of the best half — our shared-clock estimate.
export function estimateOffset(samples: NtpSample[]): number {
  const best = bestHalf(samples);
  return best.reduce((acc, s) => acc + s.offset, 0) / best.length;
}

// Averaged rtt of the best half — a nice health number for the UI.
export function estimateRtt(samples: NtpSample[]): number {
  const best = bestHalf(samples);
  return best.reduce((acc, s) => acc + s.rtt, 0) / best.length;
}