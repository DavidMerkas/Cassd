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

// painted-metal locker surfaces (layered over a paint colour)
const metalFace = 'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0) 15%, rgba(0,0,0,0.09) 56%, rgba(255,255,255,0.05) 94%), repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 3px)'
const louver = 'repeating-linear-gradient(180deg, rgba(255,255,255,0.28) 0 1px, rgba(0,0,0,0.12) 1px 5px, rgba(0,0,0,0.6) 5px 6px)'
const brushV = 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 4px)'
const INTERIOR = 'linear-gradient(180deg, #34362f, #1f201d)'

// tint a paint hex toward black (amt<0) or white (amt>0)
function shade(hex: string, amt: number): string {
  let h = hex.replace('#', '')
  if (h.length === 3) h = h.split('').map(c => c + c).join('')
  const n = parseInt(h, 16)
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255
  const t = amt < 0 ? 0 : 255, k = Math.abs(amt)
  r = Math.round(r + (t - r) * k); g = Math.round(g + (t - g) * k); b = Math.round(b + (t - b) * k)
  return `rgb(${r},${g},${b})`
}

function Rivet({ style }: { style: CSSProperties }) {
  return <span style={{ position: 'absolute', width: 7, height: 7, borderRadius: '50%', background: 'radial-gradient(circle at 38% 30%, #d6d6d6, #4a4a4a)', border: '1px solid #16140F', zIndex: 4, ...style }} />
}

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

  // locker paint (from the equipped finish) + its metal shading
  const paint = cb.frame
  const paintDarker = shade(paint, -0.5)
  const metalBody = `${metalFace}, ${paint}`
  const inkLite = '#E8E2D4'
  const inkDim = 'rgba(232,226,212,0.5)'

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
                width: 26, height: 26, borderRadius: 5,
                background: `${metalFace}, ${CLOSET_SKINS[id].frame}`,
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

      {/* the metal locker */}
      <div style={{
        position: 'relative',
        background: metalBody,
        border: '2px solid #16140F', borderRadius: 8,
        boxShadow: `0 16px 30px rgba(0,0,0,0.34), 0 6px 0 ${paintDarker}, inset 0 2px 0 rgba(255,255,255,0.24)`,
      }}>
        {/* top vent band with rivets */}
        <div style={{ position: 'relative', height: 18, borderBottom: '2px solid #16140F', background: `${louver}, ${paint}`, borderRadius: '6px 6px 0 0' }}>
          <Rivet style={{ top: 5, left: 8 }} />
          <Rivet style={{ top: 5, right: 8 }} />
        </div>

        {/* interior — dark painted steel with metal uprights */}
        <div style={{ position: 'relative', background: INTERIOR, overflow: 'hidden', boxShadow: 'inset 0 12px 20px rgba(0,0,0,0.55), inset 0 -6px 14px rgba(0,0,0,0.4), inset 16px 0 20px rgba(0,0,0,0.3), inset -16px 0 20px rgba(0,0,0,0.3)' }}>
          <div style={{ position: 'absolute', inset: 0, background: brushV, pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: 8, background: metalBody, boxShadow: 'inset -2px 0 0 rgba(255,255,255,0.18), 3px 0 8px rgba(0,0,0,0.45)' }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: 8, background: metalBody, boxShadow: 'inset 2px 0 0 rgba(255,255,255,0.18), -3px 0 8px rgba(0,0,0,0.45)' }} />

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
                    style={{ display: 'flex', alignItems: 'center', gap: 5, border: 'none', background: 'transparent', padding: 0, cursor: 'pointer', color: inkLite }}
                  >
                    <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 13, letterSpacing: '0.04em' }}>{shelf.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 800, color: inkDim }}>{items.length}</span>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><path d="M4 20l4.5-1.2L19 8.3l-3.3-3.3L5.2 15.5 4 20z" /></svg>
                  </button>
                )}
                {items.length === 0 && editing !== shelf.id && shelves.length > 1 && (
                  <button
                    onClick={() => onRemoveShelf(shelf.id)}
                    title="Remove empty shelf"
                    style={{ marginLeft: 'auto', border: 'none', background: 'transparent', cursor: 'pointer', color: inkDim, fontSize: 14, lineHeight: 1, padding: '0 2px' }}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="cassd-scroll" style={{ display: 'flex', alignItems: 'flex-end', gap: 5, minHeight: 126, padding: '0 2px 1px', overflowX: 'auto' }}>
                {items.length === 0 ? (
                  <div style={{ flex: 1, alignSelf: 'center', textAlign: 'center', fontSize: 11, fontWeight: 700, color: inkDim, padding: '30px 0' }}>
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
                <div style={{ height: 5, background: `linear-gradient(180deg, rgba(255,255,255,0.4), rgba(255,255,255,0.14)), ${metalBody}`, clipPath: 'polygon(6px 0, calc(100% - 6px) 0, 100% 100%, 0 100%)' }} />
                <div style={{ height: 12, borderRadius: '0 0 4px 4px', background: metalBody, borderTop: '1.5px solid rgba(0,0,0,0.42)', boxShadow: '0 10px 13px rgba(0,0,0,0.46), inset 0 2px 0 rgba(255,255,255,0.24), inset 0 -3px 5px rgba(0,0,0,0.42)' }} />
              </div>
            </div>
          ))}

          {/* add a new shelf */}
          <div style={{ padding: '10px 13px 12px' }}>
            <button
              onClick={addShelf}
              style={{
                width: '100%', border: '2px dashed rgba(232,226,212,0.28)', background: 'rgba(0,0,0,0.28)',
                color: inkLite, fontFamily: 'Anton, sans-serif', fontSize: 12, letterSpacing: '0.04em',
                padding: '9px 0', borderRadius: 9, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <span style={{ fontSize: 15, lineHeight: 0 }}>+</span> NEW SHELF
            </button>
          </div>

        </div>

        {/* base vent + rivets */}
        <div style={{ position: 'relative', height: 16, borderTop: '2px solid #16140F', background: `${louver}, ${paint}`, borderRadius: '0 0 6px 6px' }}>
          <Rivet style={{ top: 5, left: 8 }} />
          <Rivet style={{ top: 5, right: 8 }} />
        </div>

        {/* locker doors — swing open every time you visit the closet (clipped to the locker face) */}
        <div style={{ position: 'absolute', inset: 0, zIndex: 6, pointerEvents: 'none', perspective: 1000, overflow: 'hidden', borderRadius: 8 }}>
          {[0, 1].map(side => {
            const inner = side === 0 ? 'right' : 'left'
            return (
              <div
                key={side}
                style={{
                  position: 'absolute', top: 0, bottom: 0,
                  [side === 0 ? 'left' : 'right']: 0, width: '50%',
                  transformOrigin: side === 0 ? 'left center' : 'right center',
                  animation: `${side === 0 ? 'cassd-door-l' : 'cassd-door-r'} .85s cubic-bezier(.34,.9,.42,1) forwards`,
                  background: metalBody, border: '2px solid #16140F',
                  borderRadius: side === 0 ? '6px 0 0 6px' : '0 6px 6px 0',
                  boxShadow: `${side === 0 ? '6px' : '-6px'} 0 16px rgba(0,0,0,0.4), inset 0 2px 0 rgba(255,255,255,0.24)`,
                } as CSSProperties}
              >
                {/* top + bottom vent louvers */}
                <div style={{ position: 'absolute', top: 14, left: 12, right: 12, height: 20, background: louver, border: '1.5px solid #16140F', borderRadius: 2, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }} />
                <div style={{ position: 'absolute', bottom: 14, left: 12, right: 12, height: 20, background: louver, border: '1.5px solid #16140F', borderRadius: 2, boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.2)' }} />
                {/* stamped number plate */}
                <div style={{ position: 'absolute', top: '42%', left: '50%', transform: 'translateX(-50%)', width: 32, height: 20, borderRadius: 3, background: 'linear-gradient(180deg,#2a2a2a,#0f0f0f)', border: '1.5px solid #16140F', display: 'grid', placeItems: 'center', fontFamily: 'Anton, sans-serif', fontSize: 12, color: '#cfcfcf', letterSpacing: '0.06em' }}>{side === 0 ? '0' : '7'}</div>
                {/* chrome latch handle near the centre seam */}
                <div style={{ position: 'absolute', [inner]: 6, top: '50%', transform: 'translateY(-50%)', width: 9, height: 46, borderRadius: 3, background: 'linear-gradient(90deg,#cfcfcf,#6a6a6a 52%,#a4a4a4)', border: '1.5px solid #16140F', boxShadow: '0 2px 3px rgba(0,0,0,0.4)' } as CSSProperties}>
                  <div style={{ position: 'absolute', [inner === 'right' ? 'left' : 'right']: -5, top: '50%', transform: 'translateY(-50%)', width: 9, height: 16, borderRadius: 3, background: 'linear-gradient(180deg,#d6d6d6,#7a7a7a)', border: '1.5px solid #16140F' } as CSSProperties} />
                </div>
                {/* rivets on the hinge edge */}
                <Rivet style={{ top: 7, [side === 0 ? 'left' : 'right']: 7 } as CSSProperties} />
                <Rivet style={{ bottom: 7, [side === 0 ? 'left' : 'right']: 7 } as CSSProperties} />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
