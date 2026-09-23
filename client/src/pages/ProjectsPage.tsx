import { useState } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Archive, ChevronRight } from 'lucide-react'
import { cn } from 'cn'
import { getProjects } from '../api/projects'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { CreateProjectDialog } from '../components/CreateProjectDialog'

export function ProjectsPage() {
  const [showArchived, setShowArchived] = useState(false)

  const { data: projects, isLoading, error } = useQuery({
    queryKey: ['projects', 'list', showArchived],
    queryFn: () => getProjects(showArchived),
    placeholderData: keepPreviousData,
  })

  const tabs = [
    { archived: false, label: 'Aktivní', icon: null },
    { archived: true, label: 'Archiv', icon: <Archive /> },
  ]

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Projekty</h2>
          <p className="text-sm text-muted-foreground">
            {showArchived ? 'Archivované projekty.' : 'Vyber projekt nebo založ nový.'}
          </p>
        </div>
        <CreateProjectDialog />
      </div>

      <div className="inline-flex gap-0.5 rounded-lg border border-white/10 bg-white/5 p-0.5" role="group" aria-label="Zobrazení projektů">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            aria-pressed={showArchived === tab.archived}
            onClick={() => setShowArchived(tab.archived)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm transition-colors [&_svg]:size-3.5',
              showArchived === tab.archived
                ? 'bg-white/15 font-medium text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-muted-foreground">Načítám…</p>}
      {error && <p className="text-destructive">Chyba: {error.message}</p>}

      {!isLoading && !error && (projects ?? []).length === 0 && (
        <div className="glass grid place-items-center rounded-2xl border border-dashed border-white/15 bg-white/[0.04] p-12 text-center text-sm text-muted-foreground">
          {showArchived
            ? 'V archivu nic není. Projekt archivuješ na jeho detailu.'
            : 'Zatím tu nemáš žádný projekt. Založ první tlačítkem vpravo nahoře.'}
        </div>
      )}

      {(projects ?? []).length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(projects ?? []).map((project) => (
            <Link
              key={project.id}
              to={`/projects/${project.id}`}
              className="group block min-w-0 rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <Card className="h-full transition-all group-hover:-translate-y-0.5 group-hover:border-white/25 group-hover:bg-white/[0.1]">
                <CardHeader>
                  <div className="flex min-w-0 items-center justify-between gap-2">
                    <CardTitle className="min-w-0 truncate" title={project.name}>
                      {project.name}
                    </CardTitle>
                    <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
