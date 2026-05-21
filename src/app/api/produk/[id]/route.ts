import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSession } from '@/lib/auth'

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id)
    if (isNaN(id)) return NextResponse.json({ error: 'ID tidak valid.' }, { status: 400 })

    // Query produk + kategori
    const { data: produk, error } = await supabaseAdmin
      .from('produk')
      .select('*, kategori(id, nama, icon, slug)')
      .eq('id', id)
      .eq('is_aktif', true)
      .single()

    if (error || !produk) return NextResponse.json({ error: 'Produk tidak ditemukan.' }, { status: 404 })

    // Query petani info terpisah
    const [{ data: petaniUser }, { data: petaniProfil }, { data: ulasan }] = await Promise.all([
      supabaseAdmin.from('users').select('id, nama').eq('id', produk.petani_id).single(),
      supabaseAdmin.from('petani_profil').select('nama_toko, lokasi, rating, status_verifikasi, deskripsi_toko').eq('user_id', produk.petani_id).single(),
      supabaseAdmin.from('ulasan').select('*, users(nama)').eq('produk_id', id).order('created_at', { ascending: false }).limit(5),
    ])

    return NextResponse.json({
      produk: {
        ...produk,
        users: petaniUser,
        petani_profil: petaniProfil ? [petaniProfil] : [],
        ulasan: ulasan || [],
      }
    })
  } catch (e: any) {
    console.error('GET produk/[id]:', e)
    return NextResponse.json({ error: 'Terjadi kesalahan.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()
    if (!user || user.role !== 'petani') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { nama, deskripsi, harga, satuan, stok, kategori_id, is_organik, foto_url } = await req.json()
    if (!nama || !harga || stok === undefined)
      return NextResponse.json({ error: 'Nama, harga, stok wajib diisi.' }, { status: 400 })

    const updateData: any = { nama, deskripsi, harga, satuan, stok, kategori_id, is_organik }
    if (foto_url !== undefined) updateData.foto_url = foto_url

    const { data, error } = await supabaseAdmin
      .from('produk')
      .update(updateData)
      .eq('id', parseInt(params.id))
      .eq('petani_id', user.id)
      .select().single()

    if (error) throw error
    return NextResponse.json({ produk: data })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()
    if (!user || user.role !== 'petani') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await supabaseAdmin.from('produk').update({ is_aktif: false })
      .eq('id', parseInt(params.id)).eq('petani_id', user.id)
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}