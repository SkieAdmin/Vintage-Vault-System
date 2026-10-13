# Kierre's Vintage Vault

**Thrift Ordering and Item Reservation System**

A mobile commerce app for a small vintage/thrift store. Every item is one-of-a-kind
(stock = 1), so the system's most important job is making sure **two customers can never
buy the same piece**. Customers browse, reserve an item for 15 minutes, check out, pay,
and choose pickup or delivery. The seller manages inventory, orders, reservations,
concerns and reports.

Built as a school project: React Native (Expo SDK 54) + Node.js/Express + SQLite, in
plain JavaScript.

---

## Table of contents

1. [Requirements](#1-requirements)
2. [Quick start](#2-quick-start)
3. [Backend setup](#3-backend-setup)
4. [Database setup](#4-database-setup)
5. [Frontend setup](#5-frontend-setup)
6. [Testing on your Android phone](#6-testing-on-your-android-phone)
7. [Demo accounts](#7-demo-accounts)
8. [Environment variables](#8-environment-variables)
9. [Project structure](#9-project-structure)
10. [How the reservation system works](#10-how-the-reservation-system-works)
11. [API reference](#11-api-reference)
12. [Features checklist](#12-features-checklist)
13. [What is simulated](#13-what-is-simulated)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. Requirements

| Tool | Version | Notes |
| --- | --- | --- |
| Node.js | 18 or newer (tested on 24.11) | https://nodejs.org |
| npm | comes with Node | |
| Expo Go | latest, **SDK 54** | Install from the Google Play Store on your phone |
| Android phone | any | Must be on the same Wi-Fi as your computer |
| Android Studio | optional | Only needed if you want an emulator instead of a real phone |

No database server to install — SQLite lives in a single file inside `backend/data/`.

---

## 2. Quick start

Open **two terminals**.

**Terminal 1 — backend**

```bash
cd backend
npm install
npm run seed
npm run dev
```

**Terminal 2 — mobile app**

```bash
cd frontend
npm install
npx expo start
```

Then scan the QR code with **Expo Go** on your Android phone.

**Log in with:**

| Role | Email | Password |
| --- | --- | --- |
| Admin / Seller | `admin@kierresvault.com` | `admin123` |
| Customer | `customer@example.com` | `customer123` |
| Second customer | `josh@example.com` | `customer123` |

The login screen also has **Customer** and **Seller / Admin** buttons that fill these in
for you. See [section 7](#7-demo-accounts) for details.

---

## 3. Backend setup

```bash
cd backend
npm install                # installs express, better-sqlite3, bcryptjs, jsonwebtoken…
copy .env.example .env     # Windows  (macOS/Linux: cp .env.example .env)
npm run seed               # creates the database + demo data
npm run dev                # starts on http://localhost:5000  (nodemon, auto-restart)
```

Use `npm start` instead of `npm run dev` if you do not want auto-restart.

When the server boots it prints every address it can be reached on:

```
  Kierre's Vintage Vault API started on port 5000
  Reservation hold time: 15 minutes

  Local:   http://localhost:5000/api
  Network: http://192.168.1.10:5000/api   <-- use this one in frontend/config/api.js
```

Check it works by opening `http://localhost:5000/api/health` in a browser.

---

## 4. Database setup

The project uses **SQLite** through `better-sqlite3`. The database file is created
automatically at `backend/data/vintagevault.db` the first time the server or the seeder
runs — there is nothing to install or configure.

| Command | What it does |
| --- | --- |
| `npm run seed` | Adds the demo accounts and 12 sample thrift items. Safe to run again — it skips anything that already exists. |
| `npm run reset` | **Wipes every table**, then seeds from scratch. Use this to get a clean state before your presentation. |

Tables created (see `backend/config/database.js`):
`users`, `products`, `reservations`, `orders`, `order_items`, `concerns`.

---

## 5. Frontend setup

```bash
cd frontend
npm install
npx expo start
```

The app is built for **Expo SDK 54 and runs in Expo Go** — no custom native build is
needed. Every dependency was installed with `npx expo install`, so all versions match
the SDK:

| Package | Version |
| --- | --- |
| expo | ~54.0.35 |
| react-native | 0.81.5 |
| react | 19.1.0 |
| @react-navigation/native, native-stack, bottom-tabs | 7.x |
| react-native-screens | ~4.16.0 |
| react-native-safe-area-context | ~5.6.0 |
| @react-native-async-storage/async-storage | 2.2.0 |
| expo-image | ~3.0.11 |
| expo-image-picker | ~17.0.11 |
| expo-constants | ~18.0.x |

You can verify this at any time with `npx expo install --check`.

---

## 6. Testing on your Android phone

1. **Connect both devices to the same Wi-Fi network.** Your phone and your computer must
   be on the same router. (Mobile data or a guest network will not work.)

2. **Find your computer's IPv4 address.** In a terminal on Windows:

   ```bash
   ipconfig
   ```

   Look under your Wi-Fi adapter for `IPv4 Address`, e.g. `192.168.1.10`.
   The backend also prints it for you when it starts.

3. **Point the app at your backend.** Open **[frontend/config/api.js](frontend/config/api.js)**.

   In most cases **you do not have to change anything**: Expo Go already downloaded the
   JavaScript from your computer's LAN address, so `detectHostFromExpo()` reuses that
   same address automatically.

   If the app shows *"Cannot reach the server"*, set it manually:

   ```js
   // frontend/config/api.js
   export const MANUAL_API_HOST = '192.168.1.10';   // <-- your computer's IPv4
   export const API_PORT = 5000;                    // must match PORT in backend/.env
   ```

   Save the file — Expo reloads automatically.

4. **Start the backend**, then **start Expo**:

   ```bash
   cd backend  && npm run dev
   cd frontend && npx expo start
   ```

5. **Scan the QR code** with Expo Go. The app opens on your phone.

The Profile screen shows the API address the app is actually using at the bottom — handy
for checking the configuration during a demo.

> **Using an Android Studio emulator instead?** Set `MANUAL_API_HOST = '10.0.2.2'`,
> which is how the emulator reaches your computer's `localhost`.

---

## 7. Demo accounts

Created by `npm run seed`:

| Role | Email | Password |
| --- | --- | --- |
| Admin / Seller | `admin@kierresvault.com` | `admin123` |
| Customer | `customer@example.com` | `customer123` |
| Customer (second, for the race-condition demo) | `josh@example.com` | `customer123` |

The login screen has **Customer** and **Seller / Admin** buttons that fill these in for
you, so you do not have to type them during your presentation.

The accounts are defined in [`backend/seed/seed.js`](backend/seed/seed.js) (`DEMO_USERS`).
Edit that list and re-run `npm run reset` if you want different names or passwords.
Passwords are hashed with bcrypt before they reach the database — the plain text above
exists only in the seed file.

Registering through the app always creates a **customer**. The admin role can only be set
by the seeder, so nobody can sign themselves up as the seller.

> These are demo credentials for a school project only. Do not reuse them anywhere real.

---

## 8. Environment variables

Copy `backend/.env.example` to `backend/.env`:

| Variable | Default | Meaning |
| --- | --- | --- |
| `PORT` | `5000` | Port the Express server listens on |
| `JWT_SECRET` | dev fallback | Secret used to sign login tokens — change it |
| `JWT_EXPIRES_IN` | `7d` | How long a login stays valid |
| `DATABASE_URL` | `./data/vintagevault.db` | Path of the SQLite file |
| `RESERVATION_MINUTES` | `15` | How long an item stays reserved |
| `DELIVERY_FEE` | `80` | Flat delivery fee in pesos (pickup is always free) |

The frontend has no secrets. Display-only settings (store address, delivery fee shown
before checkout, payment options) live in
[frontend/config/appConfig.js](frontend/config/appConfig.js), and the API address lives in
[frontend/config/api.js](frontend/config/api.js).

> If you change `RESERVATION_MINUTES` or `DELIVERY_FEE` in `.env`, update the matching
> display values in `frontend/config/appConfig.js` so the customer sees the same numbers.
> The **server** always decides the real values.

---

## 9. Project structure

```
Kierre's Vintage Vault/
├── backend/
│   ├── config/
│   │   ├── database.js          SQLite connection + all table definitions
│   │   └── env.js               reads .env
│   ├── controllers/             request handling (auth, products, reservations, orders,
│   │                            concerns, admin, uploads)
│   ├── middleware/
│   │   ├── asyncHandler.js      forwards thrown errors to the error handler
│   │   ├── auth.js              JWT verification + admin guard
│   │   └── errorHandler.js      one JSON shape for every error
│   ├── models/                  all SQL lives here (userModel, productModel,
│   │                            reservationModel, orderModel, concernModel)
│   ├── routes/                  URL -> controller mapping
│   ├── services/
│   │   ├── reservationService.js  ** the reservation + race-condition logic **
│   │   ├── orderService.js        checkout, payment confirmation, status changes
│   │   └── paymentService.js      simulated GCash / Maya / PayPal
│   ├── seed/
│   │   ├── sampleProducts.js    12 sample thrift items
│   │   └── seed.js              seeding + reset script
│   ├── utils/                   ApiError, validators, shared constants
│   ├── uploads/                 photos uploaded from the admin app (created at runtime)
│   ├── data/                    the SQLite file (created at runtime)
│   ├── .env.example
│   └── server.js                entry point
│
└── frontend/
    ├── assets/                  app icon + splash
    ├── components/              ProductCard, ConditionBadge, StatusBadge,
    │                            ReservationTimer, CustomButton, InputField,
    │                            EmptyState, LoadingIndicator, OrderCard,
    │                            SectionHeader, ProductImageGallery, Card,
    │                            DetailRow, FilterChip, ProductImage, Screen
    ├── config/
    │   ├── api.js               ** where you set your computer's IP address **
    │   └── appConfig.js         store info, payment options, display constants
    ├── context/
    │   ├── AuthContext.js       logged-in user + token storage
    │   └── CartContext.js       cart, backed by real server reservations
    ├── navigation/
    │   ├── RootNavigator.js     splash / auth / customer / admin switch
    │   ├── AuthNavigator.js
    │   ├── CustomerNavigator.js bottom tabs + detail screens
    │   ├── AdminNavigator.js
    │   └── navigationTheme.js   dark theme for React Navigation
    ├── screens/
    │   ├── auth/                Splash, Login, Register
    │   ├── customer/            Home, Shop, Search, ProductDetails, Cart,
    │   │                        Reservations, Checkout, Payment,
    │   │                        OrderConfirmation, MyOrders, OrderDetails,
    │   │                        SubmitConcern, MyConcerns, Profile
    │   └── admin/               Dashboard, ProductManagement, ProductForm,
    │                            Reservations, Orders, OrderDetails, Concerns,
    │                            SalesReport, InventoryReport
    ├── services/                one file per API area (apiClient + 6 services)
    ├── theme/                   colours, spacing, typography (the dark vintage look)
    ├── utils/                   formatting + form validation
    ├── App.js
    └── app.json
```

### Files worth reading first

| File | Why |
| --- | --- |
| `backend/services/reservationService.js` | The core feature — reservations and the race-condition fix |
| `backend/models/productModel.js` | `compareAndSetStatus()`, the atomic status change |
| `backend/services/orderService.js` | Checkout: server-side pricing and Reserved → Sold |
| `backend/config/database.js` | The whole database schema in one place |
| `frontend/context/CartContext.js` | Why the cart is really a list of reservations |
| `frontend/config/api.js` | Connecting your phone to your computer |
| `frontend/theme/index.js` | Every colour and text style in the app |

---

## 10. How the reservation system works

This is the part to explain during your defence.

### The problem

Thrift items are unique — quantity is always 1. If two customers tap **Reserve** on the
same jacket at the same moment, a naive system creates two reservations and sells the
same jacket twice.

### The rules

1. Reserving changes the product from `Available` to `Reserved` and creates a
   `reservations` row with `reservedAt` and `expiresAt` (now + 15 minutes).
2. While reserved, **nobody else** can reserve or buy it. The card shows `RESERVED`.
3. The customer sees a live countdown: `Reserved for 14:32`.
4. If the countdown runs out, the reservation becomes `expired` and the product goes back
   to `Available` automatically.
5. If the order is placed, the product becomes `Sold` and stays in the database for the
   sales history.

### Three layers stop the double-sale

**1 — Conditional UPDATE (the important one)**
`backend/models/productModel.js`:

```js
UPDATE products SET status = 'Reserved' WHERE id = ? AND status = 'Available'
```

The `AND status = 'Available'` means the row is only changed if it is *still* available.
SQLite runs one write statement at a time, so when two requests arrive together exactly
one of them reports `changes === 1`. The other gets `0` and receives **HTTP 409 Conflict**.
The decision is made by the database, never by the app.

**2 — Transactions**
Every reservation and every checkout runs inside `db.transaction(...)`, so the status
change and the reservation/order rows are written together or not at all.

**3 — A database-level unique index**
`backend/config/database.js`:

```sql
CREATE UNIQUE INDEX idx_one_active_reservation
  ON reservations(productId) WHERE status = 'active';
```

Even if someone later introduces a bug in the service layer, a second active reservation
for the same product is impossible.

### Expiry

Two mechanisms, so the data is never stale:

* **Lazy** — `expireDueReservations()` runs at the start of every reserve, checkout,
  product listing and admin listing.
* **Background sweeper** — a `setInterval` in `reservationService.js` runs every 20
  seconds so items reappear in the shop on their own during the demo.

### How to demo it in class

1. Log in as `customer@example.com` on your phone. Reserve an item.
2. Log in as `josh@example.com` in a second Expo Go instance (or on the emulator) and try
   to reserve the same item → *"Someone else is currently reserving this item."*
3. Watch the countdown. When it hits zero, pull to refresh — the item is `Available` again.
4. Or check out as the first customer → the item becomes `SOLD` and can never be bought
   again.

The automated test in the smoke script proves it too: two simultaneous reserve requests
produce exactly **1 success and 1 conflict**.

---

## 11. API reference

Base URL: `http://<your-ip>:5000/api`

Protected routes need the header `Authorization: Bearer <token>`.

### Auth

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/auth/register` | public | Create a customer account |
| POST | `/auth/login` | public | Log in, returns a JWT |
| GET | `/auth/me` | user | Check the saved token is still valid |
| PUT | `/auth/profile` | user | Update name / contact number |

### Products

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| GET | `/products` | public | List + filter (`search`, `category`, `condition`, `status`, `sort`, `limit`) |
| GET | `/products/home` | public | Featured, new arrivals, recently added, categories |
| GET | `/products/options` | public | Category / condition / status lists for the filter UI |
| GET | `/products/:id` | public | One item + its reservation countdown |
| POST | `/products` | **admin** | Add an item |
| PUT | `/products/:id` | **admin** | Edit an item |
| DELETE | `/products/:id` | **admin** | Delete an item (blocked if reserved or sold) |

### Reservations

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/reservations` | user | Reserve an item (409 if someone else won) |
| GET | `/reservations/my` | user | My reservations (`?active=true` for current holds) |
| DELETE | `/reservations/:id` | user | Release my hold |
| DELETE | `/reservations/product/:productId` | user | Release by product (used by the cart) |

### Orders

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/orders` | user | Place an order (server recomputes all prices) |
| POST | `/orders/:id/pay` | user | Confirm the simulated GCash / Maya / PayPal payment |
| GET | `/orders/my` | user | My orders |
| GET | `/orders/:id` | owner or admin | One order + its concerns |
| PUT | `/orders/:id/status` | **admin** | Change the order status |

### Concerns

| Method | Endpoint | Access | Description |
| --- | --- | --- | --- |
| POST | `/concerns` | user | Submit a return / authenticity concern |
| GET | `/concerns/my` | user | My concerns |
| GET | `/concerns/:id` | owner or admin | One concern |
| PUT | `/concerns/:id` | **admin** | Set status + reply |

### Admin

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/admin/dashboard` | Headline stats + recent orders |
| GET | `/admin/orders` | All orders (`?status=`) |
| GET | `/admin/reservations` | All reservations (`?status=active|expired|…`) |
| DELETE | `/admin/reservations/:id` | Force-release a hold |
| GET | `/admin/concerns` | All concerns (`?status=`) |
| GET | `/admin/reports/sales` | Totals, sales per day, recent sales |
| GET | `/admin/reports/inventory` | Counts by status and category, full lists |
| POST | `/admin/uploads` | Upload a product photo (base64 → file) |

`GET /api/health` is public and useful for checking connectivity from the phone's browser.

---

## 12. Features checklist

**Customer**

- [x] Register, login, session saved on the phone
- [x] Home screen with featured items, categories, new arrivals, recently added
- [x] Shop with category / condition / availability filters and sorting
- [x] Search by name, brand, category or description
- [x] Product details with a swipeable multi-photo gallery
- [x] Condition grade (Like New / Excellent / Good / Fair) + written condition notes
- [x] Reserve an item for 15 minutes, with a live countdown
- [x] Cart (each cart item is a real server-side hold) and subtotal
- [x] Checkout: contact details, pickup or delivery, payment method, price summary
- [x] Pickup instructions, or recipient / phone / address / notes for delivery
- [x] Simulated GCash, Maya, PayPal, Cash on Pickup, Cash on Delivery
- [x] Order confirmation screen and order tracking with a status timeline
- [x] Submit return / authenticity / condition / wrong-item concerns
- [x] Profile editing and sign out

**Admin / Seller**

- [x] Dashboard with sales, order and inventory statistics
- [x] Add / edit / delete products, multiple photos (from the phone or by link)
- [x] Set condition grade, price, category, featured flag
- [x] Active and expired reservations, with force-release
- [x] Order management, status updates, Confirm Pickup / Confirm Delivery
- [x] Cancelling an order returns its unique items to the shop
- [x] Review concerns: change status and reply to the customer
- [x] Sales report (totals, per-day bars, recent sales)
- [x] Inventory report (available / reserved / sold, by category, stock value)

**Security**

- [x] Passwords hashed with bcrypt, never stored or returned in plain text
- [x] JWT authentication; protected and admin-only routes
- [x] New registrations are always customers — the role cannot be chosen by the client
- [x] Prices, delivery fee and totals are computed on the server, never trusted from the app
- [x] Availability re-checked on the server before every reservation and every order
- [x] A sold item can never be ordered twice
- [x] Input validation on both the app (fast feedback) and the server (the real check)
- [x] Customers can only open their own orders, reservations and concerns

---

## 13. What is simulated

Being honest about this is good defence material.

| Feature | Status |
| --- | --- |
| **Digital payment (GCash / Maya / PayPal)** | **Simulated.** No real payment gateway is contacted. The flow (amount → confirm → reference number → paid) matches a real one, and the whole implementation is isolated in `backend/services/paymentService.js`, so a real provider would only replace that one file. |
| Delivery tracking | The seller updates the status manually. There is no courier integration or map. |
| Push notifications / email | Not implemented. Status changes are seen by refreshing the app. |
| Concern attachments | Customers type supporting information as text; photo upload is only implemented for the admin's product photos. |
| Product photos | The sample items use public Unsplash links, so they need internet the first time. Photos uploaded by the admin are stored on your own computer in `backend/uploads/` and work offline. |
| Multi-device sync | Screens refresh when you open them or pull down. There are no live websockets. |

---

## 14. Troubleshooting

**"Cannot reach the server. Check that the backend is running…"**
- Is the backend running? (`cd backend && npm run dev`)
- Are the phone and computer on the **same** Wi-Fi?
- Set `MANUAL_API_HOST` in `frontend/config/api.js` to the IPv4 address from `ipconfig`.
- Windows Firewall may block Node the first time — click **Allow access**, or allow port
  5000 for private networks.
- Test from the phone's browser: `http://<your-ip>:5000/api/health` should return JSON.

**Expo Go says the project is for a different SDK**
Update Expo Go from the Play Store. This project targets **SDK 54**.

**`EADDRINUSE: address already in use :::5000`**
Another server is already running. Close it, or change `PORT` in `backend/.env` and
`API_PORT` in `frontend/config/api.js`.

**The item I reserved disappeared from my cart**
That is the feature working — the 15-minute hold expired and the item went back on sale.

**I want a clean database before presenting**
```bash
cd backend
npm run reset
```

**Product photos are blank**
The sample photos are remote links and need internet on the phone the first time. A
placeholder icon is shown when a photo cannot load; everything else still works.

**Metro cache problems after editing many files**
```bash
cd frontend
npx expo start --clear
```

---

## Notes

* `frontend/` contains its own `.git` folder created by `create-expo-app`. If you want a
  single repository for the whole project, delete `frontend/.git` before running
  `git init` in the project root.
* `backend/data/` and `backend/uploads/` are generated at runtime and are git-ignored.
