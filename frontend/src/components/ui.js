import React from "react";

function cx(...c) {
  return c.filter(Boolean).join(" ");
}

const variants = {
  default: "bg-primary text-primary-foreground hover:opacity-90",
  gold: "bg-gold text-gold-foreground hover:opacity-90",
  outline: "border border-border bg-background text-foreground hover:bg-secondary",
  ghost: "text-foreground hover:bg-secondary",
  secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
  destructive: "bg-destructive text-destructive-foreground hover:opacity-90",
};
const sizes = { sm: "h-9 px-3 text-sm", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" };

export function Button({ variant = "default", size = "md", className, as: Comp = "button", ...props }) {
  return (
    <Comp
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-[background-color,opacity,transform] duration-200 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
}

export function Input({ className, ...props }) {
  return (
    <input
      className={cx(
        "flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cx(
        "flex w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/40 transition-shadow",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }) {
  return <label className={cx("text-sm font-medium text-foreground", className)} {...props} />;
}

export function Select({ className, children, ...props }) {
  return (
    <select
      className={cx(
        "flex h-10 w-full rounded-lg border border-input bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/40",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function Card({ className, ...props }) {
  return <div className={cx("rounded-xl border border-border bg-card text-card-foreground", className)} {...props} />;
}

export function Badge({ className, ...props }) {
  return (
    <span
      className={cx("inline-flex items-center rounded-md border px-2 py-1 text-xs font-medium", className)}
      {...props}
    />
  );
}

export { cx };
