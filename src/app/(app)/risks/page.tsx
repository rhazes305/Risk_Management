import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import { RiskLevelBadge, StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Role } from "@/types";

export default async function RisksPage({
  searchParams,
}: {
  searchParams: { tahun?: string; status?: string; unitId?: string };
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { id: string; role: Role; unitIds: string[] };

  const unitFilter = ROLE_PERMISSIONS[user.role].crossUnit
    ? searchParams.unitId ? { unitId: searchParams.unitId } : {}
    : { unitId: { in: user.unitIds } };

  const risks = await prisma.risk.findMany({
    where: {
      ...unitFilter,
      ...(searchParams.status ? { status: searchParams.status as any } : {}),
    },
    include: {
      unit: { select: { id: true, code: true, name: true } },
      assessments: { orderBy: { tahun: "desc" }, take: 1 },
    },
    orderBy: { updatedAt: "desc" },
  });

  const canCreate = ROLE_PERMISSIONS[user.role].canCreate;

  const units = ROLE_PERMISSIONS[user.role].crossUnit
    ? await prisma.unit.findMany({ where: { isActive: true }, orderBy: { name: "asc" } })
    : [];

  const statusOptions = [
    { value: "", label: "Semua Status" },
    { value: "DRAF", label: "Draf" },
    { value: "MENUNGGU_SEMAKAN", label: "Menunggu Semakan" },
    { value: "PERLU_PEMBETULAN", label: "Perlu Pembetulan" },
    { value: "DISAHKAN", label: "Disahkan" },
    { value: "DITUTUP", label: "Ditutup" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Daftar Risiko</h1>
          <p className="text-sm text-gray-500 mt-1">{risks.length} rekod dijumpai</p>
        </div>
        {canCreate && (
          <Link
            href="/risks/new"
            className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Rekod Baharu
          </Link>
        )}
      </div>

      {/* Penapis */}
      <form method="GET" className="flex flex-wrap gap-3">
        <select
          name="status"
          defaultValue={searchParams.status ?? ""}
          className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {units.length > 0 && (
          <select
            name="unitId"
            defaultValue={searchParams.unitId ?? ""}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Semua Unit</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        )}

        <button
          type="submit"
          className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-200 transition-colors"
        >
          Tapis
        </button>
        <Link
          href="/risks"
          className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          Set Semula
        </Link>
      </form>

      {/* Jadual */}
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Kod</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Tajuk Risiko</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Unit</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Tahap</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Dikemas kini</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {risks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                  Tiada rekod dijumpai.
                </td>
              </tr>
            ) : (
              risks.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500 whitespace-nowrap">
                    <Link href={`/risks/${r.id}`} className="text-blue-600 hover:underline">
                      {r.riskCode}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-900 max-w-xs">
                    <Link href={`/risks/${r.id}`} className="hover:text-blue-600 line-clamp-2">
                      {r.tajukRisiko}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                    {r.unit.code}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <RiskLevelBadge tahap={r.assessments[0]?.tahap ?? "Belum Ditetapkan"} />
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {formatDate(r.updatedAt.toISOString())}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
