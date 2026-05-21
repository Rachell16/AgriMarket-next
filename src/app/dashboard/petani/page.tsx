'use client'
import { useEffect, useState } from 'react'
import { rupiah } from '@/lib/utils'
import Link from 'next/link'
import toast from 'react-hot-toast'

const statusBadge: Record<string, string> = {
  menunggu: 'badge-amber', dikonfirmasi: 'badge-navy',
  dikirim: 'badge-navy', selesai: 'badge-green', dibatalkan: 'badge-red',
}

export default function DashboardPetaniPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const load = () => {
    fetch('/api/petani/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }
  useEffect(load, [])

  const konfirmasi = async (pesananId: number, status: string) => {
    await fetch('/api/petani/pesanan', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pesanan_id: pesananId, status }),
    })
    toast.success('Status pesanan diperbarui!')
    load()
  }

  if (loading) return (
    <div className="p-10 animate-pulse space-y-4">
      <div className="h-8 bg-gray-100 rounded w-48" />
      <div className="grid grid-cols-4 gap-4">{Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl" />)}</div>
    </div>
  )

  const stats = data?.stats || {}
  const orders = data?.pesanan || []
  const profil = data?.profil

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Selamat datang, {data?.nama?.split(' ')[0]} 👨‍🌾</h1>
        <p className="text-gray-500 text-sm">{new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        {profil?.status_verifikasi === 'pending' && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm">
            ⏳ Akun petanimu sedang menunggu verifikasi dari admin.
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          ['💰', 'Pendapatan Hari Ini', rupiah(stats.pendapatan || 0), ''],
          ['📦', 'Pesanan Hari Ini', stats.pesananHari || 0, `${orders.filter((o:any) => o.status==='menunggu').length} menunggu`],
          ['🌿', 'Produk Aktif', stats.produkAktif || 0, ''],
          ['⭐', 'Rating Toko', (profil?.rating || 0).toFixed(1) + ' / 5', `${profil?.total_ulasan || 0} ulasan`],
        ].map(([icon, lbl, val, sub]) => (
          <div key={lbl as string} className="card p-5">
            <div className="text-2xl mb-2">{icon}</div>
            <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-1">{lbl}</div>
            <div className="text-xl font-bold text-gray-900">{val}</div>
            {sub && <div className="text-xs text-gray-400 mt-1">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Pesanan masuk */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-gray-900">Pesanan Masuk — Perlu Konfirmasi</h2>
        <Link href="/dashboard/petani/produk" className="btn-green btn-sm text-xs">+ Tambah Produk</Link>
      </div>

      {orders.filter((o: any) => o.status === 'menunggu').length === 0 ? (
        <div className="card p-8 text-center text-gray-400">Tidak ada pesanan menunggu konfirmasi.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kode</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Konsumen</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kirim</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
            </tr></thead>
            <tbody>
              {orders.filter((o: any) => o.status === 'menunggu').map((o: any) => (
                <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-green-700 text-xs">{o.kode_pesanan}</td>
                  <td className="px-4 py-3">{o.users?.nama}</td>
                  <td className="px-4 py-3 font-bold text-green-700">{rupiah(o.total_bayar)}</td>
                  <td className="px-4 py-3">{o.opsi_pengiriman === 'pagi' ? '🌅 Pagi' : '☀️ Siang'}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => konfirmasi(o.id, 'dikonfirmasi')}
                        className="btn-green btn-sm text-xs">✓ Konfirmasi</button>
                      <button onClick={() => konfirmasi(o.id, 'dibatalkan')}
                        className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors">✗</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Semua pesanan */}
      <h2 className="font-bold text-gray-900 mt-8 mb-4">Semua Pesanan</h2>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-50 border-b border-gray-100">
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kode</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Konsumen</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Total</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
          </tr></thead>
          <tbody>
            {orders.map((o: any) => (
              <tr key={o.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-green-700 text-xs">{o.kode_pesanan}</td>
                <td className="px-4 py-3">{o.users?.nama}</td>
                <td className="px-4 py-3 font-bold text-green-700">{rupiah(o.total_bayar)}</td>
                <td className="px-4 py-3"><span className={statusBadge[o.status] || 'badge-gray'}>{o.status}</span></td>
                <td className="px-4 py-3">
                  {o.status === 'dikonfirmasi' && (
                    <button onClick={() => konfirmasi(o.id, 'dikirim')}
                      className="btn-outline btn-sm text-xs">🚚 Kirim</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
