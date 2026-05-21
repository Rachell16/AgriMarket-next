'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface User {
  id: string; nama: string; email: string; role: string
}

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [dropOpen, setDropOpen] = useState(false)
  const [q, setQ] = useState('')
  const [cartCount, setCartCount] = useState(0)

  // Fix hydration: ambil cart count di client side saja
  const storeCount = useCartStore((s) => s.count)
  useEffect(() => {
    setCartCount(storeCount())
  }, [storeCount])

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user) })
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    useCartStore.getState().switchUser(null)
    setCartCount(0)
    toast.success('Berhasil keluar!')
    router.push('/')
    router.refresh()
  }

  const navLink = (href: string, label: string) => (
    <Link href={href}
      className={`text-sm font-medium px-3 py-1 rounded-lg transition-all ${
        pathname === href ? 'text-white bg-white/15' : 'text-white/70 hover:text-white hover:bg-white/10'
      }`}>
      {label}
    </Link>
  )

  return (
    <nav className="bg-green-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
        <Link href="/" className="text-white font-bold text-xl flex items-center gap-2 shrink-0">
          🌱 AgriMarket
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLink('/', 'Beranda')}
          {navLink('/katalog', 'Katalog')}
          {navLink('/petani', 'Petani')}
          {navLink('/tentang', 'Tentang')}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); router.push(`/katalog?q=${q}`) }}
          className="flex-1 max-w-xs hidden md:flex items-center gap-2 bg-white/15 border border-white/25 rounded-lg px-3 py-1.5">
          <span className="text-white/60 text-sm">🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)}
            className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/50"
            placeholder="Cari produk segar..." />
        </form>

        <div className="flex items-center gap-3 ml-auto">
          <Link href="/keranjang" className="text-white/80 hover:text-white relative text-xl">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 text-white text-sm font-medium hover:bg-white/10 px-3 py-1.5 rounded-lg transition-all">
                <div className="w-7 h-7 rounded-full bg-green-200 text-green-800 text-xs font-bold flex items-center justify-center">
                  {user.nama.charAt(0).toUpperCase()}
                </div>
                <span>{user.nama.split(' ')[0]}</span>
                <span className="text-xs">▾</span>
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                  {user.role === 'konsumen' && (
                    <Link href="/pesanan" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropOpen(false)}>📦 Pesanan Saya</Link>
                  )}
                  {user.role === 'petani' && <>
                    <Link href="/dashboard/petani" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropOpen(false)}>📊 Dashboard Petani</Link>
                    <Link href="/dashboard/petani/produk" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropOpen(false)}>🌿 Produk Saya</Link>
                  </>}
                  {user.role === 'admin' && (
                    <Link href="/dashboard/admin" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropOpen(false)}>🛡️ Admin Panel</Link>
                  )}
                  <hr className="my-1" />
                  <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">🚪 Keluar</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-white/80 hover:text-white text-sm font-medium border border-white/30 px-4 py-1.5 rounded-lg hover:bg-white/10 transition-all">Masuk</Link>
              <Link href="/register" className="bg-white text-green-700 text-sm font-bold px-4 py-1.5 rounded-lg hover:bg-green-50 transition-all">Daftar</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}