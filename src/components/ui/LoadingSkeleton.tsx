import { cn } from "@/lib/utils/cn";

export function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-[var(--bg-surface-alt)]", className)} aria-hidden />;
}

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-label="Cargando dashboard">
      <div className="flex flex-col gap-2">
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
      </div>
      <SkeletonBlock className="h-72" />
    </div>
  );
}

export function PaypalSkeleton() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-label="Cargando módulo PayPal">
      <SkeletonBlock className="h-8 w-56" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <SkeletonBlock className="h-40" />
        <SkeletonBlock className="h-40" />
      </div>
      <SkeletonBlock className="h-64" />
    </div>
  );
}
