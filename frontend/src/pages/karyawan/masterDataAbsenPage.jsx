import React, { useState, useEffect, useCallback } from "react";
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Filter,
  Coffee,
  Briefcase,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import { getAbsensiBulanan } from "../../services/karyawan/absensi.service";

// Nama bulan Indonesia
const namaBulan = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

// Nama hari Indonesia
const namaHari = {
  Sunday: "Minggu",
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat",
  Saturday: "Sabtu",
};

export default function MasterDataAbsen() {
  const [loading, setLoading] = useState(false);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [absensiData, setAbsensiData] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getAbsensiBulanan(bulan, tahun);
      setAbsensiData(response.data);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal mengambil data absensi");
      setAbsensiData(null);
    } finally {
      setLoading(false);
    }
  }, [bulan, tahun]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getStatusBadge = (status) => {
    const badges = {
      masuk: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Hadir",
      },
      terlambat: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: AlertCircle,
        label: "Terlambat",
      },
      cuti: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: Coffee,
        label: "Cuti",
      },
      izin: {
        bg: "bg-purple-100",
        text: "text-purple-700",
        icon: FileText,
        label: "Izin",
      },
      sakit: {
        bg: "bg-orange-100",
        text: "text-orange-700",
        icon: AlertCircle,
        label: "Sakit",
      },
      tidak_hadir: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
        label: "Tidak Hadir",
      },
      libur: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: Calendar,
        label: "Libur",
      },
    };
    const badge = badges[status] || badges.tidak_hadir;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3 h-3" />
        {badge.label}
      </span>
    );
  };

  const formatTanggal = (tanggal, hari) => {
    const date = new Date(tanggal);
    const hariIndo = namaHari[hari] || hari;
    return `${hariIndo}, ${date.getDate()} ${
      namaBulan[date.getMonth()]
    } ${date.getFullYear()}`;
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-7 h-7 text-blue-600" />
          Data Presensi
        </h1>
        <p className="text-gray-500 mt-1">
          Lihat riwayat presensi Anda per bulan
        </p>
      </div>

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Filter:</span>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={bulan}
              onChange={(e) => setBulan(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {namaBulan.map((nama, index) => (
                <option key={index} value={index + 1}>
                  {nama}
                </option>
              ))}
            </select>
            <input
              type="number"
              value={tahun}
              onChange={(e) => setTahun(parseInt(e.target.value))}
              min={2020}
              max={2030}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      {absensiData?.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-blue-100 text-xs">Total Hari</p>
                <p className="text-xl font-bold">
                  {absensiData.stats.totalHari}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-green-100 text-xs">Hadir</p>
                <p className="text-xl font-bold">{absensiData.stats.hadir}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <p className="text-yellow-100 text-xs">Terlambat</p>
                <p className="text-xl font-bold">
                  {absensiData.stats.terlambat}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Coffee className="w-5 h-5" />
              </div>
              <div>
                <p className="text-cyan-100 text-xs">Cuti</p>
                <p className="text-xl font-bold">{absensiData.stats.cuti}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-orange-100 text-xs">Sakit</p>
                <p className="text-xl font-bold">{absensiData.stats.sakit}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-purple-100 text-xs">Izin</p>
                <p className="text-xl font-bold">{absensiData.stats.izin}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Riwayat Presensi - {namaBulan[bulan - 1]} {tahun}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Jam Masuk
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Jam Keluar
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Keterlambatan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Keterangan
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : !absensiData?.absensi || absensiData.absensi.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Calendar className="w-10 h-10 text-gray-300" />
                      <p>Tidak ada data presensi untuk bulan ini</p>
                    </div>
                  </td>
                </tr>
              ) : (
                absensiData.absensi.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {formatTanggal(item.tanggal, item.hari)}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.jam_masuk ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-4 h-4 text-green-500" />
                          {item.jam_masuk}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.jam_keluar ? (
                        <span className="inline-flex items-center gap-1">
                          <Clock className="w-4 h-4 text-red-500" />
                          {item.jam_keluar}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.menit_terlambat > 0 ? (
                        <span className="text-yellow-600 font-medium">
                          {item.menit_terlambat} menit
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {item.keterangan || "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
