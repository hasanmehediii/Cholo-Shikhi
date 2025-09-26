"use client";

type Props = {
    topic: string;
    setTopic: (t: string) => void;
    onSearch: (q: string) => void;
};

export default function SearchBar({ topic, setTopic, onSearch }: Props) {
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (topic.trim()) {
            onSearch(topic);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-4">
            <input
                type="text"
                placeholder="Enter a topic to explore... (e.g., Artificial Intelligence)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-5 py-3 text-lg bg-gray-100 border-2 border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300"
            />
            <button
                type="submit"
                className="w-full sm:w-auto px-8 py-3 text-lg font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
            >
                Search
            </button>
        </form>
    );
}
