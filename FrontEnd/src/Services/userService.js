const API_URL = "/api";

const getToken = () => {
  return localStorage.getItem("token");
};

const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const getErrorMessage = (data, defaultMessage) => {
  if (data?.errors && Array.isArray(data.errors)) {
    return data.errors.join(", ");
  }

  if (data?.errors && typeof data.errors === "object") {
    const vals = Object.values(data.errors).flat().filter(Boolean);
    if (vals.length > 0) return vals.join(", ");
  }

  if (data?.message) {
    return data.message;
  }

  if (data?.Message) {
    return data.Message;
  }

  if (typeof data === "string" && data.trim()) {
    return data;
  }

  return defaultMessage;
};

// Safe response parser that prevents "Unexpected end of JSON input" and catches business errors
const parseResponse = async (response, defaultErrorMsg = "Request failed") => {
  let data = null;
  const contentType = response.headers.get("content-type");
  const text = await response.text();

  if (text && text.trim()) {
    if (contentType && contentType.includes("application/json")) {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    } else {
      try {
        data = JSON.parse(text);
      } catch {
        data = text;
      }
    }
  }

  if (response.status === 401) {
    throw new Error("Unauthorized. Please login again.");
  }

  if (response.status === 403) {
    throw new Error("You do not have permission to perform this action.");
  }

  if (response.status === 404) {
    throw new Error(getErrorMessage(data, "Requested resource not found."));
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(data, defaultErrorMsg));
  }

  // Check for business-logic failure payloads in HTTP 200 responses
  if (data && typeof data === "object") {
    if (
      data.Status === false ||
      data.status === false ||
      data.Success === false ||
      data.success === false ||
      data.isSuccess === false ||
      data.IsSuccess === false
    ) {
      throw new Error(getErrorMessage(data, defaultErrorMsg));
    }

    if (Array.isArray(data.Errors) && data.Errors.length > 0 && !data.Data && !data.data) {
      throw new Error(data.Errors.join(", "));
    }

    if (Array.isArray(data.errors) && data.errors.length > 0 && !data.Data && !data.data) {
      throw new Error(data.errors.join(", "));
    }
  }

  return data;
};

// =====================================================
// GET ALL USERS
// GET /api/User/All
// =====================================================

export const getAllUsers = async () => {
  const response = await fetch(`${API_URL}/User/All`, {
    method: "GET",
    headers: getHeaders(),
  });

  return await parseResponse(response, "Failed to get users");
};

// =====================================================
// GET USER BY ID
// GET /api/User/id/{Id}
// =====================================================

export const getUserById = async (id) => {
  if (!id) throw new Error("User ID is required");

  const response = await fetch(
    `${API_URL}/User/id/${encodeURIComponent(id)}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return await parseResponse(response, "User not found");
};

// =====================================================
// GET USER BY NAME
// GET /api/User/Name/{Name}
// =====================================================

export const getUserByName = async (name) => {
  if (!name) throw new Error("Username is required");

  const response = await fetch(
    `${API_URL}/User/Name/${encodeURIComponent(name)}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return await parseResponse(response, "User not found");
};

// =====================================================
// GET ROLE DROPDOWN
// GET /api/Role/dropdown
// =====================================================

export const getRoleDropdown = async () => {
  const response = await fetch(`${API_URL}/Role/dropdown`, {
    method: "GET",
    headers: getHeaders(),
  });

  return await parseResponse(response, "Failed to get roles");
};

// =====================================================
// GET USER TYPE DROPDOWN
// GET /api/UserType/dropdown
// =====================================================

export const getUserTypeDropdown = async () => {
  const response = await fetch(`${API_URL}/UserType/Dropdown`, {
    method: "GET",
    headers: getHeaders(),
  });

  return await parseResponse(response, "Failed to get user types");
};

// =====================================================
// GET USER DROPDOWN
// GET /api/User/dropdown
// =====================================================

export const getUserDropdown = async () => {
  const response = await fetch(`${API_URL}/User/dropdown`, {
    method: "GET",
    headers: getHeaders(),
  });

  return await parseResponse(response, "Failed to get user dropdown");
};

// =====================================================
// GET USER DROPDOWN BY ROLE
// GET /api/User/dropdown/role/{roleId}
// =====================================================

export const getUserDropdownByRole = async (roleId) => {
  const response = await fetch(
    `${API_URL}/User/dropdown/role/${encodeURIComponent(roleId)}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return await parseResponse(response, "Failed to get users by role");
};

// =====================================================
// CREATE USER
// POST /api/User/CreateUser
// =====================================================

export const createUser = async (userData) => {
  const endpoints = [
    `${API_URL}/User/CreateUser`,
    `${API_URL}/User/Create`,
    `${API_URL}/User`,
  ];

  let lastError = null;
  for (const ep of endpoints) {
    try {
      const response = await fetch(ep, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(userData),
      });

      if (response.status === 404 || response.status === 405) {
        continue;
      }

      return await parseResponse(response, "Failed to create user");
    } catch (err) {
      lastError = err;
      if (
        err.message &&
        !err.message.includes("404") &&
        !err.message.includes("405") &&
        !err.message.includes("Failed to fetch")
      ) {
        throw err;
      }
    }
  }

  if (lastError) {
    throw lastError;
  }

  throw new Error("Failed to create user. Service endpoint not found.");
};

// =====================================================
// UPDATE USER
// PUT /api/User/UpdateUser
// =====================================================

export const updateUser = async (userData) => {
  const response = await fetch(`${API_URL}/User/UpdateUser`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(userData),
  });

  return await parseResponse(response, "Failed to update user");
};

// =====================================================
// DELETE USER
// DELETE /api/User/{Id}
// =====================================================

export const deleteUser = async (id) => {
  const response = await fetch(
    `${API_URL}/User/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return await parseResponse(response, "Failed to delete user");
};

// =====================================================
// GET USER DROPDOWN BY USER TYPE
// GET /api/User/GetUserDropdownByUserType/{userTypeId}
// =====================================================

export const getUserDropdownByUserType = async (userTypeId) => {
  const response = await fetch(
    `${API_URL}/User/GetUserDropdownByUserType/${encodeURIComponent(userTypeId)}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await parseResponse(response, "Failed to load users.");
  return {
    data: Array.isArray(data) ? data : data?.data || [],
  };
};