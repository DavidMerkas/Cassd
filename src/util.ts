/** Black or cream ink, whichever reads on the given hex background. */
export function inkOn(hex: string): string {
  const c = hex.replace('#', '')
  const r = parseInt(c.substr(0, 2), 16)
  const g = parseInt(c.substr(2, 2), 16)
  const b = parseInt(c.substr(4, 2), 16)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#16140F' : '#F5F1E8'
}

export function fmt(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return (m < 10 ? '0' + m : '' + m) + ':' + (s < 10 ? '0' + s : '' + s)
}
