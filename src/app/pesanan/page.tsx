'use client'
import { useEffect, useState } from 'react'
import { rupiah } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

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

export default function PesananPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<number | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/pesanan', { credentials: 'include' })
      .then(r => { if (r.status === 401) { router.push('/login'); return null } return r.json() })
      .then(d => { if (d) { setOrders(d.pesanan || []); setLoading(false) } })
      .catch(() => setLoading(false))
  }, [])

  return (
    <>
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">📦 Pesanan Saya</h1>
        {loading ? (
          <div className="space-y-3">{Array(3).fill(0).map((_, i) => <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />)}</div>
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
                <div className="p-5 cursor-pointer" onClick={() => setExpanded(expanded === o.id ? null : o.id)}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-bold text-green-700 text-sm">{o.kode_pesanan}</div>
                      <div className="text-gray-400 text-xs mt-0.5">
                        {new Date(o.created_at).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={statusBadge[o.status] || 'badge-gray'}>{o.status}</span>
                      <span className="text-gray-400 text-xs">{expanded === o.id ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">{statusLabel[o.status] || o.status}</div>
                    <div className="font-bold text-green-700">{rupiah(o.total_bayar)}</div>
                  </div>
                </div>

                {expanded === o.id && (
                  <div className="border-t border-gray-100 p-5 bg-gray-50 space-y-4">
                    {o.detail_pesanan?.length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Produk</div>
                        <div className="space-y-2">
                          {o.detail_pesanan.map((d: any) => (
                            <div key={d.id} className="flex justify-between text-sm">
                              <span>{d.nama_produk} × {d.jumlah}</span>
                              <span className="font-medium">{rupiah(d.subtotal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Info Pengiriman</div>
                      <div className="space-y-1.5 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Opsi</span>
                          <span>{o.opsi_pengiriman === 'pagi' ? '🌅 Pengiriman Pagi' : '☀️ Pengiriman Siang'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Alamat</span>
                          <span className="text-right max-w-xs text-gray-700">{o.alamat_kirim}</span>
                        </div>
                        {o.kurir ? (
                          <div className="flex justify-between">
                            <span className="text-gray-500">Kurir</span>
                            <span className="font-medium">{o.kurir}</span>
                          </div>
                        ) : null}
                        {o.no_resi ? (
                          <div className="flex justify-between items-center">
                            <span className="text-gray-500">Nomor Resi</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-green-700">{o.no_resi}</span>
                              <button onClick={() => { navigator.clipboard.writeText(o.no_resi); }}
                                className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium hover:bg-green-200">Salin</button>
                            </div>
                          </div>
                        ) : o.status === 'dikonfirmasi' ? (
                          <div className="text-xs text-amber-600 bg-amber-50 rounded-lg p-2">⏳ Petani sedang menyiapkan pengiriman</div>
                        ) : null}
                      </div>
                    </div>

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
                        <a href={o.bukti_bayar} target="_blank" rel="noopener noreferrer"
                          className="text-blue-600 font-semibold hover:underline">Lihat →</a>
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
