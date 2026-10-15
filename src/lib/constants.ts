import { type Role } from "@/types";

// ─── Matriks Risiko ───────────────────────────────────────────────────────────
// NOTA: Ambang PERLU disahkan oleh pemilik proses / jawatankuasa risiko
// sebelum sistem boleh digunakan secara rasmi (lihat Seksyen 11.2 spesifikasi).

export type RiskThreshold = "Rendah" | "Sederhana" | "Tinggi";

/**
 * Kira tahap risiko berdasarkan skor kemungkinan × akibat.
 * Ambang sementara — BELUM DISAHKAN.
 */
export function calculateRiskLevel(
  kemungkinan: number,
  akibat: number
): RiskThreshold {
  const skor = kemungkinan * akibat;
  if (skor <= 4) return "Rendah";
  if (skor <= 9) return "Sederhana";
  return "Tinggi";
}

export const RISK_LEVEL_COLOR: Record<RiskThreshold, string> = {
  Rendah: "risk-low",
  Sederhana: "risk-medium",
  Tinggi: "risk-high",
};

// ─── Kebenaran Peranan ────────────────────────────────────────────────────────

export const ROLE_PERMISSIONS: Record<
  Role,
  {
    canCreate: boolean;
    canUpdate: boolean;
    canVerify: boolean;
    canReturn: boolean;
    canClose: boolean;
    canExport: boolean;
    canManageUsers: boolean;
    crossUnit: boolean;
  }
> = {
  SUPER_ADMIN: {
    canCreate: true,
    canUpdate: true,
    canVerify: true,
    canReturn: true,
    canClose: true,
    canExport: true,
    canManageUsers: true,
    crossUnit: true,
  },
  PEGAWAI_RISIKO: {
    canCreate: true,
    canUpdate: true,
    canVerify: true,
    canReturn: true,
    canClose: true,
    canExport: true,
    canManageUsers: false,
    crossUnit: true,
  },
  UNIT_BAHAGIAN: {
    canCreate: true,
    canUpdate: true,
    canVerify: false,
    canReturn: false,
    canClose: false,
    canExport: false,
    canManageUsers: false,
    crossUnit: false,
  },
  // NOTA: canExport untuk PENGURUSAN_PEMANTAU perlu disahkan pemilik sistem
  PENGURUSAN_PEMANTAU: {
    canCreate: false,
    canUpdate: false,
    canVerify: false,
    canReturn: false,
    canClose: false,
    canExport: false, // Perlu pengesahan — lihat Seksyen 3 spesifikasi
    canManageUsers: false,
    crossUnit: true,
  },
};

// ─── Tempoh Pemantauan ────────────────────────────────────────────────────────

export const MONITORING_PERIODS = ["April", "Ogos", "Disember"] as const;

// ─── Status Rekod ─────────────────────────────────────────────────────────────

export const RECORD_STATUS_LABEL: Record<string, string> = {
  DRAF: "Draf",
  MENUNGGU_SEMAKAN: "Menunggu Semakan",
  PERLU_PEMBETULAN: "Perlu Pembetulan",
  DISAHKAN: "Disahkan",
  DITUTUP: "Ditutup",
};

// ─── Pemalar Am ───────────────────────────────────────────────────────────────

export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
export const ASSESSMENT_SCALE_MIN = 1;
export const ASSESSMENT_SCALE_MAX = 5;
