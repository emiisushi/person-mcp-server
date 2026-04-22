"use client";

import { useState } from "react";

type Op = "list" | "get" | "create" | "update" | "delete";

const samplePayloads: Record<Op, string> = {
  list: '{\n  "q": ""\n}',
  get: '{\n  "id": "paste-person-id-here"\n}',
  create: '{\n  "name": "Ada Lovelace",\n  "email": "ada@example.com",\n  "age": 36,\n  "role": "Mathematician",\n  "bio": "First computer programmer."\n}',
  update: '{\n  "id": "paste-person-id-here",\n  "role": "Pioneer"\n}',
  delete: '{\n  "id": "paste-person-id-here"\n}',
};

export default function McpDemoPage() {
  const [op, setOp] = useState<Op>("list");
  const [payload, setPayload] = useState(samplePayloads.list);
  const [result, setResult] = useState<string>("");
  const [busy, setBusy] = useState(false);

  function onOpChange(next: Op) {
    setOp(next);
    setPayload(samplePayloads[next]);
    setResult("");
  }

  async function run() {
    setBusy(true);
    setResult("");
    try {
      const body = payload.trim() ? JSON.parse(payload) : {};
      const base = "/api/persons";
      let res: Response;

      if (op === "list") {
        const q = body.q ? `?q=${encodeURIComponent(body.q)}` : "";
        res = await fetch(`${base}${q}`);
      } else if (op === "get") {
        res = await fetch(`${base}/${body.id}`);
      } else if (op === "create") {
        res = await fetch(base, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else if (op === "update") {
        const { id, ...rest } = body;
        res = await fetch(`${base}/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(rest),
        });
      } else {
        res = await fetch(`${base}/${body.id}`, { method: "DELETE" });
      }
      const json = await res.json();
      setResult(JSON.stringify({ status: res.status, response: json }, null, 2));
    } catch (e: any) {
      setResult(`Error: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <h1 className="text-2xl font-bold">MCP Live Demo</h1>
        <p className="mt-2 text-sm text-slate-500">
          This page exercises the exact same HTTP endpoints the MCP server uses. Every call here is a
          real CRUD operation against the production Postgres database — the identical flow your MCP
          tools trigger from Claude Desktop.
        </p>
      </section>

      <section className="card p-6">
        <div className="flex flex-wrap gap-2">
          {(["list", "get", "create", "update", "delete"] as Op[]).map((o) => (
            <button
              key={o}
              onClick={() => onOpChange(o)}
              className={op === o ? "btn-primary" : "btn-secondary"}
            >
              person.{o}
            </button>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Request payload (JSON)
            </label>
            <textarea
              className="input font-mono"
              rows={12}
              value={payload}
              onChange={(e) => setPayload(e.target.value)}
            />
            <button className="btn-primary mt-3" onClick={run} disabled={busy}>
              {busy ? "Running…" : `Run person.${op}`}
            </button>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Response
            </label>
            <pre className="code min-h-[18rem]">{result || "// results will appear here"}</pre>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold">How this maps to MCP tools</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500">
              <tr><th>MCP Tool</th><th>HTTP Endpoint</th><th>Purpose</th></tr>
            </thead>
            <tbody>
              <tr className="border-t border-slate-200/70 dark:border-slate-800"><td className="py-2 font-mono">person.list</td><td>GET /api/persons</td><td>List / search</td></tr>
              <tr className="border-t border-slate-200/70 dark:border-slate-800"><td className="py-2 font-mono">person.get</td><td>GET /api/persons/:id</td><td>Read one</td></tr>
              <tr className="border-t border-slate-200/70 dark:border-slate-800"><td className="py-2 font-mono">person.create</td><td>POST /api/persons</td><td>Create</td></tr>
              <tr className="border-t border-slate-200/70 dark:border-slate-800"><td className="py-2 font-mono">person.update</td><td>PATCH /api/persons/:id</td><td>Update</td></tr>
              <tr className="border-t border-slate-200/70 dark:border-slate-800"><td className="py-2 font-mono">person.delete</td><td>DELETE /api/persons/:id</td><td>Delete</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
