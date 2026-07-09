import { IconCircleCheck } from "@tabler/icons-react";
import { LinkButton } from "@/components/ui/LinkButton";
import { Button } from "@/components/ui/Button";
import { routes } from "@/lib/config/site";

export function SuccessScreen({
  summaryName,
  summaryFin,
  folio,
  onReset,
}: {
  summaryName: string;
  summaryFin: string;
  folio: string;
  onReset: () => void;
}) {
  return (
    <div className="rounded-2xl bg-[var(--bg-surface)] p-9 text-center shadow-md max-[640px]:p-6">
      <div className="mx-auto mb-4.5 flex h-18 w-18 items-center justify-center rounded-full bg-[var(--state-success-bg)]">
        <IconCircleCheck size={40} className="text-[var(--state-success-text)]" aria-hidden="true" />
      </div>
      <h2 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">Solicitud enviada</h2>
      <p className="mx-auto mb-6.5 max-w-[29rem] text-[var(--text-secondary)] leading-normal">
        Hemos recibido tu solicitud de crédito. El equipo comercial de INDUCOM la revisará y te
        contactará para continuar el proceso.
      </p>

      <div className="mx-auto mb-7 max-w-[27.5rem] overflow-hidden rounded-lg border border-[color:var(--border)] text-left">
        <div className="flex justify-between border-b border-[color:var(--border)] px-4 py-3">
          <span className="font-mono text-xs font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase">
            Solicitante
          </span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{summaryName}</span>
        </div>
        <div className="flex justify-between border-b border-[color:var(--border)] px-4 py-3">
          <span className="font-mono text-xs font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase">
            Financiamiento
          </span>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{summaryFin}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="font-mono text-xs font-medium tracking-[0.06em] text-[var(--text-muted)] uppercase">
            Folio
          </span>
          <span className="font-mono text-sm font-semibold text-[var(--accent)]">{folio}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={onReset} variant="outline" size="lg">
          Nueva solicitud
        </Button>
        <LinkButton href={routes.home} size="lg">
          Volver al inicio
        </LinkButton>
      </div>
    </div>
  );
}
