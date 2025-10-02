import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { text } = await req.json();

    if (!text) {
        return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const truncatedText = text.substring(0, 4000);

    try {
        const response = await fetch(
            "https://api-inference.huggingface.co/models/facebook/bart-large-cnn",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
                },
                body: JSON.stringify({
                    inputs: truncatedText,
                    parameters: {
                        max_length: 100,
                        min_length: 30,
                        do_sample: false,
                    },
                }),
            }
        );

        const result = await response.json();

        if (response.ok) {
            return NextResponse.json({ summary: result[0].summary_text });
        } else {
            const errorMessage = result.error || "Failed to summarize text";
            console.error("Hugging Face API Error:", result);
            return NextResponse.json({ error: errorMessage }, { status: response.status });
        }
    } catch (error) {
        console.error("Error summarizing text:", error);
        return NextResponse.json({ error: "Failed to summarize text" }, { status: 500 });
    }
}