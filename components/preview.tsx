"use client";

import { useEffect, useRef, memo, useMemo } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import {
  Prism as SyntaxHighlighter,
  SyntaxHighlighterProps,
} from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import type { Note } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/use-settings";

interface PreviewProps {
  content: string;
  notes: Note[];
  onNoteLink: (id: string) => void;
  className?: string;
}

export const Preview = memo(function Preview({
  content,
  notes,
  onNoteLink,
  className,
}: PreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  // Process wiki-style links [[note-id]] - memoized to avoid reprocessing on every render
  const processedContent = useMemo(() => {
    return content.replace(/\[\[(.*?)\]\]/g, (match, noteId) => {
      const linkedNote = notes.find((n) => n.id === noteId);
      return linkedNote ? `[${linkedNote.title}](note://${noteId})` : match;
    });
  }, [content, notes]);

  // Handle clicks on note links
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === "A") {
        const href = target.getAttribute("href");
        if (href?.startsWith("note://")) {
          e.preventDefault();
          const noteId = href.replace("note://", "");
          onNoteLink(noteId);
        }
      }
    };

    const previewEl = previewRef.current;
    previewEl?.addEventListener("click", handleClick);

    return () => {
      previewEl?.removeEventListener("click", handleClick);
    };
  }, [onNoteLink]);

  return (
    <div
      ref={previewRef}
      className={cn(
        "h-full overflow-auto p-6 prose prose-sm dark:prose-invert max-w-none",
        settings.fontFamily,
        className
      )}
      style={{ fontSize: `${settings.fontSize}px` }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSlug]}
        components={{
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeProps = props as any; // Cast to any to bypass strict type checks for now
            return match ? (
              <SyntaxHighlighter
                style={vscDarkPlus as any} // Cast style prop to any for now
                language={match[1]}
                PreTag="div"
                {...codeProps}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...codeProps}>
                {children}
              </code>
            );
          },
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mt-6 mb-4">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mt-5 mb-3">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mt-4 mb-2">{children}</h3>
          ),
          a: ({ href, children }) => (
            <a href={href} className="text-primary hover:underline">
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-6 my-3">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 my-3">{children}</ol>
          ),
          li: ({ children }) => <li className="my-1">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic my-3">
              {children}
            </blockquote>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
});
