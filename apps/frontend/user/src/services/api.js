/**
 * api.js — Base API client (swap mock → real REST endpoints here)
 * All service files import this and call request().
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api'

export async function request(method, path, data = null) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  }
  if (data) opts.body = JSON.stringify(data)

  const res = await fetch(`${BASE_URL}${path}`, opts)
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err.message || 'Request failed')
  }
  return res.json()
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, data) => request('POST', path, data),
  put: (path, data) => request('PUT', path, data),
  patch: (path, data) => request('PATCH', path, data),
  delete: (path) => request('DELETE', path),
}
