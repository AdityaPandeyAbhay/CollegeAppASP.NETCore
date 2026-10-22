// =====================================================
// DEPARTMENT SERVICE
// =====================================================

import { getToken } from "../Utils/auth";


// =====================================================
// BASE API URL
// =====================================================

const API_URL =
  "/api/";


// =====================================================
// HEADERS
// =====================================================

const getHeaders = () => {

  const token = getToken();

  return {
    "Content-Type": "application/json",

    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };

};


// =====================================================
// TOKEN CHECK
// =====================================================

const checkToken = () => {

  const token = getToken();

  if (!token) {

    throw new Error(
      "Authentication token not found. Please login again."
    );

  }

  return token;

};


// =====================================================
// HANDLE RESPONSE
// =====================================================

const handleResponse = async (response) => {

  let data = null;

  try {

    data = await response.json();

  } catch {

    data = null;

  }


  // ===================================================
  // UNAUTHORIZED
  // ===================================================

  if (response.status === 401) {

    throw new Error(
      "Unauthorized (401). Please login again."
    );

  }


  // ===================================================
  // FORBIDDEN
  // ===================================================

  if (response.status === 403) {

    throw new Error(
      "Access denied (403). You do not have permission."
    );

  }


  // ===================================================
  // OTHER HTTP ERRORS
  // ===================================================

  if (!response.ok) {

    let message =
      data?.message ||
      data?.Message ||
      data?.title ||
      data?.Title ||
      "Department request failed.";


    if (
      Array.isArray(data?.errors) &&
      data.errors.length > 0
    ) {

      message =
        data.errors.join(", ");

    }


    if (
      Array.isArray(data?.Errors) &&
      data.Errors.length > 0
    ) {

      message =
        data.Errors.join(", ");

    }


    throw new Error(message);

  }


  // ===================================================
  // API RESPONSE STATUS FALSE
  // ===================================================

  if (
    data &&
    (
      data.status === false ||
      data.Status === false
    )
  ) {

    let message =
      data?.message ||
      data?.Message ||
      "Department request failed.";


    if (
      Array.isArray(data?.errors) &&
      data.errors.length > 0
    ) {

      message =
        data.errors.join(", ");

    }


    if (
      Array.isArray(data?.Errors) &&
      data.Errors.length > 0
    ) {

      message =
        data.Errors.join(", ");

    }


    throw new Error(message);

  }


  // ===================================================
  // API DATA
  // ===================================================

  if (
    data &&
    Object.prototype.hasOwnProperty.call(
      data,
      "data"
    )
  ) {

    return data.data;

  }


  if (
    data &&
    Object.prototype.hasOwnProperty.call(
      data,
      "Data"
    )
  ) {

    return data.Data;

  }


  return data;

};


// =====================================================
// CREATE DEPARTMENT
//
// POST
// /api/Department/CreateDepartment
// =====================================================

export const createDepartment = async (departmentData) => {

  checkToken();

  const response = await fetch(
    `${API_URL}Department/CreateDepartment`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(departmentData),
    }
  );

  return handleResponse(response);

};


// =====================================================
// GET ALL DEPARTMENT
//
// GET
// /api/Department/AllDepartment
// =====================================================

export const getAllDepartment = async () => {

  checkToken();

  const response = await fetch(
    `${API_URL}Department/AllDepartment`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);

};


// =====================================================
// GET DEPARTMENT BY CODE
//
// GET
// /api/Department/DepartmentCode/{code}
// =====================================================

export const getDepartmentByCode = async (code) => {

  checkToken();

  if (
    code === undefined ||
    code === null ||
    String(code).trim() === ""
  ) {

    throw new Error(
      "Department code is required."
    );

  }

  const response = await fetch(
    `${API_URL}Department/DepartmentCode/${encodeURIComponent(
      String(code).trim()
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);

};


// =====================================================
// GET DEPARTMENT BY NAME
//
// GET
// /api/Department/Name/{name}
// =====================================================

export const getDepartmentByName = async (name) => {

  checkToken();

  if (
    name === undefined ||
    name === null ||
    String(name).trim() === ""
  ) {

    throw new Error(
      "Department name is required."
    );

  }

  const response = await fetch(
    `${API_URL}Department/Name/${encodeURIComponent(
      String(name).trim()
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);

};


// =====================================================
// UPDATE DEPARTMENT
//
// PUT
// /api/Department/UpdateDepartment/{id}
// =====================================================

export const updateDepartment = async (
  id,
  departmentData
) => {

  checkToken();

  if (
    id === undefined ||
    id === null ||
    String(id).trim() === ""
  ) {

    throw new Error(
      "Department ID is required."
    );

  }

  const response = await fetch(
    `${API_URL}Department/UpdateDepartment/${encodeURIComponent(
      id
    )}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(departmentData),
    }
  );

  return handleResponse(response);

};


// =====================================================
// DELETE DEPARTMENT
//
// DELETE
// /api/Department/DeleteDepartment/{code}
// =====================================================

export const deleteDepartment = async (code) => {

  checkToken();

  if (
    code === undefined ||
    code === null ||
    String(code).trim() === ""
  ) {

    throw new Error(
      "Department code is required."
    );

  }

  const response = await fetch(
    `${API_URL}Department/DeleteDepartment/${encodeURIComponent(
      String(code).trim()
    )}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);

};


// =====================================================
// GET DEPARTMENT DROPDOWN
//
// GET
// /api/Department/Dropdown
//
// EXISTING METHOD - NOT CHANGED
// =====================================================

export const getDepartmentDropdown = async () => {

  checkToken();


  const response = await fetch(
    `${API_URL}Department/Dropdown`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );


  return handleResponse(response);

};