import { StreamingTextResponse } from "ai"

// Mock response generator
function mockStreamGenerator() {
  const responses = [
    "I'm a mock AI assistant. The real assistant requires a Google AI API key.",
    "This is a simulated response. To enable the full AI assistant, please add your GOOGLE_AI_API_KEY to the environment variables.",
    "I can't actually analyze your notes without the API key, but the UI is fully functional.",
    "You can explore the AI assistant interface, but responses are pre-defined without the API key.",
    "This is a placeholder response. The real AI would provide helpful insights about your notes.",
  ]

  return new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()
      const randomResponse = responses[Math.floor(Math.random() * responses.length)]

      // Stream the response character by character with delays
      for (let i = 0; i < randomResponse.length; i++) {
        const char = randomResponse[i]
        controller.enqueue(encoder.encode(char))
        await new Promise((resolve) => setTimeout(resolve, 20)) // Simulate typing delay
      }

      controller.close()
    },
  })
}

export async function POST(req: Request) {
  try {
    // We're always using the mock implementation since we're assuming no API key
    return new StreamingTextResponse(mockStreamGenerator())
  } catch (error) {
    console.error("Error in chat route:", error)
    return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
