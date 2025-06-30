import type { Metadata } from "next";
import { Montserrat, Merriweather } from "next/font/google";
import "./globals.css";
import { CommandPalette } from "@/components/ui/command-palette";
import { CommandPaletteProvider } from "@/context/CommandPaletteContext";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const merriweather = Merriweather({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Final Round AI",
  description: "TrendPilot | Navigate Social Media with AI Precision",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} ${merriweather.variable}`}>
      <body>
        <CommandPaletteProvider>
          <CommandPalette />
          {children}
        </CommandPaletteProvider>
      </body>
    </html>
  );
}
