import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PhiloHub — Philosophy for Everyone",
  description: "Vote on the greatest philosophical dilemmas humanity has ever posed.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}