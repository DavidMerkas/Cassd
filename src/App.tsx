import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, PointerEvent as ReactPointerEvent } from 'react'
import type { Screen, Task, Shelf, Category, DragState, CassetteStyle } from './types'
import { BB_SKINS, CLOSET_SKINS, PALETTE, VALUE_PER, newShelfId } from './skins'
import { load, save } from './storage'
import Cassette from './components/Cassette'
import Closet from './components/Closet'
import Studio from './components/Studio'
import Crate from './components/Crate'
import Shop from './components/Shop'
import Boombox from './components/Boombox'
import PullZones, { type PullZone } from './components/PullZones'

const initial = load()

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(initial.tasks)
  const [shelves, setShelves] = useState<Shelf[]>(initial.shelves)
  const [screen, setScreen] = useState<Screen>('closet')
  const [boomboxId, setBoomboxId] = useState<string | null>(initial.boomboxId)
  const [elapsed, setElapsed] = useState(initial.elapsed)
  const [ejectArmed, setEjectArmed] = useState(false)
  const [draftName, setDraftName] = useState('')
  const [draftShelfId, setDraftShelfId] = useState<string>(initial.shelves[0]?.id ?? '')
  const [draftHabit, setDraftHabit] = useState(false)
  const [drag, setDrag] = useState<DragState | null>(null)
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [overSlot, setOverSlot] = useState(false)
  const [pullZone, setPullZone] = useState<PullZone>(null)
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
    save({ tasks, shelves, coins, owned, equipped, playedLifetime, boomboxId, elapsed })
  }, [tasks, shelves, coins, owned, equipped, playedLifetime, boomboxId, elapsed])

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

  // which side rail the pointer is over while a tape is pulled out of the deck
  const pullZoneAt = (cx: number, cy: number): PullZone => {
    const f = frameRef.current
    if (!f) return null
    const r = f.getBoundingClientRect()
    if (cy < r.top || cy > r.bottom) return null
    const zoneW = Math.min(122, r.width * 0.32)
    if (cx < r.left + zoneW) return 'shelf'
    if (cx > r.right - zoneW) return 'crate'
    return null
  }

  const attachDrag = (
    onUp: (ev: globalThis.PointerEvent) => void,
    pull = false,
  ) => {
    const move = (ev: globalThis.PointerEvent) => {
      setDragPos(local(ev.clientX, ev.clientY))
      if (pull) setPullZone(pullZoneAt(ev.clientX, ev.clientY))
      else setOverSlot(overDock(ev.clientX, ev.clientY))
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
    setOverSlot(false)
    setPullZone(pullZoneAt(e.clientX, e.clientY))
    attachDrag(ev => {
      const zone = pullZoneAt(ev.clientX, ev.clientY)
      setDrag(null)
      setPullZone(null)
      setEjectArmed(false)
      if (zone === 'shelf') ejectShelf()
      else if (zone === 'crate') ejectDone()
      // dropped over the deck (or nowhere) — slot it back in, keep playing
    }, true)
  }

  // EJECT arms the same physical flow as pulling: tape pops out, drag/tap it left or right
  const openEject = () => setEjectArmed(a => !a)

  const ejectDone = () => {
    const t = tasks.find(x => x.id === boomboxId)
    const isHabit = !!(t && t.habit)
    setTasks(ts => ts.map(x => (x.id === boomboxId ? { ...x, state: isHabit ? 'shelf' : 'done' } : x)))
    setBoomboxId(null)
    setElapsed(0)
    setEjectArmed(false)
    setScreen(isHabit ? 'closet' : 'crate')
    if (!isHabit) flash('Into the crate ✓')
  }

  const ejectShelf = () => {
    setTasks(ts => ts.map(x => (x.id === boomboxId ? { ...x, state: 'shelf' } : x)))
    setBoomboxId(null)
    setElapsed(0)
    setEjectArmed(false)
    setScreen('closet')
  }

  const go = (s: Screen) => {
    setScreen(s)
    setEjectArmed(false)
  }

  // ---- shelves ----
  const shelfById = (id: string) => shelves.find(s => s.id === id)

  const addShelf = (): string => {
    const id = newShelfId()
    const color = PALETTE[shelves.length % PALETTE.length]
    setShelves(ss => [...ss, { id, name: 'New shelf', color }])
    return id
  }

  const renameShelf = (id: string, name: string) => {
    setShelves(ss => ss.map(s => (s.id === id ? { ...s, name } : s)))
  }

  const removeShelf = (id: string) => {
    if (shelves.length <= 1) { flash('Keep at least one shelf'); return }
    if (tasks.some(t => t.shelfId === id && t.state !== 'archived')) {
      flash('Shelf still has tapes')
      return
    }
    setShelves(ss => ss.filter(s => s.id !== id))
    setDraftShelfId(cur => (cur === id ? shelves.find(s => s.id !== id)!.id : cur))
  }

  const saveDraft = () => {
    const nm = draftName.trim()
    if (!nm) {
      flash('Name your tape first')
      return
    }
    const shelf = shelfById(draftShelfId) ?? shelves[0]
    const task: Task = { id: 'u' + Date.now(), name: nm, shelfId: shelf.id, color: shelf.color, habit: draftHabit, state: 'shelf' }
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
  const labelFor = (t: Task | null) => (t ? (shelfById(t.shelfId)?.name ?? '') : '')

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
        {/* content scrolls behind the boombox, which floats over it */}
        <div className="cassd-scroll" style={{ flex: 1, minHeight: 0, overflowY: 'auto', position: 'relative', paddingBottom: 330 }}>
          {screen === 'closet' && (
            <Closet
              shelfTasks={shelfTasks}
              shelves={shelves}
              cb={cb}
              ownedClosets={owned.closet}
              equippedCloset={equipped.closet}
              drag={drag}
              onEquipCloset={id => equip('closet', id)}
              onStartDrag={startDrag}
              onAddShelf={addShelf}
              onRenameShelf={renameShelf}
              onRemoveShelf={removeShelf}
              goShop={() => go('shop')}
              goStudio={() => go('studio')}
            />
          )}
          {screen === 'studio' && (
            <Studio
              draftName={draftName}
              shelves={shelves}
              draftShelfId={draftShelfId}
              draftHabit={draftHabit}
              cassetteStyle={cassetteStyle}
              setDraftName={setDraftName}
              setDraftShelfId={setDraftShelfId}
              onAddShelf={() => setDraftShelfId(addShelf())}
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
          <div style={{ position: 'absolute', left: '50%', bottom: 340, transform: 'translateX(-50%)', zIndex: 90, background: '#16140F', color: '#F5F1E8', fontWeight: 800, fontSize: 13, padding: '11px 18px', borderRadius: 999, boxShadow: '0 8px 20px rgba(0,0,0,0.35)', whiteSpace: 'nowrap', animation: 'cassd-rise .25s ease', display: 'flex', alignItems: 'center', gap: 8 }}>
            {toast}
          </div>
        )}

        {/* boombox dock — nav lives on the deck keys */}
        <Boombox
          dockRef={dockRef}
          bb={bb}
          playing={playing}
          showDockedCassette={!!playing && !(drag && drag.pull)}
          cassetteStyle={cassetteStyle}
          elapsed={elapsed}
          overSlot={overSlot}
          dragging={!!drag && !drag.pull}
          armed={ejectArmed}
          groupLabel={labelFor(playing)}
          screen={screen}
          go={go}
          startPull={startPull}
          openEject={openEject}
        />

        {/* side rails: shown while pulling a tape out, or when EJECT armed the pop-out */}
        {playing && ((drag && drag.pull) || ejectArmed) && (
          <PullZones
            active={pullZone}
            cb={cb}
            habit={!!playing.habit}
            interactive={ejectArmed && !(drag && drag.pull)}
            onShelf={ejectShelf}
            onCrate={ejectDone}
          />
        )}

        {/* drag ghost */}
        {drag && dragTask && (
          <div style={{ position: 'absolute', left: dragPos.x, top: dragPos.y, zIndex: 80, transform: `translate(-50%, -50%) rotate(${drag.pull ? (pullZone === 'shelf' ? -12 : pullZone === 'crate' ? 12 : 0) : (overSlot ? -1 : -6)}deg) scale(${drag.pull ? (pullZone ? 1.05 : 1) : (overSlot ? 0.92 : 1)})`, transition: 'transform .16s ease', pointerEvents: 'none', filter: 'drop-shadow(0 14px 20px rgba(0,0,0,0.4))' } as CSSProperties}>
            <Cassette title={dragTask.name} color={dragTask.color} group={labelFor(dragTask)} state="shelf" cstyle={cassetteStyle} habit={dragTask.habit} w={150} />
          </div>
        )}

      </div>
    </div>
  )
}
