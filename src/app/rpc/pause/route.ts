import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireActiveProfile } from "@/lib/session";
import { startOfDay } from "@/lib/time";
import { unauthorized } from "@/lib/http";

const schema = z
  .object({
    mode: z.enum(["1week", "2weeks", "custom", "resume"]),
    customDate: z.string().date().optional(),
  })
  .refine(
    (data) => {
      if (data.mode !== "custom" || !data.customDate) return true;
      const maxDate = new Date();
      maxDate.setFullYear(maxDate.getFullYear() + 1);
      return new Date(data.customDate).getTime() <= maxDate.getTime();
    },
    { message: "Pause end date cannot exceed one year from today", path: ["customDate"] },
  );

export async function GET() {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  const now = startOfDay();
  const activePause = await prisma.pauseWindow.findFirst({
    where: {
      userId: profile.id,
      isActive: true,
      endDate: { gte: now },
    },
    orderBy: { endDate: "desc" },
  });

  return NextResponse.json({
    isPaused: Boolean(activePause),
    pauseUntil: activePause?.endDate ?? null,
  });
}

export async function POST(req: Request) {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  try {
    const body = await req.json();
    const input = schema.parse(body);
    const now = startOfDay();

    if (input.mode === "resume") {
      await prisma.pauseWindow.updateMany({
        where: { userId: profile.id, isActive: true },
        data: { isActive: false, endDate: now },
      });
      return NextResponse.json({ ok: true, pauseUntil: null });
    }

    let endDate = new Date(now);
    if (input.mode === "1week") endDate.setDate(endDate.getDate() + 7);
    if (input.mode === "2weeks") endDate.setDate(endDate.getDate() + 14);
    if (input.mode === "custom") {
      if (!input.customDate) {
        return NextResponse.json({ error: "Custom date required" }, { status: 400 });
      }
      endDate = startOfDay(new Date(input.customDate));
    }

    await prisma.pauseWindow.updateMany({
      where: { userId: profile.id, isActive: true },
      data: { isActive: false },
    });

    const pause = await prisma.pauseWindow.create({
      data: {
        userId: profile.id,
        startDate: now,
        endDate,
        isActive: true,
      },
    });

    return NextResponse.json({ ok: true, pauseUntil: pause.endDate });
  } catch {
    return NextResponse.json({ error: "Invalid pause request" }, { status: 400 });
  }
}
