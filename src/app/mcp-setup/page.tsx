import Link from "next/link";

export const metadata = { title: "MCP Setup – Person MCP App" };

const REPO = "https://github.com/emiisushi/person-mcp-server";

export default function McpSetupPage() {
  const claudeConfig = `{
  "mcpServers": {
    "person-mcp": {
      "command": "node",
      "args": ["ABSOLUTE/PATH/TO/person-mcp-server/mcp-server/dist/index.js"],
      "env": {
        "PERSON_API_URL": "https://YOUR-VERCEL-APP.vercel.app",
        "MCP_API_KEY": "your-shared-secret"
      }
    }
  }
}`;

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">Set up the Person CRUD MCP Server</h1>
        <p className="mt-2 text-sm text-slate-500">
          Follow these steps to connect Claude Desktop to the Person database via MCP. Once configured,
          Claude can create, read, update and delete people using natural language.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">1. Clone the repository</h2>
        <pre className="code mt-3">{`git clone ${REPO}
cd person-mcp-server`}</pre>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">2. Build the MCP server</h2>
        <p className="mt-1 text-sm text-slate-500">
          The MCP server lives in <code className="font-mono">mcp-server/</code> and is a standalone Node process.
        </p>
        <pre className="code mt-3">{`cd mcp-server
npm install
npm run build`}</pre>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">3. Configure Claude Desktop</h2>
        <p className="mt-1 text-sm text-slate-500">
          Open your Claude Desktop config file and add the <code>person-mcp</code> server:
        </p>
        <ul className="mt-2 list-disc pl-6 text-sm text-slate-600 dark:text-slate-300">
          <li><strong>macOS:</strong> <code>~/Library/Application Support/Claude/claude_desktop_config.json</code></li>
          <li><strong>Windows:</strong> <code>%APPDATA%\Claude\claude_desktop_config.json</code></li>
        </ul>
        <pre className="code mt-3">{claudeConfig}</pre>
        <p className="mt-2 text-xs text-slate-500">
          Replace <code>ABSOLUTE/PATH/...</code> with the real path to <code>mcp-server/dist/index.js</code>, and
          set <code>PERSON_API_URL</code> to your deployed Vercel URL. The <code>MCP_API_KEY</code> must match the
          value configured in Vercel environment variables (optional — omit both sides to disable auth).
        </p>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">4. Restart Claude Desktop</h2>
        <p className="mt-1 text-sm text-slate-500">
          Fully quit and relaunch Claude Desktop. You should see a hammer / tools icon indicating that
          <code> person-mcp </code> is connected.
        </p>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">5. Try it out</h2>
        <p className="mt-1 text-sm text-slate-500">Example prompts for Claude Desktop:</p>
        <ul className="mt-2 list-disc pl-6 text-sm text-slate-600 dark:text-slate-300">
          <li>&ldquo;Using person-mcp, create a person named Ada Lovelace, email ada@example.com, age 36, role Mathematician.&rdquo;</li>
          <li>&ldquo;List all people whose role contains &lsquo;engineer&rsquo;.&rdquo;</li>
          <li>&ldquo;Update Ada&rsquo;s role to &lsquo;Pioneer&rsquo;.&rdquo;</li>
          <li>&ldquo;Delete the person with email ada@example.com.&rdquo;</li>
        </ul>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Available MCP tools</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr><th>Tool</th><th>Description</th><th>Arguments</th></tr>
            </thead>
            <tbody className="[&>tr]:border-t [&>tr]:border-slate-200/70 dark:[&>tr]:border-slate-800">
              <tr><td className="py-2 font-mono">person.list</td><td>List / search people</td><td><code>{"{ q?, limit? }"}</code></td></tr>
              <tr><td className="py-2 font-mono">person.get</td><td>Get a person by id</td><td><code>{"{ id }"}</code></td></tr>
              <tr><td className="py-2 font-mono">person.create</td><td>Create a new person</td><td><code>{"{ name, email, age?, role?, bio? }"}</code></td></tr>
              <tr><td className="py-2 font-mono">person.update</td><td>Update fields</td><td><code>{"{ id, ...fields }"}</code></td></tr>
              <tr><td className="py-2 font-mono">person.delete</td><td>Delete by id</td><td><code>{"{ id }"}</code></td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">Test without Claude</h2>
        <p className="mt-1 text-sm text-slate-500">
          Prefer a browser? Open the <Link className="text-brand underline" href="/mcp-demo">MCP Demo</Link> page
          — every button there exercises the same API the MCP server uses.
        </p>
      </section>
    </div>
  );
}
