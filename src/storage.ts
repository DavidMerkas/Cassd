import type { Task, Shelf, Owned, Equipped } from './types'
import { GROUPS, defaultShelves } from './skins'

const KEY = 'cassd:v1'

export interface Persisted {
  tasks: Task[]
  shelves: Shelf[]
  coins: number
  owned: Owned
  equipped: Equipped
  playedLifetime: number
  boomboxId: string | null
  elapsed: number
}

export const DEFAULTS: Persisted = {
  tasks: [],
  shelves: defaultShelves(),
  coins: 0,
  owned: { boombox: ['retro', 'midnight'], closet: ['oak', 'walnut'], cassette: ['sticker', 'clean'] },
  equipped: { boombox: 'retro', closet: 'oak', cassette: 'sticker' },
  playedLifetime: 0,
  boomboxId: null,
  elapsed: 0,
}

// tasks created before custom shelves carried a `group` string instead of a shelfId.
// build a shelf per distinct group and remap those tasks onto it.
function migrateShelves(p: Persisted): Persisted {
  const legacy = p.tasks as unknown as Array<Task & { group?: string }>
  const needs = legacy.some(t => !t.shelfId && t.group)
  if (!needs && p.shelves?.length) return p

  const shelves: Shelf[] = p.shelves?.length ? [...p.shelves] : []
  const shelfForGroup = (group: string): string => {
    const name = group.charAt(0) + group.slice(1).toLowerCase()
    let s = shelves.find(x => x.name.toLowerCase() === name.toLowerCase())
    if (!s) {
      const color = GROUPS.find(g => g.key === group)?.color ?? '#FF5C28'
      s = { id: 'shelf-' + group.toLowerCase(), name, color }
      shelves.push(s)
    }
    return s.id
  }
  const tasks = legacy.map(t => {
    if (t.shelfId) return t as Task
    const shelfId = t.group ? shelfForGroup(t.group) : (shelves[0]?.id ?? defaultShelves()[0].id)
    const { group: _drop, ...rest } = t
    return { ...rest, shelfId } as Task
  })
  return { ...p, shelves: shelves.length ? shelves : defaultShelves(), tasks }
}

export function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    const p = migrateShelves({ ...DEFAULTS, ...JSON.parse(raw) } as Persisted)
    // a tape can only be "playing" if it is actually in the deck
    p.tasks = p.tasks.map(t =>
      t.state === 'playing' && t.id !== p.boomboxId ? { ...t, state: 'shelf' } : t,
    )
    if (p.boomboxId && !p.tasks.some(t => t.id === p.boomboxId && t.state === 'playing')) {
      p.boomboxId = null
      p.elapsed = 0
    }
    return p
  } catch {
    return DEFAULTS
  }
}

export function save(p: Persisted) {
  try {
    localStorage.setItem(KEY, JSON.stringify(p))
  } catch {
    // storage full or unavailable — the app keeps working in-memory
  }
}
