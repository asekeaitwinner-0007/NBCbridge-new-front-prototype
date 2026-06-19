# NBCbridge Merchant Dashboard Prototype

Local Next.js prototype for the wallet-first merchant dashboard UX.

## Why This Exists

This project is intentionally isolated from `gateway/dashboard` while the dashboard logic and UI are being agreed.
It is stored under `.codex-local/`, which is excluded through `.git/info/exclude`, so it does not enter normal git status or commits.

## UX Principles Captured

- The user lands inside a real dashboard shell, not a registration wizard.
- New merchants see a 3-step path: connect access wallet, create payment link, receive payment.
- Business profile is optional and customer-facing only.
- Active merchants see operating blocks: metrics, attention items, recent payments, quick create.
- Wallet roles are explicit: access wallet and receiving wallets are separate concepts.
- Design system tokens from `C:\NBCgate clone\docs\Design system` are used as the baseline.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run build
```

Default local URL:

```text
http://localhost:4010
```
