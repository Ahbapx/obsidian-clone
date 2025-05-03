"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "ai/react";
import {
  Bot,
  Send,
  User,
  Sparkles,
  FileText,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Note } from "@/lib/types";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";

interface AIAssistantProps {
  notes: Note[];
  currentNote: Note;
  onCreateNote: (folder?: string) => void;
  onUpdateNote: (id: string, data: Partial<Note>) => void;
}

export function AIAssistant({
  notes,
  currentNote,
  onCreateNote,
  onUpdateNote,
}: AIAssistantProps) {
  const [activeTab, setActiveTab] = useState<string>("chat");
  const [isGenerating, setIsGenerating] = useState(false);
  const apiKeyMissing = !process.env.NEXT_PUBLIC_GOOGLE_AI_API_KEY;
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const initialMessages = useMemo(
    () => [
      {
        id: `welcome-${Date.now()}`,
        role: "assistant" as const,
        content:
          "Hi! I'm your AI assistant. I can help you with your notes. What would you like to do?",
      },
    ],
    []
  );

  const chatBody = useMemo(
    () => ({
      notes: notes.map((note) => ({
        id: note.id,
        title: note.title,
        content: note.content,
      })),
      currentNoteId: currentNote.id,
    }),
    [notes, currentNote.id]
  );

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    append,
  } = useChat({
    initialMessages,
    body: chatBody,
  });

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Focus input on tab change
  useEffect(() => {
    if (activeTab === "chat" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [activeTab]);

  const handleGenerateContent = async (type: string) => {
    setIsGenerating(true);

    let prompt = "";
    switch (type) {
      case "summarize":
        prompt = `Please summarize the current note titled "${currentNote.title}" into a concise paragraph.`;
        break;
      case "expand":
        prompt = `Please expand on the current note titled "${currentNote.title}" with more details and examples.`;
        break;
      case "ideas":
        prompt = `Based on my note titled "${currentNote.title}", suggest 5 related ideas or topics I could explore.`;
        break;
      case "outline":
        prompt = `Create a detailed outline for a comprehensive note on the topic of "${currentNote.title}".`;
        break;
    }

    await append({
      role: "user",
      content: prompt,
    });

    setIsGenerating(false);
  };

  const applyGeneratedContent = (content: string) => {
    onUpdateNote(currentNote.id, {
      content: currentNote.content + "\n\n" + content,
    });
  };

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="flex-1 flex flex-col"
      >
        <div className="border-b bg-gradient-to-r from-muted/20 to-background">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="chat"
              className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent"
            >
              Chat
            </TabsTrigger>
            <TabsTrigger
              value="tools"
              className="rounded-none border-b-2 border-b-transparent data-[state=active]:border-b-primary data-[state=active]:bg-transparent"
            >
              Tools
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent
          value="chat"
          className="flex-1 flex flex-col p-0 mt-0 overflow-hidden"
        >
          <ScrollArea className="flex-1 p-4 overflow-auto">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex items-start gap-3 rounded-lg p-3",
                    message.role === "user" ? "bg-muted" : "bg-primary/10"
                  )}
                >
                  <div className="rounded-full bg-primary/10 p-2">
                    {message.role === "user" ? (
                      <User className="h-4 w-4 text-primary" />
                    ) : (
                      <Bot className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="prose prose-sm dark:prose-invert max-w-none break-words">
                      <ReactMarkdown>{message.content}</ReactMarkdown>
                    </div>
                    {message.role === "assistant" &&
                      message.content.includes("```") && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2"
                          onClick={() => applyGeneratedContent(message.content)}
                        >
                          Apply to Note
                        </Button>
                      )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-gradient-to-r from-muted/20 to-background">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                ref={inputRef}
                placeholder="Ask me anything about your notes..."
                value={input}
                onChange={handleInputChange}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" size="icon" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="flex-1 p-4 mt-0">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Summarize
                </CardTitle>
                <CardDescription className="text-xs">
                  Create a concise summary of your note
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleGenerateContent("summarize")}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  ) : null}
                  Generate
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Expand
                </CardTitle>
                <CardDescription className="text-xs">
                  Add more details to your current note
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleGenerateContent("expand")}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  ) : null}
                  Generate
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4 text-primary" />
                  Related Ideas
                </CardTitle>
                <CardDescription className="text-xs">
                  Generate related ideas to explore
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleGenerateContent("ideas")}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  ) : null}
                  Generate
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gradient-to-br from-card to-muted/20">
              <CardHeader className="p-4">
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Create Outline
                </CardTitle>
                <CardDescription className="text-xs">
                  Generate a structured outline
                </CardDescription>
              </CardHeader>
              <CardFooter className="p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleGenerateContent("outline")}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  ) : null}
                  Generate
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
