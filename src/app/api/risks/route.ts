import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import type { Role } from "@/types";

// GET /api/risks — senarai risiko dengan penapisan
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const user = session.user as { id: string; role: Role; unitIds: string[] };
  const { searchParams } = new URL(request.url);
  const tahun = searchParams.get("tahun");
  const unitId = searchParams.get("unitId");
  const status = searchParams.get("status");
  const tahap = searchParams.get("tahap");

  // Bina skop unit berdasarkan peranan
  const unitFilter =
    ROLE_PERMISSIONS[user.role].crossUnit
      ? unitId ? { unitId } : {}
      : { unitId: { in: user.unitIds } };

  const risks = await prisma.risk.findMany({
    where: {
      ...unitFilter,
      ...(status ? { status: status as any } : {}),
    },
    include: {
      unit: { select: { id: true, code: true, name: true } },
      assessments: {
        orderBy: { tahun: "desc" },
        take: 1,
      },
      treatments: { select: { id: true, statusTindakan: true, tarikhSasaran: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Tapis mengikut tahun penilaian jika diminta
  let result = risks;
  if (tahun) {
    result = risks.filter((r) =>
      r.assessments.some((a) => a.tahun === parseInt(tahun))
    );
  }
  if (tahap) {
    result = result.filter((r) => r.assessments[0]?.tahap === tahap);
  }

  return NextResponse.json(result);
}

// POST /api/risks — cipta risiko baharu
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const user = session.user as { id: string; role: Role; unitIds: string[] };
  if (!ROLE_PERMISSIONS[user.role].canCreate) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const body = await request.json();

  // Jana kod risiko unik
  const count = await prisma.risk.count();
  const riskCode = `RISK-${new Date().getFullYear()}-${String(count + 1).padStart(3, "0")}`;

  const risk = await prisma.risk.create({
    data: {
      riskCode,
      strategiDokumen: body.strategiDokumen,
      terasObjektif: body.terasObjektif,
      isuDalaman: body.isuDalaman,
      isuLuaran: body.isuLuaran,
      tajukRisiko: body.tajukRisiko,
      kesan: body.kesan,
      kawalan: body.kawalan,
      unitId: body.unitId,
      pegawaiId: body.pegawaiId ?? user.id,
      status: "DRAF",
    },
  });

  // Rekod audit
  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "CREATE",
      entityType: "Risk",
      entityId: risk.id,
      riskId: risk.id,
      after: risk as any,
    },
  });

  return NextResponse.json(risk, { status: 201 });
}
