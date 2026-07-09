import type { ReactNode } from "react";
import { IconTile } from "@/components/ui/Card";

export function PolicySection({
  icon,
  number,
  title,
  children,
  list,
}: {
  icon: ReactNode;
  number: number;
  title: string;
  children?: ReactNode;
  list?: string[];
}) {
  return (
    <div className="flex gap-5 border-b border-[color:var(--border)] py-8 last:border-b-0">
      <IconTile>{icon}</IconTile>
      <div className="min-w-0 flex-1">
        <h2 className="mb-3 text-xl">
          {number}. {title}
        </h2>
        {children && (
          <div className="text-[var(--text-secondary)] leading-normal">{children}</div>
        )}
        {list && (
          <ul className="mt-3 flex flex-col gap-2">
            {list.map((item) => (
              <li
                key={item}
                className="relative pl-5 text-[var(--text-secondary)] leading-normal before:absolute before:top-[0.6em] before:left-1 before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--accent)] before:content-['']"
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
