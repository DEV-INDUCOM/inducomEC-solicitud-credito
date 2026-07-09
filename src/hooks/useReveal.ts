"use client";

import { useEffect, useRef, useState } from "react";

// Se activa la primera vez que el elemento entra en pantalla y se queda en
// true para siempre (no se re-oculta si el usuario scrollea hacia arriba y
// vuelve a bajar) — por eso se hace unobserve() apenas dispara una vez.
export function useReveal<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(node);
        }
      },
      { threshold }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
