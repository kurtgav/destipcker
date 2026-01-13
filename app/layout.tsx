import type { Metadata } from "next";
import { Suspense } from "react";
import { Outfit, Inter } from "next/font/google"; // Changed from Playfair_Display
import "./globals.css";
import PageTransition from "@/components/ui/PageTransition";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "DestiPicker - Magic Decision Maker",
  description: "Experience the magic of effortless decisions with DestiPicker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${outfit.variable} ${inter.variable} antialiased font-sans bg-black text-white overflow-x-hidden`}
      >
        <PageTransition>
          <Suspense fallback={null}>
            {children}
          </Suspense>
        </PageTransition>
      </body>
    </html>
  );
}
