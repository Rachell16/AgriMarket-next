// AUTO-GENERATED dari Decision Tree (sklearn) - Kelompok 19 AgriMarket PKB
// Model: max_depth=4, akurasi test 0.964, F1 macro 0.962
// Fitur: rating, stok, terjual_30hr, is_organik, rasio_harga

export type ProdukFitur = {
  rating: number;          // 1-5
  stok: number;            // unit tersedia
  terjual_30hr: number;    // total terjual 30 hari terakhir
  is_organik: number;      // 0 atau 1
  rasio_harga: number;     // harga / median harga kategori
};

export type HasilPrioritas = {
  prioritas: "Tinggi" | "Sedang" | "Rendah";
  alasan: string[];        // jejak keputusan pohon (explainable AI)
};

export function klasifikasiPrioritas(p: ProdukFitur): HasilPrioritas {
  const alasan: string[] = [];
  if (p.terjual_30hr <= 7.5) {
    alasan.push("penjualan 30 hari ≤ 7.5");
    if (p.rating <= 4.25) {
      alasan.push("rating ≤ 4.25");
      if (p.rasio_harga <= 1.26) {
        alasan.push("rasio harga thd median kategori ≤ 1.26");
        return { prioritas: "Rendah", alasan };
      } else {
        alasan.push("rasio harga thd median kategori > 1.26");
        return { prioritas: "Rendah", alasan };
      }
    } else {
      alasan.push("rating > 4.25");
      if (p.stok <= 15.5) {
        alasan.push("stok ≤ 15.5");
        return { prioritas: "Tinggi", alasan };
      } else {
        alasan.push("stok > 15.5");
        if (p.stok <= 20.5) {
          alasan.push("stok ≤ 20.5");
          return { prioritas: "Rendah", alasan };
        } else {
          alasan.push("stok > 20.5");
          return { prioritas: "Sedang", alasan };
        }
      }
    }
  } else {
    alasan.push("penjualan 30 hari > 7.5");
    if (p.stok <= 15.5) {
      alasan.push("stok ≤ 15.5");
      if (p.terjual_30hr <= 17.5) {
        alasan.push("penjualan 30 hari ≤ 17.5");
        if (p.rating <= 4.25) {
          alasan.push("rating ≤ 4.25");
          return { prioritas: "Sedang", alasan };
        } else {
          alasan.push("rating > 4.25");
          return { prioritas: "Tinggi", alasan };
        }
      } else {
        alasan.push("penjualan 30 hari > 17.5");
        return { prioritas: "Tinggi", alasan };
      }
    } else {
      alasan.push("stok > 15.5");
      if (p.rasio_harga <= 1.5) {
        alasan.push("rasio harga thd median kategori ≤ 1.5");
        return { prioritas: "Sedang", alasan };
      } else {
        alasan.push("rasio harga thd median kategori > 1.5");
        return { prioritas: "Sedang", alasan };
      }
    }
  }
}
