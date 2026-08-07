import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_AUTH_COOKIE_NAME } from "@/lib/supabase/cookie-config";

const AUTH_ROUTES = new Set([
  "/portal/login",
  "/portal/registro",
  "/portal/recuperar-contrasena",
  "/portal/actualizar-contrasena",
]);

const ADMIN_AUTH_ROUTES = new Set(["/admin/login"]);

// /admin y /portal comparten dominio y proyecto de Supabase; sin una cookie
// de sesión separada por superficie, solo puede haber UNA sesión activa por
// navegador y loguearse en una cierra "mágicamente" la otra (ver
// src/lib/supabase/cookie-config.ts para el detalle completo).
function buildSupabaseClient(request: NextRequest, cookieName?: string) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        getAll: () => request.cookies.getAll(), //?Supabase necesita leer las cookies de la petición para saber si existe una sesión activa.
        setAll(cookiesToSet) {
          //?Primero actualiza las cookies dentro de la petición.
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          //?Luego actualiza las cookies dentro de la respuesta.
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
      ...(cookieName ? { cookieOptions: { name: cookieName } } : {}),
    }
  );

  return { supabase, getResponse: () => response };
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/admin")) {
    if (ADMIN_AUTH_ROUTES.has(pathname)) return NextResponse.next({ request });

    const { supabase, getResponse } = buildSupabaseClient(request, ADMIN_AUTH_COOKIE_NAME);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    const { data: personalInterno } = await supabase
      .from("personal_interno")
      .select("id")
      .eq("id", user.id)
      .eq("activo", true)
      .maybeSingle();
    if (!personalInterno) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      return NextResponse.redirect(url);
    }

    return getResponse();
  }

  if (AUTH_ROUTES.has(pathname)) return NextResponse.next({ request });

  const { supabase, getResponse } = buildSupabaseClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal/login";
    return NextResponse.redirect(url);
  }

  const { data: perfil } = await supabase.from("perfiles").select("id").eq("id", user.id).maybeSingle();
  if (!perfil) {
    const url = request.nextUrl.clone();
    url.pathname = "/portal/login";
    return NextResponse.redirect(url);
  }

  return getResponse();
}

export const config = {
  matcher: ["/portal/:path*", "/admin/:path*"],
};
