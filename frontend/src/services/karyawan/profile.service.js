import api from "../../api/api";

export const createProfile = async (data) => {
  const response = await api.post("/karyawan/profile", data);
  return response.data;
};

// update
export const updateProfile = async (data) => {
  const response = await api.put("/karyawan/profile", data);
  return response.data;
};

// get
export const getProfile = async () => {
  const response = await api.get("/karyawan/profile");
  return response.data;
};
