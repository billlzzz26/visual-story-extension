import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'bl1nk Support Agent',
  description: 'AI-powered support agent with MCP OAuth, Sandbox Runtime, and CLI Agent Mode',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
