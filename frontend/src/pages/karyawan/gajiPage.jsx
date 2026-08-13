import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Calendar,
  Filter,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Briefcase,
  Clock,
  Coffee,
  Eye,
  X,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import {
  getSlipGajiSaya,
  getSlipGajiDetail,
} from "../../services/karyawan/gaji.service";
import { exportSlipGajiIndividuPdf } from "../../utils/exportSalaryPdf";

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

// Format currency
const formatCurrency = (value) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
};

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 z-10 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default function DashboardGajiPage() {
  const [loading, setLoading] = useState(false);
  const [slipGajiList, setSlipGajiList] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tahun, setTahun] = useState(new Date().getFullYear());

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSlipGajiSaya(null, tahun);
      setSlipGajiList(response.data || []);
    } catch (error) {
      if (error.response?.status !== 404) {
        toast.error(
          error.response?.data?.msg || "Gagal mengambil data slip gaji"
        );
      }
      setSlipGajiList([]);
    } finally {
      setLoading(false);
    }
  }, [tahun]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleViewDetail = async (slip) => {
    try {
      const response = await getSlipGajiDetail(slip.id);
      setSelectedSlip(response.data);
      setIsModalOpen(true);
    } catch (error) {
      toast.error("Gagal mengambil detail slip gaji");
    }
  };

  const getLatestSlip = () => {
    if (slipGajiList.length === 0) return null;
    return slipGajiList[0];
  };

  const latestSlip = getLatestSlip();

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Wallet className="w-7 h-7 text-green-600" />
          Slip Gaji
        </h1>
        <p className="text-gray-500 mt-1">Lihat rincian gaji Anda per bulan</p>
      </div>

      {/* Summary Cards - Latest Slip */}
      {latestSlip && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-green-100 text-xs">Gaji Bersih</p>
                <p className="text-lg font-bold">
                  {formatCurrency(latestSlip.gaji_bersih)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <p className="text-blue-100 text-xs">Gaji Pokok</p>
                <p className="text-lg font-bold">
                  {formatCurrency(latestSlip.gaji_pokok)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-emerald-100 text-xs">Total Pendapatan</p>
                <p className="text-lg font-bold">
                  {formatCurrency(latestSlip.total_pendapatan)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <p className="text-red-100 text-xs">Total Potongan</p>
                <p className="text-lg font-bold">
                  {formatCurrency(latestSlip.total_potongan)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600">Tahun:</span>
          </div>
          <select
            value={tahun}
            onChange={(e) => setTahun(parseInt(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - 2 + i;
              return (
                <option key={year} value={year}>
                  {year}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Riwayat Slip Gaji {tahun}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Periode
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Hari Hadir
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Gaji Pokok
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Pendapatan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Potongan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Gaji Bersih
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : slipGajiList.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Wallet className="w-10 h-10 text-gray-300" />
                      <p>Belum ada slip gaji untuk tahun {tahun}</p>
                    </div>
                  </td>
                </tr>
              ) : (
                slipGajiList.map((slip) => (
                  <tr key={slip.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {namaBulan[slip.bulan - 1]} {slip.tahun}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        {slip.total_hadir}/{slip.total_hari_kerja} hari
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatCurrency(slip.gaji_pokok)}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">
                      +{formatCurrency(slip.total_pendapatan)}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 font-medium">
                      -{formatCurrency(slip.total_potongan)}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-sm font-bold bg-green-100 text-green-700">
                        {formatCurrency(slip.gaji_bersih)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        <button
                          onClick={() => handleViewDetail(slip)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Detail Slip Gaji */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          selectedSlip
            ? `Slip Gaji - ${namaBulan[selectedSlip.bulan - 1]} ${
                selectedSlip.tahun
              }`
            : "Detail Slip Gaji"
        }
      >
        {selectedSlip && (
          <div className="space-y-6">
            {/* Info Absensi */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">
                Rekap Kehadiran
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedSlip.total_hadir}
                  </p>
                  <p className="text-xs text-gray-500">Hari Hadir</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {selectedSlip.total_terlambat}
                  </p>
                  <p className="text-xs text-gray-500">Terlambat</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-600">
                    {selectedSlip.total_cuti}
                  </p>
                  <p className="text-xs text-gray-500">Cuti/Izin</p>
                </div>
              </div>
            </div>

            {/* Pendapatan */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-600" />
                Pendapatan
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-600">Gaji Pokok</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(selectedSlip.gaji_pokok)}
                  </span>
                </div>
                {selectedSlip.details
                  ?.filter((d) => d.tipe === "bonus")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between py-2 border-b border-gray-100"
                    >
                      <span className="text-sm text-gray-600">
                        {item.nama_komponen}
                      </span>
                      <span className="text-sm font-medium text-green-600">
                        +{formatCurrency(item.nilai)}
                      </span>
                    </div>
                  ))}
                <div className="flex justify-between py-2 bg-green-50 px-2 rounded">
                  <span className="text-sm font-semibold text-gray-700">
                    Total Pendapatan
                  </span>
                  <span className="text-sm font-bold text-green-700">
                    {formatCurrency(selectedSlip.total_pendapatan)}
                  </span>
                </div>
              </div>
            </div>

            {/* Potongan */}
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-red-600" />
                Potongan
              </h4>
              <div className="space-y-2">
                {selectedSlip.details
                  ?.filter((d) => d.tipe === "potongan")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between py-2 border-b border-gray-100"
                    >
                      <span className="text-sm text-gray-600">
                        {item.nama_komponen}
                      </span>
                      <span className="text-sm font-medium text-red-600">
                        -{formatCurrency(item.nilai)}
                      </span>
                    </div>
                  ))}
                {selectedSlip.details?.filter((d) => d.tipe === "potongan")
                  .length === 0 && (
                  <p className="text-sm text-gray-400 py-2">
                    Tidak ada potongan
                  </p>
                )}
                <div className="flex justify-between py-2 bg-red-50 px-2 rounded">
                  <span className="text-sm font-semibold text-gray-700">
                    Total Potongan
                  </span>
                  <span className="text-sm font-bold text-red-700">
                    -{formatCurrency(selectedSlip.total_potongan)}
                  </span>
                </div>
              </div>
            </div>

            {/* Gaji Bersih */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Gaji Bersih</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(selectedSlip.gaji_bersih)}
                </span>
              </div>
            </div>

            {/* Download PDF Button */}
            <button
              onClick={() => {
                try {
                  exportSlipGajiIndividuPdf({
                    selectedSlip,
                    bulanNama: namaBulan[(selectedSlip.bulan || 1) - 1],
                    tahun: selectedSlip.tahun || tahun,
                    namaKantor: "PT. SISTEM HRIS SASYA",
                  });
                  toast.success("Berhasil mengunduh slip gaji PDF");
                } catch (err) {
                  toast.error("Gagal mengunduh PDF");
                }
              }}
              className="w-full py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Download / Cetak Slip Gaji (PDF)
            </button>
          </div>
        )}
      </Modal>
    </div>
  );
}
