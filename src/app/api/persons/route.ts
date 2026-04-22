import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PersonCreateSchema, requireApiKey } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  const take = Math.min(Number(searchParams.get("limit") ?? 100), 500);

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { email: { contains: q, mode: "insensitive" as const } },
          { role: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {};

  const persons = await prisma.person.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
  });
  return NextResponse.json({ ok: true, count: persons.length, data: persons });
}

export async function POST(req: Request) {
  const auth = requireApiKey(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.reason }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = PersonCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const person = await prisma.person.create({ data: parsed.data });
    return NextResponse.json({ ok: true, data: person }, { status: 201 });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Email already exists" }, { status: 409 });
    }
    return NextResponse.json({ ok: false, error: "Create failed" }, { status: 500 });
  }
}
