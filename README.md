# Virasat (विरासत)

**Leave your family a map, not a mystery.**

Virasat helps Indian families list what they own and owe in one place: bank accounts, FDs, LIC and other insurance, employer benefits, mutual funds, demat accounts, EPF/NPS, property, loans, credit cards, digital accounts and key contacts. The list can be exported as an Excel file or a readable PDF that the family can open when they need it.

Official home: **[gauravkhurana.com/virasat](https://gauravkhurana.com/virasat)**, by [gauravkhurana.com](https://gauravkhurana.com).

## Privacy model

- **No server, no account, no storage.** Everything lives in the page's memory and is gone when the tab closes.
- **Can't send data.** The deployable page ships with a Content Security Policy (`connect-src 'none'`, `form-action 'none'`, `default-src 'none'`) that blocks all outgoing requests. Only Google Fonts stylesheets and font files are allowed.
- **Works offline.** Once loaded, the page works with the internet switched off, including Excel and PDF export.
- **No secrets.** The app warns when someone types something that looks like a password, PIN, OTP, Aadhaar number or full card/account number, and asks for the last 4 digits only.

## Features

- About 27 categories, grouped by Banking, Insurance, From your employer, Investments, Retirement, Property & valuables, Loans & cards, Business & digital, and Will, papers & contacts
- A simple 3-step flow: pick what you have, fill in details (at your own pace), save the file
- Nominee section on every account and policy: up to four nominees with relationship, date of birth and share %, a check that shares total 100%, and an Overview warning for entries with no nominee
- "Last updated" date stamped on every entry
- Save progress: saves the Excel file (and on desktop Chrome/Edge, keeps updating the same file); import it later to carry on
- One person or a whole family (a "Belongs to" column)
- Shared details set once: documents folder link, where the original papers are kept, mobile numbers and emails linked to accounts
- Upcoming dates: premiums, renewals, EMIs, SIPs and maturities in date order, with recurring dates rolled forward, Google Calendar links and an `.ics` export
- Export to Excel (one sheet per category, filters, dropdowns, Summary, Upcoming, "Read me first") and import the same file back to update it
- Export to PDF (summary, upcoming dates, every record as one block, optional password)
- Import CSV or Excel exports from brokers and fund apps into mutual funds, holdings, demat, bank, FD and bond categories, with automatic column matching
- "Report a bug or idea": composes a GitHub issue (bug, idea or content correction) with browser details filled in; screenshots up to 10 MB are attached on GitHub, and GitHub sign-in keeps out spam
- "Support Virasat": UPI QR code and ID for voluntary contributions
- Help built in: "Where to find these details", "Add or update the nominee", per-field "Where do I find this?", a glossary and a "Find my details" page (AIS, CAS, credit report, EPFO, DigiLocker, UDGAM)

## Project layout

```
src/virasat.src.html   The app: HTML, CSS and JavaScript in one file
build.js               Builds the outputs below
dist/site/index.html   The deployable page (libraries inlined, strict CSP). Upload this.
tests/e2e.js           Playwright end-to-end test
```

## Build and test

```bash
npm install
npm run build      # writes dist/site/index.html
npm test           # builds, then runs the end-to-end test
```

The test loads the deployable page, fills sample data, checks the safety warnings and the unsaved-changes banner, imports broker-style CSVs, exports Excel, PDF (with and without a password) and `.ics`, re-imports the Excel and compares every field, checks the phone layout for sideways scrolling, and fails on console errors or any outgoing request.

## Deploy

Every push to `main` runs `.github/workflows/deploy.yml`:

1. Installs dependencies and builds `dist/site/index.html`.
2. Runs the end-to-end test. If any check fails, nothing is deployed.
3. Publishes `dist/site` to GitHub Pages.

Because `gauravkhurana.com` is the custom domain of the user site (`gauravkhuraana.github.io`), this project site is served at **https://gauravkhurana.com/virasat/** with no extra DNS setup. You can also run the workflow by hand from the Actions tab ("Run workflow").

One-time setup: **Settings > Pages > Build and deployment > Source: GitHub Actions.**

Keep analytics and tracking scripts off this page, or the "only you can see what you type" promise is no longer true.

## Content status

The "How your family claims this" notes are drafts and need checking with each institution before launch. Nominee rules reflect the Banking Laws (Amendment) Act 2025 (up to four nominees for bank accounts, FDs and lockers from 1 November 2025).

## Licence

Copyright (c) 2026 Gaurav Khurana. All rights reserved. The code is public so anyone can check that nothing leaves the browser, but no licence to reuse, copy or redistribute it has been granted yet. The name Virasat and the gauravkhurana.com branding are not covered by any future code licence.
