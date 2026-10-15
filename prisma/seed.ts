// Seed awal — data rujukan untuk pembangunan dan UAT
import { PrismaClient, Role, AccountStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Units ──────────────────────────────────
  const units = await Promise.all([
    prisma.unit.upsert({
      where: { code: "DIT" },
      update: {},
      create: { code: "DIT", name: "Jabatan Teknologi Maklumat", isActive: true },
    }),
    prisma.unit.upsert({
      where: { code: "KPRO" },
      update: {},
      create: { code: "KPRO", name: "Ketua Program", isActive: true },
    }),
    prisma.unit.upsert({
      where: { code: "KJA" },
      update: {},
      create: { code: "KJA", name: "Ketua Jabatan Akademik", isActive: true },
    }),
  ]);

  // ── Users ──────────────────────────────────
  const hash = await bcrypt.hash("Password123!", 12);

  const superAdmin = await prisma.user.upsert({
    where: { email: "admin@risiko.gov.my" },
    update: {},
    create: {
      name: "Super Admin",
      email: "admin@risiko.gov.my",
      password: hash,
      role: Role.SUPER_ADMIN,
      status: AccountStatus.AKTIF,
    },
  });

  const pegawai = await prisma.user.upsert({
    where: { email: "pegawai@risiko.gov.my" },
    update: {},
    create: {
      name: "Pegawai Risiko",
      email: "pegawai@risiko.gov.my",
      password: hash,
      role: Role.PEGAWAI_RISIKO,
      status: AccountStatus.AKTIF,
    },
  });

  const unitUser = await prisma.user.upsert({
    where: { email: "unit.dit@risiko.gov.my" },
    update: {},
    create: {
      name: "Pengguna DIT",
      email: "unit.dit@risiko.gov.my",
      password: hash,
      role: Role.UNIT_BAHAGIAN,
      status: AccountStatus.AKTIF,
    },
  });

  // Pautkan pengguna unit DIT
  await prisma.userUnit.upsert({
    where: { userId_unitId: { userId: unitUser.id, unitId: units[0].id } },
    update: {},
    create: { userId: unitUser.id, unitId: units[0].id },
  });

  // ── Risiko sampel (R1 dari jtmk.xlsx) ──────
  const risk = await prisma.risk.upsert({
    where: { riskCode: "RISK-2026-001" },
    update: {},
    create: {
      riskCode: "RISK-2026-001",
      strategiDokumen: "Pelan Strategik Politeknik 2021–2025",
      terasObjektif: "Teras 1 – Menghasilkan Graduan TVET yang Berkualiti",
      isuDalaman: "Isu berkaitan peruntukan pembelian ABM",
      isuLuaran: "Keperluan industri berubah dengan cepat",
      tajukRisiko:
        "Alat/Bahan bantu mengajar yang tidak terkini dan tidak menepati keperluan industri",
      kesan: "Graduan tidak bersedia menghadapi keperluan industri semasa",
      kawalan:
        "Lawatan akademik di industri; perbincangan dengan panel industri",
      unitId: units[0].id,
      pegawaiId: unitUser.id,
      status: "DISAHKAN",
    },
  });

  // Penilaian tahunan
  const penilaian = [
    { tahun: 2023, kemungkinan: 3, akibat: 5 },
    { tahun: 2024, kemungkinan: 3, akibat: 5 },
    { tahun: 2025, kemungkinan: 3, akibat: 5 },
    { tahun: 2026, kemungkinan: 2, akibat: 3 },
  ];
  for (const p of penilaian) {
    await prisma.riskAssessment.upsert({
      where: { riskId_tahun: { riskId: risk.id, tahun: p.tahun } },
      update: {},
      create: {
        riskId: risk.id,
        tahun: p.tahun,
        kemungkinan: p.kemungkinan,
        akibat: p.akibat,
        skor: p.kemungkinan * p.akibat,
        // Ambang belum disahkan — gunakan label sumber 2026 sahaja
        tahap: p.tahun === 2026 ? "Sederhana" : "Belum Ditetapkan",
      },
    });
  }

  // Keberkesanan
  const keberkesanan = [
    { tahun: 2022, nilai: "TB" },
    { tahun: 2023, nilai: "50%" },
    { tahun: 2024, nilai: "50%" },
    { tahun: 2025, nilai: "20%" },
    { tahun: 2026, nilai: "20%" },
  ];
  for (const k of keberkesanan) {
    await prisma.effectiveness.upsert({
      where: { riskId_tahun: { riskId: risk.id, tahun: k.tahun } },
      update: {},
      create: {
        riskId: risk.id,
        tahun: k.tahun,
        nilai: k.nilai,
        pengemaskiniId: unitUser.id,
      },
    });
  }

  // ── Pihak Berkepentingan (sampel) ──────────
  const stakeholder = await prisma.stakeholder.upsert({
    where: { id: "stk-001" },
    update: {},
    create: {
      id: "stk-001",
      unitId: units[0].id,
      pihakBerkepentingan: "Industri / Majikan",
      keperluanJangkaan: "Graduan yang kompeten dan bersedia bekerja",
      isu: "Jurang kemahiran teknikal graduan",
      peluangKawalan: "Program inkubator dan lawatan industri",
      statusRisiko: null, // Belum diisi
      tahun: 2026,
    },
  });

  // Pemantauan berkala — kosong seperti sumber
  for (const tempoh of ["April", "Ogos", "Disember"]) {
    await prisma.stakeholderMonitoring.upsert({
      where: {
        stakeholderId_tahun_tempoh: {
          stakeholderId: stakeholder.id,
          tahun: 2026,
          tempoh,
        },
      },
      update: {},
      create: {
        stakeholderId: stakeholder.id,
        tahun: 2026,
        tempoh,
        statusKemaskini: null, // Belum diisi
      },
    });
  }

  console.log("✅  Seed selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
