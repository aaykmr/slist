import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "slist — parsed resumes",
  description: "Review AI-parsed resumes with filters",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background font-sans text-foreground">{children}</body>
    </html>
  );
}
