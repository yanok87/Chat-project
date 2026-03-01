import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <>
      <header className="absolute top-0 right-0 p-4" aria-label="Theme">
        <ThemeToggle />
      </header>
      <main id="main" className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-900">
      <h1 className="text-2xl font-semibold text-gray-900 text-center mb-10 dark:text-white">
        MiniCom — Live Chat Support Demo
      </h1>
      <div className="flex flex-col sm:flex-row gap-4">
        <Link
          href="/visitor"
          className="px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-center dark:focus:ring-offset-gray-900"
        >
          Enter as user
        </Link>
        <Link
          href="/agent"
          className="px-6 py-3 rounded-lg bg-gray-800 text-white font-medium hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 text-center dark:bg-gray-700 dark:hover:bg-gray-600 dark:focus:ring-offset-gray-900"
        >
          Enter as support agent
        </Link>
      </div>
    </main>
    </>
  );
}
