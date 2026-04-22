import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Person MCP App",
  description:
    "A production-ready Person CRUD app integrated with a Model Context Protocol (MCP) server for Claude Desktop.",
};

const nav = [
  { href: "/", label: "Home" },
  { href: "/mcp-demo", label: "MCP Demo" },
  { href: "/mcp-setup", label: "MCP Setup" },
  { href: "/about", label: "About" },
  { href: "/github", label: "GitHub" },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-slate-200/70 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur sticky top-0 z-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <span className="inline-block h-8 w-8 rounded-lg bg-brand text-white grid place-items-center text-sm">P</span>
              <span>Person MCP</span>
            </Link>
            <nav className="flex flex-wrap items-center gap-1 text-sm">
              {nav.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="rounded-lg px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 py-8 text-center text-xs text-slate-500">
          Built with Next.js, Prisma, and @modelcontextprotocol/sdk.
        </footer>
      </body>
    </html>
  );
}
