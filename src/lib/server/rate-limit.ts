import "server-only";
import { NextResponse } from "next/server";

/**
 * Rate limit por IP para endpoints públicos.
 *
 * El contador vive en memoria del proceso. En un deploy serverless (Vercel) cada
 * instancia lleva el suyo, así que el límite efectivo es más laxo que el
 * configurado. Suficiente para el MVP; si hace falta rigor, mover el contador a
 * Supabase o a un KV externo.
 */

type RateLimitOptions = {
  keyPrefix: string;
  limit: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

function clientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip") || "unknown";
}

export function checkRateLimit(request: Request, options: RateLimitOptions) {
  const now = Date.now();
  const key = `${options.keyPrefix}:${clientIp(request)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + options.windowMs });
    return { limited: false, remaining: options.limit - 1, resetAt: now + options.windowMs };
  }

  bucket.count += 1;
  if (bucket.count > options.limit) {
    return { limited: true, remaining: 0, resetAt: bucket.resetAt };
  }

  return { limited: false, remaining: options.limit - bucket.count, resetAt: bucket.resetAt };
}

export function rateLimitResponse(resetAt: number) {
  const retryAfter = Math.max(1, Math.ceil((resetAt - Date.now()) / 1000));
  return NextResponse.json(
    { ok: false, message: "Demasiados intentos. Intenta nuevamente en unos minutos." },
    { status: 429, headers: { "Retry-After": String(retryAfter) } }
  );
}
