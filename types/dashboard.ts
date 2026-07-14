export type DashboardProduksiTahunan = {
  fact_produksi_key: number
  waktu_key: number
  tahun: number
  wilayah_key: number
  id_wilayah: number | null
  nama_wilayah: string
  komoditas_key: number
  komoditas_id: number
  nama_komoditas: string
  luas_lahan: number | null
  luas_tanam: number | null
  luas_panen: number | null
  produktivitas: number | null
  produksi: number | null
  kebutuhan_pupuk_npk: number | null
  kebutuhan_pupuk_organik: number | null
}

export type DashboardHargaBulanan = {
  fact_harga_bulanan_kabkota_key: number
  waktu_key: number
  tahun: number
  bulan: number
  nama_bulan: string
  periode_bulan: string
  wilayah_key: number
  kode_wilayah: string
  nama_wilayah: string
  komoditas_key: number
  komoditas_id: number
  nama_komoditas: string
  sumber_harga_key: number
  sumber_data: string
  harga_bulanan: number | null
  is_data_masuk: boolean
}