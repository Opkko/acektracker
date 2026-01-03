import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ACE.K Tracker",
  description: "Fast payment tracking for ACE.K",
};

export const runtime = 'edge';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <div className="appShell">
          <header className="topNav">
            <Link href="/" className="brand">
              <span className="brandMark">
                <Image src="/assets/aceklogo.jpg" alt="ACE.K" width={34} height={34} priority />
              </span>
              <span>ACE.K Tracker</span>
            </Link>
            <nav className="navLinks">
              <Link className="navLink" href="/girl/qr">
                Girl QR
              </Link>
              <Link className="navLink" href="/waiter">
                Waiter
              </Link>
              <Link className="navLink" href="/admin">
                Admin
              </Link>
            </nav>
          </header>
          <main className="main">{children}</main>
        </div>
      </body>
    </html>
  );
}
