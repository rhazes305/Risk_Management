import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import type { Role } from "@/types";

// GET /api/dashboard — data ringkasan untuk dashboard
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const user = session.user as { id: string; role: Role; unitIds: string[] };

  const unitFilter = ROLE_PERMISSIONS[user.role].crossUnit
    ? {}
    : { unitId: { in: user.unitIds } };

  // Ambil semua risiko aktif dalam skop
  const risks = await prisma.risk.findMany({
    where: { ...unitFilter, status: { not: "DITUTUP" } },
    include: {
      assessments: { orderBy: { tahun: "desc" }, take: 1 },
      treatments: { select: { tarikhSasaran: true, statusTindakan: true } },
    },
  });

  const today = new Date();

  // Kira ringkasan
  let risikoTinggi = 0;
  let risikoSederhana = 0;
  let risikoRendah = 0;
  let tindakanLewat = 0;

  for (const risk of risks) {
    const latest = risk.assessments[0];
    if (latest) {
      if (latest.tahap === "Tinggi") risikoTinggi++;
      else if (latest.tahap === "Sederhana") risikoSederhana++;
      else if (latest.tahap === "Rendah") risikoRendah++;
    }
    for (const t of risk.treatments) {
      if (
        t.tarikhSasaran &&
        new Date(t.tarikhSasaran) < today &&
        t.statusTindakan !== "Selesai"
      ) {
        tindakanLewat++;
      }
    }
  }

  const menunggySemakan = await prisma.risk.count({
    where: { ...unitFilter, status: "MENUNGGU_SEMAKAN" },
  });

  const belumLengkap = await prisma.risk.count({
    where: { ...unitFilter, status: "DRAF" },
  });

  // Risiko keutamaan: Tinggi dahulu, kemudian tindakan lewat
  const priority = risks
    .filter((r) => r.assessments[0]?.tahap === "Tinggi")
    .slice(0, 10);

  return NextResponse.json({
    summary: {
      totalRisiko: risks.length,
      risikoTinggi,
      risikoSederhana,
      risikoRendah,
      tindakanLewat,
      menunggySemakan,
      belumLengkap,
    },
    priority,
  });
}
