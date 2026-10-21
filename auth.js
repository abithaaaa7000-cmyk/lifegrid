import { apiFetch } from './client'

// POST /api/auth/register — { token, user }
export const registerRequest = (payload) =>
  apiFetch('/api/auth/register', { method: 'POST', body: payload, auth: false })

// POST /api/auth/login — { token, user }
export const loginRequest = (payload) =>
  apiFetch('/api/auth/login', { method: 'POST', body: payload, auth: false })

// GET /api/auth/me — { user }
export const getMeRequest = () => apiFetch('/api/auth/me')
