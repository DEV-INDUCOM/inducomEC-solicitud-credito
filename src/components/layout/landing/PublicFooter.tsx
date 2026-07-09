import { IconMail, IconMapPin, IconPhone } from "@tabler/icons-react";
import { contactInfo, footerLegalLinks, footerNavLinks, siteConfig } from "@/lib/config/site";

export function PublicFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-dark-deep)] text-slate-300">
      <div className="page-container grid grid-cols-[1.4fr_1fr_1fr_1.2fr] gap-10 py-16 max-[860px]:grid-cols-2 max-[860px]:gap-8 max-[520px]:grid-cols-1">
        <div>
          <p className="mb-3 font-display text-xl text-[var(--text-on-dark)]">{siteConfig.name}</p>
          <p className="max-w-[32ch] text-sm text-slate-400 leading-normal">
            Líder regional en soluciones industriales integrales. Innovación y respaldo técnico
            para el sector productivo latinoamericano.
          </p>
        </div>

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
