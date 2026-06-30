'use client'
import { useEffect, useState } from 'react'
import { rupiah } from '@/lib/utils'
import toast from 'react-hot-toast'
import { BadgePrioritas } from '@/components/BadgePrioritas'

export default function DashboardPetaniProdukPage() {
  const [produk, setProduk] = useState<any[]>([])
  const [prioritasMap, setPrioritasMap] = useState<Record<number, { prioritas: 'Tinggi'|'Sedang'|'Rendah'; alasan: string[]; kesimpulan?: string }>>({})
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
      fetch('/api/prioritas').then(r => r.json()),
    ]).then(([p, k, pr]) => {
      setProduk(p.produk||[])
      setKategoris(k.kategoris||[])
      const map: Record<number, any> = {}
      ;(pr.data||[]).forEach((x:any) => { map[x.id] = { prioritas: x.prioritas, alasan: x.alasan, kesimpulan: x.kesimpulan } })
      setPrioritasMap(map)
      setLoading(false)
    })
  }
  useEffect(load, [])

  const openEdit = (p: any) => {
    setEditItem(p)
    setFotoPreview(p.foto_url || null)
    setFotoFile(null)
    setForm({ nama:p.nama, deskripsi:p.deskripsi||'', harga:String(p.harga), satuan:p.satuan, stok:String(p.stok), kategori_id:String(p.kategori_id), is_organik:p.is_organik })
    setShowForm(true)
    window.scrollTo(0,0)
  }

  const resetForm = () => {
    setShowForm(false); setEditItem(null)
    setFotoFile(null); setFotoPreview(null)
    setForm({ nama:'', deskripsi:'', harga:'', satuan:'kg', stok:'', kategori_id:'1', is_organik:false })
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const body = { ...form, harga:Number(form.harga), stok:Number(form.stok), kategori_id:Number(form.kategori_id) }

    let foto_url = editItem?.foto_url || null
    if (fotoFile) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
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
      res = await fetch(`/api/produk/${editItem.id}`, { method:'PUT', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...body, foto_url}) })
    } else {
      res = await fetch('/api/petani/produk', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...body, foto_url}) })
    }
    const data = await res.json()
    if (!res.ok) { toast.error(data.error); return }
    toast.success(editItem ? 'Produk diperbarui!' : 'Produk ditambahkan!')
    resetForm(); load()
  }

  const hapus = async (id: number) => {
    if (!confirm('Hapus produk ini?')) return
    await fetch(`/api/produk/${id}`, { method:'DELETE' })
    toast.success('Produk dihapus.')
    load()
  }

  const f = (k: string) => (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }))

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-5">
        <h1 className="text-lg font-bold text-gray-900">🌿 Produk Saya</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-green btn-sm text-xs">+ Tambah</button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="card p-4 mb-5">
          <h2 className="font-bold text-gray-900 text-sm mb-4">{editItem ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nama Produk</label>
                <input className="input" value={form.nama} onChange={f('nama')} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Kategori</label>
                <select className="input" value={form.kategori_id} onChange={f('kategori_id')}>
                  {kategoris.map((k:any) => <option key={k.id} value={k.id}>{k.icon} {k.nama}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Satuan</label>
                <input className="input" placeholder="kg / ikat / paket" value={form.satuan} onChange={f('satuan')} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Harga (Rp)</label>
                <input className="input" type="number" min="0" value={form.harga} onChange={f('harga')} required />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Stok</label>
                <input className="input" type="number" min="0" value={form.stok} onChange={f('stok')} required />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <input type="checkbox" id="organik" checked={form.is_organik}
                onChange={e => setForm(p => ({...p, is_organik:e.target.checked}))}
                className="w-4 h-4 accent-green-600" />
              <label htmlFor="organik" className="text-sm font-medium text-gray-700">🌿 Produk Organik</label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Deskripsi</label>
              <textarea className="input resize-none" rows={2} value={form.deskripsi} onChange={f('deskripsi')} />
            </div>

            {/* Foto upload */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Foto Produk</label>
              <label className={`border-2 border-dashed rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-all ${fotoPreview?'border-green-400 bg-green-50':'border-gray-300'}`}>
                {fotoPreview
                  ? <img src={fotoPreview} alt="" className="w-14 h-14 object-cover rounded-lg" />
                  : <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">📷</div>
                }
                <div>
                  <div className="text-sm font-medium text-gray-700">{fotoPreview?'Ganti foto':'Upload foto'}</div>
                  <div className="text-xs text-gray-400">JPG/PNG, max 5MB</div>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) { setFotoFile(file); setFotoPreview(URL.createObjectURL(file)) }
                }} />
              </label>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="flex-1 btn-green justify-center">{editItem?'Simpan':'Tambah'}</button>
              <button type="button" onClick={resetForm} className="btn-outline px-5">Batal</button>
            </div>
          </form>
        </div>
      )}

      {/* Daftar produk - card layout */}
      {loading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_,i) => <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" />)}</div>
      ) : produk.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-3">🌱</div>
          <p className="text-gray-400 text-sm">Belum ada produk.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {produk.map((p: any) => (
            <div key={p.id} className="card p-4 flex gap-3 items-start">
              {/* Foto/Emoji */}
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-green-50 flex items-center justify-center shrink-0 border border-gray-200">
                {p.foto_url
                  ? <img src={p.foto_url} alt={p.nama} className="w-full h-full object-cover" onError={e => { (e.target as any).style.display='none' }} />
                  : <span className="text-2xl">{p.kategori?.icon||'🌿'}</span>
                }
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900 text-sm truncate">{p.nama}</div>
                    <div className="text-xs text-gray-400">{p.kategori?.nama}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-green-700 text-sm">{rupiah(p.harga)}<span className="text-gray-400 font-normal text-xs">/{p.satuan}</span></div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {p.is_organik && <span className="badge-green text-[10px]">🌿 Organik</span>}
                  <span className={`text-xs ${p.stok<=5?'text-red-500 font-semibold':'text-gray-500'}`}>Stok: {p.stok}</span>
                  <span className="text-xs text-gray-400">{p.total_terjual} terjual</span>
                  {prioritasMap[p.id] && (
                    <BadgePrioritas
                      prioritas={prioritasMap[p.id].prioritas}
                      alasan={prioritasMap[p.id].alasan}
                      kesimpulan={prioritasMap[p.id].kesimpulan}
                    />
                  )}
                </div>
                <div className="flex gap-2 mt-2">
                  <button onClick={() => openEdit(p)} className="flex-1 btn-outline btn-sm text-xs justify-center">✏️ Edit</button>
                  <button onClick={() => hapus(p.id)} className="bg-red-50 text-red-600 border border-red-200 text-xs font-semibold px-3 py-1.5 rounded-lg">🗑</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
