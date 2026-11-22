const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const isPublicEndpoint = (path, method = "GET") => {
  const cleanPath = path.split("?")[0].replace(/\/+$/, "");
  // Public auth endpoints
  if (
    cleanPath === "/auth/login" ||
    cleanPath === "/auth/register" ||
    cleanPath === "/auth/google"
  ) {
    return true;
  }
  // Public job listings (GET only; /jobs/my and /jobs/my/listings are protected)
  if (method === "GET") {
    if (cleanPath === "/jobs" || /^\/jobs\/[a-f0-9]{24}$/i.test(cleanPath)) {
      return true;
    }
  }
  return false;
};

const getAuthHeaders = (path = "", method = "GET", options = {}) => {
  if (options.isPublic || isPublicEndpoint(path, method)) {
    return {};
  }
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
  async get(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(path, "GET", options),
        ...options.headers,
      },
    });
    return parseResponse(response);
  },

  async post(path, body, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(path, "POST", options),
        ...options.headers,
      },
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  async put(path, body, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(path, "PUT", options),
        ...options.headers,
      },
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  async patch(path, body, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(path, "PATCH", options),
        ...options.headers,
      },
      body: JSON.stringify(body),
    });
    return parseResponse(response);
  },

  async delete(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(path, "DELETE", options),
        ...options.headers,
      },
    });
    return parseResponse(response);
  },

  async postForm(path, formData, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        ...getAuthHeaders(path, "POST", options),
        ...options.headers,
      },
      body: formData,
    });
    return parseResponse(response);
  },

  async putForm(path, formData, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: "PUT",
      headers: {
        ...getAuthHeaders(path, "PUT", options),
        ...options.headers,
      },
      body: formData,
    });
    return parseResponse(response);
  },
};

export default API_BASE_URL;
