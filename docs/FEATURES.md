# CoffeeShop — Dokumentasi Fitur Lengkap

> Toko online kopi & brewing gear. Frontend: **Next.js 16 (App Router)**, Backend: **Laravel 11 + Sanctum**, tema **espresso `#2f1b13`, caramel `#d49a55` & cream `#fbf6ef`** (buyer-facing).

---

## 1. Ringkasan Arsitektur

| Komponen | Teknologi | Port |
|---|---|---|
| Frontend | Next.js 16, React 19, Tailwind v4, Zustand, framer-motion, axios | `3000` |
| Backend | Laravel 11, Sanctum, Midtrans, Biteship | `8000` |
| Database | SQLite / MySQL (Laravel default) | — |

**Alur dasar:** user login → keranjang (server-side) → checkout (isi alamat 4-level wilayah) → order dibuat → pembayaran Midtrans Snap (sandbox) → admin kelola status & nomor resi →  user lacak di halaman pesanan.

**Variabel env frontend** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=SB-Mid-client-...
```
**Config backend** (`config/services.php`): `midtrans.server_key`, `midtrans.client_key`, `midtrans.is_production`, `biteship.api_key`, `biteship.base_url`.

---

## 2. Autentikasi & Role (Fitur Auth)

Backend: `Api/AuthController` — Frontend: `/login`, `/register`, `store/auth.ts`.

| Endpoint | Method | Deskripsi |
|---|---|---|
| `/api/auth/register` | POST | Daftar. Validasi: name, email unik, password min 8 + konfirmasi (`confirmed`). Auto-dibuatkan **cart kosong**. |
| `/api/auth/login` | POST | Login via `Auth::attempt`. Error: *"The provided credentials are incorrect."* |
| `/api/auth/me` | GET | Mengembalikan user (termasuk `default_address`). |
| `/api/auth/logout` | POST | Hapus access token Sanctum. |

- **Role user:** `buyer` (default) / `admin`. Dienum di kolom `users.role`.
- **Auth token:** Sanctum Bearer token. Frontend simpan `token` di `localStorage`, diinject lewat axios interceptor (`lib/api.ts`).
- **Response interceptor:** 401 → hapus token + redirect `/login`.
- **Guarding UI:** `store/auth.ts` (`isAdmin()`), admin layout guard — redirect ke `/login` jika bukan admin.
- **Admin API guard:** `AdminMiddleware.php` — role selain `admin` mendapat `403 Forbidden`.
- **Akun default (seeder):**

| Email | Password | Role |
|---|---|---|
| admin@coffeeshop.com | password | admin |
| buyer@coffeeshop.com | password | buyer |

Login admin diarahkan ke `/admin`, buyer ke home.

---

## 3. Katalog Produk & Kategori (Fitur Katalog)

**Buyer-facing** (`Api/ProductController`, `Api/CategoryController`) — **public**, tanpa login.

### 3.1 Produk
- `GET /api/products` — daftar. Filter: `category_id`, `search` (like nama), paginasi **12/halaman**, hanya `is_active`.
- `GET /api/products/{slug}` — detail produk aktif.
- Skema: `name`, `slug` (unik), `description`, `price` (decimal), `stock`, `weight` (gram), `image` + `images[]`, `is_active`.
- Gambar: `image_url` accessor otomatis (`storage/...`).

### 3.2 Kategori
- `GET /api/categories` — semua kategori + `products_count`.
- `GET /api/categories/{slug}` — kategori + produknya.

### 3.3 UI
- **Homepage:** hero coffee (ilustrasi CSS: coffee machine, bean bag, kettle, pour-over dengan steam), strip manfaat (Fast Response/Track Order/Store Location/Help Center), "Kategori Populer", "Produk Unggulan" (8 item), card dengan rating + badge "Terlaris", tombol Tambah dengan **fly-to-cart animation** (`components/cart-animation.tsx`, butuh `id="cart-icon"` di navbar).
- Tema buyer coffee: heading memakai `font-display` (Georgia/serif), palet espresso/caramel/cream pada `app/globals.css` (var `--color-navy`, `--color-sun`, `--color-primary`, dan gray scale crema). Admin panel tetap memakai tema terpisah.
- **Halaman produk** (`/products`): sidebar filter (search + kategori toggle), paginasi dengan ellipsis, URL sync (`router.replace`) agar filter bisa dibagikan, card produk, empty state.
- **Detail produk** (`/products/[slug]`): gambar, indikator stok live, quantity stepper (min 1, max stock), tombol **Tambah** (animasi checkmark "Ditambahkan!") dan **Beli Sekarang** (→ `/cart`).

### 3.4 Pembatalan `is_active`
`scopeActive()` — `is_active=false` tidak muncul di katalog, tapi tetap di admin.

---

## 4. Keranjang (Fitur Cart)

Backend: `Api/CartController` (auth Sanctum) — **server-side cart** (bukan localStorage).

| Endpoint | Method | Keterangan |
|---|---|---|
| `/api/cart` | GET | Isi cart + product + category. |
| `/api/cart/add` | POST | `product_id`, `quantity>=1`. Jika sudah ada → **naikkan quantity**. |
| `/api/cart/{id}` | PUT | Ubah quantity. Jika `quantity < 1` → **hapus item**. |
| `/api/cart/{id}` | DELETE | Hapus item. |
| `/api/cart` | DELETE | Kosongkan seluruh cart. |

- Cart otomatis dibuat per user (`cart` relasi `hasOne`, `firstOrCreate` saat pakai; dan otomatis saat register).
- Store `store/cart.ts`: `fetchCart/addItem/updateItem/removeItem/clearCart` + selector `itemCount()`, `total()` (Σ price×qty).
- UI `/cart`: stepper qty, hapus dengan animasi (AnimatePresence), ringkasan sticky, tombol "Lanjutkan ke Pembayaran".
- Jika cart kosong → tombol "Mulai Belanja".

---

## 5. Checkout & Alamat (Fitur Alamat 1x / Default Address)

Backend: `Api/OrderController@store` — Frontend: `/checkout`.

### 5.1 Alamat tersimpan sekali di Profil (fitur utama)
- `users.default_address` (JSON) tersimpan di **profil** user.
- **saat save profil** (`PUT /profile`) → `default_address` + kode wilayah disimpan; juga disinkron ke kolom `address`, `city`, `province`, `postal_code`.
- **saat checkout** → alamat otomatis terisi; toggle dropdown wilayah (4 level + cascade).
- **saat checkout submit** → backend menyimpan alamat yang dipakai ke `default_address` kembali (otomatis update).
- Jadi colo: pasang alamat sekali di profile → checkout otomatis isi berikutnya.
- `default_address` berisi: `name, phone, address, province, regency, district, village, city ("district, regency"), postal_code` + kode wilayah `*_code`.

### 5.2 4-Level Dropdown Wilayah (Kemendagri)
API proxy ke wilayah: `backend/Api/WilayahController.php` (proxy dari `wilayah.id`, public):

| Endpoint | Mengembalikan |
|---|---|
| `/api/wilayah/provinces` | daftar provinsi `{code,name}` |
| `/api/wilayah/regencies/{code}` | kabupaten/kota dgn kode induk |
| `/api/wilayah/districts/{code}` | kecamatan |
| `/api/wilayah/villages/{code}` | kelurahan/desa |

- Frontend `/checkout`: Provinsi → Kab/Kota → Kecamatan → Kelurahan; setiap dropdown hanya aktif ketika induk dipilih; label "Memuat...".
- Kode wilayah = **kode Kemendagri** (mis. `32`=Jawa Barat, `32.73`=Kota Bandung, `32.73.02`=Coblong, `32.73.02.1004`=Dago). JANGAN gunakan kode palsu/placeholder.
- Kode ini juga dipakai untuk request ongkir Biteship (`destination_area_id`).

### 5.3 Auto-fill alamat di checkout
- Jika `user.default_address` punya 4 kode wilayah lengkap:
  1. isi nama/telepon/alamat/provinsi/kode pos dari default address;
  2. cascade fetch regency → district → village sesuai kode;
  3. auto-fetch ongkir.
- Guard `appliedDefaultRef` memastikan hanya diterapkan sekali dan berhasil berulang (StrictMode-safe: penanda di-set setelah chain async selesai di `finally`).

### 5.4 Validasi saat submit
- `shipping_address` (name, phone, address, city, province + postal_code) dan `shipping_courier`, `shipping_service`, `shipping_cost` **wajib**.
- Frontend memvalidasi kelengkapan 4-level + alamat, jika tidak lengkap muncul pesan "Mohon lengkapi alamat pengiriman."
- Nama tampilan region diresolve server-side (memilih nama dari daftar hasil fetch) sebelum kirim.

---

## 6. Pecah belah: & Pengiriman (Fitur Shipping / Ongkir)

Backend: `Api/ShippingController` (proxy Biteship, auth Sanctum).

| Endpoint | Method | Deskripsi |
|---|---|---|
| `/api/shipping/rates` | POST | body: `origin_area_id`, `destination_area_id`, `weight`, `couriers`, `jne,tiki,pos`. → `Authorization: Bearer BITESHIP_API_KEY`. Jika key kosong/placeholder → error + `pricing: []`. |
| `/api/shipping/track/{awb}/{courier}` | GET | Lacak no. resi via Biteship. |

- Berat dihitung client: `Σ (product.weight × quantity)` (default 1000 g).
- Checkout memanggil `/shipping/rates` dengan `destination_postal_code` + `destination_area_id` (village_code) dan `origin_area_id` dari config `BITESHIP_ORIGIN_AREA_ID` (bukan hardcoded di frontend).
- Backend me-resolve `destination_area_id` Biteship dari `destination_postal_code` via `/v1/maps/areas` (cache 24 jam); bila gagal → error + `pricing: []`.
- Request rates wajib memuat array `items` (name/value/weight/quantity) — tanpa ini Biteship mengembalikan `400`.
- Jika `pricing` ada → render sebagai pilihan kurir (radio). Jika kosong/error → **fallback hardcoded `FALLBACK_SHIPPING`** (JNE REG Rp 25.000, JNE YES Rp 45.000, TIKI REG Rp 22.000, POS Kilat Rp 20.000) + badge amber "Estimasi".
- **Ongkir dipakai dari client** (hasil rate pada checkout); server hanya percaya nilai numeric yang dikirim (tidak menghitung sendiri jarak/berat).

---

## 6. Pesanan & Nomor Order (Fitkur Order)

Backend: `Api/OrderController` (auth).

| Endpoint | Keterangan |
|---|---|
| `GET /api/orders` | Orders user, paginasi 10, `orderItems` di-load. |
| `GET /api/orders/{orderNumber}` | Detail order user berdasar `order_number`. |
| `POST /api/orders` | Buat order (checkout). |

### 6.1 Nomor Order
Format: `'ORD-' . strtoupper(uniqid())` → mis. `ORD-6752AB1CD3EF0`. UNIQUE. Dipakai juga sebagai `midtrans_order_id`.

### 6.2 Kolom penting
- `status` order (enum): `pending`, `paid`, `processing`, `shipped`, `delivered`, `cancelled`.
- `payment_status` (enum): `pending`, `success`, `failed`, `expired`.
- `shipping_awb`, `shipping_tracking`, `shipping_courier`, `shipping_service`.
- `shipping_address` (JSON snapshot alamat), `notes`, `total`, `shipping_cost`, `midtrans_snap_token`.

### 6.3 Business Logic `store`
1. Cart tidak boleh kosong (400 "Cart is empty").
2. Simpan alamat ke `user.default_address` (fitting untuk dipakai selanjutnya).
3. `subtotal` = Σ (price × qty); `total` = subtotal + `shipping_cost` (tanpa diskon/pajak).
4. Buat Order + **snapshot `order_items`** (name, price, quantity, subtotal) → **decrement stok** tiap `product.stock`.
5. Kosongkan cart.
6. Generate Midtrans **Snap token** (lihat Bagian 7), simpan `midtrans_snap_token` + `midtrans_order_id`.
7. Response `201`: `{order, order_number, midtrans_snap_token}`.

### 6.4 Status Mapping (Frontend)
| Status | Label | Warna |
|---|---|---|
| pending | Menunggu Pembayaran | kuning |
| paid | Dibayar | biru |
| processing | Diproses | ungu |
| shipped | Dikirim | oranye |
| delivered | Terkirim | hijau |
| cancelled | Dibatalkan | merah |
| expired | Kadaluarsa | abu-abu |

---

## 7. Pembayaran Midtrans (Fitur Payment)

Backend: `MidtransController` — Frontend: `/payment/[orderNumber]`.

### 7.1 Snap Token dari order
Pada `POST /orders`, backend memanggil `Midtrans\Snap::getSnapToken()`:
- `transaction_details.order_id = order_number` (mis. `ORD-...`).
- `gross_amount = total order`.
- `customer_details` = nama, email, telepon buyer.
- Hasil `snap_token` dikirim ke frontend + disimpan di `midtrans_snap_token`.

### 7.2 Frontend pada halaman payment
- Load script sandbox `https://app.sandbox.midtrans.com/snap/snap.js` dengan `data-client-key` dari `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY`.
- `window.snap.pay(...)` keseluruhan: `onSuccess` (optimistik: mark as paid + redirect `/orders`), `onPending`, `onError`, `onClose`.
- **Sukses authoritative** lewat webhook/callback backend (frontend hanya optimistik).
- **Tombol "Simulasi Pembayaran Berhasil"** (dev/test) yang POST `/midtrans/callback` dengan `order_id` + `transaction_status="settlement"`.

### 7.3 Server Config
`config/services.php`:
```php
'midtrans' => [
    'server_key'    => env('MIDTRANS_SERVER_KEY'),
    'client_key'    => env('MIDTRANS_CLIENT_KEY'),
    'is_production' => env('MIDTRANS_IS_PRODUCTION', false),
],
```

### 7.4 Callback Webhook (`POST /api/midtrans/callback` — PUBLIC)
Cari order via `order_id` (= `order_number`). Mapping `transaction_status`:

| Midtrans status | Efek |
|---|---|
| `settlement`, `capture` | `payment_status='success'`, `status='paid'` |
| `pending` | `payment_status='pending'` |
| `deny`, `cancel`, `expire` | `payment_status='failed'` |
| `refund` | `status='cancelled'` |

Selalu return `200 {message: 'OK'}`.

---

## 8. Tracking / Nomor Resi (AWB)

### 8.1 Set nominal pada admin
- Backend `Admin/OrderController@updateStatus`: jika status = `shipped` dan `shipping_awb` kosong → **422**: *"Nomor resi wajib diisi saat status menjadi shipped."*
- Saat valid, `shipping_awb` di-save (trim).

### 8.2 Lihat di halaman order (buyer)
- `/orders/[orderNumber]`: jika AWB ada, tampil badge oranye + link **"Lacak dengan Google"** → `https://www.google.com/search?q={awb}` (tab baru).
- Juga: status, payment pill, tombol "Bayar Sekarang" (jika pending), "Refresh Status".

### 8.3 Notes
- Tidak ada tracker khusus per-kurir (selalu Google unggul search by AWB).
- `POST /payment` untuk proses pembayaran; status otomatis di-update lewat callback Midtrans.

---

## 9. Admin Panel (/admin) (Fitur Admin)

Syarat: user `role = admin` (403 selain itu). Layout sodium + slide-over + toast.

### 9.1 Dashboard (`/admin`)
Data dari `GET /api/admin/dashboard`:
- Stat: Total Products, Total Orders, **Total Revenue** (`payment_status='success'`), Orders by Status (groupBy).
- Tabel Recent Orders (Order #, Customer, Total, Status, Date).

### 9.2 Products (`/admin/products`)
- Tabel: thumbnail, nama, kategori, harga, stok (merah bila <10), **toggle is_active** (optimistic + toast).
- Filter: search + kategori.
- **SlideOver** untuk create/edit:
  - Name, Category, Description, Price/Stock/Weight, upload image (1) + gallery, toggle active.
  - Salugot otomatis `Str::slug(namealpha)`.
  - Multipart `FormData` (update memakai `_method: PUT`).
- Hapus: confirm + hapus file image dari disk.
- Backend `Admin/ProductController`: validasi `image` (jpeg/png/jpg/gif/webp, max 2MB) & `images.*`; path `products/`.

### 9.3 Categories (`/admin/categories`)
- Tabel: nama, slug, products_count.
- **SlideOver** create/edit (input single "Category Name").
- Hapus: confirm; pesan error "Data masih dipakai produk lain" jika masih direferensikan (FK cascade → sebenarnya produk ikut terhapus; note: kiriman error ditampilkan dari message API).

### 9.4 Orders (`/admin/orders`)
- Filter by status. Tabel: order #, customer, total, **status select inline**.
- **inline status change** (bukan `shipped`) langsung `PUT /admin/orders/{id}/status`.
- Dipilih `shipped` → **buka SlideOver** detail (wajib isi AWB).
- **SlideOver detail** (lebar max-w-2xl):
  - Status selector + error inline, **input AWB (oranye)** + tombol **"Simpan Resi & Kirim"** (muncul hanya saat `shipped`).
  - Customer card, Shipping Address card, Payment & Shipping info, AWB badge, Order Items list, Notes.
- Backend `Admin/OrderController`:
  - `PUT /api/admin/orders/{id}/status` — body `{status, shipping_awb?}`. Status harus `in:pending,paid,processing,shipped,delivered,cancelled`.
  - Validasi AWB saat shipped; simpan pada order.
  - Tidak ada guard transisi ketat (admin dapat set status apa saja; AWB wajib saat `shipped`).

---

## 10. Database Schema (Ringkasan)

### `users`
`id` PK · `name` · `email` (unique) · `role` (enum buyer/admin, default buyer) · `password` · `phone` · `address` (text) · `city` · `province` · `postal_code` (10) · `default_address` (json) · timestamps

### `categories`
`id` · `name` · `slug` (unique) · `image` · timestamps

### `products`
`id` · `category_id` (FK cascade) · `name` · `slug` (unique) · `description` · `price` decimal(12,2) · `stock` · `weight` (gram, default 1000) · `image` · `images` (json) · `is_active` bool · timestamps

### `carts`
`id` · `user_id` (FK cascade, 1:1) · timestamps

### `cart_items`
`id` · `cart_id` (FK cascade) · `product_id` (FK cascade) · `quantity` · timestamps

### `orders`
`id` · `user_id` (FK cascade) · `order_number` (unique) · `status` (enum: pending/paid/processing/shipped/delivered/cancelled) · `total` decimal · `shipping_cost` decimal · `shipping_courier` · `shipping_service` · `shipping_awb` · `shipping_tracking` · `payment_method` · `payment_status` (enum pending/success/failed/expired) · `midtrans_snap_token` · `midtrans_order_id` · `shipping_address` (json) · `notes` · timestamps

### `order_items`
`id` · `order_id` (FK cascade) · `product_id` (FK cascade) · `name` (snapshot) · `price` (snapshot price) · `quantity` · `subtotal` · timestamps

---

## 11. Flow Alur Pengguna (End-to-End)

### Buyer
1. Jelajahi katalog (home/products/detail).
2. Login/registrasi → auto cart.
3. Tambah produk ke cart (animasi fly-to-cart).
4. `/cart` → "Lanjutkan ke Pembayaran" → `/checkout`.
5. Checkout: alamat diisi otomatis dari `default_address` (atau isi manual 4-level wilayah) → pilih kurir/ongkir → submit.
6. `/payment/{order}` → bayar via Midtrans Snap (atau simulasi). Callback mengubah `paid`.
7. Cek daftar order `/orders` & detail `/orders/{orderNumber}`.
8. Saat admin men-Shop `shipped` dengan AWB, buyer melihat badge "Lacak dengan Google".

### Admin
1. Login admin → `/admin`.
2. Dashboard monitoring.
3. Kelola produk/kategori (slide-over), toggle status produk.
4. Kelola order: ubah status, input AWB saat "shipped", tandai delivered/cancelled.

---

## 11. Panduan Menjalankan

```bash
# Backend (Laravel)
cd backend
composer install
cp .env.example .env # atur DB + kunci Midtrans/Biteship
php artisan migrate --seed   # seeder: AdminUser + 10 kategori + 32 produk
php artisan storage:link
php artisan serve

# Frontend (Next.js)
cd frontend
npm install
cp .env.local.example .env.local # NEXT_PUBLIC_API_URL + MIDTRANS client key
npm run dev -- -p 3000
```

---

## 12. Testing & SEO Notes

- Tidak ada test suite backend/frontend terkonfigurasi. Bisa menambah Laravel: `php artisan test` (Framework + Pester). Frontend bisa pakai Vitest/Jest bila ditambahkan.
- Halaman `app/checkout`, `app/cart` tidak mengset dynamic; sebagian besar halaman dihydrate client-side. Root layout ada metadata global.
- Komponen yang dipakai bersama: Toast `components/ui/toast.tsx`, SlideOver `components/ui/slide-over.tsx`, Spinner `components/spinner.tsx`, CartAnimation `components/cart-animation.tsx`, Brand `components/brand.tsx`.

---

## 13. Catatan Penting / Known Issues

1. **Origin area Biteship** — diambil dari env/config `BITESHIP_ORIGIN_AREA_ID` (saat ini Gambir, Jakarta); atur sesuai kota toko agar rate akurat.
2. **Callback payment success** — frontend optimistic; kepastian dari webhook Midtrans.
3. **Admin categories delete** — FK cascade akan menghapus produk terkait; pastikan konfirmasi UI menjelaskan hal ini.
4. **Kode wilayah** harus format Kemendagri penuh (penjelasan pada bagian Checkout).
5. **Images** — `image_url` accessor; pastikan `php artisan storage:link` sudah jalan agar gambar tampil.