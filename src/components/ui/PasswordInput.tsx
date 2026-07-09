"use client";

import { useState } from "react";
import { IconEye, IconEyeOff } from "@tabler/icons-react";
import { Input, type InputProps } from "./Input";

export function PasswordInput(props: Omit<InputProps, "type" | "trailing">) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar contraseña" : "Mostrar contraseña"}
          aria-pressed={visible}
        >
          {visible ? <IconEyeOff size={18} /> : <IconEye size={18} />}
        </button>
      }
    />
  );
}
