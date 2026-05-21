'use client'
import { useEffect, useState } from 'react'
import { rupiah } from '@/lib/utils'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const statusBadge: Record<string, string> = {
  menunggu: 'badge-amber', dikonfirmasi: 'badge-navy',
  dikirim: 'badge-navy', selesai: 'badge-green', dibatalkan: 'badge-red',
}

export default function DashboardAdminPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const load = () => {
    fetch('/api/admin').then(r => {
      if (r.status === 401) { router.push('/login'); return null }
      return r.json()
    }).then(d => { if (d) { setData(d); setLoading(false) } })
  }
  useEffect(load, [])

  const verifikasi = async (userId: string, status: string) => {
    await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'verifikasi', user_id: userId, status }) })
    toast.success('Status petani diperbarui!')
    load()
  }

  const updateStatus = async (pesananId: number, status: string) => {
    await fetch('/api/admin', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'update_status', pesanan_id: pesananId, status }) })
    toast.success('Status pesanan diperbarui!')
    load()
  }

  if (loading) return (
    <div className="p-4 animate-pulse space-y-3">
      <div className="h-7 bg-gray-100 rounded w-40" />
      <div className="grid grid-cols-2 gap-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}</div>
    </div>
  )

  const { stats, pendingPetani, transaksi } = data || {}

  return (
    <div className="p-4 md:p-8">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Dashboard Admin 🛡️</h1>
        <p className="text-gray-500 text-xs mt-0.5">{new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          ['👥', 'Total Konsumen', stats?.cUser || 0, ''],
          ['👨‍🌾', 'Petani Aktif', stats?.cPetani || 0, stats?.cPend ? `${stats.cPend} pending` : ''],
          ['💳', 'Total Transaksi', stats?.cTx || 0, ''],
          ['🌱', 'Platform', 'AgriMarket', ''],
        ].map(([icon, lbl, val, sub]) => (
          <div key={lbl as string} className="card p-4">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{lbl}</div>
            <div className="text-lg font-bold text-gray-900 mt-0.5">{val}</div>
            {sub && <span className="badge-amber text-[10px] mt-1">{sub}</span>}
          </div>
        ))}
      </div>

      {/* Verifikasi Petani */}
      {pendingPetani?.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="font-bold text-gray-900 text-sm">🔍 Verifikasi Petani Baru</h2>
            <span className="badge-amber">{pendingPetani.length}</span>
          </div>
          <div className="space-y-3">
            {pendingPetani.map((p: any) => (
              <div key={p.user_id} className="card p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-semibold text-gray-900 text-sm">{p.users?.nama}</div>
                    <div className="text-gray-400 text-xs">{p.users?.email}</div>
                    <div className="text-gray-500 text-xs mt-0.5">{p.nama_toko} · {p.lokasi || '—'}</div>
                  </div>
                  <div className="text-gray-400 text-xs">{new Date(p.users?.created_at).toLocaleDateString('id-ID')}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => verifikasi(p.user_id, 'terverifikasi')} className="flex-1 btn-green btn-sm text-xs justify-center">✓ Setujui</button>
                  <button onClick={() => verifikasi(p.user_id, 'ditolak')} className="flex-1 bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg">✗ Tolak</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaksi terbaru */}
      <h2 className="font-bold text-gray-900 text-sm mb-3">📋 Transaksi Terbaru</h2>
      <div className="space-y-3">
        {transaksi?.map((t: any) => (
          <div key={t.id} className="card p-4">
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="font-semibold text-green-700 text-xs">{t.kode_pesanan}</div>
                <div className="text-gray-400 text-xs">{t.users?.nama} · {new Date(t.created_at).toLocaleDateString('id-ID')}</div>
              </div>
              <div className="font-bold text-green-700 text-sm">{rupiah(t.total_bayar)}</div>
            </div>
            <div className="flex items-center justify-between">
              <span className={statusBadge[t.status] || 'badge-gray'}>{t.status}</span>
              <select defaultValue={t.status} onChange={e => updateStatus(t.id, e.target.value)}
                className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:border-green-500">
                {['menunggu','dikonfirmasi','dikirim','selesai','dibatalkan'].map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            {t.bukti_bayar && (
              <a href={t.bukti_bayar} target="_blank" rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                🖼️ Lihat Bukti Bayar
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
