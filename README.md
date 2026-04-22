# Person MCP App

Production-ready **Person CRUD** web app (Next.js + Prisma + Postgres) paired
with a **Model Context Protocol** server that lets **Claude Desktop** perform
the same Create / Read / Update / Delete operations through natural language.

> **Live app:** _deploy to Vercel and paste the URL here_
> **MCP server repo:** <https://github.com/emiisushi/person-mcp-server>

## Features

- Full Person CRUD web UI (`/`)
- REST API at `/api/persons` (GET / POST / PATCH / DELETE)
- In-browser MCP tester at `/mcp-demo`
- Claude Desktop setup guide at `/mcp-setup`
- Architecture docs at `/about`, repo link at `/github`
- Standalone MCP server in [`mcp-server/`](./mcp-server) using
  `@modelcontextprotocol/sdk`
- Input validation with Zod, optional `x-api-key` auth for writes
- Prisma ORM against Postgres (Neon / Supabase / Vercel Postgres)

## Architecture

```
Claude Desktop ── stdio ──▶ MCP server ── HTTPS ──▶ Next.js API ── Prisma ──▶ Postgres
                                                     ▲
                                              Web UI (direct)
```

Both the web UI and Claude Desktop share the **same database** through the same
API, so data written from Claude shows up immediately in the app (and vice
versa).

## Project layout

```
.
├── prisma/schema.prisma        # Person model
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # CRUD UI
│   │   ├── mcp-demo/           # Live MCP tester
│   │   ├── mcp-setup/          # Claude Desktop setup
│   │   ├── about/              # MCP architecture
│   │   ├── github/             # Repo link
│   │   └── api/persons/        # REST endpoints
│   └── lib/                    # Prisma client + Zod validation
├── mcp-server/                 # Standalone MCP server (Node, stdio)
├── package.json
└── README.md
```

## 1 · Local development

```bash
git clone https://github.com/emiisushi/person-mcp-server.git
cd person-mcp-server
npm install
cp .env.example .env
# edit .env and set DATABASE_URL to a Postgres instance
npx prisma db push
npm run dev
```

App runs at <http://localhost:3000>.

## 2 · Deploy to Vercel

1. Push this repo to GitHub.
2. Import it into Vercel.
3. In **Project Settings → Environment Variables** set:
   - `DATABASE_URL` — a Postgres connection string (Neon free tier works great).
   - `MCP_API_KEY` — _(optional)_ shared secret used to authenticate writes
     from the MCP server.
4. Trigger a deploy. The build runs `prisma generate && next build`.
5. After the first deploy, run `npx prisma db push` locally against the same
   `DATABASE_URL` to create the `Person` table (or use a Vercel post-deploy
   hook).

## 3 · Build the MCP server

```bash
cd mcp-server
npm install
npm run build
```

This produces `mcp-server/dist/index.js`, the executable MCP server.

## 4 · Connect Claude Desktop

Edit `claude_desktop_config.json` (location shown on the `/mcp-setup` page) and
add:

```jsonc
{
  "mcpServers": {
    "person-mcp": {
      "command": "node",
      "args": ["/ABSOLUTE/PATH/TO/mcp-server/dist/index.js"],
      "env": {
        "PERSON_API_URL": "https://YOUR-VERCEL-APP.vercel.app",
        "MCP_API_KEY": "your-shared-secret"
      }
    }
  }
}
```

Restart Claude Desktop. The five `person.*` tools become available.

## MCP tools

| Tool            | HTTP                        | Arguments                                      |
| --------------- | --------------------------- | ---------------------------------------------- |
| `person.list`   | `GET /api/persons`          | `{ q?, limit? }`                               |
| `person.get`    | `GET /api/persons/:id`      | `{ id }`                                       |
| `person.create` | `POST /api/persons`         | `{ name, email, age?, role?, bio? }`           |
| `person.update` | `PATCH /api/persons/:id`    | `{ id, ...partial fields }`                    |
| `person.delete` | `DELETE /api/persons/:id`   | `{ id }`                                       |

## Example prompts for Claude Desktop

- _"Using person-mcp, create a person named Ada Lovelace, email ada@example.com, age 36, role Mathematician."_
- _"List all people whose role contains 'engineer'."_
- _"Update Ada's role to 'Pioneer'."_
- _"Delete the person with id `…`."_

## Testing without Claude

Visit `/mcp-demo` on the deployed app. Every button there issues the exact
request the MCP server would issue from Claude Desktop.

## Security notes

- All write endpoints honour an optional `x-api-key` header. When `MCP_API_KEY`
  is set in Vercel, unauthenticated write attempts return `401`.
- Input is validated with Zod at the API layer.
- Prisma parameterises all queries, avoiding SQL injection.
- Unique email constraint returns `409` on conflicts.

## License

MIT
