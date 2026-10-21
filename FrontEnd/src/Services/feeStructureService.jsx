// =====================================================
// FEE STRUCTURE SERVICE
// =====================================================

import { getToken } from "../Utils/auth";
import { getAcademicYearDropdown } from "./academicYearService";
import { getDepartmentDropdown } from "./departmentService";
import { getClassDropdown } from "./classService";
import { getFeeCategoryDropdown } from "./feeCategoryService";

// =====================================================
// BASE API URL
// =====================================================

const API_URL = "https://localhost:7164/api/";

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
// HANDLE RESPONSE
// =====================================================

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new Error("Unauthorized (401). Please login again.");
  }

  if (response.status === 403) {
    throw new Error("Access denied (403). You do not have permission.");
  }

  if (response.status === 404) {
    let message =
      data?.Message ||
      data?.message ||
      data?.Title ||
      data?.title ||
      "Fee Structure record not found.";

    if (Array.isArray(data?.Errors) && data.Errors.length > 0) {
      message = data.Errors.join(", ");
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join(", ");
    }

    throw new Error(message);
  }

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

  if (data && (data.status === false || data.Status === false)) {
    let message =
      data?.Message || data?.message || "Fee Structure request failed.";

    if (Array.isArray(data?.Errors) && data.Errors.length > 0) {
      message = data.Errors.join(", ");
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join(", ");
    }

    throw new Error(message);
  }

  if (data && Object.prototype.hasOwnProperty.call(data, "Data")) {
    return data.Data;
  }

  if (data && Object.prototype.hasOwnProperty.call(data, "data")) {
    return data.data;
  }

  return data;
};

// =====================================================
// NORMALIZE FEE STRUCTURE
// =====================================================

const normalizeFeeStructure = (item) => {
  if (!item || typeof item !== "object") {
    return item;
  }

  return {
    Id: item.Id ?? item.id ?? null,

    AcademicYearId: item.AcademicYearId ?? item.academicYearId ?? null,

    AcademicYearName:
      item.AcademicYearName ??
      item.academicYearName ??
      item.AcademicYear?.YearName ??
      item.academicYear?.yearName ??
      "",

    DepartmentId: item.DepartmentId ?? item.departmentId ?? null,

    DepartmentName:
      item.DepartmentName ??
      item.departmentName ??
      item.Department?.DepartmentName ??
      item.department?.departmentName ??
      item.Department?.Name ??
      item.department?.name ??
      "",

    ClassId: item.ClassId ?? item.classId ?? null,

    ClassName:
      item.ClassName ??
      item.className ??
      item.SchoolClass?.ClassName ??
      item.schoolClass?.className ??
      "",

    FeeCategoryId: item.FeeCategoryId ?? item.feeCategoryId ?? null,

    FeeCategoryName:
      item.FeeCategoryName ??
      item.feeCategoryName ??
      item.FeeCategory?.CategoryName ??
      item.feeCategory?.categoryName ??
      "",

    Amount: item.Amount ?? item.amount ?? 0,

    DueDate: item.DueDate ?? item.dueDate ?? null,

    Description: item.Description ?? item.description ?? "",

    IsActive: item.IsActive ?? item.isActive ?? true,

    CreatedBy: item.CreatedBy ?? item.createdBy ?? null,

    CreatedDate: item.CreatedDate ?? item.createdDate ?? null,

    ModifiedBy: item.ModifiedBy ?? item.modifiedBy ?? null,

    ModifiedDate: item.ModifiedDate ?? item.modifiedDate ?? null,
  };
};

// =====================================================
// NORMALIZE LIST
// =====================================================

const normalizeFeeStructureList = (data) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeFeeStructure);
};

// =====================================================
// ENRICH FEE STRUCTURES WITH DROPDOWN NAMES
// Ensures Academic Year, Department, Class, and Fee Category
// columns always show proper names instead of remaining blank
// =====================================================

export const enrichFeeStructures = async (items) => {
  if (!Array.isArray(items) || items.length === 0) {
    return items || [];
  }

  try {
    const [years, depts, classes, categories] = await Promise.all([
      getAcademicYearDropdown().catch(() => []),
      getDepartmentDropdown().catch(() => []),
      getClassDropdown().catch(() => []),
      getFeeCategoryDropdown().catch(() => []),
    ]);

    const yearMap = new Map();
    (Array.isArray(years) ? years : []).forEach((y) => {
      const id = y.id ?? y.Id;
      const text =
        y.text ?? y.Text ?? y.name ?? y.Name ?? y.YearName ?? y.yearName ?? "";
      if (id !== undefined && id !== null) {
        yearMap.set(Number(id), text);
      }
    });

    const deptMap = new Map();
    (Array.isArray(depts) ? depts : []).forEach((d) => {
      const id = d.id ?? d.Id;
      const text =
        d.text ??
        d.Text ??
        d.name ??
        d.Name ??
        d.DepartmentName ??
        d.departmentName ??
        "";
      if (id !== undefined && id !== null) {
        deptMap.set(Number(id), text);
      }
    });

    const classMap = new Map();
    (Array.isArray(classes) ? classes : []).forEach((c) => {
      const id = c.id ?? c.Id;
      const text =
        c.text ??
        c.Text ??
        c.name ??
        c.Name ??
        c.ClassName ??
        c.className ??
        "";
      if (id !== undefined && id !== null) {
        classMap.set(Number(id), text);
      }
    });

    const catMap = new Map();
    (Array.isArray(categories) ? categories : []).forEach((ct) => {
      const id = ct.id ?? ct.Id;
      const text =
        ct.text ??
        ct.Text ??
        ct.name ??
        ct.Name ??
        ct.CategoryName ??
        ct.categoryName ??
        "";
      if (id !== undefined && id !== null) {
        catMap.set(Number(id), text);
      }
    });

    return items.map((item) => ({
      ...item,
      AcademicYearName:
        item.AcademicYearName || yearMap.get(Number(item.AcademicYearId)) || "",
      DepartmentName:
        item.DepartmentName || deptMap.get(Number(item.DepartmentId)) || "",
      ClassName: item.ClassName || classMap.get(Number(item.ClassId)) || "",
      FeeCategoryName:
        item.FeeCategoryName || catMap.get(Number(item.FeeCategoryId)) || "",
    }));
  } catch (err) {
    console.warn("Failed to enrich fee structures with dropdowns:", err);
    return items;
  }
};

// =====================================================
// GET ALL FEE STRUCTURES
//
// GET
// /api/FeeStructure/GetAllFeeStructures
// =====================================================

export const getAllFeeStructures = async () => {
  checkToken();

  const response = await fetch(`${API_URL}FeeStructure/GetAllFeeStructures`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);
  const normalized = normalizeFeeStructureList(data);
  return enrichFeeStructures(normalized);
};

// =====================================================
// GET FEE STRUCTURE BY ID
//
// GET
// /api/FeeStructure/GetFeeStructureById/{id}
// =====================================================

export const getFeeStructureById = async (id) => {
  checkToken();

  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error("Fee Structure ID is required.");
  }

  const response = await fetch(
    `${API_URL}FeeStructure/GetFeeStructureById/${encodeURIComponent(
      String(id).trim(),
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);
  const normalized = normalizeFeeStructure(data);
  if (!normalized) return null;
  const enriched = await enrichFeeStructures([normalized]);
  return enriched[0];
};

// =====================================================
// GET FEE STRUCTURE BY CATEGORY
//
// GET
// /api/FeeStructure/GetFeeStructureByCategory/{feeCategoryId}
// =====================================================

export const getFeeStructureByCategory = async (feeCategoryId) => {
  checkToken();

  if (
    feeCategoryId === undefined ||
    feeCategoryId === null ||
    String(feeCategoryId).trim() === ""
  ) {
    throw new Error("Fee Category is required.");
  }

  const response = await fetch(
    `${API_URL}FeeStructure/GetFeeStructureByCategory/${encodeURIComponent(
      String(feeCategoryId).trim(),
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);
  const normalized = normalizeFeeStructureList(data);
  return enrichFeeStructures(normalized);
};

// =====================================================
// GET FEE STRUCTURE BY CLASS
//
// GET
// /api/FeeStructure/GetFeeStructureByClass/{classId}
// =====================================================

export const getFeeStructureByClass = async (classId) => {
  checkToken();

  if (
    classId === undefined ||
    classId === null ||
    String(classId).trim() === ""
  ) {
    throw new Error("Class is required.");
  }

  const response = await fetch(
    `${API_URL}FeeStructure/GetFeeStructureByClass/${encodeURIComponent(
      String(classId).trim(),
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);
  const normalized = normalizeFeeStructureList(data);
  return enrichFeeStructures(normalized);
};

// =====================================================
// CREATE FEE STRUCTURE
//
// POST
// /api/FeeStructure/CreateFeeStructure
// =====================================================

export const createFeeStructure = async (feeStructureData) => {
  checkToken();

  if (!feeStructureData) {
    throw new Error("Fee Structure data is required.");
  }

  const payload = {
    academicYearId: Number(
      feeStructureData.AcademicYearId ?? feeStructureData.academicYearId,
    ),

    departmentId: Number(
      feeStructureData.DepartmentId ?? feeStructureData.departmentId,
    ),

    classId: Number(feeStructureData.ClassId ?? feeStructureData.classId),

    feeCategoryId: Number(
      feeStructureData.FeeCategoryId ?? feeStructureData.feeCategoryId,
    ),

    amount: Number(feeStructureData.Amount ?? feeStructureData.amount),

    dueDate: feeStructureData.DueDate ?? feeStructureData.dueDate,

    description:
      feeStructureData.Description ?? feeStructureData.description ?? null,

    isActive:
      feeStructureData.IsActive === undefined
        ? feeStructureData.isActive === undefined
          ? true
          : Boolean(feeStructureData.isActive)
        : Boolean(feeStructureData.IsActive),
  };

  if (
    !Number.isInteger(payload.academicYearId) ||
    payload.academicYearId <= 0
  ) {
    throw new Error("Academic Year is required.");
  }

  if (!Number.isInteger(payload.departmentId) || payload.departmentId <= 0) {
    throw new Error("Department is required.");
  }

  if (!Number.isInteger(payload.classId) || payload.classId <= 0) {
    throw new Error("Class is required.");
  }

  if (!Number.isInteger(payload.feeCategoryId) || payload.feeCategoryId <= 0) {
    throw new Error("Fee Category is required.");
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  if (!payload.dueDate) {
    throw new Error("Due Date is required.");
  }

  const response = await fetch(`${API_URL}FeeStructure/CreateFeeStructure`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(response);

  return normalizeFeeStructure(data);
};

// =====================================================
// GET FEE STRUCTURE DROPDOWN
//
// GET
// /api/FeeStructure/Dropdown
// =====================================================

export const getFeeStructureDropdown = async () => {
  checkToken();

  try {
    const response = await fetch(`${API_URL}FeeStructure/Dropdown`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (response.ok) {
      const data = await handleResponse(response);

      if (Array.isArray(data) && data.length > 0) {
        return data.map((item) => ({
          id: item.id ?? item.Id ?? null,
          text: item.text ?? item.Text ?? item.name ?? item.Name ?? "",
          amount: item.amount ?? item.Amount ?? null,
        }));
      }
    }
  } catch (err) {
    console.warn("FeeStructure/Dropdown endpoint failed, using fallback:", err);
  }

  // Resilient fallback: use getAllFeeStructures()
  try {
    const all = await getAllFeeStructures();
    if (Array.isArray(all) && all.length > 0) {
      return all
        .filter((item) => item.IsActive !== false)
        .map((item) => ({
          id: item.Id,
          text: `${item.FeeCategoryName || "Fee"} - ₹${item.Amount}`,
          amount: item.Amount,
        }));
    }
  } catch (fallbackErr) {
    console.warn("getAllFeeStructures fallback failed:", fallbackErr);
  }

  return [];
};

// =====================================================
// UPDATE FEE STRUCTURE
//
// PUT
// /api/FeeStructure/UpdateFeeStructure/{id}
// =====================================================

export const updateFeeStructure = async (id, feeStructureData) => {
  checkToken();

  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error("Fee Structure ID is required.");
  }

  if (!feeStructureData) {
    throw new Error("Fee Structure data is required.");
  }

  const payload = {
    academicYearId: Number(
      feeStructureData.AcademicYearId ?? feeStructureData.academicYearId,
    ),

    departmentId: Number(
      feeStructureData.DepartmentId ?? feeStructureData.departmentId,
    ),

    classId: Number(feeStructureData.ClassId ?? feeStructureData.classId),

    feeCategoryId: Number(
      feeStructureData.FeeCategoryId ?? feeStructureData.feeCategoryId,
    ),

    amount: Number(feeStructureData.Amount ?? feeStructureData.amount),

    dueDate: feeStructureData.DueDate ?? feeStructureData.dueDate,

    description:
      feeStructureData.Description ?? feeStructureData.description ?? null,

    isActive:
      feeStructureData.IsActive === undefined
        ? feeStructureData.isActive === undefined
          ? true
          : Boolean(feeStructureData.isActive)
        : Boolean(feeStructureData.IsActive),
  };

  if (
    !Number.isInteger(payload.academicYearId) ||
    payload.academicYearId <= 0
  ) {
    throw new Error("Academic Year is required.");
  }

  if (!Number.isInteger(payload.departmentId) || payload.departmentId <= 0) {
    throw new Error("Department is required.");
  }

  if (!Number.isInteger(payload.classId) || payload.classId <= 0) {
    throw new Error("Class is required.");
  }

  if (!Number.isInteger(payload.feeCategoryId) || payload.feeCategoryId <= 0) {
    throw new Error("Fee Category is required.");
  }

  if (!Number.isFinite(payload.amount) || payload.amount <= 0) {
    throw new Error("Amount must be greater than 0.");
  }

  if (!payload.dueDate) {
    throw new Error("Due Date is required.");
  }

  const response = await fetch(
    `${API_URL}FeeStructure/UpdateFeeStructure/${encodeURIComponent(
      String(id).trim(),
    )}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    },
  );

  return handleResponse(response);
};

// =====================================================
// DELETE FEE STRUCTURE
//
// DELETE
// /api/FeeStructure/DeleteFeeStructure/{id}
// =====================================================

export const deleteFeeStructure = async (id) => {
  checkToken();

  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error("Fee Structure ID is required.");
  }

  const response = await fetch(
    `${API_URL}FeeStructure/DeleteFeeStructure/${encodeURIComponent(
      String(id).trim(),
    )}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );

  return handleResponse(response);
};
