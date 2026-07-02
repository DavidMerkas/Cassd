import type { CSSProperties } from 'react'
import type { CassetteStyle, Shelf } from '../types'
import { inkOn } from '../util'
import Cassette from './Cassette'

interface Props {
  draftName: string
  shelves: Shelf[]
  draftShelfId: string
  draftHabit: boolean
  cassetteStyle: CassetteStyle
  setDraftName: (v: string) => void
  setDraftShelfId: (id: string) => void
  onAddShelf: () => void
  toggleDraftHabit: () => void
  saveDraft: () => void
}

export default function Studio({
  draftName, shelves, draftShelfId, draftHabit, cassetteStyle,
  setDraftName, setDraftShelfId, onAddShelf, toggleDraftHabit, saveDraft,
}: Props) {
  const shelf = shelves.find(s => s.id === draftShelfId) ?? shelves[0]
  const named = draftName.trim().length > 0

  return (
    <div style={{ padding: '6px 18px 22px' }}>
      <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 19, color: '#16140F', letterSpacing: '0.02em', margin: '2px 2px 4px' }}>THE STUDIO</div>
      <div style={{ fontSize: 12, color: 'rgba(22,20,15,0.5)', margin: '0 2px 14px' }}>Cut a fresh tape for something you need to do.</div>

      {/* live preview stage */}
      <div style={{ background: '#16140F', border: '3px solid #16140F', borderRadius: 16, padding: '22px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(0,0,0,0.22)', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0 2px, transparent 2px 22px)', pointerEvents: 'none' }} />
        <div style={{ animation: 'cassd-bob 3s ease-in-out infinite' }}>
          <Cassette
            title={draftName.trim() || 'Your task…'}
            color={shelf.color}
            group={shelf.name}
            state="shelf"
            cstyle={cassetteStyle}
            habit={draftHabit}
            w={228}
          />
        </div>
      </div>

      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(22,20,15,0.45)', margin: '18px 2px 8px' }}>TASK</div>
      <input
        value={draftName}
        onChange={e => setDraftName(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') saveDraft() }}
        placeholder="What do you need to do?"
        style={{ width: '100%', border: '2.5px solid #16140F', borderRadius: 12, padding: '14px 15px', fontFamily: 'Inter, sans-serif', fontWeight: 600, fontSize: 15, color: '#16140F', background: '#fff', outline: 'none', boxShadow: '0 3px 0 rgba(22,20,15,0.12)' }}
      />

      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', color: 'rgba(22,20,15,0.45)', margin: '18px 2px 8px' }}>SHELF</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {shelves.map(sh => {
          const on = sh.id === shelf.id
          return (
            <button
              key={sh.id}
              onClick={() => setDraftShelfId(sh.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                border: '2px solid #16140F',
                background: on ? sh.color : '#F5F1E8',
                color: on ? inkOn(sh.color) : '#16140F',
                fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 12,
                padding: '9px 13px', borderRadius: 999, cursor: 'pointer',
              }}
            >
              <span style={{ width: 11, height: 11, borderRadius: '50%', background: sh.color, border: '1.5px solid #16140F' }} />
              {sh.name}
            </button>
          )
        })}
        <button
          onClick={onAddShelf}
          title="New shelf"
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            border: '2px dashed rgba(22,20,15,0.35)', background: 'transparent',
            color: 'rgba(22,20,15,0.55)', fontFamily: 'Inter, sans-serif', fontWeight: 800, fontSize: 12,
            padding: '9px 13px', borderRadius: 999, cursor: 'pointer',
          }}
        >
          <span style={{ fontSize: 15, lineHeight: 0 }}>+</span> shelf
        </button>
      </div>

      <button
        onClick={toggleDraftHabit}
        style={{
          marginTop: 16, display: 'flex', alignItems: 'center', gap: 11,
          border: '2px solid #16140F', background: draftHabit ? '#FFD23F' : '#F5F1E8',
          color: '#16140F', fontFamily: 'Inter, sans-serif', fontWeight: 700, fontSize: 13,
          padding: '12px 15px', borderRadius: 13, cursor: 'pointer', width: '100%', textAlign: 'left',
        }}
      >
        <span style={{ width: 34, height: 20, borderRadius: 999, background: draftHabit ? '#FFD23F' : '#d9d2c2', border: '2px solid #16140F', position: 'relative', flex: 'none', transition: 'background .15s ease' }}>
          <span style={{ position: 'absolute', top: 1, left: draftHabit ? 16 : 2, width: 14, height: 14, borderRadius: '50%', background: '#16140F', transition: 'left .15s ease' }} />
        </span>
        <span style={{ flex: 1 }}>
          Make it a <b>habit</b>
          <br />
          <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.6 }}>rewinds to the closet after each play</span>
        </span>
      </button>

      <button
        onClick={saveDraft}
        className="press"
        style={{
          marginTop: 18, width: '100%', border: '2.5px solid #16140F',
          background: named ? '#FF5C28' : '#E4DCCB', color: '#16140F',
          fontFamily: 'Anton, sans-serif', fontSize: 18, letterSpacing: '0.05em',
          padding: 15, borderRadius: 14, cursor: named ? 'pointer' : 'not-allowed',
          '--sh': '0 5px 0 #16140F', '--sh-a': '0 2px 0 #16140F',
        } as CSSProperties}
      >
        ⏺ PRINT CASSETTE
      </button>
      <div style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'rgba(22,20,15,0.4)', marginTop: 9 }}>
        {named ? 'lands in your closet, ready to play' : 'give your tape a name to print it'}
      </div>
    </div>
  )
}
