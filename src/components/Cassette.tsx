import type { CSSProperties } from 'react'
import type { CassetteStyle } from '../types'

interface Props {
  title: string
  color: string
  group: string
  state: 'shelf' | 'playing'
  cstyle: CassetteStyle
  habit: boolean
  /** rendered width in px; the tape is designed at 228×142 and scaled */
  w: number
}

const BASE_W = 228
const BASE_H = 142

// colour helpers — derive shell shading from the shelf colour without relying on CSS color-mix
function parseHex(hex: string): [number, number, number] {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const n = parseInt(h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}
function mix(hex: string, t: number, target: [number, number, number]): string {
  const [r, g, b] = parseHex(hex)
  const [tr, tg, tb] = target
  return `rgb(${Math.round(r + (tr - r) * t)},${Math.round(g + (tg - g) * t)},${Math.round(b + (tb - b) * t)})`
}
const dark = (hex: string, t: number) => mix(hex, t, [0, 0, 0])
const light = (hex: string, t: number) => mix(hex, t, [255, 255, 255])

function Reel({ spinning, dur }: { spinning: boolean; dur: string }) {
  return (
    <div style={{ position: 'relative', width: 32, height: 32, borderRadius: '50%', background: '#E6E6E6', border: '2px solid #c9c9c9', flex: 'none' }}>
      <div style={{ position: 'absolute', inset: '13%', borderRadius: '50%', background: 'repeating-conic-gradient(#1E1E1E 0 12deg, transparent 12deg 60deg)', animation: spinning ? `cassd-spin ${dur} linear infinite` : 'none' }} />
      <div style={{ position: 'absolute', inset: '33%', borderRadius: '50%', background: '#1E1E1E', border: '2px solid #E6E6E6' }} />
    </div>
  )
}

function Screw({ style }: { style: CSSProperties }) {
  return (
    <span style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: 'radial-gradient(circle at 40% 34%, #3a3a3a, #0B0B0B)', border: '1px solid #000', zIndex: 5, ...style }}>
      <span style={{ position: 'absolute', left: '50%', top: '50%', width: 4.5, height: 1.3, background: 'rgba(255,255,255,0.22)', transform: 'translate(-50%,-50%)' }} />
      <span style={{ position: 'absolute', left: '50%', top: '50%', width: 1.3, height: 4.5, background: 'rgba(255,255,255,0.22)', transform: 'translate(-50%,-50%)' }} />
    </span>
  )
}

export default function Cassette({ title, color, group, state, cstyle, habit, w }: Props) {
  const playing = state === 'playing'
  const clean = cstyle === 'clean'
  const retro = cstyle === 'retro'

  return (
    <div style={{ position: 'relative', width: w, height: (w * BASE_H) / BASE_W }}>
      <div style={{ position: 'absolute', top: 0, left: 0, width: BASE_W, height: BASE_H, transform: `scale(${w / BASE_W})`, transformOrigin: 'top left' }}>
        {/* plastic shell — recolours per shelf, subtle extruded depth */}
        <div
          style={{
            position: 'absolute', inset: 0, borderRadius: 12, background: color,
            border: `2px solid ${dark(color, 0.58)}`,
            boxShadow: clean
              ? `0 3px 0 ${dark(color, 0.5)}, 0 8px 12px rgba(0,0,0,0.26)`
              : `inset 0 3px 0 ${light(color, 0.26)}, inset -4px 0 0 ${dark(color, 0.14)}, inset 0 -6px 0 ${dark(color, 0.24)}, 0 6px 0 ${dark(color, 0.5)}, 0 14px 20px rgba(0,0,0,0.35)`,
            overflow: 'hidden',
          }}
        >
          {/* injection-mold ribs on the lower body */}
          {!clean && (
            <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '52%', background: `repeating-linear-gradient(0deg, ${dark(color, 0.18)} 0 1px, transparent 1px 6px)`, opacity: 0.5, pointerEvents: 'none' }} />
          )}
          {/* retro glossy sheen */}
          {retro && (
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(115deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 26%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0) 70%)', pointerEvents: 'none' }} />
          )}

          {/* cream label */}
          <div style={{ position: 'absolute', left: 11, right: 11, top: 10, height: 54, background: retro ? '#FBF3DF' : '#F6F0E8', border: `1.5px solid ${dark(color, 0.42)}`, borderRadius: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.18)', padding: '6px 9px', overflow: 'hidden' }}>
            <div style={{ fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 12, color: '#16140F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{title}</div>
            <div style={{ height: 1.5, background: 'rgba(22,20,15,0.22)', margin: '5px 0 4px' }} />
            <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 8, letterSpacing: '0.1em', color: dark(color, 0.35), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {group ? `${group.toUpperCase()} · A` : 'SIDE A'}
            </div>
          </div>

          {/* black window: sprocket reels + tape + glass */}
          <div style={{ position: 'absolute', left: 46, right: 46, top: 60, height: 40, background: '#1E1E1E', borderRadius: 7, border: '1px solid #000', boxShadow: 'inset 0 2px 3px rgba(255,255,255,0.12), 0 2px 4px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 6px' }}>
            <div style={{ position: 'absolute', left: '24%', right: '24%', top: '50%', height: 8, transform: 'translateY(-50%)', background: '#3A2B22', borderTop: '1px solid rgba(255,255,255,0.08)', borderBottom: '1px solid rgba(0,0,0,0.4)' }} />
            <Reel spinning={playing} dur="1.5s" />
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', width: 34, height: 18, borderRadius: 3, background: 'linear-gradient(180deg, rgba(70,70,70,0.5), rgba(8,8,8,0.55))', border: '1px solid #000', boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.15)', zIndex: 3 }} />
            <Reel spinning={playing} dur="1.9s" />
          </div>

          {/* bottom mechanism piece */}
          <div style={{ position: 'absolute', left: '50%', bottom: 9, transform: 'translateX(-50%)', width: 92, height: 17, background: '#1E1E1E', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.1)' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#000' }} />
            <span style={{ width: 5, height: 5, background: '#000' }} />
            <span style={{ width: 5, height: 5, background: '#000' }} />
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#000' }} />
          </div>

          {/* corner screws */}
          {!clean && (
            <>
              <Screw style={{ top: 6, left: 7 }} />
              <Screw style={{ top: 6, right: 7 }} />
              <Screw style={{ bottom: 7, left: 7 }} />
              <Screw style={{ bottom: 7, right: 7 }} />
            </>
          )}

          {/* habit badge */}
          {habit && (
            <div style={{ position: 'absolute', top: 3, right: 22, width: 18, height: 18, borderRadius: '50%', background: '#FFD23F', border: '2px solid #16140F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#16140F', transform: 'rotate(8deg)', zIndex: 6 }}>
              ↻
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
