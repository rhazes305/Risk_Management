import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import bcrypt from "bcryptjs";
import type { Role } from "@/types";

// GET /api/users
export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const user = session.user as { role: Role };
  if (user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      units: { include: { unit: { select: { id: true, code: true, name: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

// POST /api/users — cipta pengguna baharu
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const actor = session.user as { id: string; role: Role };
  if (!ROLE_PERMISSIONS[actor.role].canManageUsers) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const body = await request.json();
  const { name, email, password, role, unitIds } = body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "E-mel sudah didaftarkan" }, { status: 409 });
  }

  const hash = await bcrypt.hash(password, 12);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hash,
      role,
      status: "AKTIF",
      units: unitIds?.length
        ? { create: unitIds.map((uid: string) => ({ unitId: uid })) }
        : undefined,
    },
    select: {
      id: true, name: true, email: true, role: true, status: true, createdAt: true,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      action: "CREATE",
      entityType: "User",
      entityId: newUser.id,
      after: newUser as any,
    },
  });

  return NextResponse.json(newUser, { status: 201 });
}
