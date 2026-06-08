import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@supabase/supabase-js'
import jwt from 'jsonwebtoken'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const revalidate = 0

export async function GET() {
  // Auth check
  const token = cookies().get('token')?.value
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || 'agrimarket19') as any
    if (payload.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Penjualan per bulan (6 bulan terakhir)
  const { data: pesanan } = await supabase
    .from('pesanan')
    .select('created_at, total_bayar, status, metode_bayar')
    .order('created_at', { ascending: true })

  // 2. Produk terlaris
  const { data: detailPesanan } = await supabase
    .from('detail_pesanan')
    .select('produk_id, jumlah, subtotal, produk(nama)')

  // 3. Kategori produk
  const { data: produk } = await supabase
    .from('produk')
    .select('kategori_id, terjual, harga, stok, kategori(nama)')

  // 4. Stats summary
  const { count: totalKonsumen } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'konsumen')

  const { count: totalPetani } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'petani')

  // Process: penjualan per bulan
  const bulanMap: Record<string, { bulan: string; pendapatan: number; jumlahOrder: number }> = {}
  const now = new Date()
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' })
    bulanMap[key] = { bulan: label, pendapatan: 0, jumlahOrder: 0 }
  }
  pesanan?.forEach((p: any) => {
    const d = new Date(p.created_at)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (bulanMap[key] && p.status !== 'dibatalkan') {
      bulanMap[key].pendapatan += p.total_bayar || 0
      bulanMap[key].jumlahOrder += 1
    }
  })
  const penjualanPerBulan = Object.values(bulanMap)

  // Process: metode bayar
  const metodeBayar: Record<string, number> = { QRIS: 0, 'Transfer BRI': 0, COD: 0 }
  pesanan?.forEach((p: any) => {
    if (p.status !== 'dibatalkan' && p.metode_bayar) {
      const m = p.metode_bayar
      if (m?.toLowerCase().includes('qris')) metodeBayar['QRIS']++
      else if (m?.toLowerCase().includes('bri') || m?.toLowerCase().includes('transfer')) metodeBayar['Transfer BRI']++
      else if (m?.toLowerCase().includes('cod')) metodeBayar['COD']++
    }
  })
  const distribusiMetode = Object.entries(metodeBayar).map(([nama, jumlah]) => ({ nama, jumlah }))

  // Process: produk terlaris
  const produkMap: Record<string, { nama: string; total: number; pendapatan: number }> = {}
  detailPesanan?.forEach((d: any) => {
    const id = d.produk_id
    const nama = d.produk?.nama || 'Unknown'
    if (!produkMap[id]) produkMap[id] = { nama, total: 0, pendapatan: 0 }
    produkMap[id].total += d.jumlah || 0
    produkMap[id].pendapatan += d.subtotal || 0
  })
  const produkTerlaris = Object.values(produkMap)
    .sort((a, b) => b.total - a.total)
    .slice(0, 6)

  // Process: distribusi kategori
  const kategoriMap: Record<string, { nama: string; jumlahProduk: number; totalTerjual: number }> = {}
  produk?.forEach((p: any) => {
    const nama = p.kategori?.nama || 'Lainnya'
    if (!kategoriMap[nama]) kategoriMap[nama] = { nama, jumlahProduk: 0, totalTerjual: 0 }
    kategoriMap[nama].jumlahProduk++
    kategoriMap[nama].totalTerjual += p.terjual || 0
  })
  const distribusiKategori = Object.values(kategoriMap).sort((a, b) => b.totalTerjual - a.totalTerjual)

  // Summary stats
  const totalPendapatan = pesanan
    ?.filter((p: any) => p.status === 'selesai')
    .reduce((sum: number, p: any) => sum + (p.total_bayar || 0), 0) || 0

  const totalOrder = pesanan?.length || 0
  const orderSelesai = pesanan?.filter((p: any) => p.status === 'selesai').length || 0
  const orderPending = pesanan?.filter((p: any) => p.status === 'menunggu').length || 0

  return NextResponse.json({
    penjualanPerBulan,
    distribusiMetode,
    produkTerlaris,
    distribusiKategori,
    summary: {
      totalPendapatan,
      totalOrder,
      orderSelesai,
      orderPending,
      totalKonsumen: totalKonsumen || 0,
      totalPetani: totalPetani || 0,
    }
  })
}
