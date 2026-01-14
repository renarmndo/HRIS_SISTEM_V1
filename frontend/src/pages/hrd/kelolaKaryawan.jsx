import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  Mail,
  Lock,
  Briefcase,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import useAuth from "../../hooks/auth/useAuth.hook";
import useKelolaKaryawan from "../../hooks/hrd/useKelolaKaryawan";

const MasterUserHRD = () => {
  const { loading, error, handleRegister } = useAuth();
  const {
    loadingKaryawan,
    errorKaryawan,
    getKaryawanData,
    karyawanData,
    editKaryawanData,
    deleteKarywanData,
  } = useKelolaKaryawan();

  // --- State Management ---
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalDeleteOpen, setIsModalDeleteOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // State Form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
    status: "aktif",
  });

  // --- Handlers ---
  const handleAddNew = () => {
    setIsEditing(false);
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "",
      status: "aktif",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setSelectedUser(user.id);
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    try {
      await deleteKarywanData(selectedUser);
      getKaryawanData();
      handleCloseDeleteModal();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (isEditing) {
      await editKaryawanData(selectedUser, formData);
    } else {
      await handleRegister(formData);
    }
    await getKaryawanData();
    setIsModalOpen(false);
    setIsEditing(false);
    setSelectedUser(null);
  };

  // Filter Search
  const filteredUsers = karyawanData.filter(
    (user) =>
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    getKaryawanData();
  }, []);

  const handleDeleteOpenModal = (id) => {
    setSelectedUser(id);
    setIsModalDeleteOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setSelectedUser(null);
    setIsModalDeleteOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 md:p-2 font-sans text-slate-800">
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Manajemen Akun Users
          </h1>
          <p className="text-sm text-gray-500">
            Buat dan kelola akun login (HRD & Karyawan)
          </p>
        </div>

        <button
          onClick={handleAddNew}
          className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Buat Akun Baru
        </button>
      </div>

      {/* --- Controls --- */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 mb-6 flex items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Cari username, email, atau role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-cyan-500 text-sm"
          />
        </div>
      </div>

      {/* --- Tabel Data Akun --- */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <th className="p-4">No</th>
                <th className="p-4">Akun (Login Info)</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status Akun</th>
                <th className="p-4">Tanggal Dibuat</th>
                <th className="p-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-gray-100">
              {loadingKaryawan ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading...
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">{index + 1}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-700 font-bold">
                          {user.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 flex items-center gap-2">
                            {user.username}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === "hrd"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        <Briefcase className="w-3 h-3" />
                        {user.role === "hrd" ? "HRD" : "Karyawan"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "aktif"
                            ? "bg-green-100 text-green-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {user.status === "aktif" ? (
                          <CheckCircle className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {user.status === "aktif" ? "Aktif" : "Nonaktif"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Akun"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteOpenModal(user.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Hapus Akun"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-gray-400">
                    Tidak ada data akun ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- MODAL FORM --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-slate-800">
                  {isEditing ? "Edit Akun" : "Registrasi Akun Baru"}
                </h3>
                <p className="text-xs text-gray-500">
                  {isEditing
                    ? "Perbarui data akun"
                    : "Karyawan akan melengkapi profil setelah login"}
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Username <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="text"
                      required
                      placeholder="john.doe"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="email"
                      required
                      placeholder="mail@company.com"
                      className="w-full border border-gray-300 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Password {isEditing ? "(Isi jika ingin reset)" : "*"}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required={!isEditing}
                    placeholder={
                      isEditing
                        ? "Biarkan kosong jika tidak diubah"
                        : "Masukkan password"
                    }
                    className="w-full border border-gray-300 rounded-lg pl-9 pr-10 py-2 text-sm focus:outline-none focus:border-cyan-500"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-cyan-500"
                  value={formData.role}
                  required
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="">Pilih Role</option>
                  <option value="hrd">HRD</option>
                  <option value="karyawan">Karyawan</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600">
                  Status Akun
                </label>
                <div className="flex gap-4 mt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="aktif"
                      checked={formData.status === "aktif"}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-slate-700">Aktif</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="tidak_aktif"
                      checked={formData.status === "tidak_aktif"}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                      className="text-cyan-500 focus:ring-cyan-500"
                    />
                    <span className="text-slate-700">Nonaktif</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 text-white rounded-lg text-sm font-medium hover:bg-cyan-700 shadow-sm"
                >
                  {isEditing ? "Simpan Perubahan" : "Buat Akun"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {isModalDeleteOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-semibold mb-2 text-gray-800">
              Konfirmasi Hapus
            </h3>
            <p className="mb-6 text-gray-600 text-sm">
              Apakah Anda yakin ingin menghapus akun ini? Tindakan ini tidak
              dapat dibatalkan.
            </p>

            <div className="flex justify-end gap-3 font-medium">
              <button
                onClick={handleCloseDeleteModal}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition-colors shadow-sm"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterUserHRD;
