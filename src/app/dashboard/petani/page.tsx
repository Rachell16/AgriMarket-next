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
    <div className="p-4 animate-pulse space-y-3">
      <div className="h-7 bg-gray-100 rounded w-40" />
      <div className="grid grid-cols-2 gap-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}</div>
    </div>
  )

  const stats = data?.stats || {}
  const orders = data?.pesanan || []
  const profil = data?.profil

  return (
    <div className="p-4 md:p-8">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-gray-900">Selamat datang, {data?.nama?.split(' ')[0]} 👨‍🌾</h1>
        <p className="text-gray-500 text-xs mt-0.5">{new Date().toLocaleDateString('id-ID', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</p>
        {profil?.status_verifikasi === 'pending' && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-sm">
            ⏳ Akun sedang menunggu verifikasi admin.
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {[
          ['💰', 'Pendapatan', rupiah(stats.pendapatan || 0), ''],
          ['📦', 'Pesanan Hari Ini', stats.pesananHari || 0, `${orders.filter((o:any)=>o.status==='menunggu').length} menunggu`],
          ['🌿', 'Produk Aktif', stats.produkAktif || 0, ''],
          ['⭐', 'Rating', (profil?.rating||0).toFixed(1)+'/5', `${profil?.total_ulasan||0} ulasan`],
        ].map(([icon, lbl, val, sub]) => (
          <div key={lbl as string} className="card p-4">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{lbl}</div>
            <div className="text-base font-bold text-gray-900 mt-0.5 truncate">{val}</div>
            {sub && <div className="text-xs text-gray-400 mt-0.5">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-2 mb-6">
        <Link href="/dashboard/petani/produk" className="flex-1 btn-green btn-sm text-xs justify-center">+ Tambah Produk</Link>
        <Link href="/dashboard/petani/pesanan" className="flex-1 btn-outline btn-sm text-xs justify-center">Kelola Pesanan</Link>
      </div>

      {/* Pesanan perlu konfirmasi */}
      {orders.filter((o:any) => o.status==='menunggu').length > 0 && (
        <div className="mb-5">
          <h2 className="font-bold text-gray-900 text-sm mb-3">🔔 Perlu Konfirmasi</h2>
          <div className="space-y-3">
            {orders.filter((o:any) => o.status==='menunggu').map((o:any) => (
              <div key={o.id} className="card p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="font-semibold text-green-700 text-xs">{o.kode_pesanan}</div>
                    <div className="text-gray-500 text-xs">{o.users?.nama} · {o.opsi_pengiriman==='pagi'?'🌅':'☀️'}</div>
                  </div>
                  <div className="font-bold text-green-700 text-sm">{rupiah(o.total_bayar)}</div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => konfirmasi(o.id,'dikonfirmasi')} className="flex-1 btn-green btn-sm text-xs justify-center">✓ Konfirmasi</button>
                  <button onClick={() => konfirmasi(o.id,'dibatalkan')} className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg">✗</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Semua pesanan */}
      <h2 className="font-bold text-gray-900 text-sm mb-3">📋 Semua Pesanan</h2>
      {orders.length === 0 ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Belum ada pesanan masuk.</div>
      ) : (
        <div className="space-y-3">
          {orders.map((o:any) => (
            <div key={o.id} className="card p-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <div className="font-semibold text-green-700 text-xs">{o.kode_pesanan}</div>
                  <div className="text-gray-500 text-xs">{o.users?.nama}</div>
                </div>
                <span className={statusBadge[o.status]||'badge-gray'}>{o.status}</span>
              </div>
              <div className="flex justify-between items-center mt-2">
                <div className="font-bold text-green-700">{rupiah(o.total_bayar)}</div>
                {o.status==='dikonfirmasi' && (
                  <button onClick={() => konfirmasi(o.id,'dikirim')} className="btn-outline btn-sm text-xs">🚚 Kirim</button>
                )}
                {o.status==='dikirim' && (
                  <button onClick={() => konfirmasi(o.id,'selesai')} className="btn-green btn-sm text-xs">✅ Selesai</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
