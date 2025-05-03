"use client";

import type React from "react";

import { memo, useCallback, useState } from "react";
import { X, Plus, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Note } from "@/lib/types";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface NoteTabProps {
  note: Note;
  isActive: boolean;
  isUnsaved: boolean;
  onSelect: (id: string) => void;
  onClose: (id: string) => void;
}

const NoteTab = memo(
  ({ note, isActive, isUnsaved, onSelect, onClose }: NoteTabProps) => {
    const handleClick = useCallback(() => {
      onSelect(note.id);
    }, [note.id, onSelect]);

    const handleClose = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onClose(note.id);
      },
      [note.id, onClose]
    );

    return (
      <div
        className={cn(
          "flex items-center h-9 px-4 cursor-pointer group relative",
          "border-r border-opacity-50",
          "transition-all duration-200",
          "first:rounded-tl-md",
          isActive
            ? "bg-background text-foreground border-b-0 border-t-2 border-t-primary"
            : "bg-muted/50 text-muted-foreground hover:bg-muted/80 border-b border-opacity-50"
        )}
        onClick={handleClick}
      >
        <span className="truncate max-w-[150px] flex items-center">
          {note.title}
          {isUnsaved && (
            <Circle className="ml-1.5 fill-primary text-primary h-2 w-2" />
          )}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 p-0 ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleClose}
          aria-label="Close tab"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }
);

NoteTab.displayName = "NoteTab";

interface NoteTabsProps {
  openNotes: Note[];
  activeNoteId: string;
  unsavedNoteIds: string[];
  onTabSelect: (id: string) => void;
  onTabClose: (id: string) => void;
  onNewTab: () => void;
}

export const NoteTabs = memo(function NoteTabs({
  openNotes,
  activeNoteId,
  unsavedNoteIds,
  onTabSelect,
  onTabClose,
  onNewTab,
}: NoteTabsProps) {
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
  }, []);

  if (openNotes.length === 0) {
    return (
      <div
        className="w-full border-b border-opacity-50 flex items-center h-9 px-2"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 ml-auto"
                onClick={onNewTab}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>New note</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }

  return (
    <div
      className="relative border-b border-opacity-50 bg-muted/30"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <ScrollArea className="w-full">
        <div className="flex items-center">
          {openNotes.map((note) => (
            <NoteTab
              key={note.id}
              note={note}
              isActive={note.id === activeNoteId}
              isUnsaved={unsavedNoteIds.includes(note.id)}
              onSelect={onTabSelect}
              onClose={onTabClose}
            />
          ))}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 ml-1"
                  onClick={onNewTab}
                  aria-label="New note"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>New note</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
});
