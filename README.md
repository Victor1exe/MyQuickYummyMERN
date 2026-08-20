# My Quick Yummy

A MERN food-delivery application. Customers browse by **category → dish → kitchen**,
build a cart and check out; an **admin console** manages the kitchens, the rider
fleet, the menu and the internal documents, and everything it changes appears on
the storefront immediately.

```
React 18 (CRA)  ──HTTP──▶  Express 4  ──▶  MongoDB (Mongoose 6)
   :3000                     :5000              :27017
```

---

## Quick start

### 1. Prerequisites
- Node.js 18 or newer
- A MongoDB instance (local, or an Atlas connection string)

### 2. Configure

```bash
cp mernapp/backend/.env.example mernapp/backend/.env
cp mernapp/.env.example mernapp/.env
```

Then edit `mernapp/backend/.env` and fill in at minimum:

| Variable | Purpose |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Signs customer tokens |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin console login |
| `ADMIN_JWT_SECRET` | Signs admin tokens — must differ from `JWT_SECRET` |

The server refuses to boot if any required variable is missing, so a
misconfigured deployment fails loudly instead of running unauthenticated.

### 3. Install and seed

```bash
cd mernapp/backend && npm install
cd ..              && npm install

npm run seed          # from mernapp/ — populates categories, kitchens,
                      # dishes, riders, policies and FAQs
```

`npm run seed -- --fresh` wipes the seeded collections first. Neither mode
touches customer accounts or orders.

### 4. Run

```bash
# terminal 1 — API on :5000
cd mernapp/backend && npm run dev

# terminal 2 — storefront on :3000
cd mernapp && npm start
```

| URL | What |
|---|---|
| http://localhost:3000 | Storefront |
| http://localhost:3000/admin | Admin console |
| http://localhost:5000/api/health | API health check |

### 5. Verify

```bash
cd mernapp/backend && npm run smoke   # end-to-end check against the real DB
cd mernapp          && npm test       # frontend unit tests
cd mernapp          && npm run build  # production build
```

`npm run smoke` boots the real Express app on a spare port and walks the whole
product — catalogue, signup, login, authorisation (including that a customer
token cannot reach an admin route and vice versa), checkout maths, ETA bounds,
rider assignment and release, the PDF receipt, live tracking, admin CRUD,
admin→storefront sync, cross-customer isolation, and — in section 11 — that a
cart lying about its prices is billed from the catalogue anyway and that repeated
admin logins get a 429. It removes its own test data afterwards and leaves seeded
catalogue data untouched.

---

## Docker

```bash
docker compose up --build
docker compose exec api npm run seed
```

Brings up MongoDB, the API and an nginx-served production build of the
storefront. Override the secrets in your shell before running it anywhere real:

```bash
JWT_SECRET=… ADMIN_PASSWORD=… ADMIN_JWT_SECRET=… docker compose up --build
```

---

## How the ordering flow works

1. **Category** — the home page opens on a category grid. Picking one filters
   the menu and scrolls to it.
2. **Dish** — each card carries a description, the kitchen that cooks it, a
   veg/non-veg marker, rating, prep time and calories. *Add to Cart* adds it
   directly.
3. **Kitchen** — clicking the card opens the dish in full, plus the kitchen
   behind it, the rest of that kitchen's menu with `−`/`+` steppers, and similar
   dishes from other kitchens.
4. **Cart → checkout** — the cart posts to `/api/orderData`, which reads the
   customer identity from the verified token rather than from the request body.
   The server prices the order from the catalogue — only `id`, `size` and `qty`
   are taken from the request, so a tampered `price` has no effect — then claims
   a free rider and sets an ETA.

### After payment

- A **confirmation popup** shows for five seconds with the estimated delivery
  time (a random 35–75 minutes, fixed server side) and the delivery partner who
  took the job — always one who was `available` or `ready_to_go`, atomically
  flipped to `busy` so two checkouts can never be handed the same rider.
- It then hands over to a **live tracker**: a rectangular status bar that a bike
  fills from left to right as the clock counts down to zero. The bar is anchored
  to the server's timestamps, so it survives navigation and reloads, and can be
  minimised to a pill.
- At zero the order is marked delivered and the rider is released back to
  `available` — which the storefront's fleet board and the admin console both
  pick up immediately.
- A **PDF receipt** is generated on demand from the stored record, downloadable
  from **My Orders**. The admin console downloads the byte-identical document
  from `/admin/receipts`.

---

## API

Public:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/createuser` | Register |
| `POST` | `/api/loginuser` | Sign in, returns `authToken` |
| `GET`/`POST` | `/api/foodData` | `[foodItems, foodCategories]` |
| `GET` | `/api/foodItems/:id` | Dish + kitchen + same-kitchen + similar |
| `GET` | `/api/partners` | All kitchens |
| `GET` | `/api/partners/:id` | One kitchen + its menu |
| `GET` | `/api/faqs` | Published FAQs |
| `GET` | `/api/policies`, `/api/policies/:slug` | Published policies |
| `GET` | `/api/riders`, `/api/riders/stats` | Public roster + fleet counters |

Customer (requires `auth-token` header):

| Method | Path |
|---|---|
| `GET` | `/api/me` |
| `POST` | `/api/orderData` — checkout; returns the created receipt |
| `POST` | `/api/myOrderData` — order history + receipts |
| `GET` | `/api/orders/:receiptNo` — live tracking state |
| `POST` | `/api/orders/:receiptNo/complete` — mark delivered, release the rider |
| `GET` | `/api/orders/:receiptNo/receipt.pdf` — PDF receipt |

Admin (requires `admin-token` header):

| Method | Path |
|---|---|
| `POST` | `/api/admin/login` *(public)* |
| `GET` | `/api/admin/me`, `/api/admin/overview`, `/api/admin/orders` |
| `GET` | `/api/admin/receipts`, `/api/admin/receipts/:receiptNo/receipt.pdf` |
| `PUT` | `/api/admin/receipts/:receiptNo/status` |
| `GET`/`POST`/`PUT`/`DELETE` | `/api/admin/{partners,riders,categories,items,policies,faqs}` |

---

## Project layout

```
mernapp/
├── backend/
│   ├── config/       env validation, database connection
│   ├── middleware/    fetchUser, fetchAdmin, rateLimit, async + error handling
│   ├── models/        Mongoose schemas
│   ├── routes/        public, customer and admin routers
│   ├── seed/          seed script + JSON fixtures
│   └── index.js       server entry point
└── src/
    ├── components/    Navbar, Footer, Card, MenuRow, home/ sections
    ├── data/          static home-page copy and testimonial fixtures
    ├── hooks/         useDarkMode
    ├── screens/       Home, Login, Signup, Cart, MyOrder, FoodDetail,
    │                  KitchenView, Policies, admin/
    ├── services/      api client (base URL + auth headers)
    └── styles/        one stylesheet per screen/component
```

See [`project_flow.txt`](project_flow.txt) for the end-to-end request flow and
[`CLAUDE.md`](CLAUDE.md) for the conventions this codebase follows.

---

## Security

### Enable the secret-scanning hook (once per clone)

```bash
git config core.hooksPath .githooks
```

[`.githooks/pre-commit`](.githooks/pre-commit) blocks a commit that would add an
`.env` file, either of the two previously-leaked values **or a fragment of one**,
a MongoDB URI with inline credentials, or a secret-shaped variable assigned a
literal. Placeholders in `.env.example` and docs are exempt. It runs in ~2s on a
1,000-file commit; override deliberately with `git commit --no-verify`.

It matches leaked values by *prefix* on purpose. A partial copy of a secret is
still a leak, and pasting a fragment into a helper script — so it can grep the
history for it — is the most likely way one comes back. That is exactly what had
happened to `scripts/purge-secrets-from-history.sh`, which is why that script
now reads the values it redacts from a git-ignored file instead of containing
them.

### Rotate the leaked credentials

Two secrets were hardcoded and committed before this cleanup, and are still in
the git history **and on the public remote**:

| Secret | Was in | Status |
|---|---|---|
| MongoDB password | `backend/db.js` | **Must be rotated in Atlas** |
| JWT signing secret | `backend/Routes/Createuser.js` | Replaced in `backend/.env` |

Rotating the Atlas password is the only real fix — history rewriting does not
recall a value that has been public. Once rotated, update `MONGO_URI` in
`mernapp/backend/.env`.

If you also want the history cleaned:

```bash
# Optional: name the opaque literals to redact (a JWT secret, an API key).
# Connection strings with inline credentials are found without any help.
cp scripts/secrets-to-purge.example scripts/secrets-to-purge.txt
#   ...then add one literal value per line. The copy is git-ignored.

sh scripts/purge-secrets-from-history.sh          # dry run, reports only
sh scripts/purge-secrets-from-history.sh --apply  # rewrite
```

Read that script's header first — it rewrites every commit SHA and needs a
`--force` push, which breaks existing clones.

`--apply` writes a `*-pre-secret-purge-<sha>.bundle` **next to the repository**
before it rewrites anything; `git clone` that bundle to get the original history
back. A tag cannot serve as the restore point here, because `--tag-name-filter`
rewrites tags too and the follow-up `git gc --prune=now` then drops the
originals for good. Both that bundle and `secrets-to-purge.txt` hold secrets in
the clear — delete them once you are satisfied with the result.

## Notes

- Seeded partner, rider, policy and FAQ content is **sample data** written for
  demonstration. It is not a description of a real business.
- Nutrition figures on dishes are seeded estimates. The diet calculator is a
  guide for choosing a meal, not medical advice.
- The MongoDB URI previously hardcoded in `backend/db.js` is in this repo's git
  history. **Rotate that Atlas password.**


Quote the admin password to make it work. 
