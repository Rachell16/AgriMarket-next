import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { kodePesanan } from '@/lib/utils'

export async function GET() {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data, error } = await supabaseAdmin
      .from('pesanan')
      .select('*, detail_pesanan(id, nama_produk, jumlah, harga, subtotal)')
      .eq('konsumen_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ pesanan: data || [] })
  } catch (e: any) {
    console.error('GET pesanan:', e)
    return NextResponse.json({ error: 'Gagal memuat pesanan.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user || user.role !== 'konsumen')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { items, alamat, pengiriman, metode, catatan } = await req.json()

    if (!items?.length) return NextResponse.json({ error: 'Keranjang kosong.' }, { status: 400 })
    if (!alamat) return NextResponse.json({ error: 'Alamat pengiriman wajib diisi.' }, { status: 400 })

    // Validasi stok server-side
    for (const item of items) {
      const { data: produk } = await supabaseAdmin
        .from('produk').select('stok, nama').eq('id', item.produk_id).single()
      if (!produk || produk.stok < item.jumlah)
        return NextResponse.json({ error: `Stok ${produk?.nama || 'produk'} tidak mencukupi.` }, { status: 400 })
    }

    const subtotal   = items.reduce((s: number, i: any) => s + i.harga * i.jumlah, 0)
    const ongkir     = pengiriman === 'pagi' ? 15000 : 10000
    const totalBayar = subtotal + ongkir
    const kode       = kodePesanan()

    const { data: pesanan, error: errPesanan } = await supabaseAdmin
      .from('pesanan')
      .insert({
        kode_pesanan: kode, konsumen_id: user.id,
        total_harga: subtotal, ongkos_kirim: ongkir, total_bayar: totalBayar,
        alamat_kirim: alamat, opsi_pengiriman: pengiriman || 'pagi',
        metode_bayar: metode || 'transfer', catatan: catatan || null
      })
      .select().single()

    if (errPesanan) throw errPesanan

    // Insert detail & update stok
    for (const item of items) {
      await supabaseAdmin.from('detail_pesanan').insert({
        pesanan_id: pesanan.id, produk_id: item.produk_id, petani_id: item.petani_id,
        nama_produk: item.nama, harga: item.harga, jumlah: item.jumlah,
        subtotal: item.harga * item.jumlah
      })
      // Update stok & total_terjual
      const { data: p } = await supabaseAdmin
        .from('produk').select('stok, total_terjual').eq('id', item.produk_id).single()
      if (p) {
        await supabaseAdmin.from('produk').update({
          stok: Math.max(0, p.stok - item.jumlah),
          total_terjual: p.total_terjual + item.jumlah
        }).eq('id', item.produk_id)
      }
    }

    return NextResponse.json({ pesanan, kode })
  } catch (e: any) {
    console.error('POST pesanan:', e)
    return NextResponse.json({ error: 'Gagal membuat pesanan. Coba lagi.' }, { status: 500 })
  }
}
