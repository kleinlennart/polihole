import type { Metadata, Viewport } from "next";
import { Libre_Franklin } from "next/font/google";
import "./globals.css";
import { content } from "@/lib/content";
import { ServiceWorker } from "@/components/service-worker";

// Franklin Gothic is the voice of a century of ballot papers and campaign
// signage — the right gothic for a deck of political claims.
const libreFranklin = Libre_Franklin({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: content.app.name,
  description: content.app.description,
  appleWebApp: {
    capable: true,
    title: content.app.name,
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#1e2bd4",
  colorScheme: "light",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang={content.locale}
      className={`${libreFranklin.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {children}
        <ServiceWorker />
      </body>
    </html>
  );
}
