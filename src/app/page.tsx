"use client";

import { useEffect, useState } from "react";

type Person = {
  id: string;
  name: string;
  email: string;
  age: number | null;
  role: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
};

const empty = { name: "", email: "", age: "", role: "", bio: "" };

export default function PersonsPage() {
  const [persons, setPersons] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/persons${q ? `?q=${encodeURIComponent(q)}` : ""}`, { cache: "no-store" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed to load");
      setPersons(json.data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const payload: any = {
        name: form.name,
        email: form.email,
        age: form.age === "" ? null : Number(form.age),
        role: form.role || null,
        bio: form.bio || null,
      };
      const res = await fetch(editingId ? `/api/persons/${editingId}` : "/api/persons", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Request failed");
      setForm(empty);
      setEditingId(null);
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this person?")) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/persons/${id}`, { method: "DELETE" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Delete failed");
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  function edit(p: Person) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      email: p.email,
      age: p.age == null ? "" : String(p.age),
      role: p.role ?? "",
      bio: p.bio ?? "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-8">
      <section className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">People</h1>
            <p className="text-sm text-slate-500">Direct CRUD against your Postgres database.</p>
          </div>
          <span className="badge">{persons.length} records</span>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="mb-4 text-lg font-semibold">
          {editingId ? "Edit Person" : "Create Person"}
        </h2>
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <input className="input" placeholder="Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="input" placeholder="Email *" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          <input className="input" placeholder="Age" type="number" min={0} max={150} value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          <input className="input" placeholder="Role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} />
          <textarea className="input md:col-span-2" rows={3} placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="btn-primary" disabled={busy}>
              {busy ? "Saving..." : editingId ? "Update" : "Create"}
            </button>
            {editingId && (
              <button type="button" className="btn-secondary" onClick={() => { setEditingId(null); setForm(empty); }}>
                Cancel
              </button>
            )}
          </div>
          {error && <p className="md:col-span-2 text-sm text-red-600">{error}</p>}
        </form>
      </section>

      <section className="card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Directory</h2>
          <form
            onSubmit={(e) => { e.preventDefault(); load(); }}
            className="flex gap-2"
          >
            <input className="input" placeholder="Search name, email, role" value={q} onChange={(e) => setQ(e.target.value)} />
            <button className="btn-secondary" type="submit">Search</button>
          </form>
        </div>

        {loading ? (
          <p className="text-sm text-slate-500">Loading…</p>
        ) : persons.length === 0 ? (
          <p className="text-sm text-slate-500">No people yet. Create one above or via MCP.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500">
                <tr>
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Age</th>
                  <th className="py-2">Role</th>
                  <th className="py-2"></th>
                </tr>
              </thead>
              <tbody>
                {persons.map((p) => (
                  <tr key={p.id} className="border-t border-slate-200/70 dark:border-slate-800">
                    <td className="py-2 font-medium">{p.name}</td>
                    <td className="py-2">{p.email}</td>
                    <td className="py-2">{p.age ?? "—"}</td>
                    <td className="py-2">{p.role ?? "—"}</td>
                    <td className="py-2 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="btn-secondary" onClick={() => edit(p)}>Edit</button>
                        <button className="btn-danger" onClick={() => remove(p.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
