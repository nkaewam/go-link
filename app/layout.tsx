import type { Metadata } from "next";
import { Google_Sans_Code } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const googleSansCode = Google_Sans_Code({
  weight: ["300", "400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-google-sans-code",
});


export const metadata: Metadata = {
  title: "Go Links",
  description: "Internal Link Shortener",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${googleSansCode.variable} antialiased bg-background text-foreground`}
      >
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 md:pl-[80px] transition-all duration-300 ease-in-out">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
