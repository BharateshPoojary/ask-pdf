"use client";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import StoreProvider from "./StoreProvider";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ask Pdf",
  description: "Get your  questions answers about PDF using RAG",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >

        <ClerkProvider>
          <StoreProvider>
            <Toaster />

            {children}
          </StoreProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
