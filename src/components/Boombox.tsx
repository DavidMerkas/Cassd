import type { CSSProperties, PointerEvent, Ref } from 'react'
import type { Task, CassetteStyle, Screen } from '../types'
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
  armed: boolean
  groupLabel: string
  screen: Screen
  go: (s: Screen) => void
  startPull: (e: PointerEvent) => void
  openEject: () => void
}

/* screens cycled by the deck's tab dial */
const ORDER: Screen[] = ['closet', 'studio', 'crate', 'shop']

function TabIcon({ s, size = 13 }: { s: Screen; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
      {s === 'closet' && <><rect x="4" y="3" width="16" height="18" rx="1.5" /><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /></>}
      {s === 'studio' && <><path d="M4 20l4.5-1.2L19 8.3l-3.3-3.3L5.2 15.5 4 20z" /><path d="M13.5 6.5l3.3 3.3" /></>}
      {s === 'crate' && <><path d="M3.5 8h17l-1 12.5H4.5z" /><path d="M3.5 8l2.2-4h12.6L20.5 8" /><line x1="12" y1="8" x2="12" y2="20.5" /></>}
      {s === 'shop' && <><path d="M5 8h14l-1.2 12.5H6.2z" /><path d="M8.5 8a3.5 3.5 0 0 1 7 0" /></>}
    </svg>
  )
}

function ArrowKey({ dir, onClick }: { dir: -1 | 1; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="press"
      aria-label={dir < 0 ? 'previous screen' : 'next screen'}
      style={{
        flex: 'none', width: 48, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: '2.5px solid #0D0C09', borderRadius: 8, cursor: 'pointer',
        background: 'linear-gradient(180deg,#4a453b,#332f27)', color: '#F5F1E8',
        '--sh': '0 4px 0 #0D0C09, inset 0 1px 0 rgba(255,255,255,0.12)',
        '--sh-a': '0 1px 0 #0D0C09, inset 0 2px 4px rgba(0,0,0,0.5)',
      } as CSSProperties}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {dir < 0 ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  )
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
        position: 'relative', flex: 'none', width: 66, height: 66, borderRadius: '50%',
        background: 'radial-gradient(circle at 50% 62%, #201b14 0 38%, #0D0C09 60%)',
        border: '3px solid #0D0C09',
        // deep inset shadow at the top rim + faint light at the bottom rim = a hole punched into the body
        boxShadow: `inset 0 5px 9px rgba(0,0,0,0.8), inset 0 -3px 5px ${bb.metal}44, inset 0 -1px 2px rgba(255,255,255,0.14), 0 1px 0 rgba(255,255,255,0.18)`,
      }}
    >
      {/* recessed cone — dimmed sunburst, shaded dark at top and lit at the bottom of the well */}
      <div
        style={{
          position: 'absolute', inset: '15%', borderRadius: '50%', border: '2px solid #0D0C09', overflow: 'hidden',
          background: 'repeating-conic-gradient(from 8deg, #D9601F 0 18deg, #D9A62C 18deg 36deg, #CE3457 36deg 54deg, #D67722 54deg 72deg)',
          boxShadow: 'inset 0 6px 10px rgba(0,0,0,0.72)',
        }}
      >
        {/* directional recess shade: top wall in shadow, bottom wall catches light */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.18) 38%, rgba(0,0,0,0) 58%, rgba(255,255,255,0.18) 100%)' }} />
        {/* vignette to deepen the well toward the surround */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 50% 60%, rgba(0,0,0,0) 26%, rgba(0,0,0,0.42) 100%)' }} />
      </div>

      {/* seated purple dust-cap at the bottom of the well (lit from below, shadowed on top) */}
      <div
        style={{
          position: 'absolute', inset: '38%', borderRadius: '50%', border: '2px solid #0D0C09',
          background: 'radial-gradient(circle at 50% 66%, #A15FE0 0 22%, #7B34C4 55%, #45197A 100%)',
          boxShadow: 'inset 0 3px 4px rgba(0,0,0,0.6), inset 0 -2px 3px rgba(255,255,255,0.32), 0 -1px 2px rgba(0,0,0,0.45)',
        }}
      >
        <div style={{ position: 'absolute', bottom: '20%', left: '34%', width: '30%', height: '22%', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.6), rgba(255,255,255,0) 70%)' }} />
      </div>
    </div>
  )
}

const eqBar = (color: string, dur: string, delay: string): CSSProperties => ({
  width: 3, height: 12, background: color, transformOrigin: 'bottom',
  animation: `cassd-eq ${dur} ease-in-out infinite ${delay}`,
})

export default function Boombox({
  dockRef, bb, playing, showDockedCassette, cassetteStyle,
  elapsed, overSlot, dragging, armed, groupLabel, screen, go, startPull, openEject,
}: Props) {
  const dropReady = dragging && !playing
  return (
    <div ref={dockRef} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 10, background: 'linear-gradient(180deg, rgba(236,229,214,0) 0%, rgba(236,229,214,0.92) 58px, #ECE5D6 96px)', padding: '6px 16px 16px', overflow: 'visible', pointerEvents: 'none' }}>
      {/* slot zone — fixed height whether or not a tape is docked */}
      <div style={{ position: 'relative', height: ZONE_H }}>
        {/* drop target while dragging a tape from the closet */}
        {dropReady && (
          <div
            style={{
              position: 'absolute', left: '50%', bottom: 4, transform: 'translateX(-50%)',
              width: SLOT_W - 8, height: 52, borderRadius: 10, pointerEvents: 'none',
              border: `2.5px dashed ${overSlot ? '#FF5C28' : 'rgba(22,20,15,0.35)'}`,
              background: overSlot ? 'rgba(255,92,40,0.08)' : 'transparent',
              transition: 'border-color .15s ease, background .15s ease',
              animation: overSlot ? 'none' : 'cassd-slot-pulse 1.6s ease-in-out infinite',
            }}
          />
        )}

        {/* idle hint pointing at the open mouth */}
        {!playing && !dragging && (
          <div style={{ position: 'absolute', left: '50%', bottom: 6, transform: 'translateX(-50%)', color: 'rgba(22,20,15,0.45)', fontSize: 15, lineHeight: 1, animation: 'cassd-sink 2.4s ease-in-out infinite', pointerEvents: 'none' }}>
            ⌄
          </div>
        )}

        {/* docked cassette — clipped at the slot mouth so it sits INSIDE the deck */}
        {showDockedCassette && playing && (
          <div style={{ position: 'absolute', left: '50%', top: -8, bottom: -SLOT_LINE, width: CASS_W + 24, transform: 'translateX(-50%)', overflow: armed ? 'visible' : 'hidden', zIndex: 2, pointerEvents: 'none' }}>
            <div
              onPointerDown={startPull}
              style={{
                position: 'absolute', left: '50%', bottom: -INSERT_DEPTH, marginLeft: -CASS_W / 2,
                cursor: 'grab', touchAction: 'none', userSelect: 'none', pointerEvents: 'auto',
                filter: `drop-shadow(0 4px 6px rgba(0,0,0,0.45))${armed ? ' drop-shadow(0 10px 12px rgba(0,0,0,0.4))' : ''}`,
                transform: armed ? 'translateY(-62px)' : 'translateY(0)',
                transition: 'transform .32s cubic-bezier(.22,1,.36,1)',
                animation: 'cassd-dock .34s cubic-bezier(.22,1,.36,1)',
              }}
            >
              <div style={{ position: 'absolute', left: '50%', top: -22, transform: 'translateX(-50%)', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, color: 'rgba(22,20,15,0.65)', pointerEvents: 'none' }}>
                {armed ? (
                  <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', whiteSpace: 'nowrap', animation: 'cassd-bob 1.4s ease-in-out infinite' }}>◄ DRAG&nbsp;·&nbsp;DROP ►</span>
                ) : (
                  <>
                    <span style={{ fontSize: 12, lineHeight: 1, animation: 'cassd-bob 1.8s ease-in-out infinite' }}>⌃</span>
                    <span style={{ fontSize: 8.5, fontWeight: 800, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>PULL TO EJECT</span>
                  </>
                )}
              </div>
              <Cassette title={playing.name} color={playing.color} group={groupLabel} state="playing" cstyle={cassetteStyle} habit={playing.habit} w={CASS_W} />
            </div>
          </div>
        )}
      </div>

      {/* boombox body */}
      <div
        style={{
          position: 'relative', zIndex: 1, borderRadius: '2px 2px 16px 16px', overflow: 'hidden', pointerEvents: 'auto',
          border: '3px solid #0D0C09',
          background: `linear-gradient(125deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.06) 17%, rgba(255,255,255,0) 38%), linear-gradient(180deg, rgba(255,255,255,0.14), rgba(255,255,255,0) 34%, rgba(0,0,0,0.12)), ${bb.body}`,
          boxShadow: '0 6px 0 #0A0908, 0 16px 28px rgba(0,0,0,0.5), inset 0 2px 0 rgba(255,255,255,0.28), inset 4px 0 0 rgba(255,255,255,0.1), inset -4px 0 0 rgba(0,0,0,0.14)',
        }}
      >
        {/* top face: a full-width lit plane (top of the box) holding the slot mouth */}
        <div style={{ position: 'relative', height: 34, borderBottom: '3px solid #0D0C09' }}>
          <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, rgba(255,255,255,0.5), rgba(255,255,255,0.16) 48%, rgba(0,0,0,0.2)), ${bb.trim}` }} />
          {/* bright far-edge highlight along the very top of the box */}
          <div style={{ position: 'absolute', top: 1, left: 7, right: 7, height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.55)' }} />

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 11, padding: '12px 13px 6px' }}>
          <Speaker bb={bb} />

          {/* center: LCD screen + eject */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8, minWidth: 0 }}>
            <div style={{ position: 'relative', height: 70, borderRadius: 8, background: bb.screen, border: '3px solid #0D0C09', overflow: 'hidden', boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.12)' }}>
              <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${bb.glow}, transparent 72%)`, animation: 'cassd-glow 3s ease-in-out infinite', opacity: playing ? 1 : 0.35, pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, height: 22, background: 'linear-gradient(180deg, rgba(255,255,255,0.09), transparent)', animation: 'cassd-scan 4.5s linear infinite', pointerEvents: 'none' }} />

              {playing ? (
                <div style={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '6px 11px', gap: 3 }}>
                  <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 8, letterSpacing: '0.14em', color: '#7CFF5A', opacity: 0.85 }}>▶ SIDE A</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 8, letterSpacing: '0.1em', color: '#FFC24B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 90, textAlign: 'right' }}>{groupLabel.toUpperCase()}</span>
                  </div>
                  <div style={{ flex: 'none', fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 12.5, lineHeight: 1.25, color: '#86F06B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textShadow: '0 0 6px rgba(124,255,90,0.5)' }}>
                    {playing.name}
                  </div>
                  <div style={{ flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
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
                background: !playing ? 'linear-gradient(180deg,#555046,#3e3a32)' : armed ? 'linear-gradient(180deg,#FFD23F,#F5B800)' : 'linear-gradient(180deg,#FF6E3C,#FF5C28)',
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
              <span style={{ fontSize: 14, lineHeight: 0 }}>⏏</span> {armed ? 'CANCEL' : 'EJECT'}
            </button>
          </div>

          <Speaker bb={bb} />
        </div>

        {/* tab dial: mini LCD shows the open screen, arrows cycle through */}
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 7, padding: '2px 13px 12px' }}>
          <ArrowKey dir={-1} onClick={() => go(ORDER[(ORDER.indexOf(screen) + ORDER.length - 1) % ORDER.length])} />
          <div style={{ flex: 1, position: 'relative', minHeight: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bb.screen, border: '2.5px solid #0D0C09', borderRadius: 8, overflow: 'hidden', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.85), 0 1px 0 rgba(255,255,255,0.12)' }}>
            <span key={screen} style={{ display: 'flex', alignItems: 'center', gap: 7, fontFamily: "'Space Mono', monospace", fontWeight: 700, fontSize: 11.5, letterSpacing: '0.22em', color: '#7CFF5A', textShadow: '0 0 6px rgba(124,255,90,0.5)', filter: 'drop-shadow(0 0 3px rgba(124,255,90,0.45))', animation: 'cassd-lcd-in .18s ease' }}>
              <TabIcon s={screen} />
              {screen.toUpperCase()}
            </span>
          </div>
          <ArrowKey dir={1} onClick={() => go(ORDER[(ORDER.indexOf(screen) + 1) % ORDER.length])} />
        </div>

        {/* base strip */}
        <div style={{ height: 9, background: bb.base, borderTop: '2px solid #0D0C09', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.1)' }} />
      </div>
    </div>
  )
}
