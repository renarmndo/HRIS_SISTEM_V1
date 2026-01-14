import React, { useState, useEffect, useCallback } from "react";
import {
  Settings,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  DollarSign,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  getKomponenGaji,
  createKomponenGaji,
  updateKomponenGaji,
  deleteKomponenGaji,
} from "../../services/hrd/gajiService";

// Modal Component
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

const metodeOptions = [
  { value: "nominal", label: "Nominal Tetap" },
  { value: "persentase", label: "Persentase Gaji Pokok" },
  { value: "per_hari", label: "Per Hari (Hadir/Absen)" },
  { value: "per_jam", label: "Per Jam (Lembur)" },
];

export default function KelolaKomponenGaji() {
  const [loading, setLoading] = useState(false);
  const [komponenList, setKomponenList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [filterTipe, setFilterTipe] = useState("");

  const [formData, setFormData] = useState({
    nama: "",
    tipe: "bonus",
    metode: "nominal",
    nilai_default: 0,
    keterangan: "",
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterTipe) params.tipe = filterTipe;
      const response = await getKomponenGaji(params);
      setKomponenList(response.data || []);
    } catch (error) {
      toast.error("Gagal mengambil data komponen gaji");
    } finally {
      setLoading(false);
    }
  }, [filterTipe]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "nilai_default" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEditMode && selectedData) {
        await updateKomponenGaji(selectedData.id, formData);
        toast.success("Berhasil memperbarui komponen gaji");
      } else {
        await createKomponenGaji(formData);
        toast.success("Berhasil menambah komponen gaji");
      }
      closeModal();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal menyimpan komponen gaji");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (data) => {
    setSelectedData(data);
    setFormData({
      nama: data.nama,
      tipe: data.tipe,
      metode: data.metode,
      nilai_default: parseFloat(data.nilai_default) || 0,
      keterangan: data.keterangan || "",
    });
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus komponen ini?")) {
      try {
        await deleteKomponenGaji(id);
        toast.success("Berhasil menghapus komponen gaji");
        fetchData();
      } catch (error) {
        toast.error("Gagal menghapus komponen gaji");
      }
    }
  };

  const openAddModal = () => {
    setFormData({
      nama: "",
      tipe: "bonus",
      metode: "nominal",
      nilai_default: 0,
      keterangan: "",
    });
    setIsEditMode(false);
    setSelectedData(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setIsEditMode(false);
    setSelectedData(null);
  };

  const formatNilai = (komponen) => {
    const nilai = parseFloat(komponen.nilai_default) || 0;
    switch (komponen.metode) {
      case "persentase":
        return `${nilai}%`;
      case "per_hari":
        return `Rp ${nilai.toLocaleString("id-ID")}/hari`;
      case "per_jam":
        return `Rp ${nilai.toLocaleString("id-ID")}/jam`;
      default:
        return `Rp ${nilai.toLocaleString("id-ID")}`;
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-7 h-7 text-purple-600" />
          Kelola Komponen Gaji
        </h1>
        <p className="text-gray-500 mt-1">
          Atur jenis bonus dan potongan gaji karyawan
        </p>
      </div>

      {/* Toolbar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <label className="text-sm font-medium text-gray-600">Filter:</label>
            <select
              value={filterTipe}
              onChange={(e) => setFilterTipe(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Semua</option>
              <option value="bonus">Bonus</option>
              <option value="potongan">Potongan</option>
            </select>
          </div>
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tambah Komponen
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Loading...
          </div>
        ) : komponenList.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            <DollarSign className="w-10 h-10 mx-auto text-gray-300 mb-2" />
            Belum ada komponen gaji
          </div>
        ) : (
          komponenList.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl shadow-sm border-2 p-4 ${
                item.tipe === "bonus" ? "border-green-200" : "border-red-200"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg ${
                      item.tipe === "bonus" ? "bg-green-100" : "bg-red-100"
                    }`}
                  >
                    {item.tipe === "bonus" ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.nama}</h3>
                    <span
                      className={`inline-block px-2 py-0.5 text-xs font-medium rounded-full mt-1 ${
                        item.tipe === "bonus"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.tipe === "bonus" ? "Bonus" : "Potongan"}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Nilai:</span>
                  <span className="font-medium text-gray-900">
                    {formatNilai(item)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Metode:</span>
                  <span className="text-gray-600">
                    {metodeOptions.find((m) => m.value === item.metode)?.label}
                  </span>
                </div>
                {item.keterangan && (
                  <p className="text-xs text-gray-400 mt-2">
                    {item.keterangan}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={isEditMode ? "Edit Komponen" : "Tambah Komponen"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Komponen <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="nama"
              value={formData.nama}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              placeholder="Contoh: BPJS Kesehatan, Uang Makan"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe <span className="text-red-500">*</span>
              </label>
              <select
                name="tipe"
                value={formData.tipe}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="bonus">Bonus (+)</option>
                <option value="potongan">Potongan (-)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Metode <span className="text-red-500">*</span>
              </label>
              <select
                name="metode"
                value={formData.metode}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
                required
              >
                {metodeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nilai Default {formData.metode === "persentase" ? "(%)" : "(Rp)"}
            </label>
            <input
              type="number"
              name="nilai_default"
              value={formData.nilai_default}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Keterangan
            </label>
            <textarea
              name="keterangan"
              value={formData.keterangan}
              onChange={handleChange}
              rows={2}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-purple-500"
              placeholder="Keterangan tambahan..."
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={closeModal}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
