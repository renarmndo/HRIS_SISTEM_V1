import React from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  FileText,
  Calendar as CalendarIcon,
  CheckCircle,
  XCircle,
  Clock,
  MoreHorizontal,
  Bell,
} from "lucide-react";

const DashboardHRD = () => {
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
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </div>

      {/* --- Top Statistics Cards --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Karyawan"
          value="300"
          subtext="Update Realtime"
          icon={Users}
          color="bg-blue-500"
        />
        <StatCard
          title="Pengajuan Cuti"
          value="12"
          subtext="Perlu Persetujuan"
          icon={CalendarIcon}
          color="bg-amber-500"
        />
        <StatCard
          title="Pengajuan Izin"
          value="5"
          subtext="Perlu Persetujuan"
          icon={FileText}
          color="bg-violet-500"
        />
        <StatCard
          title="Hadir Hari Ini"
          value="285"
          subtext="95% Kehadiran"
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
              <button className="text-sm font-medium text-cyan-600 hover:text-cyan-700 hover:bg-cyan-50 px-3 py-1.5 rounded-lg transition-colors">
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
                  <RequestRow
                    name="Kathy Pacheco"
                    role="Full Stack Developer"
                    img="https://i.pravatar.cc/150?u=1"
                    type="Izin Sakit"
                    date="2 Jul 2025"
                    note="Demam tinggi"
                    status="Menunggu"
                  />
                  <RequestRow
                    name="Samanta Pacheco"
                    role="Copywriter"
                    img="https://i.pravatar.cc/150?u=2"
                    type="Cuti Tahunan"
                    date="10 - 15 Jul 2025"
                    note="Liburan keluarga"
                    status="Baru"
                  />
                  <RequestRow
                    name="Budi Santoso"
                    role="UI/UX Designer"
                    img="https://i.pravatar.cc/150?u=3"
                    type="Cuti Melahirkan"
                    date="Agustus - Oktober"
                    note="Istri melahirkan"
                    status="Disetujui"
                  />
                  <RequestRow
                    name="Rina Wijaya"
                    role="Project Manager"
                    img="https://i.pravatar.cc/150?u=4"
                    type="Izin"
                    date="5 Jul 2025"
                    note="Urusan administrasi"
                    status="Ditolak"
                  />
                  <RequestRow
                    name="Alex Thompson"
                    role="DevOps Engineer"
                    img="https://i.pravatar.cc/150?u=5"
                    type="Cuti Tahunan"
                    date="20 - 25 Jul 2025"
                    note="Pulang kampung"
                    status="Baru"
                  />
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

const RequestRow = ({ name, role, img, type, date, note, status }) => {
  let statusBadge;
  let actionButtons = false;

  switch (status) {
    case "Disetujui":
      statusBadge = (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-600">
          Disetujui
        </span>
      );
      break;
    case "Ditolak":
      statusBadge = (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-600">
          Ditolak
        </span>
      );
      break;
    default: // Baru / Menunggu
      statusBadge = (
        <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-600">
          Menunggu
        </span>
      );
      actionButtons = true;
  }

  return (
    <tr className="hover:bg-slate-50/80 transition-colors group">
      <td className="py-4 pl-4">
        <div className="flex items-center gap-3">
          <img
            src={img}
            alt={name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-white shadow-sm"
          />
          <div>
            <p className="font-bold text-slate-800 text-sm">{name}</p>
            <p className="text-xs text-slate-500">{role}</p>
          </div>
        </div>
      </td>
      <td className="py-4 text-sm font-medium text-slate-700">{type}</td>
      <td className="py-4 text-sm text-slate-500">{date}</td>
      <td
        className="py-4 text-sm text-slate-500 max-w-[150px] truncate"
        title={note}
      >
        {note}
      </td>
      <td className="py-4">{statusBadge}</td>
      <td className="py-4 pr-4 text-center">
        {actionButtons ? (
          <div className="flex justify-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            <button
              className="p-1.5 bg-emerald-100 text-emerald-600 rounded-lg hover:bg-emerald-200"
              title="Setujui"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              title="Tolak"
            >
              <XCircle className="w-4 h-4" />
            </button>
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

const ScheduleItem = ({ time, title, type, color }) => (
  <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-50 bg-slate-50 hover:bg-white hover:shadow-sm hover:border-slate-100 transition-all">
    <div className="flex-1">
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold text-slate-400 mb-1 block">
          {time}
        </span>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${color}`}
        >
          {type}
        </span>
      </div>
      <h4 className="text-sm font-bold text-slate-700">{title}</h4>
    </div>
  </div>
);

export default DashboardHRD;
