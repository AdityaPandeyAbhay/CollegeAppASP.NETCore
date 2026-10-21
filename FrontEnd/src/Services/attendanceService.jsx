// =====================================================
// ATTENDANCE SERVICE
// =====================================================

import { getToken } from "../Utils/auth";

const API_URL = "https://localhost:7164/api/Attendance/";

const getHeaders = () => {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async (response) => {
  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorMsg =
      data?.errorMessage ||
      data?.errorMessages?.[0] ||
      data?.message ||
      data?.title ||
      `HTTP Error ${response.status}`;
    throw new Error(errorMsg);
  }

  return data;
};

// =====================================================
// TAKE ATTENDANCE (BULK)
// =====================================================
export const takeAttendance = async (payload) => {
  const response = await fetch(`${API_URL}TakeAttendance`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return await handleResponse(response);
};

// =====================================================
// GET ALL ATTENDANCE
// =====================================================
export const getAllAttendance = async () => {
  const response = await fetch(`${API_URL}AllAttendance`, {
    method: "GET",
    headers: getHeaders(),
  });
  return await handleResponse(response);
};

// =====================================================
// GET ATTENDANCE BY ID
// =====================================================
export const getAttendanceById = async (id) => {
  const response = await fetch(`${API_URL}${id}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return await handleResponse(response);
};

// =====================================================
// GET ATTENDANCE BY DATE & TEACHER ASSIGNMENT
// =====================================================
export const getAttendanceByDate = async (teacherAssignmentId, attendanceDate) => {
  const response = await fetch(
    `${API_URL}ByDate?teacherAssignmentId=${teacherAssignmentId}&attendanceDate=${attendanceDate}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return await handleResponse(response);
};

// =====================================================
// GET TEACHER ATTENDANCE (BY TEACHER ID)
// =====================================================
export const getTeacherAttendance = async (teacherId) => {
  const response = await fetch(`${API_URL}Teacher/${teacherId}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return await handleResponse(response);
};

// =====================================================
// UPDATE ATTENDANCE
// =====================================================
export const updateAttendance = async (payload) => {
  const response = await fetch(`${API_URL}UpdateAttendance`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });
  return await handleResponse(response);
};

// =====================================================
// DELETE ATTENDANCE
// =====================================================
export const deleteAttendance = async (id) => {
  const response = await fetch(`${API_URL}DeleteAttendance/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  return await handleResponse(response);
};

// =====================================================
// GET ATTENDANCE DETAILS
// =====================================================
export const getAttendanceDetails = async (attendanceId) => {
  const response = await fetch(`${API_URL}Details/${attendanceId}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return await handleResponse(response);
};
