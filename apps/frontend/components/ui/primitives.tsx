import type {
  ButtonHTMLAttributes,
  HTMLAttributes,
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils";

export function Card({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/10 bg-slate-950/65 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.32)] backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-2">
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-300">
          {eyebrow}
        </p>
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight text-white">{title}</h2>
      {description ? <p className="text-sm text-slate-300">{description}</p> : null}
    </div>
  );
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
}) {
  const variantClassName =
    variant === "primary"
      ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
      : variant === "secondary"
        ? "bg-white/10 text-white hover:bg-white/15"
        : "bg-transparent text-slate-200 hover:bg-white/10";

  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClassName,
        className,
      )}
      {...props}
    />
  );
}

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-2xl border border-white/12 bg-slate-900/70 px-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-2xl border border-white/12 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-amber-300",
        className,
      )}
      {...props}
    />
  );
}

export function Select({
  className,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "h-11 w-full rounded-2xl border border-white/12 bg-slate-900/70 px-4 text-sm text-white outline-none focus:border-amber-300",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  const toneClassName =
    tone === "success"
      ? "bg-emerald-500/15 text-emerald-200"
      : tone === "warning"
        ? "bg-amber-400/15 text-amber-200"
        : tone === "danger"
          ? "bg-rose-500/15 text-rose-200"
          : "bg-white/10 text-slate-200";

  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-medium",
        toneClassName,
      )}
    >
      {children}
    </span>
  );
}

export function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm text-rose-300">{message}</p>;
}

export function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card className="border-dashed">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-300">{description}</p>
      </div>
    </Card>
  );
}
