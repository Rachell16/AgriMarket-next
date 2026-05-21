'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

interface User { id: string; nama: string; email: string; role: string }

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [dropOpen, setDropOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [q, setQ] = useState('')
  const [cartCount, setCartCount] = useState(0)
  const storeCount = useCartStore((s) => s.count)

  useEffect(() => { setCartCount(storeCount()) }, [storeCount])
  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.user) setUser(d.user) })
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null)
    useCartStore.getState().switchUser(null)
    setCartCount(0)
    setMenuOpen(false)
    toast.success('Berhasil keluar!')
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="bg-green-700 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-3">
        {/* Logo */}
        <Link href="/" className="text-white font-bold text-lg flex items-center gap-1.5 shrink-0">
          🌱 <span className="hidden sm:inline">AgriMarket</span>
          <span className="sm:hidden">AgriMarket</span>
        </Link>

        {/* Nav links desktop */}
        <div className="hidden md:flex items-center gap-1 ml-2">
          {[['/', 'Beranda'], ['/katalog', 'Katalog'], ['/petani', 'Petani'], ['/tentang', 'Tentang']].map(([href, lbl]) => (
            <Link key={href} href={href}
              className={`text-sm font-medium px-3 py-1 rounded-lg transition-all ${pathname === href ? 'text-white bg-white/15' : 'text-white/70 hover:text-white hover:bg-white/10'}`}>
              {lbl}
            </Link>
          ))}
        </div>

        {/* Search desktop */}
        <form onSubmit={(e) => { e.preventDefault(); router.push(`/katalog?q=${q}`) }}
          className="flex-1 max-w-xs hidden md:flex items-center gap-2 bg-white/15 border border-white/25 rounded-lg px-3 py-1.5">
          <span className="text-white/60 text-sm">🔍</span>
          <input value={q} onChange={e => setQ(e.target.value)}
            className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/50"
            placeholder="Cari produk segar..." />
        </form>

        {/* Right side */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Cart */}
          <Link href="/keranjang" className="text-white/80 hover:text-white relative text-xl p-1">
            🛒
            {cartCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </Link>

          {/* User desktop */}
          {user ? (
            <div className="relative hidden md:block">
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 text-white text-sm font-medium hover:bg-white/10 px-2 py-1.5 rounded-lg transition-all">
                <div className="w-7 h-7 rounded-full bg-green-200 text-green-800 text-xs font-bold flex items-center justify-center">
                  {user.nama.charAt(0).toUpperCase()}
                </div>
                <span className="hidden lg:inline">{user.nama.split(' ')[0]}</span>
                <span className="text-xs">▾</span>
              </button>
              {dropOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-50">
                  {user.role === 'konsumen' && <Link href="/pesanan" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropOpen(false)}>📦 Pesanan Saya</Link>}
                  {user.role === 'petani' && <>
                    <Link href="/dashboard/petani" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropOpen(false)}>📊 Dashboard</Link>
                    <Link href="/dashboard/petani/produk" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropOpen(false)}>🌿 Produk Saya</Link>
                  </>}
                  {user.role === 'admin' && <Link href="/dashboard/admin" className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50" onClick={() => setDropOpen(false)}>🛡️ Admin Panel</Link>}
                  <hr className="my-1" />
                  <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">🚪 Keluar</button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link href="/login" className="text-white/80 hover:text-white text-sm font-medium border border-white/30 px-3 py-1.5 rounded-lg hover:bg-white/10 transition-all">Masuk</Link>
              <Link href="/register" className="bg-white text-green-700 text-sm font-bold px-3 py-1.5 rounded-lg hover:bg-green-50 transition-all">Daftar</Link>
            </div>
          )}

          {/* Hamburger mobile */}
          <button onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-white p-1 rounded-lg hover:bg-white/10">
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-0.5 bg-white transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-white transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-green-800 border-t border-green-600 px-4 py-3 space-y-1">
          {/* Search mobile */}
          <form onSubmit={(e) => { e.preventDefault(); router.push(`/katalog?q=${q}`); setMenuOpen(false) }}
            className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-lg px-3 py-2 mb-3">
            <span className="text-white/60 text-sm">🔍</span>
            <input value={q} onChange={e => setQ(e.target.value)}
              className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/50"
              placeholder="Cari produk..." />
          </form>

          {/* Nav links mobile */}
          {[['/', 'Beranda'], ['/katalog', 'Katalog'], ['/petani', 'Petani'], ['/tentang', 'Tentang']].map(([href, lbl]) => (
            <Link key={href} href={href} onClick={() => setMenuOpen(false)}
              className={`block px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === href ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              {lbl}
            </Link>
          ))}

          <hr className="border-white/20 my-2" />

          {user ? (
            <>
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="w-8 h-8 rounded-full bg-green-200 text-green-800 font-bold flex items-center justify-center text-sm">
                  {user.nama.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">{user.nama}</div>
                  <div className="text-green-300 text-xs capitalize">{user.role}</div>
                </div>
              </div>
              {user.role === 'konsumen' && <Link href="/pesanan" className="block px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 rounded-lg" onClick={() => setMenuOpen(false)}>📦 Pesanan Saya</Link>}
              {user.role === 'petani' && <>
                <Link href="/dashboard/petani" className="block px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 rounded-lg" onClick={() => setMenuOpen(false)}>📊 Dashboard Petani</Link>
                <Link href="/dashboard/petani/produk" className="block px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 rounded-lg" onClick={() => setMenuOpen(false)}>🌿 Produk Saya</Link>
              </>}
              {user.role === 'admin' && <Link href="/dashboard/admin" className="block px-3 py-2.5 text-sm text-white/70 hover:bg-white/10 rounded-lg" onClick={() => setMenuOpen(false)}>🛡️ Admin Panel</Link>}
              <button onClick={logout} className="w-full text-left px-3 py-2.5 text-sm text-red-300 hover:bg-white/10 rounded-lg">🚪 Keluar</button>
            </>
          ) : (
            <div className="flex gap-2 pt-1">
              <Link href="/login" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center text-white text-sm font-medium border border-white/30 px-4 py-2 rounded-lg hover:bg-white/10">Masuk</Link>
              <Link href="/register" onClick={() => setMenuOpen(false)}
                className="flex-1 text-center bg-white text-green-700 text-sm font-bold px-4 py-2 rounded-lg">Daftar</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}
