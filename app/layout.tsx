import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "./globals.css";
import { OfflineAuthProvider } from "@/components/providers/offline-auth-provider";

// Load Roboto as fallback
const roboto = Roboto({
  weight: ['400', '500'],
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Calendar Offline - Works Without Internet",
  description: "A fully offline calendar application that works without internet connection",
  icons: {
    icon: '/img/google-calendar.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body
        className={`${roboto.className} antialiased`}
        style={{
          '--font-fallback': `${roboto.style.fontFamily}`,
          fontFamily: '"Google Sans Text", "Google Sans", var(--font-fallback)'
        } as React.CSSProperties}
      >
        <OfflineAuthProvider>
          {children}
        </OfflineAuthProvider>
      </body>
    </html>
  );
}
