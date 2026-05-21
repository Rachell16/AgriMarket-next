import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProdukCard from '@/components/ProdukCard'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'

function hitungScore(produk: any, maxTerjual: number): number {
  const ratingScore  = (produk.rating / 5) * 0.4
  const terjualScore = (produk.total_terjual / (maxTerjual || 1)) * 0.4
  const stokScore    = produk.stok > 0 ? (Math.min(produk.stok, 50) / 50) * 0.2 : 0
  const organikBonus = produk.is_organik ? 0.05 : 0
  return ratingScore + terjualScore + stokScore + organikBonus
}

async function getData() {
  const [{ data: produkRaw }, { data: kategoris }] = await Promise.all([
    supabaseAdmin.from('produk').select('*, kategori(nama,icon,slug)').eq('is_aktif', true).gt('stok', 0).limit(50),
    supabaseAdmin.from('kategori').select('*').order('id'),
  ])

  const list = produkRaw || []
  const maxTerjual = Math.max(...list.map((p: any) => p.total_terjual), 1)

  // AI scoring
  const scored = list
    .map((p: any) => ({ ...p, ai_score: hitungScore(p, maxTerjual) }))
    .sort((a: any, b: any) => b.ai_score - a.ai_score)
    .slice(0, 8)

  const petaniIds = [...new Set(scored.map((p: any) => p.petani_id))]
  let tokoMap: Record<string, string> = {}
  if (petaniIds.length > 0) {
    const [{ data: users }, { data: profils }] = await Promise.all([
      supabaseAdmin.from('users').select('id, nama').in('id', petaniIds as string[]),
      supabaseAdmin.from('petani_profil').select('user_id, nama_toko').in('user_id', petaniIds as string[]),
    ])
    users?.forEach((u: any) => { tokoMap[u.id] = u.nama })
    profils?.forEach((p: any) => { tokoMap[p.user_id] = p.nama_toko })
  }

  return {
    produk: scored.map((p: any) => ({ ...p, icon: p.kategori?.icon || '🌿', nama_toko: tokoMap[p.petani_id] || '' })),
    kategoris: kategoris || []
  }
}

export default async function Home() {
  const { produk, kategoris } = await getData()

  return (
    <>
      <Navbar />
      <main>
        {/* HERO */}
        <section className="bg-green-700 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-end opacity-5 text-[280px] font-bold pr-8 select-none pointer-events-none">Segar</div>
          <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-600/50 border border-green-500/40 rounded-full px-4 py-1.5 text-green-200 text-xs font-semibold mb-5 tracking-wider uppercase">
                🌾 Platform E-Commerce Pertanian
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-white leading-tight mb-4">
                Hasil Panen <span className="text-green-300 italic">Segar</span><br />Langsung dari Petani
              </h1>
              <p className="text-green-100/80 text-lg mb-8 leading-relaxed max-w-xl">
                Beli sayuran, buah, dan rempah segar langsung dari petani lokal terpercaya.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/katalog" className="bg-green-200 text-green-800 font-bold px-7 py-3 rounded-xl hover:bg-white transition-all text-sm">Mulai Belanja →</Link>
                <Link href="/register?role=petani" className="border-2 border-white/40 text-white font-semibold px-7 py-3 rounded-xl hover:bg-white/10 transition-all text-sm">Jadi Petani Mitra</Link>
              </div>
              <div className="flex gap-8 mt-10 pt-8 border-t border-white/15">
                {[['2.800+','Konsumen'],['100+','Petani Mitra'],['15+','Kategori']].map(([num,lbl]) => (
                  <div key={lbl}><div className="text-2xl font-bold text-white">{num}</div><div className="text-green-200/70 text-xs mt-0.5">{lbl}</div></div>
                ))}
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-3">
              {[{icon:'🥕',name:'Wortel Segar Premium',toko:'Kebun Pak Budi',harga:'Rp 8.000/kg'},
                {icon:'🌶️',name:'Cabai Merah Keriting',toko:'Ladang Joko',harga:'Rp 35.000/kg'},
                {icon:'🍅',name:'Tomat Cherry Organik',toko:'Kebun Bu Siti',harga:'Rp 18.000/kg'},
              ].map((item,i) => (
                <div key={i} className="bg-white/8 border border-white/12 rounded-2xl p-4 flex items-center gap-4">
                  <span className="text-4xl">{item.icon}</span>
                  <div className="flex-1"><div className="text-white font-semibold text-sm">{item.name}</div><div className="text-green-200/60 text-xs">{item.toko}</div></div>
                  <div className="text-green-300 font-bold text-sm">{item.harga}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-6">
          {/* Kategori */}
          <section className="py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Kategori Produk</h2>
              <Link href="/katalog" className="text-green-600 font-semibold text-sm hover:text-green-700">Lihat semua →</Link>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link href="/katalog" className="px-5 py-2 rounded-full border-2 border-green-600 bg-green-50 text-green-700 text-sm font-semibold">🌿 Semua</Link>
              {kategoris.map((k: any) => (
                <Link key={k.id} href={`/katalog?kat=${k.slug}`} className="px-5 py-2 rounded-full border-2 border-gray-200 bg-white text-gray-600 text-sm font-medium hover:border-green-600 hover:bg-green-50 hover:text-green-700 transition-all">
                  {k.icon} {k.nama}
                </Link>
              ))}
            </div>
          </section>

          {/* Rekomendasi AI */}
          <section className="pb-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl font-bold text-gray-900">🤖 Rekomendasi Untukmu</h2>
              <Link href="/katalog" className="text-green-600 font-semibold text-sm hover:text-green-700">Lihat semua →</Link>
            </div>
            <p className="text-gray-400 text-xs mb-6 flex items-center gap-1">
              <span>✨</span> Dipilih oleh AI berdasarkan rating, popularitas, dan ketersediaan stok
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {produk.map((p: any) => <ProdukCard key={p.id} p={p} />)}
            </div>
          </section>

          {/* Banner petani */}
          <section className="py-10">
            <div className="bg-green-700 rounded-2xl p-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative overflow-hidden">
              <div className="absolute right-16 text-[140px] opacity-5 select-none">🌾</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Kamu seorang petani? 👨‍🌾</h3>
                <p className="text-green-200/80 text-sm mb-6">Jual hasil panen langsung ke konsumen. Tanpa perantara!</p>
                <Link href="/register?role=petani" className="bg-white text-green-700 font-bold px-6 py-3 rounded-xl hover:bg-green-50 transition-all text-sm inline-block">Daftar Jadi Petani Mitra</Link>
              </div>
              <div className="text-7xl text-center">🌾</div>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  )
}
