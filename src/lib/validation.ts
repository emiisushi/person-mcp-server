import { z } from "zod";

export const PersonCreateSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  email: z.string().email("Invalid email"),
  age: z.coerce.number().int().min(0).max(150).optional().nullable(),
  role: z.string().max(80).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
});

export const PersonUpdateSchema = PersonCreateSchema.partial();

export type PersonCreateInput = z.infer<typeof PersonCreateSchema>;
export type PersonUpdateInput = z.infer<typeof PersonUpdateSchema>;

export function requireApiKey(req: Request): { ok: true } | { ok: false; reason: string } {
  const expected = process.env.MCP_API_KEY;
  if (!expected) return { ok: true };
  const header = req.headers.get("x-api-key") ?? req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (header && header === expected) return { ok: true };
  return { ok: false, reason: "Invalid or missing API key" };
}
