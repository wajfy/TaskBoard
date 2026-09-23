import { useState, type SubmitEvent } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createProject } from '../api/projects'
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

export function CreateProjectDialog() {
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  const createMutation = useMutation({
    mutationFn: createProject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
  })

  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    createMutation.mutate(
      { name, description: description || null },
      {
        onSuccess: () => {
          setOpen(false)
          setName('')
          setDescription('')
        },
      }
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button />}>+ Nový projekt</DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <DialogHeader>
            <DialogTitle>Nový projekt</DialogTitle>
            <DialogDescription>Pojmenuj projekt, do kterého budeš přidávat úkoly.</DialogDescription>
          </DialogHeader>
          <Input
            className="h-9"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Název projektu"
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
            <p className="text-sm text-destructive">Projekt se nepodařilo vytvořit.</p>
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
