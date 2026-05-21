'use client'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { rupiah } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Produk {
  id: number; nama: string; harga: number; satuan: string
  icon: string; rating: number; total_terjual: number
  is_organik: boolean; stok: number; petani_id: string
  nama_toko?: string; nama_petani?: string; foto_url?: string | null
}

export default function ProdukCard({ p }: { p: Produk }) {
  const { addItem, removeItem, updateQty, items } = useCartStore()
  const icon = p.icon || '🌿'
  const cartItem = items.find(i => i.id === p.id)
  const inCart = !!cartItem

  const handleAdd = () => {
    addItem({ id: p.id, nama: p.nama, harga: p.harga, satuan: p.satuan, icon, petani_id: p.petani_id, stok: p.stok })
    toast.success(`${p.nama} ditambahkan ke keranjang!`)
  }

  return (
    <div className="card overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
      <Link href={`/produk/${p.id}`}>
        <div className="h-40 bg-green-50 flex items-center justify-center relative overflow-hidden">
          {p.foto_url ? (
            <img src={p.foto_url} alt={p.nama} className="w-full h-full object-cover" />
          ) : (
            <span className="text-5xl">{icon}</span>
          )}
          {p.is_organik && (
            <span className="absolute top-2 left-2 badge-green text-[10px]">🌿 Organik</span>
          )}
          {inCart && (
            <span className="absolute top-2 right-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {cartItem.jumlah} di keranjang
            </span>
          )}
        </div>
      </Link>
      <div className="p-4">
        <Link href={`/produk/${p.id}`}>
          <div className="font-semibold text-gray-900 text-sm mb-1 leading-snug hover:text-green-700 transition-colors">{p.nama}</div>
        </Link>
        <div className="text-xs text-gray-500 mb-1">{p.nama_toko || p.nama_petani || '—'}</div>
        <div className="text-xs text-amber-500 mb-3">
          {'★'.repeat(Math.floor(p.rating))}{'☆'.repeat(5 - Math.ceil(p.rating))} {p.rating.toFixed(1)}
          <span className="text-gray-400 ml-1">({p.total_terjual} terjual)</span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <span className="font-bold text-green-700 text-base">{rupiah(p.harga)}</span>
            <span className="text-gray-400 text-xs">/{p.satuan}</span>
          </div>
          {inCart ? (
            <div className="flex items-center gap-1">
              <button onClick={() => cartItem.jumlah <= 1 ? removeItem(p.id) : updateQty(p.id, cartItem.jumlah - 1)}
                className="w-7 h-7 rounded-lg bg-green-100 text-green-700 font-bold text-sm flex items-center justify-center hover:bg-green-200 transition-colors">
                {cartItem.jumlah <= 1 ? '🗑' : '−'}
              </button>
              <span className="w-6 text-center text-sm font-bold text-green-700">{cartItem.jumlah}</span>
              <button onClick={() => updateQty(p.id, cartItem.jumlah + 1)}
                className="w-7 h-7 rounded-lg bg-green-600 text-white font-bold text-sm flex items-center justify-center hover:bg-green-700 transition-colors">
                +
              </button>
            </div>
          ) : (
            <button onClick={handleAdd}
              className="bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors">
              + Keranjang
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
