'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { Suspense } from 'react'

function RegisterForm() {
  const router = useRouter()
  const sp = useSearchParams()
  const [role, setRole] = useState(sp.get('role') || 'konsumen')
  const [form, setForm] = useState({ nama:'', email:'', password:'', konfirm:'', telepon:'', alamat:'', nama_toko:'', lokasi:'' })
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, role })
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { toast.error(data.error); return }
    toast.success('Akun berhasil dibuat!')
    router.push(role === 'petani' ? '/dashboard/petani' : '/')
    router.refresh()
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [k]: e.target.value })

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2">
      <div className="bg-green-700 p-16 flex flex-col justify-center relative overflow-hidden hidden md:flex">
        <div className="absolute right-0 bottom-0 text-[200px] opacity-5 select-none">🌾</div>
        <Link href="/" className="text-green-200/70 text-sm mb-10 hover:text-white">← Kembali</Link>
        <h2 className="text-3xl font-bold text-white mb-3">Bergabung dengan<br/>AgriMarket 🌱</h2>
        <p className="text-green-200/70 text-sm leading-relaxed max-w-sm">Daftar sebagai konsumen untuk berbelanja, atau sebagai petani mitra untuk menjual hasil panen.</p>
      </div>
      <div className="flex items-center justify-center p-8 bg-green-50 overflow-y-auto">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10 border border-gray-100 my-6">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-full bg-green-600 text-2xl flex items-center justify-center mx-auto mb-3">🌱</div>
            <h1 className="text-xl font-bold text-green-900">Buat Akun Baru</h1>
          </div>

          {/* Role tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 gap-1 mb-6">
            {[['konsumen','👤 Konsumen'],['petani','👨‍🌾 Petani']].map(([r, lbl]) => (
              <button key={r} type="button" onClick={() => setRole(r)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${role === r ? 'bg-white text-green-700 shadow-sm' : 'text-gray-500'}`}>
                {lbl}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-3">
            {[['nama','Nama Lengkap','text'],['email','Email','email'],['telepon','No. Telepon','text'],['alamat','Alamat','text']].map(([k,lbl,t]) => (
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{lbl}</label>
                <input className="input" type={t} value={(form as any)[k]} onChange={f(k)} required={k==='nama'||k==='email'} />
              </div>
            ))}

            {role === 'petani' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nama Toko / Kebun</label>
                  <input className="input" type="text" value={form.nama_toko} onChange={f('nama_toko')} required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Lokasi Kebun</label>
                  <input className="input" type="text" placeholder="cth: Magelang, Jawa Tengah" value={form.lokasi} onChange={f('lokasi')} />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Password</label>
              <input className="input" type="password" value={form.password} onChange={f('password')} required />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Konfirmasi Password</label>
              <input className="input" type="password" value={form.konfirm} onChange={f('konfirm')} required />
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 transition-all disabled:opacity-60 mt-2">
              {loading ? 'Memproses...' : 'Buat Akun'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-5">
            Sudah punya akun? <Link href="/login" className="text-green-600 font-semibold">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function RegisterPage() {
  return <Suspense><RegisterForm /></Suspense>
}
