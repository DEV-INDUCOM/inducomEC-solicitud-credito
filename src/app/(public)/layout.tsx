import { PublicNavbar } from "@/components/layout/landing/PublicNavbar";
import { PublicFooter } from "@/components/layout/landing/PublicFooter";

export default function PublicGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div data-surface="landing">
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
