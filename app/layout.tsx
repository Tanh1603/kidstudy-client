/* eslint-disable */
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";

import { ExitModal } from "@/components/modals/exit-modal";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { PracticeModal } from "@/components/modals/practice-modal";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/config";

import "./globals.css";
import React from "react";
import { QueryClientProviders } from "@/components/providers/query-client-providers";

const font = Nunito({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#FBBF24",
};

export const metadata: Metadata = siteConfig;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <QueryClientProviders>
      <ClerkProvider
        appearance={{
          layout: {
            logoImageUrl: "/bee.png",
          },
          variables: {
            colorPrimary: "#FBBF24",
          },
        }}
      >
        <html lang="en">
          <head>
            <link rel="icon" href="/bee.png" />
            <title>KidStudy</title>
          </head>
          <body className={font.className}>
            <Toaster theme="light" richColors closeButton />
            <ExitModal />
            <HeartsModal />
            <PracticeModal />
            {children}
          </body>
        </html>
      </ClerkProvider>
    </QueryClientProviders>
  );
}
