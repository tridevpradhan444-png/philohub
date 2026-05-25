import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { question, pageContext } = await request.json();

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        system: `You are Niet, a friendly and wise AI assistant on PhiloHub — a philosophy platform for everyone. You explain philosophy simply, like talking to a curious 17-year-old. Keep answers concise (2-4 sentences). Be warm, direct, never condescending. Current page: ${pageContext}`,
        messages: [{ role: "user", content: question }],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text || "I couldn't think of an answer right now. Try again?";
    return NextResponse.json({ text });
  } catch (error) {
    return NextResponse.json({ text: "I'm having trouble connecting. Try again in a moment!" }, { status: 500 });
  }
}