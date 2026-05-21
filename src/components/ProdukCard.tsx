'use client'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { rupiah } from '@/lib/utils'
import toast from 'react-hot-toast'
import { useState } from 'react'

interface Produk {
  id: number; nama: string; harga: number; satuan: string
  icon: string; rating: number; total_terjual: number
  is_organik: boolean; stok: number; petani_id: string
  nama_toko?: string; nama_petani?: string; foto_url?: string | null
}

export default function ProdukCard({ p }: { p: Produk }) {
  const { addItem, updateQty, removeItem, items } = useCartStore()
  const [imgError, setImgError] = useState(false)
  const icon = p.icon || '🌿'
  const cartItem = items.find(i => i.id === p.id)
  const inCart = !!cartItem

  const handleAdd = () => {
    addItem({ id: p.id, nama: p.nama, harga: p.harga, satuan: p.satuan, icon, petani_id: p.petani_id, stok: p.stok })
    toast.success(`${p.nama} ditambahkan!`, { duration: 1500 })
  }

  return (
    <div className="card overflow-hidden hover:shadow-md transition-all duration-200 active:scale-95">
      <Link href={`/produk/${p.id}`}>
        <div className="h-36 sm:h-40 bg-green-50 flex items-center justify-center relative overflow-hidden">
          {p.foto_url && !imgError ? (
            <img src={p.foto_url} alt={p.nama} className="w-full h-full object-cover"
              onError={() => setImgError(true)} />
          ) : (
            <span className="text-4xl sm:text-5xl">{icon}</span>
          )}
          {p.is_organik && (
            <span className="absolute top-1.5 left-1.5 bg-green-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">🌿 Organik</span>
          )}
          {inCart && (
            <span className="absolute top-1.5 right-1.5 bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
              {cartItem.jumlah} 🛒
            </span>
          )}
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/produk/${p.id}`}>
          <div className="font-semibold text-gray-900 text-xs mb-0.5 leading-snug hover:text-green-700 line-clamp-2">{p.nama}</div>
        </Link>
        <div className="text-[10px] text-gray-400 mb-1 truncate">{p.nama_toko || p.nama_petani || '—'}</div>
        <div className="text-[10px] text-amber-500 mb-2">
          {'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5-Math.ceil(p.rating))} {p.rating.toFixed(1)}
          <span className="text-gray-300 ml-1">({p.total_terjual})</span>
        </div>
        <div className="flex items-center justify-between gap-1">
          <div className="min-w-0">
            <span className="font-bold text-green-700 text-sm">{rupiah(p.harga)}</span>
            <span className="text-gray-400 text-[10px]">/{p.satuan}</span>
          </div>
          {inCart ? (
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => cartItem.jumlah <= 1 ? removeItem(p.id) : updateQty(p.id, cartItem.jumlah-1)}
                className="w-6 h-6 rounded-lg bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center">
                {cartItem.jumlah <= 1 ? '🗑' : '−'}
              </button>
              <span className="w-5 text-center text-xs font-bold text-green-700">{cartItem.jumlah}</span>
              <button onClick={() => updateQty(p.id, cartItem.jumlah+1)}
                className="w-6 h-6 rounded-lg bg-green-600 text-white font-bold text-xs flex items-center justify-center">+</button>
            </div>
          ) : (
            <button onClick={handleAdd}
              className="bg-green-600 text-white text-[10px] font-semibold px-2.5 py-1.5 rounded-lg hover:bg-green-700 shrink-0 active:bg-green-800">
              + Keranjang
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
