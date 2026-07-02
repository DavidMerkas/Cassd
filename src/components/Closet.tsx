import type { PointerEvent } from 'react'
import type { Task, DragState } from '../types'
import type { ClosetSkin } from '../skins'
import { GROUPS, CLOSET_SKINS } from '../skins'
import { inkOn } from '../util'

interface Props {
  shelfTasks: Task[]
  cb: ClosetSkin
  ownedClosets: string[]
  equippedCloset: string
  drag: DragState | null
  onEquipCloset: (id: string) => void
  onStartDrag: (id: string, e: PointerEvent) => void
  goShop: () => void
  goStudio: () => void
}

export default function Closet({
  shelfTasks, cb, ownedClosets, equippedCloset, drag,
  onEquipCloset, onStartDrag, goShop, goStudio,
}: Props) {
  const sections = GROUPS.map(g => {
    const items = shelfTasks.filter(t => t.group === g.key)
    return { key: g.key, color: g.color, count: items.length, items }
  }).filter(sec => sec.items.length > 0)

  // procedural wood grain — layered incommensurate periods so it never looks tiled.
  // grainV = grain running vertically (for posts/frame), grainH = horizontally (for shelves/molding)
  const grainV = 'repeating-linear-gradient(90deg, rgba(0,0,0,0.055) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 7px), repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 12px)'
  const grainH = 'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 4px), repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 8px), repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 13px)'

  return (
    <div style={{ padding: '6px 16px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 2px 12px' }}>
        <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 19, color: '#16140F', letterSpacing: '0.02em' }}>THE CLOSET</div>
        <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(22,20,15,0.4)' }}>{shelfTasks.length} tapes</div>
      </div>

      {/* quick finish swatches */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 2px 14px' }}>
        <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.12em', color: 'rgba(22,20,15,0.4)' }}>FINISH</span>
        <div style={{ display: 'flex', gap: 7 }}>
          {ownedClosets.map(id => (
            <button
              key={id}
              onClick={() => onEquipCloset(id)}
              title={CLOSET_SKINS[id].name}
              style={{
                width: 26, height: 26, borderRadius: 7,
                background: CLOSET_SKINS[id].board,
                cursor: 'pointer',
                border: equippedCloset === id ? '3px solid #16140F' : '2px solid rgba(22,20,15,0.25)',
                boxShadow: '1px 1px 0 rgba(0,0,0,0.2)',
              }}
            />
          ))}
          <button
            onClick={goShop}
            title="More in shop"
            style={{
              width: 26, height: 26, borderRadius: 7, background: 'transparent', cursor: 'pointer',
              border: '2px dashed rgba(22,20,15,0.3)', color: 'rgba(22,20,15,0.5)',
              fontSize: 15, lineHeight: 0, fontWeight: 700,
            }}
          >
            +
          </button>
        </div>
      </div>

      {shelfTasks.length === 0 && (
        <div style={{ marginTop: 30, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 14, padding: '0 22px' }}>
          <div style={{ width: 40, height: 130, borderRadius: 4, border: '3px dashed rgba(22,20,15,0.25)', transform: 'rotate(-4deg)' }} />
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 22, color: '#16140F' }}>Closet's empty</div>
          <div style={{ fontSize: 13, lineHeight: 1.5, color: 'rgba(22,20,15,0.55)', maxWidth: 240 }}>
            Head to the Studio and make your first cassette.
          </div>
          <button
            onClick={goStudio}
            className="press"
            style={{
              border: '2px solid #16140F', background: '#FF5C28', color: '#16140F',
              fontFamily: 'Anton, sans-serif', fontSize: 15, letterSpacing: '0.04em',
              padding: '12px 22px', borderRadius: 12, cursor: 'pointer',
              '--sh': '0 4px 0 #16140F', '--sh-a': '0 1px 0 #16140F',
            } as React.CSSProperties}
          >
            OPEN STUDIO →
          </button>
        </div>
      )}

      {/* the cabinet */}
      {sections.length > 0 && (
        <div style={{
          position: 'relative',
          background: `${grainV}, ${cb.frame}`,
          border: '3px solid #16140F', borderRadius: 14,
          padding: '0 9px',
          boxShadow: '0 16px 30px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.22)',
          overflow: 'hidden',
        }}>
          {/* crown molding */}
          <div style={{ height: 15, margin: '0 -9px', background: `${grainH}, ${cb.board}`, borderBottom: '2px solid #16140F', boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.24), 0 4px 7px rgba(0,0,0,0.3)' }} />

          {/* recessed interior */}
          <div style={{ position: 'relative', margin: '9px 0', background: cb.back, borderRadius: 7, border: '2px solid rgba(0,0,0,0.34)', boxShadow: 'inset 0 11px 16px rgba(0,0,0,0.32), inset 0 -5px 11px rgba(0,0,0,0.22)', overflow: 'hidden' }}>
            {/* beadboard planks on the back wall */}
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 1.5px, rgba(255,255,255,0.03) 1.5px 3px, transparent 3px 28px)', pointerEvents: 'none' }} />
            {/* side posts framing the interior */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 7, background: `${grainV}, ${cb.frame}`, boxShadow: '3px 0 7px rgba(0,0,0,0.34)' }} />
            <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 7, background: `${grainV}, ${cb.frame}`, boxShadow: '-3px 0 7px rgba(0,0,0,0.34)' }} />

            {sections.map(sec => (
              <div key={sec.key} style={{ position: 'relative', padding: '9px 13px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, margin: '0 2px 6px' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: sec.color, border: '2px solid #16140F' }} />
                  <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '0.04em', color: cb.ink }}>{sec.key}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, color: cb.inkDim }}>{sec.count}</span>
                </div>
                <div className="cassd-scroll" style={{ display: 'flex', alignItems: 'flex-end', gap: 5, minHeight: 126, padding: '0 2px 1px', overflowX: 'auto' }}>
                  {sec.items.map(t => (
                    <div
                      key={t.id}
                      className="tape-hover"
                      onPointerDown={e => onStartDrag(t.id, e)}
                      title={t.name}
                      style={{
                        cursor: 'grab', width: 30, height: 122,
                        borderRadius: '4px 4px 3px 3px',
                        background: t.color, border: '2px solid #16140F',
                        boxShadow: '2px 0 0 rgba(0,0,0,0.16)',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between',
                        padding: '8px 0', flex: 'none', touchAction: 'none', userSelect: 'none',
                        opacity: drag && drag.id === t.id && !drag.pull ? 0.2 : 1,
                      }}
                    >
                      <span style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid #16140F', background: '#0D0C09', flex: 'none' }} />
                      <span style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', fontWeight: 800, fontSize: 10.5, color: inkOn(t.color), whiteSpace: 'nowrap', overflow: 'hidden', maxHeight: 76, textOverflow: 'ellipsis' }}>
                        {t.name}
                      </span>
                      <span style={{ width: 16, height: 5, background: '#F5F1E8', border: '1.5px solid #16140F', flex: 'none' }} />
                    </div>
                  ))}
                </div>
                {/* shelf board — grained plank with a front lip */}
                <div style={{ height: 13, margin: '1px 2px 0', borderRadius: '2px 2px 5px 5px', background: `${grainH}, ${cb.board}`, borderTop: '1px solid rgba(255,255,255,0.22)', boxShadow: '0 10px 13px rgba(0,0,0,0.36), inset 0 2px 0 rgba(255,255,255,0.34), inset 0 -3px 5px rgba(0,0,0,0.42)' }} />
              </div>
            ))}
            <div style={{ height: 10 }} />
          </div>

          {/* plinth / base */}
          <div style={{ height: 12, margin: '0 -9px', background: `${grainH}, ${cb.board}`, borderTop: '2px solid #16140F', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.18)' }} />
        </div>
      )}
    </div>
  )
}
