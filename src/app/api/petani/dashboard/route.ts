import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET() {
  try {
    const user = await getSession()
    if (!user || user.role !== 'petani')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const [{ data: profil }, { count: produkAktif }] = await Promise.all([
      supabaseAdmin.from('petani_profil').select('*').eq('user_id', user.id).single(),
      supabaseAdmin.from('produk').select('*', { count: 'exact', head: true })
        .eq('petani_id', user.id).eq('is_aktif', true),
    ])

    // Ambil pesanan yang melibatkan produk petani ini
    const { data: detailIds } = await supabaseAdmin
      .from('detail_pesanan').select('pesanan_id').eq('petani_id', user.id)

    let pesanan: any[] = []
    if (detailIds && detailIds.length > 0) {
      const ids = [...new Set(detailIds.map((d: any) => d.pesanan_id))]
      const { data: p } = await supabaseAdmin
        .from('pesanan')
        .select('*, users!konsumen_id(nama)')
        .in('id', ids)
        .order('created_at', { ascending: false })
        .limit(20)
      pesanan = p || []
    }

    // Hitung pendapatan dari pesanan selesai
    const pesananSelesai = pesanan?.filter((p: any) => p.status === 'selesai') || []
    const pendapatan = pesananSelesai.reduce((s: number, p: any) => s + p.total_bayar, 0)

    // Hitung pesanan hari ini
    const today = new Date().toISOString().slice(0, 10)
    const pesananHari = pesanan?.filter((p: any) => p.created_at?.startsWith(today)) || []

    return NextResponse.json({
      nama: user.nama,
      profil,
      stats: { produkAktif: produkAktif || 0, pesananHari: pesananHari.length, pendapatan },
      pesanan: pesanan || [],
    })
  } catch (e: any) {
    console.error('petani dashboard:', e)
    return NextResponse.json({ error: 'Gagal memuat dashboard.' }, { status: 500 })
  }
}