import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Users,
  Edit,
  DollarSign,
  Briefcase,
  Building,
  CheckCircle,
  XCircle,
  X,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getKaryawan, updateGajiPokok } from "../../services/hrd/addKaryawan";

export default function DataKaryawan() {
  const [loading, setLoading] = useState(false);
  const [karyawanData, setKaryawanData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Modal state
  const [isGajiModalOpen, setIsGajiModalOpen] = useState(false);
  const [gajiFormData, setGajiFormData] = useState({
    userId: null,
    namaKaryawan: "",
    gaji_pokok: 0,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getKaryawan();
      setKaryawanData(response.data || []);
    } catch (error) {
      toast.error("Gagal mengambil data karyawan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filter search
  const filteredData = karyawanData.filter(
    (k) =>
      k.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.departement?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.jabatan?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handler untuk edit gaji
  const handleEditGaji = (user) => {
    setGajiFormData({
      userId: user.id,
      namaKaryawan: user.nama_lengkap || user.username,
      gaji_pokok: parseFloat(user.gaji_pokok) || 0,
    });
    setIsGajiModalOpen(true);
  };

  const handleSaveGaji = async () => {
    try {
      await updateGajiPokok(gajiFormData.userId, gajiFormData.gaji_pokok);
      toast.success("Berhasil memperbarui gaji pokok");
      setIsGajiModalOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal memperbarui gaji pokok");
    }
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value || 0);
  };

  return (
    <div className="min-h-screen bg-gray-50 md:p-2 font-sans text-slate-800">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-7 h-7 text-cyan-600" />
            Data Karyawan
          </h1>
          <p className="text-sm text-gray-500">
            Kelola data karyawan dan gaji pokok
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari nama, jabatan, atau departemen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <th className="p-4">No</th>
                <th className="p-4">Karyawan</th>
                <th className="p-4">Departemen</th>
                <th className="p-4">Jabatan</th>
                <th className="p-4">Gaji Pokok</th>
                <th className="p-4">Status Profil</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-8 text-center text-gray-400">
                    Tidak ada data karyawan ditemukan.
                  </td>
                </tr>
              ) : (
                filteredData.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
                          {(user.nama_lengkap || user.username)
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {user.nama_lengkap || user.username}
                          </p>
                          <p className="text-xs text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Building className="w-4 h-4 text-gray-400" />
                        {user.departement}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Briefcase className="w-4 h-4 text-gray-400" />
                        {user.jabatan}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-green-600">
                          {formatCurrency(user.gaji_pokok)}
                        </span>
                        <button
                          onClick={() => handleEditGaji(user)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Gaji"
                          disabled={!user.profil_lengkap}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="p-4">
                      {user.profil_lengkap ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          <CheckCircle className="w-3 h-3" />
                          Lengkap
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                          <AlertCircle className="w-3 h-3" />
                          Belum Lengkap
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditGaji(user)}
                          disabled={!user.profil_lengkap}
                          className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1 transition-colors ${
                            user.profil_lengkap
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
                          title={
                            user.profil_lengkap
                              ? "Set Gaji"
                              : "Karyawan belum lengkapi profil"
                          }
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          Set Gaji
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

      {/* Modal Edit Gaji */}
      {isGajiModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Edit Gaji Pokok
              </h3>
              <button
                onClick={() => setIsGajiModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mb-4 text-gray-600 text-sm font-medium">
              {gajiFormData.namaKaryawan}
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gaji Pokok (Rp)
              </label>
              <input
                type="number"
                value={gajiFormData.gaji_pokok}
                onChange={(e) =>
                  setGajiFormData({
                    ...gajiFormData,
                    gaji_pokok: parseFloat(e.target.value) || 0,
                  })
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-green-500"
                placeholder="0"
                min="0"
              />
              <p className="text-xs text-gray-400 mt-1">
                Preview: {formatCurrency(gajiFormData.gaji_pokok)}
              </p>
            </div>

            <div className="flex justify-end gap-3 font-medium">
              <button
                onClick={() => setIsGajiModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSaveGaji}
                className="px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors shadow-sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
