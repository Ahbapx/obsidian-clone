"use client"

import { useState, useEffect } from "react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { File, Eye, Bot, Plus, Save } from "lucide-react"
import type { Note } from "@/lib/types"

interface CommandMenuProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  notes: Note[]
  onNoteSelect: (id: string) => void
  onCreateNote: () => void
  onTogglePreview: () => void
  onToggleAI: () => void
}

export function CommandMenu({
  open,
  onOpenChange,
  notes,
  onNoteSelect,
  onCreateNote,
  onTogglePreview,
  onToggleAI,
}: CommandMenuProps) {
  const [search, setSearch] = useState("")

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [open, onOpenChange])

  const handleSelect = (callback: () => void) => {
    callback()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0" style={{ maxWidth: 500 }}>
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Type a command or search..." value={search} onValueChange={setSearch} />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Actions">
              <CommandItem onSelect={() => handleSelect(onCreateNote)}>
                <Plus className="mr-2 h-4 w-4" />
                <span>Create new note</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(onTogglePreview)}>
                <Eye className="mr-2 h-4 w-4" />
                <span>Toggle preview</span>
              </CommandItem>
              <CommandItem onSelect={() => handleSelect(onToggleAI)}>
                <Bot className="mr-2 h-4 w-4" />
                <span>Toggle AI assistant</span>
              </CommandItem>
              <CommandItem
                onSelect={() =>
                  handleSelect(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "s", ctrlKey: true })))
                }
              >
                <Save className="mr-2 h-4 w-4" />
                <span>Save current note</span>
              </CommandItem>
            </CommandGroup>
            <CommandGroup heading="Notes">
              {notes
                .filter(
                  (note) =>
                    note.title.toLowerCase().includes(search.toLowerCase()) ||
                    note.content.toLowerCase().includes(search.toLowerCase()) ||
                    note.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase())),
                )
                .slice(0, 5)
                .map((note) => (
                  <CommandItem key={note.id} onSelect={() => handleSelect(() => onNoteSelect(note.id))}>
                    <File className="mr-2 h-4 w-4" />
                    <span>{note.title}</span>
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
