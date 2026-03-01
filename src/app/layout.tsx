import type { Metadata } from "next";
import "./globals.css";
import { StoreInit } from "@/components/StoreInit";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/contexts/ThemeContext";

export const metadata: Metadata = {
  title: "MiniCom",
  description: "Live chat support demo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem("minicom-theme");if(t==="dark")document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark");})();`,
          }}
        />
      </head>
      <body className="antialiased bg-white text-gray-900 dark:bg-gray-900 dark:text-gray-100" suppressHydrationWarning>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
        >
          Skip to main content
        </a>
        <StoreInit />
        <OfflineBanner />
        <ThemeProvider>
          <ErrorBoundary>{children}</ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}
