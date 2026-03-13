import type { Metadata } from "next";
import { Inter } from "next/font/google";
import TRPCProvider from "../src/trpc/Provider";
import { Header } from "../src/components/Header";
import { Footer } from "../src/components/Footer";
import { AuthProvider } from "../src/components/AuthProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Canyon Bicycles | Premium Performance Bikes",
  description: "Engineered in Germany. Premium road, gravel, mountain, and electric bikes built for performance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans flex flex-col min-h-screen bg-black text-white antialiased selection:bg-accent selection:text-white`}>
        <TRPCProvider>
          <AuthProvider>
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
