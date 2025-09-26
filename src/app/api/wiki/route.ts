import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const topic = searchParams.get("topic");

    if (!topic) {
        return NextResponse.json({ error: "Please provide a topic to search." }, { status: 400 });
    }

    try {
        // First, search for the topic to get the correct page title
        const searchRes = await fetch(
            `https://en.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
                topic
            )}&limit=1&namespace=0&format=json&origin=*`
        );
        const searchData = await searchRes.json();

        if (!searchData || searchData[1].length === 0) {
            return NextResponse.json({ error: `No Wikipedia page found for "${topic}".` }, { status: 404 });
        }

        const pageTitle = searchData[1][0];

        // Use Wikipedia parse API to get sections and content
        const res = await fetch(
            `https://en.wikipedia.org/w/api.php?action=parse&page=${encodeURIComponent(
                pageTitle
            )}&format=json&prop=sections|text&origin=*`
        );

        const data = await res.json();

        if (data.error) {
            return NextResponse.json({ error: `Could not retrieve details for "${pageTitle}".` }, { status: 404 });
        }

        let htmlContent = data.parse.text["*"];
        const sections = data.parse.sections;

        // Remove reference links
        htmlContent = htmlContent.replace(/<sup class=\"reference\".*?<\/sup>/g, "");

        return NextResponse.json({
            title: data.parse.title,
            sections: sections,
            htmlContent,
        });
    } catch (error) {
        console.error("Wikipedia API Error:", error);
        return NextResponse.json(
            { error: "An unexpected error occurred while fetching data from Wikipedia." },
            { status: 500 }
        );
    }
}
