import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const user = await getSession()
    if (!user || user.role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [
      { count: cUser },
      { count: cPetani },
      { count: cPend },
      { count: cTx },
      { data: pendingPetani },
      { data: transaksi }
    ] = await Promise.all([
      supabaseAdmin.from('users').select('*', { count: 'exact', head: true }).eq('role', 'konsumen'),
      supabaseAdmin.from('petani_profil').select('*', { count: 'exact', head: true }).eq('status_verifikasi', 'terverifikasi'),
      supabaseAdmin.from('petani_profil').select('*', { count: 'exact', head: true }).eq('status_verifikasi', 'pending'),
      supabaseAdmin.from('pesanan').select('*', { count: 'exact', head: true }),
      supabaseAdmin.from('petani_profil')
        .select('*, users(nama, email, created_at)')
        .eq('status_verifikasi', 'pending')
        .order('created_at', { ascending: false }),
      supabaseAdmin.from('pesanan')
        .select('*, users!konsumen_id(nama)')
        .order('created_at', { ascending: false })
        .limit(10),
    ])

    return NextResponse.json({ stats: { cUser, cPetani, cPend, cTx }, pendingPetani: pendingPetani || [], transaksi: transaksi || [] })
  } catch (e: any) {
    console.error('admin GET:', e)
    return NextResponse.json({ error: 'Gagal memuat data admin.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user || user.role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action, user_id, pesanan_id, status } = await req.json()

    if (action === 'verifikasi' && user_id && status) {
      if (!['terverifikasi', 'ditolak'].includes(status))
        return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 })
      await supabaseAdmin.from('petani_profil').update({ status_verifikasi: status }).eq('user_id', user_id)
      return NextResponse.json({ ok: true })
    }

    if (action === 'update_status' && pesanan_id && status) {
      if (!['menunggu','dikonfirmasi','dikirim','selesai','dibatalkan'].includes(status))
        return NextResponse.json({ error: 'Status tidak valid.' }, { status: 400 })
      await supabaseAdmin.from('pesanan').update({ status }).eq('id', pesanan_id)
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Action tidak valid.' }, { status: 400 })
  } catch (e: any) {
    console.error('admin POST:', e)
    return NextResponse.json({ error: 'Terjadi kesalahan.' }, { status: 500 })
  }
}
