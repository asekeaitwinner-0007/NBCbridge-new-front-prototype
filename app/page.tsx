"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  BarChart3,
  ChevronDown,
  CircleDollarSign,
  Copy,
  ExternalLink,
  FileText,
  Info,
  KeyRound,
  LayoutDashboard,
  Link2,
  MoreHorizontal,
  Plus,
  Settings,
  ShieldCheck,
  Webhook,
  WalletCards
} from "lucide-react";
import { Alert, Button, FieldPreview, SegmentedControl, StatusPill } from "../components/ui";
import {
  attentionItems,
  AttentionItem,
  createOptions,
  emptyAttentionItems,
  maskValue,
  MerchantMode,
  modeLabels,
  payments,
  PaymentRow,
  setupStepsByMode,
  walletRows
} from "../lib/mock-data";

const tabs: { id: MerchantMode; label: string }[] = [
  { id: "new", label: "New" },
  { id: "ready", label: "Ready" },
  { id: "active", label: "Active" },
  { id: "attention", label: "Attention" }
];

type Section = "dashboard" | "payments" | "links" | "wallets" | "integrations" | "api" | "settings";
type ActionModal = "create" | "connect-wallet" | "add-wallet" | null;

export default function MerchantDashboardPrototype() {
  const [mode, setMode] = useState<MerchantMode>("new");
  const [section, setSection] = useState<Section>("dashboard");
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
  const [actionModal, setActionModal] = useState<ActionModal>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const isSetupMode = mode === "new" || mode === "ready";
  const isActiveLike = mode === "active" || mode === "attention";
  const modeAttentionItems = mode === "attention" ? attentionItems : emptyAttentionItems;
  const modePayments = isActiveLike ? payments : [];
  const headline = useMemo(() => {
    if (section === "payments") return "Payments show what arrived, what is pending, and what needs review.";
    if (section === "links") return "Create and manage checkout links without turning setup into registration.";
    if (section === "wallets") return "Wallet roles are explicit: access wallet and receiving wallets are not the same thing.";
    if (section === "integrations") return "Integrations stay secondary until the merchant is ready for API or plugin work.";
    if (section === "api") return "API keys are powerful, but they should not distract from the first direct payment.";
    if (section === "settings") return "Settings hold preferences and optional customer-facing display details.";
    if (mode === "new") return "Your merchant workspace is ready. Turn on payment acceptance in 3 steps.";
    if (mode === "ready") return "Wallets are ready. Create the first payment method and share checkout.";
    if (mode === "attention") return "Payments are live. Two operational items need a decision.";
    return "Payments are live. Track money movement and create the next checkout quickly.";
  }, [mode, section]);

  return (
    <div className="app-shell">
      <Header mode={mode} section={section} onCreate={() => setActionModal("create")} onSectionChange={setSection} />
      <main className="page">
        <section className="hero-band">
          <div>
            <div className="eyebrow">
              <LayoutDashboard size={16} aria-hidden="true" />
              Merchant dashboard logic prototype
            </div>
            <h1>{headline}</h1>
          </div>
        </section>

        {section === "dashboard" ? (
          <section className="workspace-grid">
            <div className="main-column">
              {isSetupMode ? <SetupPanel mode={mode} onContinue={() => setActionModal("connect-wallet")} /> : <OperatingMetrics mode={mode} />}
              <AttentionPanel items={modeAttentionItems} mode={mode} />
              <RecentPayments rows={modePayments} onCopy={setCopyToast} onSelect={setSelectedPayment} />
            </div>
            <aside className="side-column">
              <CreatePanel mode={mode} onCreate={() => setActionModal("create")} />
              <WalletPanel mode={mode} onAddWallet={() => setActionModal("add-wallet")} />
              <CustomerIdentityPanel />
            </aside>
          </section>
        ) : null}

        {section === "payments" ? <PaymentsScreen rows={modePayments} mode={mode} onCopy={setCopyToast} onCreate={() => setActionModal("create")} onSelect={setSelectedPayment} /> : null}
        {section === "links" ? <LinksScreen mode={mode} onCreate={() => setActionModal("create")} /> : null}
        {section === "wallets" ? <WalletsScreen mode={mode} onAddWallet={() => setActionModal("add-wallet")} onConnect={() => setActionModal("connect-wallet")} /> : null}
        {section === "integrations" ? <SecondaryScreen kind="integrations" /> : null}
        {section === "api" ? <SecondaryScreen kind="api" /> : null}
        {section === "settings" ? <SecondaryScreen kind="settings" /> : null}

        <PrototypeControls mode={mode} setMode={setMode} />
      </main>
      <TransactionModal onCopy={setCopyToast} payment={selectedPayment} onClose={() => setSelectedPayment(null)} />
      <ActionModalView kind={actionModal} mode={mode} onClose={() => setActionModal(null)} />
      {copyToast ? <CopyToast message={copyToast} onDone={() => setCopyToast(null)} /> : null}
    </div>
  );
}

function PrototypeControls({
  mode,
  setMode
}: {
  mode: MerchantMode;
  setMode: (mode: MerchantMode) => void;
}) {
  return (
    <details className="prototype-controls">
      <summary>
        <span>Prototype controls</span>
        <strong>Merchant state: {modeLabels[mode]}</strong>
      </summary>
      <p>This switcher is only for reviewing dashboard states before backend state is connected.</p>
      <SegmentedControl items={tabs} value={mode} onChange={setMode} />
    </details>
  );
}

function Header({
  mode,
  section,
  onCreate,
  onSectionChange
}: {
  mode: MerchantMode;
  section: Section;
  onCreate: () => void;
  onSectionChange: (section: Section) => void;
}) {
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const nav = [
    { id: "dashboard" as const, label: "Dashboard", icon: LayoutDashboard },
    { id: "payments" as const, label: "Payments", icon: CircleDollarSign },
    { id: "links" as const, label: "Links", icon: Link2 },
    { id: "wallets" as const, label: "Wallets", icon: WalletCards }
  ];
  const moreItems = [
    { id: "integrations" as const, label: "Integrations", icon: Webhook },
    { id: "api" as const, label: "API keys", icon: KeyRound },
    { id: "settings" as const, label: "Settings", icon: Settings }
  ];
  const isMoreSection = moreItems.some((item) => item.id === section);

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
          </div>
          <strong>NBCbridge</strong>
          <span>DEX</span>
        </div>
        <nav aria-label="Merchant navigation">
          {nav.map((item) => (
            <button
              className={section === item.id ? "active" : ""}
              key={item.label}
              onClick={() => {
                onSectionChange(item.id);
                setIsMoreOpen(false);
              }}
              type="button"
            >
              <item.icon aria-hidden="true" size={16} strokeWidth={2.1} />
              <span>{item.label}</span>
            </button>
          ))}
          <div className="more-nav">
            <button
              aria-expanded={isMoreOpen}
              className={isMoreOpen || isMoreSection ? "active" : ""}
              onClick={() => setIsMoreOpen((open) => !open)}
              type="button"
            >
              <MoreHorizontal aria-hidden="true" size={16} strokeWidth={2.1} />
              <span>More</span>
            </button>
            {isMoreOpen ? (
              <div className="more-menu" role="menu">
                {moreItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => {
                      onSectionChange(item.id);
                      setIsMoreOpen(false);
                    }}
                    role="menuitem"
                    type="button"
                  >
                    <item.icon aria-hidden="true" size={16} strokeWidth={2.1} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </nav>
        <div className="topbar-actions">
          <span className={`workspace-state workspace-${mode}`}>{modeLabels[mode]}</span>
          <Button icon={Plus} onClick={onCreate} size="md">
            Create
          </Button>
        </div>
      </div>
    </header>
  );
}

function SetupPanel({ mode, onContinue }: { mode: MerchantMode; onContinue: () => void }) {
  const steps = setupStepsByMode[mode];
  return (
    <section className="panel setup-panel">
      <div className="section-heading">
        <div>
          <span>Setup guide</span>
          <h2>Start accepting direct payments</h2>
        </div>
      </div>
      <div className="step-grid">
        {steps.map((step, index) => (
          <article className={`step step-${step.status}`} key={step.title}>
            <div className="step-index">{index + 1}</div>
            <div className="step-icon">
              <step.icon aria-hidden="true" size={20} strokeWidth={2.2} />
            </div>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
            {step.status === "open" ? (
              <Button icon={ArrowRight} onClick={onContinue} size="md" className="step-cta">
                Continue
              </Button>
            ) : (
              <Button kind={step.status === "locked" ? "alternative" : "secondary"} size="sm" disabled={step.status === "locked"}>
                {step.status === "done" ? "Done" : "Locked"}
              </Button>
            )}
          </article>
        ))}
      </div>
      <Alert title="Wallet-first onboarding">
        The cabinet opens first. Wallet signature is the identity layer; company name is only a checkout display option.
      </Alert>
    </section>
  );
}

function OperatingMetrics({ mode }: { mode: MerchantMode }) {
  const metrics = [
    { label: "Today volume", value: mode === "attention" ? "370 USDT" : "1,250 USDT", delta: "+18% vs yesterday" },
    { label: "7 day volume", value: "8,420 USDT", delta: "+11% vs previous" },
    { label: "Active links", value: "4", delta: "2 used today" },
    { label: "Pending amount", value: mode === "attention" ? "195 USDT" : "0 USDT", delta: mode === "attention" ? "Needs action" : "Clear" }
  ];

  return (
    <section className="metrics-grid" aria-label="Operating metrics">
      {metrics.map((metric) => (
        <article className="metric-card" key={metric.label}>
          <span>{metric.label}</span>
          <strong>{metric.value}</strong>
          <small>{metric.delta}</small>
        </article>
      ))}
      <article className="chart-panel">
        <div className="section-heading compact">
          <div>
            <span>Volume</span>
            <h2>Direct payments trend</h2>
          </div>
          <button className="filter-button" type="button">
            7 days
            <ChevronDown size={14} aria-hidden="true" />
          </button>
        </div>
        <div className="chart-bars" aria-label="Mock direct payment volume chart">
          {[32, 58, 45, 66, 74, 52, mode === "attention" ? 88 : 80].map((height, index) => (
            <span key={index} style={{ height: `${height}%` }} />
          ))}
        </div>
      </article>
    </section>
  );
}

function AttentionPanel({ items, mode }: { items: AttentionItem[]; mode: MerchantMode }) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span>Operations</span>
          <h2>{mode === "new" ? "What happens next" : "Needs attention"}</h2>
        </div>
        <Button kind="secondary" size="sm" icon={ExternalLink}>
          View all
        </Button>
      </div>
      <div className="attention-list">
        {items.map((item) => (
          <div className="attention-item" key={item.title}>
            <StatusPill status={item.severity === "danger" ? "danger" : item.severity === "warning" ? "warning" : item.severity === "success" ? "success" : "info"} />
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function RecentPayments({
  rows,
  onCopy,
  onSelect
}: {
  rows: typeof payments;
  onCopy: (message: string) => void;
  onSelect: (payment: PaymentRow) => void;
}) {
  return (
    <section className="panel">
      <div className="section-heading">
        <div>
          <span>Transactions</span>
          <h2>Recent payments</h2>
        </div>
        <div className="filters">
          <button className="filter-button selected" type="button">Status</button>
          <button className="filter-button" type="button">Currency</button>
          <button className="filter-button" type="button">Date</button>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="empty-state">
          <BarChart3 size={32} aria-hidden="true" />
          <strong>No real payments yet</strong>
          <p>After the first checkout payment, this area becomes the operating transaction table.</p>
        </div>
      ) : (
        <div className="payment-table">
          <div className="payment-row header-row">
            <span>Product</span>
            <span>Network</span>
            <span>Wallets</span>
            <span>Status</span>
            <span>TX hash</span>
            <span>Date</span>
            <span>Amount</span>
            <span />
          </div>
          {rows.map((row) => (
            <div className="payment-row" key={`${row.product}-${row.date}`}>
              <strong>{row.product}</strong>
              <span>{row.network}</span>
              <span>{maskValue(row.payer)} <ArrowRight size={12} aria-hidden="true" /> {maskValue(row.receiver)}</span>
              <StatusPill status={row.status} />
              <span>{row.tx ? maskValue(row.tx) : "Waiting"}</span>
              <span>{row.date}</span>
              <strong>{row.amount}</strong>
              <button className="icon-action" onClick={() => onSelect(row)} type="button" aria-label={`Open ${row.product} details`}>
                <Info size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PaymentsScreen({
  rows,
  mode,
  onCopy,
  onCreate,
  onSelect
}: {
  rows: typeof payments;
  mode: MerchantMode;
  onCopy: (message: string) => void;
  onCreate: () => void;
  onSelect: (payment: PaymentRow) => void;
}) {
  return (
    <section className="full-screen-grid">
      <div className="main-column">
        <RecentPayments rows={rows} onCopy={onCopy} onSelect={onSelect} />
      </div>
      <aside className="side-column single">
        <section className="panel side-panel">
          <div className="section-heading compact">
            <div>
              <span>Payment workbench</span>
              <h2>Fast filters</h2>
            </div>
          </div>
          <div className="filter-stack">
            <button className="filter-button selected" type="button">Status</button>
            <button className="filter-button" type="button">Currency</button>
            <button className="filter-button" type="button">Date</button>
            <button className="filter-button" type="button">Links</button>
          </div>
          <Alert title="Operational intent">
            This screen answers whether money arrived, what is pending, and which payments require manual review.
          </Alert>
        </section>
        <CreatePanel mode={mode} onCreate={onCreate} />
      </aside>
    </section>
  );
}

function TransactionModal({
  onCopy,
  payment,
  onClose
}: {
  onCopy: (message: string) => void;
  payment: PaymentRow | null;
  onClose: () => void;
}) {
  if (!payment) {
    return null;
  }

  return (
    <div className="modal-overlay" role="presentation">
      <section aria-modal="true" className="transaction-modal" role="dialog" aria-labelledby="transaction-modal-title">
        <header className="modal-header">
          <h2 id="transaction-modal-title">Transaction information</h2>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close transaction information">
            <span aria-hidden="true">x</span>
          </button>
        </header>

        <div className="detail-sections">
          <TransactionDetailSection
            onCopy={onCopy}
            title="Seller information"
            rows={[
              ["Product", payment.product],
              ["Transaction type", "Payment"],
              ["Status", payment.status],
              ["Receiver wallet", payment.receiver, "wallet"],
              ["Network", payment.network],
              ["Amount", payment.amount]
            ]}
          />
          <TransactionDetailSection
            onCopy={onCopy}
            title="Payer information"
            rows={[
              ["Payer wallet", payment.payer, "wallet"],
              ["TX hash", payment.tx || "Waiting for transfer", payment.tx ? "tx" : undefined],
              ["Date and time", payment.date],
              ["Amount", payment.amount]
            ]}
          />
        </div>
      </section>
    </div>
  );
}

function TransactionDetailSection({
  onCopy,
  title,
  rows
}: {
  onCopy: (message: string) => void;
  title: string;
  rows: [string, string, ("wallet" | "tx")?][];
}) {
  return (
    <section className="detail-section">
      <h3>{title}</h3>
      <div className="detail-row-list">
        {rows.map(([label, value, kind]) => (
          <div className="detail-row" key={`${title}-${label}`}>
            <span>{label}</span>
            <i aria-hidden="true" />
            {kind ? (
              <span className="detail-value with-copy" title={value}>
                <a href="#" onClick={(event) => event.preventDefault()}>
                  {maskValue(value)}
                </a>
                <button className="copy-mini" onClick={() => onCopy("Copied")} type="button" aria-label={`Copy ${label}`}>
                  <Copy size={14} aria-hidden="true" />
                </button>
              </span>
            ) : (
              <strong className="detail-value">{value}</strong>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

function LinksScreen({ mode, onCreate }: { mode: MerchantMode; onCreate: () => void }) {
  const disabled = mode === "new";
  const linkRows = mode === "new" ? [] : [
    { name: "Storefront USDT", network: "Polygon", amount: "250 USDT", wallet: "0x79c2f064d44c2cbef42a", status: "active" },
    { name: "Event pass", network: "Polygon", amount: "75 USDT", wallet: "0x91d5a7f6ea8064d11d29", status: mode === "attention" ? "review" : "active" },
    { name: "Open amount checkout", network: "Polygon", amount: "Flexible", wallet: "0x79c2f064d44c2cbef42a", status: "active" }
  ];

  return (
    <section className="full-screen-grid">
      <div className="main-column">
        <section className="panel setup-panel">
          <div className="section-heading">
            <div>
              <span>Payment links</span>
              <h2>Create checkout without a business registration gate</h2>
            </div>
            <Button icon={Plus} disabled={disabled} onClick={onCreate}>
              New link
            </Button>
          </div>
          {disabled ? (
            <div className="empty-state">
              <Link2 size={32} aria-hidden="true" />
              <strong>Connect wallet before creating links</strong>
              <p>The link form opens after the access wallet signs the workspace message.</p>
            </div>
          ) : (
            <div className="link-list">
              {linkRows.map((link) => (
                <div className="link-row" key={link.name}>
                  <div>
                    <strong>{link.name}</strong>
                    <span>{link.network} / {link.amount}</span>
                  </div>
                  <code>{maskValue(link.wallet)}</code>
                  <StatusPill status={link.status === "review" ? "review" : "active"} />
                  <Button kind="secondary" size="sm">Open</Button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      <aside className="side-column single">
        <section className="panel side-panel">
          <div className="section-heading compact">
            <div>
              <span>Optional display</span>
              <h2>Customer trust</h2>
            </div>
            <ShieldCheck size={22} aria-hidden="true" />
          </div>
          <FieldPreview label="Company name" value="Optional" />
          <FieldPreview label="Receipt contact" value="Optional" />
          <p className="side-note">These fields improve checkout clarity but never block direct payment creation.</p>
        </section>
        <WalletPanel mode={mode} onAddWallet={() => onCreate()} />
      </aside>
    </section>
  );
}

function WalletsScreen({
  mode,
  onAddWallet,
  onConnect
}: {
  mode: MerchantMode;
  onAddWallet: () => void;
  onConnect: () => void;
}) {
  const rows = mode === "new" ? [] : walletRows;
  return (
    <section className="full-screen-grid">
      <div className="main-column">
        <section className="panel setup-panel">
          <div className="section-heading">
            <div>
              <span>Wallet roles</span>
              <h2>Access and receiving wallets</h2>
            </div>
            <Button icon={Plus} kind={mode === "new" ? "alternative" : "primary"} onClick={onAddWallet}>
              Add receiving wallet
            </Button>
          </div>
          <div className="wallet-role-grid">
            <article className="wallet-role-card primary-role">
              <span>Access wallet</span>
              <h3>{mode === "new" ? "Not connected" : "0x79c2...42aa"}</h3>
              <p>This wallet signs in and controls workspace access. It does not have to be the same address that receives payments.</p>
              <Button icon={WalletCards} onClick={onConnect} size="md">
                {mode === "new" ? "Connect wallet" : "Connected"}
              </Button>
            </article>
            <article className="wallet-role-card">
              <span>Default receiving wallet</span>
              <h3>{mode === "new" ? "Missing" : "Polygon USDT / 0x79c2...42aa"}</h3>
              <p>New payment links use the verified default wallet for the selected network and currency.</p>
              <Button kind="alternative" size="md" disabled={mode === "new"}>
                Set default
              </Button>
            </article>
          </div>
          <div className="wallet-directory">
            <div className="payment-row header-row wallet-directory-row">
              <span>Role</span>
              <span>Network</span>
              <span>Address</span>
              <span>Status</span>
              <span />
            </div>
            {rows.length === 0 ? (
              <div className="empty-state">
                <WalletCards size={32} aria-hidden="true" />
                <strong>No wallets yet</strong>
                <p>The first signature creates the access wallet. Add a receiving wallet before creating live payment links.</p>
              </div>
            ) : (
              rows.map((wallet) => (
                <div className="payment-row wallet-directory-row" key={`${wallet.role}-${wallet.address}`}>
                  <strong>{wallet.role}</strong>
                  <span>{wallet.network}</span>
                  <span>{maskValue(wallet.address)}</span>
                  <StatusPill status={wallet.status === "pending" ? "pending" : wallet.status === "verified" ? "verified" : "active"} />
                  <Button kind="secondary" size="sm">{wallet.status === "pending" ? "Verify" : "Manage"}</Button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
      <aside className="side-column single">
        <section className="panel side-panel">
          <div className="section-heading compact">
            <div>
              <span>Wallet rule</span>
              <h2>Roles are explicit</h2>
            </div>
          </div>
          <Alert title="Same wallet is allowed">
            A single address can be both access wallet and receiving wallet, but the UI must say which roles it has.
          </Alert>
          <Alert tone="danger" title="Network safety">
            Receiving wallets are network-specific. Wrong network deposits are treated as high-risk irreversible errors.
          </Alert>
        </section>
        <CustomerIdentityPanel />
      </aside>
    </section>
  );
}

function SecondaryScreen({ kind }: { kind: "integrations" | "api" | "settings" }) {
  const content = {
    integrations: {
      eyebrow: "Integrations",
      title: "Connect stores and webhooks after direct payments are ready",
      body: "CMS plugins, webhook destinations and hosted checkout snippets live here. They stay out of the first-run path.",
      cards: [
        ["Webhook endpoint", "Optional delivery URL for payment events."],
        ["WooCommerce plugin", "Install path for merchants who want CMS checkout."],
        ["Hosted checkout", "Snippet and pay URL configuration."]
      ]
    },
    api: {
      eyebrow: "API keys",
      title: "API access is powerful, but not required for the first payment",
      body: "Keys are created after the merchant understands direct links. Usage metadata should show last path, method and status.",
      cards: [
        ["Live key", "gw_live_12...89ab / last used 18 Jun"],
        ["Test key", "gw_test_45...02ef / not used"],
        ["Idempotency", "Document key behavior near invoice creation."]
      ]
    },
    settings: {
      eyebrow: "Settings",
      title: "Preferences and customer-facing display details",
      body: "Keep settings quiet. Business fields remain optional checkout presentation, not mandatory onboarding.",
      cards: [
        ["Language", "English / Russian"],
        ["Checkout display", "Company name, logo, support contact."],
        ["Notifications", "Operational alerts and billing notices."]
      ]
    }
  }[kind];

  return (
    <section className="panel setup-panel">
      <div className="section-heading">
        <div>
          <span>{content.eyebrow}</span>
          <h2>{content.title}</h2>
        </div>
      </div>
      <p className="screen-intro">{content.body}</p>
      <div className="secondary-card-grid">
        {content.cards.map(([title, body]) => (
          <article className="secondary-card" key={title}>
            <strong>{title}</strong>
            <p>{body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function ActionModalView({ kind, mode, onClose }: { kind: ActionModal; mode: MerchantMode; onClose: () => void }) {
  if (!kind) {
    return null;
  }

  const isCreate = kind === "create";
  const isConnect = kind === "connect-wallet";
  const title = isCreate ? "Create" : isConnect ? "Connect access wallet" : "Add receiving wallet";
  const description = isCreate
    ? "Choose the next merchant action. Payment creation is guarded until a wallet is connected."
    : isConnect
      ? "Sign a message to enter the workspace. This does not transfer funds or grant spending permission."
      : "Receiving wallets are network-specific and require explicit verification before live payment routing.";

  return (
    <div className="modal-overlay" role="presentation">
      <section aria-modal="true" className="action-modal" role="dialog" aria-labelledby="action-modal-title">
        <header className="modal-header">
          <h2 id="action-modal-title">{title}</h2>
          <button className="modal-close" onClick={onClose} type="button" aria-label={`Close ${title}`}>
            <span aria-hidden="true">x</span>
          </button>
        </header>
        <p className="modal-copy">{description}</p>

        {isCreate ? (
          <div className="action-grid">
            <button className="action-card" disabled={mode === "new"} type="button">
              <Link2 size={20} aria-hidden="true" />
              <strong>Payment link</strong>
              <span>Fixed or flexible hosted checkout link.</span>
            </button>
            <button className="action-card" disabled={mode === "new"} type="button">
              <FileText size={20} aria-hidden="true" />
              <strong>Invoice</strong>
              <span>One-off payment request with amount and expiry.</span>
            </button>
            <button className="action-card" type="button">
              <WalletCards size={20} aria-hidden="true" />
              <strong>Receiving wallet</strong>
              <span>Add a network-specific destination address.</span>
            </button>
          </div>
        ) : (
          <div className="action-form">
            <FieldPreview label={isConnect ? "Signature type" : "Network"} value={isConnect ? "Access only" : "Polygon"} />
            <FieldPreview label={isConnect ? "Permission" : "Asset"} value={isConnect ? "No spending" : "USDT"} />
            <Alert tone={isConnect ? "info" : "danger"} title={isConnect ? "Non-custodial access" : "Network safety"}>
              {isConnect
                ? "The wallet signs a message to prove ownership. Funds stay in the merchant wallet."
                : "Send only the selected asset on the selected network to this address."}
            </Alert>
          </div>
        )}

        <div className="modal-actions">
          <Button kind="secondary" onClick={onClose} size="md">
            Cancel
          </Button>
          <Button onClick={onClose} size="md">
            {isCreate ? "Continue" : isConnect ? "Sign message" : "Start verification"}
          </Button>
        </div>
      </section>
    </div>
  );
}

function CopyToast({ message, onDone }: { message: string; onDone: () => void }) {
  return (
    <button className="copy-toast" onAnimationEnd={onDone} type="button">
      {message}
    </button>
  );
}

function CreatePanel({ mode, onCreate }: { mode: MerchantMode; onCreate: () => void }) {
  const disabled = mode === "new";
  return (
    <section className="panel side-panel">
      <div className="section-heading compact">
        <div>
          <span>Primary action</span>
          <h2>Create</h2>
        </div>
      </div>
      <div className="create-list">
        {createOptions.map((option) => (
          <button className="create-option" disabled={disabled && option.label !== "Receiving wallet"} key={option.label} onClick={onCreate} type="button">
            <option.icon size={18} aria-hidden="true" />
            <span>{option.label}</span>
            <ArrowRight size={16} aria-hidden="true" />
          </button>
        ))}
      </div>
      {disabled ? (
        <Alert tone="warning" title="Connect wallet first">
          Payment links are guarded until a wallet signs the workspace access message.
        </Alert>
      ) : null}
    </section>
  );
}

function WalletPanel({ mode, onAddWallet }: { mode: MerchantMode; onAddWallet: () => void }) {
  const rows = mode === "new" ? walletRows.slice(0, 0) : walletRows;
  return (
    <section className="panel side-panel">
      <div className="section-heading compact">
        <div>
          <span>Wallet roles</span>
          <h2>Wallets</h2>
        </div>
        <Button kind="secondary" onClick={onAddWallet} size="sm">
          Manage
        </Button>
      </div>
      {rows.length === 0 ? (
        <div className="wallet-empty">
          <WalletCards size={28} aria-hidden="true" />
          <strong>No wallet connected</strong>
          <p>The first signature creates an access wallet. Receiving wallets can be added later.</p>
        </div>
      ) : (
        <div className="wallet-list">
          {rows.map((wallet) => (
            <div className="wallet-row" key={`${wallet.role}-${wallet.address}`}>
              <div>
                <strong>{wallet.role}</strong>
                <span>{wallet.network}</span>
              </div>
              <div>
                <code>{maskValue(wallet.address)}</code>
                <StatusPill status={wallet.status === "pending" ? "pending" : wallet.status === "verified" ? "verified" : "active"} />
              </div>
            </div>
          ))}
        </div>
      )}
      <Alert tone="danger" title="Network safety">
        Send only USDT on Polygon to a Polygon receiving wallet. Other assets or networks can be lost.
      </Alert>
    </section>
  );
}

function CustomerIdentityPanel() {
  return (
    <section className="panel side-panel">
      <div className="section-heading compact">
        <div>
          <span>Optional</span>
          <h2>Checkout display</h2>
        </div>
        <ShieldCheck size={22} aria-hidden="true" />
      </div>
      <FieldPreview label="Company name" value="Optional" />
      <FieldPreview label="Shown on" value="Checkout and receipt" />
      <p className="side-note">This is not a registration requirement. It only improves customer trust on payment pages.</p>
    </section>
  );
}
