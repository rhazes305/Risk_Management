import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import type { Role } from "@/types";

type Params = { params: { id: string } };

// POST /api/risks/[id]/review — sahkan atau pulangkan
export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const user = session.user as { id: string; role: Role };

  if (!ROLE_PERMISSIONS[user.role].canVerify) {
    return NextResponse.json({ error: "Tiada kebenaran untuk menyemak" }, { status: 403 });
  }

  const risk = await prisma.risk.findUnique({ where: { id: params.id } });
  if (!risk) return NextResponse.json({ error: "Rekod tidak dijumpai" }, { status: 404 });

  if (risk.status !== "MENUNGGU_SEMAKAN") {
    return NextResponse.json(
      { error: "Hanya rekod berstatus Menunggu Semakan boleh disemak" },
      { status: 400 }
    );
  }

  const body = await request.json();
  const { action, komen } = body as { action: "SAHKAN" | "PULANGKAN"; komen?: string };

  if (!["SAHKAN", "PULANGKAN"].includes(action)) {
    return NextResponse.json({ error: "Tindakan tidak sah" }, { status: 400 });
  }

  const newStatus = action === "SAHKAN" ? "DISAHKAN" : "PERLU_PEMBETULAN";

  const [updated] = await prisma.$transaction([
    prisma.risk.update({
      where: { id: params.id },
      data: { status: newStatus },
    }),
    prisma.riskReview.create({
      data: {
        riskId: params.id,
        reviewerId: user.id,
        action,
        komen,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        action: action === "SAHKAN" ? "VERIFY" : "RETURN",
        entityType: "Risk",
        entityId: params.id,
        riskId: params.id,
        komen,
      },
    }),
  ]);

  return NextResponse.json(updated);
}
