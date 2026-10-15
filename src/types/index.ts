// Jenis TypeScript teras — Sistem Pemantauan Pengurusan Risiko

export type Role =
  | "SUPER_ADMIN"
  | "PEGAWAI_RISIKO"
  | "UNIT_BAHAGIAN"
  | "PENGURUSAN_PEMANTAU";

export type AccountStatus = "AKTIF" | "TIDAK_AKTIF";

export type RecordStatus =
  | "DRAF"
  | "MENUNGGU_SEMAKAN"
  | "PERLU_PEMBETULAN"
  | "DISAHKAN"
  | "DITUTUP";

export type RiskLevel = "Rendah" | "Sederhana" | "Tinggi" | "Belum Ditetapkan";

export type MonitoringPeriod = "April" | "Ogos" | "Disember";

// ── Pengguna ────────────────────────────────
export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: AccountStatus;
  units: Unit[];
  createdAt: string;
  updatedAt: string;
}

// ── Unit ────────────────────────────────────
export interface Unit {
  id: string;
  code: string;
  name: string;
  pegawaiTanggungjawab?: string;
  isActive: boolean;
}

// ── Risiko ──────────────────────────────────
export interface Risk {
  id: string;
  riskCode: string;
  strategiDokumen?: string;
  terasObjektif?: string;
  isuDalaman?: string;
  isuLuaran?: string;
  tajukRisiko: string;
  kesan?: string;
  kawalan?: string;
  unitId: string;
  unit?: Unit;
  pegawaiId?: string;
  status: RecordStatus;
  closedReason?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
  assessments?: RiskAssessment[];
  treatments?: RiskTreatment[];
  effectiveness?: Effectiveness[];
  latestAssessment?: RiskAssessment;
}

// ── Penilaian Risiko ────────────────────────
export interface RiskAssessment {
  id: string;
  riskId: string;
  tahun: number;
  kemungkinan: number;
  akibat: number;
  skor: number;
  tahap: RiskLevel;
  tarikhPenilaian: string;
}

// ── Tindakan Rawatan ────────────────────────
export interface RiskTreatment {
  id: string;
  riskId: string;
  tindakan: string;
  pemilik?: string;
  tarikhMula?: string;
  tarikhSasaran?: string;
  statusTindakan: string;
  bukti?: string;
  komen?: string;
  createdAt: string;
  updatedAt: string;
}

// ── Keberkesanan ────────────────────────────
export interface Effectiveness {
  id: string;
  riskId: string;
  tahun: number;
  nilai: string; // "TB" | "50%" | "20%" dll
  bukti?: string;
  tarikhKemaskini: string;
  pengemaskiniId?: string;
}

// ── Semakan ─────────────────────────────────
export interface RiskReview {
  id: string;
  riskId: string;
  reviewerId: string;
  reviewer?: Pick<User, "id" | "name" | "role">;
  action: "SAHKAN" | "PULANGKAN";
  komen?: string;
  createdAt: string;
}

// ── Pihak Berkepentingan ─────────────────────
export interface Stakeholder {
  id: string;
  unitId: string;
  unit?: Unit;
  pihakBerkepentingan: string;
  keperluanJangkaan?: string;
  isu?: string;
  peluangKawalan?: string;
  statusRisiko?: string | null; // null = "Belum diisi"
  tahun: number;
  monitoring?: StakeholderMonitoring[];
}

export interface StakeholderMonitoring {
  id: string;
  stakeholderId: string;
  tahun: number;
  tempoh: MonitoringPeriod;
  statusKemaskini?: string | null; // null = "Belum diisi"
  tarikh?: string;
  pengemaskiniId?: string;
  bukti?: string;
}

// ── Audit ────────────────────────────────────
export interface AuditLog {
  id: string;
  userId: string;
  user?: Pick<User, "id" | "name" | "role">;
  action: string;
  entityType: string;
  entityId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  komen?: string;
  createdAt: string;
}

// ── Dashboard ────────────────────────────────
export interface DashboardSummary {
  totalRisiko: number;
  risikoTinggi: number;
  risikoSederhana: number;
  risikoRendah: number;
  tindakanLewat: number;
  menunggySemakan: number;
  belumLengkap: number;
}

// ── Laporan ──────────────────────────────────
export type ReportTab =
  | "PELAN_PENGURUSAN_RISIKO"
  | "ANALISIS_KEBERKESANAN"
  | "PEMANTAUAN_PIHAK_BERKEPENTINGAN";

export interface ReportFilter {
  tahun?: number;
  unitId?: string;
  tahap?: RiskLevel;
  status?: RecordStatus;
  pemilik?: string;
  tempoh?: MonitoringPeriod;
}
