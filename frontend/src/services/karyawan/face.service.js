import api from "../../api/api";

export const registFace = async (data) => {
  const response = await api.post("/karyawan/face", data);
  return response.data;
};

export const updateFace = async (data) => {
  const response = await api.put("/karyawan/face", data);
  return response.data;
};

export const getFace = async () => {
  const response = await api.get("/karyawan/face");
  return response.data;
};
