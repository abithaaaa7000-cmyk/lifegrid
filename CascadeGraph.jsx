import React, { useMemo } from 'react'

const severityColor = (s) => {
  if (s >= 0.7) return '#e2665a'
  if (s >= 0.4) return '#e8a33d'
  return '#3fa796'
}

export default function CascadeGraph({ cascade, width = 900, height = 420 }) {
  const layout = useMemo(() => {
    if (!cascade) return null
    const tiers = {}
    cascade.nodes.forEach((n) => {
      tiers[n.tier] = tiers[n.tier] || []
      tiers[n.tier].push(n)
    })
    const maxTier = Math.max(...Object.keys(tiers).map(Number))
    const colWidth = width / (maxTier + 1)
    const positions = {}

    Object.entries(tiers).forEach(([tier, nodes]) => {
      const t = Number(tier)
      const rowHeight = height / (nodes.length + 1)
      nodes.forEach((n, i) => {
        positions[n.id] = {
          x: colWidth * t + colWidth / 2,
          y: rowHeight * (i + 1),
          node: n,
        }
      })
    })

    return { positions, maxTier }
  }, [cascade, width, height])

  if (!cascade || !layout) {
    return (
      <div className="empty-state">
        <h3>No shock selected</h3>
        <p>Choose a shock scenario to generate its cascade tree.</p>
      </div>
    )
  }

  const { positions } = layout

  return (
    <svg width="100%" viewBox={`0 0 ${width} ${height}`} style={{ display: 'block' }}>
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" fill="#4a5468" />
        </marker>
      </defs>

      {cascade.edges.map((e, i) => {
        const from = positions[e.from]
        const to = positions[e.to]
        if (!from || !to) return null
        const midX = (from.x + to.x) / 2
        const path = `M${from.x},${from.y} C${midX},${from.y} ${midX},${to.y} ${to.x},${to.y}`
        const color = severityColor(e.severity)
        return (
          <g key={i}>
            <path d={path} fill="none" stroke="#2a3242" strokeWidth={2 + e.severity * 3} markerEnd="url(#arrow)" />
            <circle r="4" fill={color}>
              <animateMotion dur={`${2.2 - e.severity}s`} repeatCount="indefinite" path={path} />
            </circle>
          </g>
        )
      })}

      {Object.values(positions).map(({ x, y, node }) => {
        const isRoot = node.id === 'root'
        const color = isRoot ? '#e8a33d' : severityColor(node.severity)
        const r = isRoot ? 10 : 7
        return (
          <g key={node.id} transform={`translate(${x},${y})`}>
            <circle r={r + 6} fill={color} opacity="0.15" />
            <circle r={r} fill="var(--panel, #171d28)" stroke={color} strokeWidth="2.5" />
            <text
              y={r + 16}
              textAnchor="middle"
              fontFamily="Inter, sans-serif"
              fontSize="11"
              fill="#edeae2"
              style={{ pointerEvents: 'none' }}
            >
              {node.label}
            </text>
            {!isRoot && (
              <text
                y={r + 29}
                textAnchor="middle"
                fontFamily="IBM Plex Mono, monospace"
                fontSize="9.5"
                fill="#8b93a7"
              >
                sev {(node.severity * 100).toFixed(0)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
