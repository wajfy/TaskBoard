import { useState, type ReactNode } from 'react'
import * as authApi from '../api/auth'
import { AuthContext } from './context'
import { tokenStorage } from './tokenStorage'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(tokenStorage.getAccessToken())

  async function login(email: string, password: string) {
    const result = await authApi.login({ email, password })
    tokenStorage.setTokens(result.accessToken, result.refreshToken)
    setAccessToken(result.accessToken)
  }

  async function register(email: string, password: string) {
    const result = await authApi.register({ email, password })
    tokenStorage.setTokens(result.accessToken, result.refreshToken)
    setAccessToken(result.accessToken)
  }

  function logout() {
    const refresh = tokenStorage.getRefreshToken()
    if (refresh) {
      authApi.logout(refresh).catch(() => {})
    }
    tokenStorage.clear()
    setAccessToken(null)
  }

  return (
    <AuthContext.Provider value={{ accessToken, isAuthenticated: !!accessToken, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
