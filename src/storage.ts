import type { Task, Owned, Equipped } from './types'

const KEY = 'cassd:v1'

export interface Persisted {
  tasks: Task[]
  coins: number
  owned: Owned
  equipped: Equipped
  playedLifetime: number
  boomboxId: string | null
  elapsed: number
}

export const DEFAULTS: Persisted = {
  tasks: [],
  coins: 0,
  owned: { boombox: ['retro', 'midnight'], closet: ['oak', 'walnut'], cassette: ['sticker', 'clean'] },
  equipped: { boombox: 'retro', closet: 'oak', cassette: 'sticker' },
  playedLifetime: 0,
  boomboxId: null,
  elapsed: 0,
}

export function load(): Persisted {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    const p = { ...DEFAULTS, ...JSON.parse(raw) } as Persisted
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
