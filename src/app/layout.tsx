import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import "@/shared/styles/globals.scss";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mini ATS",
  description: "Applicant Tracking System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${jakartaSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
