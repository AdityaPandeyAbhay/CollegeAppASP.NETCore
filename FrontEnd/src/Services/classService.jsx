// =====================================================
// CLASS SERVICE
// =====================================================

import { getToken } from "../Utils/auth";

// =====================================================
// BASE API URL
// =====================================================

const API_URL = "/api/";

import { getDepartmentDropdown, getAllDepartment } from "./departmentService";

// =====================================================
// COMMON HEADERS
// =====================================================

const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

// =====================================================
// TOKEN CHECK
// =====================================================

const checkToken = () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  return token;
};

// =====================================================
// COMMON RESPONSE HANDLER
// =====================================================

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);

  // ===================================================
  // 401
  // ===================================================

  if (response.status === 401) {
    throw new Error("Unauthorized (401). Please login again.");
  }

  // ===================================================
  // 403
  // ===================================================

  if (response.status === 403) {
    throw new Error("Access denied (403). You do not have permission.");
  }

  // ===================================================
  // 404
  // ===================================================

  if (response.status === 404) {
    let message =
      data?.Message ||
      data?.message ||
      data?.Title ||
      data?.title ||
      "Class record not found.";

    if (Array.isArray(data?.Errors) && data.Errors.length > 0) {
      message = data.Errors.join(", ");
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join(", ");
    }

    throw new Error(message);
  }

  // ===================================================
  // OTHER HTTP ERRORS
  // ===================================================

  if (!response.ok) {
    let message =
      data?.Message ||
      data?.message ||
      data?.Title ||
      data?.title ||
      data?.Error ||
      data?.error ||
      null;

    if (!message && Array.isArray(data?.Errors) && data.Errors.length > 0) {
      message = data.Errors.join(", ");
    }

    if (!message && Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join(", ");
    }

    // =================================================
    // ASP.NET VALIDATION ERRORS
    // =================================================

    if (
      !message &&
      data?.errors &&
      typeof data.errors === "object" &&
      !Array.isArray(data.errors)
    ) {
      const validationMessages = [];

      Object.values(data.errors).forEach((value) => {
        if (Array.isArray(value)) {
          validationMessages.push(...value);
        } else if (value) {
          validationMessages.push(String(value));
        }
      });

      if (validationMessages.length > 0) {
        message = validationMessages.join(", ");
      }
    }

    if (!message) {
      message = `Request failed with status ${response.status}`;
    }

    throw new Error(message);
  }

  // ===================================================
  // API RESPONSE STATUS FALSE
  // ===================================================

  if (data && (data.status === false || data.Status === false)) {
    let message = data?.Message || data?.message || "Class request failed.";

    if (Array.isArray(data?.Errors) && data.Errors.length > 0) {
      message = data.Errors.join(", ");
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join(", ");
    }

    throw new Error(message);
  }

  // ===================================================
  // RETURN APIResponse.Data
  // ===================================================

  if (data && Object.prototype.hasOwnProperty.call(data, "Data")) {
    return data.Data;
  }

  // ===================================================
  // RETURN APIResponse.data
  // ===================================================

  if (data && Object.prototype.hasOwnProperty.call(data, "data")) {
    return data.data;
  }

  return data;
};

// =====================================================
// NORMALIZE CLASS
// =====================================================

const normalizeClass = (item) => {
  if (!item || typeof item !== "object") {
    return item;
  }

  return {
    Id: item.Id ?? item.id ?? null,

    DepartmentId:
      item.DepartmentId ??
      item.departmentId ??
      item.Department?.Id ??
      item.department?.id ??
      null,

    DepartmentName:
      item.DepartmentName ??
      item.departmentName ??
      item.Department?.DepartmentName ??
      item.department?.departmentName ??
      item.Department?.Name ??
      item.department?.name ??
      "",

    ClassCode: item.ClassCode ?? item.classCode ?? "",

    ClassName: item.ClassName ?? item.className ?? "",

    Description: item.Description ?? item.description ?? "",

    DisplayOrder: item.DisplayOrder ?? item.displayOrder ?? 0,

    IsActive: item.IsActive ?? item.isActive ?? true,

    CreatedBy: item.CreatedBy ?? item.createdBy ?? null,

    CreatedDate: item.CreatedDate ?? item.createdDate ?? null,

    UpdatedBy: item.UpdatedBy ?? item.updatedBy ?? null,

    UpdatedDate: item.UpdatedDate ?? item.updatedDate ?? null,
  };
};

// =====================================================
// NORMALIZE CLASS LIST
// =====================================================

const normalizeClassList = (data) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeClass);
};

// =====================================================
// ENRICH CLASS LIST WITH DEPARTMENT NAME
// =====================================================

export const addDepartmentNames = async (classes) => {
  if (!Array.isArray(classes) || classes.length === 0) {
    return [];
  }

  try {
    let departments = [];
    try {
      departments = await getDepartmentDropdown();
    } catch (e) {
      console.warn("getDepartmentDropdown failed in addDepartmentNames:", e);
    }

    if (!Array.isArray(departments) || departments.length === 0) {
      try {
        const allDept = await getAllDepartment();
        departments = Array.isArray(allDept) ? allDept : allDept?.data || [];
      } catch (e) {
        console.warn("getAllDepartment fallback failed in addDepartmentNames:", e);
      }
    }

    const departmentMap = new Map();

    (departments || []).forEach((department) => {
      const id = department.id ?? department.Id ?? department.code ?? department.Code;

      const name =
        department.text ??
        department.Text ??
        department.name ??
        department.Name ??
        department.departmentName ??
        department.DepartmentName ??
        "";

      if (id !== undefined && id !== null && name) {
        departmentMap.set(Number(id), name);
        departmentMap.set(String(id), name);
      }
    });

    return classes.map((item) => {
      const currentName =
        (item.DepartmentName && String(item.DepartmentName).trim() !== "General" ? item.DepartmentName.trim() : null) ||
        (item.departmentName && String(item.departmentName).trim() !== "General" ? item.departmentName.trim() : null);

      const deptId = item.DepartmentId ?? item.departmentId;

      const resolvedName =
        currentName ||
        (deptId !== null && deptId !== undefined
          ? departmentMap.get(Number(deptId)) || departmentMap.get(String(deptId))
          : null) ||
        "";

      return {
        ...item,
        DepartmentName: resolvedName,
        departmentName: resolvedName,
      };
    });
  } catch (error) {
    console.error("Failed to enrich classes with department names:", error);
    return classes;
  }
};

// =====================================================
// GET ALL CLASS
//
// GET /api/Class/GetAllClass
// =====================================================
export const getAllClass = async () => {
  checkToken();

  const response = await fetch(`${API_URL}Class/GetAllClass`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);
  const normalized = normalizeClassList(data);

  // Automatically attach DepartmentName to classes so any consumer gets correct department info
  try {
    return await addDepartmentNames(normalized);
  } catch (err) {
    console.warn("Auto addDepartmentNames failed in getAllClass:", err);
    return normalized;
  }
};

// =====================================================
// GET CLASS DROPDOWN
//
// GET /api/Class/Dropdown
//
// EXISTING METHOD - NOT CHANGED
// =====================================================

export const getClassDropdown = async (departmentId = null) => {
  let list = [];

  try {
    const response = await fetch(`${API_URL}Class/Dropdown`, {
      method: "GET",
      headers: getHeaders(),
    });

    const data = await handleResponse(response);

    if (Array.isArray(data) && data.length > 0) {
      list = data.map((item) => ({
        id: item.id ?? item.Id ?? item.code ?? item.Code ?? null,

        text:
          item.text ??
          item.Text ??
          item.Name ??
          item.name ??
          item.ClassName ??
          item.className ??
          "",

        departmentId:
          item.departmentId ??
          item.DepartmentId ??
          item.Department?.Id ??
          item.department?.id ??
          null,
      }));
    }
  } catch (err) {
    console.warn("Class/Dropdown failed, falling back to getAllClass:", err);
  }

  // If list is empty or items lack departmentId, fetch from getAllClass() to ensure departmentId is present
  if (
    list.length === 0 ||
    list.every(
      (item) => item.departmentId === null || item.departmentId === undefined,
    )
  ) {
    try {
      const allClasses = await getAllClass();
      if (Array.isArray(allClasses) && allClasses.length > 0) {
        list = allClasses.map((item) => ({
          id: item.Id ?? item.id,
          text:
            item.ClassName ??
            item.className ??
            item.Name ??
            item.name ??
            `Class ${item.Id}`,
          departmentId: item.DepartmentId ?? item.departmentId ?? null,
        }));
      }
    } catch (err) {
      console.warn("getAllClass fallback failed in getClassDropdown:", err);
    }
  }

  if (
    departmentId !== null &&
    departmentId !== undefined &&
    String(departmentId).trim() !== ""
  ) {
    return list.filter(
      (item) => String(item.departmentId) === String(departmentId),
    );
  }

  return list;
};

// =====================================================
// GET CLASS DROPDOWN BY DEPARTMENT
// =====================================================

export const getClassDropdownByDepartment = async (departmentId) => {
  return getClassDropdown(departmentId);
};

// =====================================================
// GET CLASS BY CODE
//
// GET /api/Class/GetClassByCode/{code}
// =====================================================

export const getClassByCode = async (code) => {
  checkToken();

  if (code === undefined || code === null || String(code).trim() === "") {
    throw new Error("Class code is required.");
  }

  const response = await fetch(
    `${API_URL}Class/GetClassByCode/${encodeURIComponent(String(code).trim())}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  return normalizeClass(data);
};

// =====================================================
// GET CLASS BY NAME
//
// GET /api/Class/GetClassByName/{name}
// =====================================================

export const getClassByName = async (name) => {
  checkToken();

  if (name === undefined || name === null || String(name).trim() === "") {
    throw new Error("Class name is required.");
  }

  const response = await fetch(
    `${API_URL}Class/GetClassByName/${encodeURIComponent(String(name).trim())}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  return normalizeClassList(data);
};

// =====================================================
// CREATE CLASS
//
// POST /api/Class/CreateClass
// =====================================================

export const createClass = async (classData) => {
  checkToken();

  if (!classData) {
    throw new Error("Class data is required.");
  }

  const payload = {
    departmentId: Number(classData.DepartmentId ?? classData.departmentId),

    classCode: String(classData.ClassCode ?? classData.classCode ?? "").trim(),

    className: String(classData.ClassName ?? classData.className ?? "").trim(),

    description: classData.Description ?? classData.description ?? null,

    displayOrder: Number(classData.DisplayOrder ?? classData.displayOrder ?? 0),

    isActive:
      classData.IsActive === undefined ? true : Boolean(classData.IsActive),
  };

  // ===================================================
  // VALIDATION
  // ===================================================

  if (!Number.isInteger(payload.departmentId) || payload.departmentId <= 0) {
    throw new Error("Department is required.");
  }

  if (!payload.classCode) {
    throw new Error("Class code is required.");
  }

  if (!payload.className) {
    throw new Error("Class name is required.");
  }

  if (!Number.isInteger(payload.displayOrder) || payload.displayOrder < 0) {
    throw new Error("Display order must be a valid number.");
  }

  // ===================================================
  // API REQUEST
  // ===================================================

  const response = await fetch(`${API_URL}Class/CreateClass`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(response);

  return normalizeClass(data);
};

// =====================================================
// UPDATE CLASS
//
// PUT /api/Class/UpdateClass/{id}
// =====================================================

export const updateClass = async (id, classData) => {
  checkToken();

  // ===================================================
  // VALIDATE ID
  // ===================================================

  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error("Class ID is required.");
  }

  // ===================================================
  // VALIDATE DATA
  // ===================================================

  if (!classData) {
    throw new Error("Class data is required.");
  }

  // ===================================================
  // PAYLOAD
  // ===================================================

  const payload = {
    id: Number(id),

    departmentId: Number(classData.DepartmentId ?? classData.departmentId),

    classCode: String(classData.ClassCode ?? classData.classCode ?? "").trim(),

    className: String(classData.ClassName ?? classData.className ?? "").trim(),

    description: classData.Description ?? classData.description ?? null,

    displayOrder: Number(classData.DisplayOrder ?? classData.displayOrder ?? 0),

    isActive:
      classData.IsActive === undefined ? true : Boolean(classData.IsActive),
  };
  // ===================================================
  // VALIDATION
  // ===================================================

  if (!Number.isInteger(payload.departmentId) || payload.departmentId <= 0) {
    throw new Error("Department is required.");
  }

  if (!payload.classCode) {
    throw new Error("Class code is required.");
  }

  if (!payload.className) {
    throw new Error("Class name is required.");
  }

  if (!Number.isInteger(payload.displayOrder) || payload.displayOrder < 0) {
    throw new Error("Display order must be a valid number.");
  }

  // ===================================================
  // API REQUEST
  // ===================================================

  const response = await fetch(
    `${API_URL}Class/UpdateClass/${encodeURIComponent(String(id).trim())}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    },
  );

  const data = await handleResponse(response);

  // Backend returns bool
  return data;
};
// =====================================================
// DELETE CLASS
//
// DELETE /api/Class/DeleteClass/{code}
// =====================================================

export const deleteClass = async (code) => {
  checkToken();

  if (code === undefined || code === null || String(code).trim() === "") {
    throw new Error("Class code is required.");
  }

  const response = await fetch(
    `${API_URL}Class/DeleteClass/${encodeURIComponent(String(code).trim())}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );

  return handleResponse(response);
};

export const getAllClasses = getAllClass;
