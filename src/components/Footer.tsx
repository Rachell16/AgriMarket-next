import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-green-700 text-white/70 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="col-span-2 md:col-span-1">
          <div className="text-white font-bold text-lg mb-2">🌱 AgriMarket</div>
          <p className="text-sm leading-relaxed">Platform e-commerce hasil panen yang menghubungkan petani lokal langsung dengan konsumen.</p>
        </div>
        <div>
          <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">Konsumen</h4>
          <div className="flex flex-col gap-1.5">
            <Link href="/katalog" className="text-sm hover:text-white transition-colors">Katalog Produk</Link>
            <Link href="/keranjang" className="text-sm hover:text-white transition-colors">Keranjang</Link>
            <Link href="/pesanan" className="text-sm hover:text-white transition-colors">Pesanan Saya</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">Petani</h4>
          <div className="flex flex-col gap-1.5">
            <Link href="/register?role=petani" className="text-sm hover:text-white transition-colors">Daftar Mitra</Link>
            <Link href="/dashboard/petani" className="text-sm hover:text-white transition-colors">Dashboard</Link>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold text-xs mb-3 uppercase tracking-wider">Info</h4>
          <div className="flex flex-col gap-1.5">
            <Link href="/tentang" className="text-sm hover:text-white transition-colors">Tentang Kami</Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 text-center py-3 text-xs px-4">
        © {new Date().getFullYear()} AgriMarket — Kelompok 19 · KOM 1231 RPL · IPB
      </div>
    </footer>
  )
}
