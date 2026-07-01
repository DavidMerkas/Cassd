import type { CSSProperties } from 'react'
import type { Category, Owned, Equipped } from '../types'
import { BB_SKINS, CLOSET_SKINS, CASSETTE_SKINS, CATALOG } from '../skins'

interface Props {
  coins: number
  owned: Owned
  equipped: Equipped
  buyOrEquip: (cat: Category, id: string, price: number) => void
}

interface ShopItem {
  id: string
  name: string
  sub: string
  preview: string
  previewAccent: string
  price: number
  cat: Category
}

export default function Shop({ coins, owned, equipped, buyOrEquip }: Props) {
  const sections: { title: string; items: ShopItem[] }[] = [
    {
      title: 'BOOMBOX SKINS',
      items: CATALOG.boombox.map(o => {
        const k = BB_SKINS[o.id]
        return {
          id: o.id, cat: 'boombox' as Category, price: o.price,
          name: k.name, sub: o.price === 0 ? 'starter' : 'premium skin',
          preview: k.body,
          previewAccent:
            `radial-gradient(circle at 30% 60%, ${k.cone} 0 22%, transparent 24%),` +
            `radial-gradient(circle at 78% 60%, ${k.cone} 0 22%, transparent 24%),` +
            `linear-gradient(180deg, ${k.trim} 0 26%, transparent 26%)`,
        }
      }),
    },
    {
      title: 'CLOSET FINISHES',
      items: CATALOG.closet.map(o => {
        const k = CLOSET_SKINS[o.id]
        return {
          id: o.id, cat: 'closet' as Category, price: o.price,
          name: k.name, sub: o.price === 0 ? 'starter' : 'premium wood',
          preview: k.board, previewAccent: 'transparent',
        }
      }),
    },
    {
      title: 'CASSETTE STYLES',
      items: CATALOG.cassette.map(o => {
        const k = CASSETTE_SKINS[o.id]
        return {
          id: o.id, cat: 'cassette' as Category, price: o.price,
          name: k.name, sub: k.sub,
          preview: '#FF5C28', previewAccent: 'linear-gradient(180deg, #F5F1E8 0 40%, transparent 40%)',
        }
      }),
    },
  ]

  return (
    <div style={{ padding: '6px 18px 22px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '2px 2px 16px' }}>
        <div>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 19, color: '#16140F', letterSpacing: '0.02em' }}>THE SHOP</div>
          <div style={{ fontSize: 12, color: 'rgba(22,20,15,0.5)', marginTop: 2 }}>Spend coins on gear that sticks.</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#16140F', borderRadius: 999, padding: '5px 12px 5px 6px' }}>
          <span style={{ width: 20, height: 20, borderRadius: '50%', background: 'radial-gradient(circle at 38% 34%, #FFE79A, #FFD23F 55%, #E0A81E)', border: '2px solid #B7860E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Anton, sans-serif', fontSize: 11, color: '#7a5b06' }}>¢</span>
          <span style={{ fontFamily: 'Anton, sans-serif', fontSize: 16, color: '#FFD23F', fontVariantNumeric: 'tabular-nums' }}>{coins}</span>
        </div>
      </div>

      {sections.map(sec => (
        <div key={sec.title} style={{ marginBottom: 20 }}>
          <div style={{ fontFamily: 'Anton, sans-serif', fontSize: 14, color: '#16140F', letterSpacing: '0.03em', margin: '0 2px 9px' }}>{sec.title}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
            {sec.items.map(it => {
              const isOwned = owned[it.cat].includes(it.id)
              const eq = equipped[it.cat] === it.id
              return (
                <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#F7F2E7', border: '2px solid #16140F', borderRadius: 13, padding: '9px 10px', boxShadow: '0 3px 0 rgba(22,20,15,0.12)' }}>
                  <div style={{ width: 52, height: 44, borderRadius: 9, background: it.preview, border: '2px solid #16140F', flex: 'none', overflow: 'hidden', position: 'relative' }}>
                    <div style={{ position: 'absolute', inset: 0, background: it.previewAccent }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: 14, color: '#16140F' }}>{it.name}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(22,20,15,0.45)' }}>{it.sub}</div>
                  </div>
                  <button
                    onClick={() => buyOrEquip(it.cat, it.id, it.price)}
                    style={{
                      border: '2px solid #16140F',
                      background: eq ? '#2BB3A3' : isOwned ? '#FFD23F' : coins >= it.price ? '#FF5C28' : '#E4DCCB',
                      color: '#16140F',
                      fontFamily: 'Anton, sans-serif', fontSize: 12.5, letterSpacing: '0.02em',
                      padding: '9px 13px', borderRadius: 10,
                      cursor: eq ? 'default' : 'pointer',
                      boxShadow: eq ? 'none' : '0 3px 0 #16140F',
                      display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                    } as CSSProperties}
                  >
                    {eq ? 'EQUIPPED' : isOwned ? 'EQUIP' : `¢ ${it.price}`}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
