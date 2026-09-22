import { useEffect, useState } from 'react'
import { ProjectsList } from './components/ProjectsList'

type Ping = { message: string; serverTime: string }

function App() {
  const [ping, setPing] = useState<Ping | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/ping')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        return r.json()
      })
      .then(setPing)
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <p>Chyba: {error}</p>
  if (!ping) return <p>Načítám…</p>

  return (
    <div>
      <h1>TaskBoard</h1>
      <p>{ping.message}</p>
      <p>{ping.serverTime}</p>
      <ProjectsList/>
    </div>
  )
}

export default App