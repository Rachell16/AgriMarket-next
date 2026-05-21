'use client'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { rupiah } from '@/lib/utils'

const DEFAULT_CONFIG = {
  wa_number: '6281234567890',
  bank_name: 'BCA',
  bank_account: '1234567890',
  bank_holder: 'AgriMarket Kelompok 19',
  qris_image: '',
}

function PembayaranContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const kode      = searchParams.get('kode') || ''
  const total     = parseInt(searchParams.get('total') || '0')
  const metode    = searchParams.get('metode') || 'transfer'
  const pesananId = searchParams.get('id') || ''

  const [config, setConfig] = useState(DEFAULT_CONFIG)
  const [confirmed, setConfirmed] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [buktiFile, setBuktiFile] = useState<File | null>(null)
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d.settings && d.settings.qris_image !== undefined) {
          setConfig(prev => ({ ...prev, ...d.settings }))
        }
      })
  }, [])

  const handleKonfirmasi = async () => {
    if (!buktiFile && metode !== 'cod') { toast.error('Upload bukti pembayaran!'); return }
    setUploading(true)

    let buktiUrl = null
    if (buktiFile) {
      const { createClient } = await import('@supabase/supabase-js')
      const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
      const fileName = `bukti-${kode}-${Date.now()}.${buktiFile.name.split('.').pop()}`
      const { error } = await supabase.storage.from('bukti-bayar').upload(fileName, buktiFile)
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('bukti-bayar').getPublicUrl(fileName)
        buktiUrl = publicUrl
      }
    }

    if (pesananId) {
      await fetch(`/api/pesanan/${pesananId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bukti_bayar: buktiUrl }),
      })
    }

    setUploading(false)
    setConfirmed(true)
    toast.success('Konfirmasi pembayaran berhasil!')
  }

  const handleWA = () => {
    const msg = encodeURIComponent(
      `Halo AgriMarket! Saya sudah melakukan pembayaran:\n\nKode: ${kode}\nTotal: ${rupiah(total)}\nMetode: ${metode.toUpperCase()}\n\nMohon konfirmasi. Terima kasih! 🌱`
    )
    window.open(`https://wa.me/${config.wa_number}?text=${msg}`, '_blank')
  }

  if (confirmed) return (
    <>
      <Navbar />
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="text-6xl mb-4">✅</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pembayaran Dikonfirmasi!</h1>
        <p className="text-gray-500 mb-2">Kode: <strong className="text-green-700">{kode}</strong></p>
        <p className="text-gray-500 mb-8">Pesanan sedang diproses oleh petani.</p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link href="/pesanan" className="btn-green">Lihat Pesanan Saya</Link>
          <button onClick={handleWA} className="btn-outline flex items-center gap-2">📱 Hubungi via WA</button>
        </div>
      </div>
      <Footer />
    </>
  )

  return (
    <>
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-10">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💳</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Selesaikan Pembayaran</h1>
          <p className="text-gray-500 text-sm">Kode: <strong className="text-green-700">{kode}</strong></p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center mb-6">
          <div className="text-sm text-green-700 mb-1 font-medium">Total Pembayaran</div>
          <div className="text-3xl font-bold text-green-700">{rupiah(total)}</div>
        </div>

        {(metode === 'transfer' || metode === 'ewallet') && (
          <div className="card p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-4">🏦 Transfer Bank</h2>
            <div className="space-y-3">
              {[['Bank', config.bank_name], ['Nomor Rekening', config.bank_account], ['Atas Nama', config.bank_holder]].map(([lbl, val]) => (
                <div key={lbl} className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-500 text-sm">{lbl}</span>
                  <div className="flex items-center gap-2">
                    <strong>{val}</strong>
                    <button onClick={() => { navigator.clipboard.writeText(val); toast.success('Disalin!') }}
                      className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium hover:bg-green-200">Salin</button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center py-2">
                <span className="text-gray-500 text-sm">Jumlah</span>
                <div className="flex items-center gap-2">
                  <strong className="text-green-700">{rupiah(total)}</strong>
                  <button onClick={() => { navigator.clipboard.writeText(String(total)); toast.success('Disalin!') }}
                    className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium hover:bg-green-200">Salin</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {metode === 'qris' && (
          <div className="card p-6 mb-6 text-center">
            <h2 className="font-bold text-gray-900 mb-4">📱 Pembayaran QRIS</h2>
            {config.qris_image ? (
              <img src={config.qris_image} alt="QRIS" className="w-56 h-56 mx-auto mb-3 rounded-xl border border-gray-200 object-contain" />
            ) : (
              <div className="w-56 h-56 mx-auto mb-3 bg-gray-100 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-sm text-center p-4">
                Gambar QRIS belum diupload.<br/>Admin dapat mengupload di Dashboard Admin → Pengaturan Bayar
              </div>
            )}
            <p className="text-gray-500 text-sm">Scan QR code di atas dengan aplikasi e-wallet</p>
            <p className="font-bold text-green-700 mt-2">{rupiah(total)}</p>
          </div>
        )}

        {metode === 'cod' && (
          <div className="card p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-3">💰 Bayar di Tempat (COD)</h2>
            <p className="text-gray-500 text-sm">Siapkan uang <strong className="text-green-700">{rupiah(total)}</strong> untuk kurir saat produk tiba.</p>
          </div>
        )}

        {metode !== 'cod' && (
          <div className="card p-6 mb-6">
            <h2 className="font-bold text-gray-900 mb-3">📎 Upload Bukti Pembayaran</h2>
            <label className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center cursor-pointer transition-all ${buktiPreview ? 'border-green-400 bg-green-50' : 'border-gray-300 hover:border-green-400'}`}>
              {buktiPreview
                ? <img src={buktiPreview} alt="Bukti" className="w-full max-h-48 object-contain rounded-lg mb-2" />
                : <><div className="text-3xl mb-2">📸</div><div className="text-sm font-medium text-gray-700">Klik untuk upload bukti</div><div className="text-xs text-gray-400 mt-1">JPG, PNG, max 5MB</div></>
              }
              <input type="file" accept="image/*" className="hidden" onChange={e => {
                const file = e.target.files?.[0]
                if (file) { setBuktiFile(file); setBuktiPreview(URL.createObjectURL(file)) }
              }} />
            </label>
          </div>
        )}

        <div className="space-y-3">
          <button onClick={handleKonfirmasi} disabled={uploading}
            className="w-full btn-green py-3 justify-center text-base font-bold disabled:opacity-60">
            {uploading ? 'Mengupload...' : metode === 'cod' ? '✅ Konfirmasi Pesanan COD' : '✅ Konfirmasi Sudah Bayar'}
          </button>
          <button onClick={handleWA}
            className="w-full flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold py-3 rounded-xl hover:bg-[#1da851] transition-colors">
            📱 Konfirmasi via WhatsApp
          </button>
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function PembayaranPage() {
  return <Suspense fallback={<div className="p-10 text-center text-gray-400">Memuat...</div>}><PembayaranContent /></Suspense>
}