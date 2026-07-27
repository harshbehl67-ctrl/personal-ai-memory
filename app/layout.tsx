import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Personal AI Memory — Your AI that remembers what matters",
  description: "Turn conversations, emails, meetings, documents, and research into private, useful memory. A privacy-first AI assistant that remembers meaningful context across your work.",
  keywords: ["AI memory", "personal AI", "knowledge management", "productivity", "privacy-first AI"],
  openGraph: {
    title: "Personal AI Memory",
    description: "Your AI that remembers what matters",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased min-h-screen bg-[#080B14] text-slate-100">
        {children}
      </body>
    </html>
  );
}
