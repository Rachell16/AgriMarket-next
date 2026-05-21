import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const user = await getSession()
  if (!user || user.role !== 'petani') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabaseAdmin
    .from('produk')
    .select('*, kategori(nama, icon, slug)')
    .eq('petani_id', user.id)
    .eq('is_aktif', true)
    .order('created_at', { ascending: false })

  return NextResponse.json({ produk: data || [] })
}

export async function POST(req: NextRequest) {
  const user = await getSession()
  if (!user || user.role !== 'petani') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { nama, deskripsi, harga, satuan, stok, kategori_id, is_organik, foto_url } = await req.json()

  if (!nama || !harga || stok === undefined)
    return NextResponse.json({ error: 'Nama, harga, stok wajib diisi.' }, { status: 400 })

  const { data, error } = await supabaseAdmin
    .from('produk')
    .insert({ petani_id: user.id, nama, deskripsi, harga, satuan: satuan || 'kg', stok, kategori_id: kategori_id || 1, is_organik: is_organik || false, foto_url: foto_url || null })
    .select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ produk: data })
}