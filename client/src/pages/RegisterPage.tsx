import { useState, type SubmitEvent } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'

export function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    register(email, password)
      .then(() => navigate('/'))
      .catch((err) => setError(err.message))
      .finally(() => setIsSubmitting(false))
  }

  return (
    <div>
      <h2>Registrace</h2>
      {error && <p>Chyba: {error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="E-mail" required />
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Heslo" required />
        <button type="submit" disabled={isSubmitting}>Zaregistrovat</button>
      </form>
      <p>Už máš účet? <Link to="/login">Přihlas se</Link></p>
    </div>
  )
}