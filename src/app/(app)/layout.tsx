import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import type { Role } from "@/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = session.user as { name?: string; role: Role };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar userRole={user.role} userName={user.name ?? "Pengguna"} />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
