import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import { SummaryCard } from "@/components/dashboard/SummaryCard";
import { RiskLevelBadge, StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Role } from "@/types";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { id: string; name?: string; role: Role; unitIds: string[] };

  const unitFilter = ROLE_PERMISSIONS[user.role].crossUnit
    ? {}
    : { unitId: { in: user.unitIds } };

  const today = new Date();

  // Ambil semua risiko aktif
  const risks = await prisma.risk.findMany({
    where: { ...unitFilter, status: { not: "DITUTUP" } },
    include: {
      unit: { select: { code: true, name: true } },
      assessments: { orderBy: { tahun: "desc" }, take: 1 },
      treatments: { select: { tarikhSasaran: true, statusTindakan: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Kira ringkasan
  let risikoTinggi = 0, risikoSederhana = 0, risikoRendah = 0, tindakanLewat = 0;

  for (const r of risks) {
    const t = r.assessments[0]?.tahap;
    if (t === "Tinggi") risikoTinggi++;
    else if (t === "Sederhana") risikoSederhana++;
    else if (t === "Rendah") risikoRendah++;

    for (const tr of r.treatments) {
      if (tr.tarikhSasaran && new Date(tr.tarikhSasaran) < today && tr.statusTindakan !== "Selesai") {
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

  // Senarai keutamaan: Tinggi dahulu
  const priorityRisks = risks
    .sort((a, b) => {
      const order = { Tinggi: 0, Sederhana: 1, Rendah: 2, "Belum Ditetapkan": 3 };
      return (
        (order[a.assessments[0]?.tahap as keyof typeof order] ?? 3) -
        (order[b.assessments[0]?.tahap as keyof typeof order] ?? 3)
      );
    })
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Pengepala */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Selamat datang, {user.name ?? "Pengguna"} &mdash; {formatDate(new Date().toISOString())}
        </p>
      </div>

      {/* Kad Ringkasan */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Risiko Tinggi"
          value={risikoTinggi}
          sublabel="Perlu perhatian segera"
          variant="high"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          }
        />
        <SummaryCard
          label="Risiko Sederhana"
          value={risikoSederhana}
          sublabel="Perlu pemantauan berkala"
          variant="medium"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <SummaryCard
          label="Risiko Rendah"
          value={risikoRendah}
          sublabel="Pemantauan rutin"
          variant="low"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <SummaryCard
          label="Tindakan Lewat"
          value={tindakanLewat}
          sublabel="Melebihi tarikh sasaran"
          variant="warning"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* Baris kedua kad */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <SummaryCard
          label="Menunggu Semakan"
          value={menunggySemakan}
          sublabel="Rekod perlu disemak"
          variant="default"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          }
        />
        <SummaryCard
          label="Rekod Draf"
          value={belumLengkap}
          sublabel="Belum dihantar"
          variant="default"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
        />
        <SummaryCard
          label="Jumlah Risiko Aktif"
          value={risks.length}
          sublabel="Semua status kecuali Ditutup"
          variant="default"
          icon={
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
      </div>

      {/* Senarai Keutamaan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Risiko Keutamaan</h2>
          <Link href="/risks" className="text-xs text-blue-600 hover:underline">
            Lihat semua →
          </Link>
        </div>

        {priorityRisks.length === 0 ? (
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-8 text-center text-sm text-gray-400">
            Tiada risiko aktif dalam skop anda.
          </div>
        ) : (
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Kod</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Risiko</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Unit</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Tahap</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Dikemas kini</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {priorityRisks.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                      <Link href={`/risks/${r.id}`} className="text-blue-600 hover:underline">
                        {r.riskCode}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-900 max-w-xs">
                      <p className="line-clamp-2">{r.tajukRisiko}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                      {r.unit.code}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <RiskLevelBadge tahap={r.assessments[0]?.tahap ?? "Belum Ditetapkan"} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-400 whitespace-nowrap text-xs">
                      {formatDate(r.updatedAt.toISOString())}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
