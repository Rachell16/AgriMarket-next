'use client'
import { useEffect, useState } from 'react'
import { rupiah } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function DashboardPetaniProdukPage() {
  const [produk, setProduk] = useState<any[]>([])
  const [kategoris, setKategoris] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editItem, setEditItem] = useState<any>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [form, setForm] = useState({ nama:'', deskripsi:'', harga:'', satuan:'kg', stok:'', kategori_id:'1', is_organik:false })

  const load = () => {
    Promise.all([
      fetch('/api/petani/produk').then(r => r.json()),
      fetch('/api/kategori').then(r => r.json()),
    ]).then(([p, k]) => { setProduk(p.produk || []); setKategoris(k.kategoris || []); setLoading(false) })
  }
  useEffect(load, [])

  const openEdit = (p: any) => {
    setEditItem(p)
    setFotoPreview(p.foto_url || null)
    setFotoFile(null)
    setForm({ nama: p.nama, deskripsi: p.deskripsi || '', harga: String(p.harga), satuan: p.satuan, stok: String(p.stok), kategori_id: String(p.kategori_id), is_organik: p.is_organik })
    setShowForm(true)
  }

  const resetForm = () => {
    setShowForm(false); setEditItem(null)
    setFotoFile(null); setFotoPreview(null)
    setForm({ nama:'', deskripsi:'', harga:'', satuan:'kg', stok:'', kategori_id:'1', is_organik:false })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = { ...form, harga: Number(form.harga), stok: Number(form.stok), kategori_id: Number(form.kategori_id) }

    // Upload foto kalau ada
    let foto_url = editItem?.foto_url || null
    if (fotoFile) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const ext = fotoFile.name.split('.').pop()
      const fileName = `produk-${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('foto-produk').upload(fileName, fotoFile)
      if (!upErr) {
        const { data: { publicUrl } } = supabase.storage.from('foto-produk').getPublicUrl(fileName)
        foto_url = publicUrl
      }
    }

    let res
    if (editItem) {
      res = await fetch(`/api/produk/${editItem.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...body, foto_url}) })
    } else {
      res = await fetch('/api/petani/produk', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({...body, foto_url}) })
    }
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); return }
    toast.success(editItem ? 'Produk diperbarui!' : 'Produk ditambahkan!')
    resetForm(); load()
  }

  const hapus = async (id: number) => {
    if (!confirm('Hapus produk ini?')) return
    await fetch(`/api/produk/${id}`, { method: 'DELETE' })
    toast.success('Produk dihapus.')
    load()
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold text-gray-900">🌿 Produk Saya</h1>
        <button onClick={() => setShowForm(true)} className="btn-green">+ Tambah Produk</button>
      </div>

      {/* Form tambah/edit */}
      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="font-bold text-gray-900 mb-4">{editItem ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
          <form onSubmit={submit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Nama Produk</label>
                <input className="input" value={form.nama} onChange={f('nama')} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Kategori</label>
                <select className="input" value={form.kategori_id} onChange={f('kategori_id')}>
                  {kategoris.map((k: any) => <option key={k.id} value={k.id}>{k.icon} {k.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Harga (Rp)</label>
                <input className="input" type="number" min="0" value={form.harga} onChange={f('harga')} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Satuan</label>
                <input className="input" placeholder="kg / ikat / paket" value={form.satuan} onChange={f('satuan')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Stok</label>
                <input className="input" type="number" min="0" value={form.stok} onChange={f('stok')} required />
              </div>
              <div className="flex items-center gap-3 pt-6">
                <input type="checkbox" id="organik" checked={form.is_organik}
                  onChange={e => setForm(p => ({ ...p, is_organik: e.target.checked }))}
                  className="w-4 h-4 accent-green-600" />
                <label htmlFor="organik" className="text-sm font-medium text-gray-700">🌿 Produk Organik</label>
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Foto Produk (opsional)</label>
              <label className={`border-2 border-dashed rounded-xl p-4 flex items-center gap-4 cursor-pointer transition-all ${fotoPreview ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}>
                {fotoPreview ? (
                  <img src={fotoPreview} alt="Preview" className="w-20 h-20 object-cover rounded-lg" />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-3xl">📷</div>
                )}
                <div>
                  <div className="text-sm font-medium text-gray-700">{fotoPreview ? 'Ganti foto' : 'Upload foto produk'}</div>
                  <div className="text-xs text-gray-400 mt-0.5">JPG, PNG, max 5MB</div>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) { setFotoFile(file); setFotoPreview(URL.createObjectURL(file)) }
                }} />
              </label>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Deskripsi</label>
              <textarea className="input resize-none" rows={3} value={form.deskripsi} onChange={f('deskripsi')} />
            </div>
            <div className="flex gap-3">
              <button type="submit" className="btn-green">{editItem ? 'Simpan' : 'Tambah'}</button>
              <button type="button" onClick={resetForm} className="btn-outline">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel produk */}
      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : produk.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-gray-500">Belum ada produk. Tambahkan produk pertamamu!</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Produk</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kategori</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Harga</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stok</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Terjual</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Aksi</th>
            </tr></thead>
            <tbody>
              {produk.map((p: any) => (
                <tr key={p.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-green-50 flex items-center justify-center shrink-0 border border-gray-200">
                        {p.foto_url
                          ? <img src={p.foto_url} alt={p.nama} className="w-full h-full object-cover" />
                          : <span className="text-2xl">{p.kategori?.icon || '🌿'}</span>
                        }
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{p.nama}</div>
                        {p.is_organik && <span className="badge-green text-[10px]">🌿 Organik</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.kategori?.nama}</td>
                  <td className="px-4 py-3 font-semibold text-green-700">{rupiah(p.harga)}/{p.satuan}</td>
                  <td className="px-4 py-3">
                    {p.stok <= 5
                      ? <span className="badge-red">{p.stok}</span>
                      : <span className="text-gray-900">{p.stok}</span>}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.total_terjual}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="btn-outline btn-sm text-xs">Edit</button>
                      <button onClick={() => hapus(p.id)} className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-2.5 py-1 rounded-lg hover:bg-red-100 transition-colors">Hapus</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
