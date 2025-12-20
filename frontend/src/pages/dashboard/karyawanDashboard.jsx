import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAbsensiHook from "../../hooks/karyawan/useAbsensi.hook";

export default function KaryawanDashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [attendanceStatus, setAttendanceStatus] = useState(null);
  const [leaveBalance] = useState(12);
  const navigate = useNavigate();

  const {
    absensiMasuk,
    fetchDataAbsensi,
    absensiLoading,
    absensiError,
    absensiMingguan,
    fetchDataAbsensiMungguan,
  } = useAbsensiHook();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetchDataAbsensiMungguan();
  }, []);

  const monthlyAttendance = [
    {
      no: 1,
      date: "1 Des",
      day: "Senin",
      timeIn: "08:15",
      timeOut: "17:00",
      status: "Masuk",
      note: "Tepat waktu",
    },
    {
      no: 2,
      date: "2 Des",
      day: "Selasa",
      timeIn: "08:35",
      timeOut: "17:05",
      status: "Telat",
      note: "Terlambat 5 menit",
    },
    {
      no: 3,
      date: "3 Des",
      day: "Rabu",
      timeIn: "08:10",
      timeOut: "17:00",
      status: "Masuk",
      note: "Tepat waktu",
    },
    {
      no: 4,
      date: "4 Des",
      day: "Kamis",
      timeIn: "08:20",
      timeOut: "17:00",
      status: "Masuk",
      note: "Tepat waktu",
    },
    {
      no: 5,
      date: "5 Des",
      day: "Jumat",
      timeIn: "-",
      timeOut: "-",
      status: "Cuti",
      note: "Cuti tahunan",
    },
    {
      no: 6,
      date: "6 Des",
      day: "Sabtu",
      timeIn: "-",
      timeOut: "-",
      status: "Libur",
      note: "Akhir pekan",
    },
    {
      no: 7,
      date: "9 Des",
      day: "Senin",
      timeIn: "08:18",
      timeOut: "17:00",
      status: "Masuk",
      note: "Tepat waktu",
    },
    {
      no: 8,
      date: "10 Des",
      day: "Selasa",
      timeIn: "08:45",
      timeOut: "17:10",
      status: "Telat",
      note: "Terlambat 15 menit",
    },
  ];

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

  useEffect(() => {
    fetchDataAbsensi();
  }, []);

  const hariMap = {
    Monday: "Senin",
    Tuesday: "Selasa",
    Wednesday: "Rabu",
    Thursday: "Kamis",
    Friday: "Jumat",
    Saturday: "Sabtu",
    Sunday: "Minggu",
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
          <div className="bg-gradient-to-br from-[#00B4DD] to-[#00B4DD] rounded-2xl shadow-xl p-8 text-white">
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
              <p className="text-sm text-gray-600 mb-1">Tepat Waktu</p>
              <p className="text-4xl font-bold text-gray-800">
                {absensiMasuk?.mingguIni?.onTime}
              </p>
              <p className="text-xs text-gray-500 mt-1">hari tersedia</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
              <p className="text-sm text-gray-600 mb-1">Kehadiran</p>
              <p className="text-4xl font-bold text-gray-800">
                {absensiMasuk?.mingguIni?.totalDays}
              </p>
              <p className="text-xs text-gray-500 mt-1">hari bulan ini</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
              <p className="text-sm text-gray-600 mb-1">Keterlambatan</p>
              <p className="text-4xl font-bold text-gray-800">
                {absensiMasuk?.mingguIni?.late}
              </p>
              <p className="text-xs text-gray-500 mt-1">kali bulan ini</p>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
              <p className="text-sm text-gray-600 mb-1">Total Cuti</p>
              <p className="text-4xl font-bold text-gray-800">0</p>
              <p className="text-xs text-gray-500 mt-1">hari terpakai</p>
            </div>
          </div>
        </div>

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
                {absensiMingguan.map((record, index) => (
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
              Menampilkan {monthlyAttendance.length} dari{" "}
              {monthlyAttendance.length} data
            </p>
            <button className="text-sm text-teal-600 hover:text-teal-800 font-semibold transition-colors">
              Lihat Semua Riwayat →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
