'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { rupiah } from '@/lib/utils'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'

const HIJAU = ['#2E7D32', '#388E3C', '#43A047', '#66BB6A', '#81C784', '#A5D6A7']
const METODE = ['#2E7D32', '#1565C0', '#E65100']
const KEPUASAN = ['#2E7D32', '#E53E3E']
const ORGANIK = ['#2E7D32', '#9E9E9E']
const RATING_COLORS = ['#E53E3E', '#ED8936', '#ECC94B', '#68D391', '#2E7D32']

const formatRupiah = (val: number) => {
  if (val >= 1_000_000) return `${(val / 1_000_000).toFixed(1)}jt`
  if (val >= 1_000) return `${(val / 1_000).toFixed(0)}rb`
  return val.toString()
}

function StatCard({ icon, label, value, sub, highlight = false }: any) {
  return (
    <div className={`card p-4 ${highlight ? 'border-green-300 bg-green-50' : ''}`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wide">{label}</div>
      <div className={`text-lg font-bold mt-0.5 ${highlight ? 'text-green-700' : 'text-gray-900'}`}>{value}</div>
      {sub && <div className="text-[10px] text-gray-400 mt-0.5">{sub}</div>}
    </div>
  )
}

function SectionTitle({ emoji, title, sub }: any) {
  return (
    <div className="mb-3">
      <h2 className="font-bold text-gray-900 text-sm">{emoji} {title}</h2>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  )
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Array(8).fill(0).map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
      </div>
      {Array(4).fill(0).map((_, i) => <div key={i} className="h-56 bg-gray-100 rounded-xl" />)}
    </div>
  )

  const {
    penjualanPerBulan, distribusiMetode, produkTerlaris, distribusiKategori,
    peakHours, distribusiRating, kepuasan, distribusiOrganik, summary
  } = data

  return (
    <div className="p-4 md:p-8 space-y-8">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Analisis Data 📊</h1>
        <p className="text-gray-500 text-xs mt-0.5">Dashboard analitik platform AgriMarket — Kelompok Tunas Muda Cianjur</p>
      </div>

      {/* ── Summary Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="💰" label="Total Pendapatan" value={rupiah(summary.totalPendapatan)} sub="dari pesanan selesai" highlight />
        <StatCard icon="📦" label="Total Pesanan" value={summary.totalOrder} sub={`${summary.orderSelesai} selesai · ${summary.orderPending} pending`} />
        <StatCard icon="✅" label="Tingkat Selesai" value={`${summary.totalOrder > 0 ? Math.round((summary.orderSelesai / summary.totalOrder) * 100) : 0}%`} sub="konversi pesanan" />
        <StatCard icon="⭐" label="Rating Rata-rata" value={summary.ratingRata} sub="kepuasan konsumen" highlight />
        <StatCard icon="👥" label="Total Konsumen" value={summary.totalKonsumen} />
        <StatCard icon="👨‍🌾" label="Total Petani" value={summary.totalPetani} />
        <StatCard icon="😊" label="Konsumen Puas" value={summary.totalPuas} sub="rating ≥ 4" />
        <StatCard icon="🗂️" label="Kategori Aktif" value={distribusiKategori.length} sub="kategori produk" />
      </div>

      {/* ── Penjualan 6 Bulan ─────────────────────────────── */}
      <div className="card p-4">
        <SectionTitle emoji="📅" title="Tren Penjualan 6 Bulan Terakhir" sub="Total pendapatan & jumlah order per bulan" />
        <ResponsiveContainer width="100%" height={230}>
          <LineChart data={penjualanPerBulan} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" tickFormatter={formatRupiah} tick={{ fontSize: 10 }} width={45} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10 }} width={30} />
            <Tooltip formatter={(val: any, name: string) => [name === 'Pendapatan' ? rupiah(val) : val, name]} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="left" type="monotone" dataKey="pendapatan" name="Pendapatan" stroke="#2E7D32" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line yAxisId="right" type="monotone" dataKey="jumlahOrder" name="Jumlah Order" stroke="#66BB6A" strokeWidth={2} dot={{ r: 4 }} strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Peak Hours ────────────────────────────────────── */}
      <div className="card p-4">
        <SectionTitle emoji="⏰" title="Pola Jam Transaksi (Peak Hours)" sub="Distribusi jumlah transaksi per jam dalam sehari" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={peakHours} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="jam" tick={{ fontSize: 9 }} interval={1} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(val: any) => [`${val} transaksi`, 'Jumlah']} />
            <Bar dataKey="jumlah" name="Transaksi" radius={[3, 3, 0, 0]}>
              {peakHours.map((_: any, i: number) => (
                <Cell key={i} fill={i >= 6 && i <= 10 ? '#2E7D32' : '#A5D6A7'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-xs text-gray-400 mt-2 text-center">💡 Warna hijau tua menandakan peak hour utama (07:00–10:00)</p>
      </div>

      {/* ── Produk Terlaris ───────────────────────────────── */}
      <div className="card p-4">
        <SectionTitle emoji="🏆" title="Produk Terlaris" sub="6 produk dengan jumlah penjualan terbanyak" />
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={produkTerlaris} margin={{ top: 5, right: 10, left: 0, bottom: 35 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="nama" tick={{ fontSize: 9 }} angle={-20} textAnchor="end" interval={0} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip formatter={(val: any) => [`${val} unit`, 'Terjual']} />
            <Bar dataKey="total" name="Terjual" radius={[4, 4, 0, 0]}>
              {produkTerlaris.map((_: any, i: number) => (
                <Cell key={i} fill={HIJAU[i % HIJAU.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* ── Rating & Kepuasan ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <SectionTitle emoji="⭐" title="Distribusi Rating Konsumen" sub="Jumlah transaksi per nilai rating" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={distribusiRating} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="rating" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(val: any) => [`${val} transaksi`, 'Jumlah']} />
              <Bar dataKey="jumlah" name="Transaksi" radius={[4, 4, 0, 0]}>
                {distribusiRating.map((_: any, i: number) => (
                  <Cell key={i} fill={RATING_COLORS[i % RATING_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <SectionTitle emoji="😊" title="Kepuasan Konsumen" sub="Proporsi puas (rating ≥ 4) vs tidak puas" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={kepuasan}
                cx="50%" cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="jumlah"
                nameKey="nama"
                label={({ nama, percent }) => `${(percent * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {kepuasan.map((_: any, i: number) => (
                  <Cell key={i} fill={KEPUASAN[i]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: any, name: any) => [`${val} transaksi`, name]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Metode Bayar & Organik ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-4">
          <SectionTitle emoji="💳" title="Metode Pembayaran" sub="Distribusi metode bayar konsumen" />
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={distribusiMetode}
                cx="50%" cy="50%"
                outerRadius={75}
                dataKey="jumlah"
                nameKey="nama"
                label={({ nama, percent }) => `${nama} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {distribusiMetode.map((_: any, i: number) => (
                  <Cell key={i} fill={METODE[i % METODE.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val: any) => [`${val} transaksi`, '']} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <SectionTitle emoji="🌿" title="Organik vs Non-Organik" sub="Perbandingan produk dan total terjual" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={distribusiOrganik} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="nama" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="jumlahProduk" name="Jumlah Produk" radius={[4, 4, 0, 0]}>
                {distribusiOrganik.map((_: any, i: number) => (
                  <Cell key={i} fill={ORGANIK[i]} />
                ))}
              </Bar>
              <Bar dataKey="totalTerjual" name="Total Terjual" radius={[4, 4, 0, 0]} fill="#A5D6A7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Kategori ──────────────────────────────────────── */}
      <div className="card p-4">
        <SectionTitle emoji="🗂️" title="Penjualan per Kategori" sub="Total produk terjual per kategori komoditas" />
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={distribusiKategori} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10 }} />
            <YAxis dataKey="nama" type="category" tick={{ fontSize: 10 }} width={80} />
            <Tooltip formatter={(val: any) => [`${val} unit`, 'Terjual']} />
            <Bar dataKey="totalTerjual" name="Terjual" radius={[0, 4, 4, 0]}>
              {distribusiKategori.map((_: any, i: number) => (
                <Cell key={i} fill={HIJAU[i % HIJAU.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <p className="text-center text-xs text-gray-300 pb-4">
        Data diambil langsung dari database AgriMarket · Diperbarui setiap kali halaman dimuat
      </p>
    </div>
  )
}
