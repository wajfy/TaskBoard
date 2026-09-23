export type AuthResponse = {
  accessToken: string
  refreshToken: string
  expiresAt: string
}

export type LoginInput = { email: string; password: string }
export type RegisterInput = { email: string; password: string }

const BASE_URL = '/api/auth'

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text()
    throw new Error(text || `HTTP ${response.status}`)
  }
  return response.json()
}

export function login(input: LoginInput): Promise<AuthResponse> {
  return fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((r) => handleResponse<AuthResponse>(r))
}

export function register(input: RegisterInput): Promise<AuthResponse> {
  return fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  }).then((r) => handleResponse<AuthResponse>(r))
}

export function refreshAccessToken(refreshToken: string): Promise<AuthResponse> {
  return fetch(`${BASE_URL}/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).then((r) => handleResponse<AuthResponse>(r))
}

export function logout(refreshToken: string): Promise<void> {
  return fetch(`${BASE_URL}/logout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  }).then((r) => {
    if (!r.ok) throw new Error(`HTTP ${r.status}`)
  })
}