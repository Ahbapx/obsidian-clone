import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import type { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { messages, data } = await req.json();
    // Compose the prompt from the latest user message and context
    const latestUserMessage = messages[messages.length - 1]?.content || "";
    let context = "";
    if (data?.notes) {
      context += "Here are the user's notes:\n";
      for (const note of data.notes) {
        context += `\n--- Note: ${note.title} (ID: ${
          note.id
        }) ---\n${note.content.substring(0, 200)}...\n`;
      }
      if (data.currentNoteId) {
        const currentNote = data.notes.find(
          (n: any) => n.id === data.currentNoteId
        );
        if (currentNote) {
          context += `\nThe user is currently viewing the note titled \"${currentNote.title}\".\n`;
        }
      }
      context +=
        "\nBased on this context and the conversation history, respond to the user's latest message.";
    }
    const prompt = `${context}\n\nUser Message: ${latestUserMessage}`;

    // Use the Gemini 2.5 Flash Preview model
    const model = google("gemini-2.5-flash-preview-04-17");

    // Stream the response
    const result = await streamText({
      model,
      prompt,
    });
    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in chat route:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
