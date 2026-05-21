import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const { data } = await supabaseAdmin
      .from('app_settings').select('*').eq('id', 1).single()
    
    const settings = data || {
      wa_number: '6281234567890',
      bank_name: 'BCA',
      bank_account: '1234567890',
      bank_holder: 'AgriMarket Kelompok 19',
      qris_image: null,
    }

    return NextResponse.json({ settings }, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' }
    })
  } catch {
    return NextResponse.json({ settings: {
      wa_number: '6281234567890',
      bank_name: 'BCA',
      bank_account: '1234567890',
      bank_holder: 'AgriMarket Kelompok 19',
      qris_image: null,
    }})
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await getSession()
    if (!user || user.role !== 'admin')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { data: existing } = await supabaseAdmin
      .from('app_settings').select('id').eq('id', 1).single()

    if (existing) {
      await supabaseAdmin.from('app_settings').update(body).eq('id', 1)
    } else {
      await supabaseAdmin.from('app_settings').insert({ id: 1, ...body })
    }
    return NextResponse.json({ ok: true })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}