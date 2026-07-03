import { cn } from "@/lib/utils";

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "good" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em]",
        tone === "neutral" && "bg-white/7 text-white/70",
        tone === "good" && "bg-emerald-400/10 text-emerald-200",
        tone === "warning" && "bg-amber-300/10 text-amber-200",
        tone === "danger" && "bg-red-400/10 text-red-200",
      )}
    >
      {children}
    </span>
  );
}
