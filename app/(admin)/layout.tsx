import type React from "react";
import { Inter } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import AdminLayout from "./components/admin-layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Wholesetail Admin",
  description: "Admin dashboard for Wholesetail",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AdminLayout>{children}</AdminLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
