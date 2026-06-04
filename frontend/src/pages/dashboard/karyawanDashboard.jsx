import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAbsensiHook from "../../hooks/karyawan/useAbsensi.hook";
import { getKaryawanAnalytics } from "../../services/karyawan/dashboardAnalytics.service";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function KaryawanDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);
  const navigate = useNavigate();

  const {
    absensiMasuk,
    fetchDataAbsensi,
    absensiLoading,
    absensiError,
    absensiMingguan,
    fetchDataAbsensiMingguan,
  } = useAbsensiHook();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDataAbsensiMingguan();
    fetchDataAbsensi();
    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await getKaryawanAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error("Error loading analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleClockIn = () => {
    navigate("/karyawan/absensi");
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const hariMap = {
    Monday: "Senin",
    Tuesday: "Selasa",
    Wednesday: "Rabu",
    Thursday: "Kamis",
    Friday: "Jumat",
    Saturday: "Sabtu",
    Sunday: "Minggu",
  };

  // Custom label untuk pie chart
  const renderCustomLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        className="text-xs font-bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Dashboard Karyawan
          </h1>
          <p className="text-gray-600">{formatDate(currentTime)}</p>
        </div>

        {/* Top Section - Absensi & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Card Absensi */}
          <div className="bg-gradient-to-br from-[#00B4DD] to-[#0099cc] rounded-2xl shadow-xl p-8 text-white">
            <p className="text-sm opacity-90 mb-2">Waktu Saat Ini</p>
            <div className="text-5xl font-bold mb-6">
              {formatTime(currentTime)}
            </div>

            {attendanceStatus && (
              <div className="mb-4 px-4 py-2 bg-white/20 backdrop-blur rounded-lg text-sm inline-flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                {attendanceStatus}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleClockIn}
                className="px-6 py-3 bg-white text-[#00B4DD] rounded-xl hover:bg-blue-50 transition-all font-semibold shadow-lg"
              >
                Absen Masuk
              </button>
              <button
                onClick={handleClockIn}
                className="px-6 py-3 bg-white/20 backdrop-blur text-white rounded-xl hover:bg-white/30 transition-all font-semibold"
              >
                Absen Pulang
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Tepat Waktu</p>
                <CheckCircle2 size={20} className="text-emerald-500" />
              </div>
              <p className="text-4xl font-bold text-gray-800">
                {absensiMasuk?.mingguIni?.onTime || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">hari minggu ini</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Kehadiran</p>
                <Calendar size={20} className="text-blue-500" />
              </div>
              <p className="text-4xl font-bold text-gray-800">
                {absensiMasuk?.mingguIni?.totalDays || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">hari minggu ini</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Keterlambatan</p>
                <Clock size={20} className="text-orange-500" />
              </div>
              <p className="text-4xl font-bold text-gray-800">
                {absensiMasuk?.mingguIni?.late || 0}
              </p>
              <p className="text-xs text-gray-500 mt-1">kali minggu ini</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-600">Total Cuti</p>
                <XCircle size={20} className="text-purple-500" />
              </div>
              {/* FIX (Task 5.2): hitung cuti dari absensiMingguan (minggu ini)
                  alih-alih hardcoded 0. */}
              <p className="text-4xl font-bold text-gray-800">
                {(Array.isArray(absensiMingguan) ? absensiMingguan : []).filter(
                  (a) => a.status === "cuti",
                ).length}
              </p>
              <p className="text-xs text-gray-500 mt-1">hari cuti minggu ini</p>
            </div>
          </div>
        </div>

        {/* Analytics Charts */}
        {!loadingAnalytics && analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Tren Kehadiran Mingguan */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="text-[#00B4DD]" size={24} />
                <h3 className="text-xl font-semibold text-gray-800">
                  Tren Kehadiran 7 Hari Terakhir
                </h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                    }}
                  />
                  <Legend />
                  <Bar
                    dataKey="hadir"
                    fill="#10b981"
                    name="Hadir"
                    radius={[8, 8, 0, 0]}
                  />
                  <Bar
                    dataKey="terlambat"
                    fill="#f59e0b"
                    name="Terlambat"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Breakdown Kehadiran */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="text-[#00B4DD]" size={24} />
                <h3 className="text-xl font-semibold text-gray-800">
                  Distribusi Kehadiran Bulan Ini
                </h3>
              </div>
              {analytics.attendanceBreakdown.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.attendanceBreakdown}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.attendanceBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-gray-400">
                  Belum ada data kehadiran bulan ini
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabel Riwayat Absensi */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="px-6 py-4">
            <h3 className="text-xl font-semibold text-gray-700">
              Riwayat Absensi Mingguan
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-200">
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    No
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Tanggal
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Hari
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Jam Masuk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Jam Keluar
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                    Keterangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {(Array.isArray(absensiMingguan) ? absensiMingguan : []).map(
                  (record, index) => (
                  <tr
                    key={index}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } hover:bg-teal-50 transition-colors border-b border-gray-100`}
                  >
                    <td className="px-4 py-4 text-sm font-semibold text-gray-700">
                      {index + 1}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-800 font-medium">
                      {record.tanggal}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700">
                      {hariMap[record.hari] || record.hari}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-mono">
                      {record.jam_masuk?.slice(0, 5)}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 font-mono">
                      {record.jam_keluar?.slice(0, 5)}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          record.status === "Masuk"
                            ? "bg-emerald-100 text-emerald-700"
                            : record.status === "terlambat"
                              ? "bg-orange-100 text-orange-700"
                              : record.status === "Cuti"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600">
                      {record.keterangan}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Menampilkan {(Array.isArray(absensiMingguan) ? absensiMingguan.length : 0)} data minggu ini
            </p>
            <button
              onClick={() => navigate("/karyawan/data-absen")}
              className="text-sm text-teal-600 hover:text-teal-800 font-semibold transition-colors"
            >
              Lihat Semua Riwayat →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
