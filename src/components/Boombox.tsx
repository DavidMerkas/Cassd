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
  dragging: boolean
  startPull: (e: PointerEvent) => void
  openEject: () => void
}

/* deck geometry: the cassette is designed 228×142 and rendered at 196 wide */
const CASS_W = 196
const INSERT_DEPTH = 64 // px of the (196×~122) tape hidden inside the deck when seated
const SLOT_W = 212
/* slot mouth midline, measured up from the top of the boombox body:
   3px body border + 6px mouth top offset + 7px half mouth height */
const SLOT_LINE = 16
const ZONE_H = 64 // constant headroom above the body — never changes, so the UI above never shifts

function Speaker({ bb }: { bb: BoomboxSkin }) {
  return (
    <div
      style={{
        position: 'relative', flex: 'none', width: 60, height: 60, borderRadius: '50%',
        background: `radial-gradient(circle at 50% 45%, ${bb.metal} 0 18%, #0D0C09 19% 28%, ${bb.cone} 29% 45%, #0D0C09 46% 54%, ${bb.cone} 55% 77%, #0D0C09 78%)`,
        border: '3px solid #0D0C09',
        boxShadow: 'inset 0 4px 8px rgba(0,0,0,0.6), inset 0 -2px 4px rgba(255,255,255,0.12), 0 3px 0 rgba(13,12,9,0.6)',
      }}
    >
      {/* specular highlight so the cone reads as dished-in */}
      <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 32% 24%, rgba(255,255,255,0.28), rgba(255,255,255,0) 42%)', pointerEvents: 'none' }} />
    </div>
  )
}

const eqBar = (color: string, dur: string, delay: string): CSSProperties => ({
  width: 3, height: 12, background: color, transformOrigin: 'bottom',
  animation: `cassd-eq ${dur} ease-in-out infinite ${delay}`,
})

export default function Boombox({
  dockRef, bb, playing, showDockedCassette, cassetteStyle,
  elapsed, overSlot, dragging, startPull, openEject,
}: Props) {
  const dropReady = dragging && !playing
  return (
    <div ref={dockRef} style={{ flex: 'none', position: 'relative', background: '#16140F', borderTop: '3px solid #0D0C09', padding: '6px 16px 16px', overflow: 'visible' }}>
      {/* slot zone — fixed height whether or not a tape is docked */}
      <div style={{ position: 'relative', height: ZONE_H }}>
        {/* drop target while dragging a tape from the closet */}
        {dropReady && (
          <div
            style={{
              position: 'absolute', left: '50%', bottom: 4, transform: 'translateX(-50%)',
              width: SLOT_W - 8, height: 52, borderRadius: 10, pointerEvents: 'none',
              border: `2.5px dashed ${overSlot ? '#FFC24B' : 'rgba(245,241,232,0.35)'}`,
              background: overSlot ? 'rgba(255,194,75,0.08)' : 'transparent',
              transition: 'border-color .15s ease, background .15s ease',
              animation: overSlot ? 'none' : 'cassd-slot-pulse 1.6s ease-in-out infinite',
            }}
          />
        )}

        {/* idle hint pointing at the open mouth */}
        {!playing && !dragging && (
          <div style={{ position: 'absolute', left: '50%', bottom: 6, transform: 'translateX(-50%)', color: 'rgba(245,241,232,0.4)', fontSize: 15, lineHeight: 1, animation: 'cassd-sink 2.4s ease-in-out infinite', pointerEvents: 'none' }}>
            ⌄
          </div>
        )}

        {/* docked cassette — clipped at the slot mouth so it sits INSIDE the deck */}
        {showDockedCassette && playing && (
          <div style={{ position: 'absolute', left: '50%', top: -8, bottom: -SLOT_LINE, width: CASS_W + 24, transform: 'translateX(-50%)', overflow: 'hidden', zIndex: 2, pointerEvents: 'none' }}>
            <div
              onPointerDown={startPull}
              style={{
                position: 'absolute', left: '50%', bottom: -INSERT_DEPTH, marginLeft: -CASS_W / 2,
                cursor: 'grab', touchAction: 'none', userSelect: 'none', pointerEvents: 'auto',
                filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.45))',
                animation: 'cassd-dock .34s cubic-bezier(.22,1,.36,1)',
              }}
            >
              <div style={{ position: 'absolute', left: '50%', top: -22, transform: 'translateX(-50%)', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'rgba(245,241,232,0.6)', pointerEvents: 'none' }}>
                <span style={{ fontSize: 12, lineHeight: 1, animation: 'cassd-bob 1.8s ease-in-out infinite' }}>⌃</span>
                <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>PULL TO EJECT</span>
              </div>
              <Cassette title={playing.name} color={playing.color} group={playing.group} state="playing" cstyle={cassetteStyle} habit={playing.habit} w={CASS_W} />
            </div>
          </div>
        )}
      </div>

      {/* boombox body */}
      <div
        style={{
          position: 'relative', zIndex: 1, borderRadius: 15, overflow: 'hidden',
          border: '3px solid #0D0C09',
          background: `linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0) 34%, rgba(0,0,0,0.08)), ${bb.body}`,
          boxShadow: '0 6px 0 #0A0908, 0 16px 28px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.2), inset 4px 0 0 rgba(255,255,255,0.07), inset -4px 0 0 rgba(0,0,0,0.12)',
        }}
      >
        {/* 3D top face: trapezoid deck holding the slot mouth */}
        <div style={{ position: 'relative', height: 26, borderBottom: '2.5px solid #0D0C09' }}>
          <div style={{ position: 'absolute', inset: 0, background: '#0D0C09', clipPath: 'polygon(16px 0, calc(100% - 16px) 0, 100% 100%, 0 100%)' }} />
          <div style={{ position: 'absolute', inset: '2.5px 2.5px 0', background: `linear-gradient(180deg, rgba(255,255,255,0.3), rgba(255,255,255,0.06) 55%, rgba(0,0,0,0.14)), ${bb.trim}`, clipPath: 'polygon(15px 0, calc(100% - 15px) 0, 100% 100%, 0 100%)' }} />

          {/* the mouth — wide enough for the tape, glows while a tape hovers */}
          <div
            style={{
              position: 'absolute', left: '50%', top: 6, transform: 'translateX(-50%)',
              width: SLOT_W, height: 14, borderRadius: 5,
              background: 'linear-gradient(180deg, #000 0%, #241f18 100%)',
              boxShadow: overSlot
                ? 'inset 0 4px 6px rgba(0,0,0,0.95), inset 0 -1px 0 rgba(255,255,255,0.18), 0 0 12px rgba(255,194,75,0.65)'
                : 'inset 0 4px 6px rgba(0,0,0,0.95), inset 0 -1px 0 rgba(255,255,255,0.18), 0 1px 0 rgba(255,255,255,0.14)',
              transition: 'box-shadow .15s ease',
            }}
          />

          <div style={{ position: 'absolute', left: 26, top: '50%', transform: 'translateY(-50%)', display: 'flex', gap: 5 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0D0C09' }} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0D0C09' }} />
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#0D0C09' }} />
          </div>
          <div style={{ position: 'absolute', right: 26, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, borderRadius: '50%', background: `radial-gradient(circle at 34% 28%, rgba(255,255,255,0.55), rgba(255,255,255,0) 45%), ${bb.knob}`, border: '2px solid #0D0C09', boxShadow: '0 1.5px 0 rgba(13,12,9,0.5)' }} />
        </div>

        {/* main row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px 12px' }}>
          <Speaker bb={bb} />

          {/* center: LCD screen + eject */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <div style={{ position: 'relative', height: 70, borderRadius: 8, background: bb.screen, border: '3px solid #0D0C09', overflow: 'hidden', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.12)' }}>
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

            {/* always mounted (a deck keeps its eject button) so the dock height never changes */}
            <button
              onClick={openEject}
              disabled={!playing}
              className={playing ? 'press' : undefined}
              style={{
                border: '2.5px solid #0D0C09',
                background: playing ? 'linear-gradient(180deg,#FF6E3C,#FF5C28)' : 'linear-gradient(180deg,#555046,#3e3a32)',
                color: playing ? '#16140F' : 'rgba(245,241,232,0.35)',
                fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '0.06em',
                padding: '8px 0', borderRadius: 9, cursor: playing ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                boxShadow: playing ? undefined : '0 4px 0 #0D0C09, inset 0 1px 0 rgba(255,255,255,0.08)',
                transition: 'background .2s ease, color .2s ease',
                '--sh': '0 4px 0 #0D0C09, inset 0 1px 0 rgba(255,255,255,0.35)',
                '--sh-a': '0 1px 0 #0D0C09, inset 0 1px 0 rgba(255,255,255,0.35)',
              } as CSSProperties}
            >
              <span style={{ fontSize: 14, lineHeight: 0 }}>⏏</span> EJECT
            </button>
          </div>

          <Speaker bb={bb} />
        </div>

        {/* base strip */}
        <div style={{ height: 9, background: bb.base, borderTop: '2px solid #0D0C09', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.1)' }} />
      </div>
    </div>
  )
}
