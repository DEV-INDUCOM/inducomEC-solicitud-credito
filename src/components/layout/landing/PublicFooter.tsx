import { IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { Logo } from "@/components/ui/Logo";
import { contactInfo, footerLegalLinks, footerNavLinks, siteConfig } from "@/lib/config/site";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-dark-deep)] text-slate-300">
      {/* Columna extra "1.4fr_auto" entre el logo y Navegación: es un espaciador invisible
          (ver <div aria-hidden> abajo) para empujar solo esas 3 columnas a la derecha,
          sin agrandar la columna del logo ni tocar el gap entre Navegación/Legal/Contacto. */}
      <div className="page-container grid grid-cols-[1.4fr_auto_1fr_1fr_1.2fr] gap-10 py-16 max-[860px]:grid-cols-2 max-[860px]:gap-8 max-[520px]:grid-cols-1">
        <div className="flex flex-col items-center" >
          {/* Versión recortada: el PNG original tenía ~31% de espacio transparente vacío a los
              lados, por eso se veía chico/apretado. width/height son las del archivo recortado. */}
          <Logo
            variant="full"
            src="/Images/logo-inducom-blanco-recortado.png"
            width={608}
            height={190}
            imageClassName="h-22 w-auto"
          />
          <p className="mt-3 max-w-[32ch] text-sm text-slate-400 leading-normal">
            Líder regional en soluciones industriales integrales. Innovación y respaldo técnico
            para el sector productivo latinoamericano.
          </p>
        </div>

        {/* Espaciador: solo ocupa espacio en desktop (5 columnas). En mobile
            (grid-cols-2/1 más abajo) se oculta y desaparece de la grilla. */}
        <div aria-hidden="true" className="w-16 max-[860px]:hidden" />

        <div>
          <p className="mb-4 font-sans text-sm font-semibold text-[var(--text-on-dark)]">Navegación</p>
          <ul className="flex flex-col gap-3">
            {footerNavLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-slate-300 hover:text-brand-orange-400">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 font-sans text-sm font-semibold text-[var(--text-on-dark)]">Legal</p>
          <ul className="flex flex-col gap-3">
            {footerLegalLinks.map((link) => (
              <li key={link.href}>
                <a href={link.href} className="text-sm text-slate-300 hover:text-brand-orange-400">
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-4 font-sans text-sm font-semibold text-[var(--text-on-dark)]">Contacto</p>
          <ul className="flex flex-col gap-3">
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <IconMail size={16} className="mt-0.5 shrink-0 text-brand-orange-400" aria-hidden="true" />
              <a href={`mailto:${contactInfo.email}`} className="text-slate-300 hover:text-brand-orange-400">
                {contactInfo.email}
              </a>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <IconPhone size={16} className="mt-0.5 shrink-0 text-brand-orange-400" aria-hidden="true" />
              <a
                href={`tel:${contactInfo.phone.replace(/[^+\d]/g, "")}`}
                className="text-slate-300 hover:text-brand-orange-400"
              >
                {contactInfo.phone}
              </a>
            </li>
            <li className="flex items-start gap-2 text-sm text-slate-300">
              <IconMapPin size={16} className="mt-0.5 shrink-0 text-brand-orange-400" aria-hidden="true" />
              <span>{contactInfo.address}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="page-container">
        <div className="border-t border-[color:var(--border-on-dark)] py-6 text-xs text-slate-400">
          © {year} {siteConfig.fullName}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
