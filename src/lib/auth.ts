import { cookies } from 'next/headers'
import { supabaseAdmin } from './supabase'

export interface SessionUser {
  id: string
  nama: string
  email: string
  role: 'konsumen' | 'petani' | 'admin'
  telepon?: string
  alamat?: string
}

// Ambil user dari cookie session (server-side)
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get('agrimarket_session')
    if (!sessionCookie) return null

    const { userId } = JSON.parse(
      Buffer.from(sessionCookie.value, 'base64').toString()
    )

    const { data: user } = await supabaseAdmin
      .from('users')
      .select('id, nama, email, role, telepon, alamat')
      .eq('id', userId)
      .single()

    return user as SessionUser | null
  } catch {
    return null
  }
}

// Format rupiah
export function rupiah(n: number): string {
  return 'Rp ' + n.toLocaleString('id-ID')
}

// Bintang rating
export function bintang(r: number): string {
  return '★'.repeat(Math.floor(r)) + '☆'.repeat(5 - Math.ceil(r))
}

// Kode pesanan
export function kodePesanan(): string {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `AGR-${date}-${rand}`
}
