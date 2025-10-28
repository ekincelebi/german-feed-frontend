import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "German Reading",
  description: "Learn German by reading news articles",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased bg-gray-50">
        {children}
      </body>
    </html>
  );
}
