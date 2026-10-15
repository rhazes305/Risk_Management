import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDate, getRoleLabel } from "@/lib/utils";
import { StatusBadge } from "@/components/ui/Badge";
import Link from "next/link";
import type { Role } from "@/types";

export default async function UsersPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { role: Role };
  if (user.role !== "SUPER_ADMIN") redirect("/dashboard");

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      units: { include: { unit: { select: { code: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pengurusan Pengguna</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} pengguna didaftarkan</p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center gap-2 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Pengguna
        </Link>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Nama</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">E-mel</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Peranan</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Unit</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Tarikh Daftar</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 text-xs uppercase tracking-wide">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                  Tiada pengguna didaftarkan.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{u.name}</td>
                  <td className="px-4 py-3 text-gray-500">{u.email}</td>
                  <td className="px-4 py-3 text-gray-700">{getRoleLabel(u.role)}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {u.units.length > 0
                      ? u.units.map((uu) => uu.unit.code).join(", ")
                      : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
                        u.status === "AKTIF"
                          ? "bg-green-50 text-green-800 border-green-300"
                          : "bg-gray-100 text-gray-500 border-gray-300"
                      }`}
                    >
                      {u.status === "AKTIF" ? "Aktif" : "Tidak Aktif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                    {formatDate(u.createdAt.toISOString())}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/users/${u.id}`}
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
