import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth'
import { Navbar } from '../components/Navbar'

export function ProtectedLayout() {
  const { isAuthenticated } = useAuth()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  )
}