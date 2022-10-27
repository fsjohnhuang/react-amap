export function nextEventLoop(callback: () => void): void {
  window.requestAnimationFrame(callback)
}