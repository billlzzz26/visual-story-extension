import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
        title: "Bookshelf — Craft Reading Tracker",
        description: "Track your books and sync reading progress with Craft",
};

export default function RootLayout({
        children,
}: { children: React.ReactNode }) {
        return (
                <html lang="en">
                        <body className="bg-[#FAFAF8] text-slate-900 antialiased">
                                {children}
                        </body>
                </html>
        );
}
