"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FolderIcon, Plus } from "lucide-react"
import type { Folder } from "@/lib/types"

interface SaveLocationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: Folder[]
  onSave: (folder: string) => void
  onCreateFolder: (name: string, parentPath?: string) => void
}

export function SaveLocationDialog({ open, onOpenChange, folders, onSave, onCreateFolder }: SaveLocationDialogProps) {
  const [selectedFolder, setSelectedFolder] = useState("/")
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [newFolderParent, setNewFolderParent] = useState("/")

  const handleSave = () => {
    onSave(selectedFolder)
  }

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), newFolderParent)
      setNewFolderName("")
      setShowNewFolder(false)
      // Select the newly created folder
      const newPath =
        newFolderParent === "/" ? `/${newFolderName.trim()}` : `${newFolderParent}/${newFolderName.trim()}`
      setSelectedFolder(newPath)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Note Location</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {!showNewFolder ? (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="folder" className="text-right">
                  Folder
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger id="folder">
                      <SelectValue placeholder="Select folder" />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map((folder) => (
                        <SelectItem key={folder.id} value={folder.path}>
                          {folder.path === "/" ? "Root" : folder.path}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowNewFolder(true)}
                    title="Create new folder"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="parent-folder" className="text-right">
                  Parent Folder
                </Label>
                <Select value={newFolderParent} onValueChange={setNewFolderParent} className="col-span-3">
                  <SelectTrigger id="parent-folder">
                    <SelectValue placeholder="Select parent folder" />
                  </SelectTrigger>
                  <SelectContent>
                    {folders.map((folder) => (
                      <SelectItem key={folder.id} value={folder.path}>
                        {folder.path === "/" ? "Root" : folder.path}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="new-folder" className="text-right">
                  New Folder
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input
                    id="new-folder"
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    placeholder="Folder name"
                  />
                  <Button variant="outline" size="icon" onClick={() => setShowNewFolder(false)} title="Cancel">
                    <FolderIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="col-span-4 flex justify-end">
                <Button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                  Create Folder
                </Button>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={showNewFolder}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
