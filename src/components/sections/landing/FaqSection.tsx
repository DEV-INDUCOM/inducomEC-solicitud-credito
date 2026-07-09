import { Accordion } from "@/components/ui/Accordion";

const faqItems = [
  {
    question: "¿Quién puede solicitar acceso?",
    answer:
      "El portal está diseñado exclusivamente para empresas (personas jurídicas) y contratistas industriales independientes con RUC activo en los países donde operamos. Se requiere un historial comercial previo o una validación crediticia positiva.",
  },
  {
    question: "¿La solicitud garantiza aprobación?",
    answer:
      "No. Enviar la solicitud no garantiza la aprobación del crédito. Nuestro equipo evalúa cada caso según el perfil crediticio y comercial de la empresa antes de emitir una decisión.",
  },
  {
    question: "¿Qué sucede después de enviar el formulario?",
    answer:
      "Recibirá una confirmación de recepción. Nuestro equipo revisa la información y, si la solicitud es aprobada, se genera un código de invitación de un solo uso para crear su cuenta en el portal.",
  },
  {
    question: "¿Qué datos solicita INDUCOM y cómo se protegen?",
    answer:
      "Se solicitan datos como identificación e ingresos, junto con documentos de respaldo. Estos datos se tratan conforme a nuestra política de privacidad y a la normativa de protección de datos aplicable en Ecuador, Bolivia, Perú y Colombia.",
  },
  {
    question: "¿Cómo recupero mi código de invitación?",
    answer:
      "Un código puede haber vencido o ya haber sido utilizado. Si el suyo no funciona, contacte a INDUCOM para gestionar uno nuevo.",
  },
  {
    question: "¿Puedo gestionar varias razones sociales?",
    answer:
      "Cada persona requiere su propio código de invitación, asociado a una única empresa. Si necesita gestionar más de una razón social, contacte a nuestro equipo comercial.",
  },
  {
    question: "Contacto de soporte",
    answer:
      "Para cualquier duda sobre su solicitud o su cuenta, escríbanos a info@inducom.com o llámenos al +593 (4) 259 0000.",
  },
];

export function FaqSection() {
  return (
    <section className="bg-[var(--bg-surface-alt)] py-16" id="faq">
      <div className="page-container">
        <div className="mb-10 text-center">
          <h2 className="text-3xl text-[var(--text-primary)]">Preguntas Frecuentes</h2>

          <p className="mt-3 text-[var(--text-muted)]">
            Todo lo que necesita saber sobre el proceso de acreditación y acceso.
          </p>
          
        </div>

        <div className="mx-auto max-w-[52rem] rounded-lg border border-[color:var(--border-strong)] bg-[var(--bg-surface-alt)] px-6 max-[640px]:px-3">
          <Accordion items={faqItems}  />
        </div>
      </div>
    </section>
  );
}
