import type { AppUser, Assessment, CheckoutPlanId } from "@/lib/simple-field";

export type View = "pipeline" | "owner" | "menu" | "section" | "stepper" | "calendar" | "tax";
export type Session = Pick<AppUser, "id" | "name" | "role">;
export type LoginForm = { username: string; password: string };
export type StatusFilter = "all" | Assessment["status"];

export type ToastAction = { label: string; onClick: () => void };

export type ToastState = {
  tone: "success" | "error";
  title: string;
  description: string;
  actions?: ToastAction[];
};

export type DialogState = {
  title: string;
  body: string;
  tone: "error" | "confirm";
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
};

export type CheckoutPlan = {
  id: CheckoutPlanId;
  name: string;
  price: number;
  label: string;
  summary: string;
  includes: string[];
  featured?: boolean;
  /** Upfront deposit amount — only for plans that support deposit-monthly */
  deposit?: number;
  /** Number of monthly instalments — only for plans that support deposit-monthly */
  months?: number;
};
