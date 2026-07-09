import { PortalShell } from "@/components/layout/portal/PortalShell";

export default function PortalGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-surface="portal">
      <PortalShell>{children}</PortalShell>
    </div>
  );
}
