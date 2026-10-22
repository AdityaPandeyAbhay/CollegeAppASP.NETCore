// =====================================================
// STUDENT PROMOTION & ACADEMIC YEAR HISTORY SERVICE
// =====================================================

import { getToken } from "../Utils/auth";

const API_URL = "/api/";

const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const checkToken = () => {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }
  return token;
};

const handleResponse = async (response) => {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (response.status === 401) {
    throw new Error("Unauthorized (401). Please login again.");
  }

  if (response.status === 403) {
    throw new Error("Access denied (403). You do not have permission.");
  }

  if (!response.ok) {
    let message = data?.Message || data?.message || data?.Errors?.[0] || data?.errors?.[0] || null;
    if (!message && data?.errors && typeof data.errors === "object") {
      message = Object.values(data.errors).flat().join(", ");
    }
    throw new Error(message || `Request failed with status ${response.status}`);
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
// GET STUDENT ACADEMIC HISTORY TIMELINE
// GET: /api/StudentPromotion/History/{studentId}
// =====================================================
export const getStudentAcademicHistory = async (studentId) => {
  checkToken();
  if (!studentId) throw new Error("Student ID is required.");

  const response = await fetch(`${API_URL}StudentPromotion/History/${encodeURIComponent(studentId)}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);
  return Array.isArray(data) ? data : [];
};

// =====================================================
// GET STUDENTS BY YEAR, CLASS & SECTION
// GET: /api/StudentPromotion/StudentsByYear?...
// =====================================================
export const getStudentsByYearClassSection = async ({
  academicYearId,
  departmentId,
  schoolClassId,
  sectionId,
}) => {
  checkToken();

  const params = new URLSearchParams();
  if (academicYearId) params.append("academicYearId", academicYearId);
  if (departmentId) params.append("departmentId", departmentId);
  if (schoolClassId) params.append("schoolClassId", schoolClassId);
  if (sectionId) params.append("sectionId", sectionId);

  const response = await fetch(`${API_URL}StudentPromotion/StudentsByYear?${params.toString()}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);
  return Array.isArray(data) ? data : [];
};

// =====================================================
// BULK PROMOTE STUDENTS TO NEXT CLASS / YEAR
// POST: /api/StudentPromotion/Promote
// =====================================================
export const promoteStudents = async (payload) => {
  checkToken();
  if (!payload) throw new Error("Promotion payload is required.");

  const response = await fetch(`${API_URL}StudentPromotion/Promote`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

// =====================================================
// ENROLL STUDENT IN ACADEMIC YEAR
// POST: /api/StudentPromotion/Enroll
// =====================================================
export const enrollStudent = async (payload) => {
  checkToken();
  if (!payload) throw new Error("Enrollment payload is required.");

  const response = await fetch(`${API_URL}StudentPromotion/Enroll`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

// =====================================================
// SYNC EXISTING STUDENTS
// POST: /api/StudentPromotion/SyncExisting
// =====================================================
export const syncExistingStudents = async () => {
  checkToken();
  const response = await fetch(`${API_URL}StudentPromotion/SyncExisting`, {
    method: "POST",
    headers: getHeaders(),
  });

  return handleResponse(response);
};
