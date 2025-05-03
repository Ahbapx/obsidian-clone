"use client"

import type React from "react"

import { useState, memo, useCallback, useMemo } from "react"
import {
  ChevronDown,
  ChevronRight,
  File,
  FolderIcon,
  Hash,
  Plus,
  Search,
  Settings,
  Trash2,
  X,
  Copy,
  Scissors,
  Clipboard,
} from "lucide-react"
import type { Note, Folder, Tag } from "@/lib/types"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "@/components/ui/context-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { AppLogo } from "@/components/app-logo"
import { SettingsDialog } from "@/components/settings-dialog"

interface NoteItemProps {
  note: Note
  isActive: boolean
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onCopy: (id: string) => void
  onCut: (id: string) => void
}

const NoteItem = memo(({ note, isActive, onSelect, onDelete, onCopy, onCut }: NoteItemProps) => {
  const handleSelect = useCallback(() => {
    onSelect(note.id)
  }, [note.id, onSelect])

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onDelete(note.id)
    },
    [note.id, onDelete],
  )

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <div
          className={`flex items-center group py-1 px-2 rounded-md text-sm cursor-pointer ${
            isActive ? "bg-accent text-accent-foreground" : "hover:bg-muted"
          }`}
          onClick={handleSelect}
        >
          <File className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate flex-1">{note.title}</span>
          {note.tags.length > 0 && (
            <div className="flex gap-1 mr-1">
              {note.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="px-1 py-0 text-xs border-opacity-50">
                  {tag}
                </Badge>
              ))}
              {note.tags.length > 2 && (
                <Badge variant="outline" className="px-1 py-0 text-xs border-opacity-50">
                  +{note.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
          <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded" onClick={handleDelete}>
            <Trash2 className="h-3 w-3 text-muted-foreground" />
          </button>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <ContextMenuItem onClick={() => onCopy(note.id)}>
          <Copy className="h-4 w-4 mr-2" />
          Copy
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onCut(note.id)}>
          <Scissors className="h-4 w-4 mr-2" />
          Cut
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onDelete(note.id)}>
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  )
})

NoteItem.displayName = "NoteItem"

interface FolderItemProps {
  folder: Folder
  isExpanded: boolean
  onToggle: (path: string) => void
  onNewNote: (folder: string) => void
  onNewFolder: (path: string) => void
  onPaste: (folder: string) => void
  clipboard: { type: "note" | "folder"; id: string } | null
  clipboardOperation: "copy" | "cut" | null
  children: React.ReactNode
}

const FolderItem = memo(
  ({
    folder,
    isExpanded,
    onToggle,
    onNewNote,
    onNewFolder,
    onPaste,
    clipboard,
    clipboardOperation,
    children,
  }: FolderItemProps) => {
    const folderName = folder.path === "/" ? "Notes" : folder.name

    const handleToggle = useCallback(() => {
      onToggle(folder.path)
    }, [folder.path, onToggle])

    const handleNewNote = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        onNewNote(folder.path)
      },
      [folder.path, onNewNote],
    )

    const handleNewFolder = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        onNewFolder(folder.path)
      },
      [folder.path, onNewFolder],
    )

    const handlePaste = useCallback(() => {
      onPaste(folder.path)
    }, [folder.path, onPaste])

    const canPaste = clipboard !== null && clipboardOperation !== null

    return (
      <ContextMenu>
        <ContextMenuTrigger>
          <div>
            <div
              className="flex items-center py-1 px-2 rounded-md text-sm cursor-pointer hover:bg-muted group"
              onClick={handleToggle}
            >
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 mr-1 flex-shrink-0" />
              ) : (
                <ChevronRight className="h-4 w-4 mr-1 flex-shrink-0" />
              )}
              <FolderIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span className="truncate flex-1">{folderName}</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-background rounded"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Plus className="h-3 w-3 text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem onClick={handleNewNote}>
                    <File className="h-4 w-4 mr-2" />
                    <span>New Note</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleNewFolder}>
                    <FolderIcon className="h-4 w-4 mr-2" />
                    <span>New Folder</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            {isExpanded && children}
          </div>
        </ContextMenuTrigger>
        <ContextMenuContent>
          <ContextMenuItem onClick={handleNewNote}>
            <File className="h-4 w-4 mr-2" />
            New Note
          </ContextMenuItem>
          <ContextMenuItem onClick={handleNewFolder}>
            <FolderIcon className="h-4 w-4 mr-2" />
            New Folder
          </ContextMenuItem>
          {canPaste && (
            <>
              <ContextMenuSeparator />
              <ContextMenuItem onClick={handlePaste}>
                <Clipboard className="h-4 w-4 mr-2" />
                Paste {clipboardOperation === "copy" ? "Copy" : "Note"}
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
    )
  },
)

FolderItem.displayName = "FolderItem"

interface SidebarProps {
  notes: Note[]
  folders: Folder[]
  tags: Tag[]
  activeNoteId?: string
  onNoteSelect: (id: string) => void
  onNewNote: (folder?: string) => void
  onDeleteNote: (id: string) => void
  onCreateFolder: (name: string, parentPath?: string) => void
  onCopyNote: (id: string) => void
  onCutNote: (id: string) => void
  onPasteNote: (targetFolder: string) => void
  clipboard: { type: "note" | "folder"; id: string } | null
  clipboardOperation: "copy" | "cut" | null
}

export const Sidebar = memo(function Sidebar({
  notes,
  folders,
  tags,
  activeNoteId,
  onNoteSelect,
  onNewNote,
  onDeleteNote,
  onCreateFolder,
  onCopyNote,
  onCutNote,
  onPasteNote,
  clipboard,
  clipboardOperation,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({ "/": true })
  const [newFolderDialogOpen, setNewFolderDialogOpen] = useState(false)
  const [newFolderName, setNewFolderName] = useState("")
  const [currentParentPath, setCurrentParentPath] = useState("/")
  const [activeTab, setActiveTab] = useState("files")
  const [settingsOpen, setSettingsOpen] = useState(false)

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [path]: !prev[path],
    }))
  }, [])

  // Enhanced search functionality with memoization
  const filteredNotes = useMemo(() => {
    if (!searchQuery) return notes

    return notes.filter(
      (note) =>
        note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        note.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
    )
  }, [notes, searchQuery])

  // Filter tags based on search query with memoization
  const filteredTags = useMemo(() => {
    if (!searchQuery) return tags

    return tags.filter((tag) => tag.name.toLowerCase().includes(searchQuery.toLowerCase()))
  }, [tags, searchQuery])

  const openNewFolderDialog = useCallback((parentPath = "/") => {
    setCurrentParentPath(parentPath)
    setNewFolderName("")
    setNewFolderDialogOpen(true)
  }, [])

  const handleCreateFolder = useCallback(() => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), currentParentPath)
      setNewFolderDialogOpen(false)

      // Expand the parent folder to show the new folder
      setExpandedFolders((prev) => ({
        ...prev,
        [currentParentPath]: true,
      }))
    }
  }, [newFolderName, currentParentPath, onCreateFolder])

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }, [])

  const clearSearch = useCallback(() => {
    setSearchQuery("")
  }, [])

  const renderFolderContents = useCallback(
    (path: string) => {
      const folderNotes = filteredNotes.filter((note) => note.folder === path)
      const subfolders = folders.filter((f) => {
        const parentPath = f.path.substring(0, f.path.lastIndexOf("/")) || "/"
        return parentPath === path && f.path !== "/"
      })

      return (
        <div className="pl-4">
          {subfolders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              isExpanded={expandedFolders[folder.path] || false}
              onToggle={toggleFolder}
              onNewNote={onNewNote}
              onNewFolder={openNewFolderDialog}
              onPaste={onPasteNote}
              clipboard={clipboard}
              clipboardOperation={clipboardOperation}
            >
              {renderFolderContents(folder.path)}
            </FolderItem>
          ))}

          {folderNotes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              isActive={note.id === activeNoteId}
              onSelect={onNoteSelect}
              onDelete={onDeleteNote}
              onCopy={onCopyNote}
              onCut={onCutNote}
            />
          ))}
        </div>
      )
    },
    [
      filteredNotes,
      folders,
      expandedFolders,
      activeNoteId,
      onNoteSelect,
      onDeleteNote,
      onNewNote,
      openNewFolderDialog,
      toggleFolder,
      onCopyNote,
      onCutNote,
      onPasteNote,
      clipboard,
      clipboardOperation,
    ],
  )

  const renderTags = useCallback(() => {
    return (
      <div className="p-2">
        {filteredTags.map((tag) => {
          const tagNotes = filteredNotes.filter((note) => note.tags.includes(tag.name))
          if (tagNotes.length === 0) return null

          return (
            <div key={tag.id} className="mb-2">
              <div className="flex items-center py-1 px-2 rounded-md text-sm cursor-pointer hover:bg-muted">
                <Hash className="h-4 w-4 mr-2 flex-shrink-0" />
                <span className="truncate flex-1">{tag.name}</span>
                <span className="text-xs text-muted-foreground">{tagNotes.length}</span>
              </div>
              <div className="pl-8">
                {tagNotes.map((note) => (
                  <div
                    key={note.id}
                    className={`flex items-center py-1 px-2 rounded-md text-xs cursor-pointer ${
                      activeNoteId === note.id ? "bg-accent text-accent-foreground" : "hover:bg-muted"
                    }`}
                    onClick={() => onNoteSelect(note.id)}
                  >
                    <File className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{note.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {filteredTags.length === 0 && (
          <div className="text-center text-muted-foreground text-sm p-4">
            {searchQuery ? "No matching tags found" : "No tags found"}
          </div>
        )}
      </div>
    )
  }, [filteredTags, filteredNotes, searchQuery, activeNoteId, onNoteSelect])

  const rootFolder = useMemo(() => folders.find((f) => f.path === "/"), [folders])

  return (
    <div className="w-64 h-full flex flex-col border-r border-opacity-50 bg-gradient-to-b from-background to-muted/30">
      <div className="p-4 border-b border-opacity-50 bg-gradient-to-r from-background to-muted/40">
        <div className="flex items-center justify-between mb-4">
          <AppLogo />
          <div className="flex items-center space-x-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setSettingsOpen(true)}>
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search notes..." className="pl-8" value={searchQuery} onChange={handleSearchChange} />
          {searchQuery && (
            <button className="absolute right-2 top-2.5" onClick={clearSearch}>
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid grid-cols-2 mx-2 mt-2">
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="tags">Tags</TabsTrigger>
        </TabsList>
        <TabsContent value="files" className="flex-1 overflow-auto p-2">
          <ContextMenu>
            <ContextMenuTrigger className="block min-h-full">
              {rootFolder && (
                <FolderItem
                  folder={rootFolder}
                  isExpanded={expandedFolders[rootFolder.path] || false}
                  onToggle={toggleFolder}
                  onNewNote={onNewNote}
                  onNewFolder={openNewFolderDialog}
                  onPaste={onPasteNote}
                  clipboard={clipboard}
                  clipboardOperation={clipboardOperation}
                >
                  {renderFolderContents(rootFolder.path)}
                </FolderItem>
              )}

              {filteredNotes.length === 0 && searchQuery && (
                <div className="text-center text-muted-foreground text-sm p-4">
                  No notes found matching "{searchQuery}"
                </div>
              )}
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuItem onClick={() => onNewNote("/")}>
                <File className="h-4 w-4 mr-2" />
                New Note
              </ContextMenuItem>
              <ContextMenuItem onClick={() => openNewFolderDialog("/")}>
                <FolderIcon className="h-4 w-4 mr-2" />
                New Folder
              </ContextMenuItem>
              {clipboard && clipboardOperation && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem onClick={() => onPasteNote("/")}>
                    <Clipboard className="h-4 w-4 mr-2" />
                    Paste {clipboardOperation === "copy" ? "Copy" : "Note"}
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          </ContextMenu>
        </TabsContent>
        <TabsContent value="tags" className="flex-1 overflow-auto">
          {renderTags()}
        </TabsContent>
      </Tabs>

      <Dialog open={newFolderDialogOpen} onOpenChange={setNewFolderDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Folder</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewFolderDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateFolder}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
    </div>
  )
})
