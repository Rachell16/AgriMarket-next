import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q    = searchParams.get('q') || ''
  const kat  = searchParams.get('kat') || ''
  const sort = searchParams.get('sort') || 'populer'

  try {
    // Step 1: ambil produk
    let query = supabaseAdmin
      .from('produk')
      .select('*, kategori(id, nama, icon, slug)')
      .eq('is_aktif', true)

    if (q) query = query.ilike('nama', `%${q}%`)

    if (sort === 'harga_asc')   query = query.order('harga', { ascending: true })
    else if (sort === 'harga_desc') query = query.order('harga', { ascending: false })
    else if (sort === 'terbaru')    query = query.order('created_at', { ascending: false })
    else                            query = query.order('total_terjual', { ascending: false })

    const { data: produk, error: errProduk } = await query.limit(50)
    if (errProduk) throw errProduk

    let result = produk || []

    // Filter kategori manual
    if (kat) result = result.filter((p: any) => p.kategori?.slug === kat)

    // Step 2: ambil nama petani & toko secara terpisah
    const petaniIds = [...new Set(result.map((p: any) => p.petani_id))]

    if (petaniIds.length > 0) {
      const [{ data: users }, { data: profils }] = await Promise.all([
        supabaseAdmin.from('users').select('id, nama').in('id', petaniIds),
        supabaseAdmin.from('petani_profil').select('user_id, nama_toko').in('user_id', petaniIds),
      ])

      const userMap: Record<string, string> = {}
      const tokoMap: Record<string, string> = {}
      users?.forEach((u: any) => { userMap[u.id] = u.nama })
      profils?.forEach((p: any) => { tokoMap[p.user_id] = p.nama_toko })

      result = result.map((p: any) => ({
        ...p,
        nama_petani: userMap[p.petani_id] || '',
        nama_toko:   tokoMap[p.petani_id] || userMap[p.petani_id] || '',
      }))
    }

    return NextResponse.json({ produk: result })
  } catch (err: any) {
    console.error('API /produk error:', err)
    return NextResponse.json({ error: err.message || 'Terjadi kesalahan.' }, { status: 500 })
  }
}
