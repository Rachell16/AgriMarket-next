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
      if (r.status === 401) { router.push('/login'); return }
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
    <div className="p-10 animate-pulse space-y-4">
      <div className="h-8 bg-gray-100 rounded w-48" />
      <div className="grid grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}</div>
    </div>
  )

  const { stats, pendingPetani, transaksi } = data || {}

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin 🛡️</h1>
        <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ['👥', 'Total Konsumen', stats?.cUser || 0, ''],
          ['👨‍🌾', 'Petani Aktif', stats?.cPetani || 0, stats?.cPend ? `${stats.cPend} pending` : ''],
          ['💳', 'Total Transaksi', stats?.cTx || 0, ''],
          ['💰', 'Platform', 'AgriMarket', ''],
        ].map(([icon, lbl, val, sub]) => (
          <div key={lbl as string} className="card p-5">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{lbl}</div>
            <div className="text-xl font-bold text-gray-900">{val}</div>
            {sub && <span className="badge-amber text-[10px] mt-1">{sub}</span>}
          </div>
        ))}
      </div>

      {/* Verifikasi Petani */}
      {pendingPetani?.length > 0 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="font-bold text-gray-900">🔍 Verifikasi Petani Baru</h2>
            <span className="badge-amber">{pendingPetani.length} menunggu</span>
          </div>
          <div className="card overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Petani</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Nama Toko</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Lokasi</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Tgl Daftar</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr></thead>
              <tbody>
                {pendingPetani.map((p: any) => (
                  <tr key={p.user_id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-semibold">{p.users?.nama}</div>
                      <div className="text-gray-400 text-xs">{p.users?.email}</div>
                    </td>
                    <td className="px-4 py-3">{p.nama_toko}</td>
                    <td className="px-4 py-3 text-gray-500">{p.lokasi || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(p.users?.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => verifikasi(p.user_id, 'terverifikasi')}
                          className="btn-green btn-sm text-xs">✓ Setujui</button>
                        <button onClick={() => verifikasi(p.user_id, 'ditolak')}
                          className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-red-100">✗ Tolak</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Transaksi terbaru */}
          <h2 className="font-bold text-gray-900 mb-4">📋 Transaksi Terbaru</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kode</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Konsumen</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Bukti Bayar</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ubah Status</th>
              </tr></thead>
              <tbody>
                {transaksi?.map((t: any) => (
                  <tr key={t.id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3 font-semibold text-green-700 text-xs">
                      {t.kode_pesanan}
                      <div className="text-gray-400 font-normal text-[10px]">
                        {new Date(t.created_at).toLocaleDateString('id-ID')}
                      </div>
                    </td>
                    <td className="px-4 py-3">{t.users?.nama}</td>
                    <td className="px-4 py-3 font-bold text-green-700">{rupiah(t.total_bayar)}</td>
                    <td className="px-4 py-3">
                      {t.bukti_bayar ? (
                        <a href={t.bukti_bayar} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium">
                          <span>🖼️</span> Lihat Bukti
                        </a>
                      ) : (
                        <span className="text-gray-300 text-xs">Belum ada</span>
                      )}
                    </td>
                    <td className="px-4 py-3"><span className={statusBadge[t.status] || 'badge-gray'}>{t.status}</span></td>
                    <td className="px-4 py-3">
                      <select defaultValue={t.status}
                        onChange={e => updateStatus(t.id, e.target.value)}
                        className="text-xs border border-gray-200 rounded-lg px-2 py-1 text-gray-700 focus:outline-none focus:border-green-500">
                        {['menunggu','dikonfirmasi','dikirim','selesai','dibatalkan'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
    </div>
  )
}