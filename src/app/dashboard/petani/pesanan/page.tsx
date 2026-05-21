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
    toast.success('Data pengiriman disimpan!')
    setResiForm(null)
    load()
  }

  if (loading) return (
    <div className="p-4 animate-pulse space-y-3">
      {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 rounded-xl bg-gray-100" />)}
    </div>
  )

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-center gap-3 mb-5">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-green-700">← Kembali</button>
        <h1 className="text-lg font-bold text-gray-900">📦 Kelola Pesanan</h1>
      </div>

      {/* Form input resi */}
      {resiForm && (
        <div className="card p-4 mb-5 border-2 border-green-200 bg-green-50">
          <h2 className="font-bold text-gray-900 text-sm mb-3">🚚 Input Pengiriman</h2>
          <form onSubmit={submitResi} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kurir</label>
              <select className="input" value={resiForm.kurir} onChange={e => setResiForm({...resiForm, kurir: e.target.value})} required>
                <option value="">Pilih kurir...</option>
                {['JNE','J&T','SiCepat','Gosend','Grab Express','Kurir Sendiri'].map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nomor Resi</label>
              <input className="input" type="text" placeholder="cth: JNE12345678"
                value={resiForm.no_resi} onChange={e => setResiForm({...resiForm, no_resi: e.target.value})} required />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="flex-1 btn-green justify-center text-sm">💾 Simpan & Kirim</button>
              <button type="button" onClick={() => setResiForm(null)} className="btn-outline text-sm px-4">Batal</button>
            </div>
          </form>
        </div>
      )}

      {orders.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">📦</div>
          <p className="text-gray-400 text-sm">Belum ada pesanan masuk.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o: any) => (
            <div key={o.id} className="card p-4">
              {/* Header */}
              <div className="flex justify-between items-start mb-3">
                <div>
                  <div className="font-bold text-green-700 text-xs">{o.kode_pesanan}</div>
                  <div className="text-gray-400 text-xs mt-0.5">{new Date(o.created_at).toLocaleDateString('id-ID')} · {o.opsi_pengiriman==='pagi'?'🌅 Pagi':'☀️ Siang'}</div>
                </div>
                <div className="text-right">
                  <span className={statusBadge[o.status]||'badge-gray'}>{o.status}</span>
                  <div className="font-bold text-green-700 text-sm mt-1">{rupiah(o.total_bayar)}</div>
                </div>
              </div>

              {/* Konsumen */}
              <div className="text-sm text-gray-700 mb-2">👤 {o.users?.nama}</div>

              {/* Resi info */}
              {o.kurir && o.no_resi && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs text-blue-700 mb-2">
                  🚚 {o.kurir} · {o.no_resi}
                </div>
              )}

              {/* Bukti bayar */}
              {o.bukti_bayar && (
                <a href={o.bukti_bayar} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mb-2">
                  🖼️ Lihat Bukti Bayar
                </a>
              )}

              {/* Aksi */}
              <div className="flex gap-2 mt-2">
                {o.status === 'menunggu' && <>
                  <button onClick={() => ubahStatus(o.id, 'dikonfirmasi')} className="flex-1 btn-green btn-sm text-xs justify-center">✓ Konfirmasi</button>
                  <button onClick={() => ubahStatus(o.id, 'dibatalkan')} className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg">✗ Tolak</button>
                </>}
                {o.status === 'dikonfirmasi' && (
                  <button onClick={() => setResiForm({ id: o.id, kurir: '', no_resi: '' })}
                    className="flex-1 btn-outline btn-sm text-xs justify-center">🚚 Input Resi</button>
                )}
                {o.status === 'dikirim' && (
                  <button onClick={() => ubahStatus(o.id, 'selesai')} className="flex-1 btn-green btn-sm text-xs justify-center">✅ Selesai</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
