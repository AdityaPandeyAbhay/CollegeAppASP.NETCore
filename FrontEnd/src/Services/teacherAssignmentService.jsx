// =====================================================
// TEACHER ASSIGNMENT SERVICE
// =====================================================

import { getToken } from "../Utils/auth";

// =====================================================
// BASE API URL
// =====================================================

const API_URL = "https://localhost:7164/api/";

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
  // 401
  // ===================================================

  if (response.status === 401) {

    throw new Error(
      "Unauthorized (401). Your login session may have expired. Please login again."
    );

  }

  // ===================================================
  // 403
  // ===================================================

  if (response.status === 403) {

    throw new Error(
      "Access denied (403). You do not have permission to perform this operation."
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
      "Teacher assignment record not found.";

    if (
      Array.isArray(data?.Errors) &&
      data.Errors.length > 0
    ) {

      message = data.Errors.join(", ");

    }

    if (
      Array.isArray(data?.errors) &&
      data.errors.length > 0
    ) {

      message = data.errors.join(", ");

    }

    throw new Error(message);

  }

  // ===================================================
  // OTHER HTTP ERRORS
  // ===================================================

  if (!response.ok) {

    let message = null;

    if (
      Array.isArray(data?.Errors) &&
      data.Errors.length > 0
    ) {

      message = data.Errors.join(", ");

    }

    if (
      !message &&
      Array.isArray(data?.errors) &&
      data.errors.length > 0
    ) {

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

    // =================================================
    // ASP.NET VALIDATION ERRORS
    // =================================================

    if (
      !message &&
      data?.errors &&
      typeof data.errors === "object" &&
      !Array.isArray(data.errors)
    ) {

      const validationMessages = [];

      Object.values(data.errors).forEach(
        (value) => {

          if (Array.isArray(value)) {

            validationMessages.push(
              ...value
            );

          } else if (value) {

            validationMessages.push(
              String(value)
            );

          }

        }
      );

      if (
        validationMessages.length > 0
      ) {

        message =
          validationMessages.join(", ");

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
      "Teacher assignment request failed.";

    if (
      Array.isArray(data?.Errors) &&
      data.Errors.length > 0
    ) {

      message =
        data.Errors.join(", ");

    }

    if (
      Array.isArray(data?.errors) &&
      data.errors.length > 0
    ) {

      message =
        data.errors.join(", ");

    }

    throw new Error(message);

  }

  // ===================================================
  // DATA
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

  // ===================================================
  // data
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

  return data;
};

// =====================================================
// NORMALIZE ASSIGNMENT
// =====================================================

const normalizeTeacherAssignment = (item) => {

  if (
    !item ||
    typeof item !== "object"
  ) {

    return item;

  }

  // ===================================================
  // TEACHER
  // ===================================================

  const teacherName =
    item.TeacherName ??
    item.teacherName ??
    item.Teacher?.TeacherName ??
    item.teacher?.teacherName ??
    item.Teacher?.Name ??
    item.teacher?.name ??
    (
      item.Teacher
        ? [
            item.Teacher.FirstName ??
            item.Teacher.firstName,

            item.Teacher.MiddleName ??
            item.Teacher.middleName,

            item.Teacher.LastName ??
            item.Teacher.lastName,
          ]
          .filter(
            (value) =>
              value !== null &&
              value !== undefined &&
              String(value).trim() !== ""
          )
          .join(" ")
        : ""
    ) ??
    "";

  const teacherCode =
    item.TeacherCode ??
    item.teacherCode ??
    item.Teacher?.TeacherCode ??
    item.teacher?.teacherCode ??
    item.Teacher?.Code ??
    item.teacher?.code ??
    "";

  // ===================================================
  // DEPARTMENT
  // ===================================================

  const departmentName =
    item.DepartmentName ??
    item.departmentName ??
    item.Department?.DepartmentName ??
    item.department?.departmentName ??
    item.Department?.Name ??
    item.department?.name ??
    item.Department?.Text ??
    item.department?.text ??
    "";

  const departmentCode =
    item.DepartmentCode ??
    item.departmentCode ??
    item.Department?.DepartmentCode ??
    item.department?.departmentCode ??
    item.Department?.Code ??
    item.department?.code ??
    "";

  // ===================================================
  // CLASS
  // ===================================================

  const className =
    item.ClassName ??
    item.className ??
    item.SchoolClassName ??
    item.schoolClassName ??
    item.SchoolClass?.ClassName ??
    item.schoolClass?.className ??
    item.SchoolClass?.Name ??
    item.schoolClass?.name ??
    item.SchoolClass?.Text ??
    item.schoolClass?.text ??
    "";

  const classCode =
    item.ClassCode ??
    item.classCode ??
    item.SchoolClass?.ClassCode ??
    item.schoolClass?.classCode ??
    item.SchoolClass?.Code ??
    item.schoolClass?.code ??
    "";

  // ===================================================
  // SECTION
  // ===================================================

  const sectionName =
    item.SectionName ??
    item.sectionName ??
    item.Section?.SectionName ??
    item.section?.sectionName ??
    item.Section?.Name ??
    item.section?.name ??
    item.Section?.Text ??
    item.section?.text ??
    "";

  const sectionCode =
    item.SectionCode ??
    item.sectionCode ??
    item.Section?.SectionCode ??
    item.section?.sectionCode ??
    item.Section?.Code ??
    item.section?.code ??
    "";

  // ===================================================
  // SUBJECT
  // ===================================================

  const subjectName =
    item.SubjectName ??
    item.subjectName ??
    item.Subject?.SubjectName ??
    item.subject?.subjectName ??
    item.Subject?.Name ??
    item.subject?.name ??
    item.Subject?.Text ??
    item.subject?.text ??
    "";

  const subjectCode =
    item.SubjectCode ??
    item.subjectCode ??
    item.Subject?.SubjectCode ??
    item.subject?.subjectCode ??
    item.Subject?.Code ??
    item.subject?.code ??
    "";

  // ===================================================
  // ACADEMIC YEAR
  // ===================================================

  const academicYearName =
    item.AcademicYear ??
    item.academicYear ??
    item.AcademicYearName ??
    item.academicYearName ??
    item.AcademicYear?.YearName ??
    item.academicYear?.yearName ??
    item.AcademicYear?.AcademicYearName ??
    item.academicYear?.academicYearName ??
    item.AcademicYear?.Name ??
    item.academicYear?.name ??
    item.AcademicYear?.Year ??
    item.academicYear?.year ??
    item.AcademicYear?.Text ??
    item.academicYear?.text ??
    "";

  // ===================================================
  // RETURN NORMALIZED OBJECT
  // ===================================================

  return {

    // =================================================
    // ID
    // =================================================

    Id:
      item.Id ??
      item.id ??
      null,

    // =================================================
    // TEACHER
    // =================================================

    TeacherId:
      item.TeacherId ??
      item.teacherId ??
      item.Teacher?.Id ??
      item.teacher?.id ??
      null,

    TeacherCode:
      teacherCode,

    TeacherName:
      teacherName,

    // =================================================
    // DEPARTMENT
    // =================================================

    DepartmentId:
      item.DepartmentId ??
      item.departmentId ??
      item.Department?.Id ??
      item.department?.id ??
      null,

    DepartmentName:
      departmentName,

    DepartmentCode:
      departmentCode,

    // =================================================
    // CLASS
    // =================================================

    SchoolClassId:
      item.SchoolClassId ??
      item.schoolClassId ??
      item.ClassId ??
      item.classId ??
      item.SchoolClass?.Id ??
      item.schoolClass?.id ??
      null,

    ClassName:
      className,

    ClassCode:
      classCode,

    // =================================================
    // SECTION
    // =================================================

    SectionId:
      item.SectionId ??
      item.sectionId ??
      item.Section?.Id ??
      item.section?.id ??
      null,

    SectionName:
      sectionName,

    SectionCode:
      sectionCode,

    // =================================================
    // SUBJECT
    // =================================================

    SubjectId:
      item.SubjectId ??
      item.subjectId ??
      item.Subject?.Id ??
      item.subject?.id ??
      null,

    SubjectName:
      subjectName,

    SubjectCode:
      subjectCode,

    // =================================================
    // ACADEMIC YEAR
    // =================================================

    AcademicYearId:
      item.AcademicYearId ??
      item.academicYearId ??
      item.AcademicYear?.Id ??
      item.academicYear?.id ??
      null,

    AcademicYearName:
      academicYearName,

    // =================================================
    // CLASS TEACHER
    // =================================================

    IsClassTeacher:
      item.IsClassTeacher ??
      item.isClassTeacher ??
      false,

    // =================================================
    // ACTIVE
    // =================================================

    IsActive:
      item.IsActive ??
      item.isActive ??
      true,

    // =================================================
    // AUDIT
    // =================================================

    CreatedBy:
      item.CreatedBy ??
      item.createdBy ??
      null,

    CreatedDate:
      item.CreatedDate ??
      item.createdDate ??
      null,

    UpdatedBy:
      item.UpdatedBy ??
      item.updatedBy ??
      null,

    UpdatedDate:
      item.UpdatedDate ??
      item.updatedDate ??
      null,

  };

};

// =====================================================
// NORMALIZE LIST
// =====================================================

const normalizeTeacherAssignmentList = (data) => {

  if (!Array.isArray(data)) {

    return [];

  }

  return data.map(
    normalizeTeacherAssignment
  );

};

// =====================================================
// CREATE TEACHER ASSIGNMENT
//
// POST
// /api/TeacherAssignment/CreateTeacherAssignment
// =====================================================

export const createTeacherAssignment = async (
  assignmentData
) => {

  checkToken();

  if (!assignmentData) {

    throw new Error(
      "Teacher assignment data is required."
    );

  }

  const payload = {

    teacherId:
      Number(
        assignmentData.TeacherId ?? assignmentData.teacherId
      ),

    departmentId:
      Number(
        assignmentData.DepartmentId ?? assignmentData.departmentId
      ),

    schoolClassId:
      Number(
        assignmentData.SchoolClassId ?? assignmentData.schoolClassId
      ),

    sectionId:
      Number(
        assignmentData.SectionId ?? assignmentData.sectionId
      ),

    subjectId:
      Number(
        assignmentData.SubjectId ?? assignmentData.subjectId
      ),

    academicYearId:
      Number(
        assignmentData.AcademicYearId ?? assignmentData.academicYearId
      ),

    isClassTeacher:
      assignmentData.IsClassTeacher !== undefined
        ? Boolean(assignmentData.IsClassTeacher)
        : assignmentData.isClassTeacher !== undefined
        ? Boolean(assignmentData.isClassTeacher)
        : true,

    isActive:
      assignmentData.IsActive !== undefined
        ? Boolean(assignmentData.IsActive)
        : assignmentData.isActive !== undefined
        ? Boolean(assignmentData.isActive)
        : true,

  };

  // ===================================================
  // VALIDATION
  // ===================================================

  if (
    !Number.isInteger(
      payload.teacherId
    ) ||
    payload.teacherId <= 0
  ) {

    throw new Error(
      "Teacher is required."
    );

  }

  if (
    !Number.isInteger(
      payload.departmentId
    ) ||
    payload.departmentId <= 0
  ) {

    throw new Error(
      "Department is required."
    );

  }

  if (
    !Number.isInteger(
      payload.schoolClassId
    ) ||
    payload.schoolClassId <= 0
  ) {

    throw new Error(
      "Class is required."
    );

  }

  if (
    !Number.isInteger(
      payload.sectionId
    ) ||
    payload.sectionId <= 0
  ) {

    throw new Error(
      "Section is required."
    );

  }

  if (
    !Number.isInteger(
      payload.subjectId
    ) ||
    payload.subjectId <= 0
  ) {

    throw new Error(
      "Subject is required."
    );

  }

  if (
    !Number.isInteger(
      payload.academicYearId
    ) ||
    payload.academicYearId <= 0
  ) {

    throw new Error(
      "Academic year is required."
    );

  }

  // ===================================================
  // DEBUG
  // ===================================================

  console.log(
    "Teacher Assignment Payload:",
    payload
  );

  // ===================================================
  // API REQUEST
  // ===================================================

  const response = await fetch(
    `${API_URL}TeacherAssignment/CreateTeacherAssignment`,
    {
      method: "POST",

      headers: getHeaders(),

      body:
        JSON.stringify(payload),
    }
  );

  return handleResponse(
    response
  );

};

// =====================================================
// GET ALL TEACHER ASSIGNMENTS
//
// GET
// /api/TeacherAssignment/GetAllTeacherAssignments
// =====================================================

export const getAllTeacherAssignments =
  async () => {

    checkToken();

    const response =
      await fetch(
        `${API_URL}TeacherAssignment/GetAllTeacherAssignments`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

    const data =
      await handleResponse(
        response
      );

    return normalizeTeacherAssignmentList(
      data
    );

  };

// =====================================================
// GET ASSIGNMENT BY ID
//
// GET
// /api/TeacherAssignment/GetTeacherAssignmentById/{id}
// =====================================================

export const getTeacherAssignmentById =
  async (id) => {

    checkToken();

    if (
      id === null ||
      id === undefined ||
      String(id).trim() === ""
    ) {

      throw new Error(
        "Teacher assignment ID is required."
      );

    }

    const response =
      await fetch(
        `${API_URL}TeacherAssignment/GetTeacherAssignmentById/${encodeURIComponent(
          String(id).trim()
        )}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

    const data =
      await handleResponse(
        response
      );

    return normalizeTeacherAssignment(
      data
    );

  };

// =====================================================
// GET ASSIGNMENTS BY TEACHER
//
// GET
// /api/TeacherAssignment/GetTeacherAssignmentByTeacher/{teacherId}
// =====================================================

export const getTeacherAssignmentsByTeacher =
  async (teacherId) => {

    checkToken();

    if (
      teacherId === null ||
      teacherId === undefined ||
      String(teacherId).trim() === ""
    ) {

      throw new Error(
        "Teacher is required."
      );

    }

    const response =
      await fetch(
        `${API_URL}TeacherAssignment/GetTeacherAssignmentByTeacher/${encodeURIComponent(
          String(teacherId).trim()
        )}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

    const data =
      await handleResponse(
        response
      );

    return normalizeTeacherAssignmentList(
      data
    );

  };

// =====================================================
// GET ASSIGNMENTS BY CLASS
//
// GET
// /api/TeacherAssignment/GetTeacherAssignmentByClass/{classId}
// =====================================================

export const getTeacherAssignmentsByClass =
  async (classId) => {

    checkToken();

    if (
      classId === null ||
      classId === undefined ||
      String(classId).trim() === ""
    ) {

      throw new Error(
        "Class is required."
      );

    }

    const response =
      await fetch(
        `${API_URL}TeacherAssignment/GetTeacherAssignmentByClass/${encodeURIComponent(
          String(classId).trim()
        )}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

    const data =
      await handleResponse(
        response
      );

    return normalizeTeacherAssignmentList(
      data
    );

  };

// =====================================================
// GET ASSIGNMENTS BY SUBJECT
//
// GET
// /api/TeacherAssignment/GetTeacherAssignmentBySubject/{subjectId}
// =====================================================

export const getTeacherAssignmentsBySubject =
  async (subjectId) => {

    checkToken();

    if (
      subjectId === null ||
      subjectId === undefined ||
      String(subjectId).trim() === ""
    ) {

      throw new Error(
        "Subject is required."
      );

    }

    const response =
      await fetch(
        `${API_URL}TeacherAssignment/GetTeacherAssignmentBySubject/${encodeURIComponent(
          String(subjectId).trim()
        )}`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

    const data =
      await handleResponse(
        response
      );

    return normalizeTeacherAssignmentList(
      data
    );

  };

// =====================================================
// TEACHER DROPDOWN BY ASSIGNMENT FILTER
// =====================================================

export const getTeacherAssignmentTeacherDropdown =
  async ({
    departmentId = null,
    schoolClassId = null,
    sectionId = null,
    subjectId = null,
    academicYearId = null,
  } = {}) => {

    checkToken();

    const params =
      new URLSearchParams();

    if (
      departmentId !== null &&
      departmentId !== undefined &&
      String(departmentId).trim() !== ""
    ) {

      params.append(
        "departmentId",
        String(departmentId)
      );

    }

    if (
      schoolClassId !== null &&
      schoolClassId !== undefined &&
      String(schoolClassId).trim() !== ""
    ) {

      params.append(
        "schoolClassId",
        String(schoolClassId)
      );

    }

    if (
      sectionId !== null &&
      sectionId !== undefined &&
      String(sectionId).trim() !== ""
    ) {

      params.append(
        "sectionId",
        String(sectionId)
      );

    }

    if (
      subjectId !== null &&
      subjectId !== undefined &&
      String(subjectId).trim() !== ""
    ) {

      params.append(
        "subjectId",
        String(subjectId)
      );

    }

    if (
      academicYearId !== null &&
      academicYearId !== undefined &&
      String(academicYearId).trim() !== ""
    ) {

      params.append(
        "academicYearId",
        String(academicYearId)
      );

    }

    const queryString =
      params.toString();

    const url =
      `${API_URL}TeacherAssignment/dropdown/teacher` +
      (
        queryString
          ? `?${queryString}`
          : ""
      );

    const response =
      await fetch(
        url,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

    const data =
      await handleResponse(
        response
      );

    return Array.isArray(data)
      ? data.map(
          (item) => ({

            id:
              item.id ??
              item.Id ??
              null,

            code:
              item.code ??
              item.Code ??
              "",

            text:
              item.text ??
              item.Text ??
              "",

            DepartmentId:
              item.DepartmentId ??
              item.departmentId ??
              null,

            DepartmentName:
              item.DepartmentName ??
              item.departmentName ??
              "",

          })
        )
      : [];

  };

// =====================================================
// UPDATE TEACHER ASSIGNMENT
// =====================================================

export const updateTeacherAssignment =
  async (
    idOrData,
    maybeData
  ) => {

    checkToken();

    let id = idOrData;
    let assignmentData = maybeData;

    if (typeof idOrData === "object" && idOrData !== null && maybeData === undefined) {
      id = idOrData.id ?? idOrData.Id;
      assignmentData = idOrData;
    }

    if (
      id === null ||
      id === undefined ||
      String(id).trim() === ""
    ) {

      throw new Error(
        "Teacher assignment ID is required."
      );

    }

    if (!assignmentData) {

      throw new Error(
        "Teacher assignment data is required."
      );

    }

    const payload = {

      teacherId:
        Number(
          assignmentData.TeacherId ?? assignmentData.teacherId
        ),

      departmentId:
        Number(
          assignmentData.DepartmentId ?? assignmentData.departmentId
        ),

      schoolClassId:
        Number(
          assignmentData.SchoolClassId ?? assignmentData.schoolClassId
        ),

      sectionId:
        Number(
          assignmentData.SectionId ?? assignmentData.sectionId
        ),

      subjectId:
        Number(
          assignmentData.SubjectId ?? assignmentData.subjectId
        ),

      academicYearId:
        Number(
          assignmentData.AcademicYearId ?? assignmentData.academicYearId
        ),

      isClassTeacher:
        assignmentData.IsClassTeacher !== undefined
          ? Boolean(assignmentData.IsClassTeacher)
          : assignmentData.isClassTeacher !== undefined
          ? Boolean(assignmentData.isClassTeacher)
          : true,

      isActive:
        assignmentData.IsActive !== undefined
          ? Boolean(assignmentData.IsActive)
          : assignmentData.isActive !== undefined
          ? Boolean(assignmentData.isActive)
          : true,

    };

    // =================================================
    // VALIDATION
    // =================================================

    if (
      !Number.isInteger(
        payload.teacherId
      ) ||
      payload.teacherId <= 0
    ) {

      throw new Error(
        "Teacher is required."
      );

    }

    if (
      !Number.isInteger(
        payload.departmentId
      ) ||
      payload.departmentId <= 0
    ) {

      throw new Error(
        "Department is required."
      );

    }

    if (
      !Number.isInteger(
        payload.schoolClassId
      ) ||
      payload.schoolClassId <= 0
    ) {

      throw new Error(
        "Class is required."
      );

    }

    if (
      !Number.isInteger(
        payload.sectionId
      ) ||
      payload.sectionId <= 0
    ) {

      throw new Error(
        "Section is required."
      );

    }

    if (
      !Number.isInteger(
        payload.subjectId
      ) ||
      payload.subjectId <= 0
    ) {

      throw new Error(
        "Subject is required."
      );

    }

    if (
      !Number.isInteger(
        payload.academicYearId
      ) ||
      payload.academicYearId <= 0
    ) {

      throw new Error(
        "Academic year is required."
      );

    }

    const response =
      await fetch(
        `${API_URL}TeacherAssignment/UpdateTeacherAssignment/${encodeURIComponent(
          String(id).trim()
        )}`,
        {
          method: "PUT",

          headers:
            getHeaders(),

          body:
            JSON.stringify(
              payload
            ),
        }
      );

    return handleResponse(
      response
    );

  };

// =====================================================
// DELETE TEACHER ASSIGNMENT
// =====================================================

export const deleteTeacherAssignment =
  async (id) => {

    checkToken();

    if (
      id === null ||
      id === undefined ||
      String(id).trim() === ""
    ) {

      throw new Error(
        "Teacher assignment ID is required."
      );

    }

    const response =
      await fetch(
        `${API_URL}TeacherAssignment/DeleteTeacherAssignment/${encodeURIComponent(
          String(id).trim()
        )}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

    return handleResponse(
      response
    );

  };

// =====================================================
// TEACHER ASSIGNMENT DROPDOWN
// =====================================================

export const getTeacherAssignmentDropdown =
  async () => {

    checkToken();

    const response =
      await fetch(
        `${API_URL}TeacherAssignment/Dropdown`,
        {
          method: "GET",
          headers: getHeaders(),
        }
      );

    const data =
      await handleResponse(
        response
      );

    return Array.isArray(data)
      ? data.map(
          (item) => ({

            id:
              item.id ??
              item.Id ??
              null,

            code:
              item.code ??
              item.Code ??
              "",

            text:
              item.text ??
              item.Text ??
              "",

          })
        )
      : [];

  };