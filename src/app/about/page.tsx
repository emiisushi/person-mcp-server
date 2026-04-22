export const metadata = { title: "About – Person MCP App" };

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">About this project</h1>
        <p className="mt-2 text-sm text-slate-500">
          Person MCP extends the Week 3 Person CRUD app with a Model Context Protocol (MCP) server so
          that AI assistants like Claude Desktop can manage the same database through natural language.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Architecture</h2>
        <pre className="code mt-3">{`┌───────────────────┐        stdio (JSON-RPC)        ┌─────────────────────┐
│  Claude Desktop   │ ─────────────────────────────▶ │ MCP Server (Node)   │
│  (LLM + UI)       │ ◀───────────────────────────── │  @modelcontextproto │
└───────────────────┘                                │  col/sdk            │
                                                     └──────────┬──────────┘
                                                                │ HTTPS
                                                                ▼
┌──────────────────────────────────────────────────────────────────────────┐
│ Next.js App on Vercel                                                    │
│  • /api/persons      → REST CRUD endpoints (GET/POST/PATCH/DELETE)       │
│  • /mcp-demo         → browser tester for the same endpoints             │
│  • /mcp-setup        → Claude Desktop integration guide                  │
│  • /  (home)         → direct CRUD UI                                    │
└──────────────────────────────────────────┬───────────────────────────────┘
                                           │ Prisma
                                           ▼
                                    ┌──────────────┐
                                    │  PostgreSQL  │
                                    │  (Neon /     │
                                    │   Supabase / │
                                    │   Vercel PG) │
                                    └──────────────┘`}</pre>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">How MCP integration works</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm text-slate-600 dark:text-slate-300">
          <li>
            The MCP server registers five tools (<code>person.list</code>, <code>person.get</code>,
            <code> person.create</code>, <code>person.update</code>, <code>person.delete</code>) with JSON
            schemas so Claude can validate arguments before calling them.
          </li>
          <li>
            When the user asks Claude to perform a CRUD action, Claude selects the appropriate tool and
            invokes it over the MCP stdio transport.
          </li>
          <li>
            The MCP server translates the tool call into an HTTPS request against the Next.js API,
            forwarding the optional <code>MCP_API_KEY</code> for authenticated writes.
          </li>
          <li>
            The Next.js API validates input with Zod and executes the operation through Prisma against
            the Postgres database. The same database powers the web UI.
          </li>
          <li>
            The JSON response flows back through MCP to Claude, which renders the result to the user.
          </li>
        </ol>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Tech stack</h2>
        <ul className="mt-2 list-disc pl-6 text-sm text-slate-600 dark:text-slate-300">
          <li>Next.js 14 (App Router) on Vercel</li>
          <li>TypeScript, Tailwind CSS</li>
          <li>Prisma ORM + PostgreSQL</li>
          <li>Zod for validation</li>
          <li>@modelcontextprotocol/sdk for the MCP server</li>
        </ul>
      </section>
    </div>
  );
}
