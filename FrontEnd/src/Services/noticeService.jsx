
// =====================================================
// NOTICE SERVICE
// =====================================================

import { getToken } from "../Utils/auth";

// =====================================================
// BASE API URL
// =====================================================

const API_URL = "/api/";

// =====================================================
// COMMON JSON HEADERS
//
// Used for normal GET/PUT requests.
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
// FORM DATA HEADERS
//
// IMPORTANT:
// Do NOT add Content-Type here.
//
// Browser automatically creates:
//
// multipart/form-data; boundary=...
//
// This is required for IFormFile.
// =====================================================

const getFormDataHeaders = () => {
  const token = getToken();

  return {
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
  // 401 UNAUTHORIZED
  // ===================================================

  if (response.status === 401) {
    throw new Error(
      "Unauthorized (401). Your login session may have expired. Please login again."
    );
  }

  // ===================================================
  // 403 FORBIDDEN
  // ===================================================

  if (response.status === 403) {
    throw new Error(
      "Access denied (403). You do not have permission to perform this operation."
    );
  }

  // ===================================================
  // OTHER HTTP ERRORS
  // ===================================================

  if (!response.ok) {
    let message = null;

    // Backend APIResponse:
    // Errors
    if (
      Array.isArray(data?.Errors) &&
      data.Errors.length > 0
    ) {
      message = data.Errors.join(", ");
    }

    // ASP.NET / lowercase errors
    if (
      !message &&
      Array.isArray(data?.errors) &&
      data.errors.length > 0
    ) {
      message = data.errors.join(", ");
    }

    // Normal message fields
    if (!message) {
      message =
        data?.Message ||
        data?.message ||
        data?.Title ||
        data?.title ||
        data?.Error ||
        data?.error ||
        null;
    }

    // ASP.NET validation errors object
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
      message =
        `Request failed with status ${response.status}`;
    }

    throw new Error(message);
  }

  // ===================================================
  // API RESPONSE FAILURE
  // ===================================================

  if (
    data &&
    (
      data.Status === false ||
      data.status === false
    )
  ) {
    let message =
      data?.Message ||
      data?.message ||
      "Request failed.";

    // Backend Errors
    if (
      Array.isArray(data?.Errors) &&
      data.Errors.length > 0
    ) {
      message = data.Errors.join(", ");
    }

    // Lowercase Errors
    if (
      Array.isArray(data?.errors) &&
      data.errors.length > 0
    ) {
      message = data.errors.join(", ");
    }

    throw new Error(message);
  }

  // ===================================================
  // RETURN DATA
  //
  // Backend APIResponse:
  //
  // {
  //   Data: ...
  // }
  //
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

  // Support lowercase data too
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
// CREATE NOTICE
//
// POST
// /api/Notice/CreateNotice
//
// Backend:
//
// [HttpPost]
// [Route("CreateNotice")]
//
// [Authorize(
//   Roles = "Super Admin,Admin,Operator"
// )]
//
// DTO:
//
// CreateNoticeDTO
//
// {
//   Title
//   Description
//   PdfFile
// }
// =====================================================

export const createNotice = async ({
  title,
  description,
  pdfFile,
}) => {

  // ===================================================
  // TOKEN
  // ===================================================

  checkToken();

  // ===================================================
  // TITLE
  // ===================================================

  if (!title || !title.trim()) {
    throw new Error(
      "Notice title is required."
    );
  }

  // ===================================================
  // DESCRIPTION
  // ===================================================

  if (!description || !description.trim()) {
    throw new Error(
      "Notice description is required."
    );
  }

  // ===================================================
  // PDF
  // ===================================================

  if (!pdfFile) {
    throw new Error(
      "PDF file is required."
    );
  }

  // ===================================================
  // PDF FILE NAME
  // ===================================================

  const fileName = pdfFile.name || "";

  // ===================================================
  // PDF TYPE
  // ===================================================

  const isPdf =
    pdfFile.type === "application/pdf" ||
    fileName
      .toLowerCase()
      .endsWith(".pdf");

  if (!isPdf) {
    throw new Error(
      "Only PDF files are allowed."
    );
  }

  // ===================================================
  // MAXIMUM FILE SIZE
  //
  // Backend:
  // 10 MB
  // ===================================================

  const maxFileSize =
    10 * 1024 * 1024;

  if (pdfFile.size > maxFileSize) {
    throw new Error(
      "PDF file size cannot exceed 10 MB."
    );
  }

  // ===================================================
  // FORM DATA
  // ===================================================

  const formData = new FormData();

  formData.append(
    "Title",
    title.trim()
  );

  formData.append(
    "Description",
    description.trim()
  );

  formData.append(
    "PdfFile",
    pdfFile
  );

  // ===================================================
  // REQUEST
  // ===================================================

  const response = await fetch(
    `${API_URL}Notice/CreateNotice`,
    {
      method: "POST",

      headers:
        getFormDataHeaders(),

      // IMPORTANT:
      // Do NOT set Content-Type manually.
      body: formData,
    }
  );

  return handleResponse(response);
};

// =====================================================
// GET NON-PUBLISHED NOTICES
//
// GET
// /api/Notice/GetNonPublished
//
// Roles:
// Super Admin
// Admin
// Operator
// =====================================================

export const getNonPublishedNotices =
  async () => {

    checkToken();

    const response = await fetch(
      `${API_URL}Notice/GetNonPublished`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  };

// =====================================================
// GET NON-PUBLISHED NOTICE BY ID
//
// GET
// /api/Notice/GetNonPublishedById/{id}
//
// Roles:
// Super Admin
// Admin
// Operator
// =====================================================

export const getNonPublishedNoticeById =
  async (id) => {

    checkToken();

    // =================================================
    // ID VALIDATION
    // =================================================

    if (
      id === null ||
      id === undefined ||
      String(id).trim() === ""
    ) {
      throw new Error(
        "Notice ID is required."
      );
    }

    const cleanId =
      String(id).trim();

    // =================================================
    // REQUEST
    // =================================================

    const response = await fetch(
      `${API_URL}Notice/GetNonPublishedById/${encodeURIComponent(
        cleanId
      )}`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  };

// =====================================================
// PUBLISH NOTICE
//
// PUT
// /api/Notice/Publish/{id}
//
// Roles:
// Super Admin
// Admin
// Operator
// =====================================================

export const publishNotice =
  async (id) => {

    checkToken();

    // =================================================
    // ID VALIDATION
    // =================================================

    if (
      id === null ||
      id === undefined ||
      String(id).trim() === ""
    ) {
      throw new Error(
        "Notice ID is required for publishing."
      );
    }

    const cleanId =
      String(id).trim();

    // =================================================
    // REQUEST
    // =================================================

    const response = await fetch(
      `${API_URL}Notice/Publish/${encodeURIComponent(
        cleanId
      )}`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  };

// =====================================================
// GET ALL PUBLISHED NOTICES
//
// GET
// /api/Notice/GetAllPublished
//
// Backend:
// [AllowAnonymous]
//
// Therefore NO TOKEN required.
// =====================================================

export const getAllPublishedNotices =
  async () => {

    const response = await fetch(
      `${API_URL}Notice/GetAllPublished`,
      {
        method: "GET",
      }
    );

    return handleResponse(response);
  };

// =====================================================
// GET NON-PUBLISHED NOTICE DROPDOWN
//
// GET
// /api/Notice/GetNonPublishedDropdown
//
// Roles:
// Super Admin
// Admin
// Operator
// =====================================================

export const getNonPublishedNoticeDropdown =
  async () => {

    checkToken();

    const response = await fetch(
      `${API_URL}Notice/GetNonPublishedDropdown`,
      {
        method: "GET",
        headers: getHeaders(),
      }
    );

    return handleResponse(response);
  };

