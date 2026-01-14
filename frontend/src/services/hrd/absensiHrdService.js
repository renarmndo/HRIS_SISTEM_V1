import api from "../../api/api";

// Get absensi berdasarkan tanggal
export const getAbsensiByDate = async (tanggal) => {
  const params = tanggal ? `?tanggal=${tanggal}` : "";
  const response = await api.get(`/hrd/absensi${params}`);
  return response.data;
};

// Get statistik absensi
export const getAbsensiStats = async (tanggal) => {
  const params = tanggal ? `?tanggal=${tanggal}` : "";
  const response = await api.get(`/hrd/absensi/stats${params}`);
  return response.data;
};

// Create absensi manual
export const createAbsensiManual = async (data) => {
  const response = await api.post("/hrd/absensi", data);
  return response.data;
};

// Update absensi
export const updateAbsensi = async (id, data) => {
  const response = await api.put(`/hrd/absensi/${id}`, data);
  return response.data;
};

// Get absensi bulanan karyawan
export const getAbsensiBulananKaryawan = async (karyawanId, bulan, tahun) => {
  const params = new URLSearchParams();
  if (bulan) params.append("bulan", bulan);
  if (tahun) params.append("tahun", tahun);
  const queryString = params.toString();

  const response = await api.get(
    `/hrd/absensi/karyawan/${karyawanId}${queryString ? `?${queryString}` : ""}`
  );
  return response.data;
};
