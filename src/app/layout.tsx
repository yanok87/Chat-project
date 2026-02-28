import type { Metadata } from "next";
import "./globals.css";
import { StoreInit } from "@/components/StoreInit";

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
    <html lang="en">
      <body className="antialiased">
        <StoreInit />
        {children}
      </body>
    </html>
  );
}
