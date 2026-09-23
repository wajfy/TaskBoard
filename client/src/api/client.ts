import { tokenStorage } from '../auth/tokenStorage'
import { refreshAccessToken } from './auth'

let refreshPromise: Promise<string | null> | null = null

async function getValidAccessToken(): Promise<string | null> {
  return tokenStorage.getAccessToken()
}

async function tryRefresh(): Promise<string | null> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) return null

  if (!refreshPromise) {
    refreshPromise = refreshAccessToken(refreshToken)
      .then((result) => {
        tokenStorage.setTokens(result.accessToken, result.refreshToken)
        return result.accessToken
      })
      .catch(() => {
        tokenStorage.clear()
        return null
      })
      .finally(() => {
        refreshPromise = null
      })
  }

  return refreshPromise
}

export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const accessToken = await getValidAccessToken()

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
  })

  if (response.status !== 401) {
    return response
  }

  const newAccessToken = await tryRefresh()
  if (!newAccessToken) {
    return response
  }

  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${newAccessToken}`,
    },
  })
}