-- ============================================================
--  AgriMarket — Supabase Schema
--  Jalankan di: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ── USERS ──────────────────────────────────────────────────
create table public.users (
  id          uuid primary key default uuid_generate_v4(),
  nama        text not null,
  email       text not null unique,
  password    text not null,
  role        text not null default 'konsumen' check (role in ('konsumen','petani','admin')),
  telepon     text,
  alamat      text,
  created_at  timestamptz default now()
);

-- ── KATEGORI ────────────────────────────────────────────────
create table public.kategori (
  id    serial primary key,
  nama  text not null,
  icon  text default '🌿',
  slug  text not null unique
);

-- ── PETANI PROFIL ───────────────────────────────────────────
create table public.petani_profil (
  id                  serial primary key,
  user_id             uuid not null unique references public.users(id) on delete cascade,
  nama_toko           text not null,
  deskripsi_toko      text,
  lokasi              text,
  status_verifikasi   text default 'pending' check (status_verifikasi in ('pending','terverifikasi','ditolak')),
  rating              numeric(3,2) default 0,
  total_ulasan        int default 0,
  created_at          timestamptz default now()
);

-- ── PRODUK ──────────────────────────────────────────────────
create table public.produk (
  id            serial primary key,
  petani_id     uuid not null references public.users(id) on delete cascade,
  kategori_id   int not null references public.kategori(id),
  nama          text not null,
  deskripsi     text,
  harga         numeric(12,2) not null,
  satuan        text default 'kg',
  stok          int default 0,
  foto_url      text,
  is_organik    boolean default false,
  is_aktif      boolean default true,
  rating        numeric(3,2) default 0,
  total_terjual int default 0,
  created_at    timestamptz default now()
);

-- ── PESANAN ─────────────────────────────────────────────────
create table public.pesanan (
  id              serial primary key,
  kode_pesanan    text not null unique,
  konsumen_id     uuid not null references public.users(id),
  total_harga     numeric(12,2) not null,
  ongkos_kirim    numeric(12,2) default 0,
  total_bayar     numeric(12,2) not null,
  alamat_kirim    text not null,
  opsi_pengiriman text default 'pagi' check (opsi_pengiriman in ('pagi','siang')),
  status          text default 'menunggu' check (status in ('menunggu','dikonfirmasi','dikirim','selesai','dibatalkan')),
  metode_bayar    text default 'transfer' check (metode_bayar in ('ewallet','transfer','cod','qris')),
  catatan         text,
  created_at      timestamptz default now()
);

-- ── DETAIL PESANAN ──────────────────────────────────────────
create table public.detail_pesanan (
  id          serial primary key,
  pesanan_id  int not null references public.pesanan(id) on delete cascade,
  produk_id   int not null references public.produk(id),
  petani_id   uuid not null references public.users(id),
  nama_produk text not null,
  harga       numeric(12,2) not null,
  jumlah      int not null,
  subtotal    numeric(12,2) not null
);

-- ── KERANJANG ───────────────────────────────────────────────
create table public.keranjang (
  id         serial primary key,
  user_id    uuid not null references public.users(id) on delete cascade,
  produk_id  int not null references public.produk(id) on delete cascade,
  jumlah     int not null default 1,
  created_at timestamptz default now(),
  unique(user_id, produk_id)
);

-- ── ULASAN ──────────────────────────────────────────────────
create table public.ulasan (
  id         serial primary key,
  produk_id  int not null references public.produk(id),
  user_id    uuid not null references public.users(id),
  pesanan_id int not null references public.pesanan(id),
  rating     smallint not null check (rating between 1 and 5),
  komentar   text,
  created_at timestamptz default now(),
  unique(produk_id, user_id, pesanan_id)
);

-- ── ROW LEVEL SECURITY (RLS) ────────────────────────────────
-- Disable RLS untuk semua tabel (kita handle auth di API routes)
alter table public.users           disable row level security;
alter table public.kategori        disable row level security;
alter table public.petani_profil   disable row level security;
alter table public.produk          disable row level security;
alter table public.pesanan         disable row level security;
alter table public.detail_pesanan  disable row level security;
alter table public.keranjang       disable row level security;
alter table public.ulasan          disable row level security;

-- ── SEED DATA ───────────────────────────────────────────────
insert into public.kategori (nama, icon, slug) values
('Sayuran',     '🥦', 'sayuran'),
('Buah-buahan', '🍎', 'buah'),
('Rempah',      '🌿', 'rempah'),
('Umbi-umbian', '🥕', 'umbi'),
('Biji-bijian', '🌽', 'biji'),
('Jamur',       '🍄', 'jamur');

-- Password: "password" (bcrypt hash)
insert into public.users (nama, email, password, role, telepon, alamat) values
('Admin AgriMarket', 'admin@agrimarket.id', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'admin',    '081200000001', 'Jakarta'),
('Pak Budi Santoso', 'budi@petani.id',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'petani',   '081234567890', 'Magelang, Jawa Tengah'),
('Bu Siti Rahayu',   'siti@petani.id',      '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'petani',   '081234567891', 'Bandung, Jawa Barat'),
('Sari Dewi',        'sari@konsumen.id',    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', 'konsumen', '081298765432', 'Depok, Jawa Barat');
