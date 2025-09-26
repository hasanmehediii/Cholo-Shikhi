"use client";
import { useState } from "react";
import parse from "html-react-parser";

interface Section {
    toclevel: number;
    level: string;
    line: string;
    number: string;
    index: string;
    fromtitle: string;
    byteoffset: number;
    anchor: string;
}

export default function SectionCard({ section, htmlContent }: { section: Section, htmlContent: string }) {
    const [summary, setSummary] = useState("");
    const [summarizing, setSummarizing] = useState(false);

    const summarizeText = async () => {
        setSummarizing(true);
        const content = parseSectionContent(section.anchor, htmlContent);
        
        const getTextContent = (element: React.ReactNode): string => {
            if (typeof element === 'string') {
                return element;
            }
            if (Array.isArray(element)) {
                return element.map(getTextContent).join(' ');
            }
            // Check if it's a React element with children
            if (typeof element === 'object' && element !== null && 'props' in element && typeof element.props === 'object' && element.props !== null && 'children' in element.props) {
                return getTextContent(element.props.children);
            }
            return '';
        };

        const textContent = getTextContent(content);

        try {
            const res = await fetch("/api/summarize", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: textContent }),
            });
            const result = await res.json();
            if (result.summary) {
                setSummary(result.summary);
            } else {
                setSummary("Failed to summarize.");
            }
        } catch (error) {
            console.error("Error summarizing:", error);
            setSummary("Failed to summarize.");
        } finally {
            setSummarizing(false);
        }
    };

    return (
        <div className="section-card bg-gray-800 text-white rounded-xl shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
            <div className="p-6">
                <h3 className="section-card-title text-xl font-semibold mb-4">{section.line}</h3>
                <div className="section-card-content">
                    {parseSectionContent(section.anchor, htmlContent)}
                </div>
                <button
                    onClick={summarizeText}
                    disabled={summarizing}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {summarizing ? "Summarizing..." : "Summarize"}
                </button>
                {summary && (
                    <div className="mt-4 p-4 bg-gray-700 rounded-md">
                        <p className="text-white">{summary}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Helper function to extract HTML content of a section
function parseSectionContent(sectionAnchor: string, htmlContent: string) {
    if (typeof window === 'undefined') {
        return <></>;
    }
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    const sectionElement = doc.getElementById(sectionAnchor);
    if (!sectionElement) return <></>;

    // The heading element is usually a parent of the span with the id.
    const headingElement = sectionElement.parentElement;
    if(!headingElement) return <></>;

    let content = "";
    let currentNode = headingElement.nextElementSibling;

    while (currentNode && !["H2", "H3", "H4", "H5", "H6"].includes(currentNode.tagName)) {
        content += currentNode.outerHTML;
        currentNode = currentNode.nextElementSibling;
    }

    return parse(content);
}
