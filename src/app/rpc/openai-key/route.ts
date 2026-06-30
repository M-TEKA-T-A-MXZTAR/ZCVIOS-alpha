import { NextResponse } from "next/server";
import { z } from "zod";
import { encryptApiKey } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";
import { requireActiveProfile } from "@/lib/session";
import { unauthorized } from "@/lib/http";

const schema = z.object({ apiKey: z.string().min(20) });

export async function GET() {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: profile.id },
    select: { openAiApiKeyEncrypted: true, openAiKeyLast4: true },
  });

  return NextResponse.json({
    hasKey: Boolean(user?.openAiApiKeyEncrypted),
    last4: user?.openAiKeyLast4 ?? null,
  });
}

export async function POST(req: Request) {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  try {
    const body = await req.json();
    const { apiKey } = schema.parse(body);
    const encrypted = encryptApiKey(apiKey.trim());

    await prisma.user.update({
      where: { id: profile.id },
      data: {
        openAiApiKeyEncrypted: encrypted,
        openAiKeyLast4: apiKey.trim().slice(-4),
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid API key" }, { status: 400 });
  }
}

export async function DELETE() {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  await prisma.user.update({
    where: { id: profile.id },
    data: {
      openAiApiKeyEncrypted: null,
      openAiKeyLast4: null,
    },
  });

  return NextResponse.json({ ok: true });
}
