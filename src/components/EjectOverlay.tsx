import type { Task, CassetteStyle } from '../types'
import Cassette from './Cassette'

interface Props {
  playing: Task
  cassetteStyle: CassetteStyle
  ejectShelf: () => void
  ejectDone: () => void
  closeEject: () => void
}

export default function EjectOverlay({ playing, cassetteStyle, ejectShelf, ejectDone, closeEject }: Props) {
  const habit = playing.habit

  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 70, background: 'rgba(13,12,9,0.72)', backdropFilter: 'blur(3px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 26, gap: 18 }}>
      <div style={{ animation: 'cassd-bob 2.4s ease-in-out infinite' }}>
        <Cassette title={playing.name} color={playing.color} group={playing.group} state="shelf" cstyle={cassetteStyle} habit={playing.habit} w={180} />
      </div>
      <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 25, color: '#F5F1E8', textAlign: 'center' }}>
        Tape's out.
        <br />
        Where does it go?
      </div>
      <div style={{ width: '100%', maxWidth: 320, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button
          onClick={ejectShelf}
          style={{ width: '100%', border: '3px solid #0D0C09', background: '#F5F1E8', color: '#16140F', fontFamily: 'Inter, sans-serif', fontWeight: 800, textAlign: 'left', padding: '15px 18px', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 5px 0 #0D0C09' }}
        >
          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 22 }}>↩</span>
          <span>
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 16, letterSpacing: '0.03em', display: 'block' }}>Back to the closet</span>
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.65 }}>still pending — no guilt</span>
          </span>
        </button>
        <button
          onClick={ejectDone}
          style={{ width: '100%', border: '3px solid #0D0C09', background: '#2BB3A3', color: '#0D0C09', fontFamily: 'Inter, sans-serif', fontWeight: 800, textAlign: 'left', padding: '15px 18px', borderRadius: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 5px 0 #0D0C09' }}
        >
          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 23 }}>✓</span>
          <span>
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 16, letterSpacing: '0.03em', display: 'block' }}>
              {habit ? 'Done — rewind it' : 'Into the crate'}
            </span>
            <span style={{ fontSize: 12, fontWeight: 600, opacity: 0.75 }}>
              {habit ? 'habits rewind to the closet' : 'played in full, worth coins'}
            </span>
          </span>
        </button>
      </div>
      <button onClick={closeEject} style={{ border: 'none', background: 'none', color: 'rgba(245,241,232,0.55)', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginTop: 2 }}>
        keep playing
      </button>
    </div>
  )
}
