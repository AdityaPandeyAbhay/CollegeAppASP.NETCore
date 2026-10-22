// =====================================================
// SOFT DELETED TEACHERS REGISTRY & HELPERS
// =====================================================
const SOFT_DELETED_TEACHERS_KEY = "school_soft_deleted_teachers_v1";

export const getSoftDeletedTeachersMap = () => {
  try {
    const raw = localStorage.getItem(SOFT_DELETED_TEACHERS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
};

export const isTeacherSoftDeleted = (teacherOrCode) => {
  if (!teacherOrCode) return false;
  try {
    const map = getSoftDeletedTeachersMap();
    if (typeof teacherOrCode === "object") {
      const code = (
        teacherOrCode.TeacherCode ||
        teacherOrCode.teacherCode ||
        ""
      )
        .toString()
        .trim()
        .toLowerCase();
      const id = teacherOrCode.Id ?? teacherOrCode.id;
      if (code && map[code]) return true;
      if (id && map[String(id)]) return true;
      if (teacherOrCode.isDeleted || teacherOrCode.IsDeleted) return true;
      return false;
    }
    const clean = String(teacherOrCode).trim().toLowerCase();
    return Boolean(map[clean] || map[String(teacherOrCode).trim()]);
  } catch (_) {
    return false;
  }
};

export const softDeleteTeacher = (teacherOrCode, teacherObj = null) => {
  if (!teacherOrCode && !teacherObj) return;
  try {
    const map = getSoftDeletedTeachersMap();
    const code = (
      teacherObj?.TeacherCode ||
      teacherObj?.teacherCode ||
      (typeof teacherOrCode === "string" ? teacherOrCode : "")
    )
      .toString()
      .trim();
    const id =
      teacherObj?.Id ??
      teacherObj?.id ??
      (typeof teacherOrCode !== "object" && !isNaN(teacherOrCode)
        ? String(teacherOrCode).trim()
        : null);
    const name = [
      teacherObj?.FirstName,
      teacherObj?.MiddleName,
      teacherObj?.LastName,
    ]
      .filter(Boolean)
      .join(" ");

    const record = {
      code: code || null,
      id: id || null,
      name: name || `Teacher ${code || id}`,
      deletedAt: new Date().toISOString(),
      isDeleted: true,
    };

    if (code) {
      map[code] = record;
      map[code.toLowerCase()] = record;
    }
    if (id) {
      map[String(id)] = record;
    }
    if (teacherOrCode && typeof teacherOrCode !== "object") {
      map[String(teacherOrCode).trim()] = record;
      map[String(teacherOrCode).trim().toLowerCase()] = record;
    }

    localStorage.setItem(SOFT_DELETED_TEACHERS_KEY, JSON.stringify(map));
    return record;
  } catch (e) {
    console.warn("Could not record soft deleted teacher:", e);
  }
};

export const restoreTeacher = (teacherOrCode) => {
  if (!teacherOrCode) return;
  try {
    const map = getSoftDeletedTeachersMap();
    if (typeof teacherOrCode === "object") {
      const code = (
        teacherOrCode.TeacherCode ||
        teacherOrCode.teacherCode ||
        ""
      )
        .toString()
        .trim()
        .toLowerCase();
      const id = teacherOrCode.Id ?? teacherOrCode.id;
      if (code) {
        delete map[code];
        delete map[code.toLowerCase()];
      }
      if (id) {
        delete map[String(id)];
      }
    } else {
      const clean = String(teacherOrCode).trim().toLowerCase();
      delete map[clean];
      delete map[String(teacherOrCode).trim()];
    }
    localStorage.setItem(SOFT_DELETED_TEACHERS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Could not restore teacher:", e);
  }
};

// =====================================================
// TEACHER EXTRA FIELDS PERSISTENCE (Photo, Father, Mother, Education PDF)
// =====================================================
const TEACHER_EXTRA_FIELDS_KEY = "school_teacher_extra_fields_map";

export const getStoredTeacherExtraMap = () => {
  try {
    const raw = localStorage.getItem(TEACHER_EXTRA_FIELDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
};

export const saveTeacherExtraFields = (identifier, data) => {
  if (!identifier || !data) return;
  try {
    const map = getStoredTeacherExtraMap();
    const cleanId = String(identifier).trim();
    const existing = map[cleanId] || map[cleanId.toLowerCase()] || {};

    const merged = {
      ...existing,
      userId:
        data.userId !== undefined
          ? data.userId
          : data.UserId !== undefined
            ? data.UserId
            : existing.userId,
      UserId:
        data.userId !== undefined
          ? data.userId
          : data.UserId !== undefined
            ? data.UserId
            : existing.userId,
      photo:
        data.photo !== undefined
          ? data.photo
          : data.Photo !== undefined
            ? data.Photo
            : existing.photo,
      fatherName:
        data.fatherName !== undefined
          ? data.fatherName
          : data.FatherName !== undefined
            ? data.FatherName
            : existing.fatherName,
      motherName:
        data.motherName !== undefined
          ? data.motherName
          : data.MotherName !== undefined
            ? data.MotherName
            : existing.motherName,
      educationPdf:
        data.educationPdf !== undefined
          ? data.educationPdf
          : data.EducationPdf !== undefined
            ? data.EducationPdf
            : existing.educationPdf,
      educationFileName:
        data.educationFileName !== undefined
          ? data.educationFileName
          : data.EducationFileName !== undefined
            ? data.EducationFileName
            : existing.educationFileName,
      DepartmentIds:
        data.DepartmentIds ??
        data.departmentIds ??
        existing.DepartmentIds ??
        existing.departmentIds ??
        (data.DepartmentId ? [data.DepartmentId] : data.departmentId ? [data.departmentId] : existing.DepartmentId ? [existing.DepartmentId] : []),
      departmentIds:
        data.departmentIds ??
        data.DepartmentIds ??
        existing.departmentIds ??
        existing.DepartmentIds ??
        (data.DepartmentId ? [data.DepartmentId] : data.departmentId ? [data.departmentId] : existing.DepartmentId ? [existing.DepartmentId] : []),
      SubjectIds:
        data.SubjectIds ??
        data.subjectIds ??
        existing.SubjectIds ??
        existing.subjectIds ??
        (data.SubjectId ? [data.SubjectId] : data.subjectId ? [data.subjectId] : existing.SubjectId ? [existing.SubjectId] : []),
      subjectIds:
        data.subjectIds ??
        data.SubjectIds ??
        existing.subjectIds ??
        existing.SubjectIds ??
        (data.SubjectId ? [data.SubjectId] : data.subjectId ? [data.subjectId] : existing.SubjectId ? [existing.SubjectId] : []),
    };

    map[cleanId] = merged;
    map[cleanId.toLowerCase()] = merged;
    if (data.TeacherCode || data.teacherCode) {
      const code = String(data.TeacherCode || data.teacherCode).trim();
      map[code] = merged;
      map[code.toLowerCase()] = merged;
    }
    if (data.Id || data.id) {
      map[String(data.Id || data.id).trim()] = merged;
    }

    localStorage.setItem(TEACHER_EXTRA_FIELDS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Could not save teacher extra fields:", e);
  }
};

export const getSavedTeacherExtraFields = (identifier) => {
  if (!identifier) return {};
  try {
    const map = getStoredTeacherExtraMap();
    const cleanId = String(identifier).trim();
    return map[cleanId] || map[cleanId.toLowerCase()] || {};
  } catch (_) {
    return {};
  }
};
// =====================================================
// TEACHER SERVICE
// =====================================================

import { getToken } from "../Utils/auth";

// =====================================================
// BASE API URL
// =====================================================

const API_URL = "/api/";

// =====================================================
// COMMON JSON HEADERS
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
    throw new Error("Authentication token not found. Please login again.");
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
  // 401
  // ===================================================

  if (response.status === 401) {
    throw new Error(
      "Unauthorized (401). Your login session may have expired. Please login again.",
    );
  }

  // ===================================================
  // 403
  // ===================================================

  if (response.status === 403) {
    throw new Error(
      "Access denied (403). You do not have permission to perform this operation.",
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
      "Teacher record not found.";

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
    let message = null;

    if (Array.isArray(data?.Errors) && data.Errors.length > 0) {
      message = data.Errors.join(", ");
    }

    if (!message && Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join(", ");
    }

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

    // ASP.NET validation errors
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

    if (
      typeof message === "string" &&
      (message.includes("saving the entity changes") ||
        message.includes("inner exception"))
    ) {
      message =
        "Database save failed: Please ensure the Teacher Code (max 20 chars) and Email are unique and not already assigned to another teacher.";
    }

    throw new Error(message);
  }

  // ===================================================
  // API RESPONSE FAILURE
  // ===================================================

  if (data && (data.Status === false || data.status === false)) {
    let message = data?.Message || data?.message || "Request failed.";

    if (Array.isArray(data?.Errors) && data.Errors.length > 0) {
      message = data.Errors.join(", ");
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join(", ");
    }

    if (
      typeof message === "string" &&
      (message.includes("saving the entity changes") ||
        message.includes("inner exception"))
    ) {
      message =
        "Database save failed: Please ensure the Teacher Code (max 20 chars) and Email are unique and not already assigned to another teacher.";
    }

    throw new Error(message);
  }

  // ===================================================
  // RETURN Data
  // ===================================================

  if (data && Object.prototype.hasOwnProperty.call(data, "Data")) {
    return data.Data;
  }

  // ===================================================
  // LOWERCASE data
  // ===================================================

  if (data && Object.prototype.hasOwnProperty.call(data, "data")) {
    return data.data;
  }

  return data;
};

// =====================================================
// CREATE TEACHER
//
// IMPORTANT:
// DO NOT CHANGE THIS METHOD.
// YOUR CREATE TEACHER IS WORKING.
// =====================================================

export const createTeacher = async (teacherData) => {
  checkToken();

  if (!teacherData) {
    throw new Error("Teacher data is required.");
  }

  if (!teacherData.UserId) {
    throw new Error("User is required.");
  }

  if (
    teacherData.DepartmentId === null ||
    teacherData.DepartmentId === undefined ||
    String(teacherData.DepartmentId).trim() === ""
  ) {
    throw new Error("Department is required.");
  }

  if (!teacherData.TeacherCode?.trim()) {
    throw new Error("Teacher code is required.");
  }

  if (!teacherData.FirstName?.trim()) {
    throw new Error("First name is required.");
  }

  if (!teacherData.LastName?.trim()) {
    throw new Error("Last name is required.");
  }

  if (!teacherData.DateOfBirth) {
    throw new Error("Date of birth is required.");
  }

  if (!teacherData.Gender?.trim()) {
    throw new Error("Gender is required.");
  }

  if (!teacherData.Email?.trim()) {
    throw new Error("Email is required.");
  }

  if (!teacherData.PhoneNumber?.trim()) {
    throw new Error("Phone number is required.");
  }

  if (!teacherData.Qualification?.trim()) {
    throw new Error("Qualification is required.");
  }

  if (!teacherData.JoiningDate) {
    throw new Error("Joining date is required.");
  }

  // ===================================================
  // CONVERT DEPARTMENT ID
  // ===================================================

  const departmentId = Number(teacherData.DepartmentId);

  if (!Number.isInteger(departmentId) || departmentId <= 0) {
    throw new Error("Invalid Department ID.");
  }

  // ===================================================
  // FINAL PAYLOAD
  // ===================================================

  const payload = {
    UserId: String(teacherData.UserId).trim(),

    DepartmentId: departmentId,

    TeacherCode: String(teacherData.TeacherCode).trim().slice(0, 20),

    FirstName: String(teacherData.FirstName).trim().slice(0, 100),

    MiddleName: teacherData.MiddleName?.trim() ? String(teacherData.MiddleName).trim().slice(0, 100) : null,

    LastName: String(teacherData.LastName).trim().slice(0, 100),

    DateOfBirth: teacherData.DateOfBirth,

    Gender: String(teacherData.Gender).trim().slice(0, 20),

    Email: String(teacherData.Email).trim().slice(0, 250),

    PhoneNumber: String(teacherData.PhoneNumber).trim().slice(0, 15),

    AlternatePhoneNumber: teacherData.AlternatePhoneNumber?.trim()
      ? String(teacherData.AlternatePhoneNumber).trim().slice(0, 15)
      : null,

    Address: teacherData.Address?.trim()
      ? String(teacherData.Address).trim().slice(0, 500)
      : null,

    Qualification: String(teacherData.Qualification).trim().slice(0, 200),

    Experience:
      teacherData.Experience === "" ||
      teacherData.Experience === null ||
      teacherData.Experience === undefined
        ? 0
        : Number(teacherData.Experience),

    JoiningDate: teacherData.JoiningDate,

    Salary:
      teacherData.Salary === "" ||
      teacherData.Salary === null ||
      teacherData.Salary === undefined
        ? 0
        : Number(teacherData.Salary),

    IsClassTeacher: Boolean(teacherData.IsClassTeacher),

    FatherName: teacherData.FatherName?.trim()
      ? String(teacherData.FatherName).trim().slice(0, 100)
      : null,

    MotherName: teacherData.MotherName?.trim()
      ? String(teacherData.MotherName).trim().slice(0, 100)
      : null,

    Photo: teacherData.Photo || null,

    EducationPdf: teacherData.EducationPdf || null,

    EducationFileName: teacherData.EducationFileName?.trim()
      ? String(teacherData.EducationFileName).trim().slice(0, 200)
      : null,

    DepartmentIds: Array.isArray(teacherData.DepartmentIds)
      ? teacherData.DepartmentIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : [departmentId],

    DepartmentNames: Array.isArray(teacherData.DepartmentNames)
      ? teacherData.DepartmentNames.join(", ")
      : teacherData.DepartmentNames || null,

    SubjectId:
      teacherData.SubjectId !== undefined &&
      teacherData.SubjectId !== null &&
      teacherData.SubjectId !== ""
        ? Number(teacherData.SubjectId)
        : Array.isArray(teacherData.SubjectIds) && teacherData.SubjectIds.length > 0
          ? Number(teacherData.SubjectIds[0])
          : null,

    SubjectIds: Array.isArray(teacherData.SubjectIds)
      ? teacherData.SubjectIds.join(",")
      : typeof teacherData.SubjectIds === "string"
        ? teacherData.SubjectIds
        : Array.isArray(teacherData.SubjectIdList)
          ? teacherData.SubjectIdList.join(",")
          : teacherData.SubjectId ? String(teacherData.SubjectId) : null,

    SubjectNames: Array.isArray(teacherData.SubjectNames)
      ? teacherData.SubjectNames.join(", ")
      : teacherData.SubjectNames || null,

    SubjectIdList: Array.isArray(teacherData.SubjectIds)
      ? teacherData.SubjectIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : Array.isArray(teacherData.SubjectIdList)
        ? teacherData.SubjectIdList.map(Number).filter((n) => !isNaN(n) && n > 0)
        : teacherData.SubjectId ? [Number(teacherData.SubjectId)] : null,
  };

  if (teacherData.TeacherCode) {
    saveTeacherExtraFields(teacherData.TeacherCode, teacherData);
  }
  if (teacherData.UserId) {
    saveTeacherExtraFields(teacherData.UserId, teacherData);
  }

  // ===================================================
  // DEBUG
  // ===================================================

  console.log("Teacher API Payload:", payload);

  // ===================================================
  // API REQUEST
  // ===================================================

  const response = await fetch(`${API_URL}Teacher/CreateTeacher`, {
    method: "POST",

    headers: getHeaders(),

    body: JSON.stringify(payload),
  });

  const dropdownData = await handleResponse(response);
  const resObj = dropdownData && typeof dropdownData === "object" ? dropdownData : {};
  const savedKey = resObj.Id || resObj.id || resObj.TeacherCode || resObj.teacherCode || teacherData.TeacherCode || teacherData.UserId;
  saveTeacherExtraFields(savedKey, { ...teacherData, ...resObj });
  if (resObj.Id || resObj.id) {
    saveTeacherExtraFields(resObj.Id || resObj.id, { ...teacherData, ...resObj });
  }
  if (resObj.TeacherCode || resObj.teacherCode) {
    saveTeacherExtraFields(resObj.TeacherCode || resObj.teacherCode, { ...teacherData, ...resObj });
  }
  if (teacherData.UserId) {
    saveTeacherExtraFields(teacherData.UserId, { ...teacherData, ...resObj });
  }

  if (Array.isArray(dropdownData)) {
    return dropdownData.filter(
      (item) =>
        !isTeacherSoftDeleted(
          item.code || item.Code || item.id || item.Id || item,
        ),
    );
  }
  return dropdownData;
};

// =====================================================
// NORMALIZE TEACHER OBJECT
//
// Supports BOTH:
//
// PascalCase:
// TeacherCode
//
// camelCase:
// teacherCode
//
// This fixes empty columns without changing
// backend or createTeacher().
// =====================================================

const normalizeTeacher = (teacher) => {
  if (!teacher || typeof teacher !== "object") {
    return teacher;
  }

  const teacherCode = teacher.TeacherCode ?? teacher.teacherCode ?? "";
  const teacherId = teacher.Id ?? teacher.id;
  const extraFields = {
    ...getSavedTeacherExtraFields(teacherCode),
    ...getSavedTeacherExtraFields(teacherId),
  };

  const fName = teacher.FirstName ?? teacher.firstName ?? "";
  const mName = teacher.MiddleName ?? teacher.middleName ?? "";
  const lName = teacher.LastName ?? teacher.lastName ?? "";
  const computedFullName = [fName, mName, lName]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean)
    .join(" ");

  const resolvedName =
    (teacher.TeacherName && String(teacher.TeacherName).trim()) ||
    (teacher.teacherName && String(teacher.teacherName).trim()) ||
    (teacher.FullName && String(teacher.FullName).trim()) ||
    (teacher.fullName && String(teacher.fullName).trim()) ||
    (teacher.name && String(teacher.name).trim()) ||
    (teacher.Name && String(teacher.Name).trim()) ||
    (teacher.text && String(teacher.text).trim()) ||
    computedFullName ||
    (teacherCode ? `Teacher ${teacherCode}` : "Faculty Member");

  return {
    Id: teacher.Id ?? teacher.id ?? null,

    UserId:
      teacher.UserId ??
      teacher.userId ??
      extraFields.userId ??
      extraFields.UserId ??
      null,

    DepartmentId: teacher.DepartmentId ?? teacher.departmentId ?? null,

    DepartmentName:
      teacher.DepartmentName ??
      teacher.departmentName ??
      teacher.Department?.DepartmentName ??
      teacher.department?.departmentName ??
      teacher.Department?.Name ??
      teacher.department?.name ??
      "",

    TeacherCode: teacherCode,

    TeacherName: resolvedName,
    teacherName: resolvedName,
    FullName: resolvedName,
    fullName: resolvedName,
    name: resolvedName,
    Name: resolvedName,

    FirstName: fName,

    MiddleName: mName,

    LastName: lName,

    DateOfBirth: teacher.DateOfBirth ?? teacher.dateOfBirth ?? null,

    Gender: teacher.Gender ?? teacher.gender ?? "",

    Email: teacher.Email ?? teacher.email ?? "",

    PhoneNumber: teacher.PhoneNumber ?? teacher.phoneNumber ?? "",

    AlternatePhoneNumber:
      teacher.AlternatePhoneNumber ?? teacher.alternatePhoneNumber ?? "",

    Address: teacher.Address ?? teacher.address ?? "",

    Qualification: teacher.Qualification ?? teacher.qualification ?? "",

    Experience: teacher.Experience ?? teacher.experience ?? 0,

    JoiningDate: teacher.JoiningDate ?? teacher.joiningDate ?? null,

    Salary: teacher.Salary ?? teacher.salary ?? 0,

    IsClassTeacher: teacher.IsClassTeacher ?? teacher.isClassTeacher ?? false,

    IsActive: isTeacherSoftDeleted(teacher)
      ? false
      : (teacher.IsActive ?? teacher.isActive ?? true),

    CreatedBy: teacher.CreatedBy ?? teacher.createdBy ?? null,

    CreatedDate: teacher.CreatedDate ?? teacher.createdDate ?? null,

    UpdatedBy: teacher.UpdatedBy ?? teacher.updatedBy ?? null,

    UpdatedDate: teacher.UpdatedDate ?? teacher.updatedDate ?? null,

    Photo:
      teacher.Photo ??
      teacher.photo ??
      getSavedTeacherExtraFields(teacher.TeacherCode ?? teacher.teacherCode)
        .photo ??
      getSavedTeacherExtraFields(teacher.Id ?? teacher.id).photo ??
      null,

    FatherName:
      teacher.FatherName ??
      teacher.fatherName ??
      getSavedTeacherExtraFields(teacher.TeacherCode ?? teacher.teacherCode)
        .fatherName ??
      getSavedTeacherExtraFields(teacher.Id ?? teacher.id).fatherName ??
      "",

    MotherName:
      teacher.MotherName ??
      teacher.motherName ??
      getSavedTeacherExtraFields(teacher.TeacherCode ?? teacher.teacherCode)
        .motherName ??
      getSavedTeacherExtraFields(teacher.Id ?? teacher.id).motherName ??
      "",

    EducationPdf:
      teacher.EducationPdf ??
      teacher.educationPdf ??
      getSavedTeacherExtraFields(teacher.TeacherCode ?? teacher.teacherCode)
        .educationPdf ??
      getSavedTeacherExtraFields(teacher.Id ?? teacher.id).educationPdf ??
      null,

    EducationFileName:
      teacher.EducationFileName ??
      teacher.educationFileName ??
      getSavedTeacherExtraFields(teacher.TeacherCode ?? teacher.teacherCode)
        .educationFileName ??
      getSavedTeacherExtraFields(teacher.Id ?? teacher.id).educationFileName ??
      "",

    DepartmentIds:
      teacher.DepartmentIds ??
      teacher.departmentIds ??
      extraFields.DepartmentIds ??
      extraFields.departmentIds ??
      (teacher.DepartmentId ? [teacher.DepartmentId] : teacher.departmentId ? [teacher.departmentId] : extraFields.DepartmentId ? [extraFields.DepartmentId] : []),

    departmentIds:
      teacher.departmentIds ??
      teacher.DepartmentIds ??
      extraFields.departmentIds ??
      extraFields.DepartmentIds ??
      (teacher.DepartmentId ? [teacher.DepartmentId] : teacher.departmentId ? [teacher.departmentId] : extraFields.DepartmentId ? [extraFields.DepartmentId] : []),

    SubjectIds:
      teacher.SubjectIds ??
      teacher.subjectIds ??
      extraFields.SubjectIds ??
      extraFields.subjectIds ??
      (teacher.SubjectId ? [teacher.SubjectId] : teacher.subjectId ? [teacher.subjectId] : extraFields.SubjectId ? [extraFields.SubjectId] : []),

    subjectIds:
      teacher.subjectIds ??
      teacher.SubjectIds ??
      extraFields.subjectIds ??
      extraFields.SubjectIds ??
      (teacher.SubjectId ? [teacher.SubjectId] : teacher.subjectId ? [teacher.subjectId] : extraFields.SubjectId ? [extraFields.SubjectId] : []),
  };
};

// =====================================================
// NORMALIZE TEACHER LIST
// =====================================================

const normalizeTeacherList = (data) => {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeTeacher);
};

// =====================================================
// GET ALL TEACHERS
//
// GET
// /api/Teacher/AllTeacher
// =====================================================

export const getAllTeachers = async () => {
  checkToken();

  const response = await fetch(`${API_URL}Teacher/AllTeacher`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  console.log("Get All Teachers Response:", data);

  return normalizeTeacherList(data);
};

// =====================================================
// GET TEACHER BY CODE
//
// GET
// /api/Teacher/TeacherCode/{code}
// =====================================================

export const getTeacherByCode = async (code, allowSoftDeleted = false) => {
  checkToken();

  if (!allowSoftDeleted && isTeacherSoftDeleted(code)) {
    return null;
  }

  if (code === null || code === undefined || String(code).trim() === "") {
    throw new Error("Teacher code is required.");
  }

  const cleanCode = String(code).trim();

  const response = await fetch(
    `${API_URL}Teacher/TeacherCode/${encodeURIComponent(cleanCode)}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  console.log("Get Teacher By Code Response:", data);

  return normalizeTeacher(data);
};

// =====================================================
// GET TEACHER BY NAME
//
// GET
// /api/Teacher/Name/{Name}
// =====================================================

export const getTeacherByName = async (name) => {
  checkToken();

  if (name === null || name === undefined || String(name).trim() === "") {
    throw new Error("Teacher name is required.");
  }

  const cleanName = String(name).trim();

  const response = await fetch(
    `${API_URL}Teacher/Name/${encodeURIComponent(cleanName)}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  console.log("Get Teacher By Name Response:", data);

  return normalizeTeacherList(data);
};

// =====================================================
// GET TEACHER DROPDOWN
//
// GET
// /api/Teacher/dropdown
//
// Query:
// schoolClassId
// subjectId
// =====================================================

export const getTeacherDropdown = async ({
  schoolClassId = null,
  subjectId = null,
} = {}) => {
  checkToken();

  const params = new URLSearchParams();

  if (
    schoolClassId !== null &&
    schoolClassId !== undefined &&
    String(schoolClassId).trim() !== ""
  ) {
    params.append("schoolClassId", String(schoolClassId).trim());
  }

  if (
    subjectId !== null &&
    subjectId !== undefined &&
    String(subjectId).trim() !== ""
  ) {
    params.append("subjectId", String(subjectId).trim());
  }

  const queryString = params.toString();

  const url =
    `${API_URL}Teacher/dropdown` + (queryString ? `?${queryString}` : "");

  const response = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  console.log("Teacher Dropdown Response:", data);

  return Array.isArray(data)
    ? data.map((item) => ({
        id: item.id ?? item.Id ?? null,

        code: item.code ?? item.Code ?? "",

        text: item.text ?? item.Text ?? "",
      }))
    : [];
};

// =====================================================
// UPDATE TEACHER
//
// PUT
// /api/Teacher/UpdateTeacher/{id}
// =====================================================

export const updateTeacher = async (id, teacherData) => {
  checkToken();

  if (id === null || id === undefined || String(id).trim() === "") {
    throw new Error("Teacher ID is required.");
  }

  if (!teacherData) {
    throw new Error("Teacher data is required.");
  }

  // ===================================================
  // DEPARTMENT VALIDATION
  // ===================================================

  const departmentId = Number(teacherData.DepartmentId);

  if (!Number.isInteger(departmentId) || departmentId <= 0) {
    throw new Error("Invalid Department ID.");
  }

  const cleanId = String(id).trim();

  // ===================================================
  // PAYLOAD
  // ===================================================

  const payload = {
    DepartmentId: departmentId,

    FirstName: teacherData.FirstName?.trim() || "",

    MiddleName: teacherData.MiddleName?.trim() || null,

    LastName: teacherData.LastName?.trim() || "",

    DateOfBirth: teacherData.DateOfBirth,

    Gender: teacherData.Gender?.trim() || "",

    Email: teacherData.Email?.trim() || "",

    PhoneNumber: teacherData.PhoneNumber?.trim() || "",

    AlternatePhoneNumber: teacherData.AlternatePhoneNumber?.trim() || null,

    Address: teacherData.Address?.trim() || null,

    Qualification: teacherData.Qualification?.trim() || "",

    Experience:
      teacherData.Experience === "" ||
      teacherData.Experience === null ||
      teacherData.Experience === undefined
        ? 0
        : Number(teacherData.Experience),

    JoiningDate: teacherData.JoiningDate,

    Salary:
      teacherData.Salary === "" ||
      teacherData.Salary === null ||
      teacherData.Salary === undefined
        ? 0
        : Number(teacherData.Salary),

    IsClassTeacher: Boolean(teacherData.IsClassTeacher),

    IsActive: Boolean(teacherData.IsActive),

    FatherName: teacherData.FatherName?.trim()
      ? String(teacherData.FatherName).trim().slice(0, 100)
      : null,

    MotherName: teacherData.MotherName?.trim()
      ? String(teacherData.MotherName).trim().slice(0, 100)
      : null,

    Photo: teacherData.Photo || null,

    EducationPdf: teacherData.EducationPdf || null,

    EducationFileName: teacherData.EducationFileName?.trim()
      ? String(teacherData.EducationFileName).trim().slice(0, 200)
      : null,

    DepartmentIds: Array.isArray(teacherData.DepartmentIds)
      ? teacherData.DepartmentIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : [departmentId],

    DepartmentNames: Array.isArray(teacherData.DepartmentNames)
      ? teacherData.DepartmentNames.join(", ")
      : teacherData.DepartmentNames || null,

    SubjectId:
      teacherData.SubjectId !== undefined &&
      teacherData.SubjectId !== null &&
      teacherData.SubjectId !== ""
        ? Number(teacherData.SubjectId)
        : Array.isArray(teacherData.SubjectIds) && teacherData.SubjectIds.length > 0
          ? Number(teacherData.SubjectIds[0])
          : null,

    SubjectIds: Array.isArray(teacherData.SubjectIds)
      ? teacherData.SubjectIds.join(",")
      : typeof teacherData.SubjectIds === "string"
        ? teacherData.SubjectIds
        : Array.isArray(teacherData.SubjectIdList)
          ? teacherData.SubjectIdList.join(",")
          : teacherData.SubjectId ? String(teacherData.SubjectId) : null,

    SubjectNames: Array.isArray(teacherData.SubjectNames)
      ? teacherData.SubjectNames.join(", ")
      : teacherData.SubjectNames || null,

    SubjectIdList: Array.isArray(teacherData.SubjectIds)
      ? teacherData.SubjectIds.map(Number).filter((n) => !isNaN(n) && n > 0)
      : Array.isArray(teacherData.SubjectIdList)
        ? teacherData.SubjectIdList.map(Number).filter((n) => !isNaN(n) && n > 0)
        : teacherData.SubjectId ? [Number(teacherData.SubjectId)] : null,
  };

  console.log("Update Teacher Payload:", payload);

  const response = await fetch(
    `${API_URL}Teacher/UpdateTeacher/${encodeURIComponent(cleanId)}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    },
  );

  const result = await handleResponse(response);

  if (teacherData && typeof teacherData === "object") {
    saveTeacherExtraFields(cleanId, teacherData);
    const code = teacherData.TeacherCode || teacherData.teacherCode;
    if (code) {
      saveTeacherExtraFields(code, teacherData);
    }
    if (teacherData.IsActive === true) {
      restoreTeacher(code || cleanId);
    }
  }

  return result;
};

// =====================================================
// DELETE TEACHER
//
// DELETE
// /api/Teacher/DeleteTeacher/{code}
// =====================================================

export const deleteTeacher = async (code, teacherData = null) => {
  checkToken();

  if (code === null || code === undefined || String(code).trim() === "") {
    throw new Error("Teacher code is required for deletion.");
  }

  const cleanCode = String(code).trim();

  // 1. Mark as soft-deleted in local registry
  softDeleteTeacher(cleanCode, teacherData);

  // 2. Safely sync Inactive status to backend if teacher ID is known without hard-deleting
  if (teacherData && typeof teacherData === "object" && teacherData.Id) {
    try {
      await updateTeacher(teacherData.Id, {
        ...teacherData,
        IsActive: false,
      });
    } catch (err) {
      console.warn(
        "Could not sync inactive status to backend on teacher soft delete:",
        err,
      );
    }
  }

  return {
    status: true,
    message: "Teacher deleted successfully (Soft Deleted).",
  };
};

// =====================================================
// SYNC TEACHER CLASS TEACHER STATUS
// =====================================================
export const syncTeacherClassTeacherStatus = async (
  teacherId,
  isClassTeacher,
) => {
  if (!teacherId) return false;
  try {
    const allTeachers = await getAllTeachers();
    const teacher = allTeachers.find(
      (t) =>
        String(t.Id) === String(teacherId) ||
        String(t.id) === String(teacherId),
    );
    if (teacher && teacher.Id) {
      const updatedPayload = {
        DepartmentId: teacher.DepartmentId,
        FirstName: teacher.FirstName,
        MiddleName: teacher.MiddleName,
        LastName: teacher.LastName,
        DateOfBirth: teacher.DateOfBirth,
        Gender: teacher.Gender,
        Email: teacher.Email,
        PhoneNumber: teacher.PhoneNumber,
        AlternatePhoneNumber: teacher.AlternatePhoneNumber,
        Address: teacher.Address,
        Qualification: teacher.Qualification,
        Experience: teacher.Experience,
        JoiningDate: teacher.JoiningDate,
        Salary: teacher.Salary,
        IsClassTeacher: Boolean(isClassTeacher),
        IsActive: Boolean(teacher.IsActive),
      };
      await updateTeacher(teacher.Id, updatedPayload);
      return true;
    }
    return false;
  } catch (err) {
    console.warn(
      `Could not sync IsClassTeacher=${isClassTeacher} for teacher ${teacherId}:`,
      err,
    );
    return false;
  }
};

// =====================================================
export const getDepartmentDropdown = async () => {
  checkToken();

  const response = await fetch(`${API_URL}Department/Dropdown`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  console.log("Department Dropdown Response:", data);

  return Array.isArray(data)
    ? data.map((department) => ({
        id: department.id ?? department.Id ?? null,

        code: department.code ?? department.Code ?? "",

        text: department.text ?? department.Text ?? "",
      }))
    : [];
};
