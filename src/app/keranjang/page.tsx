'use client'
import { useCartStore } from '@/store/cartStore'
import { rupiah } from '@/lib/utils'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function KeranjangPage() {
  const { items, removeItem, updateQty, clearCart, total } = useCartStore()
  const router = useRouter()
  const [form, setForm] = useState({ alamat: '', pengiriman: 'pagi', metode: 'ewallet', catatan: '' })
  const [loading, setLoading] = useState(false)

  const ongkir = form.pengiriman === 'pagi' ? 15000 : 10000
  const grandTotal = total() + ongkir

  const checkout = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!items.length) { toast.error('Keranjang kosong!'); return }
    if (!form.alamat)  { toast.error('Alamat pengiriman wajib diisi!'); return }
    setLoading(true)

    const res = await fetch('/api/pesanan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: items.map(i => ({ produk_id: i.id, petani_id: i.petani_id, nama: i.nama, harga: i.harga, jumlah: i.jumlah })),
        alamat: form.alamat, pengiriman: form.pengiriman, metode: form.metode, catatan: form.catatan,
      }),
    })
    const data = await res.json()
    setLoading(false)

    if (!res.ok) { toast.error(data.error || 'Gagal membuat pesanan'); return }
    clearCart()
    toast.success(`Pesanan ${data.kode} berhasil dibuat! 🎉`)
    // Redirect ke halaman pembayaran
    router.push(`/pembayaran?kode=${data.kode}&total=${grandTotal}&metode=${form.metode}&id=${data.pesanan.id}`)
  }

  return (
    <>
      <Navbar />
      <main className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          🛒 Keranjang Belanja
          <span className="text-gray-400 font-normal text-base ml-2">({items.length} item)</span>
        </h1>

        {items.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🛒</div>
            <p className="text-gray-500 mb-6">Keranjangmu masih kosong.</p>
            <Link href="/katalog" className="btn-green">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map(item => (
                <div key={item.id} className="card p-4 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-xl bg-green-50 flex items-center justify-center text-3xl shrink-0">
                    {item.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{item.nama}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{rupiah(item.harga)}/{item.satuan}</div>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => updateQty(item.id, item.jumlah - 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-sm font-bold hover:border-green-500 transition-colors">−</button>
                      <span className="w-8 text-center text-sm font-semibold">{item.jumlah}</span>
                      <button onClick={() => updateQty(item.id, item.jumlah + 1)}
                        className="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center text-sm font-bold hover:border-green-500 transition-colors">+</button>
                      <span className="text-gray-400 text-xs">{item.satuan}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-green-700 text-base">{rupiah(item.harga * item.jumlah)}</div>
                    <button onClick={() => removeItem(item.id)}
                      className="text-red-400 hover:text-red-600 text-xs mt-1 transition-colors">🗑 Hapus</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary & Checkout */}
            <div className="card p-6 sticky top-20">
              <h2 className="font-bold text-gray-900 text-base mb-5">Ringkasan Pesanan</h2>
              <form onSubmit={checkout} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Alamat Pengiriman</label>
                  <textarea className="input resize-none" rows={3} required
                    value={form.alamat} onChange={e => setForm({ ...form, alamat: e.target.value })}
                    placeholder="Masukkan alamat lengkap..." />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Opsi Pengiriman</label>
                  <div className="space-y-2">
                    {[['pagi','🌅 Pengiriman Pagi','Sebelum 09.00 WIB',15000],['siang','☀️ Pengiriman Siang','10.00–14.00 WIB',10000]].map(([val,lbl,sub,price]) => (
                      <label key={val as string} className={`flex items-center gap-3 border-2 rounded-xl p-3 cursor-pointer transition-all ${form.pengiriman === val ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                        <input type="radio" name="pengiriman" value={val as string} checked={form.pengiriman === val}
                          onChange={e => setForm({ ...form, pengiriman: e.target.value })} className="accent-green-600" />
                        <div className="flex-1">
                          <div className="text-sm font-semibold text-gray-900">{lbl as string}</div>
                          <div className="text-xs text-gray-500">{sub as string} · +{rupiah(price as number)}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Metode Pembayaran</label>
                  <select className="input" value={form.metode} onChange={e => setForm({ ...form, metode: e.target.value })}>
                    <option value="ewallet">💳 E-Wallet</option>
                    <option value="transfer">🏦 Transfer Bank</option>
                    <option value="qris">📱 QRIS</option>
                    <option value="cod">💰 COD</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Catatan (opsional)</label>
                  <input className="input" type="text" placeholder="Pesan untuk penjual..."
                    value={form.catatan} onChange={e => setForm({ ...form, catatan: e.target.value })} />
                </div>

                <hr className="border-gray-100" />
                <div className="space-y-1.5 text-sm text-gray-500">
                  <div className="flex justify-between"><span>Subtotal</span><span className="text-gray-900">{rupiah(total())}</span></div>
                  <div className="flex justify-between"><span>Ongkos kirim</span><span className="text-gray-900">{rupiah(ongkir)}</span></div>
                  <div className="flex justify-between font-bold text-base text-gray-900 pt-2 border-t border-gray-100">
                    <span>Total</span><span className="text-green-700">{rupiah(grandTotal)}</span>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all disabled:opacity-60">
                  {loading ? 'Memproses...' : '💳 Pesan Sekarang'}
                </button>
                <p className="text-center text-xs text-gray-400">🔒 Transaksi aman & terenkripsi</p>
              </form>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
