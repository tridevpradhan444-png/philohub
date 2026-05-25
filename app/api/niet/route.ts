import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { question, pageContext } = await request.json();

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ text: "API key not configured." });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are Niet, a friendly and wise AI assistant on PhiloHub — a philosophy platform for everyone. You explain philosophy simply, like talking to a curious 17-year-old. Keep answers concise (2-4 sentences). Be warm, direct, never condescending. Current page: ${pageContext}\n\nUser question: ${question}`
            }]
          }],
          generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
        }),
      }
    );

    if (!response.ok) {
      const err = await response.json();
      return NextResponse.json({ text: `Error: ${err?.error?.message || response.status}` });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't think of an answer. Try again?";
    return NextResponse.json({ text });
  } catch (error: any) {
    return NextResponse.json({ text: `Error: ${error?.message || "Unknown error"}` });
  }
}
