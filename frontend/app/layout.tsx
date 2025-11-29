import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "Grandson Project - Streetwear Guinéen",
  description: "Mode urbaine et streetwear pour la nouvelle génération guinéenne",
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
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
