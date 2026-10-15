import { z } from "zod";
import { ASSESSMENT_SCALE_MIN, ASSESSMENT_SCALE_MAX } from "@/lib/constants";

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z.string().email("E-mel tidak sah"),
  password: z.string().min(1, "Kata laluan diperlukan"),
});

// ─── Pengguna ─────────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
  name: z.string().min(2, "Nama terlalu pendek"),
  email: z.string().email("E-mel tidak sah"),
  password: z.string().min(8, "Kata laluan minimum 8 aksara"),
  role: z.enum(["SUPER_ADMIN", "PEGAWAI_RISIKO", "UNIT_BAHAGIAN", "PENGURUSAN_PEMANTAU"]),
  unitIds: z.array(z.string()).optional(),
});

// ─── Unit ─────────────────────────────────────────────────────────────────────

export const createUnitSchema = z.object({
  code: z.string().min(2, "Kod unit diperlukan"),
  name: z.string().min(2, "Nama unit diperlukan"),
  pegawaiTanggungjawab: z.string().optional(),
});

// ─── Risiko ───────────────────────────────────────────────────────────────────

export const createRiskSchema = z.object({
  strategiDokumen: z.string().optional(),
  terasObjektif: z.string().optional(),
  isuDalaman: z.string().optional(),
  isuLuaran: z.string().optional(),
  tajukRisiko: z.string().min(5, "Tajuk risiko diperlukan (min 5 aksara)"),
  kesan: z.string().min(1, "Kesan diperlukan"),
  kawalan: z.string().optional(),
  unitId: z.string().min(1, "Unit diperlukan"),
  pegawaiId: z.string().optional(),
});

// ─── Penilaian Risiko ─────────────────────────────────────────────────────────

export const riskAssessmentSchema = z.object({
  tahun: z.number().int().min(2000).max(2100),
  kemungkinan: z
    .number()
    .int()
    .min(ASSESSMENT_SCALE_MIN)
    .max(ASSESSMENT_SCALE_MAX),
  akibat: z
    .number()
    .int()
    .min(ASSESSMENT_SCALE_MIN)
    .max(ASSESSMENT_SCALE_MAX),
});

// ─── Tindakan Rawatan ─────────────────────────────────────────────────────────

export const riskTreatmentSchema = z
  .object({
    tindakan: z.string().min(5, "Keterangan tindakan diperlukan"),
    pemilik: z.string().optional(),
    tarikhMula: z.string().optional(),
    tarikhSasaran: z.string().optional(),
    statusTindakan: z.string().optional(),
    bukti: z.string().optional(),
    komen: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.tarikhMula && data.tarikhSasaran) {
        return new Date(data.tarikhSasaran) >= new Date(data.tarikhMula);
      }
      return true;
    },
    {
      message: "Tarikh sasaran tidak boleh mendahului tarikh mula",
      path: ["tarikhSasaran"],
    }
  );

// ─── Keberkesanan ─────────────────────────────────────────────────────────────

export const effectivenessSchema = z.object({
  tahun: z.number().int().min(2000).max(2100),
  nilai: z.string().min(1, "Nilai keberkesanan diperlukan"),
  bukti: z.string().optional(),
});

// ─── Semakan ──────────────────────────────────────────────────────────────────

export const reviewSchema = z.object({
  action: z.enum(["SAHKAN", "PULANGKAN"]),
  komen: z.string().optional(),
});

// ─── Pihak Berkepentingan ─────────────────────────────────────────────────────

export const createStakeholderSchema = z.object({
  unitId: z.string().min(1, "Unit diperlukan"),
  pihakBerkepentingan: z.string().min(2, "Nama pihak berkepentingan diperlukan"),
  keperluanJangkaan: z.string().optional(),
  isu: z.string().optional(),
  peluangKawalan: z.string().optional(),
  statusRisiko: z.string().nullable().optional(),
  tahun: z.number().int().min(2000).max(2100),
});

// ─── Pemantauan Berkala ───────────────────────────────────────────────────────

export const monitoringSchema = z.object({
  tempoh: z.enum(["April", "Ogos", "Disember"]),
  statusKemaskini: z.string().nullable().optional(),
  tarikh: z.string().optional(),
  bukti: z.string().optional(),
});

// ─── Penapis Laporan ──────────────────────────────────────────────────────────

export const reportFilterSchema = z.object({
  tab: z.enum([
    "PELAN_PENGURUSAN_RISIKO",
    "ANALISIS_KEBERKESANAN",
    "PEMANTAUAN_PIHAK_BERKEPENTINGAN",
  ]),
  tahun: z.number().int().optional(),
  unitId: z.string().optional(),
  tahap: z.enum(["Rendah", "Sederhana", "Tinggi", "Belum Ditetapkan"]).optional(),
  status: z
    .enum([
      "DRAF",
      "MENUNGGU_SEMAKAN",
      "PERLU_PEMBETULAN",
      "DISAHKAN",
      "DITUTUP",
    ])
    .optional(),
  pemilik: z.string().optional(),
  tempoh: z.enum(["April", "Ogos", "Disember"]).optional(),
});
