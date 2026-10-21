import { apiFetch } from './client'

function toQuery(params = {}) {
  const entries = Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== '')
  const qs = new URLSearchParams(entries).toString()
  return qs ? `?${qs}` : ''
}

// GET /api/families — { families }
export const listFamilies = (params) => apiFetch(`/api/families${toQuery(params)}`)

// GET /api/families/stats — { registered, pending, completed, avgScore, tierCounts }
export const getFamilyStats = (params) => apiFetch(`/api/families/stats${toQuery(params)}`)

// GET /api/families/:id — { family }
export const getFamily = (id) => apiFetch(`/api/families/${id}`)

// POST /api/families (Module 4 — Family Registration) — { family }
export const createFamilyRequest = (payload) => apiFetch('/api/families', { method: 'POST', body: payload })

// PUT /api/families/:id — { family }
export const updateFamilyRequest = (id, payload) => apiFetch(`/api/families/${id}`, { method: 'PUT', body: payload })

// DELETE /api/families/:id — admin only
export const deleteFamilyRequest = (id) => apiFetch(`/api/families/${id}`, { method: 'DELETE' })
