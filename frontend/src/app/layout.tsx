import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import { Oxanium, Titillium_Web } from 'next/font/google';

const oxanium = Oxanium({ 
  subsets: ['latin'],
  variable: '--font-oxanium',
  weight: ['200', '300', '400', '500', '600', '700', '800'] 
});

const titilliumWeb = Titillium_Web({ 
  subsets: ['latin'],
  variable: '--font-titillium-web',
  weight: ['200', '300', '400', '600', '700', '900'] 
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: "COMSOC — COMSATS Lahore Society Portal",
  description:
    "The unified digital platform for COMSATS Lahore societies. Discover, join, and lead communities that shape your campus experience.",
  icons: {
    icon: "/logo.png?v=1",
    apple: "/logo.png?v=1",
  },
  openGraph: {
    title: "COMSOC — COMSATS Lahore Society Portal",
    description: "The unified digital platform for COMSATS Lahore societies.",
    images: [
      {
        url: "/logo.png?v=1",
        width: 1200,
        height: 630,
        alt: "COMSOC Logo",
      },
    ],
  },
};

import StoreProvider from "./StoreProvider";

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${oxanium.variable} ${titilliumWeb.variable}`}>
      <head>
        <Script async src="https://www.googletagmanager.com/gtag/js?id=G-BNW65YNVE8" />
        <Script id="google-analytics">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-BNW65YNVE8');
          `}
        </Script>
      </head>
      <body>
        <StoreProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #ea580c',
            },
          }} />
        </StoreProvider>
      </body>
    </html>
  );
}
