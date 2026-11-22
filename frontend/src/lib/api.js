const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("smartplacement_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const parseResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      try {
        localStorage.removeItem("smartplacement_token");
        localStorage.removeItem("smartplacement_user");
      } catch {
        // ignore storage errors in restricted contexts
      }
    }
    const message = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
};

export const api = {
  async get(path) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    return parseResponse(response);
  },

  async post(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  async put(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  async patch(path, body) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  async delete(path) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
    });
    return parseResponse(response);
  },

  async postForm(path, formData) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    return parseResponse(response);
  },

  async putForm(path, formData) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(),
      },
      body: formData,
    });
    return parseResponse(response);
  },
};

export default API_BASE_URL;
