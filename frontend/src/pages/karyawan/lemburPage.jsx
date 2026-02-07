import React, { useState, useEffect } from "react";
import {
  Clock,
  Plus,
  X,
  Send,
  AlertCircle,
  CheckCircle,
  XCircle,
  Trash2,
  FileText,
  Timer,
  TrendingUp,
} from "lucide-react";
import { toast } from "sonner";
import {
  createLembur,
  getMyLembur,
  deleteLembur,
} from "../../services/lemburService";

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

export default function LemburPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lemburList, setLemburList] = useState([]);
  const [stats, setStats] = useState({});
  const [formData, setFormData] = useState({
    tanggal: "",
    jam_mulai: "",
    jam_selesai: "",
    keterangan: "",
  });
  const [totalJam, setTotalJam] = useState(0);

  useEffect(() => {
    fetchLemburData();
  }, []);

  // Auto calculate total jam
  useEffect(() => {
    if (formData.jam_mulai && formData.jam_selesai) {
      const [startH, startM] = formData.jam_mulai.split(":").map(Number);
      const [endH, endM] = formData.jam_selesai.split(":").map(Number);

      let totalMinutes = endH * 60 + endM - (startH * 60 + startM);

      // Handle overnight
      if (totalMinutes < 0) {
        totalMinutes += 24 * 60;
      }

      const hours = totalMinutes / 60;
      setTotalJam(hours > 0 && hours <= 24 ? hours.toFixed(2) : 0);
    } else {
      setTotalJam(0);
    }
  }, [formData.jam_mulai, formData.jam_selesai]);

  const fetchLemburData = async () => {
    try {
      setLoading(true);
      const response = await getMyLembur();
      setLemburList(response.data);
      setStats(response.stats || {});
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal mengambil data lembur");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await createLembur(formData);
      toast.success("Berhasil mengajukan lembur");
      setIsModalOpen(false);
      fetchLemburData();
      setFormData({
        tanggal: "",
        jam_mulai: "",
        jam_selesai: "",
        keterangan: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal mengajukan lembur");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Yakin ingin menghapus pengajuan lembur ini?")) {
      try {
        await deleteLembur(id);
        toast.success("Berhasil menghapus pengajuan lembur");
        fetchLemburData();
      } catch (error) {
        toast.error(error.response?.data?.msg || "Gagal menghapus lembur");
      }
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-yellow-100",
        text: "text-yellow-700",
        icon: AlertCircle,
        label: "Menunggu",
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

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Clock className="w-7 h-7 text-blue-600" />
          Pengajuan Lembur
        </h1>
        <p className="text-gray-500 mt-1">
          Ajukan lembur dan pantau status persetujuan
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <p className="text-blue-100 text-sm">Total Jam</p>
              <p className="text-2xl font-bold">
                {stats.total_jam_approved || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Riwayat Pengajuan Lembur
          </h3>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Ajukan Lembur
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
                  Jam
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Total Jam
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Keterangan
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                  Alasan Tolak
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
              ) : lemburList.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="px-4 py-8 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="w-10 h-10 text-gray-300" />
                      <p>Belum ada pengajuan lembur</p>
                    </div>
                  </td>
                </tr>
              ) : (
                lemburList.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
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
                    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
                      <p
                        className="truncate"
                        title={item.rejection_reason || "-"}
                      >
                        {item.rejection_reason || "-"}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center">
                        {item.status === "pending" ? (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Hapus Pengajuan"
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

      {/* Modal Ajukan Lembur */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ajukan Lembur"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Lembur <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.tanggal}
              onChange={(e) =>
                setFormData({ ...formData, tanggal: e.target.value })
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jam Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.jam_mulai}
                onChange={(e) =>
                  setFormData({ ...formData, jam_mulai: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jam Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.jam_selesai}
                onChange={(e) =>
                  setFormData({ ...formData, jam_selesai: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {totalJam > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
              <span className="text-sm text-gray-600">Total jam lembur:</span>
              <span className="text-lg font-semibold text-blue-600">
                {totalJam} jam
              </span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.keterangan}
              onChange={(e) =>
                setFormData({ ...formData, keterangan: e.target.value })
              }
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Jelaskan pekerjaan yang dilakukan saat lembur..."
              required
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || totalJam === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {loading ? "Mengajukan..." : "Ajukan Lembur"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
