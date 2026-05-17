import type { Metadata } from "next";
import { Chivo, Inter } from "next/font/google";
import "./globals.css";

const chivo = Chivo({
  variable: "--font-chivo",
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "ZC-VIOS Core v1.1.0-alpha",
  description: "Revenue-per-hour acceleration system for solo operators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${chivo.variable} ${inter.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
