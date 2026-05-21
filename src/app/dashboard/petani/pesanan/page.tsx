'use client'
import { useEffect, useState } from 'react'
import { rupiah } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const statusBadge: Record<string, string> = {
  menunggu: 'badge-amber', dikonfirmasi: 'badge-navy',
  dikirim: 'badge-navy', selesai: 'badge-green', dibatalkan: 'badge-red',
}

export default function PetaniPesananPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resiForm, setResiForm] = useState<{ id: number, kurir: string, no_resi: string } | null>(null)
  const router = useRouter()

  const load = () => {
    fetch('/api/petani/dashboard').then(r => r.json()).then(d => {
      setOrders(d.pesanan || [])
      setLoading(false)
    })
  }
  useEffect(load, [])

  const ubahStatus = async (pesananId: number, status: string) => {
    const res = await fetch('/api/petani/pesanan', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesanan_id: pesananId, status }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); return }
    toast.success('Status diperbarui!')
    load()
  }

  const submitResi = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resiForm) return
    const res = await fetch(`/api/pesanan/${resiForm.id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kurir: resiForm.kurir, no_resi: resiForm.no_resi }),
    })
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); return }
    toast.success('Data pengiriman berhasil disimpan!')
    setResiForm(null)
    load()
  }

  if (loading) return (
    <div className="p-8 animate-pulse space-y-3">
      {Array(4).fill(0).map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-xl" />)}
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-green-700">← Kembali</button>
        <h1 className="text-xl font-bold text-gray-900">📦 Kelola Pesanan</h1>
      </div>

      {/* Form input resi */}
      {resiForm && (
        <div className="card p-5 mb-6 border-2 border-green-200 bg-green-50">
          <h2 className="font-bold text-gray-900 mb-4">🚚 Input Data Pengiriman — Pesanan #{resiForm.id}</h2>
          <form onSubmit={submitResi}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nama Kurir</label>
                <select className="input" value={resiForm.kurir} onChange={e => setResiForm({...resiForm, kurir: e.target.value})} required>
                  <option value="">Pilih kurir...</option>
                  <option value="JNE">JNE</option>
                  <option value="J&T">J&T Express</option>
                  <option value="SiCepat">SiCepat</option>
                  <option value="Gosend">Gosend</option>
                  <option value="Grab">Grab Express</option>
                  <option value="Kurir Sendiri">Kurir Sendiri</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nomor Resi</label>
                <input className="input" type="text" placeholder="cth: JNE12345678"
                  value={resiForm.no_resi} onChange={e => setResiForm({...resiForm, no_resi: e.target.value})} required />
              </div>
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-green">💾 Simpan & Kirim</button>
              <button type="button" onClick={() => setResiForm(null)} className="btn-outline">Batal</button>
            </div>
          </form>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-400">Belum ada pesanan masuk.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              {['Kode Pesanan','Konsumen','Total','Pengiriman','Resi','Bukti Bayar','Status','Aksi'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {orders.map((o: any) => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-green-700 text-xs">{o.kode_pesanan}</div>
                    <div className="text-gray-400 text-xs">{new Date(o.created_at).toLocaleDateString('id-ID')}</div>
                  </td>
                  <td className="px-4 py-3">{o.users?.nama}</td>
                  <td className="px-4 py-3 font-bold text-green-700">{rupiah(o.total_bayar)}</td>
                  <td className="px-4 py-3">{o.opsi_pengiriman === 'pagi' ? '🌅 Pagi' : '☀️ Siang'}</td>
                  <td className="px-4 py-3">
                    {o.kurir && o.no_resi ? (
                      <div>
                        <div className="text-xs font-semibold">{o.kurir}</div>
                        <div className="text-xs text-gray-500">{o.no_resi}</div>
                      </div>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {o.bukti_bayar ? (
                      <a href={o.bukti_bayar} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                        🖼️ Lihat
                      </a>
                    ) : (
                      <span className="text-gray-300 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3"><span className={statusBadge[o.status] || 'badge-gray'}>{o.status}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 flex-wrap">
                      {o.status === 'menunggu' && <>
                        <button onClick={() => ubahStatus(o.id, 'dikonfirmasi')} className="btn-green btn-sm text-xs">✓ Konfirmasi</button>
                        <button onClick={() => ubahStatus(o.id, 'dibatalkan')} className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-red-100">✗</button>
                      </>}
                      {o.status === 'dikonfirmasi' && (
                        <button onClick={() => setResiForm({ id: o.id, kurir: '', no_resi: '' })}
                          className="btn-outline btn-sm text-xs">🚚 Input Resi</button>
                      )}
                      {o.status === 'dikirim' && (
                        <button onClick={() => ubahStatus(o.id, 'selesai')} className="btn-green btn-sm text-xs">✅ Selesai</button>
                      )}
                      {(o.status === 'selesai' || o.status === 'dibatalkan') && (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}