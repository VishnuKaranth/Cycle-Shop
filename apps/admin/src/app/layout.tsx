import type { Metadata } from "next";
import "./globals.css";
import TRPCProvider from "../trpc/Provider";

export const metadata: Metadata = {
  title: "Cycle-Shop | Admin Platform",
  description: "Internal store management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased flex min-h-screen bg-background text-foreground">
        <TRPCProvider>
          {children}
        </TRPCProvider>
      </body>
    </html>
  );
}
