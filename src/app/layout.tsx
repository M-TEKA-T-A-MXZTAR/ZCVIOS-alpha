import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZC-VIOS Core v1.1.0-alpha",
  description: "Privacy-first creator workflow and planning workspace for solo operators.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
