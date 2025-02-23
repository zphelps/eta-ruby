import type { Metadata } from "next";
import {Inter} from "next/font/google";
import "./globals.css";
import {Providers} from "@/providers";
import React, {Suspense} from "react";
import {getMetadata} from "@/utils/seo/get-metadata";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = getMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
      <Suspense>
          <Providers>
              {children}
          </Providers>
      </Suspense>
      </body>
    </html>
  );
}
