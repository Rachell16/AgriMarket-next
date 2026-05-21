import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

function hitungScore(produk: any, maxTerjual: number): number {
  const ratingScore  = (produk.rating / 5) * 0.4
  const terjualScore = (produk.total_terjual / (maxTerjual || 1)) * 0.4
  const stokScore    = produk.stok > 0 ? (Math.min(produk.stok, 50) / 50) * 0.2 : 0
  const organikBonus = produk.is_organik ? 0.05 : 0
  return ratingScore + terjualScore + stokScore + organikBonus
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const excludeId = searchParams.get('exclude_id')
    const limit     = parseInt(searchParams.get('limit') || '8')

    let query = supabaseAdmin
      .from('produk').select('*, kategori(nama, icon, slug)')
      .eq('is_aktif', true).gt('stok', 0)
    if (excludeId) query = query.neq('id', parseInt(excludeId))

    const { data: produkList, error } = await query.limit(100)
    if (error) throw error

    const list = produkList || []
    const maxTerjual = Math.max(...list.map((p: any) => p.total_terjual), 1)
    const scored = list
      .map((p: any) => ({ ...p, ai_score: hitungScore(p, maxTerjual) }))
      .sort((a: any, b: any) => b.ai_score - a.ai_score)
      .slice(0, limit)

    const petaniIds = [...new Set(scored.map((p: any) => p.petani_id))]
    let tokoMap: Record<string, string> = {}
    if (petaniIds.length > 0) {
      const [{ data: users }, { data: profils }] = await Promise.all([
        supabaseAdmin.from('users').select('id, nama').in('id', petaniIds),
        supabaseAdmin.from('petani_profil').select('user_id, nama_toko').in('user_id', petaniIds),
      ])
      users?.forEach((u: any) => { tokoMap[u.id] = u.nama })
      profils?.forEach((p: any) => { tokoMap[p.user_id] = p.nama_toko })
    }

    return NextResponse.json({
      produk: scored.map((p: any) => ({ ...p, icon: p.kategori?.icon || '🌿', nama_toko: tokoMap[p.petani_id] || '' })),
      algoritma: 'Content-Based Filtering + Weighted Scoring'
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
