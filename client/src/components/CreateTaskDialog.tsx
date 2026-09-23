import { useState, type SubmitEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createTask, type CreateTaskInput } from '../api/tasks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export function CreateTaskDialog({ projectId }: { projectId: number }) {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')

  const createMutation = useMutation({
    mutationFn: (input: CreateTaskInput) => createTask(projectId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects', projectId, 'tasks'] }),
  })

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    createMutation.mutate(
      { title, description: description || null },
      {
        onSuccess: () => {
          setOpen(false)
          setTitle('')
          setDescription('')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>+ Nový úkol</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Nový úkol</DialogTitle>
            <DialogDescription>Úkol se přidá do sloupce Todo.</DialogDescription>
          </DialogHeader>
          <Input
            className="h-9"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Název úkolu"
            required
            autoFocus
            maxLength={200}
          />
          <Input
            className="h-9"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Popis (nepovinné)"
            maxLength={500}
          />
          {createMutation.isError && (
            <p className="text-sm text-destructive">Úkol se nepodařilo vytvořit.</p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={createMutation.isPending}>
              Vytvořit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
