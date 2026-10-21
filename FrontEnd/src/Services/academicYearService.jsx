// =====================================================
// ACADEMIC YEAR SERVICE
// =====================================================

import { getToken } from "../Utils/auth";

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
// COMMON RESPONSE HANDLER
// =====================================================

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    throw new Error("Unauthorized (401). Please login again.");
  }

  if (response.status === 403) {
    throw new Error("Access denied (403). You do not have permission.");
  }

  if (!response.ok) {
    let message =
      data?.Message ||
      data?.message ||
      data?.Title ||
      data?.title ||
      "Something went wrong.";

    if (Array.isArray(data?.Errors) && data.Errors.length > 0) {
      message = data.Errors.join(", ");
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join(", ");
    }

    throw new Error(message);
  }

  // ===================================================
  // APIResponse.Data
  // ===================================================

  if (data && Object.prototype.hasOwnProperty.call(data, "Data")) {
    return data.Data;
  }

  if (data && Object.prototype.hasOwnProperty.call(data, "data")) {
    return data.data;
  }

  return data;
};

// =====================================================
// GET ALL ACADEMIC YEARS
//
// GET
// /api/AcademicYear/AllAcademicYear
// =====================================================

export const getAllAcademicYear = async () => {
  const response = await fetch(`${API_URL}AcademicYear/AllAcademicYear`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// =====================================================
// GET ACADEMIC YEAR DROPDOWN
//
// GET
// /api/AcademicYear/Dropdown
// =====================================================

export const getAcademicYearDropdown = async () => {
  const response = await fetch(`${API_URL}AcademicYear/Dropdown`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  return Array.isArray(data)
    ? data.map((item) => ({
        id: item.id ?? item.Id ?? item.code ?? item.Code ?? null,

        text:
          item.text ??
          item.Text ??
          item.name ??
          item.Name ??
          item.YearName ??
          item.yearName ??
          "",
      }))
    : [];
};

// =====================================================
// GET ACADEMIC YEAR BY NAME
//
// GET
// /api/AcademicYear/Year/{yearName}
// =====================================================

export const getAcademicYearByName = async (yearName) => {
  if (
    yearName === null ||
    yearName === undefined ||
    String(yearName).trim() === ""
  ) {
    throw new Error("Academic year is required.");
  }

  const response = await fetch(
    `${API_URL}AcademicYear/Year/${encodeURIComponent(
      String(yearName).trim(),
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  return handleResponse(response);
};

// =====================================================
// CREATE ACADEMIC YEAR
//
// POST
// /api/AcademicYear/CreateAcademicYear
// =====================================================

export const createAcademicYear = async (academicYearData) => {
  if (!academicYearData) {
    throw new Error("Academic year data is required.");
  }

  const response = await fetch(`${API_URL}AcademicYear/CreateAcademicYear`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(academicYearData),
  });

  return handleResponse(response);
};

// =====================================================
// UPDATE ACADEMIC YEAR
//
// PUT
// /api/AcademicYear/UpdateAcademicYear/{id}
// =====================================================

export const updateAcademicYear = async (id, academicYearData) => {
  if (id === null || id === undefined || String(id).trim() === "") {
    throw new Error("Academic year ID is required.");
  }

  if (!academicYearData) {
    throw new Error("Academic year data is required.");
  }

  const response = await fetch(
    `${API_URL}AcademicYear/UpdateAcademicYear/${encodeURIComponent(
      String(id).trim(),
    )}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(academicYearData),
    },
  );

  return handleResponse(response);
};

// =====================================================
// DELETE ACADEMIC YEAR
//
// DELETE
// /api/AcademicYear/DeleteAcademicYear/{yearName}
// =====================================================

export const deleteAcademicYear = async (yearName) => {
  if (
    yearName === null ||
    yearName === undefined ||
    String(yearName).trim() === ""
  ) {
    throw new Error("Academic year is required.");
  }

  const response = await fetch(
    `${API_URL}AcademicYear/DeleteAcademicYear/${encodeURIComponent(
      String(yearName).trim(),
    )}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );

  return handleResponse(response);
};

// =====================================================
// GET ACADEMIC YEAR BY ID
//
// GET /api/AcademicYear/{id} (or fallback to GetAll)
// =====================================================

export const getAcademicYearById = async (id) => {
  if (id === null || id === undefined || String(id).trim() === "") {
    throw new Error("Academic year ID is required.");
  }

  try {
    const response = await fetch(
      `${API_URL}AcademicYear/${encodeURIComponent(String(id).trim())}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (response.ok) {
      return await handleResponse(response);
    }
  } catch (_) {
    // fallback if dedicated ID endpoint is not implemented
  }

  const allYears = await getAllAcademicYear();
  const found = Array.isArray(allYears)
    ? allYears.find((item) => String(item.id ?? item.Id) === String(id))
    : null;

  if (found) return found;

  throw new Error(`Academic year with ID ${id} not found.`);
};

// Alias export for consistency
export const getAllAcademicYears = getAllAcademicYear;
