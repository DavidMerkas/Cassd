import type { CSSProperties } from 'react'
import type { CassetteStyle } from '../types'
import { inkOn } from '../util'

interface Props {
  title: string
  color: string
  group: string
  state: 'shelf' | 'playing'
  cstyle: CassetteStyle
  habit: boolean
  /** rendered width in px; the tape is designed at 228×142 and scaled */
  w: number
}

const BASE_W = 228
const BASE_H = 142

function Reel({ spinning, dur }: { spinning: boolean; dur: string }) {
  return (
    <div
      style={{
        width: 27,
        height: 27,
        borderRadius: '50%',
        border: '2.5px solid #F5F1E8',
        background: '#0D0C09',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 'none',
      }}
    >
      <div
        style={{
          width: 17,
          height: 17,
          borderRadius: '50%',
          background: 'repeating-conic-gradient(#F5F1E8 0 22deg, #0D0C09 22deg 60deg)',
          border: '1.5px solid #F5F1E8',
          animation: spinning ? `cassd-spin ${dur} linear infinite` : 'none',
        }}
      />
    </div>
  )
}

export default function Cassette({ title, color, group, state, cstyle, habit, w }: Props) {
  const playing = state === 'playing'
  const ink = inkOn(color)
  const sticker = cstyle === 'sticker'
  const retro = cstyle === 'retro'
  const clean = cstyle === 'clean'

  const body: CSSProperties = {
    position: 'absolute',
    inset: 0,
    borderRadius: 12,
    background: color,
    border: clean ? '2px solid #16140F' : '3px solid #16140F',
    boxShadow: clean ? 'none' : '3px 3px 0 rgba(0,0,0,0.18)',
    overflow: 'hidden',
  }

  const screw: CSSProperties = {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: '50%',
    background: 'rgba(13,12,9,0.55)',
  }

  return (
    <div style={{ position: 'relative', width: w, height: (w * BASE_H) / BASE_W }}>
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: BASE_W,
          height: BASE_H,
          transform: `scale(${w / BASE_W})`,
          transformOrigin: 'top left',
        }}
      >
        <div style={body}>
          {/* corner screws */}
          {!clean && (
            <>
              <span style={{ ...screw, top: 6, left: 7 }} />
              <span style={{ ...screw, top: 6, right: 7 }} />
              <span style={{ ...screw, bottom: 6, left: 7 }} />
              <span style={{ ...screw, bottom: 6, right: 7 }} />
            </>
          )}

          {/* label sticker */}
          <div
            style={{
              position: 'absolute',
              top: 13,
              left: 17,
              right: 17,
              height: 78,
              background: retro
                ? 'linear-gradient(180deg,#FDF6E3,#EFE3C8)'
                : '#F7F2E7',
              border: clean ? '2px solid #16140F' : '2.5px solid #16140F',
              borderRadius: 7,
              transform: sticker ? 'rotate(-0.8deg)' : 'none',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* title line */}
            <div
              style={{
                padding: '6px 10px 3px',
                fontFamily: 'Inter, sans-serif',
                fontWeight: 800,
                fontSize: 13,
                color: '#16140F',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                borderBottom: '2px solid rgba(22,20,15,0.15)',
                flex: 'none',
              }}
            >
              {title}
            </div>

            {/* tape window with reels */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div
                style={{
                  width: 132,
                  height: 39,
                  borderRadius: 999,
                  background: '#0D0C09',
                  border: '2.5px solid #16140F',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 8px',
                  position: 'relative',
                }}
              >
                {/* tape between the reels */}
                <div
                  style={{
                    position: 'absolute',
                    left: 34,
                    right: 34,
                    top: '50%',
                    height: 8,
                    transform: 'translateY(-50%)',
                    background: '#3a3126',
                    borderTop: '1.5px solid rgba(245,241,232,0.25)',
                    borderBottom: '1.5px solid rgba(245,241,232,0.25)',
                  }}
                />
                <Reel spinning={playing} dur="1.4s" />
                <Reel spinning={playing} dur="1.9s" />
              </div>
            </div>
          </div>

          {/* bottom trapezoid with group tag */}
          <div
            style={{
              position: 'absolute',
              bottom: 7,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 108,
              height: 22,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <svg
              width="108"
              height="22"
              viewBox="0 0 108 22"
              style={{ position: 'absolute', inset: 0 }}
            >
              <path
                d="M14 2 H94 L105 20 H3 Z"
                fill="rgba(13,12,9,0.14)"
                stroke={clean ? 'rgba(22,20,15,0.55)' : '#16140F'}
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
            </svg>
            <span
              style={{
                position: 'relative',
                fontFamily: "'Space Mono', monospace",
                fontWeight: 700,
                fontSize: 9,
                letterSpacing: '0.14em',
                color: ink,
              }}
            >
              {group ? `${group} · A` : 'SIDE A'}
            </span>
          </div>

          {/* habit badge */}
          {habit && (
            <div
              style={{
                position: 'absolute',
                top: 4,
                right: 12,
                width: 20,
                height: 20,
                borderRadius: '50%',
                background: '#FFD23F',
                border: '2px solid #16140F',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 11,
                fontWeight: 800,
                color: '#16140F',
                transform: 'rotate(8deg)',
                zIndex: 2,
              }}
            >
              ↻
            </div>
          )}

          {/* retro foil sheen */}
          {retro && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'linear-gradient(115deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0.16) 52%, rgba(255,255,255,0) 72%)',
                pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
