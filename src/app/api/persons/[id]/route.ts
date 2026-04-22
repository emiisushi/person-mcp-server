import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { PersonUpdateSchema, requireApiKey } from "@/lib/validation";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  const { id } = await params;
  const person = await prisma.person.findUnique({ where: { id } });
  if (!person) return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true, data: person });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const auth = requireApiKey(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.reason }, { status: 401 });

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = PersonUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const person = await prisma.person.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ ok: true, data: person });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    if (e?.code === "P2002") return NextResponse.json({ ok: false, error: "Email already exists" }, { status: 409 });
    return NextResponse.json({ ok: false, error: "Update failed" }, { status: 500 });
  }
}

export async function PUT(req: Request, ctx: Ctx) {
  return PATCH(req, ctx);
}

export async function DELETE(req: Request, { params }: Ctx) {
  const auth = requireApiKey(req);
  if (!auth.ok) return NextResponse.json({ ok: false, error: auth.reason }, { status: 401 });

  const { id } = await params;
  try {
    await prisma.person.delete({ where: { id } });
    return NextResponse.json({ ok: true, deleted: id });
  } catch (e: any) {
    if (e?.code === "P2025") return NextResponse.json({ ok: false, error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: false, error: "Delete failed" }, { status: 500 });
  }
}
