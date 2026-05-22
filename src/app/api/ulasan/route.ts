import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user || user.role !== 'konsumen')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { produk_id, pesanan_id, rating, komentar } = await req.json()

    if (!produk_id || !pesanan_id || !rating)
      return NextResponse.json({ error: 'Data tidak lengkap.' }, { status: 400 })
    if (rating < 1 || rating > 5)
      return NextResponse.json({ error: 'Rating harus antara 1-5.' }, { status: 400 })

    // Cek apakah pesanan milik user ini dan sudah selesai
    const { data: pesanan } = await supabaseAdmin
      .from('pesanan').select('status').eq('id', pesanan_id).eq('konsumen_id', user.id).single()
    if (!pesanan)
      return NextResponse.json({ error: 'Pesanan tidak ditemukan.' }, { status: 404 })
    if (pesanan.status !== 'selesai')
      return NextResponse.json({ error: 'Pesanan belum selesai.' }, { status: 400 })

    // Cek duplikasi
    const { data: existing } = await supabaseAdmin
      .from('ulasan').select('id').eq('produk_id', produk_id).eq('user_id', user.id).eq('pesanan_id', pesanan_id).single()
    if (existing)
      return NextResponse.json({ error: 'Kamu sudah memberikan ulasan untuk produk ini.' }, { status: 409 })

    // Insert ulasan
    const { error: errInsert } = await supabaseAdmin
      .from('ulasan').insert({ produk_id, user_id: user.id, pesanan_id, rating, komentar })
    if (errInsert) throw errInsert

    // Update rating produk (rata-rata)
    const { data: allUlasan } = await supabaseAdmin
      .from('ulasan').select('rating').eq('produk_id', produk_id)
    if (allUlasan && allUlasan.length > 0) {
      const avgRating = allUlasan.reduce((s: number, u: any) => s + u.rating, 0) / allUlasan.length
      const roundedRating = Math.round(avgRating * 10) / 10
      await supabaseAdmin.from('produk').update({
        rating: roundedRating,
      }).eq('id', produk_id)
    }

    // Update rating petani (rata-rata semua produk petani)
    const { data: produkData } = await supabaseAdmin
      .from('produk').select('petani_id').eq('id', produk_id).single()
    if (produkData?.petani_id) {
      const { data: semuaUlasanPetani } = await supabaseAdmin
        .from('ulasan')
        .select('rating, produk!inner(petani_id)')
        .eq('produk.petani_id', produkData.petani_id)
      if (semuaUlasanPetani && semuaUlasanPetani.length > 0) {
        const avgPetani = semuaUlasanPetani.reduce((s: number, u: any) => s + u.rating, 0) / semuaUlasanPetani.length
        await supabaseAdmin.from('petani_profil').update({
          rating: Math.round(avgPetani * 10) / 10,
          total_ulasan: semuaUlasanPetani.length
        }).eq('user_id', produkData.petani_id)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    console.error('ulasan error:', e)
    return NextResponse.json({ error: 'Gagal menyimpan ulasan.' }, { status: 500 })
  }
}