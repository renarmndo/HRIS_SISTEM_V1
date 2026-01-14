import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Calendar,
  Clock,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  X,
  Save,
  UserCheck,
  UserX,
  Coffee,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Eye,
  Edit2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAbsensiByDate,
  getAbsensiStats,
  createAbsensiManual,
  updateAbsensi,
  getAbsensiBulananKaryawan,
} from "../../services/hrd/absensiHrdService";

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

// Status options
const statusOptions = [
  { value: "masuk", label: "Hadir", color: "green" },
  { value: "terlambat", label: "Terlambat", color: "purple" },
  { value: "tidak_hadir", label: "Tidak Hadir", color: "red" },
  { value: "izin", label: "Izin", color: "blue" },
  { value: "sakit", label: "Sakit", color: "orange" },
  { value: "cuti", label: "Cuti", color: "cyan" },
];

// Modal Component
const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
      <div
        className={`relative bg-white rounded-xl shadow-2xl w-full ${sizeClasses[size]} mx-4 z-10 max-h-[90vh] overflow-hidden flex flex-col`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ label, count, icon: Icon, color }) => {
  const colorClasses = {
    green: "bg-green-50 border-l-green-500 text-green-700",
    red: "bg-red-50 border-l-red-500 text-red-700",
    purple: "bg-purple-50 border-l-purple-500 text-purple-700",
    blue: "bg-blue-50 border-l-blue-500 text-blue-700",
    orange: "bg-orange-50 border-l-orange-500 text-orange-700",
    cyan: "bg-cyan-50 border-l-cyan-500 text-cyan-700",
    gray: "bg-gray-50 border-l-gray-500 text-gray-700",
  };

  return (
    <div
      className={`p-4 rounded-lg border-l-4 ${colorClasses[color]} bg-white shadow-sm`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
          <p className="text-2xl font-bold mt-1">{count}</p>
        </div>
        <Icon className="w-8 h-8 opacity-50" />
      </div>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  const badges = {
    masuk: { bg: "bg-green-100", text: "text-green-700", label: "Hadir" },
    terlambat: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      label: "Terlambat",
    },
    tidak_hadir: {
      bg: "bg-red-100",
      text: "text-red-700",
      label: "Tidak Hadir",
    },
    izin: { bg: "bg-blue-100", text: "text-blue-700", label: "Izin" },
    sakit: { bg: "bg-orange-100", text: "text-orange-700", label: "Sakit" },
    cuti: { bg: "bg-cyan-100", text: "text-cyan-700", label: "Cuti" },
    libur: { bg: "bg-gray-100", text: "text-gray-700", label: "Libur" },
  };

  const badge = badges[status] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
    label: "-",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}
    >
      {badge.label}
    </span>
  );
};

export default function KelolaAbsensiKaryawan() {
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [absensiData, setAbsensiData] = useState([]);
  const [stats, setStats] = useState({
    total_karyawan: 0,
    sudah_absen: 0,
    belum_absen: 0,
    stats: {
      hadir: 0,
      terlambat: 0,
      tidak_hadir: 0,
      izin: 0,
      sakit: 0,
      cuti: 0,
    },
  });

  // Modal states
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);
  const [detailData, setDetailData] = useState(null);

  // Form state for manual/edit absensi
  const [formData, setFormData] = useState({
    status: "masuk",
    jam_masuk: "08:00",
    jam_keluar: "",
    keterangan: "",
  });

  // Detail filter
  const [detailBulan, setDetailBulan] = useState(new Date().getMonth() + 1);
  const [detailTahun, setDetailTahun] = useState(new Date().getFullYear());

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [absensiRes, statsRes] = await Promise.all([
        getAbsensiByDate(selectedDate),
        getAbsensiStats(selectedDate),
      ]);

      setAbsensiData(absensiRes.data?.list || []);
      setStats(statsRes.data || stats);
    } catch (error) {
      toast.error("Gagal mengambil data absensi");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter data by search
  const filteredData = absensiData.filter(
    (item) =>
      item.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.jabatan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.departement?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const paginatedData = filteredData.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handle manual absensi
  const handleOpenManualModal = (karyawan) => {
    setSelectedKaryawan(karyawan);
    setFormData({
      status: "masuk",
      jam_masuk: "08:00",
      jam_keluar: "",
      keterangan: "",
    });
    setIsManualModalOpen(true);
  };

  // Handle edit absensi
  const handleOpenEditModal = (karyawan) => {
    setSelectedKaryawan(karyawan);
    setFormData({
      status: karyawan.absensi?.status || "masuk",
      jam_masuk: karyawan.absensi?.jam_masuk?.slice(0, 5) || "",
      jam_keluar: karyawan.absensi?.jam_keluar?.slice(0, 5) || "",
      keterangan: karyawan.absensi?.keterangan || "",
    });
    setIsEditModalOpen(true);
  };

  // Handle view detail
  const handleViewDetail = async (karyawan) => {
    setSelectedKaryawan(karyawan);
    setIsDetailModalOpen(true);
    await fetchDetailData(karyawan.karyawan_id);
  };

  const fetchDetailData = async (karyawanId) => {
    try {
      const res = await getAbsensiBulananKaryawan(
        karyawanId,
        detailBulan,
        detailTahun
      );
      setDetailData(res.data);
    } catch (error) {
      toast.error("Gagal mengambil detail absensi");
    }
  };

  // Submit manual absensi
  const handleSubmitManual = async () => {
    try {
      await createAbsensiManual({
        karyawan_id: selectedKaryawan.karyawan_id,
        tanggal: selectedDate,
        jam_masuk: formData.jam_masuk || null,
        jam_keluar: formData.jam_keluar || null,
        status: formData.status,
        keterangan: formData.keterangan,
      });
      toast.success("Berhasil mengabsenkan karyawan");
      setIsManualModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal mengabsenkan karyawan");
    }
  };

  // Submit edit absensi
  const handleSubmitEdit = async () => {
    try {
      await updateAbsensi(selectedKaryawan.absensi.id, {
        jam_masuk: formData.jam_masuk || null,
        jam_keluar: formData.jam_keluar || null,
        status: formData.status,
        keterangan: formData.keterangan,
      });
      toast.success("Berhasil memperbarui absensi");
      setIsEditModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal memperbarui absensi");
    }
  };

  // Format tanggal untuk display
  const formatDisplayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Calendar className="w-7 h-7 text-blue-600" />
          Data Absensi Karyawan
        </h1>
        <p className="text-gray-500 mt-1">
          Kelola dan pantau absensi karyawan harian
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <StatsCard
          label="Hadir"
          count={stats.stats?.hadir || 0}
          icon={CheckCircle}
          color="green"
        />
        <StatsCard
          label="Terlambat"
          count={stats.stats?.terlambat || 0}
          icon={Clock}
          color="purple"
        />
        <StatsCard
          label="Tidak Hadir"
          count={stats.belum_absen || 0}
          icon={UserX}
          color="red"
        />
        <StatsCard
          label="Izin"
          count={stats.stats?.izin || 0}
          icon={Briefcase}
          color="blue"
        />
        <StatsCard
          label="Sakit"
          count={stats.stats?.sakit || 0}
          icon={AlertCircle}
          color="orange"
        />
        <StatsCard
          label="Cuti"
          count={stats.stats?.cuti || 0}
          icon={Coffee}
          color="cyan"
        />
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            {/* Date Picker */}
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="text-sm text-gray-600 flex items-center">
              <span className="font-medium">
                {formatDisplayDate(selectedDate)}
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Cari nama, jabatan, departemen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 mb-6 text-sm text-slate-700">
        <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
        <p>
          Karyawan yang belum absen akan muncul dengan status kosong. Anda dapat
          mengabsenkan manual atau mengubah status absensi yang sudah ada.
        </p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  No
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Karyawan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Departemen
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
                  Keterangan
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
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    Tidak ada data karyawan
                  </td>
                </tr>
              ) : (
                paginatedData.map((item, index) => (
                  <tr key={item.karyawan_id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {(currentPage - 1) * rowsPerPage + index + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {item.nama_lengkap?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {item.nama_lengkap}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.jabatan}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.departement || "-"}
                    </td>
                    <td className="px-4 py-3">
                      {item.absensi?.jam_masuk ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-green-50 text-green-700 border-l-2 border-green-500">
                          {item.absensi.jam_masuk.slice(0, 5)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.absensi?.jam_keluar ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-blue-50 text-blue-700 border-l-2 border-blue-500">
                          {item.absensi.jam_keluar.slice(0, 5)}
                        </span>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.absensi ? (
                        <div className="flex items-center gap-2">
                          <StatusBadge status={item.absensi.status} />
                          {item.absensi.is_manual && (
                            <span className="text-xs text-gray-400">
                              (Manual)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
                          Belum Absen
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-[150px] truncate">
                      {item.absensi?.keterangan || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleViewDetail(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Lihat Detail Bulanan"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {item.absensi ? (
                          <button
                            onClick={() => handleOpenEditModal(item)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Edit Absensi"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenManualModal(item)}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                            title="Absenkan Manual"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            Absenkan
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

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={25}>25</option>
            </select>
          </div>
          <div>
            {(currentPage - 1) * rowsPerPage + 1}-
            {Math.min(currentPage * rowsPerPage, filteredData.length)} of{" "}
            {filteredData.length}
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 hover:bg-gray-100 rounded disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal Absensi Manual */}
      <Modal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Absensi Manual"
      >
        <div className="space-y-4">
          {selectedKaryawan && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {selectedKaryawan.nama_lengkap}
              </p>
              <p className="text-xs text-gray-500">
                {selectedKaryawan.jabatan} - {selectedKaryawan.departement}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tanggal: {formatDisplayDate(selectedDate)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Kehadiran
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {(formData.status === "masuk" || formData.status === "terlambat") && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jam Masuk
                </label>
                <input
                  type="time"
                  value={formData.jam_masuk}
                  onChange={(e) =>
                    setFormData({ ...formData, jam_masuk: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Jam Keluar
                </label>
                <input
                  type="time"
                  value={formData.jam_keluar}
                  onChange={(e) =>
                    setFormData({ ...formData, jam_keluar: e.target.value })
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({ ...formData, keterangan: e.target.value })
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Keterangan tambahan..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsManualModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmitManual}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Simpan
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Edit Absensi */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Absensi"
      >
        <div className="space-y-4">
          {selectedKaryawan && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {selectedKaryawan.nama_lengkap}
              </p>
              <p className="text-xs text-gray-500">
                {selectedKaryawan.jabatan} - {selectedKaryawan.departement}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Tanggal: {formatDisplayDate(selectedDate)}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Kehadiran
            </label>
            <select
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jam Masuk
              </label>
              <input
                type="time"
                value={formData.jam_masuk}
                onChange={(e) =>
                  setFormData({ ...formData, jam_masuk: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jam Keluar
              </label>
              <input
                type="time"
                value={formData.jam_keluar}
                onChange={(e) =>
                  setFormData({ ...formData, jam_keluar: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({ ...formData, keterangan: e.target.value })
              }
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
              placeholder="Keterangan tambahan..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setIsEditModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleSubmitEdit}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              Update
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Detail Bulanan */}
      <Modal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setDetailData(null);
        }}
        title="Detail Absensi Bulanan"
        size="lg"
      >
        <div className="space-y-4">
          {selectedKaryawan && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {selectedKaryawan.nama_lengkap}
              </p>
              <p className="text-xs text-gray-500">
                {selectedKaryawan.jabatan} - {selectedKaryawan.departement}
              </p>
            </div>
          )}

          {/* Filter Bulan/Tahun */}
          <div className="flex gap-3">
            <select
              value={detailBulan}
              onChange={(e) => {
                setDetailBulan(Number(e.target.value));
                if (selectedKaryawan) {
                  fetchDetailData(selectedKaryawan.karyawan_id);
                }
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
            >
              {namaBulan.map((nama, idx) => (
                <option key={idx} value={idx + 1}>
                  {nama}
                </option>
              ))}
            </select>
            <select
              value={detailTahun}
              onChange={(e) => {
                setDetailTahun(Number(e.target.value));
                if (selectedKaryawan) {
                  fetchDetailData(selectedKaryawan.karyawan_id);
                }
              }}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
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
            <button
              onClick={() => fetchDetailData(selectedKaryawan?.karyawan_id)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              Tampilkan
            </button>
          </div>

          {/* Stats Summary */}
          {detailData?.stats && (
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              <div className="bg-green-50 p-2 rounded text-center">
                <p className="text-lg font-bold text-green-700">
                  {detailData.stats.hadir}
                </p>
                <p className="text-xs text-green-600">Hadir</p>
              </div>
              <div className="bg-purple-50 p-2 rounded text-center">
                <p className="text-lg font-bold text-purple-700">
                  {detailData.stats.terlambat}
                </p>
                <p className="text-xs text-purple-600">Terlambat</p>
              </div>
              <div className="bg-red-50 p-2 rounded text-center">
                <p className="text-lg font-bold text-red-700">
                  {detailData.stats.tidakHadir}
                </p>
                <p className="text-xs text-red-600">Tidak Hadir</p>
              </div>
              <div className="bg-blue-50 p-2 rounded text-center">
                <p className="text-lg font-bold text-blue-700">
                  {detailData.stats.izin}
                </p>
                <p className="text-xs text-blue-600">Izin</p>
              </div>
              <div className="bg-orange-50 p-2 rounded text-center">
                <p className="text-lg font-bold text-orange-700">
                  {detailData.stats.sakit}
                </p>
                <p className="text-xs text-orange-600">Sakit</p>
              </div>
              <div className="bg-cyan-50 p-2 rounded text-center">
                <p className="text-lg font-bold text-cyan-700">
                  {detailData.stats.cuti}
                </p>
                <p className="text-xs text-cyan-600">Cuti</p>
              </div>
            </div>
          )}

          {/* Table */}
          <div className="max-h-[300px] overflow-y-auto border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Tanggal
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Hari
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Masuk
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Keluar
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-500">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {detailData?.absensi?.length > 0 ? (
                  detailData.absensi.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-600">
                        {item.tanggal}
                      </td>
                      <td className="px-3 py-2 text-gray-600">{item.hari}</td>
                      <td className="px-3 py-2 text-gray-600">
                        {item.jam_masuk || "-"}
                      </td>
                      <td className="px-3 py-2 text-gray-600">
                        {item.jam_keluar || "-"}
                      </td>
                      <td className="px-3 py-2">
                        <StatusBadge status={item.status} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="5"
                      className="px-3 py-8 text-center text-gray-500"
                    >
                      Tidak ada data absensi
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
