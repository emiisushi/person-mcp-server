# Person MCP Server

Standalone [Model Context Protocol](https://modelcontextprotocol.io) server that
exposes **Person CRUD** tools to MCP-aware clients such as **Claude Desktop**.

It is a thin stdio server that proxies tool calls to the REST API of the
deployed Next.js Person app.

## Tools

| Tool            | Purpose                              |
| --------------- | ------------------------------------ |
| `person.list`   | List / search people                 |
| `person.get`    | Fetch a person by id                 |
| `person.create` | Create a new person                  |
| `person.update` | Update fields of an existing person  |
| `person.delete` | Delete a person by id                |

## Environment

| Variable         | Description                                                    |
| ---------------- | -------------------------------------------------------------- |
| `PERSON_API_URL` | Base URL of the deployed Person app (e.g. `https://…vercel.app`) |
| `MCP_API_KEY`    | Optional shared secret sent as `x-api-key` on writes           |

## Build

```bash
npm install
npm run build
```

The compiled entry point is `dist/index.js`.

## Use with Claude Desktop

Add to `claude_desktop_config.json`:

```json
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

Restart Claude Desktop. The tools above will appear in the tool picker.
