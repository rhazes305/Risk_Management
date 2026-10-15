"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  roles: Role[];
}

const navItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    roles: ["SUPER_ADMIN", "PEGAWAI_RISIKO", "UNIT_BAHAGIAN", "PENGURUSAN_PEMANTAU"],
  },
  {
    href: "/risks",
    label: "Daftar Risiko",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    roles: ["SUPER_ADMIN", "PEGAWAI_RISIKO", "UNIT_BAHAGIAN", "PENGURUSAN_PEMANTAU"],
  },
  {
    href: "/effectiveness",
    label: "Keberkesanan",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    roles: ["SUPER_ADMIN", "PEGAWAI_RISIKO", "UNIT_BAHAGIAN", "PENGURUSAN_PEMANTAU"],
  },
  {
    href: "/stakeholders",
    label: "Pihak Berkepentingan",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    roles: ["SUPER_ADMIN", "PEGAWAI_RISIKO", "UNIT_BAHAGIAN", "PENGURUSAN_PEMANTAU"],
  },
  {
    href: "/reports",
    label: "Laporan",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
    roles: ["SUPER_ADMIN", "PEGAWAI_RISIKO", "PENGURUSAN_PEMANTAU"],
  },
  {
    href: "/admin/users",
    label: "Pengguna",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    roles: ["SUPER_ADMIN"],
  },
  {
    href: "/admin/units",
    label: "Unit / Bahagian",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    roles: ["SUPER_ADMIN"],
  },
];

interface SidebarProps {
  userRole: Role;
  userName: string;
}

export function Sidebar({ userRole, userName }: SidebarProps) {
  const pathname = usePathname();

  const filtered = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-gray-900 text-white">
      {/* Logo / Tajuk */}
      <div className="px-5 py-5 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-blue-600 flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
            R
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">Pengurusan</p>
            <p className="text-xs text-gray-400 leading-tight">Risiko</p>
          </div>
        </div>
      </div>

      {/* Navigasi */}
      <nav className="flex-1 px-3 py-4 space-y-1" aria-label="Navigasi utama">
        {filtered.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-700 hover:text-white"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Maklumat pengguna */}
      <div className="px-4 py-4 border-t border-gray-700">
        <p className="text-xs text-gray-400 truncate">{userName}</p>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="mt-2 text-xs text-gray-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Log Keluar
          </button>
        </form>
      </div>
    </aside>
  );
}
