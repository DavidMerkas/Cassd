export const GROUPS = [
  { key: 'WORK', color: '#FF5C28' },
  { key: 'RITUAL', color: '#FFD23F' },
  { key: 'BODY', color: '#2BB3A3' },
  { key: 'MIND', color: '#3D7BFF' },
  { key: 'LIFE', color: '#E84393' },
] as const

export interface BoomboxSkin {
  name: string
  body: string
  trim: string
  base: string
  metal: string
  cone: string
  screen: string
  knob: string
  glow: string
}

export const BB_SKINS: Record<string, BoomboxSkin> = {
  retro: { name: 'Retro Pop', body: '#E93D95', trim: '#FF6CB4', base: '#A81E6E', metal: '#F5C542', cone: '#E8541E', screen: '#0c1f1a', knob: '#33D6C0', glow: 'rgba(90,255,205,0.45)' },
  midnight: { name: 'Midnight', body: '#3A3B40', trim: '#54555c', base: '#26272b', metal: '#cdc9c0', cone: '#E8541E', screen: '#0c1f16', knob: '#8a8b92', glow: 'rgba(124,255,90,0.4)' },
  sunset: { name: 'Sunset', body: '#F2762E', trim: '#FFD23F', base: '#C6461B', metal: '#FFE08A', cone: '#7A2A12', screen: '#241a10', knob: '#FFD23F', glow: 'rgba(255,194,75,0.5)' },
  mint: { name: 'Mint Cream', body: '#4FC9A8', trim: '#F5F1E8', base: '#2E9C82', metal: '#eafff8', cone: '#123f34', screen: '#0c241d', knob: '#F5F1E8', glow: 'rgba(124,255,214,0.5)' },
  grape: { name: 'Grape Soda', body: '#7B5CD6', trim: '#F25CA2', base: '#4E3399', metal: '#e7dcff', cone: '#2a1a5e', screen: '#160c2a', knob: '#2fd0c8', glow: 'rgba(210,140,255,0.5)' },
}

export interface ClosetSkin {
  name: string
  frame: string
  back: string
  board: string
  ink: string
  inkDim: string
}

export const CLOSET_SKINS: Record<string, ClosetSkin> = {
  oak: { name: 'Oak', frame: '#b9834a', back: 'linear-gradient(180deg,#e8dcc4,#dbcaa8)', board: 'linear-gradient(180deg,#c68a4e,#9c6835 45%,#7c4f26)', ink: '#4a3320', inkDim: 'rgba(74,51,32,0.45)' },
  walnut: { name: 'Walnut', frame: '#5c3a24', back: 'linear-gradient(180deg,#cdb89c,#b8a082)', board: 'linear-gradient(180deg,#6f4a30,#503321 45%,#3a2416)', ink: '#3a2416', inkDim: 'rgba(58,36,22,0.5)' },
  cherry: { name: 'Cherry', frame: '#8a2f2a', back: 'linear-gradient(180deg,#ecd4cb,#e0bdb2)', board: 'linear-gradient(180deg,#b24a3f,#8a2f2a 45%,#63201c)', ink: '#63201c', inkDim: 'rgba(99,32,28,0.5)' },
  mintlam: { name: 'Mint Lam', frame: '#3f8f7a', back: 'linear-gradient(180deg,#e2f3ec,#cfe9df)', board: 'linear-gradient(180deg,#66c1a8,#3f8f7a 45%,#2c6a59)', ink: '#245244', inkDim: 'rgba(36,82,68,0.5)' },
  noir: { name: 'Noir', frame: '#26241f', back: 'linear-gradient(180deg,#454139,#312e28)', board: 'linear-gradient(180deg,#33302b,#1d1b18 45%,#0e0d0b)', ink: '#e8e2d4', inkDim: 'rgba(232,226,212,0.45)' },
}

export const CASSETTE_SKINS: Record<string, { name: string; sub: string }> = {
  sticker: { name: 'Sticker', sub: 'bold black outline' },
  clean: { name: 'Clean', sub: 'minimal & flat' },
  retro: { name: 'Retro Foil', sub: 'glossy vintage sheen' },
}

export const CATALOG = {
  boombox: [
    { id: 'retro', price: 0 }, { id: 'midnight', price: 0 },
    { id: 'sunset', price: 45 }, { id: 'mint', price: 45 }, { id: 'grape', price: 90 },
  ],
  closet: [
    { id: 'oak', price: 0 }, { id: 'walnut', price: 0 },
    { id: 'cherry', price: 35 }, { id: 'mintlam', price: 35 }, { id: 'noir', price: 70 },
  ],
  cassette: [
    { id: 'sticker', price: 0 }, { id: 'clean', price: 0 }, { id: 'retro', price: 30 },
  ],
} as const

export const VALUE_PER = 12
