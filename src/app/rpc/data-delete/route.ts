import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActiveProfile } from "@/lib/session";
import { unauthorized } from "@/lib/http";

const schema = z.object({ confirmation: z.literal("DELETE") });

export async function DELETE(req: Request) {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  try {
    const body = await req.json();
    schema.parse(body);

    await prisma.user.delete({ where: { id: profile.id } });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Type DELETE to confirm" }, { status: 400 });
  }
}
