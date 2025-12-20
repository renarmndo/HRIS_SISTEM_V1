import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Building2,
  MapPin,
  Navigation,
  Target,
  Edit2,
  Trash2,
  Save,
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  CheckCircle,
} from "lucide-react";
import useLokasiKantor from "../../hooks/hrd/useLokasi.hook";

// --- Leaflet Imports & Fix Icon ---
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- HELPER COMPONENTS (Didefinisikan di Luar Component Utama) ---

// 1. MapUpdater: Update Peta saat Input Berubah
const MapUpdater = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] !== 0) {
      map.flyTo(center, map.getZoom());
    }
  }, [center, map]);
  return null;
};

// 2. DraggableMarker: Marker yang bisa digeser
const DraggableMarker = ({ position, setFormData, isEditing }) => {
  const markerRef = useRef(null);
  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const { lat, lng } = marker.getLatLng();
          // Update formData langsung saat marker digeser
          setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
        }
      },
    }),
    [setFormData]
  );

  return (
    <Marker
      draggable={isEditing}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
};

// 3. InputGroup: Komponen Input Form (DIPINDAHKAN KE LUAR AGAR TIDAK RE-RENDER)
const InputGroup = ({
  label,
  icon: Icon,
  name,
  type = "text",
  value,
  placeholder,
  half = false,
  isEditing,
  onChange,
}) => (
  <div className={`${half ? "col-span-1" : "col-span-2"}`}>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" /> {label}
    </label>
    {isEditing ? (
      <div className="relative">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          step={type === "number" ? "any" : undefined}
          className="w-full text-sm font-medium text-gray-900 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all bg-white"
          placeholder={placeholder}
        />
        {name === "radius_absen_meter" && (
          <span className="absolute right-3 top-2 text-xs text-gray-400 font-medium">
            Meter
          </span>
        )}
      </div>
    ) : (
      <div className="text-sm font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-md px-3 py-2 truncate font-mono">
        {value || "-"} {name === "radius_absen_meter" ? "Meter" : ""}
      </div>
    )}
  </div>
);

// --- COMPONENT UTAMA ---
const LokasiKantorPage = () => {
  const [isEditing, setIsEditing] = useState(false);

  // --- 1. STATE FORM DATA ---
  const [formData, setFormData] = useState({
    nama_perusahaan: "",
    latitude: 0,
    longitude: 0,
    radius_absen_meter: 0,
    jam_masuk: "",
    jam_keluar: "",
  });

  const {
    loadingKantor,
    lokasiKantor, // Data asli dari server
    useGetLokasi,
    useUpdateLokasi,
    useCreateLokasi,
  } = useLokasiKantor();

  // --- 2. SINKRONISASI DATA SERVER KE FORM DATA ---
  useEffect(() => {
    useGetLokasi();
  }, []);

  useEffect(() => {
    if (lokasiKantor) {
      setFormData({
        nama_perusahaan: lokasiKantor.nama_perusahaan || "",
        latitude: parseFloat(lokasiKantor.latitude) || 0,
        longitude: parseFloat(lokasiKantor.longitude) || 0,
        radius_absen_meter: parseInt(lokasiKantor.radius_absen_meter) || 0,
        jam_masuk: lokasiKantor.jam_masuk || "",
        jam_keluar: lokasiKantor.jam_keluar || "",
      });
    }
  }, [lokasiKantor]);

  // --- 3. HANDLERS ---

  const handleChange = (e) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Konversi tipe data agar sesuai backend
    if (name === "latitude" || name === "longitude") {
      finalValue = value === "" ? "" : value;
    } else if (name === "radius_absen_meter") {
      finalValue = value === "" ? "" : parseInt(value);
    }

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleCreate = async () => {
    await useCreateLokasi(formData);
  };

  const handleSave = async () => {
    const payload = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
    };

    await useUpdateLokasi(lokasiKantor.id, payload);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form kembali ke data asli
    if (lokasiKantor) {
      setFormData({
        nama_perusahaan: lokasiKantor.nama_perusahaan,
        latitude: parseFloat(lokasiKantor.latitude),
        longitude: parseFloat(lokasiKantor.longitude),
        radius_absen_meter: lokasiKantor.radius_absen_meter,
        jam_masuk: lokasiKantor.jam_masuk,
        jam_keluar: lokasiKantor.jam_keluar,
      });
    }
    setIsEditing(false);
  };

  const handleDelete = () => {
    // Implementasi delete sesuai kebutuhan hook Anda
    if (window.confirm("Hapus data lokasi?")) {
      // panggil fungsi delete dari hook
    }
  };

  // --- 4. MAP COORDINATES ---
  const activeLat = isEditing
    ? parseFloat(formData.latitude)
    : parseFloat(lokasiKantor?.latitude || 0);
  const activeLng = isEditing
    ? parseFloat(formData.longitude)
    : parseFloat(lokasiKantor?.longitude || 0);
  const activeRadius = isEditing
    ? parseFloat(formData.radius_absen_meter)
    : parseFloat(lokasiKantor?.radius_absen_meter || 0);

  const mapCenter =
    isNaN(activeLat) || isNaN(activeLng) || activeLat === 0
      ? [-6.2088, 106.8456] // Default Jakarta
      : [activeLat, activeLng];

  if (loadingKantor && !lokasiKantor)
    return <div className="p-10 text-center">Loading Data...</div>;

  // --- RENDER ---
  return (
    <div className="p-2 md:p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        {/* KOLOM KIRI: FORM */}
        <div className="md:w-5/12 p-6 md:p-8 flex flex-col border-r border-gray-100 relative z-10 bg-white">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Master Data Kantor
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Titik koordinat pusat & radius absensi.
              </p>
            </div>
            <div className="px-3 py-1 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Aktif
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-6">
            <InputGroup
              label="Nama Kantor"
              icon={Building2}
              name="nama_perusahaan"
              value={
                isEditing
                  ? formData.nama_perusahaan
                  : lokasiKantor?.nama_perusahaan
              }
              isEditing={isEditing}
              onChange={handleChange}
            />

            <div className="col-span-2 border-t border-gray-100 my-1"></div>

            <InputGroup
              label="Latitude"
              icon={MapPin}
              name="latitude"
              type="number"
              value={isEditing ? formData.latitude : lokasiKantor?.latitude}
              isEditing={isEditing}
              onChange={handleChange}
              half
            />
            <InputGroup
              label="Longitude"
              icon={Navigation}
              name="longitude"
              type="number"
              value={isEditing ? formData.longitude : lokasiKantor?.longitude}
              isEditing={isEditing}
              onChange={handleChange}
              half
            />

            <InputGroup
              label="Radius Toleransi"
              icon={Target}
              name="radius_absen_meter"
              type="number"
              value={
                isEditing
                  ? formData.radius_absen_meter
                  : lokasiKantor?.radius_absen_meter
              }
              isEditing={isEditing}
              onChange={handleChange}
            />

            <InputGroup
              label="Jam Masuk"
              icon={Clock}
              name="jam_masuk"
              type="time"
              value={isEditing ? formData.jam_masuk : lokasiKantor?.jam_masuk}
              isEditing={isEditing}
              onChange={handleChange}
            />
            <InputGroup
              label="Jam Pulang"
              icon={CheckCircle}
              name="jam_keluar"
              type="time"
              value={isEditing ? formData.jam_keluar : lokasiKantor?.jam_keluar}
              isEditing={isEditing}
              onChange={handleChange}
            />
          </div>

          {/* Buttons */}
          <div className="mt-auto pt-8 flex items-center justify-between border-t border-gray-100">
            {isEditing ? (
              <div className="flex gap-3 w-full">
                <button
                  onClick={handleCancel}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm flex justify-center items-center gap-2"
                >
                  <Save className="w-4 h-4" /> Simpan
                </button>
              </div>
            ) : (
              <div className="w-full flex justify-between gap-3">
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-md text-sm font-medium flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" /> Hapus
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-6 py-2 bg-white border border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-600 rounded-md text-sm font-medium shadow-sm flex items-center gap-2 ml-auto"
                >
                  <Edit2 className="w-4 h-4" /> Edit
                </button>
              </div>
            )}
          </div>
        </div>

        {/* KOLOM KANAN: MAPS */}
        <div className="md:w-7/12 bg-slate-100 relative h-[500px] md:h-auto">
          <MapContainer
            center={mapCenter}
            zoom={16}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapUpdater center={mapCenter} />
            <Circle
              center={mapCenter}
              pathOptions={{
                fillColor: "#6366f1",
                color: "#4f46e5",
                weight: 1,
                fillOpacity: 0.2,
              }}
              radius={activeRadius || 0}
            />
            <DraggableMarker
              position={mapCenter}
              setFormData={setFormData}
              isEditing={isEditing}
            />
          </MapContainer>

          <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-sm border border-gray-200 p-3 rounded-lg shadow-lg z-[1000] flex justify-between items-center text-xs">
            <div className="flex items-center gap-2 text-gray-600">
              <AlertCircle className="w-4 h-4 text-indigo-500" />
              <span>
                Area lingkaran = Batas radius absen ({activeRadius}m).
              </span>
            </div>
            <div className="font-mono font-bold text-gray-800 bg-gray-100 px-2 py-1 rounded">
              {activeLat.toFixed(6)}, {activeLng.toFixed(6)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LokasiKantorPage;
