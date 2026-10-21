// ---------------------------------------------------------------------------
// Thin fetch wrapper around the LIFEGRID backend (Node/Express + MongoDB).
//
// React -> Axios/Fetch -> Node.js + Express -> MongoDB
//
// Every request:
//  - is prefixed with VITE_API_URL (falls back to http://localhost:5000)
//  - attaches "Authorization: Bearer <token>" when a session token exists
//  - parses the JSON body and throws a plain Error with the backend's
//    `message` field on non-2xx responses, so callers can just try/catch
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'
export const TOKEN_KEY = 'lifegrid_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  else localStorage.removeItem(TOKEN_KEY)
}

export async function apiFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }

  let response
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    throw new Error('Could not reach the LIFEGRID API. Is the backend running?')
  }

  let data = null
  try {
    data = await response.json()
  } catch {
    // No JSON body (e.g. 204) — fine.
  }

  if (!response.ok) {
    const message = data?.message || `Request failed (${response.status})`
    const error = new Error(message)
    error.status = response.status
    throw error
  }

  return data
}
