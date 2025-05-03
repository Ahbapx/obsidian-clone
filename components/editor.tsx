"use client";

import { useEffect, useRef, memo, useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import type { Note } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";

interface EditorProps {
  note: Note;
  onChange: (content: string) => void;
  onTitleChange: (title: string) => void;
  className?: string;
}

export const Editor = memo(function Editor({
  note,
  onChange,
  onTitleChange,
  className,
}: EditorProps) {
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const { settings } = useSettings();

  // Process content to remove the title H1 if it matches the note title
  const editorContent = useMemo(() => {
    const titleHeader = `# ${note.title}`;
    // Check if the content begins with the title as an H1
    if (note.content.startsWith(titleHeader)) {
      // Remove the title line and leading whitespace
      return note.content.substring(titleHeader.length).trim();
    }
    return note.content;
  }, [note.title, note.content]);

  // Auto-resize title textarea
  useEffect(() => {
    if (titleRef.current) {
      titleRef.current.style.height = "0px";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [note.title]);

  // Set initial title height
  useEffect(() => {
    if (titleRef.current && note) {
      titleRef.current.style.height = "0px";
      titleRef.current.style.height = `${titleRef.current.scrollHeight}px`;
    }
  }, [note]);

  // Handle content change
  const handleContentChange = (value: string) => {
    // We'll keep the title separate from the content
    onChange(value);
  };

  // Handle title change
  const handleTitleChange = (newTitle: string) => {
    onTitleChange(newTitle);
  };

  return (
    <div className={cn("flex flex-col h-full overflow-hidden", className)}>
      <div className="p-6 space-y-4 flex-1 flex flex-col overflow-hidden">
        <textarea
          ref={titleRef}
          value={note.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className={cn(
            "w-full text-2xl font-bold bg-transparent border-none outline-none resize-none overflow-hidden",
            settings.fontFamily
          )}
          style={{ fontSize: `${settings.fontSize}px` }}
          placeholder="Note title"
        />

        <div className="flex-1 overflow-auto">
          <CodeMirror
            value={editorContent}
            height="100%"
            extensions={[
              markdown({ base: markdownLanguage, codeLanguages: languages }),
              EditorView.lineWrapping,
            ]}
            onChange={handleContentChange}
            theme={vscodeDark}
            className="border rounded-md h-full"
            basicSetup={{
              lineNumbers: true,
              highlightActiveLine: true,
              highlightActiveLineGutter: true,
              foldGutter: true,
              dropCursor: true,
              allowMultipleSelections: true,
              indentOnInput: true,
              bracketMatching: true,
              closeBrackets: true,
              autocompletion: true,
              rectangularSelection: true,
              crosshairCursor: true,
              highlightSelectionMatches: true,
            }}
            editable={true}
            style={{
              fontFamily:
                settings.fontFamily === "font-mono"
                  ? "monospace"
                  : settings.fontFamily === "font-serif"
                  ? "serif"
                  : "sans-serif",
              fontSize: `${settings.fontSize}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
});
