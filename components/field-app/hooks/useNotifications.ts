"use client";

import { useEffect, useState } from "react";
import type { DialogState, ToastState } from "@/components/field-app/types";

export function useNotifications() {
  const [toast, setToast] = useState<ToastState | null>(null);
  const [dialog, setDialog] = useState<DialogState | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  return {
    toast,
    dialog,
    showToast: setToast,
    showDialog: setDialog,
    closeToast: () => setToast(null),
    closeDialog: () => setDialog(null),
  };
}
