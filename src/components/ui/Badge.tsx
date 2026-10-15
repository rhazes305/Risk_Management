import * as React from "react";
import { cn, getRiskLevelClass, getStatusClass, getStatusLabel } from "@/lib/utils";

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
}

export function Badge({ className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold",
        className
      )}
    >
      {children}
    </span>
  );
}

export function RiskLevelBadge({ tahap }: { tahap: string }) {
  const icon =
    tahap === "Tinggi" ? "▲" : tahap === "Sederhana" ? "●" : "▼";
  return (
    <Badge className={cn("border", getRiskLevelClass(tahap))}>
      <span aria-hidden="true">{icon}</span>
      {tahap === "Belum Ditetapkan" ? "Belum Ditetapkan" : tahap}
    </Badge>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge className={cn("border", getStatusClass(status))}>
      {getStatusLabel(status)}
    </Badge>
  );
}
