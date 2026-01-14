import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Users,
  FileText,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Bell,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  getDashboardStats,
  getPengajuanCutiTerbaru,
  quickUpdatePengajuanStatus,
} from "../../services/hrd/dashboardService";

const DashboardHRD = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalKaryawan: 0,
    pengajuanCutiPending: 0,
    pengajuanIzinPending: 0,
    absensiHariIni: {
      totalHadir: 0,
      persenKehadiran: 0,
    },
  });
  const [pengajuanList, setPengajuanList] = useState([]);
  const [processingId, setProcessingId] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, pengajuanRes] = await Promise.all([
        getDashboardStats(),
        getPengajuanCutiTerbaru(),
      ]);

      setStats(statsRes.data);
      setPengajuanList(pengajuanRes.data || []);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Don't show toast on initial load failure, just log it
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle approve/reject
  const handleQuickAction = async (id, status) => {
    setProcessingId(id);
    try {
      await quickUpdatePengajuanStatus(id, status);
      toast.success(
        `Pengajuan berhasil ${status === "disetujui" ? "disetujui" : "ditolak"}`
      );
      fetchData(); // Refresh data
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal memproses pengajuan");
    } finally {
      setProcessingId(null);
    }
  };

  // Format tanggal
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format periode
  const formatPeriode = (start, end) => {
    if (!start || !end) return "-";
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (startDate.getTime() === endDate.getTime()) {
      return formatDate(start);
    }

    return `${formatDate(start)} - ${formatDate(end)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 p-1 font-sans text-slate-800">
      {/* --- Header Section --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard HRD</h1>
          <p className="text-sm text-slate-500">
            Ringkasan data karyawan dan persetujuan cuti
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Cari data..."
              className="pl-10 pr-4 py-2.5 w-full border border-slate-200 rounded-xl bg-white focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 transition-all text-sm"
            />
          </div>
          {/* Notification Button */}
          <button className="p-2.5 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 relative">
            <Bell className="w-5 h-5" />
            {stats.pengajuanCutiPending > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            )}
          </button>
        </div>
      </div>

      {/* --- Top Statistics Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Karyawan"
          value={loading ? "..." : stats.totalKaryawan}
          subtext="Karyawan Aktif"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Pengajuan Cuti"
          value={loading ? "..." : stats.pengajuanCutiPending}
          subtext="Perlu Persetujuan"
          icon={CalendarIcon}
          color="bg-amber-500"
        />
        <StatCard
          title="Izin Hari Ini"
          value={loading ? "..." : stats.absensiHariIni?.izin || 0}
          subtext="Karyawan Izin"
          icon={FileText}
          color="bg-violet-500"
        />
        <StatCard
          title="Hadir Hari Ini"
          value={loading ? "..." : stats.absensiHariIni?.totalHadir || 0}
          subtext={`${stats.absensiHariIni?.persenKehadiran || 0}% Kehadiran`}
          icon={CheckCircle}
          color="bg-emerald-500"
        />
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 xl:grid-cols-1 gap-8">
        {/* Left Column: Tabel Pengajuan Cuti (Lebih Lebar) */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Pengajuan Cuti & Izin Terbaru
                </h2>
                <p className="text-sm text-slate-500">
                  Daftar karyawan yang mengajukan ketidakhadiran
                </p>
              </div>
              <button
                onClick={() => (window.location.href = "/hrd/leaves")}
                className="text-sm font-medium text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors"
              >
                Lihat Semua
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 pl-4 rounded-l-lg">Karyawan</th>
                    <th className="py-4">Jenis</th>
                    <th className="py-4">Tanggal / Periode</th>
                    <th className="py-4">Alasan</th>
                    <th className="py-4">Status</th>
                    <th className="py-4 text-center rounded-r-lg">Aksi</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-8 text-center text-slate-400"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                          Loading...
                        </div>
                      </td>
                    </tr>
                  ) : pengajuanList.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="py-8 text-center text-slate-400"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <CalendarIcon className="w-10 h-10 text-slate-300" />
                          <p>Tidak ada pengajuan cuti</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    pengajuanList.map((item) => (
                      <RequestRow
                        key={item.id}
                        id={item.id}
                        name={item.karyawan?.nama || "Unknown"}
                        role={item.karyawan?.jabatan || "-"}
                        type={item.jenis_cuti}
                        date={formatPeriode(
                          item.tanggal_mulai,
                          item.tanggal_selesai
                        )}
                        note={item.alasan}
                        status={item.status}
                        onApprove={() =>
                          handleQuickAction(item.id, "disetujui")
                        }
                        onReject={() => handleQuickAction(item.id, "ditolak")}
                        isProcessing={processingId === item.id}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Sub Components --- */

const StatCard = ({ title, value, subtext, icon: Icon, color }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow flex items-start justify-between">
    <div>
      <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-slate-800 mb-1">{value}</h3>
      <p className="text-xs text-slate-400 font-medium">{subtext}</p>
    </div>
    <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-white`}>
      <Icon className={`w-6 h-6 ${color.replace("bg-", "text-")}`} />
    </div>
  </div>
);

const RequestRow = ({
  id,
  name,
  role,
  type,
  date,
  note,
  status,
  onApprove,
  onReject,
  isProcessing,
}) => {
  let statusBadge;
  let actionButtons = false;

  switch (status) {
    case "disetujui":
      statusBadge = (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">
          Disetujui
        </span>
      );
      break;
    case "ditolak":
      statusBadge = (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
          Ditolak
        </span>
      );
      break;
    default: // pending
      statusBadge = (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-600">
          Menunggu
        </span>
      );
      actionButtons = true;
  }

  // Get initial for avatar
  const initial = name?.charAt(0)?.toUpperCase() || "?";

  return (
    <tr className="hover:bg-slate-50/80 transition-colors group">
      <td className="py-4 pl-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
            {initial}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{name}</p>
            <p className="text-xs text-slate-500">{role}</p>
          </div>
        </div>
      </td>
      <td className="py-4 text-sm font-medium text-slate-700 capitalize">
        {type?.replace("_", " ") || "-"}
      </td>
      <td className="py-4 text-sm text-slate-500">{date}</td>
      <td
        className="py-4 text-sm text-slate-500 max-w-[150px] truncate"
        title={note}
      >
        {note || "-"}
      </td>
      <td className="py-4">{statusBadge}</td>
      <td className="py-4 pr-4 text-center">
        {actionButtons ? (
          <div className="flex justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <button
                  onClick={onApprove}
                  className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200 transition-colors"
                  title="Setujui"
                >
                  <CheckCircle className="w-4 h-4" />
                </button>
                <button
                  onClick={onReject}
                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  title="Tolak"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        ) : (
          <button className="text-slate-400 hover:text-slate-600">
            <MoreHorizontal className="w-5 h-5 mx-auto" />
          </button>
        )}
      </td>
    </tr>
  );
};

export default DashboardHRD;
