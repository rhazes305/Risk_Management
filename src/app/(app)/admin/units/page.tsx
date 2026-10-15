import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import type { Role } from "@/types";

export default async function UnitsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { role: Role };
  if (user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const units = await prisma.unit.findMany({
    include: {
      _count: { select: { risks: true, users: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Unit / Bahagian</h1>
          <p className="text-sm text-gray-500 mt-1">{units.length} unit didaftarkan</p>
        </div>
        <Link
          href="/admin/units/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Unit
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Kod</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Nama Unit</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Pegawai Bertanggungjawab</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Risiko</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Pengguna</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {units.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Tiada unit didaftarkan.
                </td>
              </tr>
            ) : (
              units.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-700 font-semibold">{u.code}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{u.pegawaiTanggungjawab ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-700 text-center">{u._count.risks}</td>
                  <td className="px-4 py-3 text-gray-700 text-center">{u._count.users}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        u.isActive
                          ? "bg-green-50 text-green-800 border-green-300"
                          : "bg-gray-100 text-gray-500 border-gray-300"
                      }`}
                    >
                      {u.isActive ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/units/${u.id}`}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Edit
                    </Link>
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
