# Flujo — Solicitud de crédito pública

Diagrama de **secuencia** del envío de una solicitud de crédito, desde el
navegador hasta que queda guardada en Supabase. Incluye las tecnologías de cada
capa y la lógica de rollback.

> Para verlo renderizado: preview de Markdown con soporte Mermaid (GitHub lo
> renderiza solo; en VS Code, la extensión "Markdown Preview Mermaid Support").

## Tecnologías por capa

| Capa | Tecnología |
|------|-----------|
| Cliente | React 19 + Next.js (App Router), `fetch` con `FormData` |
| Endpoint | Next.js Route Handler (`app/api/solicitud-credito/route.ts`), Node server |
| Anti-abuso | Rate-limit en memoria + honeypot + validación server-side |
| Base de datos | Supabase Postgres (tablas `solicitudes_credito`, `documentos_credito`, `paises`) |
| Archivos | Supabase Storage — bucket privado `documentos-credito` |
| Autorización | `service_role` (sobrepasa RLS), solo en el servidor |
| Correo | Resend (notificación interna, best-effort) |

## Diagrama

```mermaid
sequenceDiagram
    autonumber
    actor U as Cliente (Navegador · React)
    participant API as Route Handler<br/>/api/solicitud-credito
    participant RL as Rate-limit<br/>(memoria)
    participant DB as Supabase Postgres<br/>(service_role)
    participant ST as Supabase Storage<br/>(bucket privado)
    participant RS as Resend

    U->>API: POST FormData (data JSON + archivos + honeypot)

    API->>RL: checkRateLimit(IP)
    alt supera 3 envíos / 10 min
        RL-->>API: limited
        API-->>U: 429 Demasiados intentos
    end

    Note over API: honeypot, parseo y validación<br/>de campos y archivos
    alt honeypot relleno / datos inválidos
        API-->>U: éxito falso (bot) · o 400
    end

    API->>DB: SELECT id FROM paises WHERE codigo='EC'
    DB-->>API: pais_id

    API->>DB: INSERT solicitudes_credito → id
    DB-->>API: solicitud.id (UUID) → folio SOL-XXXX

    loop por cada archivo válido
        API->>ST: upload(bucket, path, file)
        alt falla una subida
            ST-->>API: error
            API->>ST: remove(archivos ya subidos)
            API->>DB: DELETE solicitud (rollback)
            API-->>U: 502
        end
        ST-->>API: ok
    end

    API->>DB: INSERT documentos_credito (metadata × N)
    alt falla la metadata
        DB-->>API: error
        API->>ST: remove(archivos)
        API->>DB: DELETE solicitud (rollback)
        API-->>U: 502
    end

    API-)RS: enviar notificación interna (best-effort)
    Note over RS: si falla, se ignora:<br/>la solicitud ya quedó guardada

    API-->>U: 200 { ok: true, folio }
```
