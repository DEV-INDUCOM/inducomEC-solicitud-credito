import { Logo } from "@/components/ui/Logo";
import { PortalNavList } from "./PortalNavList";

export function PortalSidebar() {
  return (
    <aside className="hidden h-full w-64 shrink-0 flex-col overflow-y-auto bg-brand-navy-900 px-4 py-6 md:flex">
      <div className="px-2 pb-6">
        <Logo
          variant="full"
          src="/Images/logo-inducom-blanco.png"
          imageClassName="h-9 w-auto"
          width={290}
          height={100}
        />
      </div>
      <PortalNavList />
    </aside>
  );
}
