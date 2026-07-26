// for understanding
// A monotonic, sub-millisecond clock. performance.timeOrigin is the wall-clock . time (ms) when the process started; performance.now() is ms elapsed since then. Added together they give "epoch ms" that never jumps backward when the OS . adjusts the system clock. Both frontend and backend use the SAME formula so . their clocks are comparable — that's what makes NTP sync work later.

export function epochNow() {
    return performance.timeOrigin + performance.now();
}