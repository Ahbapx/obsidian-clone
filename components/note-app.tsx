"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Editor } from "@/components/editor";
import { Preview } from "@/components/preview";
import { AIAssistant } from "@/components/ai-assistant";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { useHotkeys } from "@/hooks/use-hotkeys";
import { useUnsavedChanges } from "@/hooks/use-unsaved-changes";
import type { Note, Folder, Tag } from "@/lib/types";
import { generateId } from "@/lib/utils";
import { CommandMenu } from "@/components/command-menu";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Eye, Bot, Settings, Save } from "lucide-react";
import { ExportMenu } from "@/components/export-menu";
import { SettingsProvider } from "@/hooks/use-settings";
import { SettingsDialog } from "@/components/settings-dialog";
import { NoteTabs } from "@/components/note-tabs";
import { UnsavedChangesDialog } from "@/components/unsaved-changes-dialog";
import { toast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { SaveLocationDialog } from "@/components/save-location-dialog";
import { cn } from "@/lib/utils";

// Helper to deduplicate notes by id
function dedupeNotes(notes: Note[]): Note[] {
  return notes.filter(
    (note, i, arr) => arr.findIndex((n) => n.id === note.id) === i
  );
}

export function NoteApp({ activeNoteId }: { activeNoteId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [notes, setNotes] = useLocalStorage<Note[]>("obsidian-notes", [
    {
      id: "welcome",
      title: "Welcome to NoteVault",
      content:
        "# Welcome to NoteVault\n\nThis is a simple clone of the Obsidian note-taking app.\n\n## Features\n\n- Markdown editing with syntax highlighting\n- Live preview\n- File organization\n- Dark mode\n- AI Assistant powered by Gemini\n- Tags for organization\n\n## How to use\n\n1. Create new notes using the + button next to folders\n2. Edit your notes in the editor\n3. Switch to preview mode to see the rendered markdown\n4. Organize your notes in the sidebar\n5. Use the AI assistant to help with your notes\n\n## Keyboard Shortcuts\n\n- `Ctrl+N`: New note\n- `Ctrl+P`: Open command palette\n- `Ctrl+F`: Search notes\n- `Ctrl+S`: Save note (automatic)\n- `Ctrl+/`: Toggle AI assistant\n- `Ctrl+E`: Switch to edit mode\n- `Ctrl+R`: Switch to preview mode\n\n## Linking\n\nYou can link to other notes using double brackets: [[welcome]]\n\n## Tags\n\nYou can add tags to your notes using #tag syntax.\n",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folder: "/",
      tags: ["welcome", "tutorial"],
    },
  ]);

  const [folders, setFolders] = useLocalStorage<Folder[]>("obsidian-folders", [
    { id: "root", name: "/", path: "/" },
  ]);
  const [tags, setTags] = useLocalStorage<Tag[]>("obsidian-tags", [
    { id: "welcome", name: "welcome" },
    { id: "tutorial", name: "tutorial" },
  ]);

  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [viewMode, setViewMode] = useState<"edit" | "preview">("edit");
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [commandMenuOpen, setCommandMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Track open notes in tabs
  const [openNotes, setOpenNotes] = useState<Note[]>([]);

  // Track unsaved changes
  const [unsavedNoteIds, setUnsavedNoteIds] = useState<string[]>([]);
  const [unsavedChangesDialogOpen, setUnsavedChangesDialogOpen] =
    useState(false);
  const [noteToClose, setNoteToClose] = useState<string | null>(null);

  // Save location dialog
  const [saveLocationDialogOpen, setSaveLocationDialogOpen] = useState(false);
  const [noteToSaveLocation, setNoteToSaveLocation] = useState<string | null>(
    null
  );

  // Clipboard for copy/paste operations
  const [clipboard, setClipboard] = useState<{
    type: "note" | "folder";
    id: string;
  } | null>(null);
  const [clipboardOperation, setClipboardOperation] = useState<
    "copy" | "cut" | null
  >(null);

  // Use the hook to warn about unsaved changes when closing the window
  useUnsavedChanges(unsavedNoteIds.length > 0);

  useEffect(() => {
    if (activeNoteId) {
      const note = notes.find((n) => n.id === activeNoteId);
      if (note) {
        setActiveNote(note);

        // Add to open notes if not already open
        if (!openNotes.some((n) => n.id === note.id)) {
          setOpenNotes((prev) => dedupeNotes([...prev, note]));
        }
      } else if (notes.length > 0) {
        router.push(`/notes/${notes[0].id}`);
      }
    } else if (notes.length > 0 && pathname === "/notes") {
      router.push(`/notes/${notes[0].id}`);
    }
  }, [activeNoteId, notes, router, pathname, openNotes]);

  // Update open notes when notes change (e.g., title changes) - memoized to avoid unnecessary updates
  useEffect(() => {
    setOpenNotes((prev) =>
      dedupeNotes(
        prev.map((openNote) => {
          const updatedNote = notes.find((n) => n.id === openNote.id);
          return updatedNote || openNote;
        })
      )
    );
  }, [notes]);

  const createNewNote = useCallback(
    (folder = "/") => {
      const newNote: Note = {
        id: generateId(),
        title: "Untitled Note",
        content: "# Untitled Note",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        folder,
        tags: [],
      };

      setNotes((prev) => [...prev, newNote]);
      router.push(`/notes/${newNote.id}`);
    },
    [setNotes, router]
  );

  const createNewUnsavedNote = useCallback(() => {
    const newNote: Note = {
      id: generateId(),
      title: "Untitled Note",
      content: "# Untitled Note",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      folder: "unsaved", // Special marker for unsaved location
      tags: [],
    };

    setNotes((prev) => [...prev, newNote]);
    setUnsavedNoteIds((prev) => [...prev, newNote.id]);
    router.push(`/notes/${newNote.id}`);

    // Mark this note for location saving
    setNoteToSaveLocation(newNote.id);
  }, [setNotes, router]);

  const updateNote = useCallback(
    (id: string, data: Partial<Note>) => {
      // Mark note as having unsaved changes
      if (!unsavedNoteIds.includes(id)) {
        setUnsavedNoteIds((prev) => [...prev, id]);
      }

      setNotes((prevNotes) =>
        prevNotes.map((note) => {
          if (note.id === id) {
            // Extract tags from content if content is being updated
            let updatedTags = note.tags;
            if (data.content) {
              const tagRegex = /#(\w+)/g;
              const matches = data.content.match(tagRegex) || [];
              updatedTags = [
                ...new Set(matches.map((tag) => tag.substring(1))),
              ];

              // Update tags collection
              updateTags(updatedTags);
            }

            // Create a new object with the updated properties
            const updatedNote = {
              ...note,
              updatedAt: new Date().toISOString(),
              tags: data.tags || updatedTags,
            };

            // Only update title if title is provided in data
            if (data.title !== undefined) {
              updatedNote.title = data.title;
            }

            // Only update content if content is provided in data
            if (data.content !== undefined) {
              updatedNote.content = data.content;
            }

            // Only update folder if folder is provided in data
            if (data.folder !== undefined) {
              updatedNote.folder = data.folder;
            }

            return updatedNote;
          }
          return note;
        })
      );
    },
    [unsavedNoteIds]
  );

  const saveNote = useCallback(
    (id: string) => {
      // Check if note needs a location
      const note = notes.find((n) => n.id === id);
      if (note && note.folder === "unsaved") {
        setNoteToSaveLocation(id);
        setSaveLocationDialogOpen(true);
        return;
      }

      // Remove note from unsaved list
      setUnsavedNoteIds((prev) => prev.filter((noteId) => noteId !== id));

      // Update the note's updatedAt timestamp
      setNotes((prevNotes) =>
        prevNotes.map((note) => {
          if (note.id === id) {
            return {
              ...note,
              updatedAt: new Date().toISOString(),
            };
          }
          return note;
        })
      );

      toast({
        title: "Note saved",
        description: "Your changes have been saved successfully.",
        duration: 2000,
      });
    },
    [notes, setNotes]
  );

  const saveNoteLocation = useCallback(
    (id: string, folder: string) => {
      updateNote(id, { folder });
      setSaveLocationDialogOpen(false);
      setNoteToSaveLocation(null);

      // Save the note after location is set
      saveNote(id);
    },
    [updateNote, saveNote]
  );

  const updateTags = useCallback(
    (tagNames: string[]) => {
      const newTags: Tag[] = [];

      tagNames.forEach((name) => {
        if (!tags.some((t) => t.name === name)) {
          newTags.push({
            id: generateId(),
            name,
          });
        }
      });

      if (newTags.length > 0) {
        setTags((prev) => [...prev, ...newTags]);
      }
    },
    [tags, setTags]
  );

  const deleteNote = useCallback(
    (id: string) => {
      setNotes((prev) => prev.filter((note) => note.id !== id));

      // Remove from open notes
      setOpenNotes((prev) =>
        dedupeNotes(prev.filter((note) => note.id !== id))
      );

      // Remove from unsaved notes
      setUnsavedNoteIds((prev) => prev.filter((noteId) => noteId !== id));

      if (activeNote?.id === id) {
        // Navigate to another open note if available
        const remainingOpenNotes = openNotes.filter((note) => note.id !== id);
        if (remainingOpenNotes.length > 0) {
          router.push(
            `/notes/${remainingOpenNotes[remainingOpenNotes.length - 1].id}`
          );
        } else if (notes.length > 1) {
          const nextNote = notes.find((note) => note.id !== id);
          if (nextNote) {
            router.push(`/notes/${nextNote.id}`);
          }
        } else {
          router.push("/notes");
        }
      }
    },
    [notes, openNotes, activeNote, router]
  );

  const createFolder = useCallback(
    (name: string, parentPath = "/") => {
      const path = parentPath === "/" ? `/${name}` : `${parentPath}/${name}`;
      const newFolder: Folder = {
        id: generateId(),
        name,
        path,
      };

      setFolders((prev) => [...prev, newFolder]);
    },
    [setFolders]
  );

  const handleTabSelect = useCallback(
    (id: string) => {
      router.push(`/notes/${id}`);
    },
    [router]
  );

  const handleTabClose = useCallback(
    (id: string) => {
      // Check if note has unsaved changes
      if (unsavedNoteIds.includes(id)) {
        setNoteToClose(id);
        setUnsavedChangesDialogOpen(true);
        return;
      }

      closeTab(id);
    },
    [unsavedNoteIds]
  );

  const closeTab = useCallback(
    (id: string) => {
      setOpenNotes((prev) =>
        dedupeNotes(prev.filter((note) => note.id !== id))
      );

      // If closing the active note, navigate to another open note
      if (activeNote?.id === id) {
        const remainingOpenNotes = openNotes.filter((note) => note.id !== id);
        if (remainingOpenNotes.length > 0) {
          router.push(
            `/notes/${remainingOpenNotes[remainingOpenNotes.length - 1].id}`
          );
        } else {
          router.push("/notes");
        }
      }
    },
    [activeNote, openNotes, router]
  );

  const handleSaveAndClose = useCallback(() => {
    if (noteToClose) {
      saveNote(noteToClose);
      closeTab(noteToClose);
      setNoteToClose(null);
      setUnsavedChangesDialogOpen(false);
    }
  }, [noteToClose, saveNote, closeTab]);

  const handleDiscardAndClose = useCallback(() => {
    if (noteToClose) {
      // Remove from unsaved notes without saving
      setUnsavedNoteIds((prev) => prev.filter((id) => id !== noteToClose));
      closeTab(noteToClose);
      setNoteToClose(null);
      setUnsavedChangesDialogOpen(false);
    }
  }, [noteToClose, closeTab]);

  const toggleViewMode = useCallback(() => {
    setViewMode((prev) => (prev === "edit" ? "preview" : "edit"));
  }, []);

  const toggleAIAssistant = useCallback(() => {
    setShowAIAssistant((prev) => !prev);
  }, []);

  // Clipboard operations
  const copyNote = useCallback((id: string) => {
    setClipboard({ type: "note", id });
    setClipboardOperation("copy");
    toast({
      title: "Note copied",
      description: "Note copied to clipboard. Use paste to create a copy.",
      duration: 2000,
    });
  }, []);

  const cutNote = useCallback((id: string) => {
    setClipboard({ type: "note", id });
    setClipboardOperation("cut");
    toast({
      title: "Note cut",
      description: "Note cut to clipboard. Use paste to move it.",
      duration: 2000,
    });
  }, []);

  const pasteNote = useCallback(
    (targetFolder: string) => {
      if (!clipboard || clipboard.type !== "note" || !clipboardOperation)
        return;

      const sourceNote = notes.find((note) => note.id === clipboard.id);
      if (!sourceNote) return;

      if (clipboardOperation === "copy") {
        // Create a copy of the note in the target folder
        const newNote: Note = {
          ...sourceNote,
          id: generateId(),
          title: `${sourceNote.title} (Copy)`,
          folder: targetFolder,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setNotes((prev) => [...prev, newNote]);
        toast({
          title: "Note pasted",
          description: "A copy of the note has been created.",
          duration: 2000,
        });
      } else if (clipboardOperation === "cut") {
        // Move the note to the target folder
        updateNote(sourceNote.id, { folder: targetFolder });
        toast({
          title: "Note moved",
          description: "The note has been moved to the new location.",
          duration: 2000,
        });
        // Clear clipboard after cut operation
        setClipboard(null);
        setClipboardOperation(null);
      }
    },
    [clipboard, clipboardOperation, notes, updateNote]
  );

  // Register keyboard shortcuts
  useHotkeys([
    { key: "ctrl+n", callback: () => createNewUnsavedNote() },
    { key: "ctrl+p", callback: () => setCommandMenuOpen(true) },
    { key: "ctrl+/", callback: toggleAIAssistant },
    { key: "ctrl+e", callback: () => setViewMode("edit") },
    { key: "ctrl+r", callback: () => setViewMode("preview") },
    { key: "ctrl+s", callback: () => activeNote && saveNote(activeNote.id) },
  ]);

  // Memoize the content component to prevent unnecessary re-renders
  const contentComponent = useMemo(() => {
    if (!activeNote) return null;

    if (viewMode === "edit" && !showAIAssistant) {
      return (
        <Editor
          note={activeNote}
          onChange={(content) => updateNote(activeNote.id, { content })}
          onTitleChange={(title) => updateNote(activeNote.id, { title })}
          className="w-full"
        />
      );
    }

    if (viewMode === "edit" && showAIAssistant) {
      return (
        <>
          <Editor
            note={activeNote}
            onChange={(content) => updateNote(activeNote.id, { content })}
            onTitleChange={(title) => updateNote(activeNote.id, { title })}
            className="w-2/3"
          />
          <AIAssistant
            notes={notes}
            currentNote={activeNote}
            onCreateNote={createNewNote}
            onUpdateNote={updateNote}
          />
        </>
      );
    }

    if (viewMode === "preview" && !showAIAssistant) {
      return (
        <Preview
          content={activeNote.content}
          notes={notes}
          onNoteLink={(id) => router.push(`/notes/${id}`)}
          className="w-full"
        />
      );
    }

    return (
      <>
        <Preview
          content={activeNote.content}
          notes={notes}
          onNoteLink={(id) => router.push(`/notes/${id}`)}
          className="w-2/3"
        />
        <AIAssistant
          notes={notes}
          currentNote={activeNote}
          onCreateNote={createNewNote}
          onUpdateNote={updateNote}
        />
      </>
    );
  }, [
    activeNote,
    viewMode,
    showAIAssistant,
    notes,
    updateNote,
    createNewNote,
    router,
  ]);

  const handleNoteContentChange = useCallback(
    (content: string) => {
      if (activeNote) {
        // We need to ensure the title is preserved at the beginning of the content
        const titleHeader = `# ${activeNote.title}`;
        let updatedContent = content;

        // If content doesn't already start with the title, add it
        if (!updatedContent.startsWith(titleHeader)) {
          updatedContent = `${titleHeader}\n\n${updatedContent}`;
        }

        updateNote(activeNote.id, { content: updatedContent });
      }
    },
    [activeNote, updateNote]
  );

  const handleNoteTitleChange = useCallback(
    (title: string) => {
      if (activeNote) {
        // Update the title
        updateNote(activeNote.id, { title });

        // Also update the H1 in content if it exists
        const oldTitleHeader = `# ${activeNote.title}`;
        const newTitleHeader = `# ${title}`;

        if (activeNote.content.startsWith(oldTitleHeader)) {
          const updatedContent = activeNote.content.replace(
            oldTitleHeader,
            newTitleHeader
          );
          updateNote(activeNote.id, { content: updatedContent });
        }
      }
    },
    [activeNote, updateNote]
  );

  return (
    <SettingsProvider>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <Sidebar
          notes={notes}
          folders={folders}
          tags={tags}
          activeNoteId={activeNote?.id}
          onNoteSelect={(id) => router.push(`/notes/${id}`)}
          onNewNote={createNewNote}
          onDeleteNote={deleteNote}
          onCreateFolder={createFolder}
          onCopyNote={copyNote}
          onCutNote={cutNote}
          onPasteNote={pasteNote}
          clipboard={clipboard}
          clipboardOperation={clipboardOperation}
        />

        <div className="flex flex-col flex-1 h-full overflow-hidden">
          {activeNote ? (
            <>
              <div className="flex items-center justify-between border-b border-opacity-50 p-2 bg-gradient-to-r from-muted/30 to-background">
                <div className="text-sm font-medium truncate max-w-[200px]">
                  {activeNote.title}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => saveNote(activeNote.id)}
                    disabled={!unsavedNoteIds.includes(activeNote.id)}
                  >
                    <Save className="h-3.5 w-3.5 mr-1" />
                    Save
                  </Button>
                  <Tabs
                    value={viewMode}
                    onValueChange={(value) =>
                      setViewMode(value as "edit" | "preview")
                    }
                    className="mr-2"
                  >
                    <TabsList className="h-8">
                      <TabsTrigger value="edit" className="h-7 px-2 text-xs">
                        <Edit className="h-3.5 w-3.5 mr-1" />
                        Edit
                      </TabsTrigger>
                      <TabsTrigger value="preview" className="h-7 px-2 text-xs">
                        <Eye className="h-3.5 w-3.5 mr-1" />
                        Preview
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <ExportMenu note={activeNote} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={toggleAIAssistant}
                  >
                    <Bot className="h-3.5 w-3.5 mr-1" />
                    {showAIAssistant ? "Hide AI" : "AI"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              <NoteTabs
                openNotes={openNotes}
                activeNoteId={activeNote.id}
                unsavedNoteIds={unsavedNoteIds}
                onTabSelect={handleTabSelect}
                onTabClose={handleTabClose}
                onNewTab={createNewUnsavedNote}
              />

              <div className="flex-1 overflow-hidden relative">
                {activeNote ? (
                  <>
                    {viewMode === "edit" ? (
                      <Editor
                        note={activeNote}
                        onChange={handleNoteContentChange}
                        onTitleChange={handleNoteTitleChange}
                        className={cn(showAIAssistant && "w-2/3")}
                      />
                    ) : (
                      <Preview
                        content={activeNote.content}
                        notes={notes}
                        onNoteLink={(id) => router.push(`/notes/${id}`)}
                        className={cn(showAIAssistant && "w-2/3")}
                      />
                    )}
                    {showAIAssistant && (
                      <AIAssistant
                        notes={notes}
                        currentNote={activeNote}
                        onCreateNote={createNewNote}
                        onUpdateNote={updateNote}
                      />
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-4">
                        No note selected
                      </h2>
                      <Button onClick={createNewUnsavedNote}>
                        Create a new note
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-background to-muted/20">
              <div className="text-center max-w-md p-8 rounded-lg border border-opacity-50 bg-card shadow-sm">
                <h2 className="text-xl font-bold mb-2">No Note Selected</h2>
                <p className="text-muted-foreground mb-6">
                  Select a note from the sidebar or create a new one to get
                  started
                </p>
                <Button
                  onClick={() => createNewUnsavedNote()}
                  className="w-full"
                >
                  Create New Note
                </Button>
              </div>
            </div>
          )}
        </div>

        <CommandMenu
          open={commandMenuOpen}
          onOpenChange={setCommandMenuOpen}
          notes={notes}
          onNoteSelect={(id) => router.push(`/notes/${id}`)}
          onCreateNote={createNewUnsavedNote}
          onTogglePreview={toggleViewMode}
          onToggleAI={toggleAIAssistant}
        />

        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />

        <UnsavedChangesDialog
          open={unsavedChangesDialogOpen}
          onOpenChange={setUnsavedChangesDialogOpen}
          onSave={handleSaveAndClose}
          onDiscard={handleDiscardAndClose}
        />

        <SaveLocationDialog
          open={saveLocationDialogOpen}
          onOpenChange={setSaveLocationDialogOpen}
          folders={folders}
          onSave={(folder) =>
            noteToSaveLocation && saveNoteLocation(noteToSaveLocation, folder)
          }
          onCreateFolder={createFolder}
        />

        <Toaster />
      </div>
    </SettingsProvider>
  );
}
