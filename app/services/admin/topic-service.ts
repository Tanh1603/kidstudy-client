/* eslint-disable import/order */
import api from "../api";
import TopicDTO from "@/app/models/TopicDTO";

const getTopicsForAdmin = async (token: string) => {
  try {
    const response = await api.get("/admin/topics", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as TopicDTO[];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const getTopicsForUser = async (token: string) => {
  try {
    const response = await api.get("/user/topics", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as TopicDTO[];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const createTopic = async (token: string, topic: FormData) => {
  try {
    const response = await api.post("/admin/topics", topic, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data as TopicDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateTitle = async (token: string, id: number, title: string) => {
  try {
    const response = await api.patch(
      `/admin/topics/${id}/title`,
      { title: title },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data as TopicDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const updateIcon = async (token: string, id: number, icon: File) => {
  try {
    const formData = new FormData();
    formData.append("icon", icon);

    const response = await api.patch(`/admin/topics/${id}/icon`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data as TopicDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const deleteTopic = async (token: string, id: number) => {
  try {
    const response = await api.delete(`/admin/topics/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data as TopicDTO;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export {
  getTopicsForAdmin,
  getTopicsForUser,
  createTopic,
  updateTitle,
  updateIcon,
  deleteTopic,
};
