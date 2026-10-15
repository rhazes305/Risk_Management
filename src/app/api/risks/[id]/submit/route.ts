import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import type { Role } from "@/types";

type Params = { params: { id: string } };

// POST /api/risks/[id]/submit — hantar untuk semakan
export async function POST(_req: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const user = session.user as { id: string; role: Role; unitIds: string[] };

  const risk = await prisma.risk.findUnique({ where: { id: params.id } });
  if (!risk) return NextResponse.json({ error: "Rekod tidak dijumpai" }, { status: 404 });

  if (
    !ROLE_PERMISSIONS[user.role].crossUnit &&
    !user.unitIds.includes(risk.unitId)
  ) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  if (!["DRAF", "PERLU_PEMBETULAN"].includes(risk.status)) {
    return NextResponse.json(
      { error: "Hanya rekod berstatus Draf atau Perlu Pembetulan boleh dihantar" },
      { status: 400 }
    );
  }

  const updated = await prisma.risk.update({
    where: { id: params.id },
    data: { status: "MENUNGGU_SEMAKAN" },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "SUBMIT",
      entityType: "Risk",
      entityId: params.id,
      riskId: params.id,
    },
  });

  return NextResponse.json(updated);
}
