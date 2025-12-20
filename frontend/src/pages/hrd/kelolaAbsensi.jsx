import React from "react";
import {
  Search,
  Calendar,
  FileSpreadsheet,
  Info,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";

export default function KelolaAbsensiKaryawan() {
  // --- Dummy Data ---
  const stats = [
    { label: "Sesuai Jadwal", count: 2, color: "bg-blue-500" },
    { label: "Tidak Masuk/Pulang", count: 1, color: "bg-red-500" },
    { label: "Pulang Cepat", count: 1, color: "bg-gray-400" },
    { label: "Terlambat", count: 3, color: "bg-purple-500" },
    { label: "Cuti", count: 1, color: "bg-orange-500" },
    { label: "Lembur", count: 1, color: "bg-emerald-500" },
  ];

  const attendanceData = [
    {
      id: 1,
      name: "Dina Darius",
      schedule: "Belum Ditentukan",
      isScheduleUnset: true,
      status: "Masih Berjalan",
      checkIn: "08 : 00 : 00",
      checkOut: "-",
      theme: "blue", // Untuk warna border jam
    },
    {
      id: 2,
      name: "Alfina Amalia",
      schedule: "Jadwal Pagi (08:00 - 12:00)",
      status: "Selesai",
      checkIn: "08 : 15 : 00",
      checkOut: "12 : 00 : 00",
      theme: "purple", // Terlambat
    },
    {
      id: 3,
      name: "Suhada Akbra",
      schedule: "Jadwal Pagi (08:00 - 12:00)",
      status: "Selesai",
      checkIn: "08 : 15 : 00",
      checkOut: "11 : 55 : 00",
      theme: "purple",
    },
    {
      id: 4,
      name: "Diah",
      schedule: "Jadwal Siang (12:00 - 16:00)",
      status: "Selesai",
      checkIn: "12 : 15 : 00",
      checkOut: "18 : 00 : 00",
      theme: "emerald", // Lembur/Selesai
    },
    {
      id: 5,
      name: "Diah",
      schedule: "Jadwal Siang (12:00 - 16:00)",
      status: "Tidak Absen Pulang",
      statusColor: "text-red-500",
      checkIn: "12 : 00 : 00",
      checkOut: "-",
      theme: "blue",
    },
    {
      id: 6,
      name: "Diah",
      schedule: "Jadwal Malam (16:00 - 20:00)",
      status: "Tidak Masuk",
      checkIn: "-",
      checkOut: "-",
      theme: "red",
    },
    {
      id: 7,
      name: "Diah P",
      schedule: "Jadwal Malam (16:00 - 20:00)",
      status: "Cuti",
      checkIn: "-",
      checkOut: "-",
      theme: "orange",
    },
  ];

  // Helper untuk styling jam berdasarkan theme
  const getTimeStyle = (theme) => {
    switch (theme) {
      case "blue":
        return "border-l-4 border-blue-500 bg-blue-50";
      case "purple":
        return "border-l-4 border-purple-500 bg-purple-50";
      case "red":
        return "border-l-4 border-red-500 bg-red-50";
      case "orange":
        return "border-l-4 border-orange-500 bg-orange-50";
      case "emerald":
        return "border-l-4 border-emerald-500 bg-emerald-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className="md:p-2 bg-gray-50 min-h-screen font-sans text-slate-800">
      {/* Title */}
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Data Absensi</h1>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex flex-col lg:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
          {/* Date Picker Dummy */}
          <div className="flex items-center border border-gray-300 rounded px-3 py-2 text-sm text-slate-600 bg-white min-w-[200px]">
            <Calendar className="w-4 h-4 mr-2 text-slate-400" />
            <span>{new Date().toISOString().split("T")[0]}</span>
          </div>

          {/* Dropdown Dummy */}
          <select className="border border-gray-300 rounded px-3 py-2 text-sm text-slate-600 bg-white outline-none">
            <option>Semua Jadwal</option>
            <option>Pagi</option>
            <option>Siang</option>
          </select>

          {/* Edit Excel Button */}
          <button className="flex items-center justify-center border border-green-400 rounded px-4 py-2 text-sm font-medium text-slate-700 hover:bg-green-200 transition">
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Edit Excel Absensi
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            placeholder="Cari nama/email/kode staff"
            className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded text-sm outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute right-3 top-2.5" />
        </div>
      </div>

      {/* Info Alert */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex items-start gap-3 mb-6 text-sm text-slate-700">
        <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <p>
          Jika kamu ingin mendownload data absen, silakan buka sub menu laporan
          absensi di menu{" "}
          <a href="#" className="text-blue-600 font-semibold hover:underline">
            Laporan
          </a>
          .
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-4">
        <h2 className="text-sm font-semibold mb-3">
          Status Kehadiran Staff Hari Ini{" "}
          <span className="font-normal text-slate-500">
            {new Date().toISOString}
          </span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded shadow-sm border-l-4 border-transparent"
            >
              <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
              {idx === 0 && (
                <p className="text-[10px] text-slate-400 -mt-1 mb-2">
                  (atau belum ditentukan)
                </p>
              )}
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 ${stat.color} rounded-sm`}></div>
                <span className="text-xl font-bold text-slate-800">
                  {stat.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">No</th>
                <th className="p-4">Nama Staff</th>
                <th className="p-4">Nama Jadwal</th>
                <th className="p-4">Status</th>
                <th className="p-4">Jam Masuk</th>
                <th className="p-4">Jam Pulang</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {attendanceData.map((row, index) => (
                <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 font-medium text-slate-700">
                    {index + 1}
                  </td>
                  <td className="p-4 font-medium text-slate-700">{row.name}</td>

                  <td className="p-4 text-slate-600">
                    <div className="flex items-center gap-2">
                      {row.isScheduleUnset && (
                        <Info className="w-4 h-4 text-blue-500" />
                      )}
                      {row.schedule}
                    </div>
                  </td>

                  <td
                    className={`p-4 font-medium ${
                      row.statusColor || "text-slate-700"
                    }`}
                  >
                    {row.status}
                  </td>

                  <td className="p-4">
                    <div
                      className={`px-3 py-2 rounded text-slate-700 font-mono text-xs font-medium ${getTimeStyle(
                        row.theme
                      )}`}
                    >
                      {row.checkIn}
                    </div>
                  </td>

                  <td className="p-4">
                    <div
                      className={`px-3 py-2 rounded text-slate-700 font-mono text-xs font-medium ${getTimeStyle(
                        row.theme
                      )}`}
                    >
                      {row.checkOut}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="flex gap-2">
                      <button className="px-3 py-1 border border-gray-200 rounded bg-white text-xs font-medium text-slate-600 hover:bg-gray-50 hover:border-gray-300 transition">
                        Detail
                      </button>
                      <button className="px-3 py-1 border border-gray-200 rounded bg-white text-xs font-medium text-slate-600 hover:bg-gray-50 hover:border-gray-300 transition">
                        Jadwal
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer / Pagination */}
        <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row justify-end items-center gap-4 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <span>Rows per page:</span>
            <select className="border border-gray-300 rounded px-2 py-1 outline-none text-xs">
              <option>5</option>
              <option>10</option>
              <option>25</option>
            </select>
          </div>
          <div>1-5 of 13</div>
          <div className="flex gap-1">
            <button className="p-1 hover:bg-gray-100 rounded disabled:opacity-50">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button className="p-1 hover:bg-gray-100 rounded">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
