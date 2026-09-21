import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Connector — warm intros from people who know you",
  description: "A trusted-network referral and mentorship matching prototype.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <Navbar />
        <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">{children}</main>
      </body>
    </html>
  );
}
