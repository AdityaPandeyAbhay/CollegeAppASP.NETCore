// =====================================================
// RESULT SERVICE
// =====================================================

import { getToken } from "../Utils/auth";

// =====================================================
// BASE API URL
// =====================================================

const API_URL = "/api";

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
// HANDLE RESPONSE
// =====================================================

const handleResponse = async (response) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 403) {
      throw new Error("You are not authorized to perform this operation.");
    }

    if (response.status === 404) {
      throw new Error(
        data?.errors?.[0] || data?.message || "Requested record was not found.",
      );
    }

    const errorMessage =
      data?.errors?.[0] ||
      data?.Errors?.[0] ||
      data?.message ||
      data?.Message ||
      "Request failed.";

    throw new Error(errorMessage);
  }

  if (data?.status === false) {
    throw new Error(data?.errors?.[0] || data?.message || "Operation failed.");
  }

  if (data?.Status === false) {
    throw new Error(data?.Errors?.[0] || data?.Message || "Operation failed.");
  }

  return data?.data ?? data?.Data ?? data;
};

// =====================================================
// NORMALIZE DROPDOWN
// =====================================================

const normalizeDropdown = (item) => ({
  id: item?.id ?? item?.Id,
  code: item?.code ?? item?.Code ?? "",
  text: item?.text ?? item?.Text ?? "",
});

// =====================================================
// EXAM
// =====================================================

// Create Exam
export const createExam = async (examData) => {
  if (!examData?.ExamName?.trim()) {
    throw new Error("Exam name is required.");
  }

  const response = await fetch(`${API_URL}/Result/CreateExam`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      ExamName: examData.ExamName.trim(),
      Description: examData.Description?.trim() || null,
      IsActive: examData.IsActive === undefined ? true : examData.IsActive,
    }),
  });

  return handleResponse(response);
};

// Get All Exams
export const getAllExams = async () => {
  const response = await fetch(`${API_URL}/Result/AllExam`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// Get Exam By ID
export const getExamById = async (id) => {
  if (!id || Number(id) <= 0) {
    throw new Error("Exam ID is required.");
  }

  const response = await fetch(`${API_URL}/Result/Exam/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// Update Exam
export const updateExam = async (id, examData) => {
  if (!id || Number(id) <= 0) {
    throw new Error("Exam ID is required.");
  }

  if (!examData?.ExamName?.trim()) {
    throw new Error("Exam name is required.");
  }

  const response = await fetch(`${API_URL}/Result/UpdateExam/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      Id: Number(id),
      ExamName: examData.ExamName.trim(),
      Description: examData.Description?.trim() || null,
      IsActive: examData.IsActive === undefined ? true : examData.IsActive,
    }),
  });

  return handleResponse(response);
};

// Delete Exam
export const deleteExam = async (id) => {
  if (!id || Number(id) <= 0) {
    throw new Error("Exam ID is required.");
  }

  const response = await fetch(`${API_URL}/Result/DeleteExam/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// =====================================================
// RESULT BATCH
// =====================================================

// Create Result Batch
export const createResultBatch = async (batchData) => {
  if (!batchData) {
    throw new Error("Result batch data is required.");
  }

  if (!Number(batchData.AcademicYearId)) {
    throw new Error("Academic Year is required.");
  }

  if (!Number(batchData.ClassId)) {
    throw new Error("Class is required.");
  }

  if (!Number(batchData.SectionId)) {
    throw new Error("Section is required.");
  }

  if (!Number(batchData.ExamId)) {
    throw new Error("Exam is required.");
  }

  const payload = {
    AcademicYearId: Number(batchData.AcademicYearId),
    ClassId: Number(batchData.ClassId),
    SectionId: Number(batchData.SectionId),
    ExamId: Number(batchData.ExamId),
    Students: batchData.Students || [],
  };

  const response = await fetch(`${API_URL}/Result/CreateResultBatch`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload),
  });

  return handleResponse(response);
};

// Get All Result Batches
export const getAllResultBatches = async () => {
  const response = await fetch(`${API_URL}/Result/AllResultBatch`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// Get Result Batch By ID
export const getResultBatchById = async (id) => {
  if (!id || Number(id) <= 0) {
    throw new Error("Result Batch ID is required.");
  }

  const response = await fetch(`${API_URL}/Result/ResultBatch/${id}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// Publish Result Batch
export const publishResultBatch = async (id) => {
  if (!id || Number(id) <= 0) {
    throw new Error("Result Batch ID is required.");
  }

  const response = await fetch(`${API_URL}/Result/PublishResultBatch/${id}`, {
    method: "PUT",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// Delete Result Batch
export const deleteResultBatch = async (id) => {
  if (!id || Number(id) <= 0) {
    throw new Error("Result Batch ID is required.");
  }

  const response = await fetch(`${API_URL}/Result/DeleteResultBatch/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// =====================================================
// STUDENT RESULT
// =====================================================

// Upload Student Result
export const uploadStudentResult = async (resultData) => {
  if (!resultData) {
    throw new Error("Result data is required.");
  }

  const token = getToken();

  // If already a FormData object, submit directly
  if (typeof FormData !== "undefined" && resultData instanceof FormData) {
    const response = await fetch(`${API_URL}/Result/UploadStudentResult`, {
      method: "POST",
      headers: {
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
      body: resultData,
    });

    return handleResponse(response);
  }

  const batchId = resultData.ResultBatchId ?? resultData.resultBatchId;

  const studentId = resultData.StudentId ?? resultData.studentId;

  if (!Number(batchId)) {
    throw new Error("Result Batch is required.");
  }

  if (!Number(studentId)) {
    throw new Error("Student is required.");
  }

  const subjectList = resultData.Subjects ?? resultData.subjects ?? [];

  if (!Array.isArray(subjectList) || subjectList.length === 0) {
    throw new Error("At least one subject is required.");
  }

  const formData = new FormData();

  formData.append("ResultBatchId", String(Number(batchId)));
  formData.append("StudentId", String(Number(studentId)));
  formData.append(
    "ResultId",
    String(Number(resultData.ResultId ?? resultData.resultId ?? 0)),
  );

  subjectList.forEach((subject, index) => {
    const sId =
      subject.SubjectId ?? subject.subjectId ?? subject.id ?? subject.Id;
    const maxM = subject.MaxMarks ?? subject.maxMarks;
    const obtM = subject.ObtainedMarks ?? subject.obtainedMarks;
    const grade = subject.Grade ?? subject.grade;
    const remarks = subject.Remarks ?? subject.remarks;

    formData.append(`Subjects[${index}].SubjectId`, String(Number(sId)));
    formData.append(`Subjects[${index}].MaxMarks`, String(Number(maxM)));
    formData.append(`Subjects[${index}].ObtainedMarks`, String(Number(obtM)));

    const intM = subject.InternalMarks ?? subject.internalMarks;
    if (intM !== undefined && intM !== null && intM !== "") {
      formData.append(`Subjects[${index}].InternalMarks`, String(Number(intM)));
    }

    const extM = subject.ExternalMarks ?? subject.externalMarks;
    if (extM !== undefined && extM !== null && extM !== "") {
      formData.append(`Subjects[${index}].ExternalMarks`, String(Number(extM)));
    }

    if (grade) {
      formData.append(`Subjects[${index}].Grade`, String(grade));
    }

    if (remarks) {
      formData.append(`Subjects[${index}].Remarks`, String(remarks));
    }
  });

  const pdf = resultData.PdfFile ?? resultData.pdfFile;
  if (pdf) {
    formData.append("PdfFile", pdf);
  }

  const response = await fetch(`${API_URL}/Result/UploadStudentResult`, {
    method: "POST",
    headers: {
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    body: formData,
  });

  return handleResponse(response);
};

// Update Student Result
export const updateStudentResult = async (resultData) => {
  if (!resultData) {
    throw new Error("Result data is required.");
  }

  if (!Number(resultData.ResultId)) {
    throw new Error("Result ID is required.");
  }

  if (!Number(resultData.ResultBatchId)) {
    throw new Error("Result Batch is required.");
  }

  if (!Number(resultData.StudentId)) {
    throw new Error("Student is required.");
  }

  const formData = new FormData();

  formData.append("ResultId", Number(resultData.ResultId));

  formData.append("ResultBatchId", Number(resultData.ResultBatchId));

  formData.append("StudentId", Number(resultData.StudentId));

  resultData.Subjects.forEach((subject, index) => {
    formData.append(`Subjects[${index}].SubjectId`, Number(subject.SubjectId));

    formData.append(`Subjects[${index}].MaxMarks`, Number(subject.MaxMarks));

    formData.append(
      `Subjects[${index}].ObtainedMarks`,
      Number(subject.ObtainedMarks),
    );

    if (subject.Grade) {
      formData.append(`Subjects[${index}].Grade`, subject.Grade);
    }

    if (subject.Remarks) {
      formData.append(`Subjects[${index}].Remarks`, subject.Remarks);
    }
  });

  if (resultData.PdfFile) {
    formData.append("PdfFile", resultData.PdfFile);
  }

  const token = getToken();

  const response = await fetch(`${API_URL}/Result/UpdateStudentResult`, {
    method: "PUT",
    headers: {
      ...(token && {
        Authorization: `Bearer ${token}`,
      }),
    },
    body: formData,
  });

  return handleResponse(response);
};

// Get Student Result
export const getStudentResult = async (resultBatchId, studentId) => {
  if (!Number(resultBatchId)) {
    throw new Error("Result Batch ID is required.");
  }

  if (!Number(studentId)) {
    throw new Error("Student ID is required.");
  }

  const response = await fetch(
    `${API_URL}/Result/StudentResult/${resultBatchId}/${studentId}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  return handleResponse(response);
};

// Get Batch Results
export const getBatchResults = async (resultBatchId) => {
  if (!Number(resultBatchId)) {
    throw new Error("Result Batch ID is required.");
  }

  const response = await fetch(
    `${API_URL}/Result/BatchResult/${resultBatchId}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  return handleResponse(response);
};

// Get Previous Student Results
export const getStudentPreviousResults = async (studentId) => {
  if (!Number(studentId)) {
    throw new Error("Student ID is required.");
  }

  const response = await fetch(
    `${API_URL}/Result/PreviousResult/${studentId}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  return handleResponse(response);
};

// =====================================================
// RESULT DETAILS
// =====================================================

export const getResultDetails = async (resultId) => {
  if (!Number(resultId)) {
    throw new Error("Result ID is required.");
  }

  const response = await fetch(`${API_URL}/Result/ResultDetails/${resultId}`, {
    method: "GET",
    headers: getHeaders(),
  });

  return handleResponse(response);
};

// Get Result By ID (used by UpdateStudentResult)
export const getResultById = async (id) => {
  if (!id || Number(id) <= 0) {
    throw new Error("Result ID is required.");
  }

  const data = await getResultDetails(id);
  if (Array.isArray(data)) {
    return {
      resultId: id,
      subjects: data,
      resultDetails: data,
    };
  }
  return data;
};

// =====================================================
// DROPDOWNS
// =====================================================

// Exam Dropdown
export const getExamDropdown = async () => {
  const response = await fetch(`${API_URL}/Result/Dropdown/Exam`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  return Array.isArray(data) ? data.map(normalizeDropdown) : [];
};

// Result Batch Dropdown
export const getResultBatchDropdown = async (examId) => {
  if (!Number(examId)) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/Result/Dropdown/ResultBatch/${examId}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  return Array.isArray(data) ? data.map(normalizeDropdown) : [];
};

// Result Dropdown
export const getResultDropdown = async (resultBatchId) => {
  if (!Number(resultBatchId)) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/Result/Dropdown/Result/${resultBatchId}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  return Array.isArray(data) ? data.map(normalizeDropdown) : [];
};

// Student Result Dropdown
export const getStudentResultDropdown = async (resultBatchId) => {
  if (!Number(resultBatchId)) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/Result/Dropdown/StudentResult/${resultBatchId}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  return Array.isArray(data) ? data.map(normalizeDropdown) : [];
};

// Result Detail Dropdown
export const getResultDetailDropdown = async (resultId) => {
  if (!Number(resultId)) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/Result/Dropdown/ResultDetail/${resultId}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  return Array.isArray(data) ? data.map(normalizeDropdown) : [];
};

// =====================================================
// DEFAULT EXPORT
// =====================================================

const resultService = {
  createExam,
  getAllExams,
  getExamById,
  updateExam,
  deleteExam,

  createResultBatch,
  getAllResultBatches,
  getResultBatchById,
  publishResultBatch,
  deleteResultBatch,

  uploadStudentResult,
  updateStudentResult,
  getStudentResult,
  getBatchResults,
  getStudentPreviousResults,

  getResultDetails,
  getResultById,

  getExamDropdown,
  getResultBatchDropdown,
  getResultDropdown,
  getStudentResultDropdown,
  getResultDetailDropdown,
};

export default resultService;
