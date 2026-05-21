'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function ProfilPetaniPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profil, setProfil] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ nama:'', telepon:'', alamat:'', nama_toko:'', deskripsi_toko:'', lokasi:'' })

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/petani/profil').then(r => r.json()),
    ]).then(([u, p]) => {
      if (!u.user) { router.push('/login'); return }
      setUser(u.user)
      setProfil(p.profil)
      setForm({
        nama: u.user.nama || '',
        telepon: u.user.telepon || '',
        alamat: u.user.alamat || '',
        nama_toko: p.profil?.nama_toko || '',
        deskripsi_toko: p.profil?.deskripsi_toko || '',
        lokasi: p.profil?.lokasi || '',
      })
      setLoading(false)
    })
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/petani/profil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { toast.error(data.error || 'Gagal menyimpan'); return }
    toast.success('Profil berhasil diperbarui!')
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 bg-gray-100 rounded w-48 mb-6" /></div>

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-green-700 transition-colors">← Kembali</button>
        <h1 className="text-xl font-bold text-gray-900">👤 Edit Profil</h1>
      </div>

      <form onSubmit={submit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Data Pribadi</h2>
            <div className="space-y-4">
              {[['nama','Nama Lengkap','text',true],['telepon','No. Telepon','text',false],['alamat','Alamat','text',false]].map(([k,lbl,t,req]) => (
                <div key={k as string}>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{lbl}</label>
                  <input className="input" type={t as string} value={(form as any)[k as string]} onChange={f(k as string)} required={!!req} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Email</label>
                <input className="input bg-gray-50 text-gray-400" value={user?.email || ''} disabled />
                <p className="text-xs text-gray-400 mt-1">Email tidak dapat diubah</p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">Data Toko / Kebun</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nama Toko</label>
                <input className="input" type="text" value={form.nama_toko} onChange={f('nama_toko')} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Lokasi</label>
                <input className="input" type="text" value={form.lokasi} onChange={f('lokasi')} placeholder="cth: Magelang, Jawa Tengah" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Deskripsi Toko</label>
                <textarea className="input resize-none" rows={4} value={form.deskripsi_toko} onChange={f('deskripsi_toko')} placeholder="Ceritakan tentang kebun..." />
              </div>
              <div className="bg-gray-50 rounded-xl p-3 border border-gray-200">
                <div className="text-xs font-semibold text-gray-500 mb-1.5">Status Verifikasi</div>
                <span className={profil?.status_verifikasi === 'terverifikasi' ? 'badge-green' : profil?.status_verifikasi === 'ditolak' ? 'badge-red' : 'badge-amber'}>
                  {profil?.status_verifikasi === 'terverifikasi' ? '✓ Terverifikasi' : profil?.status_verifikasi === 'ditolak' ? '✗ Ditolak' : '⏳ Menunggu Verifikasi'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button type="submit" disabled={saving} className="btn-green px-8 disabled:opacity-60">
            {saving ? 'Menyimpan...' : '💾 Simpan Perubahan'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline px-8">Batal</button>
        </div>
      </form>
    </div>
  )
}
