import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { QueryProvider } from "@/components/providers/query-provider";

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
        className={`antialiased bg-background text-foreground`}
      >
        <QueryProvider>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 md:pl-[80px] transition-all duration-300 ease-in-out">
              {children}
            </main>
          </div>
        </QueryProvider>
      </body>
    </html>
  );
}
