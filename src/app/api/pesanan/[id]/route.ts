import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

// Update resi oleh petani
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSession()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()

    if (user.role === 'petani') {
      const { kurir, no_resi } = body
      if (!kurir || !no_resi)
        return NextResponse.json({ error: 'Kurir dan nomor resi wajib diisi.' }, { status: 400 })

      await supabaseAdmin.from('pesanan')
        .update({ kurir, no_resi, status: 'dikirim' })
        .eq('id', parseInt(params.id))

      return NextResponse.json({ ok: true })
    }

    if (user.role === 'konsumen') {
      const { bukti_bayar } = body
      await supabaseAdmin.from('pesanan')
        .update({ bukti_bayar, payment_status: 'pending' })
        .eq('id', parseInt(params.id))
        .eq('konsumen_id', user.id)

      return NextResponse.json({ ok: true })
    }

    if (user.role === 'admin') {
      const { payment_status } = body
      await supabaseAdmin.from('pesanan')
        .update({ payment_status })
        .eq('id', parseInt(params.id))

      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
