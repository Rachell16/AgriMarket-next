'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { rupiah } from '@/lib/utils'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const COLORS = ['#2E7D32', '#66BB6A', '#A5D6A7', '#1B5E20', '#388E3C', '#81C784']
const COLORS_METODE = ['#2E7D32', '#1565C0', '#E65100']

function StatCard({ icon, label, value, sub, color = 'green' }: any) {
  return (
    <div className="card p-4">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${color === 'green' ? 'text-green-700' : 'text-gray-900'}`}>{value}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

const formatRupiah = (val: number) => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}jt`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}rb`
  return val.toString()
}

export default function AnalisisDataPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/admin/analisis').then(r => {
      if (r.status === 401) { router.push('/login'); return null }
      return r.json()
    }).then(d => { if (d) { setData(d); setLoading(false) } })
  }, [])

  if (loading) return (
    <div className="p-4 animate-pulse space-y-4">
      <div className="h-7 bg-gray-100 rounded w-48" />
      <div className="grid grid-cols-2 gap-3">{Array(6).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}</div>
      <div className="h-48 bg-gray-100 rounded-xl" />
      <div className="h-48 bg-gray-100 rounded-xl" />
    </div>
  )

  const { penjualanPerBulan, distribusiMetode, produkTerlaris, distribusiKategori, summary } = data

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analisis Data 📈</h1>
        <p className="text-gray-500 text-xs mt-0.5">Visualisasi data platform AgriMarket secara keseluruhan</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <StatCard icon="💰" label="Total Pendapatan" value={rupiah(summary.totalPendapatan)} sub="dari pesanan selesai" />
        <StatCard icon="📦" label="Total Pesanan" value={summary.totalOrder} sub={`${summary.orderSelesai} selesai · ${summary.orderPending} pending`} />
        <StatCard icon="✅" label="Order Selesai" value={`${summary.totalOrder > 0 ? Math.round((summary.orderSelesai / summary.totalOrder) * 100) : 0}%`} sub="tingkat konversi" />
        <StatCard icon="👥" label="Total Konsumen" value={summary.totalKonsumen} />
        <StatCard icon="👨‍🌾" label="Total Petani" value={summary.totalPetani} />
        <StatCard icon="🌱" label="Kategori Produk" value={distribusiKategori.length} sub="kategori aktif" />
      </div>

      {/* Penjualan per Bulan */}
      <div className="card p-4">
        <h2 className="font-bold text-gray-900 text-sm mb-1">📅 Penjualan 6 Bulan Terakhir</h2>
        <p className="text-xs text-gray-400 mb-4">Total pendapatan & jumlah order per bulan</p>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={penjualanPerBulan} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tickFormatter={formatRupiah} tick={{ fontSize: 10 }} width={45} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} width={30} />
            <Tooltip
              formatter={(val: any, name: string) => [
                name === 'Pendapatan' ? rupiah(val) : val,
                name
              ]}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="left" type="monotone" dataKey="pendapatan" name="Pendapatan" stroke="#2E7D32" strokeWidth={2} dot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="jumlahOrder" name="Jumlah Order" stroke="#66BB6A" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Produk Terlaris */}
      <div className="card p-4">
        <h2 className="font-bold text-gray-900 text-sm mb-1">🏆 Produk Terlaris</h2>
        <p className="text-xs text-gray-400 mb-4">6 produk dengan penjualan terbanyak</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={produkTerlaris} margin={{ top: 5, right: 10, left: 0, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="nama" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(val: any) => [`${val} unit`, 'Terjual']} />
            <Bar dataKey="total" name="Terjual" radius={[4, 4, 0, 0]}>
              {produkTerlaris.map((_: any, i: number) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Row: Metode Bayar + Kategori */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Distribusi Metode Pembayaran */}
        <div className="card p-4">
          <h2 className="font-bold text-gray-900 text-sm mb-1">💳 Metode Pembayaran</h2>
          <p className="text-xs text-gray-400 mb-2">Distribusi metode yang digunakan</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={distribusiMetode}
                cx="50%" cy="50%"
                outerRadius={70}
                dataKey="jumlah"
                nameKey="nama"
                label={({ nama, percent }) => `${nama} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {distribusiMetode.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS_METODE[i % COLORS_METODE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: any) => [`${val} transaksi`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Distribusi Kategori */}
        <div className="card p-4">
          <h2 className="font-bold text-gray-900 text-sm mb-1">🗂️ Penjualan per Kategori</h2>
          <p className="text-xs text-gray-400 mb-2">Total terjual per kategori produk</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={distribusiKategori} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="nama" type="category" tick={{ fontSize: 10 }} width={70} />
              <Tooltip formatter={(val: any) => [`${val} unit`, 'Terjual']} />
              <Bar dataKey="totalTerjual" name="Terjual" radius={[0, 4, 4, 0]}>
                {distribusiKategori.map((_: any, i: number) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Footer note */}
      <p className="text-center text-xs text-gray-300 pb-4">Data diambil langsung dari database AgriMarket · Diperbarui setiap kali halaman dimuat</p>
    </div>
  )
}
