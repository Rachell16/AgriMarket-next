'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { rupiah } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function DetailProdukPage() {
  const { id } = useParams()
  const router = useRouter()
  const { addItem, items, updateQty } = useCartStore()
  const [produk, setProduk] = useState<any>(null)
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)

  const cartItem = items.find(i => i.id === parseInt(id as string))

  useEffect(() => {
    fetch(`/api/produk/${id}`)
      .then(r => r.json())
      .then(d => { setProduk(d.produk); setLoading(false) })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-16 animate-pulse">
        <div className="h-5 w-48 bg-gray-100 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="h-80 bg-gray-100 rounded-2xl" />
          <div className="space-y-4"><div className="h-8 bg-gray-100 rounded w-3/4" /><div className="h-10 bg-gray-100 rounded w-1/3" /></div>
        </div>
      </div>
      <Footer />
    </>
  )

  if (!produk) return (
    <>
      <Navbar />
      <div className="text-center py-24">
        <div className="text-5xl mb-4">😔</div>
        <p className="text-gray-500 mb-4">Produk tidak ditemukan.</p>
        <Link href="/katalog" className="btn-green">Kembali ke Katalog</Link>
      </div>
      <Footer />
    </>
  )

  const handleAdd = () => {
    addItem({ id: produk.id, nama: produk.nama, harga: produk.harga, satuan: produk.satuan, icon: produk.kategori?.icon || '🌿', petani_id: produk.petani_id, stok: produk.stok })
    toast.success(`${produk.nama} ditambahkan ke keranjang!`)
  }
  const handleBeli = () => { handleAdd(); router.push('/keranjang') }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-green-700 transition-colors">← Kembali</button>
          <span className="text-gray-300">|</span>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Link href="/" className="hover:text-green-600">Beranda</Link>
            <span>/</span>
            <Link href="/katalog" className="hover:text-green-600">Katalog</Link>
            <span>/</span>
            <span className="text-gray-700 truncate max-w-xs">{produk.nama}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Foto produk — tanpa thumbnail palsu */}
          <div>
            <div className="h-80 bg-green-50 rounded-2xl border border-gray-200 flex items-center justify-center overflow-hidden relative">
              {produk.foto_url ? (
                <img src={produk.foto_url} alt={produk.nama} className="w-full h-full object-cover" />
              ) : (
                <span className="text-9xl">{produk.kategori?.icon || '🌿'}</span>
              )}
              {produk.is_organik && (
                <span className="absolute top-3 left-3 badge-green">🌿 Organik</span>
              )}
            </div>
            {produk.is_organik && (
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className="badge-green">🌿 Organik</span>
                <span className="badge-green">📅 Dipanen hari ini</span>
                <span className="badge-green">🚚 Kirim besok pagi</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">{produk.nama}</h1>
            <div className="flex items-center gap-4 mb-4">
              <span className="text-amber-500">{'★'.repeat(Math.floor(produk.rating||0))}{'☆'.repeat(5-Math.ceil(produk.rating||0))} {(produk.rating||0).toFixed(1)}</span>
              <span className="text-gray-400 text-sm">{produk.total_terjual} terjual</span>
              {produk.stok <= 5 && produk.stok > 0 && <span className="badge-red">⚠ Stok menipis!</span>}
              {produk.stok === 0 && <span className="badge-red">Habis</span>}
            </div>
            <div className="text-3xl font-bold text-green-700 mb-6">
              {rupiah(produk.harga)} <span className="text-base font-normal text-gray-400">/ {produk.satuan}</span>
            </div>
            <hr className="border-gray-100 mb-5" />
            <p className="text-gray-600 text-sm leading-relaxed mb-5">{produk.deskripsi || 'Tidak ada deskripsi.'}</p>
            <p className="text-gray-500 text-sm mb-6">📦 Stok tersedia: <strong className="text-gray-900">{produk.stok} {produk.satuan}</strong></p>

            {produk.petani_profil?.[0] && (
              <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex items-center gap-4 mb-6">
                <div className="w-11 h-11 rounded-full bg-green-100 text-green-800 font-bold text-lg flex items-center justify-center shrink-0">
                  {(produk.petani_profil[0].nama_toko||'P').charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                    {produk.petani_profil[0].nama_toko}
                    <span className="badge-green text-[10px]">✓</span>
                  </div>
                  <div className="text-gray-500 text-xs">📍 {produk.petani_profil[0].lokasi} · ★ {produk.petani_profil[0].rating?.toFixed(1)}</div>
                </div>
                <Link href={`/petani/${produk.petani_id}`} className="btn-outline btn-sm text-xs">Lihat Toko</Link>
              </div>
            )}

            {produk.stok > 0 ? (
              <>
                {cartItem ? (
                  <div className="mb-5">
                    <div className="text-sm text-gray-600 font-medium mb-2">Sudah di keranjang:</div>
                    <div className="flex items-center gap-3">
                      <button onClick={() => updateQty(produk.id, Math.max(1, cartItem.jumlah-1))}
                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center font-bold hover:border-green-500">−</button>
                      <span className="w-12 text-center font-bold text-green-700 text-lg">{cartItem.jumlah}</span>
                      <button onClick={() => updateQty(produk.id, Math.min(produk.stok, cartItem.jumlah+1))}
                        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center font-bold hover:border-green-500">+</button>
                      <span className="text-gray-500 text-sm">{produk.satuan}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 mb-5">
                    <span className="text-sm text-gray-600 font-medium">Jumlah:</span>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setQty(q => Math.max(1,q-1))} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center font-bold hover:border-green-500">−</button>
                      <span className="w-12 text-center font-semibold">{qty}</span>
                      <button onClick={() => setQty(q => Math.min(produk.stok,q+1))} className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center font-bold hover:border-green-500">+</button>
                    </div>
                    <span className="text-gray-400 text-xs">Maks: {produk.stok} {produk.satuan}</span>
                  </div>
                )}
                <div className="flex gap-3">
                  <button onClick={handleAdd} className="flex-1 btn-outline py-3 justify-center">🛒 Tambah Keranjang</button>
                  <button onClick={handleBeli} className="flex-1 btn-green py-3 justify-center">⚡ Beli Sekarang</button>
                </div>
              </>
            ) : (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-600 font-medium">Stok habis</div>
            )}
          </div>
        </div>

        <div className="mt-14 pt-10 border-t border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-5">Ulasan Pembeli ({produk.ulasan?.length || 0})</h2>
          {!produk.ulasan?.length ? (
            <p className="text-gray-400 text-sm">Belum ada ulasan untuk produk ini.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {produk.ulasan.map((r: any) => (
                <div key={r.id} className="card p-4">
                  <div className="flex justify-between mb-2">
                    <strong className="text-sm">{r.users?.nama}</strong>
                    <span className="text-amber-500 text-sm">{'★'.repeat(r.rating)}</span>
                  </div>
                  <p className="text-gray-500 text-sm leading-relaxed">{r.komentar}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}
