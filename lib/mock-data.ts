import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  Link2,
  PlugZap,
  RadioTower,
  WalletCards
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MerchantMode = "new" | "ready" | "active" | "attention";

export type SetupStep = {
  title: string;
  body: string;
  status: "open" | "done" | "locked";
  icon: LucideIcon;
};

export type PaymentRow = {
  product: string;
  network: string;
  payer: string;
  receiver: string;
  status: "confirmed" | "pending" | "expired" | "review";
  tx: string;
  date: string;
  amount: string;
};

export type AttentionItem = {
  title: string;
  detail: string;
  severity: "warning" | "danger" | "info" | "success";
};

export const modeLabels: Record<MerchantMode, string> = {
  new: "New",
  ready: "Ready",
  active: "Active",
  attention: "Attention"
};

export const setupStepsByMode: Record<MerchantMode, SetupStep[]> = {
  new: [
    {
      title: "Connect access wallet",
      body: "Use a signature to enter the workspace. No business profile is required.",
      status: "open",
      icon: WalletCards
    },
    {
      title: "Create payment link",
      body: "Choose network, currency and fixed amount. Company name stays optional.",
      status: "locked",
      icon: Link2
    },
    {
      title: "Share and receive",
      body: "Copy a hosted checkout link or QR after the payment method is created.",
      status: "locked",
      icon: RadioTower
    }
  ],
  ready: [
    {
      title: "Access wallet connected",
      body: "0x79c2...42aa is the workspace access key.",
      status: "done",
      icon: CheckCircle2
    },
    {
      title: "Create first payment link",
      body: "A verified receiving wallet is ready for Polygon USDT.",
      status: "open",
      icon: Link2
    },
    {
      title: "Receive first payment",
      body: "Payments will appear in recent activity after checkout is shared.",
      status: "locked",
      icon: Clock3
    }
  ],
  active: [
    {
      title: "Workspace live",
      body: "Wallet roles are configured and payment methods are active.",
      status: "done",
      icon: CheckCircle2
    },
    {
      title: "Links accepting payments",
      body: "4 active links route payments to verified receiving wallets.",
      status: "done",
      icon: Link2
    },
    {
      title: "Operations running",
      body: "Monitor and webhooks are reporting without unresolved issues.",
      status: "done",
      icon: PlugZap
    }
  ],
  attention: [
    {
      title: "Workspace live",
      body: "Payment acceptance is enabled, but two items require action.",
      status: "done",
      icon: CheckCircle2
    },
    {
      title: "Resolve pending payment",
      body: "One invoice has been pending longer than expected.",
      status: "open",
      icon: AlertTriangle
    },
    {
      title: "Review receiving wallet",
      body: "A new wallet verification request expires in 24 minutes.",
      status: "open",
      icon: WalletCards
    }
  ]
};

export const payments: PaymentRow[] = [
  {
    product: "Paylink / Storefront USDT",
    network: "Polygon",
    payer: "0x9a41a1dcb282110f4c02",
    receiver: "0x79c2f064d44c2cbef42a",
    status: "confirmed",
    tx: "0x4e31b8c778bddc557812fcebb0c4db6d6bbbd117",
    date: "18 Jun, 16:42",
    amount: "250 USDT"
  },
  {
    product: "Invoice / Order 1042",
    network: "Polygon",
    payer: "0x8371cf6b30a8410fd981",
    receiver: "0x79c2f064d44c2cbef42a",
    status: "pending",
    tx: "",
    date: "18 Jun, 16:12",
    amount: "120 USDT"
  },
  {
    product: "Paylink / Event pass",
    network: "Polygon",
    payer: "0x6cf3e18c9501a7d94202",
    receiver: "0x91d5a7f6ea8064d11d29",
    status: "review",
    tx: "0xac1cb727967318d10d7adeb9c641f8e8c04912d8",
    date: "18 Jun, 14:08",
    amount: "75 USDT"
  },
  {
    product: "Invoice / Order 1037",
    network: "Polygon",
    payer: "0x3b78fd121c3f4b601adc",
    receiver: "0x79c2f064d44c2cbef42a",
    status: "expired",
    tx: "",
    date: "17 Jun, 22:18",
    amount: "45 USDT"
  }
];

export const attentionItems: AttentionItem[] = [
  {
    title: "Pending invoice is aging",
    detail: "Order 1042 has no detected transfer after 34 minutes.",
    severity: "warning" as const
  },
  {
    title: "Wallet verification expires soon",
    detail: "Receiving wallet 0x91d5...1d29 needs a signature to stay usable.",
    severity: "danger" as const
  },
  {
    title: "Webhook delivery recovered",
    detail: "Last retry was delivered. Keep this item visible until the next clean event.",
    severity: "info" as const
  }
];

export const emptyAttentionItems: AttentionItem[] = [
  {
    title: "No action required",
    detail: "Open payments and wallet verifications are clear.",
    severity: "success" as const
  }
];

export const walletRows = [
  {
    role: "Access wallet",
    address: "0x79c2f064d44c2cbef42a",
    network: "Ethereum signature",
    status: "active"
  },
  {
    role: "Default receiving wallet",
    address: "0x79c2f064d44c2cbef42a",
    network: "Polygon USDT",
    status: "verified"
  },
  {
    role: "Secondary receiving wallet",
    address: "0x91d5a7f6ea8064d11d29",
    network: "Polygon USDT",
    status: "pending"
  }
];

export const createOptions = [
  { label: "Payment link", icon: Link2 },
  { label: "Invoice", icon: FileText },
  { label: "Receiving wallet", icon: WalletCards }
];

export function maskValue(value: string) {
  if (!value) return "Waiting";
  if (value.includes("...")) return value;
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}
