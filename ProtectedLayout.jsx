import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import Sidebar from './Sidebar.jsx'

export default function ProtectedLayout() {
  const { isAuthenticated, isAdmin, authLoading } = useApp()
  const location = useLocation()

  // Restoring a session from a stored JWT (GET /api/auth/me) — avoid
  // bouncing to /login before we know whether the token is still valid.
  if (authLoading) {
    return (
      <div className="app-shell">
        <main className="main">
          <div className="empty-state">
            <h3>Loading…</h3>
            <p>Checking your session.</p>
          </div>
        </main>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Keep each role on its own home dashboard — admins don't land on the
  // field worker view and vice versa.
  if (location.pathname === '/admin' && !isAdmin) {
    return <Navigate to="/dashboard" replace />
  }
  if (location.pathname === '/dashboard' && isAdmin) {
    return <Navigate to="/admin" replace />
  }

  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main">
        <Outlet />
      </main>
    </div>
  )
}
