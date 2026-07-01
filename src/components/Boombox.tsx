import type { CSSProperties, PointerEvent, Ref } from 'react'
import type { Task, CassetteStyle } from '../types'
import type { BoomboxSkin } from '../skins'
import { fmt } from '../util'
import Cassette from './Cassette'

interface Props {
  dockRef: Ref<HTMLDivElement>
  bb: BoomboxSkin
  playing: Task | null
  showDockedCassette: boolean
  cassetteStyle: CassetteStyle
  elapsed: number
  overSlot: boolean
  startPull: (e: PointerEvent) => void
  openEject: () => void
}

function Speaker({ bb }: { bb: BoomboxSkin }) {
  return (
    <div
      style={{
        flex: 'none', width: 60, height: 60, borderRadius: '50%',
        background: `radial-gradient(circle at 50% 45%, ${bb.metal} 0 18%, #0D0C09 19% 28%, ${bb.cone} 29% 45%, #0D0C09 46% 54%, ${bb.cone} 55% 77%, #0D0C09 78%)`,
        border: '3px solid #0D0C09',
        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.6)',
      }}
    />
  )
}

const eqBar = (color: string, dur: string, delay: string): CSSProperties => ({
  width: 3, height: 12, background: color, transformOrigin: 'bottom',
  animation: `cassd-eq ${dur} ease-in-out infinite ${delay}`,
})

export default function Boombox({
  dockRef, bb, playing, showDockedCassette, cassetteStyle,
  elapsed, overSlot, startPull, openEject,
}: Props) {
  return (
    <div ref={dockRef} style={{ flex: 'none', position: 'relative', background: '#16140F', borderTop: '3px solid #0D0C09', padding: 16, overflow: 'visible' }}>
      {/* cassette seated in the top slot */}
      {showDockedCassette && playing && (
        <div style={{ height: 58 }}>
          <div
            onPointerDown={startPull}
            style={{
              position: 'absolute', left: '50%', top: 2, transform: 'translateX(-50%)',
              zIndex: 2, cursor: 'grab', touchAction: 'none', userSelect: 'none',
              filter: 'drop-shadow(0 6px 10px rgba(0,0,0,0.45))',
              animation: 'cassd-pop .32s cubic-bezier(.22,1.4,.4,1)',
            }}
          >
            <div style={{ position: 'absolute', left: '50%', top: -17, transform: 'translateX(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'rgba(245,241,232,0.6)', pointerEvents: 'none' }}>
              <span style={{ fontSize: 12, lineHeight: 1, animation: 'cassd-bob 1.8s ease-in-out infinite' }}>⌃</span>
              <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>PULL TO EJECT</span>
            </div>
            <Cassette title={playing.name} color={playing.color} group={playing.group} state="playing" cstyle={cassetteStyle} habit={playing.habit} w={196} />
          </div>
        </div>
      )}

      {/* boombox body */}
      <div style={{ position: 'relative', zIndex: 3, background: bb.body, border: '3px solid #0D0C09', borderRadius: 15, overflow: 'hidden', boxShadow: '0 6px 16px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.14)' }}>
        {/* top trim deck with mouth slot + knobs */}
        <div style={{ position: 'relative', background: bb.trim, height: 26, borderBottom: '2px solid #0D0C09', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 14px' }}>
          <div style={{ display: 'flex', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0D0C09' }} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0D0C09' }} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0D0C09' }} />
          </div>
          <div style={{ position: 'absolute', left: '50%', top: 7, transform: 'translateX(-50%)', width: 150, height: 9, background: 'linear-gradient(180deg,#000,#241f18)', borderRadius: 5, boxShadow: 'inset 0 3px 4px rgba(0,0,0,0.95), 0 1px 0 rgba(255,255,255,0.12)' }} />
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: bb.knob, border: '2px solid #0D0C09' }} />
        </div>

        {/* main row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px 12px' }}>
          <Speaker bb={bb} />

          {/* center: LCD screen + eject */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <div style={{ position: 'relative', height: 70, borderRadius: 8, background: bb.screen, border: '3px solid #0D0C09', overflow: 'hidden', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.85)' }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${bb.glow}, transparent 72%)`, animation: 'cassd-glow 3s ease-in-out infinite', opacity: playing ? 1 : 0.35, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, height: 22, background: 'linear-gradient(180deg, rgba(255,255,255,0.09), transparent)', animation: 'cassd-scan 4.5s linear infinite', pointerEvents: 'none' }} />

              {playing ? (
                <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '8px 11px', gap: 5 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 8, letterSpacing: '0.14em', color: '#7CFF5A', opacity: 0.85 }}>▶ SIDE A</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 8, letterSpacing: '0.1em', color: '#FFC24B' }}>{playing.group}</span>
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 12.5, color: '#86F06B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 0 6px rgba(124,255,90,0.5)' }}>
                    {playing.name}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 2, height: 12 }}>
                      <span style={eqBar('#7CFF5A', '0.8s', '0s')} />
                      <span style={eqBar('#FFC24B', '0.66s', '.15s')} />
                      <span style={eqBar('#7CFF5A', '0.9s', '.05s')} />
                      <span style={eqBar('#FF7A5A', '0.7s', '.22s')} />
                      <span style={eqBar('#FFC24B', '0.6s', '.1s')} />
                    </div>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 14, color: '#FFC24B', letterSpacing: '0.04em', fontVariantNumeric: 'tabular-nums', textShadow: '0 0 6px rgba(255,194,75,0.5)' }}>
                      {fmt(elapsed)}
                    </span>
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 13, letterSpacing: '0.12em', color: overSlot ? '#FFC24B' : 'rgba(124,255,90,0.75)', animation: overSlot ? 'none' : 'cassd-bob 2.4s ease-in-out infinite' }}>
                    {overSlot ? 'DROP IT' : 'NO TAPE'}
                  </span>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 8.5, letterSpacing: '0.08em', color: 'rgba(124,255,90,0.5)' }}>
                    {overSlot ? 'release to load' : 'insert one on top ⌃'}
                  </span>
                </div>
              )}
            </div>

            {playing && (
              <button
                onClick={openEject}
                className="press"
                style={{
                  border: '2.5px solid #0D0C09', background: 'linear-gradient(180deg,#FF6E3C,#FF5C28)',
                  color: '#16140F', fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '0.06em',
                  padding: '8px 0', borderRadius: 9, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                  '--sh': '0 4px 0 #0D0C09, inset 0 1px 0 rgba(255,255,255,0.35)',
                  '--sh-a': '0 1px 0 #0D0C09, inset 0 1px 0 rgba(255,255,255,0.35)',
                } as CSSProperties}
              >
                <span style={{ fontSize: 14, lineHeight: 0 }}>⏏</span> EJECT
              </button>
            )}
          </div>

          <Speaker bb={bb} />
        </div>

        {/* base strip */}
        <div style={{ height: 9, background: bb.base, borderTop: '2px solid #0D0C09' }} />
      </div>
    </div>
  )
}
