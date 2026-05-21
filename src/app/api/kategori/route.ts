import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  const { data } = await supabaseAdmin.from('kategori').select('*').order('id')
  return NextResponse.json({ kategoris: data || [] })
}
