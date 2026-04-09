import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'bl1nk Support Agent',
  description: 'AI-powered support agent with MCP OAuth and Sandbox Runtime',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
