// =====================================================
// SECTION SERVICE
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
// GET ALL SECTION
//
// GET /api/Section/GetAllSection
// =====================================================

export const getAllSection = async () => {
  const response = await fetch(
    `${API_URL}Section/GetAllSection`,
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
// GET SECTION DROPDOWN
//
// GET /api/Section/Dropdown
// =====================================================

export const getSectionDropdown = async () => {
  const response = await fetch(
    `${API_URL}Section/Dropdown`,
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
          item.SectionName ??
          item.sectionName ??
          "",
      }))
    : [];
};

// =====================================================
// GET SECTION BY CODE
//
// GET /api/Section/GetSectionByCode/{code}
// =====================================================

export const getSectionByCode = async (code) => {
  if (!code || !String(code).trim()) {
    throw new Error("Section code is required.");
  }

  const response = await fetch(
    `${API_URL}Section/GetSectionByCode/${encodeURIComponent(
      String(code).trim()
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );

  return await handleResponse(response);
};


// =====================================================
// GET SECTION BY NAME
//
// GET /api/Section/GetSectionByName/{name}
// =====================================================

export const getSectionByName = async (name) => {
  if (!name || !String(name).trim()) {
    throw new Error("Section name is required.");
  }

  const response = await fetch(
    `${API_URL}Section/GetSectionByName/${encodeURIComponent(
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
// CREATE SECTION
//
// POST /api/Section/CreateSection
// =====================================================

export const createSection = async (sectionData) => {
  if (!sectionData) {
    throw new Error("Section data is required.");
  }

  const schoolClassId = Number(
    sectionData.SchoolClassId ??
    sectionData.schoolClassId
  );

  const sectionCode = String(
    sectionData.SectionCode ??
    sectionData.sectionCode ??
    ""
  ).trim();

  const sectionName = String(
    sectionData.SectionName ??
    sectionData.sectionName ??
    ""
  ).trim();

  const displayOrder = Number(
    sectionData.DisplayOrder ??
    sectionData.displayOrder ??
    1
  );

  const capacity = Number(
    sectionData.Capacity ??
    sectionData.capacity
  );

  if (!schoolClassId || schoolClassId <= 0) {
    throw new Error("Please select a class.");
  }

  if (!sectionCode) {
    throw new Error("Section code is required.");
  }

  if (!sectionName) {
    throw new Error("Section name is required.");
  }

  if (!Number.isInteger(displayOrder) || displayOrder < 0) {
    throw new Error("Display order must be a valid number.");
  }

  if (
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 500
  ) {
    throw new Error(
      "Capacity must be between 1 and 500."
    );
  }

  const payload = {
    schoolClassId: schoolClassId,

    sectionCode: sectionCode,

    sectionName: sectionName,

    displayOrder: displayOrder,

    capacity: capacity,

    roomNumber:
      sectionData.RoomNumber ??
      sectionData.roomNumber ??
      null,

    description:
      sectionData.Description ??
      sectionData.description ??
      null,

    isActive:
      sectionData.IsActive ??
      sectionData.isActive ??
      true,
  };

  const response = await fetch(
    `${API_URL}Section/CreateSection`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return await handleResponse(response);
};


// =====================================================
// UPDATE SECTION
//
// PUT /api/Section/UpdateSection/{id}
//
// IMPORTANT:
// ID IS NOT SENT IN BODY.
// ID IS SENT ONLY IN URL.
// =====================================================

export const updateSection = async (
  id,
  sectionData
) => {
  if (!id || Number(id) <= 0) {
    throw new Error("Valid section ID is required.");
  }

  if (!sectionData) {
    throw new Error("Section data is required.");
  }

  const schoolClassId = Number(
    sectionData.SchoolClassId ??
    sectionData.schoolClassId
  );

  const sectionCode = String(
    sectionData.SectionCode ??
    sectionData.sectionCode ??
    ""
  ).trim();

  const sectionName = String(
    sectionData.SectionName ??
    sectionData.sectionName ??
    ""
  ).trim();

  const displayOrder = Number(
    sectionData.DisplayOrder ??
    sectionData.displayOrder ??
    1
  );

  const capacity = Number(
    sectionData.Capacity ??
    sectionData.capacity
  );

  if (!schoolClassId || schoolClassId <= 0) {
    throw new Error("Please select a class.");
  }

  if (!sectionCode) {
    throw new Error("Section code is required.");
  }

  if (!sectionName) {
    throw new Error("Section name is required.");
  }

  if (!Number.isInteger(displayOrder) || displayOrder < 0) {
    throw new Error("Display order must be a valid number.");
  }

  if (
    !Number.isInteger(capacity) ||
    capacity < 1 ||
    capacity > 500
  ) {
    throw new Error(
      "Capacity must be between 1 and 500."
    );
  }

  // ===================================================
  // DO NOT ADD id HERE
  // Backend UpdateSectionDTO DOES NOT HAVE Id
  // ===================================================

  const payload = {
    schoolClassId: schoolClassId,

    sectionCode: sectionCode,

    sectionName: sectionName,

    displayOrder: displayOrder,

    capacity: capacity,

    roomNumber:
      sectionData.RoomNumber ??
      sectionData.roomNumber ??
      null,

    description:
      sectionData.Description ??
      sectionData.description ??
      null,

    isActive:
      sectionData.IsActive ??
      sectionData.isActive ??
      false,
  };

  const response = await fetch(
    `${API_URL}Section/UpdateSection/${Number(id)}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    }
  );

  return await handleResponse(response);
};


// =====================================================
// DELETE SECTION
//
// DELETE /api/Section/DeleteSection/{code}
// =====================================================

export const deleteSection = async (code) => {
  if (!code || !String(code).trim()) {
    throw new Error("Section code is required.");
  }

  const response = await fetch(
    `${API_URL}Section/DeleteSection/${encodeURIComponent(
      String(code).trim()
    )}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    }
  );

  return await handleResponse(response);
};
export const getAllSections = getAllSection;
