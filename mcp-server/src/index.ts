#!/usr/bin/env node
/**
 * Person CRUD MCP server.
 *
 * Exposes five tools (list/get/create/update/delete) that proxy to the Person
 * API deployed on Vercel. Communication with Claude Desktop uses the stdio
 * transport from @modelcontextprotocol/sdk.
 */
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const API_URL = (process.env.PERSON_API_URL ?? "http://localhost:3000").replace(/\/+$/, "");
const API_KEY = process.env.MCP_API_KEY;

function authHeaders(): Record<string, string> {
  return API_KEY ? { "x-api-key": API_KEY } : {};
}

async function callApi(path: string, init?: RequestInit) {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  let json: unknown;
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text };
  }
  return { status: res.status, ok: res.ok, body: json };
}

function toolResult(payload: unknown, isError = false) {
  return {
    content: [{ type: "text" as const, text: JSON.stringify(payload, null, 2) }],
    isError,
  };
}

const tools = [
  {
    name: "person.list",
    description:
      "List or search people in the Person database. Optional query string searches name, email, and role.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Optional search text" },
        limit: { type: "number", description: "Max records (default 100, max 500)" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "person.get",
    description: "Fetch a single person by id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "person.create",
    description: "Create a new person. Email must be unique.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", minLength: 1 },
        email: { type: "string", format: "email" },
        age: { type: "number", minimum: 0, maximum: 150 },
        role: { type: "string" },
        bio: { type: "string" },
      },
      required: ["name", "email"],
      additionalProperties: false,
    },
  },
  {
    name: "person.update",
    description: "Update one or more fields of an existing person.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        email: { type: "string", format: "email" },
        age: { type: "number", minimum: 0, maximum: 150 },
        role: { type: "string" },
        bio: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  {
    name: "person.delete",
    description: "Delete a person by id.",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" } },
      required: ["id"],
      additionalProperties: false,
    },
  },
];

const server = new Server(
  { name: "person-mcp-server", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const { name, arguments: args = {} } = req.params;
  const a = args as Record<string, unknown>;

  try {
    switch (name) {
      case "person.list": {
        const params = new URLSearchParams();
        if (typeof a.q === "string" && a.q) params.set("q", a.q);
        if (typeof a.limit === "number") params.set("limit", String(a.limit));
        const qs = params.toString();
        const r = await callApi(`/api/persons${qs ? `?${qs}` : ""}`);
        return toolResult(r.body, !r.ok);
      }
      case "person.get": {
        const r = await callApi(`/api/persons/${encodeURIComponent(String(a.id))}`);
        return toolResult(r.body, !r.ok);
      }
      case "person.create": {
        const r = await callApi(`/api/persons`, {
          method: "POST",
          body: JSON.stringify(a),
        });
        return toolResult(r.body, !r.ok);
      }
      case "person.update": {
        const { id, ...rest } = a;
        const r = await callApi(`/api/persons/${encodeURIComponent(String(id))}`, {
          method: "PATCH",
          body: JSON.stringify(rest),
        });
        return toolResult(r.body, !r.ok);
      }
      case "person.delete": {
        const r = await callApi(`/api/persons/${encodeURIComponent(String(a.id))}`, {
          method: "DELETE",
        });
        return toolResult(r.body, !r.ok);
      }
      default:
        return toolResult({ error: `Unknown tool: ${name}` }, true);
    }
  } catch (err: any) {
    return toolResult({ error: err?.message ?? String(err) }, true);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // Log to stderr only – stdout is reserved for the MCP protocol.
  process.stderr.write(`[person-mcp] connected. API=${API_URL}\n`);
}

main().catch((err) => {
  process.stderr.write(`[person-mcp] fatal: ${err?.stack ?? err}\n`);
  process.exit(1);
});
