import api from "./api";

const uploadFile = async (token: string, file: File) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("admin/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data?.url as string;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteFile = async (url: string, token: string) => {
  try {
    console.log(url);
    
    await api.delete(`/admin/upload?fileUrl=${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export { uploadFile, deleteFile };
