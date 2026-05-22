import { supabaseAdmin } from '@/lib/supabase'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export const revalidate = 0

export default async function PetaniPage() {
  const { data: petanis } = await supabaseAdmin
    .from('petani_profil').select('*, users(nama)')
    .eq('status_verifikasi', 'terverifikasi').order('rating', { ascending: false })

  return (
    <>
      <Navbar />
      <div className="bg-green-700 py-14 text-white text-center">
        <h1 className="text-4xl font-bold mb-2">👨‍🌾 Petani Mitra Kami</h1>
        <p className="text-green-200/80">Mereka adalah pahlawan di balik setiap produk segar yang kamu terima</p>
      </div>
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {(petanis || []).map((p: any) => (
            <Link key={p.id} href={`/petani/${p.user_id}`}
              className="card p-6 hover:shadow-md hover:-translate-y-0.5 transition-all flex gap-4 items-start">
              <div className="w-14 h-14 rounded-full bg-green-100 text-green-800 font-bold text-xl flex items-center justify-center shrink-0 border-2 border-green-200">
                {p.nama_toko.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-900 mb-1">{p.nama_toko}</div>
                <div className="text-gray-500 text-sm mb-1">👤 {p.users?.nama}</div>
                {p.lokasi && <div className="text-gray-400 text-xs mb-2">📍 {p.lokasi}</div>}
                <div className="flex gap-3 text-xs text-gray-500">
                  <span className="text-amber-500">★ {p.rating.toFixed(1)}</span>
                  <span>{p.total_ulasan} ulasan</span>
                </div>
                <span className="badge-green mt-2 inline-flex">✓ Terverifikasi</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}
