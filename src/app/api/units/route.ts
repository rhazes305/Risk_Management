import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/types";

// GET /api/units
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const units = await prisma.unit.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(units);
}

// POST /api/units
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const user = session.user as { id: string; role: Role };
  if (user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const body = await request.json();

  const unit = await prisma.unit.create({
    data: {
      code: body.code,
      name: body.name,
      pegawaiTanggungjawab: body.pegawaiTanggungjawab,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE",
      entityType: "Unit",
      entityId: unit.id,
      after: unit as any,
    },
  });

  return NextResponse.json(unit, { status: 201 });
}
