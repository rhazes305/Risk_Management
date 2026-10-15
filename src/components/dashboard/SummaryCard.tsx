import { cn } from "@/lib/utils";

interface SummaryCardProps {
  label: string;
  value: number | string;
  sublabel?: string;
  variant?: "default" | "high" | "medium" | "low" | "warning";
  icon: React.ReactNode;
}

export function SummaryCard({
  label,
  value,
  sublabel,
  variant = "default",
  icon,
}: SummaryCardProps) {
  const variants = {
    default: "bg-white border-gray-200",
    high: "bg-red-50 border-red-200",
    medium: "bg-yellow-50 border-yellow-200",
    low: "bg-green-50 border-green-200",
    warning: "bg-orange-50 border-orange-200",
  };

  const valueColors = {
    default: "text-gray-900",
    high: "text-red-700",
    medium: "text-yellow-800",
    low: "text-green-800",
    warning: "text-orange-700",
  };

  const iconColors = {
    default: "text-gray-400",
    high: "text-red-400",
    medium: "text-yellow-500",
    low: "text-green-500",
    warning: "text-orange-400",
  };

  return (
    <div className={cn("rounded-lg border p-5 flex items-start gap-4", variants[variant])}>
      <div className={cn("mt-0.5 flex-shrink-0", iconColors[variant])}>{icon}</div>
      <div className="min-w-0">
        <p className="text-sm text-gray-500 leading-tight">{label}</p>
        <p className={cn("text-2xl font-bold mt-1", valueColors[variant])}>{value}</p>
        {sublabel && <p className="text-xs text-gray-400 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}
