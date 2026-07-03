import type { Metadata } from "next";
import { Poppins, Source_Serif_4 } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  weight: ["500"],
  style: ["italic"],
});

export const metadata: Metadata = {
  title: "Lumen - AI Conversation Studio",
  description: "Enterprise-grade AI assistant evaluation and governance workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${poppins.variable} ${sourceSerif.variable} h-full antialiased`}>
      <body>{children}</body>
    </html>
  );
}
