import { useState, type SubmitEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { updateProject, type Project } from '../api/projects'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function EditProjectDialog({ project }: { project: Project }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(project.name)
  const [description, setDescription] = useState(project.description ?? '')

  const updateMutation = useMutation({
    mutationFn: () => updateProject(project.id, { name, description: description || null }),
    // klíč ['projects'] pokrývá seznam i detail (a jeho úkoly)
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  // při otevření vždy načti aktuální hodnoty (zahodí neuložené úpravy z minula)
  function handleOpenChange(next: boolean) {
    if (next) {
      setName(project.name)
      setDescription(project.description ?? '')
      updateMutation.reset()
    }
    setOpen(next)
  }

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    updateMutation.mutate(undefined, { onSuccess: () => setOpen(false) })
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={<Button variant="outline" size="icon" aria-label="Upravit projekt" title="Upravit projekt" />}
      >
        <Pencil />
      </DialogTrigger>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-xl">
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Upravit projekt</DialogTitle>
            <DialogDescription>Změň název nebo popis projektu.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-1.5">
            <Input
              className="h-9"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Název projektu"
              required
              autoFocus
              maxLength={200}
            />
            <p className="text-right text-xs text-muted-foreground">{name.length}/200</p>
          </div>

          <div className="grid gap-1.5">
            <Textarea
              className="max-h-72 min-h-36 overflow-y-auto"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Popis (nepovinné)"
              maxLength={500}
            />
            <p className="text-right text-xs text-muted-foreground">{description.length}/500</p>
          </div>

          {updateMutation.isError && <p className="text-sm text-destructive">Projekt se nepodařilo uložit.</p>}

          <DialogFooter>
            <Button type="submit" disabled={updateMutation.isPending}>
              Uložit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
