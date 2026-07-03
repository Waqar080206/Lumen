import { cn } from "@/lib/utils";

export function GlassCard({
  children,
  className,
  strong,
}: {
  children: React.ReactNode;
  className?: string;
  strong?: boolean;
}) {
  return <section className={cn(strong ? "liquid-glass-strong" : "liquid-glass", "rounded-lg", className)}>{children}</section>;
}
