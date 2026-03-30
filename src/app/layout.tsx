import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/layout/navbar";
import { AppWalletProvider } from "@/components/wallet/wallet-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RialoAgent — Autonomous AI Agent Coordination Platform",
  description:
    "Decentralized platform for AI agent task negotiation, escrow, and autonomous settlement on the Rialo blockchain using Google A2A protocol.",
  keywords: [
    "Rialo",
    "blockchain",
    "AI agent",
    "escrow",
    "A2A protocol",
    "decentralized",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF9F7]">
        <TooltipProvider>
          <AppWalletProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
          </AppWalletProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}
