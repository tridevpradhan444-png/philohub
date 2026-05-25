import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { question, pageContext } = await request.json();

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ text: "API key not configured. Please check environment variables." });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        system: `You are Niet, a friendly AI assistant on PhiloHub. Explain philosophy simply. Keep answers to 2-4 sentences. Current page: ${pageContext}`,
        messages: [{ role: "user", content: question }],
      }),
    });

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ text: `API error: ${err?.error?.message || response.status}` });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || "I couldn't think of an answer. Try again?";
    return NextResponse.json({ text });
  } catch (error: any) {
    return NextResponse.json({ text: `Error: ${error?.message || "Unknown error"}` });
  }
}
