"use client";

import { useEffect, useMemo, useState } from "react";
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
type Language = "en" | "ru";

const textOriginals = new WeakMap<Text, string>();
const attrOriginals = new WeakMap<Element, Record<string, string>>();

const ruDictionary: Record<string, string> = {
  "Dashboard": "Дашборд",
  "Payments": "Платежи",
  "Links": "Ссылки",
  "Wallets": "Кошельки",
  "More": "Еще",
  "Integrations": "Интеграции",
  "API keys": "API-ключи",
  "Settings": "Настройки",
  "Create": "Создать",
  "New": "Новый",
  "Ready": "Готов",
  "Active": "Активен",
  "Attention": "Внимание",
  "Merchant dashboard logic prototype": "Прототип логики кабинета мерчанта",
  "Your merchant workspace is ready. Turn on payment acceptance in 3 steps.": "Ваш кабинет мерчанта готов. Включите прием платежей за 3 шага.",
  "Wallets are ready. Create the first payment method and share checkout.": "Кошельки готовы. Создайте первый платежный метод и отправьте checkout.",
  "Payments are live. Two operational items need a decision.": "Платежи работают. Два операционных вопроса требуют решения.",
  "Payments are live. Track money movement and create the next checkout quickly.": "Платежи работают. Отслеживайте движение средств и быстро создавайте новый checkout.",
  "Payments show what arrived, what is pending, and what needs review.": "Платежи показывают, что поступило, что ожидает и что требует проверки.",
  "Create and manage checkout links without turning setup into registration.": "Создавайте и управляйте checkout-ссылками без превращения настройки в регистрацию.",
  "Wallet roles are explicit: access wallet and receiving wallets are not the same thing.": "Роли кошельков явные: кошелек доступа и кошельки приема платежей - не одно и то же.",
  "Integrations stay secondary until the merchant is ready for API or plugin work.": "Интеграции остаются вторичными, пока мерчант не готов к API или плагинам.",
  "API keys are powerful, but they should not distract from the first direct payment.": "API-ключи важны, но не должны отвлекать от первого прямого платежа.",
  "Settings hold preferences and optional customer-facing display details.": "В настройках находятся предпочтения и опциональные данные, видимые клиенту.",
  "Prototype controls": "Контролы прототипа",
  "Merchant state: New": "Состояние мерчанта: Новый",
  "Merchant state: Ready": "Состояние мерчанта: Готов",
  "Merchant state: Active": "Состояние мерчанта: Активен",
  "Merchant state: Attention": "Состояние мерчанта: Внимание",
  "This switcher is only for reviewing dashboard states before backend state is connected.": "Этот переключатель нужен только для просмотра состояний кабинета до подключения backend-состояния.",
  "Setup guide": "Гайд настройки",
  "Start accepting direct payments": "Начните принимать прямые платежи",
  "Connect access wallet": "Подключите кошелек доступа",
  "Use a signature to enter the workspace. No business profile is required.": "Подпишите сообщение, чтобы войти в кабинет. Бизнес-профиль не требуется.",
  "Create payment link": "Создайте платежную ссылку",
  "Choose network, currency and fixed amount. Company name stays optional.": "Выберите сеть, валюту и фиксированную сумму. Название компании остается опциональным.",
  "Share and receive": "Отправьте и примите платеж",
  "Copy a hosted checkout link or QR after the payment method is created.": "Скопируйте hosted checkout ссылку или QR после создания платежного метода.",
  "Continue": "Продолжить",
  "Done": "Готово",
  "Locked": "Заблокировано",
  "Wallet-first onboarding": "Онбординг через кошелек",
  "The cabinet opens first. Wallet signature is the identity layer; company name is only a checkout display option.": "Сначала открывается кабинет. Подпись кошельком - слой идентификации; название компании только опция отображения в checkout.",
  "Access wallet connected": "Кошелек доступа подключен",
  "0x79c2...42aa is the workspace access key.": "0x79c2...42aa - ключ доступа к кабинету.",
  "Create first payment link": "Создайте первую платежную ссылку",
  "A verified receiving wallet is ready for Polygon USDT.": "Проверенный кошелек приема готов для Polygon USDT.",
  "Receive first payment": "Получите первый платеж",
  "Payments will appear in recent activity after checkout is shared.": "Платежи появятся в недавней активности после отправки checkout.",
  "Workspace live": "Кабинет активен",
  "Wallet roles are configured and payment methods are active.": "Роли кошельков настроены, платежные методы активны.",
  "Links accepting payments": "Ссылки принимают платежи",
  "4 active links route payments to verified receiving wallets.": "4 активные ссылки направляют платежи на проверенные кошельки приема.",
  "Operations running": "Операции работают",
  "Monitor and webhooks are reporting without unresolved issues.": "Мониторинг и webhooks работают без нерешенных проблем.",
  "Payment acceptance is enabled, but two items require action.": "Прием платежей включен, но два пункта требуют действия.",
  "Resolve pending payment": "Разберите ожидающий платеж",
  "One invoice has been pending longer than expected.": "Один invoice ожидает дольше обычного.",
  "Review receiving wallet": "Проверьте кошелек приема",
  "A new wallet verification request expires in 24 minutes.": "Новый запрос проверки кошелька истекает через 24 минуты.",
  "Today volume": "Оборот сегодня",
  "7 day volume": "Оборот за 7 дней",
  "Active links": "Активные ссылки",
  "Pending amount": "Сумма в ожидании",
  "+18% vs yesterday": "+18% к вчерашнему дню",
  "+11% vs previous": "+11% к прошлому периоду",
  "2 used today": "2 использованы сегодня",
  "Needs action": "Требует действия",
  "Clear": "Чисто",
  "Volume": "Оборот",
  "Direct payments trend": "Динамика прямых платежей",
  "7 days": "7 дней",
  "Operations": "Операции",
  "What happens next": "Что дальше",
  "Needs attention": "Требует внимания",
  "View all": "Смотреть все",
  "Pending invoice is aging": "Invoice долго в ожидании",
  "Order 1042 has no detected transfer after 34 minutes.": "По заказу 1042 перевод не найден уже 34 минуты.",
  "Wallet verification expires soon": "Проверка кошелька скоро истечет",
  "Receiving wallet 0x91d5...1d29 needs a signature to stay usable.": "Кошельку приема 0x91d5...1d29 нужна подпись, чтобы остаться доступным.",
  "Webhook delivery recovered": "Доставка webhook восстановлена",
  "Last retry was delivered. Keep this item visible until the next clean event.": "Последняя повторная отправка доставлена. Оставьте пункт видимым до следующего чистого события.",
  "No action required": "Действия не требуются",
  "Open payments and wallet verifications are clear.": "Открытые платежи и проверки кошельков чистые.",
  "Transactions": "Транзакции",
  "Recent payments": "Недавние платежи",
  "Status": "Статус",
  "Currency": "Валюта",
  "Date": "Дата",
  "Product": "Продукт",
  "Network": "Сеть",
  "TX hash": "TX hash",
  "Amount": "Сумма",
  "No real payments yet": "Реальных платежей пока нет",
  "After the first checkout payment, this area becomes the operating transaction table.": "После первого checkout-платежа этот блок станет рабочей таблицей транзакций.",
  "Waiting": "Ожидание",
  "Payment workbench": "Рабочая зона платежей",
  "Fast filters": "Быстрые фильтры",
  "Operational intent": "Операционный смысл",
  "This screen answers whether money arrived, what is pending, and which payments require manual review.": "Этот экран отвечает, поступили ли деньги, что ожидает и какие платежи требуют ручной проверки.",
  "Transaction information": "Информация о транзакции",
  "Seller information": "Информация продавца",
  "Payer information": "Информация плательщика",
  "Transaction type": "Тип транзакции",
  "Payment": "Платеж",
  "Receiver wallet": "Кошелек получателя",
  "Payer wallet": "Кошелек плательщика",
  "Waiting for transfer": "Ожидаем перевод",
  "Date and time": "Дата и время",
  "Copied": "Скопировано",
  "Payment links": "Платежные ссылки",
  "Create checkout without a business registration gate": "Создавайте checkout без обязательной бизнес-регистрации",
  "New link": "Новая ссылка",
  "Connect wallet before creating links": "Подключите кошелек перед созданием ссылок",
  "The link form opens after the access wallet signs the workspace message.": "Форма ссылки откроется после подписи сообщения кошельком доступа.",
  "Open": "Открыть",
  "Optional display": "Опциональное отображение",
  "Customer trust": "Доверие клиента",
  "Company name": "Название компании",
  "Receipt contact": "Контакт для чека",
  "Optional": "Опционально",
  "These fields improve checkout clarity but never block direct payment creation.": "Эти поля делают checkout понятнее, но никогда не блокируют создание прямого платежа.",
  "Wallet roles": "Роли кошельков",
  "Access and receiving wallets": "Кошелек доступа и кошельки приема",
  "Add receiving wallet": "Добавить кошелек приема",
  "Access wallet": "Кошелек доступа",
  "Not connected": "Не подключен",
  "This wallet signs in and controls workspace access. It does not have to be the same address that receives payments.": "Этот кошелек входит в кабинет и управляет доступом. Он не обязан совпадать с адресом приема платежей.",
  "Connect wallet": "Подключить кошелек",
  "Connected": "Подключен",
  "Default receiving wallet": "Кошелек приема по умолчанию",
  "Missing": "Не задан",
  "New payment links use the verified default wallet for the selected network and currency.": "Новые платежные ссылки используют проверенный кошелек по умолчанию для выбранной сети и валюты.",
  "Set default": "Сделать основным",
  "Role": "Роль",
  "Address": "Адрес",
  "No wallets yet": "Кошельков пока нет",
  "The first signature creates the access wallet. Add a receiving wallet before creating live payment links.": "Первая подпись создает кошелек доступа. Добавьте кошелек приема перед созданием live-ссылок.",
  "Verify": "Проверить",
  "Manage": "Управлять",
  "Wallet rule": "Правило кошельков",
  "Roles are explicit": "Роли явные",
  "Same wallet is allowed": "Один кошелек допустим",
  "A single address can be both access wallet and receiving wallet, but the UI must say which roles it has.": "Один адрес может быть и кошельком доступа, и кошельком приема, но UI должен явно показывать его роли.",
  "Network safety": "Безопасность сети",
  "Receiving wallets are network-specific. Wrong network deposits are treated as high-risk irreversible errors.": "Кошельки приема привязаны к сети. Депозиты в неверной сети считаются высокорисковыми необратимыми ошибками.",
  "Connect stores and webhooks after direct payments are ready": "Подключайте магазины и webhooks после готовности прямых платежей",
  "CMS plugins, webhook destinations and hosted checkout snippets live here. They stay out of the first-run path.": "CMS-плагины, webhook-адреса и hosted checkout snippets находятся здесь. Они не мешают первому запуску.",
  "Webhook endpoint": "Webhook endpoint",
  "Optional delivery URL for payment events.": "Опциональный URL доставки событий платежей.",
  "WooCommerce plugin": "Плагин WooCommerce",
  "Install path for merchants who want CMS checkout.": "Путь установки для мерчантов, которым нужен CMS checkout.",
  "Hosted checkout": "Hosted checkout",
  "Snippet and pay URL configuration.": "Настройки snippet и pay URL.",
  "API access is powerful, but not required for the first payment": "API-доступ мощный, но не нужен для первого платежа",
  "Keys are created after the merchant understands direct links. Usage metadata should show last path, method and status.": "Ключи создаются после того, как мерчант понял прямые ссылки. Метаданные использования должны показывать последний path, method и status.",
  "Live key": "Live key",
  "Test key": "Test key",
  "not used": "не использовался",
  "Idempotency": "Идемпотентность",
  "Document key behavior near invoice creation.": "Опишите поведение ключей рядом с созданием invoice.",
  "Preferences and customer-facing display details": "Предпочтения и данные, видимые клиенту",
  "Keep settings quiet. Business fields remain optional checkout presentation, not mandatory onboarding.": "Настройки должны быть спокойными. Бизнес-поля остаются опцией отображения в checkout, а не обязательным онбордингом.",
  "Language": "Язык",
  "English / Russian": "Английский / русский",
  "Checkout display": "Отображение checkout",
  "Company name, logo, support contact.": "Название компании, логотип, контакт поддержки.",
  "Notifications": "Уведомления",
  "Operational alerts and billing notices.": "Операционные алерты и billing-уведомления.",
  "Choose the next merchant action. Payment creation is guarded until a wallet is connected.": "Выберите следующее действие мерчанта. Создание платежей закрыто, пока кошелек не подключен.",
  "Sign a message to enter the workspace. This does not transfer funds or grant spending permission.": "Подпишите сообщение для входа в кабинет. Это не переводит средства и не дает разрешение на списание.",
  "Receiving wallets are network-specific and require explicit verification before live payment routing.": "Кошельки приема привязаны к сети и требуют явной проверки перед live-маршрутизацией платежей.",
  "Payment link": "Платежная ссылка",
  "Fixed or flexible hosted checkout link.": "Hosted checkout ссылка с фиксированной или гибкой суммой.",
  "Invoice": "Invoice",
  "One-off payment request with amount and expiry.": "Разовый платежный запрос с суммой и сроком.",
  "Receiving wallet": "Кошелек приема",
  "Add a network-specific destination address.": "Добавьте адрес назначения для конкретной сети.",
  "Signature type": "Тип подписи",
  "Access only": "Только доступ",
  "Permission": "Разрешение",
  "No spending": "Без списания",
  "Asset": "Актив",
  "Non-custodial access": "Non-custodial доступ",
  "The wallet signs a message to prove ownership. Funds stay in the merchant wallet.": "Кошелек подписывает сообщение для подтверждения владения. Средства остаются в кошельке мерчанта.",
  "Send only the selected asset on the selected network to this address.": "Отправляйте на этот адрес только выбранный актив в выбранной сети.",
  "Cancel": "Отмена",
  "Sign message": "Подписать сообщение",
  "Start verification": "Начать проверку",
  "Primary action": "Основное действие",
  "Connect wallet first": "Сначала подключите кошелек",
  "Payment links are guarded until a wallet signs the workspace access message.": "Платежные ссылки закрыты, пока кошелек не подпишет сообщение доступа к кабинету.",
  "No wallet connected": "Кошелек не подключен",
  "The first signature creates an access wallet. Receiving wallets can be added later.": "Первая подпись создает кошелек доступа. Кошельки приема можно добавить позже.",
  "Send only USDT on Polygon to a Polygon receiving wallet. Other assets or networks can be lost.": "Отправляйте только USDT в Polygon на Polygon-кошелек приема. Другие активы или сети могут быть потеряны.",
  "Shown on": "Показывается в",
  "Checkout and receipt": "Checkout и чек",
  "This is not a registration requirement. It only improves customer trust on payment pages.": "Это не требование регистрации. Это только повышает доверие клиента на платежных страницах.",
  "Confirmed": "Подтвержден",
  "Pending": "Ожидает",
  "Expired": "Истек",
  "Review": "Проверка",
  "Verified": "Проверен",
  "Warning": "Предупреждение",
  "Action": "Действие",
  "Info": "Инфо",
  "Secondary receiving wallet": "Дополнительный кошелек приема",
  "Ethereum signature": "Подпись Ethereum",
  "Flexible": "Гибкая сумма",
  "Open amount checkout": "Checkout с открытой суммой"
};

function applyLanguage(root: HTMLElement | null, language: Language) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode() as Text | null;

  while (textNode) {
    let original = textOriginals.get(textNode) ?? textNode.nodeValue ?? "";
    const current = textNode.nodeValue ?? "";
    const translatedOriginal = ruDictionary[original.trim()]
      ? original.replace(original.trim(), ruDictionary[original.trim()])
      : original;
    if (current !== original && current !== translatedOriginal) {
      original = current;
      textOriginals.set(textNode, original);
    }
    if (!textOriginals.has(textNode)) {
      textOriginals.set(textNode, original);
    }
    const trimmed = original.trim();
    if (trimmed) {
      textNode.nodeValue = language === "ru" && ruDictionary[trimmed]
        ? original.replace(trimmed, ruDictionary[trimmed])
        : original;
    }
    textNode = walker.nextNode() as Text | null;
  }

  root.querySelectorAll<HTMLElement>("*").forEach((element) => {
    const originals = attrOriginals.get(element) ?? {};
    ["aria-label", "title"].forEach((attr) => {
      const current = element.getAttribute(attr);
      if (!current) return;
      const translatedOriginal = originals[attr] && ruDictionary[originals[attr]] ? ruDictionary[originals[attr]] : originals[attr];
      if (!originals[attr] || (current !== originals[attr] && current !== translatedOriginal)) {
        originals[attr] = current;
        attrOriginals.set(element, originals);
      }
      const original = originals[attr];
      element.setAttribute(attr, language === "ru" && ruDictionary[original] ? ruDictionary[original] : original);
    });
  });
}

export default function MerchantDashboardPrototype() {
  const [mode, setMode] = useState<MerchantMode>("new");
  const [section, setSection] = useState<Section>("dashboard");
  const [language, setLanguage] = useState<Language>("en");
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

  useEffect(() => {
    window.requestAnimationFrame(() => applyLanguage(document.querySelector(".app-shell"), language));
  }, [language, mode, section, selectedPayment, actionModal, copyToast]);

  return (
    <div className="app-shell">
      <Header
        language={language}
        mode={mode}
        onCreate={() => setActionModal("create")}
        onLanguageChange={setLanguage}
        onSectionChange={setSection}
        section={section}
      />
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
  language,
  mode,
  section,
  onCreate,
  onLanguageChange,
  onSectionChange
}: {
  language: Language;
  mode: MerchantMode;
  section: Section;
  onCreate: () => void;
  onLanguageChange: (language: Language) => void;
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
          <div className="language-switch" aria-label="Language">
            <button className={language === "en" ? "selected" : ""} onClick={() => onLanguageChange("en")} type="button">
              EN
            </button>
            <button className={language === "ru" ? "selected" : ""} onClick={() => onLanguageChange("ru")} type="button">
              RU
            </button>
          </div>
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
