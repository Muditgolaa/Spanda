// Identical formula to the backend. A monotonic epoch-ms clock that never jumps backward. We'll use this for NTP sync 
export function epochNow() {
  return performance.timeOrigin + performance.now();
}