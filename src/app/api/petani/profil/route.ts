import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const user = await getSession()
    if (!user || user.role !== 'petani')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: profil } = await supabaseAdmin
      .from('petani_profil').select('*').eq('user_id', user.id).single()

    return NextResponse.json({ profil })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user || user.role !== 'petani')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { nama, telepon, alamat, nama_toko, deskripsi_toko, lokasi } = await req.json()

    if (!nama) return NextResponse.json({ error: 'Nama wajib diisi.' }, { status: 400 })

    await Promise.all([
      supabaseAdmin.from('users').update({ nama, telepon, alamat }).eq('id', user.id),
      supabaseAdmin.from('petani_profil').update({ nama_toko, deskripsi_toko, lokasi }).eq('user_id', user.id),
    ])

    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
