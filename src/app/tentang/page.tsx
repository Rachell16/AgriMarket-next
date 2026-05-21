import { supabaseAdmin } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

async function getData() {
  const { data: petanis } = await supabaseAdmin
    .from('petani_profil')
    .select('*, users(nama)')
    .eq('status_verifikasi', 'terverifikasi')
    .order('rating', { ascending: false })
  return { petanis: petanis || [] }
}

export default async function TentangPage() {
  const { petanis } = await getData()

  return (
    <>
      <Navbar />
      <main>
        {/* Hero */}
        <div className="bg-green-700 py-20 text-center text-white relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center opacity-5 text-[200px] select-none pointer-events-none">🌾</div>
          <div className="relative z-10">
            <div className="text-green-300 text-xs font-bold uppercase tracking-widest mb-3">Tentang Kami</div>
            <h1 className="text-5xl font-bold mb-4">AgriMarket</h1>
            <p className="text-green-100/80 text-lg max-w-xl mx-auto leading-relaxed px-6">
              Platform e-commerce yang menghubungkan petani lokal langsung dengan konsumen — tanpa perantara, lebih segar, lebih adil.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[['🧑‍💼','2.800+','Konsumen Aktif'],['👨‍🌾',petanis.length,'Petani Terverifikasi'],['🌿','15+','Kategori Produk'],['📦','580+','Pesanan Selesai']].map(([ic,val,lbl]) => (
              <div key={lbl as string}>
                <div className="text-3xl mb-2">{ic}</div>
                <div className="text-3xl font-bold text-green-700 mb-1">{val}</div>
                <div className="text-gray-500 text-sm">{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">
          {/* Misi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="text-green-600 text-xs font-bold uppercase tracking-widest mb-3">Kenapa AgriMarket?</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-5 leading-tight">Memutus Rantai Perantara, Menyejahterakan <span className="text-green-600">Petani</span></h2>
              <p className="text-gray-600 leading-relaxed mb-4">Selama ini petani menjual hasil panen ke tengkulak dengan harga rendah, sementara konsumen membeli di pasar dengan harga tinggi. AgriMarket hadir untuk memutus rantai ini.</p>
              <p className="text-gray-600 leading-relaxed">Petani mendapat harga yang lebih adil, dan konsumen mendapat produk yang lebih segar langsung dari sumbernya.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[['🌱','Langsung dari Petani','Produk dikirim langsung dari kebun, tanpa perantara'],
                ['⚡','Pengiriman Cepat','Pesan malam, tiba besok pagi sebelum jam 09.00'],
                ['✅','Petani Terverifikasi','Semua petani mitra telah melalui verifikasi admin'],
                ['🔒','Transaksi Aman','Pembayaran aman dengan berbagai metode terpercaya'],
              ].map(([ic,j,d]) => (
                <div key={j as string} className="card p-5 text-center">
                  <div className="text-3xl mb-3">{ic}</div>
                  <div className="font-semibold text-gray-900 text-sm mb-2">{j}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Cara kerja */}
          <div className="text-center">
            <div className="text-green-600 text-xs font-bold uppercase tracking-widest mb-3">Cara Kerja</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-12">Mudah dalam 4 Langkah</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[['1','🔍','Cari Produk','Telusuri katalog produk segar dari petani lokal'],
                ['2','🛒','Tambah Keranjang','Pilih produk dan jumlah yang kamu butuhkan'],
                ['3','💳','Bayar','Checkout dengan metode pembayaran favoritmu'],
                ['4','📦','Terima','Produk segar tiba besok pagi!'],
              ].map(([n,ic,j,d]) => (
                <div key={n as string} className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-100 flex items-center justify-center text-xl font-bold text-green-700 mb-4">{n}</div>
                  <div className="text-3xl mb-3">{ic}</div>
                  <div className="font-semibold text-gray-900 text-sm mb-2">{j}</div>
                  <div className="text-gray-500 text-xs leading-relaxed">{d}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Petani mitra */}
          {petanis.length > 0 && (
            <div>
              <div className="text-center mb-10">
                <div className="text-green-600 text-xs font-bold uppercase tracking-widest mb-3">Petani Mitra</div>
                <h2 className="text-3xl font-bold text-gray-900">Pahlawan di Balik Setiap Produk Segar</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {petanis.map((p: any) => (
                  <Link key={p.id} href={`/petani/${p.user_id}`}
                    className="card p-6 hover:shadow-md transition-shadow flex gap-4 items-start">
                    <div className="w-12 h-12 rounded-full bg-green-100 text-green-800 font-bold text-lg flex items-center justify-center shrink-0">
                      {p.nama_toko.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 mb-1">{p.nama_toko}</div>
                      <div className="text-gray-500 text-sm mb-1">👤 {p.users?.nama}</div>
                      {p.lokasi && <div className="text-gray-400 text-xs mb-2">📍 {p.lokasi}</div>}
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-amber-500">★ {p.rating.toFixed(1)}</span>
                        <span className="text-gray-400">{p.total_ulasan} ulasan</span>
                      </div>
                      <span className="badge-green mt-2 inline-flex">✓ Terverifikasi</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-green-700 rounded-2xl p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative overflow-hidden">
            <div className="absolute right-16 text-[140px] opacity-5 select-none">🌾</div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-3">Siap bergabung? 🤝</h3>
              <p className="text-green-200/80 text-sm mb-6 leading-relaxed">Daftar sekarang sebagai konsumen atau petani mitra AgriMarket.</p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/register" className="bg-white text-green-700 font-bold px-6 py-2.5 rounded-xl hover:bg-green-50 transition-all text-sm">Daftar Konsumen</Link>
                <Link href="/register?role=petani" className="border-2 border-white/40 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-white/10 transition-all text-sm">Daftar Petani</Link>
              </div>
            </div>
            <div className="text-7xl text-center">🤝</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
