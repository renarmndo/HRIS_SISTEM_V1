import React, { useState, useEffect } from "react";
import {
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileText,
  Timer,
  Search,
  Filter,
  X,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAllLembur,
  getLemburStats,
  approveLembur,
  rejectLembur,
} from "../../services/lemburService";
import ConfirmationModal from "../../components/ConfirmationModal";

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
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export default function KelolaLembur() {
  const [loading, setLoading] = useState(false);
  const [lemburList, setLemburList] = useState([]);
  const [stats, setStats] = useState({});
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [selectedLembur, setSelectedLembur] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [confirmApprove, setConfirmApprove] = useState({
    open: false,
    id: null,
    nama: null,
  });

  useEffect(() => {
    fetchLemburData();
    fetchStats();
  }, [filterStatus]);

  const fetchLemburData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const response = await getAllLembur(params);
      setLemburList(response.data);
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal mengambil data lembur");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await getLemburStats();
      setStats(response.data);
    } catch (error) {
      console.error("Error fetching stats", error);
    }
  };

  const handleApprove = (id, namaKaryawan) => {
    // SECURITY (Task 5.1): ConfirmationModal, bukan window.confirm
    setConfirmApprove({ open: true, id, nama: namaKaryawan });
  };

  const doApprove = async () => {
    const { id } = confirmApprove;
    setConfirmApprove({ open: false, id: null, nama: null });
    try {
      await approveLembur(id);
      toast.success("Lembur berhasil disetujui");
      fetchLemburData();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal menyetujui lembur");
    }
  };

  const handleRejectClick = (lembur) => {
    setSelectedLembur(lembur);
    setRejectionReason("");
    setIsRejectModalOpen(true);
  };

  const handleRejectSubmit = async () => {
    if (!rejectionReason.trim()) {
      toast.error("Alasan penolakan wajib diisi");
      return;
    }
    try {
      await rejectLembur(selectedLembur.id, rejectionReason);
      toast.success("Lembur berhasil ditolak");
      setIsRejectModalOpen(false);
      fetchLemburData();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal menolak lembur");
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: AlertCircle,
        label: "Pending",
      },
      approved: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        label: "Disetujui",
      },
      rejected: {
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

  const filteredList = lemburList.filter((item) =>
    item.karyawan?.nama_lengkap?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Clock className="w-7 h-7 text-blue-600" />
          Kelola Lembur Karyawan
        </h1>
        <p className="text-gray-500 mt-1">
          Kelola dan setujui pengajuan lembur
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-yellow-100 text-sm">Pending</p>
              <p className="text-2xl font-bold">{stats.total_pending || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-green-100 text-sm">Disetujui</p>
              <p className="text-2xl font-bold">{stats.total_approved || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-red-100 text-sm">Ditolak</p>
              <p className="text-2xl font-bold">{stats.total_rejected || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Timer className="w-6 h-6" />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Jam Approved</p>
              <p className="text-2xl font-bold">
                {stats.total_jam_approved || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-purple-100 text-sm">Jam Pending</p>
              <p className="text-2xl font-bold">
                {stats.total_jam_pending || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6 p-4">
        <div className="flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Cari karyawan..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Semua Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Disetujui</option>
            <option value="rejected">Ditolak</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Daftar Pengajuan Lembur
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
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Jam
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Total
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
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filteredList.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10 text-gray-300" />
                      <p>Tidak ada data lembur</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {item.karyawan?.nama_lengkap}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.karyawan?.departement} -{" "}
                          {item.karyawan?.jabatan}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(item.tanggal).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {item.jam_mulai} - {item.jam_selesai}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">
                        {item.total_jam} jam
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 max-w-xs">
                      <p className="truncate" title={item.keterangan}>
                        {item.keterangan}
                      </p>
                    </td>
                    <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        {item.status === "pending" && (
                          <>
                            <button
                              onClick={() =>
                                handleApprove(
                                  item.id,
                                  item.karyawan?.nama_lengkap,
                                )
                              }
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Setujui"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectClick(item)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Tolak"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {item.status !== "pending" && (
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

      {/* Reject Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Tolak Lembur"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Tolak lembur{" "}
            <strong>{selectedLembur?.karyawan?.nama_lengkap}</strong>?
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alasan Penolakan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Berikan alasan penolakan..."
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsRejectModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              onClick={handleRejectSubmit}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Tolak Lembur
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmationModal
        isOpen={confirmApprove.open}
        onClose={() => setConfirmApprove({ open: false, id: null, nama: null })}
        onConfirm={doApprove}
        title="Setujui Lembur"
        message={`Setujui lembur ${confirmApprove.nama || "karyawan ini"}?`}
        confirmText="Ya, Setujui"
        type="success"
      />
    </div>
  );
}
