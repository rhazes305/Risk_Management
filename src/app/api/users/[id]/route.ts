import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ROLE_PERMISSIONS } from "@/lib/constants";
import type { Role } from "@/types";

type Params = { params: { id: string } };

// PATCH /api/users/[id] — kemas kini pengguna
export async function PATCH(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Tidak dibenarkan" }, { status: 401 });

  const actor = session.user as { id: string; role: Role };
  if (!ROLE_PERMISSIONS[actor.role].canManageUsers) {
    return NextResponse.json({ error: "Tiada kebenaran" }, { status: 403 });
  }

  const body = await request.json();
  const { name, role, status, unitIds } = body;

  const existing = await prisma.user.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Pengguna tidak dijumpai" }, { status: 404 });

  const updated = await prisma.user.update({
    where: { id: params.id },
    data: {
      ...(name && { name }),
      ...(role && { role }),
      ...(status && { status }),
      ...(unitIds !== undefined && {
        units: {
          deleteMany: {},
          create: unitIds.map((uid: string) => ({ unitId: uid })),
        },
      }),
    },
    select: { id: true, name: true, email: true, role: true, status: true },
  });

  await prisma.auditLog.create({
    data: {
      userId: actor.id,
      action: "UPDATE",
      entityType: "User",
      entityId: params.id,
      before: existing as any,
      after: updated as any,
    },
  });

  return NextResponse.json(updated);
}
