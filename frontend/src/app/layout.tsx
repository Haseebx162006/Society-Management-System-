import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "COMSOC — COMSATS Lahore Society Portal",
  description:
    "The unified digital platform for COMSATS Lahore societies. Discover, join, and lead communities that shape your campus experience.",
};

import StoreProvider from "./StoreProvider";

import { Toaster } from 'react-hot-toast';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Orbitron:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <StoreProvider>
          {children}
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              border: '1px solid #3b82f6',
            },
          }} />
        </StoreProvider>
      </body>
    </html>
  );
}
