import type { Metadata } from "next";
import { QueryProvider } from "@/shared/providers/query-provider";
import "./globals.css";

export const metadata: Metadata = {
  title: "Signaldesk | Brand Mentions",
  description: "Track brand visibility across leading AI models.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body><QueryProvider>{children}</QueryProvider></body>
    </html>
  );
}
