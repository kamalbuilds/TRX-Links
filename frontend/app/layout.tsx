import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";
import { twMerge } from "tailwind-merge";
import { Header } from "@/sections/Header";
// import 'bootstrap/dist/css/bootstrap.min.css';

const dmSans = DM_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TRX Links",
  description: "A project built on the TRON Blockchain",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="relative">
      <body className={twMerge(dmSans.className, "antialiased bg-[#EAEEFE]")}>
        <Header />
        {children}
      </body>
    </html>
  );
}
