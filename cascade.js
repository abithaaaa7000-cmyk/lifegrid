import { apiFetch } from './client'

// GET /api/cascade/shocks — { shocks }
export const getShockCatalog = () => apiFetch('/api/cascade/shocks')

// POST /api/cascade (Module 8 — Shock Simulation & Cascade) — { cascade }
export const runCascadeRequest = ({ familyId, shockId }) =>
  apiFetch('/api/cascade', { method: 'POST', body: { familyId, shockId } })

// GET /api/cascade/family/:familyId — { runs }
export const getCascadeHistory = (familyId) => apiFetch(`/api/cascade/family/${familyId}`)
