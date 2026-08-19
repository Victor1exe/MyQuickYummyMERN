# CLAUDE.md

Guidance for Claude Code (and any other agent) working in this repository.

## What this is

**My Quick Yummy** — a MERN food-delivery app. Create React App storefront on
`:3000`, Express + Mongoose API on `:5000`, MongoDB behind it.

```
mernapp/
├── backend/        Express API
└── src/            React storefront + admin console
```

## Commands

| Task | Command |
|---|---|
| Install API deps | `cd mernapp/backend && npm install` |
| Install web deps | `cd mernapp && npm install` |
| Run API (watch) | `cd mernapp/backend && npm run dev` |
| Run storefront | `cd mernapp && npm start` |
| Seed database | `cd mernapp/backend && npm run seed` (add `-- --fresh` to wipe first) |
| Build storefront | `cd mernapp && npm run build` |
| Frontend tests | `cd mernapp && npm test` |
| End-to-end smoke test | `cd mernapp/backend && npm run smoke` (needs a reachable DB) |
| Full stack in Docker | `docker compose up --build` |
| Enable the secret hook | `git config core.hooksPath .githooks` (once per clone) |

After changing anything on the API or the checkout path, run `npm run smoke` —
it asserts the authorisation boundaries and the checkout arithmetic, which unit
tests here do not cover.

## Architecture

### Backend (`mernapp/backend/`)

| Folder | Contents |
|---|---|
| `config/` | `env.js` validates and exports every environment variable; `db.js` connects Mongoose |
| `middleware/` | `fetchUser` (customer JWT), `fetchAdmin` (admin JWT), `asyncHandler`, `errorHandler`, `rateLimit` (auth throttling) |
| `models/` | `User`, `Orders`, `Receipt`, `Partner`, `FoodItem`, `FoodCategory`, `Rider`, `Policy`, `Faq` |
| `routes/` | `Createuser` (auth), `DisplayData` (catalogue), `OrderData`, `PublicContent`, `AdminAuth`, `Admin`, `adminCrud` (factory) |
| `services/` | `checkout.js` (pricing, ETA, rider assignment), `receiptPdf.js` (PDF generator) |
| `seed/` | `seed.js` + JSON fixtures under `seed/data/` |

`FoodItem` and `FoodCategory` are mapped onto the pre-existing `food_items` and
`foodCategory` collections, so previously seeded documents keep working.

### Frontend (`mernapp/src/`)

| Folder | Contents |
|---|---|
| `services/api.js` | The only place that knows the API base URL and the auth headers |
| `hooks/useDarkMode.js` | Shared dark-mode state, synchronised across components by a window event |
| `data/` | Static home-page copy and deterministic testimonial fixtures |
| `components/home/` | One component per home-page band |
| `components/delivery/` | Order confirmation popup + live delivery tracker, and the context behind them |
| `screens/admin/` | Admin console; `AdminResource` renders every resource from `resourceConfig.js` |
| `styles/` | One `.css` file per screen/component |

## Conventions

### CSS — this matters

**Never use `<style jsx>`.** It is a Next.js feature; this is Create React App,
where it renders a plain global `<style>` tag with an unknown-prop warning. The
codebase was converted away from it. Put styles in `src/styles/<name>.css` and
`import` them from the component.

Design tokens live in `src/styles/tokens.css` on `:root` (light) and `.dark`.
If a screen needs different tokens, **scope them to that screen's container**
(see `login.css`, `signup.css`, `myorder.css`) — never redeclare `:root`, which
leaks the override into every other page for the rest of the session.

The visual language is fixed: `#fc8019 → #f55d2c` gradient, 12–16 px radii,
`var(--shadow)`, a `translateY(-5px)` hover lift, and the
`'SF Pro Display', -apple-system, …` stack. The admin console deliberately uses
the same one. Match it rather than inventing a second style.

### API calls

Always go through `src/services/api.js` (`apiGet` / `apiPost` / `apiPut` /
`apiDelete`). Never write `fetch('http://localhost:5000/...')` in a component.
Pass `{ auth: 'user' }` or `{ auth: 'admin' }` to attach the right token.

### Authentication

- Customer tokens are signed with `JWT_SECRET`, sent as the `auth-token` header.
- Admin tokens are signed with a **different** secret, `ADMIN_JWT_SECRET`, sent
  as `admin-token`. Keeping them separate is what stops a customer token being
  replayed against an admin route.
- **A protected route must read identity from `req.user` / `req.admin`, never
  from `req.body`.** The original `/api/orderData` trusted an email in the body,
  which let any caller read or write anyone's order history.

### Secrets

Everything sensitive comes from `backend/.env` via `config/env.js`. Never
hardcode a connection string, a JWT secret or a password — both previously were,
and both are in this repo's git history and on its public remote.

A `pre-commit` hook enforces this (`git config core.hooksPath .githooks` to
enable). If it blocks you, the fix is to read the value from `process.env` and
document the variable name in `.env.example` — not `--no-verify`.

Never paste a leaked value into a file to search for it — **not even a prefix**.
A partial copy is still a leak, and the hook matches leaked values by prefix for
exactly that reason. `scripts/purge-secrets-from-history.sh` had this bug: it
carried the JWT secret's prefix three times so it could grep the history. It now
reads the values from a git-ignored `scripts/secrets-to-purge.txt`; keep it that
way.

Do not "fix" a leaked credential by rewriting history alone; a value that has
been public must be rotated at the provider. See the Security section of the
README.

### Admin ↔ storefront sync

The storefront reads live from MongoDB through the models. There is no
boot-time cache (an earlier version populated `global.food_items` once at
startup, so admin edits stayed invisible until a restart). Anything the admin
console writes is visible on the next storefront request — keep it that way.

### Checkout, receipts and the delivery tracker

Money, ETAs and rider assignment are decided **server side** in
`backend/services/checkout.js`. The client sends only the cart; it never sends
a price, an ETA or a rider. Keep it that way.

This was aspirational until it was enforced. `priceOrder` summed `item.price`
straight off the request body, so any authenticated caller could POST a cart
claiming `price: 1` and be billed one rupee. `buildPricedItems` now resolves
every line from the catalogue and takes only `id`, `size` and `qty` from the
request — name, price and kitchen all come from the database. A line that cannot
be priced **fails the checkout**; do not add a fallback to the client's figure,
because that fallback *was* the bug. `buildPricedItems` is exported so the
arithmetic can be tested without a database.

- A receipt is the record everything else reads: the PDF, the tracker, the
  order history and the admin console. One generator (`services/receiptPdf.js`)
  serves both the customer and admin downloads, so the two copies cannot drift.
- The rider snapshot on a receipt is denormalised **on purpose** — a receipt
  records what happened and must not change when the rider's profile does.
- `assignRider` uses a single `findOneAndUpdate` to match a free rider and flip
  them to `busy`. Do not split that into a find plus a save: two simultaneous
  checkouts would be handed the same rider.
- `releaseRider` is guarded at both call sites so a rider is released once and
  only a genuine delivery increments `totalDeliveries`.
- The tracker computes progress from the server's `placedAt`/`etaAt` on every
  tick rather than accumulating locally, so it stays correct across a reload or
  a backgrounded tab. Do not replace that with a decrementing counter.

### Adding an admin resource

1. Add the Mongoose model in `backend/models/`.
2. Mount it in `backend/routes/Admin.js` with `buildCrudRouter`.
3. Add an entry to `src/screens/admin/resourceConfig.js` (columns + fields).
4. Add a route in `App.js` and a nav item in `AdminLayout.js`.

No new screen component is needed.

### Icons

Font Awesome 6, loaded from the CDN in `public/index.html`, used as
`<i className="fas fa-…" aria-hidden="true" />`. Do not add an icon package.

## Things to avoid

- `Math.random()` in a component body — it re-rolls on every render. The
  testimonial fixtures were broken this way; use deterministic data.
- Reaching into `../node_modules/...` with a relative import.
- Adding a dependency for something already available (icons, HTTP, dates).
- Committing `node_modules` — there is a root `.gitignore` now precisely
  because that happened once.

## Content policy for this repo

Seeded partners, riders, policies and FAQs are **sample content for a fictional
company** and are labelled as such. Do not present them as real business terms,
and do not invent new policy claims that read as authoritative fact.
