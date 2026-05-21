'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function AdminSettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [qrisFile, setQrisFile] = useState<File | null>(null)
  const [qrisPreview, setQrisPreview] = useState<string | null>(null)
  const [form, setForm] = useState({
    wa_number: '',
    bank_name: '',
    bank_account: '',
    bank_holder: '',
    qris_image: '',
  })

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.settings) setForm(prev => ({ ...prev, ...d.settings }))
      if (d.settings?.qris_image) setQrisPreview(d.settings.qris_image)
      setLoading(false)
    })
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    let qrisUrl = form.qris_image
    if (qrisFile) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const fileName = `qris-${Date.now()}.${qrisFile.name.split('.').pop()}`
      const { error: upErr } = await supabase.storage.from('bukti-bayar').upload(fileName, qrisFile)
      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from('bukti-bayar').getPublicUrl(fileName)
        qrisUrl = publicUrl
      }
    }

    const res = await fetch('/api/admin/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, qris_image: qrisUrl }),
    })
    setSaving(false)
    if (res.ok) toast.success('Pengaturan pembayaran disimpan!')
    else toast.error('Gagal menyimpan')
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  if (loading) return <div className="p-8 animate-pulse"><div className="h-8 bg-gray-100 rounded w-48" /></div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-green-700">← Kembali</button>
        <h1 className="text-xl font-bold text-gray-900">⚙️ Pengaturan Pembayaran</h1>
      </div>

      <form onSubmit={submit} className="space-y-6">
        {/* WhatsApp */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">📱 WhatsApp Konfirmasi</h2>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nomor WhatsApp</label>
            <input className="input" type="text" value={form.wa_number} onChange={f('wa_number')} placeholder="628xxxxxxxxxx (tanpa +)" />
            <p className="text-xs text-gray-400 mt-1">Konsumen akan diarahkan ke WA ini setelah checkout</p>
          </div>
        </div>

        {/* Transfer Bank */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">🏦 Transfer Bank</h2>
          <div className="space-y-4">
            {[['bank_name','Nama Bank','cth: BCA, BRI, Mandiri'],['bank_account','Nomor Rekening','cth: 1234567890'],['bank_holder','Atas Nama','cth: AgriMarket Kelompok 19']].map(([k,lbl,ph]) => (
              <div key={k}>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{lbl}</label>
                <input className="input" type="text" value={(form as any)[k]} onChange={f(k)} placeholder={ph} />
              </div>
            ))}
          </div>
        </div>

        {/* QRIS */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 mb-4 pb-3 border-b border-gray-100">📱 QRIS</h2>
          <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center cursor-pointer transition-all ${qrisPreview ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}>
            {qrisPreview ? (
              <img src={qrisPreview} alt="QRIS" className="w-48 h-48 object-contain rounded-lg mb-2" />
            ) : (
              <>
                <div className="text-4xl mb-2">📱</div>
                <div className="text-sm font-medium text-gray-700">Upload gambar QRIS</div>
                <div className="text-xs text-gray-400 mt-1">JPG, PNG, max 5MB</div>
              </>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={e => {
              const file = e.target.files?.[0]
              if (file) { setQrisFile(file); setQrisPreview(URL.createObjectURL(file)) }
            }} />
          </label>
          {qrisPreview && (
            <button type="button" onClick={() => { setQrisFile(null); setQrisPreview(null); setForm(p => ({...p, qris_image:''})) }}
              className="text-xs text-red-500 mt-2 hover:text-red-700">✕ Hapus QRIS</button>
          )}
        </div>

        <div className="flex gap-3">
          <button type="submit" disabled={saving} className="btn-green px-8 disabled:opacity-60">
            {saving ? 'Menyimpan...' : '💾 Simpan Pengaturan'}
          </button>
          <button type="button" onClick={() => router.back()} className="btn-outline px-8">Batal</button>
        </div>
      </form>
    </div>
  )
}
