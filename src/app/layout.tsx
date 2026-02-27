import type { Metadata } from "next";
import "./globals.css";

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
      <body className="antialiased">{children}</body>
    </html>
  );
}
