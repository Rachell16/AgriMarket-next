'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function DashboardPetaniLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'petani') router.push('/login')
      else setUser(d.user)
    })
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Berhasil keluar!')
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard/petani',         icon: '📊', label: 'Dashboard' },
    { href: '/dashboard/petani/produk',  icon: '🌿', label: 'Produk Saya' },
    { href: '/dashboard/petani/pesanan', icon: '📦', label: 'Pesanan' },
    { href: '/dashboard/petani/profil',  icon: '👤', label: 'Edit Profil' },
  ]

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-100">
          <Link href="/" className="text-green-700 font-bold text-base flex items-center gap-2">🌱 AgriMarket</Link>
        </div>
        {user && (
          <div className="p-4 border-b border-gray-100">
            <div className="w-10 h-10 rounded-full bg-green-100 text-green-800 font-bold flex items-center justify-center mb-2">
              {user.nama.charAt(0).toUpperCase()}
            </div>
            <div className="font-semibold text-gray-900 text-sm">{user.nama}</div>
            <div className="text-xs text-gray-400 mt-0.5">Petani</div>
          </div>
        )}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname === href ? 'bg-green-50 text-green-700 font-semibold' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
              }`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-all">
            🚪 Keluar
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>
    </div>
  )
}
