import { apiFetch } from './client'

// GET /api/interventions — { interventions }
export const listInterventions = () => apiFetch('/api/interventions')

// POST /api/interventions/rank (Module 9 — Intervention Optimization) — { ranked, cascadeId }
export const rankInterventionsRequest = ({ cascadeId, budget }) =>
  apiFetch('/api/interventions/rank', { method: 'POST', body: { cascadeId, budget } })
