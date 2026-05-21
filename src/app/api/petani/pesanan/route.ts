import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'petani') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { pesanan_id, status } = await req.json()
  const allowed = ['dikonfirmasi', 'dikirim', 'selesai', 'dibatalkan']
  if (!allowed.includes(status)) return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 })

  // Cek stok sebelum konfirmasi
  if (status === 'dikonfirmasi') {
    const { data: details } = await supabaseAdmin
      .from('detail_pesanan').select('produk_id, jumlah, produk(stok, nama)')
      .eq('pesanan_id', pesanan_id)
    for (const d of details || []) {
      const produk = (d as any).produk
      if (produk?.stok < d.jumlah)
        return NextResponse.json({ error: `Stok ${produk.nama} tidak mencukupi untuk dikonfirmasi.` }, { status: 400 })
    }
  }

  await supabaseAdmin.from('pesanan').update({ status }).eq('id', pesanan_id)
  return NextResponse.json({ ok: true })
}
