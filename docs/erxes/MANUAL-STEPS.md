# Brickzone: erxes manual steps

Owner of every step below: **Terbish**, with Brickzone for credentials and decisions.

These steps happen inside the erxes 3.0 admin, not in code. The website reads the results through the
environment variables in `.env.example`. Never commit their values.

| Task | Status | What to do in erxes (admin path) |
| --- | --- | --- |
| [1.1] Import products, categories, prices | website done · manual import in erxes | Section 1.1 |
| [1.2] Payment setup (QPay) | website done · manual, blocked on QPay merchant credentials | Section 1.2 |
| [1.3] eBarimt setup | website done · manual, blocked on PosAPI registration + TIN | Section 1.3 |
| [1.4] Delivery zones, fees, order statuses | website done · manual in erxes | Section 1.4 |
| [1.5] Test order from cart to receipt | validation verified · real order blocked on erxes env vars + 1.2 + 1.3 | Section 1.5 |

There is no erxes instance for Brickzone yet ("erxes 3.0: NOT SET"). Create it first, then add the env vars
under **Vercel → brickzone-web → Settings → Environment Variables**.

---

## 1.1 Import products, categories and prices

Source: brickzone.mn (Zochil shop 28792), scraped 2026-11-16, plus the Facebook page «Brickzone» (it only gives the
name and the profile image).

- **153 products**, 6 home banners, 3 posts, the «Бидний тухай» text, the FAQ and the logo.
- The 23 Zochil categories (several empty or overlapping) were merged into **10 categories with 12 sub-categories**.
  Products that had no category on Zochil were placed by name (frames, toy guns, diecast, Ferrari F1 Team,
  Dune ornithopter, a mining RC set).
- Pieces, size, age and scale were parsed out of the Zochil descriptions into separate fields (pieces 57,
  size 120, age 63, scale 24 products). The other description lines are kept as «Онцлог».
- Spelling fixes in names: Toyata → Toyota, Peogeut → Peugeot, Effiel → Eiffel, Impeza → Impreza,
  Lmolia → Imola, McLaren casing.

| Code | Name | Products |
| --- | --- | --- |
| `BZ-lego-cars` | LEGO машин (Hypercars, Спорт машин, Formula 1, Жийп) | 31 |
| `BZ-rc` | RC удирдлагатай (Уул уурхай, Бартаат зам, Хүнд даац, Завь/нисдэг тэрэг) | 30 |
| `BZ-rc-sets` | RC барилгын багц | 6 |
| `BZ-military` | Цэргийн LEGO (Танк, Хуягт, Онгоц, Хөлөг) | 18 |
| `BZ-6-stud` | 6 Stud цуглуулга | 7 |
| `BZ-frames` | Жааз, хорго | 20 |
| `BZ-buildings` | LEGO барилга | 5 |
| `BZ-diecast` | Diecast | 20 |
| `BZ-diy` | DIY, STEM | 4 |
| `BZ-toys` | Бусад тоглоом | 12 |

Files:

- `docs/erxes/brickzone-categories.csv`: the parent `BZ`, 10 categories and 12 sub-categories (`BZ-<cat>-<sub>`).
- `docs/erxes/brickzone-products.csv`: **153 rows**, code `BZ-<zochilId>`, with price, old price, Zochil stock,
  status (бэлэн / дууссан), brand, supplier SKU, pieces, size, age, scale, features and photo paths.

Steps:

1. **Products & services → Categories**: import `brickzone-categories.csv`, or create the categories by hand.
2. **Settings → Import & Export → Import → Products**: upload `brickzone-products.csv`.
   - Map `code → Code`, `name → Name`, `categoryCode → Category code`, `unitPrice → Unit price`, `type → Type`,
     `uom → UOM`, `description → Description`.
   - Keep the codes: the website and `npm run sync:erxes` match products on them.
3. **Brands**: Zochil had 7 brands on 72 products (HULNA TOYS 21, WANGE 18, Technic 16, CADFI 12, Icons 3,
   MOULD KING 1, Feelo 1). Create them in **Products & services → Brands** if erxes should keep them.
4. **Stock**: Zochil tracked stock on 151 products (862 units); 2 are untracked.
   - **18 are at 0** and show as «Дууссан» on the website (BMW 1000RR, Ferrari F1 frame, Toyota Trueno AE86,
     Pagani Imola, La Ferrari Viva Hypercar, McLaren F1, Ford GT, Porsche 911RSR GT3, Ferrari Daytona Sp3,
     Урал 4320 кемпер, Урал 4320 чирэгч, УАЗ-469, Scania 770S шаланз, Mustang P-51 fighter, Гелин сумтай AK47,
     La Ferrari Viva Hypercar frame, Dune Royal ornithopter, Eiffel Tower).
   - Enter the real remainders in **Inventories → Remainders**. Until erxes stock is wired to the site, update
     `stock` in `src/data/catalog.json` when it changes.
5. **Discounts**: 56 products have a sale price on Zochil (the Black Friday campaign, up to −50%). The CSV keeps
   the old price in `compareAtPrice`. Recreate the campaign in **Loyalty → Pricing** with an end date.
6. **Photos** (443 images, WebP) are in `public/images/p` on the website. Upload them to the products in erxes
   before the Zochil shop closes.
7. Run `npm run sync:erxes` once with a Client Portal token to confirm the codes match.

**Confirm with Brickzone:**

- When does the Black Friday sale end? The website shows the Zochil sale prices until `catalog.json` changes.
- 96 products have no piece count in their description.

## 1.2 Payment setup (QPay)

On Zochil the only enabled checkout method was **QPay**, through Zochil's merchant. It must be issued again for
erxes. The shop's payment rule also mentions Хаан банк / Төрийн банк transfer and **SocialPay, ArdPay 6 хуваан**.

1. Get Brickzone's own QPay merchant credentials: `client_id`, `client_secret` and `invoice_code`.
   Owner: Terbish / Brickzone.
2. **Settings → Payments → Add → QPay**: enter the credentials.
3. **Settings → Payments → (QPay) → Test**: create a 100₮ test invoice.
4. **Sales → Pipelines → «Вэбсайт» → Settings → Payments**: select QPay.
5. Installments: SocialPay / ArdPay need their own merchant contracts. Until they are connected, the website only
   collects the request (see below) and staff arrange it by phone.

Website (done):

- Checkout shows QPay and the rule «QPay-ээр төлснөөр захиалга баталгаажна; Хаан банк, Төрийн банкны дансаар
  шилжүүлж болно».
- A «6 хуваан төлөх хүсэлт (SocialPay, ArdPay)» checkbox adds `[SocialPay/ArdPay 6 хуваан төлөх хүсэлттэй]` to
  the order note in erxes.

**Confirm with Brickzone:** the bank account numbers (not on Zochil), and whether installments have a minimum amount.

## 1.3 eBarimt setup

Zochil had no eBarimt setting for this shop.

1. Collect from Brickzone: the company or individual TIN, district code and VAT status, and the product
   classification codes (toys / construction sets).
2. Register for **PosAPI 3.0** (ebarimt.mn → Business → PosAPI) and install the PosAPI service.
3. **Settings → eBarimt → Add**: enter the PosAPI URL, TIN, district code and VAT switches, then assign it to the
   website pipeline.

Website (done):

- Checkout asks for «Хувь хүн» or «Байгууллага».
- For a company it requires the 7-digit registry number and validates it on the server.

## 1.4 Delivery zones, fees and order statuses

**Website (done)**, taken from the Zochil delivery settings and FAQ:

| Option | Fee | Notes |
| --- | --- | --- |
| Улаанбаатар хот | 8,000₮ | «24-48 цагийн дотор хүргэх болно» |
| Орон нутаг | 8,000₮ | «Орон нутгаас захиалсан барааг унаанд тавьж өгдөг»; the address field asks for the town, bus and receiver |
| Both | **free from 250,000₮** | Zochil `delivery_price_limit` |

- Zochil had a single option «Улаанбаатар хот болон орон нутаг». The website splits it in two only so staff see
  which one it is; the fee is the same.
- The server recomputes the fee and the free-delivery threshold; the browser cannot change them.
- All of these rules are in `src/content/business.ts`.

**Confirm with Brickzone:**

- Is pick-up from the shop (Андууд Старс төв, Б заал, 4 давхар, 28 тоот; 10:00–19:00) allowed? Zochil did not
  offer it, so the website does not.
- Who pays the bus fare for countryside orders, and does the 8,000₮ cover taking the parcel to the bus?
- Districts far from the centre (Налайх, Багануур): same fee?
- The exact map location. Zochil had no coordinates, so the map link searches «Anduud Stars center».

**erxes (manual):**

1. Import `docs/erxes/brickzone-delivery.csv`: services `DELIVERY-UB` and `DELIVERY-COUNTRYSIDE`, 8,000₮ each.
2. **Sales → Boards → «Онлайн захиалга» → pipeline «Вэбсайт»**, with these stages in order:
   1. Шинэ захиалга
   2. Төлбөр хүлээгдэж буй
   3. Төлбөр баталгаажсан
   4. Бэлтгэж байна
   5. Хүргэлтэд гарсан
   6. Хүргэгдсэн

   Add «Цуцлагдсан» as well.
3. **Frontline → Forms → (order form) → Settings**: create a sales card in «Шинэ захиалга» for every submission.
