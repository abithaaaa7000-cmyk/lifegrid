import React from 'react'

export function StatCard({ label, value, delta, tone = 'teal', suffix = '' }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className={`stat-value tone-${tone}`}>
        {value}
        {suffix}
      </div>
      {delta && <div className="stat-delta tone-muted" style={{ color: 'var(--text-faint)' }}>{delta}</div>}
    </div>
  )
}

export function Badge({ tone = 'neutral', children }) {
  return <span className={`badge badge-${tone}`}>{children}</span>
}

export function LoadBar({ value, tone = 'teal', max = 100 }) {
  const pct = Math.min(100, (value / max) * 100)
  const color = { teal: 'var(--teal)', amber: 'var(--amber)', coral: 'var(--coral)' }[tone] ?? 'var(--teal)'
  return (
    <div className="load-bar">
      <div className="load-bar-fill" style={{ width: `${pct}%`, background: color }} />
    </div>
  )
}

export function toneForScore(score) {
  if (score >= 75) return 'coral'
  if (score >= 50) return 'amber'
  return 'teal'
}
