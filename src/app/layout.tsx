import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ParticleBackground from "@/components/3d/ParticleBackground";
import { ToastProvider } from "@/components/ui/Toast";
import CommandPalette from "@/components/ui/CommandPalette";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GrantRadar | Global Opportunity Discovery",
  description: "AI-powered global opportunity discovery",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans bg-slate-950 text-slate-50 antialiased min-h-screen flex flex-col`}>
        <ToastProvider>
          <ParticleBackground />
          <Header />
          <main className="flex-1 pt-20">
            {children}
          </main>
          <Footer />
          <CommandPalette />
        </ToastProvider>
      </body>
    </html>
  );
}
