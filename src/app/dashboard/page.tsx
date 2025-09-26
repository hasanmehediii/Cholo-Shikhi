"use client";

import { useState } from "react";
import SearchBar from "./components/SearchBar";
import SectionCard from "./components/SectionCard";

export default function DashboardPage() {
    const [topic, setTopic] = useState("");
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchWiki = async (query: string) => {
        setLoading(true);
        setData(null);
        setError(null);

        try {
            const res = await fetch(`/api/wiki?topic=${encodeURIComponent(query)}`);
            const result = await res.json();
            if (result.error) {
                setError(result.error);
            } else {
                setData(result);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
            setError("Failed to fetch data. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 text-gray-800 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl sm:text-5xl font-bold text-center text-blue-600 mb-8">
                    Wiki Explorer
                </h1>

                <div className="bg-white rounded-xl shadow-md p-6 mb-8">
                    <SearchBar topic={topic} setTopic={setTopic} onSearch={fetchWiki} />
                </div>

                {loading && (
                    <div className="text-center p-6 bg-white rounded-xl shadow-md">
                        <p className="text-lg font-medium text-gray-600">Loading...</p>
                    </div>
                )}

                {error && !loading && (
                    <div className="text-center p-6 bg-red-100 rounded-xl shadow-md">
                        <p className="text-lg font-medium text-red-600">{error}</p>
                    </div>
                )}

                {data && !loading && !error && (
                    <div className="mt-10">
                        <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-6">
                            {data.title}
                        </h2>
                        <div className="sections-container">
                            {data.sections.map((section: any) => (
                                <SectionCard key={section.index} section={section} htmlContent={data.htmlContent} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
