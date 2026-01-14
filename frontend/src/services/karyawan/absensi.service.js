import api from "../../api/api";

export const useAbsensiMasuk = async (data) => {
  const response = await api.post("/karyawan/absen", data);
  return response.data;
};

export const useAbsensiKeluar = async (data) => {
  const response = await api.put("/karyawan/absen", data);
  return response.data;
};

// get data absensi
export const useGetAbsensi = async () => {
  const response = await api.get("/karyawan/absen");
  return response.data;
};

// absensi hari ini
export const useGetAbsensiHariIni = async () => {
  const response = await api.get("/karyawan/absen/hariIni");
  return response.data;
};

export const useGetAbsensiMingguan = async () => {
  const response = await api.get("/karyawan/absen/total");
  return response.data;
};

// absensi bulanan dengan filter
export const getAbsensiBulanan = async (bulan, tahun) => {
  const params = new URLSearchParams();
  if (bulan) params.append("bulan", bulan);
  if (tahun) params.append("tahun", tahun);

  const queryString = params.toString();
  const response = await api.get(
    `/karyawan/absen/bulanan${queryString ? `?${queryString}` : ""}`
  );
  return response.data;
};
