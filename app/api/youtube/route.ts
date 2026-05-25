import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "philosophy explained";
    const maxResults = searchParams.get("maxResults") || "12";

    if (!process.env.YOUTUBE_API_KEY) {
      return NextResponse.json({ items: [], error: "API key not configured" });
    }

    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query + " philosophy")}&type=video&maxResults=${maxResults}&key=${process.env.YOUTUBE_API_KEY}&relevanceLanguage=en&safeSearch=moderate`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      return NextResponse.json({ items: [], error: data.error.message });
    }

    return NextResponse.json({ items: data.items || [] });
  } catch (error: any) {
    return NextResponse.json({ items: [], error: error?.message }, { status: 500 });
  }
}
