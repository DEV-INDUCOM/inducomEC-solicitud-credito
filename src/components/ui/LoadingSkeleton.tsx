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
      {/* Dos tarjetas de resumen, la actividad y los últimos movimientos
       *  (ver dashboard/page.tsx). */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SkeletonBlock className="h-44" />
        <SkeletonBlock className="h-44" />
      </div>
      <SkeletonBlock className="h-64" />
      <SkeletonBlock className="h-56" />
    </div>
  );
}

export function PaypalSkeleton() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-label="Cargando módulo PayPal">
      <SkeletonBlock className="h-8 w-56" />
      {/* Dos tarjetas altas: cashback y garantía (ver paypal/page.tsx). */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <SkeletonBlock className="h-72" />
        <SkeletonBlock className="h-72" />
      </div>
      <SkeletonBlock className="h-64" />
    </div>
  );
}

export function GarantiaSkeleton() {
  return (
    <div className="flex flex-col gap-8" role="status" aria-label="Cargando garantía extendida">
      <SkeletonBlock className="h-8 w-64" />
      <SkeletonBlock className="h-56" />
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <SkeletonBlock className="h-32" />
        <SkeletonBlock className="h-32" />
      </div>
      <SkeletonBlock className="h-64" />
    </div>
  );
}
