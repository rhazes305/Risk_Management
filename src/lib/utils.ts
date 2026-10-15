import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("ms-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return "—";
  return new Intl.DateTimeFormat("ms-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatNilaiKeberkesanan(nilai: string | null | undefined): string {
  if (!nilai) return "Belum diisi";
  return nilai;
}

export function getRiskLevelClass(tahap: string): string {
  switch (tahap) {
    case "Tinggi":
      return "risk-high";
    case "Sederhana":
      return "risk-medium";
    case "Rendah":
      return "risk-low";
    default:
      return "bg-gray-100 text-gray-500 border border-gray-300";
  }
}

export function getStatusClass(status: string): string {
  switch (status) {
    case "DRAF":
      return "status-draf";
    case "MENUNGGU_SEMAKAN":
      return "status-menunggu";
    case "PERLU_PEMBETULAN":
      return "status-perlu-pembetulan";
    case "DISAHKAN":
      return "status-disahkan";
    case "DITUTUP":
      return "status-ditutup";
    default:
      return "status-draf";
  }
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    DRAF: "Draf",
    MENUNGGU_SEMAKAN: "Menunggu Semakan",
    PERLU_PEMBETULAN: "Perlu Pembetulan",
    DISAHKAN: "Disahkan",
    DITUTUP: "Ditutup",
  };
  return labels[status] ?? status;
}

export function getRoleLabel(role: string): string {
  const labels: Record<string, string> = {
    SUPER_ADMIN: "Super Admin",
    PEGAWAI_RISIKO: "Pegawai Risiko",
    UNIT_BAHAGIAN: "Unit / Bahagian",
    PENGURUSAN_PEMANTAU: "Pengurusan / Pemantau",
  };
  return labels[role] ?? role;
}
