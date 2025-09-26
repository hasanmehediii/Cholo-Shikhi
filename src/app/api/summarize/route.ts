import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { text } = await req.json();

    if (!text) {
        return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    try {
        const response = await fetch("https://api.edenai.run/v2/text/summarize", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.EDENAI_API_KEY}`,
            },
            body: JSON.stringify({
                providers: "openai",
                language: "en",
                text: text,
                output_sentences: 5,
            }),
        });

        const result = await response.json();

        if (result.openai.status === "success") {
            return NextResponse.json({ summary: result.openai.result });
        } else {
            return NextResponse.json({ error: "Failed to summarize text" }, { status: 500 });
        }
    } catch (error) {
        console.error("Error summarizing text:", error);
        return NextResponse.json({ error: "Failed to summarize text" }, { status: 500 });
    }
}
