import Link from "next/link";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { cn } from "@/lib/utils/cn";

function buildHref(basePath: string, params: Record<string, string | undefined>, page: number) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  search.set("page", String(page));
  return `${basePath}?${search.toString()}`;
}

export function Pagination({
  basePath,
  searchParams,
  page,
  total,
  pageSize,
}: {
  basePath: string;
  searchParams: Record<string, string | undefined>;
  page: number;
  total: number;
  pageSize: number;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1 && total <= pageSize) {
    return (
      <p className="text-sm text-[var(--text-secondary)]">
        Mostrando {total === 0 ? 0 : 1} - {total} de {total} resultados
      </p>
    );
  }

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1].filter((p) => p >= 1 && p <= totalPages));
  const ordered = Array.from(pages).sort((a, b) => a - b);

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="text-sm text-[var(--text-secondary)]">
        Mostrando {from} - {to} de {total} resultados
      </p>
      <nav className="flex items-center gap-1" aria-label="Paginación">
        <Link
          href={buildHref(basePath, searchParams, Math.max(1, page - 1))}
          aria-disabled={page <= 1}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded border border-[color:var(--border-strong)] text-[var(--text-secondary)] hover:border-[color:var(--action-primary)] hover:text-[var(--action-primary)]",
            page <= 1 && "pointer-events-none opacity-40"
          )}
        >
          <IconChevronLeft size={16} />
        </Link>
        {ordered.map((p, i) => (
          <span key={p} className="flex items-center gap-1">
            {i > 0 && ordered[i - 1] !== p - 1 && <span className="px-1 text-[var(--text-muted)]">…</span>}
            <Link
              href={buildHref(basePath, searchParams, p)}
              className={cn(
                "inline-flex h-9 w-9 items-center justify-center rounded border text-sm font-medium",
                p === page
                  ? "border-transparent bg-[var(--action-primary)] text-[var(--action-primary-text)]"
                  : "border-[color:var(--border-strong)] text-[var(--text-secondary)] hover:border-[color:var(--action-primary)] hover:text-[var(--action-primary)]"
              )}
            >
              {p}
            </Link>
          </span>
        ))}
        <Link
          href={buildHref(basePath, searchParams, Math.min(totalPages, page + 1))}
          aria-disabled={page >= totalPages}
          className={cn(
            "inline-flex h-9 w-9 items-center justify-center rounded border border-[color:var(--border-strong)] text-[var(--text-secondary)] hover:border-[color:var(--action-primary)] hover:text-[var(--action-primary)]",
            page >= totalPages && "pointer-events-none opacity-40"
          )}
        >
          <IconChevronRight size={16} />
        </Link>
      </nav>
    </div>
  );
}
