"use client";

import { X } from "lucide-react";
import type { DialogState, ToastState } from "@/components/field-app/types";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  wide?: boolean;
};

export function Button({ className = "", variant = "primary", wide = false, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={`hs-btn hs-btn-${variant} ${wide ? "hs-btn-wide" : ""} ${className}`}
    />
  );
}

export function Panel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={`hs-panel ${className}`}>{children}</section>;
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  return <label className="hs-label">{children}</label>;
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`hs-input ${props.className ?? ""}`} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`hs-input hs-textarea ${props.className ?? ""}`} />;
}

export function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`hs-input ${props.className ?? ""}`} />;
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  return <span className={`hs-badge hs-badge-${tone}`}>{children}</span>;
}

export function ToastHost({ toast, onClose }: { toast: ToastState | null; onClose: () => void }) {
  if (!toast) return null;

  return (
    <div className="hs-toast-wrap">
      <div className={`hs-toast hs-toast-${toast.tone}`}>
        <div className="hs-toast-heading">
          <div>
            <strong>{toast.title}</strong>
            <p>{toast.description}</p>
          </div>
          <button type="button" onClick={onClose} className="hs-icon-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        {toast.actions?.length ? (
          <div className="hs-toast-actions">
            {toast.actions.map((action) => (
              <Button key={action.label} type="button" variant="secondary" onClick={action.onClick}>
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function Dialog({ dialog, onClose }: { dialog: DialogState | null; onClose: () => void }) {
  if (!dialog) return null;

  return (
    <div className="hs-dialog-backdrop">
      <div className="hs-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title">
        <h2 id="dialog-title">{dialog.title}</h2>
        <p>{dialog.body}</p>
        <div className="hs-dialog-actions">
          {dialog.tone === "confirm" ? (
            <>
              <Button
                type="button"
                variant="danger"
                onClick={() => {
                  dialog.onConfirm?.();
                  onClose();
                }}
              >
                {dialog.confirmLabel ?? "Confirm"}
              </Button>
              <Button type="button" variant="secondary" onClick={onClose}>
                {dialog.cancelLabel ?? "Cancel"}
              </Button>
            </>
          ) : (
            <Button type="button" onClick={onClose}>
              OK
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
