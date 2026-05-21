import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { nama, email, password, konfirm, role, telepon, alamat, nama_toko, lokasi } = await req.json()

  if (!nama || !email || !password || !konfirm)
    return NextResponse.json({ error: 'Semua field wajib diisi.' }, { status: 400 })
  if (password !== konfirm)
    return NextResponse.json({ error: 'Password tidak cocok.' }, { status: 400 })
  if (password.length < 6)
    return NextResponse.json({ error: 'Password minimal 6 karakter.' }, { status: 400 })
  if (role === 'petani' && !nama_toko)
    return NextResponse.json({ error: 'Nama toko wajib diisi.' }, { status: 400 })

  // Cek duplikasi email
  const { data: existing } = await supabaseAdmin.from('users').select('id').eq('email', email).single()
  if (existing) return NextResponse.json({ error: 'Email sudah terdaftar.' }, { status: 409 })

  const hash = await bcrypt.hash(password, 10)
  const { data: user, error } = await supabaseAdmin
    .from('users').insert({ nama, email, password: hash, role: role || 'konsumen', telepon, alamat })
    .select().single()

  if (error) return NextResponse.json({ error: 'Gagal membuat akun.' }, { status: 500 })

  if (role === 'petani') {
    await supabaseAdmin.from('petani_profil').insert({ user_id: user.id, nama_toko, lokasi })
  }

  const sessionData = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64')
  const { password: _, ...userSafe } = user

  const res = NextResponse.json({ user: userSafe })
  res.cookies.set('agrimarket_session', sessionData, {
    httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/'
  })
  return res
}
