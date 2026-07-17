"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { MobileAdminNavigation } from "./MobileAdminNavigation";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";

export function AdminShell({ children, adminNombre }: { children: ReactNode; adminNombre?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open]);

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-page)]">
      <AdminSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopbar onMenuClick={() => setOpen(true)} adminNombre={adminNombre} />
        <main className="page-container w-full flex-1 overflow-y-auto py-8 md:py-10">{children}</main>
      </div>
      <MobileAdminNavigation open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
