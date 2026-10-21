import React from 'react'

const TONE_COLORS = {
  teal: '#3fa796',
  amber: '#e8a33d',
  coral: '#e2665a',
}

// A segmented arc gauge styled like a circuit-breaker load dial: fixed tick
// segments fill in as the value rises, echoing the electrical-grid metaphor
// (vulnerability = load on the household's "circuit").
export default function Gauge({ value = 0, label, tone = 'teal', segments = 20, size = 180 }) {
  const filledSegments = Math.round((value / 100) * segments)
  const radius = size / 2 - 14
  const center = size / 2
  const startAngle = -220
  const endAngle = 40
  const angleSpan = endAngle - startAngle

  const ticks = Array.from({ length: segments }, (_, i) => {
    const angle = startAngle + (angleSpan / segments) * i + 4
    const rad = (angle * Math.PI) / 180
    const x1 = center + radius * Math.cos(rad)
    const y1 = center + radius * Math.sin(rad)
    const x2 = center + (radius - 12) * Math.cos(rad)
    const y2 = center + (radius - 12) * Math.sin(rad)
    return { x1, y1, x2, y2, filled: i < filledSegments }
  })

  const color = TONE_COLORS[tone] ?? TONE_COLORS.teal

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <svg width={size} height={size * 0.72} viewBox={`0 0 ${size} ${size}`}>
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.filled ? color : '#2a3242'}
            strokeWidth={4}
            strokeLinecap="round"
            opacity={t.filled ? 1 : 0.7}
          />
        ))}
        <text
          x={center}
          y={center - 6}
          textAnchor="middle"
          fontFamily="IBM Plex Mono, monospace"
          fontSize="34"
          fontWeight="600"
          fill="#edeae2"
        >
          {Math.round(value)}
        </text>
        <text x={center} y={center + 18} textAnchor="middle" fontFamily="Inter, sans-serif" fontSize="11" fill="#8b93a7">
          / 100
        </text>
      </svg>
      {label && (
        <div style={{ fontSize: 12, color: '#8b93a7', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {label}
        </div>
      )}
    </div>
  )
}
