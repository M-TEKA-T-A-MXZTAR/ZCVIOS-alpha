import { NextResponse } from "next/server";
import { z } from "zod";
import { requireActiveProfile } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { unauthorized } from "@/lib/http";

const schema = z.object({
  businessUrl: z.string().url().optional().or(z.literal("")),
  socialLinks: z.array(z.string().url()).optional(),
  businessDescription: z.string().max(500).optional(),
  businessType: z.enum(["service", "product", "digital", "hybrid", "unknown"]),
  hoursAvailablePerWeek: z.number().min(1).max(168),
  weeklyRevenue: z.number().min(0),
  targetMonthlyIncome: z.number().min(0),
  targetMaxHoursPerWeek: z.number().min(1).max(168),
  consistencyWindowMonths: z.number().min(1).max(36),
  fullLoggingEnabled: z.boolean(),
  commandMode: z.boolean(),
});

export async function GET() {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: profile.id } });
  if (!user) return unauthorized();

  return NextResponse.json({
    businessUrl: user.businessUrl ?? "",
    socialLinks: user.socialLinks ? user.socialLinks.split(",") : [],
    businessDescription: user.businessDescription ?? "",
    businessType: user.businessType,
    hoursAvailablePerWeek: user.hoursAvailablePerWeek,
    weeklyRevenue: user.weeklyRevenueBaselineCents / 100,
    targetMonthlyIncome: user.targetMonthlyIncomeCents / 100,
    targetMaxHoursPerWeek: user.targetMaxHoursPerWeek,
    consistencyWindowMonths: user.consistencyWindowMonths,
    fullLoggingEnabled: user.fullLoggingEnabled,
    commandMode: user.commandMode,
  });
}

export async function POST(req: Request) {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  try {
    const body = await req.json();
    const input = schema.parse(body);

    const user = await prisma.user.update({
      where: { id: profile.id },
      data: {
        businessUrl: input.businessUrl || null,
        socialLinks: input.socialLinks?.join(",") || null,
        businessDescription: input.businessDescription || null,
        businessType: input.businessType,
        hoursAvailablePerWeek: input.hoursAvailablePerWeek,
        weeklyRevenueBaselineCents: Math.round(input.weeklyRevenue * 100),
        targetMonthlyIncomeCents: Math.round(input.targetMonthlyIncome * 100),
        targetMaxHoursPerWeek: input.targetMaxHoursPerWeek,
        consistencyWindowMonths: input.consistencyWindowMonths,
        fullLoggingEnabled: input.fullLoggingEnabled,
        commandMode: input.commandMode,
      },
    });

    return NextResponse.json({ ok: true, businessType: user.businessType });
  } catch {
    return NextResponse.json({ error: "Invalid onboarding data" }, { status: 400 });
  }
}

export async function DELETE() {
  const profile = await requireActiveProfile();
  if (!profile) return unauthorized();

  await prisma.user.update({
    where: { id: profile.id },
    data: {
      businessUrl: null,
      socialLinks: null,
      businessDescription: null,
      businessType: "unknown",
      hoursAvailablePerWeek: 40,
      weeklyRevenueBaselineCents: 0,
      targetMonthlyIncomeCents: 300000,
      targetMaxHoursPerWeek: 35,
      consistencyWindowMonths: 6,
      fullLoggingEnabled: false,
      commandMode: true,
    },
  });

  return NextResponse.json({ ok: true });
}
