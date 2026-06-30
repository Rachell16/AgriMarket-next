// src/app/api/prioritas/route.ts
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { klasifikasiPrioritas, ProdukFitur } from '@/lib/ai/prioritas'

export const revalidate = 0

export async function GET() {
  try {
    const user = await getSession()
    if (!user || (user.role !== 'petani' && user.role !== 'admin'))
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // 1. Ambil produk (petani -> miliknya, admin -> semua)
    let q = supabaseAdmin
      .from('produk')
      .select('id, nama, harga, stok, rating, is_organik, kategori_id, petani_id')
      .eq('is_aktif', true)
    if (user.role === 'petani') q = q.eq('petani_id', user.id)

    const { data: produk, error } = await q
    if (error) throw error
    if (!produk || produk.length === 0)
      return NextResponse.json({ data: [] }, { headers: { 'Cache-Control': 'no-store' } })

    // 2. Penjualan 30 hari terakhir per produk (detail_pesanan + pesanan.created_at)
    const sejak = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: detail } = await supabaseAdmin
      .from('detail_pesanan')
      .select('produk_id, jumlah, pesanan!inner(created_at)')
      .gte('pesanan.created_at', sejak)

    const terjualMap: Record<string, number> = {}
    for (const d of detail ?? []) {
      terjualMap[d.produk_id] = (terjualMap[d.produk_id] ?? 0) + (d.jumlah ?? 0)
    }

    // 3. Median harga per kategori (untuk rasio_harga)
    const hargaPerKat: Record<string, number[]> = {}
    for (const p of produk) (hargaPerKat[p.kategori_id] ??= []).push(p.harga)
    const medianKat: Record<string, number> = {}
    for (const k in hargaPerKat) {
      const arr = hargaPerKat[k].sort((a, b) => a - b)
      medianKat[k] = arr[Math.floor(arr.length / 2)] || 1
    }

    // 4. Klasifikasi tiap produk
    const hasil = produk.map((p) => {
      const fitur: ProdukFitur = {
        rating: p.rating ?? 0,
        stok: p.stok ?? 0,
        terjual_30hr: terjualMap[p.id] ?? 0,
        is_organik: p.is_organik ? 1 : 0,
        rasio_harga: +(p.harga / (medianKat[p.kategori_id] || p.harga)).toFixed(2),
      }
      const { prioritas, alasan, kesimpulan } = klasifikasiPrioritas(fitur)
      return { id: p.id, nama: p.nama, prioritas, alasan, kesimpulan, fitur }
    })

    const urutan: Record<string, number> = { Tinggi: 0, Sedang: 1, Rendah: 2 }
    hasil.sort((a, b) => urutan[a.prioritas] - urutan[b.prioritas])

    return NextResponse.json(
      { data: hasil, algoritma: 'Decision Tree' },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
