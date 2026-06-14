export const API_BASE = import.meta.env.VITE_API_URL ?? ''

export function resolveAssetUrl(path) {
  if (!path || /^https?:\/\//i.test(path)) return path
  return `${API_BASE}${path}`
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function parseError(response) {
  try {
    const data = await response.json()
    if (typeof data.detail === 'string') return data.detail
    if (Array.isArray(data.detail)) {
      return data.detail.map((item) => item.msg ?? JSON.stringify(item)).join(', ')
    }
  } catch {
    // ignore JSON parse errors
  }
  return response.statusText || 'Request failed'
}

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...options.headers,
    },
    ...options,
  })

  if (!response.ok) {
    throw new ApiError(await parseError(response), response.status)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}
