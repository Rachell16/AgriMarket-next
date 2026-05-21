'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { toast.error(data.error); return }

    // Load keranjang milik akun ini
    const { useCartStore } = await import('@/store/cartStore')
    useCartStore.getState().switchUser(data.user.id)

    toast.success(`Selamat datang, ${data.user.nama}!`)
    if (data.user.role === 'admin')  router.push('/dashboard/admin')
    else if (data.user.role === 'petani') router.push('/dashboard/petani')
    else { router.push('/'); router.refresh() }
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      {/* Left */}
      <div className="bg-green-700 p-16 flex flex-col justify-center relative overflow-hidden hidden md:flex">
        <div className="absolute right-0 bottom-0 text-[200px] opacity-5 select-none">🌱</div>
        <Link href="/" className="text-green-200/70 text-sm mb-10 hover:text-white transition-colors">← Kembali ke Beranda</Link>
        <h2 className="text-4xl font-bold text-white mb-3 leading-tight">Selamat Datang<br/>di AgriMarket 🌱</h2>
        <p className="text-green-200/70 text-base mb-10 leading-relaxed max-w-sm">Platform e-commerce yang menghubungkan petani langsung dengan konsumen.</p>
        <div className="space-y-4">
          {['Produk segar langsung dari petani','Pengiriman pagi sebelum jam 09.00','Harga lebih adil tanpa perantara','Transaksi aman & terenkripsi'].map(f => (
            <div key={f} className="flex items-center gap-3 text-green-100/80 text-sm">
              <div className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center text-xs shrink-0">✓</div>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center justify-center p-8 bg-green-50">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border border-gray-100">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-full bg-green-600 text-2xl flex items-center justify-center mx-auto mb-3">🌱</div>
            <h1 className="text-xl font-bold text-green-900">AgriMarket</h1>
            <p className="text-gray-500 text-sm mt-1">Masuk ke akunmu</p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
              <input className="input" type="email" placeholder="nama@email.com" value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Password</label>
              <input className="input" type="password" placeholder="••••••••" value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} required />
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all disabled:opacity-60 mt-2">
              {loading ? 'Memproses...' : 'Masuk'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Belum punya akun? <Link href="/register" className="text-green-600 font-semibold hover:text-green-700">Daftar</Link>
          </p>

          <div className="mt-5 pt-5 border-t border-gray-100 text-center text-xs text-gray-400">
            <strong>Demo:</strong> admin@agrimarket.id / budi@petani.id / sari@konsumen.id<br/>
            Password: <strong>password</strong>
          </div>
        </div>
      </div>
    </div>
  )
}