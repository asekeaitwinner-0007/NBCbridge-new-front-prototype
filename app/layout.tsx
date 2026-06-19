import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NBCbridge Merchant Dashboard Prototype",
  description: "Local UX prototype for the wallet-first merchant dashboard."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
