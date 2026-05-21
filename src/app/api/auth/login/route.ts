import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  if (!email || !password)
    return NextResponse.json({ error: 'Email dan password wajib diisi.' }, { status: 400 })

  const { data: user } = await supabaseAdmin
    .from('users').select('*').eq('email', email).single()

  if (!user)
    return NextResponse.json({ error: 'Email tidak terdaftar.' }, { status: 401 })

  const valid = await bcrypt.compare(password, user.password)
  if (!valid)
    return NextResponse.json({ error: 'Password tidak sesuai.' }, { status: 401 })

  // Cek verifikasi petani
  if (user.role === 'petani') {
    const { data: profil } = await supabaseAdmin
      .from('petani_profil').select('status_verifikasi').eq('user_id', user.id).single()
    if (profil?.status_verifikasi === 'pending')
      return NextResponse.json({ error: 'Akun petani belum diverifikasi admin.' }, { status: 403 })
    if (profil?.status_verifikasi === 'ditolak')
      return NextResponse.json({ error: 'Akun petani ditolak. Hubungi admin.' }, { status: 403 })
  }

  const sessionData = Buffer.from(JSON.stringify({ userId: user.id })).toString('base64')
  const { password: _, ...userSafe } = user

  const res = NextResponse.json({ user: userSafe })
  res.cookies.set('agrimarket_session', sessionData, {
    httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 7, path: '/'
  })
  return res
}
