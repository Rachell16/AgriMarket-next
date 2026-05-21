import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-green-700 text-white/70 mt-16">
      <div className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="text-white font-bold text-xl mb-3">🌱 AgriMarket</div>
          <p className="text-sm leading-relaxed">Platform e-commerce hasil panen yang menghubungkan petani lokal langsung dengan konsumen.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Konsumen</h4>
          <div className="flex flex-col gap-2">
            <Link href="/katalog" className="text-sm hover:text-white transition-colors">Katalog Produk</Link>
            <Link href="/keranjang" className="text-sm hover:text-white transition-colors">Keranjang</Link>
            <Link href="/pesanan" className="text-sm hover:text-white transition-colors">Pesanan Saya</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Petani</h4>
          <div className="flex flex-col gap-2">
            <Link href="/register?role=petani" className="text-sm hover:text-white transition-colors">Daftar Jadi Mitra</Link>
            <Link href="/dashboard/petani" className="text-sm hover:text-white transition-colors">Dashboard Petani</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold text-sm mb-4 uppercase tracking-wider">Informasi</h4>
          <div className="flex flex-col gap-2">
            <Link href="/tentang" className="text-sm hover:text-white transition-colors">Tentang Kami</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-4 text-xs">
        © {new Date().getFullYear()} AgriMarket — Kelompok 19 · KOM 1231 Rekayasa Perangkat Lunak
      </div>
    </footer>
  )
}
