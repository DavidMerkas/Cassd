export type Screen = 'closet' | 'studio' | 'crate' | 'shop'
export type TaskState = 'shelf' | 'playing' | 'done' | 'archived'

export interface Task {
  id: string
  name: string
  group: string
  color: string
  habit: boolean
  state: TaskState
}

export type Category = 'boombox' | 'closet' | 'cassette'
export type CassetteStyle = 'sticker' | 'clean' | 'retro'

export interface Owned {
  boombox: string[]
  closet: string[]
  cassette: string[]
}

export interface Equipped {
  boombox: string
  closet: string
  cassette: string
}

export interface DragState {
  id: string
  pull?: boolean
}
