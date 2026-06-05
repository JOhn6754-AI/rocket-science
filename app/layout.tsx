import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/layout/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Rocket Science | Interactive Propulsion & Aerodynamics",
  description: "Premium visual-first learning platform for rocket propulsion and aerodynamics. Master Sutton & Anderson with interactive simulators and Rocket Forge — the ultimate rocket design capstone.",
  icons: {
    icon: "/favicon.ico",
  },
  metadataBase: new URL("https://rocket-science.pages.dev"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#020617] text-[#f1f5f9]">
        <TooltipProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Toaster position="top-center" richColors closeButton />
        </TooltipProvider>
      </body>
    </html>
  );
}
