import { useContext } from 'react'
import { AuthContext } from './context'

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth musí být použito uvnitř AuthProvider')
  return ctx
}
