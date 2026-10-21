import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'

const baseLinks = [
  { to: '/family', label: '2 · Family Assessment' },
  { to: '/shock-cascade', label: '3 · Shock + Cascade' },
  { to: '/intervention', label: '4 · Intervention + Optimization' },
  { to: '/action-review', label: '5 · Action + Reassessment' },
]

export default function Sidebar() {
  const { officer, logout } = useApp()
  const navigate = useNavigate()
  const isAdmin = officer?.role === 'admin'

  const dashboardLinks = [
    isAdmin
      ? { to: '/admin', label: '1 · Admin Dashboard', end: true }
      : { to: '/dashboard', label: '1 · Field Worker Dashboard', end: true },
    ...baseLinks,
  ]

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark" />
        <div>
          <div className="sidebar-brand-text">LIFEGRID</div>
          <div className="sidebar-brand-sub">Resilience Platform</div>
        </div>
      </div>

      {officer && (
        <div className="officer-card">
          <div style={{ fontSize: 13, fontWeight: 600 }}>{officer.name}</div>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', textTransform: 'capitalize' }}>
            {officer.role === 'admin' ? 'Admin / NGO Coordinator' : 'Field Worker'}
          </div>
        </div>
      )}

      <div className="nav-section-label">Dashboards</div>
      {dashboardLinks.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <span className="nav-dot" />
          {link.label}
        </NavLink>
      ))}

      <div className="sidebar-footer" style={{ marginTop: 'auto' }}>
        <button className="btn btn-ghost" style={{ width: '100%', marginBottom: 10 }} onClick={handleLogout}>
          Log Out
        </button>
        <span className="sidebar-footer-text">
          React + Vite · Node/Express · MongoDB
        </span>
      </div>
    </aside>
  )
}
