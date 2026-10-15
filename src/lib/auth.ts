import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";
import { ROLE_PERMISSIONS } from "@/lib/constants";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          include: { units: { include: { unit: true } } },
        });

        if (!user || user.status !== "AKTIF") return null;

        const valid = await bcrypt.compare(parsed.data.password, user.password);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          unitIds: user.units.map((u) => u.unitId),
          permissions: ROLE_PERMISSIONS[user.role],
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.unitIds = (user as any).unitIds;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    session({ session, token }) {
      (session.user as any).role = token.role;
      (session.user as any).unitIds = token.unitIds;
      (session.user as any).permissions = token.permissions;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 }, // 8 jam
});
