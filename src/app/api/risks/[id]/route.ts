import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import type { Role } from "@/types";

type Params = { params: { id: string } };

// GET /api/risks/[id]
export async function GET(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const user = session.user as { role: Role; unitIds: string[] };

  const risk = await prisma.risk.findUnique({
    where: { id: params.id },
    include: {
      unit: true,
      assessments: { orderBy: { tahun: "asc" } },
      treatments: { orderBy: { createdAt: "asc" } },
      effectiveness: { orderBy: { tahun: "asc" } },
      reviews: {
        orderBy: { createdAt: "desc" },
        include: { reviewer: { select: { id: true, name: true, role: true } } },
      },
    },
  });

  if (!risk) return NextResponse.json({ error: "Rekod tidak dijumpai" }, { status: 404 });

  // Semak skop unit
  if (
    !ROLE_PERMISSIONS[user.role].crossUnit &&
    !user.unitIds.includes(risk.unitId)
  ) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  return NextResponse.json(risk);
}

// PATCH /api/risks/[id]
export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const user = session.user as { id: string; role: Role; unitIds: string[] };

  const existing = await prisma.risk.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Rekod tidak dijumpai" }, { status: 404 });

  if (
    !ROLE_PERMISSIONS[user.role].crossUnit &&
    !user.unitIds.includes(existing.unitId)
  ) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const body = await request.json();

  const updated = await prisma.risk.update({
    where: { id: params.id },
    data: {
      strategiDokumen: body.strategiDokumen,
      terasObjektif: body.terasObjektif,
      isuDalaman: body.isuDalaman,
      isuLuaran: body.isuLuaran,
      tajukRisiko: body.tajukRisiko,
      kesan: body.kesan,
      kawalan: body.kawalan,
      pegawaiId: body.pegawaiId,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "UPDATE",
      entityType: "Risk",
      entityId: params.id,
      riskId: params.id,
      before: existing as any,
      after: updated as any,
    },
  });

  return NextResponse.json(updated);
}
