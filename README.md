# brickzone-web

Online shop for **Brickzone** (LEGO, RC and MOC models), replacing the Zochil shop at brickzone.mn.
Next.js 16 (App Router), Tailwind CSS 4, no database: the catalog is `src/data/catalog.json`.

```bash
npm install
npm run dev          # http://localhost:3000
npm run lint
npm run typecheck
npm run build
npm run test:order -- http://localhost:3000          # order API checks (no order sent)
npm run sync:erxes                                   # refresh prices from erxes (needs env vars)
```

- Pages: home (owner's banners, category bricks, sale strip, shelves, community, shop visit), `/shop`
  (category, sub-category, sale, in-stock, search, sort), `/p/<slug>` (gallery, pieces/size/age/scale, features),
  `/cart` (checkout), `/info` (delivery, payment, FAQ, about, contact). Old Zochil URLs redirect to the new pages.
- Search: header search with instant results; Cyrillic or Latin typing (`ekskavator`, `mashin`), ө/ү typed as о/у.
- Orders: `POST /api/orders` validates the cart against the catalog (prices and the delivery fee never come from
  the browser) and sends it to erxes as a form submission. Without the `ERXES_*` env vars it answers
  `503 not_configured` and the checkout tells the customer to call.
- Business facts (phone, delivery 8,000₮ / free from 250,000₮, payment rules): `src/content/business.ts`.
- erxes setup that happens in the admin, not in code: `docs/erxes/MANUAL-STEPS.md`.
