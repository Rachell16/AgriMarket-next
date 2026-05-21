'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

export default function DashboardAdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    fetch('/api/auth/me').then(r => r.json()).then(d => {
      if (!d.user || d.user.role !== 'admin') router.push('/login')
      else setUser(d.user)
    })
  }, [])

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Berhasil keluar!')
    router.push('/')
  }

  const navItems = [
    { href: '/dashboard/admin',          icon: '📊', label: 'Dashboard' },
    { href: '/dashboard/admin/settings', icon: '⚙️', label: 'Pengaturan Bayar' },
  ]

  return (
    <div className="min-h-screen flex">
      <aside className="w-56 bg-green-900 flex flex-col shrink-0">
        <div className="p-5 border-b border-green-800">
          <div className="text-white font-bold text-base flex items-center gap-2">🛡️ Admin Panel</div>
          <Link href="/" className="text-green-400 text-xs mt-1 hover:text-white transition-colors">← Ke Beranda</Link>
        </div>
        {user && (
          <div className="p-4 border-b border-green-800">
            <div className="w-9 h-9 rounded-full bg-green-700 text-green-200 font-bold flex items-center justify-center mb-2 text-sm">
              {user.nama.charAt(0).toUpperCase()}
            </div>
            <div className="text-white font-semibold text-sm">{user.nama}</div>
            <div className="text-green-400 text-xs mt-0.5">Administrator</div>
          </div>
        )}
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, icon, label }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname === href ? 'bg-green-700 text-white font-semibold' : 'text-green-300 hover:bg-green-800 hover:text-white'
              }`}>
              <span>{icon}</span>{label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-green-800">
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-green-800 w-full transition-all">
            🚪 Keluar
          </button>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 overflow-auto">{children}</main>
    </div>
  )
}
