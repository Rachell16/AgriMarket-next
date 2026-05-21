import { supabaseAdmin } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ProdukCard from '@/components/ProdukCard'
import { notFound } from 'next/navigation'

export default async function ProfilPetaniPage({ params }: { params: { id: string } }) {
  const { data: profil } = await supabaseAdmin
    .from('petani_profil')
    .select('*, users(nama, created_at)')
    .eq('user_id', params.id)
    .eq('status_verifikasi', 'terverifikasi')
    .single()

  if (!profil) notFound()

  // Query produk terpisah
  const { data: produkRaw } = await supabaseAdmin
    .from('produk')
    .select('*, kategori(nama, icon, slug)')
    .eq('petani_id', params.id)
    .eq('is_aktif', true)
    .order('total_terjual', { ascending: false })

  const produk = produkRaw || []
  const totalTerjual = produk.reduce((s: number, p: any) => s + p.total_terjual, 0)

  const mapped = produk.map((p: any) => ({
    ...p,
    icon: p.kategori?.icon || '🌿',
    nama_toko: profil.nama_toko,
    nama_petani: profil.users?.nama,
  }))

  return (
    <>
      <Navbar />
      {/* Header toko */}
      <div className="bg-green-700 py-14 text-white">
        <div className="max-w-6xl mx-auto px-6 flex items-center gap-8">
          <div className="w-20 h-20 rounded-full bg-white/20 border-3 border-white/40 flex items-center justify-center text-3xl font-bold shrink-0">
            {profil.nama_toko.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{profil.nama_toko}</h1>
              <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">✓ Terverifikasi</span>
            </div>
            <div className="text-green-200/80 text-sm mb-2">👤 {profil.users?.nama}</div>
            <div className="flex gap-5 text-sm text-green-200/80 flex-wrap">
              {profil.lokasi && <span>📍 {profil.lokasi}</span>}
              <span>📅 Bergabung {new Date(profil.users?.created_at).toLocaleDateString('id-ID', { month:'long', year:'numeric' })}</span>
              <span>⭐ {profil.rating.toFixed(1)}/5</span>
              <span>💬 {profil.total_ulasan} ulasan</span>
            </div>
          </div>
        </div>
        {profil.deskripsi_toko && (
          <div className="max-w-6xl mx-auto px-6 mt-5 pt-5 border-t border-white/15 text-sm text-green-100/80 max-w-2xl">
            {profil.deskripsi_toko}
          </div>
        )}
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 flex gap-8 py-4 flex-wrap">
          {[['⭐',`${profil.rating.toFixed(1)} / 5`,'Rating'],['💬',profil.total_ulasan,'Ulasan'],['🌿',(produk||[]).length,'Produk Aktif'],['📦',totalTerjual,'Total Terjual']].map(([ic,val,lbl]) => (
            <div key={lbl as string} className="text-center min-w-20">
              <div className="text-xl mb-0.5">{ic}</div>
              <div className="font-bold text-green-700 text-lg">{val}</div>
              <div className="text-gray-400 text-xs">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Produk */}
      <div className="max-w-6xl mx-auto px-6 py-10">
        <h2 className="text-xl font-bold text-gray-900 mb-6">🌿 Produk dari {profil.nama_toko} ({mapped.length})</h2>
        {mapped.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-3">🌱</div>
            <p>Belum ada produk aktif.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {mapped.map((p: any) => <ProdukCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}