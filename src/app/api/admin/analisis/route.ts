import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export const revalidate = 0

export async function GET() {
  try {
    const user = await getSession()
    if (!user || user.role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [
      { data: pesanan },
      { data: detailPesanan },
      { data: produk },
      { count: totalKonsumen },
      { count: totalPetani },
    ] = await Promise.all([
      supabaseAdmin.from('pesanan').select('created_at, total_bayar, status, metode_bayar, rating').order('created_at', { ascending: true }),
      supabaseAdmin.from('detail_pesanan').select('produk_id, jumlah, subtotal, produk(nama)'),
      supabaseAdmin.from('produk').select('kategori_id, terjual, harga, stok, is_organik, rating, kategori(nama)'),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'konsumen'),
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'petani'),
    ])

    // ── Penjualan per bulan (6 bulan terakhir) ──────────────
    const now = new Date()
    const bulanMap: Record<string, { bulan: string; pendapatan: number; jumlahOrder: number }> = {}
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

    // ── Distribusi metode bayar ──────────────────────────────
    const metodeBayar: Record<string, number> = { QRIS: 0, 'Transfer Bank': 0, COD: 0 }
    pesanan?.forEach((p: any) => {
      if (p.status !== 'dibatalkan' && p.metode_bayar) {
        const m = p.metode_bayar.toLowerCase()
        if (m.includes('qris')) metodeBayar['QRIS']++
        else if (m.includes('transfer') || m.includes('bank') || m.includes('bri')) metodeBayar['Transfer Bank']++
        else if (m.includes('cod')) metodeBayar['COD']++
      }
    })
    const distribusiMetode = Object.entries(metodeBayar).map(([nama, jumlah]) => ({ nama, jumlah }))

    // ── Produk terlaris ──────────────────────────────────────
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

    // ── Distribusi kategori ──────────────────────────────────
    const kategoriMap: Record<string, { nama: string; jumlahProduk: number; totalTerjual: number }> = {}
    produk?.forEach((p: any) => {
      const nama = p.kategori?.nama || 'Lainnya'
      if (!kategoriMap[nama]) kategoriMap[nama] = { nama, jumlahProduk: 0, totalTerjual: 0 }
      kategoriMap[nama].jumlahProduk++
      kategoriMap[nama].totalTerjual += p.terjual || 0
    })
    const distribusiKategori = Object.values(kategoriMap).sort((a, b) => b.totalTerjual - a.totalTerjual)

    // ── Peak hours (jam transaksi) ───────────────────────────
    const jamMap: Record<number, number> = {}
    for (let i = 0; i < 24; i++) jamMap[i] = 0
    pesanan?.forEach((p: any) => {
      if (p.status !== 'dibatalkan') {
        const jam = new Date(p.created_at).getHours()
        jamMap[jam] = (jamMap[jam] || 0) + 1
      }
    })
    const peakHours = Object.entries(jamMap).map(([jam, jumlah]) => ({
      jam: `${String(jam).padStart(2, '0')}:00`,
      jumlah
    }))

    // ── Distribusi rating ────────────────────────────────────
    const ratingMap: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    pesanan?.forEach((p: any) => {
      if (p.rating && p.status !== 'dibatalkan') {
        ratingMap[p.rating] = (ratingMap[p.rating] || 0) + 1
      }
    })
    const distribusiRating = Object.entries(ratingMap).map(([rating, jumlah]) => ({
      rating: `⭐ ${rating}`,
      jumlah
    }))

    // ── Kepuasan konsumen (puas >= 4, tidak puas < 4) ────────
    let puas = 0, tidakPuas = 0
    pesanan?.forEach((p: any) => {
      if (p.rating && p.status !== 'dibatalkan') {
        if (p.rating >= 4) puas++
        else tidakPuas++
      }
    })
    const kepuasan = [
      { nama: 'Puas (≥4)', jumlah: puas },
      { nama: 'Tidak Puas (<4)', jumlah: tidakPuas },
    ]

    // ── Organik vs Non-Organik ───────────────────────────────
    const organikMap: Record<string, { nama: string; jumlahProduk: number; totalTerjual: number }> = {
      organik: { nama: 'Organik', jumlahProduk: 0, totalTerjual: 0 },
      nonOrganik: { nama: 'Non-Organik', jumlahProduk: 0, totalTerjual: 0 },
    }
    produk?.forEach((p: any) => {
      const key = p.is_organik ? 'organik' : 'nonOrganik'
      organikMap[key].jumlahProduk++
      organikMap[key].totalTerjual += p.terjual || 0
    })
    const distribusiOrganik = Object.values(organikMap)

    // ── Summary ──────────────────────────────────────────────
    const totalPendapatan = pesanan
      ?.filter((p: any) => p.status === 'selesai')
      .reduce((sum: number, p: any) => sum + (p.total_bayar || 0), 0) || 0
    const totalOrder = pesanan?.length || 0
    const orderSelesai = pesanan?.filter((p: any) => p.status === 'selesai').length || 0
    const orderPending = pesanan?.filter((p: any) => p.status === 'menunggu').length || 0
    const ratingValues = pesanan?.filter((p: any) => p.rating).map((p: any) => p.rating) || []
    const ratingRata = ratingValues.length > 0
      ? (ratingValues.reduce((a: number, b: number) => a + b, 0) / ratingValues.length).toFixed(1)
      : '—'

    return NextResponse.json({
      penjualanPerBulan,
      distribusiMetode,
      produkTerlaris,
      distribusiKategori,
      peakHours,
      distribusiRating,
      kepuasan,
      distribusiOrganik,
      summary: {
        totalPendapatan, totalOrder, orderSelesai, orderPending,
        totalKonsumen: totalKonsumen || 0, totalPetani: totalPetani || 0,
        ratingRata, totalPuas: puas
      }
    })
  } catch (e: any) {
    console.error('analisis GET:', e)
    return NextResponse.json({ error: 'Gagal memuat data analisis.' }, { status: 500 })
  }
}
