import type { Metadata } from "next";
import "./globals.css";
import { StoreInit } from "@/components/StoreInit";
import { OfflineBanner } from "@/components/OfflineBanner";
import { ErrorBoundary } from "@/components/ErrorBoundary";

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
      <body className="antialiased" suppressHydrationWarning>
        <StoreInit />
        <OfflineBanner />
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
