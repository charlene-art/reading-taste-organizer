import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Nav } from "@/components/Nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reading taste organizer",
  description: "Catalog books, analyze themes and tone, discover your reading taste",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen antialiased`}
      >
        <div className="mx-auto max-w-5xl px-4 py-8">
          <header className="mb-10 border-b border-[var(--border)] pb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Reading taste organizer
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Themes, tone, and clusters from the books you have read
            </p>
            <Nav />
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
