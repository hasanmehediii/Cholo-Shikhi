import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen text-center p-8 bg-gray-50">
      <div className="max-w-3xl">
        <h1 className="text-6xl font-extrabold text-gray-800 leading-tight">
          <span className="text-blue-600">Wiki Explorer</span>: Your Gateway to Knowledge
        </h1>
        <p className="mt-6 text-xl text-gray-600">
          Dive deep into the world of information with a simple search. Uncover summaries, key facts, and historical insights from Wikipedia, all in one place.
        </p>

        <div className="mt-10">
          <Link
            href="/dashboard"
            className="px-10 py-4 text-lg font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 transform hover:scale-105"
          >
            Launch Explorer
          </Link>
        </div>
      </div>

      <footer className="absolute bottom-8 text-gray-500">
        <p>Built with Next.js and the Wikipedia API</p>
      </footer>
    </main>
  );
}
