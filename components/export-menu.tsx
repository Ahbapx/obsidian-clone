"use client"

import { ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Note } from "@/lib/types"

interface ExportMenuProps {
  note: Note
}

export function ExportMenu({ note }: ExportMenuProps) {
  const exportAsTxt = () => {
    const blob = new Blob([note.content], { type: "text/plain" })
    downloadBlob(blob, `${note.title}.txt`)
  }

  const exportAsMd = () => {
    const blob = new Blob([note.content], { type: "text/markdown" })
    downloadBlob(blob, `${note.title}.md`)
  }

  const downloadBlob = (blob: Blob, fileName: string) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = fileName
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs">
          Export <ChevronDown className="h-3.5 w-3.5 ml-1" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportAsTxt}>Export as TXT</DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsMd}>Export as MD</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
