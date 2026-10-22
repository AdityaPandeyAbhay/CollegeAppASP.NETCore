// =====================================================
// SUBJECT SERVICE
// =====================================================

import { getToken } from "../Utils/auth";

// =====================================================
// BASE API URL
// =====================================================

const API_URL = "/api/";

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
    throw new Error(
      "Unauthorized (401). Please login again."
    );
  }

  if (response.status === 403) {
    throw new Error(
      "Access denied (403). You do not have permission."
    );
  }

  if (!response.ok) {
    throw new Error(
      data?.Message ||
      data?.message ||
      data?.Title ||
      data?.title ||
      data?.Errors?.join(", ") ||
      data?.errors?.join(", ") ||
      "Something went wrong."
    );
  }

  // ===================================================
  // RETURN APIResponse.Data
  // ===================================================

  if (
    data &&
    Object.prototype.hasOwnProperty.call(
      data,
      "Data"
    )
  ) {
    return data.Data;
  }

  if (
    data &&
    Object.prototype.hasOwnProperty.call(
      data,
      "data"
    )
  ) {
    return data.data;
  }

  return data;
};

// =====================================================
// GET ALL SUBJECT
//
// GET /api/Subject/GetAllSubject
// =====================================================

export const getAllSubject = async () => {
  const response = await fetch(
    `${API_URL}Subject/GetAllSubject`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await handleResponse(response);

  return Array.isArray(data)
    ? data
    : [];
};

// =====================================================
// GET SUBJECT DROPDOWN
//
// GET /api/Subject/Dropdown
// =====================================================

export const getSubjectDropdown = async () => {
  const response = await fetch(
    `${API_URL}Subject/Dropdown`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await handleResponse(response);

  return Array.isArray(data)
    ? data.map((item) => ({
        id:
          item.id ??
          item.Id ??
          item.code ??
          item.Code ??
          null,

        text:
          item.text ??
          item.Text ??
          item.Name ??
          item.name ??
          item.SubjectName ??
          item.subjectName ??
          "",
      }))
    : [];
};

// =====================================================
// GET SUBJECT DROPDOWN BY DEPARTMENT
//
// GET
// /api/Subject/DropdownByDepartment/{departmentId}
// =====================================================

export const getSubjectDropdownByDepartment = async (
  departmentId
) => {
  if (
    departmentId === null ||
    departmentId === undefined ||
    String(departmentId).trim() === ""
  ) {
    throw new Error(
      "Department is required."
    );
  }

  const response = await fetch(
    `${API_URL}Subject/DropdownByDepartment/${encodeURIComponent(
      String(departmentId).trim()
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await handleResponse(response);

  return Array.isArray(data)
    ? data.map((item) => ({
        id:
          item.id ??
          item.Id ??
          item.code ??
          item.Code ??
          null,

        code: item.code ?? item.Code ?? "",

        name:
          item.text ??
          item.Text ??
          item.Name ??
          item.name ??
          item.SubjectName ??
          item.subjectName ??
          "",

        text:
          item.text ??
          item.Text ??
          item.Name ??
          item.name ??
          item.SubjectName ??
          item.subjectName ??
          "",

        departmentId: Number(departmentId),
      }))
    : [];
};


// =====================================================
// CREATE SUBJECT
//
// POST
// /api/Subject/CreateSubject
// =====================================================

export const createSubject = async (subjectData) => {

  if (
    subjectData === null ||
    subjectData === undefined
  ) {
    throw new Error(
      "Subject data is required."
    );
  }

  const response = await fetch(
    `${API_URL}Subject/CreateSubject`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(subjectData),
    }
  );

  return handleResponse(response);
};


// =====================================================
// GET SUBJECT BY CODE
//
// GET
// /api/Subject/GetSubjectByCode/{code}
// =====================================================

export const getSubjectByCode = async (code) => {

  if (
    code === null ||
    code === undefined ||
    String(code).trim() === ""
  ) {
    throw new Error(
      "Subject code is required."
    );
  }

  const response = await fetch(
    `${API_URL}Subject/GetSubjectByCode/${encodeURIComponent(
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
// GET SUBJECT BY NAME
//
// GET
// /api/Subject/GetSubjectByName/{name}
// =====================================================

export const getSubjectByName = async (name) => {

  if (
    name === null ||
    name === undefined ||
    String(name).trim() === ""
  ) {
    throw new Error(
      "Subject name is required."
    );
  }

  const response = await fetch(
    `${API_URL}Subject/GetSubjectByName/${encodeURIComponent(
      String(name).trim()
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  const data = await handleResponse(response);

  return Array.isArray(data)
    ? data
    : [];
};


// =====================================================
// UPDATE SUBJECT
//
// PUT
// /api/Subject/UpdateSubject/{id}
// =====================================================

export const updateSubject = async (
  id,
  subjectData
) => {

  if (
    id === null ||
    id === undefined ||
    String(id).trim() === ""
  ) {
    throw new Error(
      "Subject ID is required."
    );
  }

  if (
    subjectData === null ||
    subjectData === undefined
  ) {
    throw new Error(
      "Subject data is required."
    );
  }

  const response = await fetch(
    `${API_URL}Subject/UpdateSubject/${encodeURIComponent(
      String(id).trim()
    )}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(subjectData),
    }
  );

  return handleResponse(response);
};


// =====================================================
// DELETE SUBJECT
//
// DELETE
// /api/Subject/DeleteSubject/{code}
// =====================================================

export const deleteSubject = async (code) => {

  if (
    code === null ||
    code === undefined ||
    String(code).trim() === ""
  ) {
    throw new Error(
      "Subject code is required."
    );
  }

  const response = await fetch(
    `${API_URL}Subject/DeleteSubject/${encodeURIComponent(
      String(code).trim()
    )}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return handleResponse(response);
};