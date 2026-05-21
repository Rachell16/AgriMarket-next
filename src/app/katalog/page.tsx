'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import ProdukCard from '@/components/ProdukCard'
import Link from 'next/link'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

function KatalogContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const q    = searchParams.get('q') || ''
  const kat  = searchParams.get('kat') || ''
  const sort = searchParams.get('sort') || 'populer'

  const [produk, setProduk] = useState<any[]>([])
  const [kategoris, setKategoris] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(q)

  useEffect(() => {
    setLoading(true)
    fetch('/api/produk?' + new URLSearchParams({ q, kat, sort }))
      .then(r => r.json())
      .then(d => {
        const mapped = (d.produk || []).map((p: any) => ({
          ...p,
          icon: p.kategori?.icon || '🌿',
        }))
        setProduk(mapped)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    fetch('/api/kategori').then(r => r.json()).then(d => setKategoris(d.kategoris || []))
  }, [q, kat, sort])

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams({ q, kat, sort, [key]: value })
    if (!value) params.delete(key)
    router.push('/katalog?' + params.toString())
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setParam('q', search)
  }

  return (
    <>
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 py-10">
        {/* Search bar */}
        <form onSubmit={handleSearch} className="flex gap-3 mb-8 max-w-lg">
          <input
            className="input flex-1"
            placeholder="🔍 Cari produk segar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn-green px-6">Cari</button>
          {(q || kat) && (
            <button type="button" onClick={() => { setSearch(''); router.push('/katalog') }}
              className="btn-outline px-4 text-sm">✕ Reset</button>
          )}
        </form>

        <div className="flex flex-wrap gap-4 items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {q ? `Hasil: "${q}"` : kat ? `Kategori: ${kategoris.find(k=>k.slug===kat)?.nama || kat}` : 'Semua Produk'}
            </h1>
            <p className="text-gray-500 text-sm">{loading ? 'Memuat...' : `${produk.length} produk ditemukan`}</p>
          </div>
          <select value={sort} onChange={e => setParam('sort', e.target.value)} className="input" style={{ width: 'auto' }}>
            <option value="populer">Terpopuler</option>
            <option value="terbaru">Terbaru</option>
            <option value="harga_asc">Harga: Rendah–Tinggi</option>
            <option value="harga_desc">Harga: Tinggi–Rendah</option>
          </select>
        </div>

        {/* Kategori chips */}
        <div className="flex gap-2 flex-wrap mb-8">
          <Link href="/katalog" className={`px-4 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${!kat ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-400'}`}>
            🌿 Semua
          </Link>
          {kategoris.map((k: any) => (
            <Link key={k.id} href={`/katalog?kat=${k.slug}${q?`&q=${q}`:''}`}
              className={`px-4 py-1.5 rounded-full border-2 text-sm font-medium transition-all ${kat===k.slug ? 'border-green-600 bg-green-50 text-green-700' : 'border-gray-200 text-gray-500 hover:border-green-400'}`}>
              {k.icon} {k.nama}
            </Link>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <div key={i} className="h-64 rounded-xl bg-gray-100 animate-pulse" />)}
          </div>
        ) : produk.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 mb-4">Produk tidak ditemukan.</p>
            <Link href="/katalog" className="btn-outline btn-sm">Lihat Semua Produk</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {produk.map((p: any) => <ProdukCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
      <Footer />
    </>
  )
}

export default function KatalogPage() {
  return <Suspense fallback={<div className="p-10 text-center text-gray-400">Memuat...</div>}><KatalogContent /></Suspense>
}