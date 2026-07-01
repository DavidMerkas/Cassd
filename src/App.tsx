import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent, ReactNode } from 'react'
import type { Screen, Task, Category, DragState, CassetteStyle } from './types'
import { GROUPS, BB_SKINS, CLOSET_SKINS, VALUE_PER } from './skins'
import { load, save } from './storage'
import Cassette from './components/Cassette'
import Closet from './components/Closet'
import Studio from './components/Studio'
import Crate from './components/Crate'
import Shop from './components/Shop'
import Boombox from './components/Boombox'
import EjectOverlay from './components/EjectOverlay'

const initial = load()

function NavButton({ active, label, onClick, children, badge }: {
  active: boolean
  label: string
  onClick: () => void
  children: ReactNode
  badge?: number
}) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
        border: 'none', background: active ? '#16140F' : 'transparent',
        borderRadius: 12, padding: '8px 0 6px', cursor: 'pointer',
        color: active ? '#F5F1E8' : 'rgba(22,20,15,0.4)',
        transition: 'background .16s ease',
      }}
    >
      {children}
      <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: '0.03em' }}>{label}</span>
      {badge != null && badge > 0 && (
        <span style={{ position: 'absolute', top: 4, right: 'calc(50% - 22px)', minWidth: 16, height: 16, padding: '0 4px', borderRadius: 999, background: '#FF5C28', border: '1.5px solid #16140F', color: '#16140F', fontFamily: 'Anton, sans-serif', fontSize: 9.5, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {badge}
        </span>
      )}
    </button>
  )
}

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initial.tasks)
  const [screen, setScreen] = useState<Screen>('closet')
  const [boomboxId, setBoomboxId] = useState<string | null>(initial.boomboxId)
  const [elapsed, setElapsed] = useState(initial.elapsed)
  const [ejecting, setEjecting] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftGroup, setDraftGroup] = useState(0)
  const [draftHabit, setDraftHabit] = useState(false)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [overSlot, setOverSlot] = useState(false)
  const [coins, setCoins] = useState(initial.coins)
  const [owned, setOwned] = useState(initial.owned)
  const [equipped, setEquipped] = useState(initial.equipped)
  const [playedLifetime, setPlayedLifetime] = useState(initial.playedLifetime)
  const [coinBump, setCoinBump] = useState(0)
  const [toast, setToast] = useState<string | null>(null)

  const frameRef = useRef<HTMLDivElement>(null)
  const dockRef = useRef<HTMLDivElement>(null)
  const detachRef = useRef<(() => void) | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // tick the deck timer while a tape is playing
  useEffect(() => {
    if (!boomboxId) return
    const t = setInterval(() => setElapsed(e => e + 1), 1000)
    return () => clearInterval(t)
  }, [boomboxId])

  // persist everything that matters
  useEffect(() => {
    save({ tasks, coins, owned, equipped, playedLifetime, boomboxId, elapsed })
  }, [tasks, coins, owned, equipped, playedLifetime, boomboxId, elapsed])

  useEffect(() => () => {
    detachRef.current?.()
    if (toastTimer.current) clearTimeout(toastTimer.current)
  }, [])

  const flash = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 1900)
  }

  const local = (cx: number, cy: number) => {
    const f = frameRef.current
    if (!f) return { x: cx, y: cy }
    const r = f.getBoundingClientRect()
    return { x: cx - r.left, y: cy - r.top }
  }

  const overDock = (cx: number, cy: number) => {
    const d = dockRef.current
    if (!d) return false
    const r = d.getBoundingClientRect()
    return cx >= r.left && cx <= r.right && cy >= r.top - 24 && cy <= r.bottom
  }

  const attachDrag = (
    onUp: (ev: globalThis.PointerEvent) => void,
  ) => {
    const move = (ev: globalThis.PointerEvent) => {
      setDragPos(local(ev.clientX, ev.clientY))
      setOverSlot(overDock(ev.clientX, ev.clientY))
    }
    const up = (ev: globalThis.PointerEvent) => {
      detachRef.current?.()
      onUp(ev)
    }
    detachRef.current = () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('pointercancel', up)
      detachRef.current = null
    }
    window.addEventListener('pointermove', move, { passive: false })
    window.addEventListener('pointerup', up)
    window.addEventListener('pointercancel', up)
  }

  const insert = (id: string) => {
    setTasks(ts => ts.map(t => {
      if (t.id === id) return { ...t, state: 'playing' as const }
      if (t.state === 'playing') return { ...t, state: 'shelf' as const }
      return t
    }))
    setBoomboxId(id)
    setElapsed(0)
  }

  const startDrag = (id: string, e: ReactPointerEvent) => {
    e.preventDefault()
    setDrag({ id })
    setDragPos(local(e.clientX, e.clientY))
    setOverSlot(false)
    attachDrag(ev => {
      if (overDock(ev.clientX, ev.clientY)) insert(id)
      setDrag(null)
      setOverSlot(false)
    })
  }

  const startPull = (e: ReactPointerEvent) => {
    e.preventDefault()
    const id = boomboxId
    if (!id) return
    setDrag({ id, pull: true })
    setDragPos(local(e.clientX, e.clientY))
    setOverSlot(true)
    attachDrag(ev => {
      const onDock = overDock(ev.clientX, ev.clientY)
      setDrag(null)
      setOverSlot(false)
      setEjecting(!onDock)
    })
  }

  const openEject = () => setEjecting(true)
  const closeEject = () => setEjecting(false)

  const ejectDone = () => {
    const t = tasks.find(x => x.id === boomboxId)
    const isHabit = !!(t && t.habit)
    setTasks(ts => ts.map(x => (x.id === boomboxId ? { ...x, state: isHabit ? 'shelf' : 'done' } : x)))
    setBoomboxId(null)
    setElapsed(0)
    setEjecting(false)
    setScreen(isHabit ? 'closet' : 'crate')
    if (!isHabit) flash('Into the crate ✓')
  }

  const ejectShelf = () => {
    setTasks(ts => ts.map(x => (x.id === boomboxId ? { ...x, state: 'shelf' } : x)))
    setBoomboxId(null)
    setElapsed(0)
    setEjecting(false)
    setScreen('closet')
  }

  const go = (s: Screen) => {
    setScreen(s)
    setEjecting(false)
  }

  const saveDraft = () => {
    const nm = draftName.trim()
    if (!nm) {
      flash('Name your tape first')
      return
    }
    const g = GROUPS[draftGroup]
    const task: Task = { id: 'u' + Date.now(), name: nm, group: g.key, color: g.color, habit: draftHabit, state: 'shelf' }
    setTasks(ts => [task, ...ts])
    setDraftName('')
    setDraftHabit(false)
    setScreen('closet')
    flash('Printed → in the closet')
  }

  const emptyCrate = () => {
    const crate = tasks.filter(t => t.state === 'done')
    if (!crate.length) {
      flash('Crate is empty')
      return
    }
    const gain = crate.length * VALUE_PER
    setTasks(ts => ts.map(t => (t.state === 'done' ? { ...t, state: 'archived' } : t)))
    setCoins(c => c + gain)
    setPlayedLifetime(n => n + crate.length)
    setCoinBump(n => n + 1)
    flash(`+${gain} coins cashed in`)
  }

  const equip = (cat: Category, id: string) => {
    setEquipped(eq => ({ ...eq, [cat]: id }))
  }

  const buyOrEquip = (cat: Category, id: string, price: number) => {
    if (equipped[cat] === id) return
    if (owned[cat].includes(id)) {
      equip(cat, id)
      flash('Equipped')
      return
    }
    if (coins < price) {
      flash('Not enough coins')
      return
    }
    setCoins(c => c - price)
    setOwned(o => ({ ...o, [cat]: [...o[cat], id] }))
    setEquipped(eq => ({ ...eq, [cat]: id }))
    flash('Bought & equipped ✓')
  }

  const bb = BB_SKINS[equipped.boombox] ?? BB_SKINS.retro
  const cb = CLOSET_SKINS[equipped.closet] ?? CLOSET_SKINS.oak
  const cassetteStyle = (equipped.cassette || 'sticker') as CassetteStyle

  const shelfTasks = tasks.filter(t => t.state === 'shelf')
  const crateItems = tasks.filter(t => t.state === 'done')
  const playing = tasks.find(t => t.id === boomboxId) ?? null
  const dragTask = drag ? tasks.find(t => t.id === drag.id) ?? null : null

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: 24, fontFamily: 'Inter, sans-serif' }}>
      <div
        ref={frameRef}
        style={{
          position: 'relative', width: 412, height: 'min(880px, calc(100dvh - 48px))',
          borderRadius: 34, overflow: 'hidden', background: '#ECE5D6',
          boxShadow: '0 30px 80px rgba(0,0,0,0.35), 0 2px 0 rgba(255,255,255,0.4) inset',
          display: 'flex', flexDirection: 'column',
        }}
      >
        {/* header */}
        <div style={{ flex: 'none', padding: '20px 20px 10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: '#16140F', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #16140F', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}>
              <div style={{ display: 'flex', gap: 2.5, alignItems: 'flex-end', height: 15 }}>
                <span style={{ width: 3, height: 8, background: '#FF5C28' }} />
                <span style={{ width: 3, height: 15, background: '#FFD23F' }} />
                <span style={{ width: 3, height: 11, background: '#2BB3A3' }} />
              </div>
            </div>
            <div>
              <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 24, lineHeight: 0.85, color: '#16140F' }}>CASSD</div>
              <div style={{ fontSize: 9.5, fontWeight: 700, color: '#16140F', opacity: 0.45, letterSpacing: '0.03em' }}>tasks on tape</div>
            </div>
          </div>
          <button
            onClick={() => go('shop')}
            style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#16140F', border: '2px solid #16140F', borderRadius: 999, padding: '6px 12px 6px 7px', cursor: 'pointer', boxShadow: '2px 2px 0 rgba(0,0,0,0.15)' }}
          >
            <span
              key={coinBump}
              style={{ width: 22, height: 22, borderRadius: '50%', background: 'radial-gradient(circle at 38% 34%, #FFE79A, #FFD23F 55%, #E0A81E)', border: '2px solid #B7860E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton, sans-serif', fontSize: 12, color: '#7a5b06', animation: coinBump ? 'cassd-coin .5s ease' : 'none' }}
            >
              ¢
            </span>
            <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 17, color: '#FFD23F', letterSpacing: '0.02em', fontVariantNumeric: 'tabular-nums', paddingRight: 3 }}>{coins}</span>
          </button>
        </div>

        {/* content */}
        <div className="cassd-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative' }}>
          {screen === 'closet' && (
            <Closet
              shelfTasks={shelfTasks}
              cb={cb}
              ownedClosets={owned.closet}
              equippedCloset={equipped.closet}
              drag={drag}
              onEquipCloset={id => equip('closet', id)}
              onStartDrag={startDrag}
              goShop={() => go('shop')}
              goStudio={() => go('studio')}
            />
          )}
          {screen === 'studio' && (
            <Studio
              draftName={draftName}
              draftGroup={draftGroup}
              draftHabit={draftHabit}
              cassetteStyle={cassetteStyle}
              setDraftName={setDraftName}
              setDraftGroup={setDraftGroup}
              toggleDraftHabit={() => setDraftHabit(h => !h)}
              saveDraft={saveDraft}
            />
          )}
          {screen === 'crate' && (
            <Crate crateItems={crateItems} playedLifetime={playedLifetime} emptyCrate={emptyCrate} />
          )}
          {screen === 'shop' && (
            <Shop coins={coins} owned={owned} equipped={equipped} buyOrEquip={buyOrEquip} />
          )}
        </div>

        {/* toast */}
        {toast && (
          <div style={{ position: 'absolute', left: '50%', bottom: 320, transform: 'translateX(-50%)', zIndex: 90, background: '#16140F', color: '#F5F1E8', fontWeight: 800, fontSize: 13, padding: '11px 18px', borderRadius: 999, boxShadow: '0 8px 20px rgba(0,0,0,0.35)', whiteSpace: 'nowrap', animation: 'cassd-rise .25s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
            {toast}
          </div>
        )}

        {/* nav bar */}
        <div style={{ flex: 'none', background: '#ECE5D6', borderTop: '2px solid rgba(22,20,15,0.1)', padding: '7px 10px 8px', display: 'flex', gap: 6 }}>
          <NavButton active={screen === 'closet'} label="CLOSET" onClick={() => go('closet')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="3" width="16" height="18" rx="1.5" /><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="9" y1="5.5" x2="9" y2="6.5" /></svg>
          </NavButton>
          <NavButton active={screen === 'studio'} label="STUDIO" onClick={() => go('studio')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20l4.5-1.2L19 8.3l-3.3-3.3L5.2 15.5 4 20z" /><path d="M13.5 6.5l3.3 3.3" /></svg>
          </NavButton>
          <NavButton active={screen === 'crate'} label="CRATE" onClick={() => go('crate')} badge={crateItems.length}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8h17l-1 12.5H4.5z" /><path d="M3.5 8l2.2-4h12.6L20.5 8" /><line x1="12" y1="8" x2="12" y2="20.5" /></svg>
          </NavButton>
          <NavButton active={screen === 'shop'} label="SHOP" onClick={() => go('shop')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 8h14l-1.2 12.5H6.2z" /><path d="M8.5 8a3.5 3.5 0 0 1 7 0" /></svg>
          </NavButton>
        </div>

        {/* boombox dock */}
        <Boombox
          dockRef={dockRef}
          bb={bb}
          playing={playing}
          showDockedCassette={!!playing && !(drag && drag.pull)}
          cassetteStyle={cassetteStyle}
          elapsed={elapsed}
          overSlot={overSlot}
          dragging={!!drag && !drag.pull}
          startPull={startPull}
          openEject={openEject}
        />

        {/* drag ghost */}
        {drag && dragTask && (
          <div style={{ position: 'absolute', left: dragPos.x, top: dragPos.y, zIndex: 80, transform: `translate(-50%, -50%) rotate(${overSlot ? '-1deg' : '-6deg'}) scale(${overSlot ? 0.92 : 1})`, transition: 'transform .16s ease', pointerEvents: 'none', filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.4))' } as CSSProperties}>
            <Cassette title={dragTask.name} color={dragTask.color} group={dragTask.group} state="shelf" cstyle={cassetteStyle} habit={dragTask.habit} w={150} />
          </div>
        )}

        {/* eject overlay */}
        {ejecting && playing && (
          <EjectOverlay
            playing={playing}
            cassetteStyle={cassetteStyle}
            ejectShelf={ejectShelf}
            ejectDone={ejectDone}
            closeEject={closeEject}
          />
        )}
      </div>
    </div>
  )
}
