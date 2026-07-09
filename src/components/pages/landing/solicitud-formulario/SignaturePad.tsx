"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";

export interface SignaturePadHandle {
  clear: () => void;
}

// Firma dibujada a mano: pointer events sobre un <canvas>, exporta un dataURL PNG
// en cada trazo terminado. El tamaño interno del canvas (900x240) es fijo y se
// escala por CSS, por eso pos() reconvierte coordenadas de pantalla a coordenadas
// del canvas (canvas.width / rect.width).
export const SignaturePad = forwardRef<SignaturePadHandle, {
  initialValue?: string;
  onChange: (dataUrl: string) => void;
}>(function SignaturePad({ initialValue, onChange }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isEmpty, setIsEmpty] = useState(!initialValue);

  useImperativeHandle(ref, () => ({
    clear() {
      const canvas = canvasRef.current;
      const ctx = ctxRef.current;
      if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
      setIsEmpty(true);
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#16304a";
    ctxRef.current = ctx;

    if (initialValue) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = initialValue;
    }

    let drawing = false;
    let last: { x: number; y: number } | null = null;
    let dirty = false;

    function pos(ev: PointerEvent) {
      const r = canvas!.getBoundingClientRect();
      return {
        x: (ev.clientX - r.left) * (canvas!.width / r.width),
        y: (ev.clientY - r.top) * (canvas!.height / r.height),
      };
    }
    function start(ev: PointerEvent) {
      drawing = true;
      last = pos(ev);
      ev.preventDefault();
    }
    function move(ev: PointerEvent) {
      if (!drawing || !last) return;
      const p = pos(ev);
      ctx!.beginPath();
      ctx!.moveTo(last.x, last.y);
      ctx!.lineTo(p.x, p.y);
      ctx!.stroke();
      last = p;
      dirty = true;
      setIsEmpty(false);
      ev.preventDefault();
    }
    function end() {
      if (drawing && dirty) onChange(canvas!.toDataURL());
      drawing = false;
    }

    canvas.addEventListener("pointerdown", start);
    canvas.addEventListener("pointermove", move);
    window.addEventListener("pointerup", end);
    return () => {
      canvas.removeEventListener("pointerdown", start);
      canvas.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="relative touch-none rounded-lg border-2 border-dashed border-[color:var(--border-strong)] bg-[var(--bg-surface)]">
      <canvas
        ref={canvasRef}
        width={900}
        height={240}
        className="block h-50 w-full rounded-lg"
      />
      {isEmpty && (
        <span className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-[var(--text-muted)]">
          Firma aquí con el mouse o el dedo
        </span>
      )}
    </div>
  );
});
