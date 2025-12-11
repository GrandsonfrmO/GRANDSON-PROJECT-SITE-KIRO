import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import CartSyncManager from "./components/CartSyncManager";
import PushNotificationPrompt from "./components/PushNotificationPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Grandson Project - Streetwear Guinéen Premium | Mode Urbaine",
  description: "Découvrez la collection exclusive de streetwear guinéen Grandson Project. Mode urbaine premium, designs uniques et livraison rapide en Guinée.",
  keywords: ["streetwear guinéen", "mode urbaine", "vêtements premium", "Grandson Project", "fashion guinée"],
  authors: [{ name: "Grandson Project" }],
  creator: "Grandson Project",
  publisher: "Grandson Project",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_GN",
    url: "https://grandson-project.com",
    siteName: "Grandson Project",
    title: "Grandson Project - Streetwear Guinéen Premium",
    description: "Découvrez la collection exclusive de streetwear guinéen. Mode urbaine de qualité avec designs uniques.",
    images: [
      {
        url: "https://grandson-project.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Grandson Project Streetwear",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Grandson Project - Streetwear Guinéen",
    description: "Mode urbaine premium et designs uniques",
    images: ["https://grandson-project.com/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://grandson-project.com",
    languages: {
      "fr-GN": "https://grandson-project.com",
      "fr": "https://grandson-project.com",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          <CartProvider>
            <CartSyncManager />
            <PushNotificationPrompt />
            {children}
            <SpeedInsights />
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
