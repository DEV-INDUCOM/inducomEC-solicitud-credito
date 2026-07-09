import { Badge } from "@/components/ui/Badge";

export function PolicyHero({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <section className="bg-linear-[160deg] from-brand-navy-700 to-brand-navy-900 py-12 text-[var(--text-on-dark)]">
      <div className="page-container">
        <Badge onDark className="mb-5">
          Información legal
        </Badge>
        <h1 className="text-4xl text-[var(--text-on-dark)]">{title}</h1>
        <p className="mt-4 max-w-[56ch] text-lg text-slate-300">{subtitle}</p>
      </div>
    </section>
  );
}
