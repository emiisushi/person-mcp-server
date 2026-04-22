export const metadata = { title: "GitHub – Person MCP App" };

const REPO = "https://github.com/emiisushi/person-mcp-server";

export default function GitHubPage() {
  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">Source code</h1>
        <p className="mt-2 text-sm text-slate-500">
          The full source for both the Next.js app and the MCP server is on GitHub.
        </p>
        <a
          href={REPO}
          target="_blank"
          rel="noreferrer"
          className="btn-primary mt-4"
        >
          Open the repository on GitHub ↗
        </a>
        <p className="mt-3 break-all text-sm font-mono text-slate-500">{REPO}</p>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Repository layout</h2>
        <pre className="code mt-3">{`person-mcp-server/
├── prisma/
│   └── schema.prisma           # Person model
├── src/
│   ├── app/
│   │   ├── page.tsx            # CRUD UI
│   │   ├── mcp-demo/           # Live MCP tester
│   │   ├── mcp-setup/          # Claude Desktop setup guide
│   │   ├── about/              # Architecture docs
│   │   ├── github/             # This page
│   │   └── api/persons/        # REST endpoints
│   └── lib/
│       ├── db.ts               # Prisma client
│       └── validation.ts       # Zod schemas + auth
├── mcp-server/                 # Standalone MCP server (Node, stdio)
│   ├── src/index.ts
│   └── package.json
├── package.json
└── README.md`}</pre>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Quick start</h2>
        <pre className="code mt-3">{`git clone ${REPO}
cd person-mcp-server
npm install
cp .env.example .env   # add DATABASE_URL
npx prisma db push
npm run dev`}</pre>
      </section>
    </div>
  );
}
