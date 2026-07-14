// Thin adapter over sonner so legacy `toast({ title, description, variant })`
// call sites render through the single Sonner toaster mounted in App.tsx.
import { toast as sonnerToast } from "sonner";
import type * as React from "react";

type LegacyToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  duration?: number;
};

function toast({ title, description, variant, duration }: LegacyToastOptions) {
  const message = title ?? description ?? "";
  const options = {
    description: title ? description : undefined,
    duration,
  };

  const id =
    variant === "destructive"
      ? sonnerToast.error(message, options)
      : sonnerToast(message, options);

  return {
    id,
    dismiss: () => sonnerToast.dismiss(id),
  };
}

function useToast() {
  return {
    toast,
    dismiss: (id?: string | number) => sonnerToast.dismiss(id),
  };
}

export { useToast, toast };
