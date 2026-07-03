import { useState } from 'react'
import type { CSSProperties, PointerEvent } from 'react'
import type { Task, Shelf, DragState } from '../types'
import type { ClosetSkin } from '../skins'
import { CLOSET_SKINS } from '../skins'
import { inkOn } from '../util'

interface Props {
  shelfTasks: Task[]
  shelves: Shelf[]
  cb: ClosetSkin
  ownedClosets: string[]
  equippedCloset: string
  drag: DragState | null
  onEquipCloset: (id: string) => void
  onStartDrag: (id: string, e: PointerEvent) => void
  onAddShelf: () => string
  onRenameShelf: (id: string, name: string) => void
  onRemoveShelf: (id: string) => void
  goShop: () => void
  goStudio: () => void
}

// procedural wood grain — layered incommensurate periods so it never looks tiled
const grainV = 'repeating-linear-gradient(90deg, rgba(0,0,0,0.055) 0 1px, transparent 1px 4px), repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 7px), repeating-linear-gradient(90deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 12px)'
const grainH = 'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0 1px, transparent 1px 4px), repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 8px), repeating-linear-gradient(0deg, rgba(0,0,0,0.04) 0 2px, transparent 2px 13px)'

export default function Closet({
  shelfTasks, shelves, cb, ownedClosets, equippedCloset, drag,
  onEquipCloset, onStartDrag, onAddShelf, onRenameShelf, onRemoveShelf, goShop, goStudio,
}: Props) {
  const [editing, setEditing] = useState<string | null>(null)
  const [draftLabel, setDraftLabel] = useState('')

  const startEdit = (s: Shelf) => { setEditing(s.id); setDraftLabel(s.name) }
  const commit = () => {
    if (editing) onRenameShelf(editing, draftLabel.trim() || 'Shelf')
    setEditing(null)
  }
  const addShelf = () => { const id = onAddShelf(); setEditing(id); setDraftLabel('New shelf') }

  const sections = shelves.map(s => ({ shelf: s, items: shelfTasks.filter(t => t.shelfId === s.id) }))
  const empty = shelfTasks.length === 0

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

      {empty && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '0 2px 14px', padding: '12px 14px', border: '2px dashed rgba(22,20,15,0.25)', borderRadius: 12 }}>
          <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.4, color: 'rgba(22,20,15,0.6)' }}>
            No tapes yet — print one in the Studio, then drag it onto a shelf.
          </div>
          <button
            onClick={goStudio}
            className="press"
            style={{
              flex: 'none', border: '2px solid #16140F', background: '#FF5C28', color: '#16140F',
              fontFamily: 'Anton, sans-serif', fontSize: 12, letterSpacing: '0.03em',
              padding: '9px 13px', borderRadius: 10, cursor: 'pointer',
              '--sh': '0 3px 0 #16140F', '--sh-a': '0 1px 0 #16140F',
            } as CSSProperties}
          >
            STUDIO →
          </button>
        </div>
      )}

      {/* the cabinet */}
      <div style={{
        position: 'relative',
        background: `${grainV}, ${cb.frame}`,
        border: '3px solid #16140F', borderRadius: 14,
        padding: '0 9px',
        boxShadow: '0 16px 30px rgba(0,0,0,0.3), inset 0 2px 0 rgba(255,255,255,0.22)',
        overflow: 'hidden',
      }}>
        {/* crown molding — profiled: lit top lip, shaded underside */}
        <div style={{ height: 16, margin: '0 -9px', background: `linear-gradient(180deg, rgba(255,255,255,0.32), rgba(255,255,255,0.06) 42%, rgba(0,0,0,0.24)), ${grainH}, ${cb.board}`, borderBottom: '2px solid #16140F', boxShadow: 'inset 0 3px 0 rgba(255,255,255,0.26), 0 5px 8px rgba(0,0,0,0.34)' }} />

        {/* recessed interior — darker toward the side walls for depth */}
        <div style={{ position: 'relative', margin: '9px 0', background: cb.back, borderRadius: 7, border: '2px solid rgba(0,0,0,0.34)', boxShadow: 'inset 0 12px 18px rgba(0,0,0,0.34), inset 0 -5px 11px rgba(0,0,0,0.22), inset 14px 0 18px rgba(0,0,0,0.16), inset -14px 0 18px rgba(0,0,0,0.16)', overflow: 'hidden' }}>
          {/* beadboard planks on the back wall */}
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.08) 0 1.5px, rgba(255,255,255,0.03) 1.5px 3px, transparent 3px 28px)', pointerEvents: 'none' }} />
          {/* side posts framing the interior — lit inner edge so they read as rounded uprights */}
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 9, background: `${grainV}, ${cb.frame}`, boxShadow: 'inset -2px 0 0 rgba(255,255,255,0.2), inset 2px 0 0 rgba(0,0,0,0.25), 4px 0 8px rgba(0,0,0,0.36)' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 9, background: `${grainV}, ${cb.frame}`, boxShadow: 'inset 2px 0 0 rgba(255,255,255,0.2), inset -2px 0 0 rgba(0,0,0,0.25), -4px 0 8px rgba(0,0,0,0.36)' }} />

          {sections.map(({ shelf, items }) => (
            <div key={shelf.id} style={{ position: 'relative', padding: '9px 13px 0' }}>
              {/* shelf label plate — click to rename */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, margin: '0 2px 6px' }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: shelf.color, border: '2px solid #16140F', flex: 'none' }} />
                {editing === shelf.id ? (
                  <input
                    autoFocus
                    value={draftLabel}
                    onChange={e => setDraftLabel(e.target.value)}
                    onBlur={commit}
                    onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(null) }}
                    maxLength={22}
                    style={{ font: 'inherit', fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '0.04em', color: '#16140F', background: '#fff', border: '2px solid #16140F', borderRadius: 6, padding: '1px 6px', width: 150, outline: 'none' }}
                  />
                ) : (
                  <button
                    onClick={() => startEdit(shelf)}
                    title="Rename shelf"
                    style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', color: cb.ink }}
                  >
                    <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '0.04em' }}>{shelf.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: cb.inkDim }}>{items.length}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><path d="M4 20l4.5-1.2L19 8.3l-3.3-3.3L5.2 15.5 4 20z" /></svg>
                  </button>
                )}
                {items.length === 0 && editing !== shelf.id && shelves.length > 1 && (
                  <button
                    onClick={() => onRemoveShelf(shelf.id)}
                    title="Remove empty shelf"
                    style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', color: cb.inkDim, fontSize: 14, lineHeight: 1, padding: '0 2px' }}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="cassd-scroll" style={{ display: 'flex', alignItems: 'flex-end', gap: 5, minHeight: 126, padding: '0 2px 1px', overflowX: 'auto' }}>
                {items.length === 0 ? (
                  <div style={{ flex: 1, alignSelf: 'center', textAlign: 'center', fontSize: 11, fontWeight: 700, color: cb.inkDim, padding: '30px 0' }}>
                    empty — drag a tape here
                  </div>
                ) : items.map(t => (
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

              {/* shelf board — 3D plank: lit top surface receding back + grained front edge; click to rename too */}
              <div onClick={() => startEdit(shelf)} style={{ margin: '1px 2px 0', cursor: 'pointer' }}>
                <div style={{ height: 6, background: `linear-gradient(180deg, rgba(255,255,255,0.34), rgba(255,255,255,0.14)), ${grainH}, ${cb.board}`, clipPath: 'polygon(7px 0, calc(100% - 7px) 0, 100% 100%, 0 100%)' }} />
                <div style={{ height: 13, borderRadius: '0 0 6px 6px', background: `${grainH}, ${cb.board}`, borderTop: '1.5px solid rgba(0,0,0,0.35)', boxShadow: '0 11px 14px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.18), inset 0 -4px 6px rgba(0,0,0,0.46)' }} />
              </div>
            </div>
          ))}

          {/* add a new shelf */}
          <div style={{ padding: '10px 13px 12px' }}>
            <button
              onClick={addShelf}
              style={{
                width: '100%', border: '2px dashed rgba(255,255,255,0.3)', background: 'rgba(0,0,0,0.14)',
                color: cb.ink, fontFamily: 'Anton, sans-serif', fontSize: 12, letterSpacing: '0.04em',
                padding: '9px 0', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 0 }}>+</span> NEW SHELF
            </button>
          </div>
        </div>

        {/* plinth / base */}
        <div style={{ height: 12, margin: '0 -9px', background: `${grainH}, ${cb.board}`, borderTop: '2px solid #16140F', boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.18)' }} />
      </div>
    </div>
  )
}
