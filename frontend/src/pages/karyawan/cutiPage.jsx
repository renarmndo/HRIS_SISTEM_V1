import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  X,
  Send,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  CalendarDays,
  FileText,
  Info,
} from "lucide-react";
import useCutiKaryawan from "../../hooks/karyawan/useCutiKaryawan.hook";

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

// Jenis Cuti
const jenisCutiOptions = [
  { value: "tahunan", label: "Cuti Tahunan" },
  { value: "sakit", label: "Cuti Sakit" },
  { value: "melahirkan", label: "Cuti Melahirkan" },
  { value: "penting", label: "Cuti Penting" },
  { value: "lainnya", label: "Lainnya" },
];

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 z-10 max-h-[90vh] overflow-y-auto">
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

export default function DashboardCutiPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    tanggal_mulai: "",
    tanggal_selesai: "",
    jenis_cuti: "tahunan",
    alasan: "",
  });
  const [jumlahHari, setJumlahHari] = useState(0);

  const {
    loading,
    cutiList,
    sisaKuota,
    fetchCutiSaya,
    fetchSisaKuota,
    handleAjukanCuti,
    handleCancelPengajuan,
  } = useCutiKaryawan();

  useEffect(() => {
    fetchCutiSaya();
    fetchSisaKuota();
  }, [fetchCutiSaya, fetchSisaKuota]);

  // Hitung jumlah hari saat tanggal berubah
  useEffect(() => {
    if (formData.tanggal_mulai && formData.tanggal_selesai) {
      const start = new Date(formData.tanggal_mulai);
      const end = new Date(formData.tanggal_selesai);
      if (end >= start) {
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        setJumlahHari(diffDays);
      } else {
        setJumlahHari(0);
      }
    } else {
      setJumlahHari(0);
    }
  }, [formData.tanggal_mulai, formData.tanggal_selesai]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleAjukanCuti(formData);
      closeModal();
    } catch (error) {
      // Error sudah di-handle di hook
    }
  };

  const handleCancel = async (id) => {
    if (
      window.confirm("Apakah Anda yakin ingin membatalkan pengajuan cuti ini?")
    ) {
      try {
        await handleCancelPengajuan(id);
      } catch (error) {
        // Error sudah di-handle di hook
      }
    }
  };

  const openModal = () => {
    setFormData({
      tanggal_mulai: "",
      tanggal_selesai: "",
      jenis_cuti: "tahunan",
      alasan: "",
    });
    setJumlahHari(0);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: AlertCircle,
        label: "Menunggu Persetujuan",
      },
      disetujui: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Disetujui",
      },
      ditolak: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: XCircle,
        label: "Ditolak",
      },
    };
    const badge = badges[status] || badges.pending;
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

  const getJenisCutiLabel = (value) => {
    const jenis = jenisCutiOptions.find((j) => j.value === value);
    return jenis ? jenis.label : value;
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-7 h-7 text-blue-600" />
          Pengajuan Cuti
        </h1>
        <p className="text-gray-500 mt-1">
          Ajukan cuti dan pantau status persetujuan
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Card Kuota */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CalendarDays className="w-6 h-6" />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Kuota Bulan Ini</p>
              <p className="text-2xl font-bold">
                {sisaKuota ? `${sisaKuota.kuota_cuti} Hari` : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Card Terpakai */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-orange-100 text-sm">Sudah Digunakan</p>
              <p className="text-2xl font-bold">
                {sisaKuota ? `${sisaKuota.sudah_digunakan} Hari` : "-"}
              </p>
            </div>
          </div>
        </div>

        {/* Card Sisa */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-green-100 text-sm">Sisa Kuota</p>
              <p className="text-2xl font-bold">
                {sisaKuota ? `${sisaKuota.sisa_kuota} Hari` : "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alert jika kuota belum diatur */}
      {!sisaKuota && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
          <Info className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Kuota cuti belum diatur
            </p>
            <p className="text-sm text-yellow-600">
              Kuota cuti untuk bulan {namaBulan[new Date().getMonth()]}{" "}
              {new Date().getFullYear()} belum diatur oleh admin. Silakan
              hubungi HRD.
            </p>
          </div>
        </div>
      )}

      {/* Tabel Riwayat */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Riwayat Pengajuan Cuti
          </h3>
          <button
            onClick={openModal}
            disabled={!sisaKuota || sisaKuota.sisa_kuota <= 0}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Ajukan Cuti
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Jenis Cuti
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Jumlah Hari
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Alasan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Catatan HRD
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
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : cutiList.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10 text-gray-300" />
                      <p>Belum ada pengajuan cuti</p>
                    </div>
                  </td>
                </tr>
              ) : (
                cutiList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(item.tanggal_mulai).toLocaleDateString("id-ID")}{" "}
                      -{" "}
                      {new Date(item.tanggal_selesai).toLocaleDateString(
                        "id-ID"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                        {getJenisCutiLabel(item.jenis_cuti)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {item.jumlah_hari} hari
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <p className="truncate" title={item.alasan}>
                        {item.alasan}
                      </p>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                      <p
                        className="truncate"
                        title={item.catatan_approval || "-"}
                      >
                        {item.catatan_approval || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        {item.status === "pending" ? (
                          <button
                            onClick={() => handleCancel(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Batalkan Pengajuan"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
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

      {/* Modal Ajukan Cuti */}
      <Modal isOpen={isModalOpen} onClose={closeModal} title="Ajukan Cuti">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Info Sisa Kuota */}
          {sisaKuota && (
            <div className="p-3 bg-blue-50 rounded-lg flex items-center gap-3">
              <Info className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-blue-700">
                Sisa kuota cuti Anda bulan ini:{" "}
                <span className="font-semibold">
                  {sisaKuota.sisa_kuota} hari
                </span>
              </p>
            </div>
          )}

          {/* Tanggal */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_mulai"
                value={formData.tanggal_mulai}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal_selesai"
                value={formData.tanggal_selesai}
                onChange={handleChange}
                min={
                  formData.tanggal_mulai ||
                  new Date().toISOString().split("T")[0]
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Jumlah Hari Preview */}
          {jumlahHari > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-600">Total hari cuti:</span>
              <span className="text-lg font-semibold text-blue-600">
                {jumlahHari} hari
              </span>
            </div>
          )}

          {/* Jenis Cuti */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Jenis Cuti <span className="text-red-500">*</span>
            </label>
            <select
              name="jenis_cuti"
              value={formData.jenis_cuti}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {jenisCutiOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Alasan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alasan Cuti <span className="text-red-500">*</span>
            </label>
            <textarea
              name="alasan"
              value={formData.alasan}
              onChange={handleChange}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Jelaskan alasan Anda mengajukan cuti..."
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || jumlahHari === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? "Mengajukan..." : "Ajukan Cuti"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
