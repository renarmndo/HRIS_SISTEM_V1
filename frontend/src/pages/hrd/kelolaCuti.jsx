import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Clock,
  CalendarDays,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
} from "lucide-react";
import useCuti from "../../hooks/hrd/useCuti.hook";

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

// Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4 z-10">
        <div className="flex items-center justify-between p-4 border-b">
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

// Tab Component
const TabButton = ({ active, onClick, children, icon: Icon }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${
      active
        ? "bg-blue-600 text-white shadow-md"
        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
    }`}
  >
    <Icon className="w-4 h-4" />
    {children}
  </button>
);

const KelolaCutiPage = () => {
  const [activeTab, setActiveTab] = useState("kuota");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [filterTahun, setFilterTahun] = useState(new Date().getFullYear());
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [selectedPengajuan, setSelectedPengajuan] = useState(null);
  const [approvalData, setApprovalData] = useState({
    status: "",
    catatan_approval: "",
  });

  const [formData, setFormData] = useState({
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
    total_hari_kerja: 22,
    kuota_cuti: 7,
    keterangan: "",
  });

  const {
    loading,
    kuotaCutiList,
    pengajuanCutiList,
    fetchKuotaCuti,
    handleCreateKuotaCuti,
    handleUpdateKuotaCuti,
    handleDeleteKuotaCuti,
    fetchPengajuanCuti,
    handleUpdateStatusPengajuan,
  } = useCuti();

  useEffect(() => {
    if (activeTab === "kuota") {
      fetchKuotaCuti(filterTahun);
    } else {
      fetchPengajuanCuti();
    }
  }, [activeTab, filterTahun, fetchKuotaCuti, fetchPengajuanCuti]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "keterangan" ? value : parseInt(value) || value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode && selectedData) {
        await handleUpdateKuotaCuti(selectedData.id, formData);
      } else {
        await handleCreateKuotaCuti(formData);
      }
      closeModal();
    } catch (error) {
      // Error sudah di-handle di hook
    }
  };

  const handleEdit = (data) => {
    setSelectedData(data);
    setFormData({
      bulan: data.bulan,
      tahun: data.tahun,
      total_hari_kerja: data.total_hari_kerja,
      kuota_cuti: data.kuota_cuti,
      keterangan: data.keterangan || "",
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kuota cuti ini?")) {
      try {
        await handleDeleteKuotaCuti(id);
      } catch (error) {
        // Error sudah di-handle di hook
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      bulan: new Date().getMonth() + 1,
      tahun: new Date().getFullYear(),
      total_hari_kerja: 22,
      kuota_cuti: 7,
      keterangan: "",
    });
    setIsEditMode(false);
    setSelectedData(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedData(null);
  };

  const openApprovalModal = (pengajuan) => {
    setSelectedPengajuan(pengajuan);
    setApprovalData({ status: "", catatan_approval: "" });
    setIsApprovalModalOpen(true);
  };

  const handleApproval = async () => {
    if (!approvalData.status) {
      return;
    }
    try {
      await handleUpdateStatusPengajuan(selectedPengajuan.id, approvalData);
      setIsApprovalModalOpen(false);
      setSelectedPengajuan(null);
    } catch (error) {
      // Error sudah di-handle di hook
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: AlertCircle,
      },
      disetujui: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
      },
      ditolak: { bg: "bg-red-100", text: "text-red-700", icon: XCircle },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;

    return (
      <span
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
      >
        <Icon className="w-3 h-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-7 h-7 text-blue-600" />
          Kelola Cuti Karyawan
        </h1>
        <p className="text-gray-500 mt-1">
          Atur kuota cuti bulanan dan kelola pengajuan cuti karyawan
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <TabButton
          active={activeTab === "kuota"}
          onClick={() => setActiveTab("kuota")}
          icon={CalendarDays}
        >
          Kuota Cuti
        </TabButton>
        <TabButton
          active={activeTab === "pengajuan"}
          onClick={() => setActiveTab("pengajuan")}
          icon={FileText}
        >
          Pengajuan Cuti
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === "kuota" ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-600">
                Filter Tahun:
              </label>
              <select
                value={filterTahun}
                onChange={(e) => setFilterTahun(parseInt(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Tambah Kuota
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Bulan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Tahun
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Hari Kerja
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Kuota Cuti
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Keterangan
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
                      colSpan="7"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : kuotaCutiList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Tidak ada data kuota cuti
                    </td>
                  </tr>
                ) : (
                  kuotaCutiList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {namaBulan[item.bulan - 1]}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.tahun}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {item.total_hari_kerja} hari
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {item.kuota_cuti} hari
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {item.keterangan || "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {item.is_active ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
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
      ) : (
        /* Pengajuan Cuti Tab */
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              Daftar Pengajuan Cuti
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
                    Jenis Cuti
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                    Tanggal
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
                      Loading...
                    </td>
                  </tr>
                ) : pengajuanCutiList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Tidak ada pengajuan cuti
                    </td>
                  </tr>
                ) : (
                  pengajuanCutiList.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.karyawan?.nama_lengkap || "-"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.karyawan?.jabatan || "-"}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 capitalize">
                          {item.jenis_cuti}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(item.tanggal_mulai).toLocaleDateString(
                          "id-ID"
                        )}{" "}
                        -{" "}
                        {new Date(item.tanggal_selesai).toLocaleDateString(
                          "id-ID"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                          {item.jumlah_hari} hari
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 max-w-xs truncate">
                        {item.alasan}
                      </td>
                      <td className="px-4 py-3">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          {item.status === "pending" ? (
                            <button
                              onClick={() => openApprovalModal(item)}
                              className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
                            >
                              Proses
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">
                              Sudah diproses
                            </span>
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
      )}

      {/* Modal Tambah/Edit Kuota */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditMode ? "Edit Kuota Cuti" : "Tambah Kuota Cuti"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Bulan
              </label>
              <select
                name="bulan"
                value={formData.bulan}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                {namaBulan.map((nama, index) => (
                  <option key={index} value={index + 1}>
                    {nama}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun
              </label>
              <input
                type="number"
                name="tahun"
                value={formData.tahun}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Hari Kerja
              </label>
              <input
                type="number"
                name="total_hari_kerja"
                value={formData.total_hari_kerja}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="1"
                max="31"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kuota Cuti (hari)
              </label>
              <input
                type="number"
                name="kuota_cuti"
                value={formData.kuota_cuti}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                min="0"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan (opsional)
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Keterangan tambahan..."
            />
          </div>

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
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Approval */}
      <Modal
        isOpen={isApprovalModalOpen}
        onClose={() => setIsApprovalModalOpen(false)}
        title="Proses Pengajuan Cuti"
      >
        <div className="space-y-4">
          {selectedPengajuan && (
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              <p className="text-sm">
                <span className="font-medium">Karyawan:</span>{" "}
                {selectedPengajuan.karyawan?.nama_lengkap}
              </p>
              <p className="text-sm">
                <span className="font-medium">Tanggal:</span>{" "}
                {new Date(selectedPengajuan.tanggal_mulai).toLocaleDateString(
                  "id-ID"
                )}{" "}
                -{" "}
                {new Date(selectedPengajuan.tanggal_selesai).toLocaleDateString(
                  "id-ID"
                )}
              </p>
              <p className="text-sm">
                <span className="font-medium">Jumlah:</span>{" "}
                {selectedPengajuan.jumlah_hari} hari
              </p>
              <p className="text-sm">
                <span className="font-medium">Alasan:</span>{" "}
                {selectedPengajuan.alasan}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Keputusan
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() =>
                  setApprovalData({ ...approvalData, status: "disetujui" })
                }
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  approvalData.status === "disetujui"
                    ? "bg-green-600 text-white"
                    : "border border-green-300 text-green-700 hover:bg-green-50"
                }`}
              >
                <CheckCircle className="w-4 h-4" />
                Setujui
              </button>
              <button
                type="button"
                onClick={() =>
                  setApprovalData({ ...approvalData, status: "ditolak" })
                }
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
                  approvalData.status === "ditolak"
                    ? "bg-red-600 text-white"
                    : "border border-red-300 text-red-700 hover:bg-red-50"
                }`}
              >
                <XCircle className="w-4 h-4" />
                Tolak
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catatan (opsional)
            </label>
            <textarea
              value={approvalData.catatan_approval}
              onChange={(e) =>
                setApprovalData({
                  ...approvalData,
                  catatan_approval: e.target.value,
                })
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Catatan untuk karyawan..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsApprovalModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleApproval}
              disabled={!approvalData.status || loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? "Memproses..." : "Konfirmasi"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default KelolaCutiPage;
