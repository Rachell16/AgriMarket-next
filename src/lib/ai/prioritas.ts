// AUTO-GENERATED dari Decision Tree (sklearn) - Kelompok 19 AgriMarket PKB
// Dataset 1000 produk | train 1500 / test 500 | akurasi 0.970 | F1 macro 0.968

export type ProdukFitur = {
  rating: number; stok: number; terjual_30hr: number; is_organik: number; rasio_harga: number;
};
export type HasilPrioritas = {
  prioritas: "Tinggi" | "Sedang" | "Rendah";
  alasan: string[];
};

export function klasifikasiPrioritas(p: ProdukFitur): HasilPrioritas {
  const alasan: string[] = [];
  if (p.terjual_30hr <= 7.5) {
    alasan.push("penjualan 30 hari ≤ 7.5");
    if (p.rating <= 4.25) {
      alasan.push("rating ≤ 4.25");
      if (p.rasio_harga <= 0.83) {
        alasan.push("rasio harga terhadap median kategori ≤ 0.83");
        return { prioritas: "Rendah", alasan };
      } else {
        alasan.push("rasio harga terhadap median kategori > 0.83");
        if (p.terjual_30hr <= 5.5) {
          alasan.push("penjualan 30 hari ≤ 5.5");
          return { prioritas: "Rendah", alasan };
        } else {
          alasan.push("penjualan 30 hari > 5.5");
          return { prioritas: "Rendah", alasan };
        }
      }
    } else {
      alasan.push("rating > 4.25");
      if (p.stok <= 15.5) {
        alasan.push("stok ≤ 15.5");
        if (p.terjual_30hr <= 5.5) {
          alasan.push("penjualan 30 hari ≤ 5.5");
          return { prioritas: "Tinggi", alasan };
        } else {
          alasan.push("penjualan 30 hari > 5.5");
          return { prioritas: "Tinggi", alasan };
        }
      } else {
        alasan.push("stok > 15.5");
        if (p.stok <= 24.5) {
          alasan.push("stok ≤ 24.5");
          return { prioritas: "Rendah", alasan };
        } else {
          alasan.push("stok > 24.5");
          return { prioritas: "Sedang", alasan };
        }
      }
    }
  } else {
    alasan.push("penjualan 30 hari > 7.5");
    if (p.stok <= 15.5) {
      alasan.push("stok ≤ 15.5");
      if (p.rating <= 4.25) {
        alasan.push("rating ≤ 4.25");
        if (p.terjual_30hr <= 17.5) {
          alasan.push("penjualan 30 hari ≤ 17.5");
          return { prioritas: "Sedang", alasan };
        } else {
          alasan.push("penjualan 30 hari > 17.5");
          return { prioritas: "Tinggi", alasan };
        }
      } else {
        alasan.push("rating > 4.25");
        if (p.rasio_harga <= 0.48) {
          alasan.push("rasio harga terhadap median kategori ≤ 0.48");
          return { prioritas: "Tinggi", alasan };
        } else {
          alasan.push("rasio harga terhadap median kategori > 0.48");
          return { prioritas: "Tinggi", alasan };
        }
      }
    } else {
      alasan.push("stok > 15.5");
      if (p.stok <= 17.5) {
        alasan.push("stok ≤ 17.5");
        if (p.terjual_30hr <= 27.5) {
          alasan.push("penjualan 30 hari ≤ 27.5");
          return { prioritas: "Sedang", alasan };
        } else {
          alasan.push("penjualan 30 hari > 27.5");
          return { prioritas: "Sedang", alasan };
        }
      } else {
        alasan.push("stok > 17.5");
        if (p.rating <= 4.85) {
          alasan.push("rating ≤ 4.85");
          return { prioritas: "Sedang", alasan };
        } else {
          alasan.push("rating > 4.85");
          return { prioritas: "Sedang", alasan };
        }
      }
    }
  }
}
