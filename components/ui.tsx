import type { ButtonHTMLAttributes, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

type ButtonKind = "primary" | "alternative" | "secondary" | "dangerSecondary";
type ButtonSize = "lg" | "md" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  kind?: ButtonKind;
  size?: ButtonSize;
  icon?: LucideIcon;
  children: ReactNode;
};

export function Button({ kind = "primary", size = "lg", icon: Icon, children, className = "", ...props }: ButtonProps) {
  return (
    <button className={`btn btn-${kind} btn-${size} ${className}`} type="button" {...props}>
      {Icon ? <Icon aria-hidden="true" size={16} strokeWidth={2.2} /> : null}
      <span>{children}</span>
    </button>
  );
}

export function StatusPill({ status }: { status: "confirmed" | "pending" | "expired" | "review" | "active" | "verified" | "success" | "warning" | "danger" | "info" }) {
  const labelMap: Record<typeof status, string> = {
    confirmed: "Confirmed",
    pending: "Pending",
    expired: "Expired",
    review: "Review",
    active: "Active",
    verified: "Verified",
    success: "Clear",
    warning: "Warning",
    danger: "Action",
    info: "Info"
  };
  return <span className={`status status-${status}`}>{labelMap[status]}</span>;
}

export function Alert({ tone = "info", title, children }: { tone?: "info" | "danger" | "success" | "warning"; title: string; children: ReactNode }) {
  const Icon = tone === "danger" ? XCircle : tone === "success" ? CheckCircle2 : tone === "warning" ? AlertTriangle : Info;
  return (
    <div className={`alert alert-${tone}`}>
      <Icon aria-hidden="true" size={22} strokeWidth={2.2} />
      <div>
        <strong>{title}</strong>
        <p>{children}</p>
      </div>
    </div>
  );
}

export function FieldPreview({ label, value }: { label: string; value: string }) {
  return (
    <div className="field-preview" aria-label={`${label}: ${value}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange
}: {
  items: { id: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <div className="segmented" role="tablist" aria-label="Merchant state preview">
      {items.map((item) => (
        <button
          aria-selected={value === item.id}
          className={value === item.id ? "selected" : ""}
          key={item.id}
          onClick={() => onChange(item.id)}
          role="tab"
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
