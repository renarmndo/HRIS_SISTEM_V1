import React, { useState, useEffect, useCallback } from "react";
import {
  Wallet,
  Calendar,
  Filter,
  FileText,
  Eye,
  CheckCircle,
  Clock,
  Users,
  Play,
  X,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import {
  generateSlipGaji,
  getSlipGajiBulanan,
  getSlipGajiDetail,
  finalizeSlipGaji,
} from "../../services/hrd/gajiService";

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
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClass = size === "lg" ? "max-w-3xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div
        className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClass} mx-4 z-10 max-h-[90vh] overflow-y-auto`}
      >
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

export default function KelolaSlipGaji() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [slipList, setSlipList] = useState([]);
  const [selectedSlip, setSelectedSlip] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [bulan, setBulan] = useState(new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(new Date().getFullYear());
  const [filterStatus, setFilterStatus] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getSlipGajiBulanan(
        bulan,
        tahun,
        filterStatus || null
      );
      setSlipList(response.data?.slipGaji || []);
    } catch (error) {
      toast.error("Gagal mengambil data slip gaji");
      setSlipList([]);
    } finally {
      setLoading(false);
    }
  }, [bulan, tahun, filterStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleGenerate = async () => {
    if (
      !window.confirm(
        `Generate slip gaji untuk ${namaBulan[bulan - 1]} ${tahun}?`
      )
    ) {
      return;
    }

    setGenerating(true);
    try {
      const response = await generateSlipGaji(bulan, tahun);
      toast.success(response.msg || "Berhasil generate slip gaji");
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal generate slip gaji");
    } finally {
      setGenerating(false);
    }
  };

  const handleViewDetail = async (slip) => {
    try {
      const response = await getSlipGajiDetail(slip.id);
      setSelectedSlip(response.data);
      setIsDetailModalOpen(true);
    } catch (error) {
      toast.error("Gagal mengambil detail slip gaji");
    }
  };

  const handleFinalize = async (id) => {
    if (
      !window.confirm(
        "Finalize slip gaji ini? Setelah final tidak dapat diubah."
      )
    ) {
      return;
    }

    try {
      await finalizeSlipGaji(id);
      toast.success("Slip gaji berhasil difinalisasi");
      fetchData();
      setIsDetailModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal finalize slip gaji");
    }
  };

  // Summary stats
  const totalDraft = slipList.filter((s) => s.status === "draft").length;
  const totalFinal = slipList.filter((s) => s.status === "final").length;
  const totalGaji = slipList.reduce(
    (acc, s) => acc + parseFloat(s.gaji_bersih),
    0
  );

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Wallet className="w-7 h-7 text-green-600" />
          Kelola Slip Gaji
        </h1>
        <p className="text-gray-500 mt-1">
          Generate dan kelola slip gaji karyawan per bulan
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-blue-100 text-xs">Total Slip</p>
              <p className="text-xl font-bold">{slipList.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-yellow-100 text-xs">Draft</p>
              <p className="text-xl font-bold">{totalDraft}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-green-100 text-xs">Final</p>
              <p className="text-xl font-bold">{totalFinal}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <p className="text-purple-100 text-xs">Total Gaji</p>
              <p className="text-sm font-bold">{formatCurrency(totalGaji)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium text-gray-600">
                Periode:
              </span>
            </div>
            <select
              value={bulan}
              onChange={(e) => setBulan(parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
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
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-24 focus:ring-2 focus:ring-green-500"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="">Semua Status</option>
              <option value="draft">Draft</option>
              <option value="final">Final</option>
            </select>
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Play className="w-4 h-4" />
            {generating ? "Generating..." : "Generate Slip Gaji"}
          </button>
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-green-600" />
            Slip Gaji - {namaBulan[bulan - 1]} {tahun}
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Karyawan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Hadir
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
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
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
                    colSpan="8"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : slipList.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Wallet className="w-10 h-10 text-gray-300" />
                      <p>Belum ada slip gaji untuk periode ini</p>
                      <p className="text-sm">
                        Klik "Generate Slip Gaji" untuk membuat
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                slipList.map((slip) => (
                  <tr key={slip.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {slip.karyawan?.nama_lengkap || "-"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {slip.karyawan?.jabatan || "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {slip.total_hadir}/{slip.total_hari_kerja} hari
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
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        {formatCurrency(slip.gaji_bersih)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${
                          slip.status === "final"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {slip.status === "final" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3" />
                        )}
                        {slip.status === "final" ? "Final" : "Draft"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleViewDetail(slip)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Detail"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {slip.status === "draft" && (
                          <button
                            onClick={() => handleFinalize(slip.id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"
                            title="Finalize"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={
          selectedSlip
            ? `Slip Gaji - ${selectedSlip.karyawan?.nama_lengkap}`
            : "Detail Slip Gaji"
        }
        size="lg"
      >
        {selectedSlip && (
          <div className="space-y-6">
            {/* Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">
                    {selectedSlip.total_hadir}
                  </p>
                  <p className="text-xs text-gray-500">Hadir</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">
                    {selectedSlip.total_terlambat}
                  </p>
                  <p className="text-xs text-gray-500">Terlambat</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">
                    {selectedSlip.total_absen}
                  </p>
                  <p className="text-xs text-gray-500">Absen</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-cyan-600">
                    {selectedSlip.total_cuti}
                  </p>
                  <p className="text-xs text-gray-500">Cuti</p>
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
                <div className="flex justify-between py-2 border-b">
                  <span className="text-sm text-gray-600">Gaji Pokok</span>
                  <span className="text-sm font-medium">
                    {formatCurrency(selectedSlip.gaji_pokok)}
                  </span>
                </div>
                {selectedSlip.details
                  ?.filter((d) => d.tipe === "bonus")
                  .map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between py-2 border-b"
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
                  <span className="text-sm font-semibold">
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
                      className="flex justify-between py-2 border-b"
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
                  <span className="text-sm font-semibold">Total Potongan</span>
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

            {/* Actions */}
            {selectedSlip.status === "draft" && (
              <button
                onClick={() => handleFinalize(selectedSlip.id)}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-4 h-4" />
                Finalize Slip Gaji
              </button>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
