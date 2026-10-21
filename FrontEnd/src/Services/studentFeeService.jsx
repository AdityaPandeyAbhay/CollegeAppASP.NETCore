// =====================================================
// STUDENT FEE SERVICE
// =====================================================

import { getToken } from "../Utils/auth";

import {
  getStudentDepartmentDropdown,
  getStudentClassDropdown,
  getStudentSectionDropdown,
  getStudentDropdown,
} from "./studentService";

import {
  getFeeStructureDropdown,
  getAllFeeStructures,
} from "./feeStructureService";

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
// CHECK TOKEN
// =====================================================

const checkToken = () => {
  const token = getToken();

  if (!token) {
    throw new Error("Authentication token not found. Please login again.");
  }

  return token;
};

// =====================================================
// PARSE STUDENT FEE ERROR MESSAGE
// =====================================================

export const parseStudentFeeErrorMessage = (error) => {
  if (!error) return "An unexpected error occurred.";

  const raw =
    typeof error === "string"
      ? error
      : error?.message || error?.Error || error?.error || String(error);

  if (raw.includes("Object reference not set")) {
    return "Required student or fee structure relationship details are missing. Please make sure the student and fee structure are selected correctly.";
  }

  if (raw.includes("Fee already assigned")) {
    return "This fee structure has already been assigned to the selected student.";
  }

  if (raw.includes("Student not found")) {
    return "The selected student was not found. Please refresh and select an active student.";
  }

  if (raw.includes("Fee Structure not found")) {
    return "The selected fee structure was not found. Please refresh and select an active fee structure.";
  }

  return raw;
};

// =====================================================
// HANDLE RESPONSE
// =====================================================

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);

  // ===================================================
  // 401
  // ===================================================

  if (response.status === 401) {
    throw new Error(
      data?.Message ||
        data?.message ||
        "Unauthorized (401). Please login again.",
    );
  }

  // ===================================================
  // 403
  // ===================================================

  if (response.status === 403) {
    throw new Error(
      data?.Message ||
        data?.message ||
        "Access denied (403). You do not have permission.",
    );
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
      "Student Fee record not found.";

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

    // APIResponse Errors
    if (!message && Array.isArray(data?.Errors) && data.Errors.length > 0) {
      message = data.Errors.join(", ");
    }

    if (!message && Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join(", ");
    }

    // ModelState errors
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
      message = `Request failed with status ${response.status}.`;
    }

    throw new Error(message);
  }

  // ===================================================
  // API RESPONSE FAILURE
  // ===================================================

  if (data && (data.Status === false || data.status === false)) {
    let message =
      data?.Message || data?.message || "Student Fee request failed.";

    if (Array.isArray(data?.Errors) && data.Errors.length > 0) {
      message = data.Errors.join(", ");
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join(", ");
    }

    throw new Error(message);
  }

  // ===================================================
  // UNWRAP DATA
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
// NORMALIZE STUDENT FEE
// =====================================================

export const normalizeStudentFee = (item) => {
  if (!item || typeof item !== "object") {
    return item;
  }

  return {
    Id: item.Id ?? item.id ?? null,

    StudentId: item.StudentId ?? item.studentId ?? null,

    StudentName:
      item.StudentName ??
      item.studentName ??
      item.Student?.StudentName ??
      item.student?.studentName ??
      "",

    FeeStructureId: item.FeeStructureId ?? item.feeStructureId ?? null,

    InvoiceNo: item.InvoiceNo ?? item.invoiceNo ?? "",

    Amount: item.Amount ?? item.amount ?? 0,

    Discount: item.Discount ?? item.discount ?? 0,

    Fine: item.Fine ?? item.fine ?? 0,

    TotalAmount: item.TotalAmount ?? item.totalAmount ?? 0,

    PaidAmount: item.PaidAmount ?? item.paidAmount ?? 0,

    BalanceAmount: item.BalanceAmount ?? item.balanceAmount ?? 0,

    DueDate: item.DueDate ?? item.dueDate ?? null,

    Status: item.Status ?? item.status ?? "",
  };
};

// =====================================================
// NORMALIZE LIST
// =====================================================

const normalizeStudentFeeList = (data) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeStudentFee);
};

// =====================================================
// GET ALL STUDENT FEES
//
// GET
// /api/StudentFee/GetAllStudentFees
// =====================================================

export const getAllStudentFees = async () => {
  checkToken();

  const response = await fetch(`${API_URL}StudentFee/GetAllStudentFees`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  return normalizeStudentFeeList(data);
};

// =====================================================
// GET STUDENT FEE BY ID
//
// GET
// /api/StudentFee/GetStudentFeeById/{id}
// =====================================================

export const getStudentFeeById = async (id) => {
  checkToken();

  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error("Student Fee ID is required.");
  }

  const response = await fetch(
    `${API_URL}StudentFee/GetStudentFeeById/${encodeURIComponent(
      String(id).trim(),
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  return normalizeStudentFee(data);
};

// =====================================================
// GET STUDENT FEE BY STUDENT ID
//
// GET
// /api/StudentFee/GetStudentFeeByStudentId/{studentId}
// =====================================================

export const getStudentFeeByStudentId = async (studentId) => {
  checkToken();

  if (
    studentId === undefined ||
    studentId === null ||
    String(studentId).trim() === ""
  ) {
    throw new Error("Student ID is required.");
  }

  const response = await fetch(
    `${API_URL}StudentFee/GetStudentFeeByStudentId/${encodeURIComponent(
      String(studentId).trim(),
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  return normalizeStudentFeeList(data);
};

// =====================================================
// GET STUDENT FEE BY STUDENT NAME
//
// GET
// /api/StudentFee/GetStudentFeeByStudentName/{studentName}
// =====================================================

export const getStudentFeeByStudentName = async (studentName) => {
  checkToken();

  if (!studentName || !String(studentName).trim()) {
    throw new Error("Student name is required.");
  }

  const response = await fetch(
    `${API_URL}StudentFee/GetStudentFeeByStudentName/${encodeURIComponent(
      String(studentName).trim(),
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  return normalizeStudentFeeList(data);
};

// =====================================================
// CREATE STUDENT FEE
//
// POST
// /api/StudentFee/CreateStudentFee
// =====================================================

export const createStudentFee = async (studentFeeData) => {
  checkToken();

  if (!studentFeeData) {
    throw new Error("Student Fee data is required.");
  }

  const studentId = Number(
    studentFeeData.StudentId ?? studentFeeData.studentId,
  );

  const feeStructureId = Number(
    studentFeeData.FeeStructureId ?? studentFeeData.feeStructureId,
  );

  const discount = Number(
    studentFeeData.Discount ?? studentFeeData.discount ?? 0,
  );

  const fine = Number(studentFeeData.Fine ?? studentFeeData.fine ?? 0);

  const paidAmount = Number(
    studentFeeData.PaidAmount ?? studentFeeData.paidAmount ?? 0,
  );

  const dueDate = studentFeeData.DueDate ?? studentFeeData.dueDate;

  // ===================================================
  // VALIDATION
  // ===================================================

  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new Error("Student is required.");
  }

  if (!Number.isInteger(feeStructureId) || feeStructureId <= 0) {
    throw new Error("Fee Structure is required.");
  }

  if (!Number.isFinite(discount) || discount < 0) {
    throw new Error("Discount cannot be negative.");
  }

  if (!Number.isFinite(fine) || fine < 0) {
    throw new Error("Fine cannot be negative.");
  }

  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    throw new Error("Paid Amount cannot be negative.");
  }

  if (!dueDate) {
    throw new Error("Due Date is required.");
  }

  // ===================================================
  // PAYLOAD
  // ===================================================

  const payload = {
    StudentId: studentId,

    FeeStructureId: feeStructureId,

    Discount: discount,

    Fine: fine,

    PaidAmount: paidAmount,

    DueDate: dueDate,
  };

  console.log("Create Student Fee Payload:", payload);

  // ===================================================
  // API CALL
  // ===================================================

  const response = await fetch(`${API_URL}StudentFee/CreateStudentFee`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await handleResponse(response);

  return normalizeStudentFee(data);
};

// =====================================================
// CREATE MULTIPLE STUDENT FEES
// =====================================================

export const createMultipleStudentFees = async (studentFeeList) => {
  if (!Array.isArray(studentFeeList) || studentFeeList.length === 0) {
    throw new Error("At least one Student Fee record is required.");
  }

  const results = [];
  const errors = [];

  for (let i = 0; i < studentFeeList.length; i++) {
    const item = studentFeeList[i];
    try {
      const res = await createStudentFee(item);
      results.push(res);
    } catch (err) {
      errors.push({
        feeStructureId: item.FeeStructureId,
        feeStructureName:
          item.FeeStructureName || `Fee #${item.FeeStructureId}`,
        error: err.message,
      });
    }
  }

  return {
    results,
    errors,
  };
};

// =====================================================
// UPDATE STUDENT FEE
//
// PUT
// /api/StudentFee/UpdateStudentFee/{id}
// =====================================================

export const updateStudentFee = async (id, studentFeeData) => {
  checkToken();

  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error("Student Fee ID is required.");
  }

  if (!studentFeeData) {
    throw new Error("Student Fee data is required.");
  }

  const studentId = Number(
    studentFeeData.StudentId ?? studentFeeData.studentId,
  );

  const feeStructureId = Number(
    studentFeeData.FeeStructureId ?? studentFeeData.feeStructureId,
  );

  const discount = Number(
    studentFeeData.Discount ?? studentFeeData.discount ?? 0,
  );

  const fine = Number(studentFeeData.Fine ?? studentFeeData.fine ?? 0);

  const paidAmount = Number(
    studentFeeData.PaidAmount ?? studentFeeData.paidAmount ?? 0,
  );

  const dueDate = studentFeeData.DueDate ?? studentFeeData.dueDate;

  // ===================================================
  // VALIDATION
  // ===================================================

  if (!Number.isInteger(studentId) || studentId <= 0) {
    throw new Error("Student is required.");
  }

  if (!Number.isInteger(feeStructureId) || feeStructureId <= 0) {
    throw new Error("Fee Structure is required.");
  }

  if (!Number.isFinite(discount) || discount < 0) {
    throw new Error("Discount cannot be negative.");
  }

  if (!Number.isFinite(fine) || fine < 0) {
    throw new Error("Fine cannot be negative.");
  }

  if (!Number.isFinite(paidAmount) || paidAmount < 0) {
    throw new Error("Paid Amount cannot be negative.");
  }

  if (!dueDate) {
    throw new Error("Due Date is required.");
  }

  const payload = {
    StudentId: studentId,

    FeeStructureId: feeStructureId,

    Discount: discount,

    Fine: fine,

    PaidAmount: paidAmount,

    DueDate: dueDate,
  };

  const response = await fetch(
    `${API_URL}StudentFee/UpdateStudentFee/${encodeURIComponent(
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
// DELETE STUDENT FEE
//
// DELETE
// /api/StudentFee/DeleteStudentFee/{id}
// =====================================================

export const deleteStudentFee = async (id) => {
  checkToken();

  if (id === undefined || id === null || String(id).trim() === "") {
    throw new Error("Student Fee ID is required.");
  }

  const response = await fetch(
    `${API_URL}StudentFee/DeleteStudentFee/${encodeURIComponent(
      String(id).trim(),
    )}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );

  return handleResponse(response);
};

// =====================================================
// STUDENT FEE DROPDOWN
//
// GET
// /api/StudentFee/Dropdown
// =====================================================

export const getStudentFeeDropdown = async () => {
  checkToken();

  const response = await fetch(`${API_URL}StudentFee/Dropdown`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  return Array.isArray(data)
    ? data.map((item) => ({
        id: item.id ?? item.Id ?? null,

        text:
          item.displayName ?? item.DisplayName ?? item.name ?? item.Name ?? "",
      }))
    : [];
};

// =====================================================
// GET STUDENT DROPDOWN FOR STUDENT FEE
//
// Cascading:
// Department -> Class -> Section -> Student
// =====================================================

export const getStudentFeeStudentDropdown = async (
  departmentId,
  classId,
  sectionId,
) => {
  if (!departmentId || !classId || !sectionId) {
    return [];
  }

  try {
    const data = await getStudentDropdown(departmentId, classId, sectionId);

    return Array.isArray(data)
      ? data.map((item) => ({
          id: item.id ?? item.Id ?? item.studentId ?? item.StudentId,

          text:
            item.text ??
            item.Text ??
            item.name ??
            item.Name ??
            `${item.firstName ?? item.FirstName ?? ""} ${
              item.lastName ?? item.LastName ?? ""
            }`.trim(),

          firstName: item.firstName ?? item.FirstName ?? "",

          lastName: item.lastName ?? item.LastName ?? "",

          admissionNumber: item.admissionNumber ?? item.AdmissionNumber ?? "",
        }))
      : [];
  } catch (error) {
    throw error;
  }
};

// =====================================================
// GET FEE STRUCTURE DROPDOWN
// =====================================================

export const getStudentFeeStructureDropdown = async () => {
  try {
    const data = await getFeeStructureDropdown();

    if (Array.isArray(data) && data.length > 0) {
      return data.map((item) => ({
        id: item.id ?? item.Id ?? null,

        text: item.text ?? item.Text ?? item.name ?? item.Name ?? "",

        amount: item.amount ?? item.Amount ?? null,
      }));
    }
  } catch (err) {
    console.warn("getFeeStructureDropdown failed, using fallback:", err);
  }

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
// GET DEPARTMENT DROPDOWN
// =====================================================

export const getStudentFeeDepartmentDropdown = async () => {
  return await getStudentDepartmentDropdown();
};

// =====================================================
// GET CLASS DROPDOWN
// =====================================================

export const getStudentFeeClassDropdown = async (departmentId) => {
  return await getStudentClassDropdown(departmentId);
};

// =====================================================
// GET SECTION DROPDOWN
// =====================================================

export const getStudentFeeSectionDropdown = async (classId) => {
  return await getStudentSectionDropdown(classId);
};
