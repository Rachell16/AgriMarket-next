'use client'
import { useEffect, useState } from 'react'
import { rupiah } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import toast from 'react-hot-toast'

const statusBadge: Record<string, string> = {
  menunggu: 'badge-amber', dikonfirmasi: 'badge-navy',
  dikirim: 'badge-navy', selesai: 'badge-green', dibatalkan: 'badge-red',
}
const statusLabel: Record<string, string> = {
  menunggu:     '⏳ Menunggu konfirmasi petani',
  dikonfirmasi: '✅ Dikonfirmasi — sedang disiapkan',
  dikirim:      '🚚 Sedang dalam pengiriman',
  selesai:      '🎉 Pesanan selesai',
  dibatalkan:   '❌ Pesanan dibatalkan',
}

function StarRating({ value, onChange }: { value: number, onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0)
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="text-2xl transition-transform hover:scale-110">
          {star <= (hover || value) ? '⭐' : '☆'}
        </button>
      ))}
      {value > 0 && <span className="text-sm text-gray-500 ml-2 self-center">{value}/5</span>}
    </div>
  )
}

export default function PesananPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const [ulasanForm, setUlasanForm] = useState<{ pesanan_id: number, produk_id: number, nama: string } | null>(null)
  const [rating, setRating] = useState(5)
  const [komentar, setKomentar] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sudahUlasan, setSudahUlasan] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    fetch('/api/pesanan', { credentials: 'include' })
      .then(r => { if (r.status === 401) { router.push('/login'); return null } return r.json() })
      .then(d => { if (d) { setOrders(d.pesanan || []); setLoading(false) } })
      .catch(() => setLoading(false))
  }, [])

  const submitUlasan = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ulasanForm || rating === 0) { toast.error('Pilih rating dulu!'); return }
    setSubmitting(true)
    const res = await fetch('/api/ulasan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ produk_id: ulasanForm.produk_id, pesanan_id: ulasanForm.pesanan_id, rating, komentar }),
    })
    const data = await res.json()
    setSubmitting(false)
    if (!res.ok) { toast.error(data.error); return }
    toast.success('Ulasan berhasil dikirim! ⭐')
    setSudahUlasan(prev => new Set([...prev, `${ulasanForm.pesanan_id}-${ulasanForm.produk_id}`]))
    setUlasanForm(null)
    setRating(5)
    setKomentar('')
  }

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">📦 Pesanan Saya</h1>

        {/* Form ulasan modal */}
        {ulasanForm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-md p-6">
              <h2 className="font-bold text-gray-900 mb-1">⭐ Beri Ulasan</h2>
              <p className="text-gray-500 text-sm mb-4">{ulasanForm.nama}</p>
              <form onSubmit={submitUlasan}>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rating</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Komentar (opsional)</label>
                  <textarea className="input resize-none" rows={3}
                    placeholder="Bagaimana kualitas produk ini?"
                    value={komentar} onChange={e => setKomentar(e.target.value)} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" disabled={submitting} className="flex-1 btn-green justify-center disabled:opacity-60">
                    {submitting ? 'Mengirim...' : '⭐ Kirim Ulasan'}
                  </button>
                  <button type="button" onClick={() => { setUlasanForm(null); setRating(5); setKomentar('') }}
                    className="btn-outline px-5">Batal</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_,i) => <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📦</div>
            <p className="text-gray-500 mb-4">Belum ada pesanan.</p>
            <Link href="/katalog" className="btn-green">Mulai Belanja</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((o: any) => (
              <div key={o.id} className="card overflow-hidden">
                <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded===o.id?null:o.id)}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-green-700 text-sm">{o.kode_pesanan}</div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        {new Date(o.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={statusBadge[o.status]||'badge-gray'}>{o.status}</span>
                      <span className="text-gray-400 text-xs">{expanded===o.id?'▲':'▼'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">{statusLabel[o.status]||o.status}</div>
                    <div className="font-bold text-green-700">{rupiah(o.total_bayar)}</div>
                  </div>
                </div>

                {expanded === o.id && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    {/* Produk */}
                    {o.detail_pesanan?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Produk</div>
                        <div className="space-y-2">
                          {o.detail_pesanan.map((d: any) => {
                            const key = `${o.id}-${d.produk_id}`
                            const sudah = sudahUlasan.has(key)
                            return (
                              <div key={d.id} className="flex items-center justify-between gap-3">
                                <div className="text-sm flex-1">
                                  <span>{d.nama_produk} × {d.jumlah}</span>
                                  <span className="text-gray-400 ml-2">{rupiah(d.subtotal)}</span>
                                </div>
                                {o.status === 'selesai' && (
                                  sudah ? (
                                    <span className="text-xs text-green-600 font-medium">✓ Diulas</span>
                                  ) : (
                                    <button
                                      onClick={() => setUlasanForm({ pesanan_id: o.id, produk_id: d.produk_id, nama: d.nama_produk })}
                                      className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-lg font-semibold hover:bg-amber-100 shrink-0">
                                      ⭐ Beri Ulasan
                                    </button>
                                  )
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {/* Info Pengiriman */}
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Info Pengiriman</div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Opsi</span>
                          <span>{o.opsi_pengiriman==='pagi'?'🌅 Pengiriman Pagi':'☀️ Pengiriman Siang'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Alamat</span>
                          <span className="text-right max-w-xs text-gray-700 text-xs">{o.alamat_kirim}</span>
                        </div>
                        {o.kurir && <div className="flex justify-between"><span className="text-gray-500">Kurir</span><span>{o.kurir}</span></div>}
                        {o.no_resi && (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Nomor Resi</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-green-700 text-xs">{o.no_resi}</span>
                              <button onClick={() => { navigator.clipboard.writeText(o.no_resi); toast.success('Disalin!') }}
                                className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">Salin</button>
                            </div>
                          </div>
                        )}
                        {!o.no_resi && o.status === 'dikonfirmasi' && (
                          <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">⏳ Petani sedang menyiapkan pengiriman</div>
                        )}
                      </div>
                    </div>

                    {/* Rincian Biaya */}
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Rincian Biaya</div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>{rupiah(o.total_harga)}</span></div>
                        <div className="flex justify-between text-gray-500"><span>Ongkir</span><span>{rupiah(o.ongkos_kirim)}</span></div>
                        <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-gray-200">
                          <span>Total</span><span className="text-green-700">{rupiah(o.total_bayar)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Metode Bayar</span>
                      <span className="font-medium uppercase">{o.metode_bayar}</span>
                    </div>

                    {o.bukti_bayar && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700 flex items-center justify-between">
                        <span>✅ Bukti pembayaran sudah dikirim</span>
                        <a href={o.bukti_bayar} target="_blank" rel="noopener noreferrer" className="font-semibold hover:underline">Lihat →</a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}
