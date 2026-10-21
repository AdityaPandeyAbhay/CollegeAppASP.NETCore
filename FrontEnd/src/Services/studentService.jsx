// =====================================================
// SOFT DELETED STUDENTS REGISTRY & HELPERS
// =====================================================
const SOFT_DELETED_STUDENTS_KEY = "school_soft_deleted_students_v1";

export const getSoftDeletedStudentsMap = () => {
  try {
    const raw = localStorage.getItem(SOFT_DELETED_STUDENTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
};

export const isStudentSoftDeleted = (studentOrId, secondaryObj = null) => {
  if (!studentOrId && !secondaryObj) return false;
  try {
    const target =
      (typeof studentOrId === "object" ? studentOrId : null) ||
      (typeof secondaryObj === "object" ? secondaryObj : null);

    if (target) {
      if (target.isDeleted === true || target.IsDeleted === true) {
        return true;
      }
    }

    const map = getSoftDeletedStudentsMap();
    if (target) {
      const id = target.Id ?? target.id;
      const adm = (
        target.AdmissionNumber ??
        target.admissionNumber ??
        target.AdmissionNo ??
        target.admissionNo ??
        ""
      )
        .toString()
        .trim()
        .toLowerCase();
      const userId = (target.UserId ?? target.userId ?? "")
        .toString()
        .trim()
        .toLowerCase();

      if (id && (map[String(id)] || map[Number(id)])) return true;
      if (adm && map[adm]) return true;
      if (userId && map[userId]) return true;
      return false;
    }

    const clean = String(studentOrId).trim().toLowerCase();
    return Boolean(map[clean] || map[String(studentOrId).trim()]);
  } catch (_) {
    return false;
  }
};

export const softDeleteStudent = (studentOrId, studentObj = null) => {
  if (!studentOrId && !studentObj) return;
  try {
    const map = getSoftDeletedStudentsMap();
    const target =
      (typeof studentObj === "object" ? studentObj : null) ||
      (typeof studentOrId === "object" ? studentOrId : null);

    const id =
      target?.Id ??
      target?.id ??
      (typeof studentOrId !== "object" && !isNaN(studentOrId)
        ? String(studentOrId).trim()
        : null);

    const adm = (
      target?.AdmissionNumber ??
      target?.admissionNumber ??
      target?.AdmissionNo ??
      target?.admissionNo ??
      (typeof studentOrId === "string" ? studentOrId : "")
    )
      .toString()
      .trim();

    const name = [
      target?.FirstName ?? target?.firstName,
      target?.MiddleName ?? target?.middleName,
      target?.LastName ?? target?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    const userId = (target?.UserId ?? target?.userId ?? "").toString().trim();

    const record = {
      id: id || null,
      admissionNumber: adm || null,
      userId: userId || null,
      name: name || `Student ${id || adm}`,
      deletedAt: new Date().toISOString(),
      isDeleted: true,
    };

    if (id) {
      map[String(id)] = record;
      map[Number(id)] = record;
    }
    if (adm) {
      map[adm.toLowerCase()] = record;
      map[adm] = record;
    }
    if (userId) {
      map[userId.toLowerCase()] = record;
      map[userId] = record;
    }
    if (studentOrId && typeof studentOrId !== "object") {
      map[String(studentOrId).trim()] = record;
      map[String(studentOrId).trim().toLowerCase()] = record;
    }

    localStorage.setItem(SOFT_DELETED_STUDENTS_KEY, JSON.stringify(map));
    return record;
  } catch (e) {
    console.warn("Could not record soft deleted student:", e);
  }
};

export const restoreStudent = (studentOrId) => {
  if (!studentOrId) return;
  try {
    const map = getSoftDeletedStudentsMap();
    const id =
      typeof studentOrId === "object"
        ? (studentOrId.Id ?? studentOrId.id)
        : studentOrId;
    const adm =
      typeof studentOrId === "object"
        ? (studentOrId.AdmissionNumber ?? studentOrId.admissionNumber)
        : null;
    const userId =
      typeof studentOrId === "object"
        ? (studentOrId.UserId ?? studentOrId.userId)
        : null;

    if (id) {
      delete map[String(id)];
      delete map[Number(id)];
    }
    if (adm) {
      delete map[String(adm).toLowerCase()];
      delete map[String(adm)];
    }
    if (userId) {
      delete map[String(userId).toLowerCase()];
      delete map[String(userId)];
    }
    if (typeof studentOrId === "string") {
      delete map[studentOrId.trim()];
      delete map[studentOrId.trim().toLowerCase()];
    }
    localStorage.setItem(SOFT_DELETED_STUDENTS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Could not restore student:", e);
  }
};

// =====================================================
// STUDENT SERVICE
// =====================================================

import { getToken, getUserId, getUsername } from "../Utils/auth";
import { getDepartmentDropdown } from "./departmentService";
import { getClassDropdown, getAllClass } from "./classService";
import { getSectionDropdown, getAllSection } from "./sectionService";
import { getAllUsers } from "./userService";
import {
  getAllAcademicYear,
  getAcademicYearDropdown,
} from "./academicYearService";
import { enrollStudent } from "./studentPromotionService";

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
// PARSE STUDENT ERROR MESSAGE (FRIENDLY ERROR MAPPING)
// =====================================================

export const parseStudentErrorMessage = (error) => {
  if (!error) {
    return "An unexpected error occurred.";
  }

  const raw =
    typeof error === "string"
      ? error
      : error?.message || error?.Error || error?.error || String(error);

  // 1. Aadhaar unique index
  if (
    raw.includes("IX_Students_AadhaarNumber") ||
    raw.toLowerCase().includes("aadhaarnumber")
  ) {
    const match = raw.match(/\(([^)]+)\)/);
    const val = match ? ` (${match[1]})` : "";
    return `A student with Aadhaar Number${val} already exists. Please check and enter a unique Aadhaar number.`;
  }

  // 2. Admission Number unique index
  if (
    raw.includes("IX_Students_AdmissionNumber") ||
    raw.toLowerCase().includes("admissionnumber")
  ) {
    const match = raw.match(/\(([^)]+)\)/);
    const val = match ? ` (${match[1]})` : "";
    return `A student with Admission Number${val} already exists. Please enter a unique admission number.`;
  }

  // 3. UserId unique index
  if (
    raw.includes("IX_Students_UserId") ||
    raw.toLowerCase().includes("ix_students_userid")
  ) {
    return "The selected student user account is already assigned to an existing student profile. Please choose a different student user.";
  }

  // 4. Email unique index
  if (
    raw.includes("IX_Students_Email") ||
    raw.toLowerCase().includes("ix_students_email")
  ) {
    const match = raw.match(/\(([^)]+)\)/);
    const val = match ? ` (${match[1]})` : "";
    return `A student with Email${val} already exists. Please enter a unique email address.`;
  }

  // 5. Generic duplicate key error
  if (
    raw.includes("Cannot insert duplicate key") ||
    raw.toLowerCase().includes("duplicate key")
  ) {
    const match = raw.match(/\(([^)]+)\)/);
    const val = match ? ` (${match[1]})` : "";
    return `A duplicate record was found${val}. Please ensure all unique fields (Aadhaar, Admission Number, Email, and Student User) are unique.`;
  }

  return raw;
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
      data?.Message || data?.message || "Unauthorized. Please login again.",
    );
  }

  // ===================================================
  // FORBIDDEN
  // ===================================================

  if (response.status === 403) {
    throw new Error(
      data?.Message ||
        data?.message ||
        "You do not have permission to perform this action.",
    );
  }

  // ===================================================
  // NOT FOUND
  // ===================================================

  if (response.status === 404) {
    throw new Error(
      data?.Message || data?.message || "Student record not found.",
    );
  }

  // ===================================================
  // OTHER HTTP ERRORS
  // ===================================================

  if (!response.ok) {
    let errorMessage =
      data?.Message ||
      data?.message ||
      data?.Error ||
      data?.error ||
      "Request failed.";

    // APIResponse Errors array
    if (Array.isArray(data?.Errors) && data.Errors.length > 0) {
      errorMessage = data.Errors.join(", ");
    }

    // ModelState validation errors
    if (data?.errors && typeof data.errors === "object") {
      const validationErrors = Object.values(data.errors)
        .flat()
        .filter(Boolean);

      if (validationErrors.length > 0) {
        errorMessage = validationErrors.join(", ");
      }
    }

    throw new Error(parseStudentErrorMessage(errorMessage));
  }

  // ===================================================
  // API RESPONSE FAILURE
  // ===================================================

  if (data?.Status === false) {
    let errorMessage = data?.Message || data?.message || "Request failed.";

    if (Array.isArray(data?.Errors) && data.Errors.length > 0) {
      errorMessage = data.Errors.join(", ");
    }

    throw new Error(parseStudentErrorMessage(errorMessage));
  }

  // ===================================================
  // UNWRAP DATA
  // ===================================================

  if (data?.Data !== undefined) {
    return data.Data;
  }

  if (data?.data !== undefined) {
    return data.data;
  }

  return data;
};

// =====================================================
// NORMALIZE STUDENT (RETURNS BOTH PASCALCASE & CAMELCASE KEYS)
// =====================================================

const normalizeStudent = (student) => {
  if (!student || typeof student !== "object") {
    return student;
  }

  const id = student.Id ?? student.id;
  const userId = student.UserId ?? student.userId;
  const departmentId = student.DepartmentId ?? student.departmentId;

  const admissionNumber =
    student.AdmissionNumber ??
    student.admissionNumber ??
    student.AdmissionNo ??
    student.admissionNo ??
    "";

  const savedYearFromStorage =
    getSavedStudentAcademicYear(id) ||
    getSavedStudentAcademicYear(admissionNumber) ||
    getSavedStudentAcademicYear(userId) ||
    null;

  const academicYearId =
    savedYearFromStorage ||
    (student.AcademicYearId ??
      student.academicYearId ??
      student.AcademicYear?.Id ??
      student.academicYear?.id ??
      student.StudentAcademicYears?.[0]?.AcademicYearId ??
      student.studentAcademicYears?.[0]?.academicYearId ??
      student.StudentFees?.[0]?.AcademicYearId ??
      student.studentFees?.[0]?.academicYearId ??
      null);

  const academicYearName =
    student.AcademicYearName ??
    student.academicYearName ??
    student.AcademicYear?.YearName ??
    student.academicYear?.yearName ??
    student.AcademicYear?.Name ??
    student.academicYear?.name ??
    "";

  const schoolClassId =
    student.SchoolClassId ??
    student.schoolClassId ??
    student.ClassId ??
    student.classId;

  const sectionId = student.SectionId ?? student.sectionId;

  const rollNumber =
    student.RollNumber ??
    student.rollNumber ??
    student.RollNo ??
    student.rollNo ??
    student.Roll_Number ??
    student.roll_number ??
    (getSavedStudentRollNumber(id) ||
      getSavedStudentRollNumber(admissionNumber) ||
      getSavedStudentRollNumber(userId) ||
      "");

  const admissionDate = student.AdmissionDate ?? student.admissionDate;

  const firstName = student.FirstName ?? student.firstName ?? "";
  const middleName = student.MiddleName ?? student.middleName ?? "";
  const lastName = student.LastName ?? student.lastName ?? "";

  const studentName =
    student.StudentName ??
    student.studentName ??
    student.name ??
    student.Name ??
    [firstName, middleName, lastName].filter(Boolean).join(" ");

  const fatherName =
    student.FatherName ??
    student.fatherName ??
    student.Father_Name ??
    student.father_name ??
    "";

  const motherName =
    student.MotherName ??
    student.motherName ??
    student.Mother_Name ??
    student.mother_name ??
    "";

  const dob =
    student.DOB ?? student.dob ?? student.DateOfBirth ?? student.dateOfBirth;

  const gender = student.Gender ?? student.gender ?? "";
  const bloodGroup = student.BloodGroup ?? student.bloodGroup ?? "";

  const photo =
    student.Photo ??
    student.photo ??
    student.PhotoUrl ??
    student.photoUrl ??
    student.ProfilePhoto ??
    student.profilePhoto ??
    student.Image ??
    student.image ??
    student.PhotoPath ??
    student.photoPath ??
    student.UserPhoto ??
    student.userPhoto ??
    student.User?.Photo ??
    student.user?.photo ??
    null;

  const aadhaarNumber =
    student.AadhaarNumber ??
    student.aadhaarNumber ??
    student.AadharNumber ??
    student.aadharNumber ??
    "";

  const religion = student.Religion ?? student.religion ?? "";
  const category = student.Category ?? student.category ?? "";
  const nationality = student.Nationality ?? student.nationality ?? "";
  const email = student.Email ?? student.email ?? "";
  const phoneNumber =
    student.PhoneNumber ??
    student.phoneNumber ??
    student.Phone ??
    student.phone ??
    "";

  const alternatePhoneNumber =
    student.AlternatePhoneNumber ??
    student.alternatePhoneNumber ??
    student.AlternatePhone ??
    student.alternatePhone ??
    "";

  const address = student.Address ?? student.address ?? "";

  const isActive = student.IsActive ?? student.isActive ?? true;

  const createdBy = student.CreatedBy ?? student.createdBy;
  const createdByName =
    student.CreatedByName ??
    student.createdByName ??
    student.CreatedByUser?.Username ??
    student.createdByUser?.username;

  const createdDate = student.CreatedDate ?? student.createdDate;
  const updatedBy = student.UpdatedBy ?? student.updatedBy;
  const updatedByName =
    student.UpdatedByName ??
    student.updatedByName ??
    student.UpdatedByUser?.Username ??
    student.updatedByUser?.username;

  const updatedDate = student.UpdatedDate ?? student.updatedDate;

  const departmentName =
    student.DepartmentName ??
    student.departmentName ??
    student.Department?.DepartmentName ??
    student.department?.departmentName ??
    student.Department?.Name ??
    student.department?.name ??
    "";

  const className =
    student.ClassName ??
    student.className ??
    student.SchoolClass?.ClassName ??
    student.schoolClass?.className ??
    student.SchoolClass?.Name ??
    student.schoolClass?.name ??
    student.Class?.Name ??
    student.class?.name ??
    "";

  const sectionName =
    student.SectionName ??
    student.sectionName ??
    student.Section?.SectionName ??
    student.section?.sectionName ??
    student.Section?.Name ??
    student.section?.name ??
    "";

  const academicHistory =
    student.AcademicHistory ??
    student.academicHistory ??
    student.StudentAcademicYears ??
    student.studentAcademicYears ??
    [];

  const studentAcademicYears = academicHistory;

  const status =
    student.Status ?? student.status ?? (isActive ? "Active" : "Inactive");

  const isPromoted = Boolean(
    student.IsPromoted ?? student.isPromoted ?? status === "Promoted",
  );

  const userName =
    student.UserName ??
    student.userName ??
    student.Username ??
    student.username ??
    "";

  return {
    // PascalCase Properties
    Id: id,
    UserId: userId,
    DepartmentId: departmentId,
    AcademicYearId: academicYearId,
    AcademicYearName: academicYearName,
    SchoolClassId: schoolClassId,
    ClassId: schoolClassId,
    SectionId: sectionId,
    AdmissionNumber: admissionNumber,
    AdmissionNo: admissionNumber,
    RollNumber: rollNumber,
    RollNo: rollNumber,
    AdmissionDate: admissionDate,
    FirstName: firstName,
    MiddleName: middleName,
    LastName: lastName,
    StudentName: studentName,
    Name: studentName,
    FatherName: fatherName,
    MotherName: motherName,
    DOB: dob,
    DateOfBirth: dob,
    Gender: gender,
    BloodGroup: bloodGroup,
    Photo: photo,
    PhotoUrl: photo,
    AadhaarNumber: aadhaarNumber,
    AadharNumber: aadhaarNumber,
    Religion: religion,
    Category: category,
    Nationality: nationality,
    Email: email,
    PhoneNumber: phoneNumber,
    Phone: phoneNumber,
    AlternatePhoneNumber: alternatePhoneNumber,
    AlternatePhone: alternatePhoneNumber,
    Address: address,
    IsActive: isActive,
    CreatedBy: createdBy,
    CreatedByName: createdByName,
    CreatedDate: createdDate,
    UpdatedBy: updatedBy,
    UpdatedByName: updatedByName,
    UpdatedDate: updatedDate,
    DepartmentName: departmentName,
    ClassName: className,
    SectionName: sectionName,
    AcademicHistory: academicHistory,
    StudentAcademicYears: studentAcademicYears,
    Status: status,
    IsPromoted: isPromoted,
    UserName: userName,

    // camelCase Aliases for universal compatibility
    id,
    userId,
    departmentId,
    academicYearId,
    academicYearName,
    schoolClassId,
    classId: schoolClassId,
    sectionId,
    admissionNumber,
    admissionNo: admissionNumber,
    rollNumber,
    rollNo: rollNumber,
    admissionDate,
    firstName,
    middleName,
    lastName,
    studentName,
    name: studentName,
    fatherName,
    motherName,
    dob,
    dateOfBirth: dob,
    gender,
    bloodGroup,
    photo,
    photoUrl: photo,
    aadhaarNumber,
    aadharNumber: aadhaarNumber,
    religion,
    category,
    nationality,
    email,
    phoneNumber,
    phone: phoneNumber,
    alternatePhoneNumber,
    alternatePhone: alternatePhoneNumber,
    address,
    isActive,
    createdBy,
    createdByName,
    createdDate,
    updatedBy,
    updatedByName,
    updatedDate,
    departmentName,
    className,
    sectionName,
    academicHistory,
    studentAcademicYears,
    status,
    isPromoted,
    userName,
  };
};

// =====================================================
// FORMAT PHOTO URL
// =====================================================

export const formatPhotoUrl = (photo) => {
  if (!photo || typeof photo !== "string") {
    return null;
  }

  const trimmed = photo.trim();

  if (!trimmed || trimmed === "null" || trimmed === "undefined") {
    return null;
  }

  if (
    trimmed.startsWith("data:") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  const cleanPath = trimmed.startsWith("/") ? trimmed.substring(1) : trimmed;

  return `https://localhost:7164/${cleanPath}`;
};

// =====================================================
// COMPRESS IMAGE FILE (RESIZE AND ENCODE AS CLEAN JPEG)
// =====================================================

export const compressImageFile = (
  file,
  maxWidth = 1000,
  maxHeight = 1000,
  quality = 0.85,
) => {
  return new Promise((resolve, reject) => {
    if (!file || !(file instanceof File || file instanceof Blob)) {
      resolve(null);
      return;
    }

    if (!file.type || !file.type.startsWith("image/")) {
      reject(new Error("Selected file is not a valid image."));
      return;
    }

    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Failed to read image file."));

    reader.onload = (readerEvent) => {
      const img = new Image();

      img.onerror = () =>
        reject(new Error("Failed to load image for processing."));

      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(readerEvent.target.result);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        try {
          const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);

          resolve(compressedDataUrl);
        } catch {
          resolve(readerEvent.target.result);
        }
      };

      img.src = readerEvent.target.result;
    };

    reader.readAsDataURL(file);
  });
};

// =====================================================
// OPEN PHOTO IN NEW TAB (DEDICATED PHOTO VIEWER)
// =====================================================

export const openPhotoInNewTab = (photoUrl) => {
  if (!photoUrl) {
    alert("No photo is available to view.");
    return;
  }

  let url = typeof photoUrl === "string" ? photoUrl.trim() : "";

  if (photoUrl instanceof File || photoUrl instanceof Blob) {
    url = URL.createObjectURL(photoUrl);
  }

  if (!url) {
    alert("No photo is available to view.");
    return;
  }

  // Prepend backend URL if it's a relative path
  if (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("data:") &&
    !url.startsWith("blob:")
  ) {
    const cleanPath = url.startsWith("/") ? url.substring(1) : url;

    url = `https://localhost:7164/${cleanPath}`;
  }

  const newWindow = window.open("", "_blank");

  if (!newWindow) {
    alert(
      "Pop-up was blocked. Please allow pop-ups for this site to view the photo.",
    );
    return;
  }

  newWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
        <title>Student Photo</title>

        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }

          html,
          body {
            width: 100%;
            height: 100%;
            background: #090d16;
            color: #f1f5f9;
            font-family:
              system-ui,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Roboto,
              sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 24px;
            overflow: auto;
          }

          .photo-stage {
            display: flex;
            flex-direction: column;
            align-items: center;
            background: #1e293b;
            border: 1px solid #334155;
            border-radius: 14px;
            padding: 20px;
            max-width: 94vw;
            max-height: 92vh;
            box-shadow:
              0 25px 50px -12px rgba(0, 0, 0, 0.7);
          }

          .photo-frame {
            display: flex;
            align-items: center;
            justify-content: center;
            background: #020617;
            border-radius: 10px;
            padding: 8px;
            overflow: hidden;
          }

          img {
            max-width: 82vw;
            max-height: 72vh;
            object-fit: contain;
            display: block;
            border-radius: 6px;
          }

          .photo-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 100%;
            margin-top: 14px;
            padding: 4px 6px;
            gap: 16px;
          }

          .photo-title {
            font-size: 14px;
            font-weight: 600;
            color: #cbd5e1;
            display: flex;
            align-items: center;
            gap: 6px;
          }

          .photo-actions {
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .action-btn {
            background: #475569;
            color: white;
            border: none;
            padding: 7px 16px;
            border-radius: 6px;
            font-size: 13px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;
          }

          .action-btn:hover {
            background: #334155;
          }
        </style>
      </head>

      <body>
        <div class="photo-stage">

          <div class="photo-frame">
            <img
              src="${url}"
              alt="Student Photo"
              onerror="this.onerror=null; this.parentElement.innerHTML='<div style=\\'padding:40px;color:#f87171;font-size:15px;text-align:center;\\'>⚠️ Unable to load student photo.<br><small style=\\'color:#94a3b8;font-size:12px;\\'>URL or data might be invalid.</small></div>';"
            />
          </div>

          <div class="photo-footer">

            <div class="photo-title">
              📷 Student Photo
            </div>

            <div class="photo-actions">
              <button
                class="action-btn"
                onclick="window.close()"
              >
                ✕ Close Tab
              </button>
            </div>

          </div>

        </div>
      </body>
    </html>
  `);

  newWindow.document.close();
};

// =====================================================
// LOCAL STORAGE STUDENT TO ACADEMIC YEAR MAPPING CACHE
// =====================================================

export const getStoredStudentAcademicYearMap = () => {
  try {
    const raw = localStorage.getItem("student_academic_years_map");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveStudentAcademicYear = (identifier, yearId) => {
  if (!identifier || !yearId) return;
  try {
    const current = getStoredStudentAcademicYearMap();
    const cleanId = String(identifier).trim();
    const cleanYear = String(yearId).trim();
    current[cleanId] = cleanYear;
    current[cleanId.toLowerCase()] = cleanYear;
    localStorage.setItem("student_academic_years_map", JSON.stringify(current));
  } catch (err) {
    console.warn("saveStudentAcademicYear error:", err);
  }
};

export const getSavedStudentAcademicYear = (identifier) => {
  if (!identifier) return "";
  try {
    const current = getStoredStudentAcademicYearMap();
    const cleanId = String(identifier).trim();
    return current[cleanId] || current[cleanId.toLowerCase()] || "";
  } catch {
    return "";
  }
};

export const getStoredStudentRollNumberMap = () => {
  try {
    const raw = localStorage.getItem("student_roll_numbers_map");
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const saveStudentRollNumber = (identifier, rollNumber) => {
  if (!identifier || rollNumber === undefined || rollNumber === null) return;
  const val = String(rollNumber).trim();
  if (!val) return;
  try {
    const current = getStoredStudentRollNumberMap();
    current[String(identifier).trim()] = val;
    localStorage.setItem("student_roll_numbers_map", JSON.stringify(current));
  } catch (err) {
    console.warn("saveStudentRollNumber error:", err);
  }
};

export const getSavedStudentRollNumber = (identifier) => {
  if (!identifier) return "";
  try {
    const current = getStoredStudentRollNumberMap();
    return current[String(identifier).trim()] || "";
  } catch {
    return "";
  }
};

// =====================================================
// GET ACADEMIC MAPS (DEPARTMENT, CLASS, SECTION, YEARS)
// =====================================================

let cachedAcademicMaps = null;
let lastMapsFetchTime = 0;
const MAPS_CACHE_TTL = 30000; // 30 seconds cache

export const getAcademicMaps = async (forceRefresh = false) => {
  const now = Date.now();
  if (
    !forceRefresh &&
    cachedAcademicMaps &&
    now - lastMapsFetchTime < MAPS_CACHE_TTL
  ) {
    return cachedAcademicMaps;
  }

  const deptMap = {};
  const classMap = {};
  const secMap = {};

  // 1. Departments
  try {
    const depts = await getStudentDepartmentDropdown();

    if (Array.isArray(depts)) {
      depts.forEach((d) => {
        const id = d.id ?? d.Id ?? d.code ?? d.Code;

        const name =
          d.text ??
          d.Text ??
          d.name ??
          d.Name ??
          d.departmentName ??
          d.DepartmentName;

        if (id !== undefined && id !== null && name) {
          deptMap[String(id)] = name;
        }
      });
    }
  } catch (err) {
    console.warn("getAcademicMaps: failed to load departments:", err);
  }

  // 2. Classes
  try {
    let classes = [];

    try {
      classes = await getAllClass();
    } catch {
      classes = await getClassDropdown();
    }

    if (Array.isArray(classes)) {
      classes.forEach((c) => {
        const id = c.Id ?? c.id ?? c.ClassId ?? c.classId ?? c.code ?? c.Code;

        const name =
          c.ClassName ?? c.className ?? c.text ?? c.Text ?? c.name ?? c.Name;

        if (id !== undefined && id !== null && name) {
          classMap[String(id)] = name;
        }
      });
    }
  } catch (err) {
    console.warn("getAcademicMaps: failed to load classes:", err);
  }

  // 3. Sections
  try {
    let sections = [];

    try {
      sections = await getAllSection();
    } catch {
      sections = await getSectionDropdown();
    }

    if (Array.isArray(sections)) {
      sections.forEach((s) => {
        const id =
          s.Id ?? s.id ?? s.SectionId ?? s.sectionId ?? s.code ?? s.Code;

        const name =
          s.SectionName ??
          s.sectionName ??
          s.text ??
          s.Text ??
          s.name ??
          s.Name;

        if (id !== undefined && id !== null && name) {
          secMap[String(id)] = name;
        }
      });
    }
  } catch (err) {
    console.warn("getAcademicMaps: failed to load sections:", err);
  }

  // 4. Users (for CreatedBy and UpdatedBy display names)
  const userMap = {};

  try {
    const allUsersResponse = await getAllUsers();

    const users = Array.isArray(allUsersResponse)
      ? allUsersResponse
      : allUsersResponse?.data || allUsersResponse?.Data || [];

    if (Array.isArray(users)) {
      users.forEach((u) => {
        const id = u.id ?? u.Id;

        const name =
          u.username ??
          u.Username ??
          u.name ??
          u.Name ??
          u.userName ??
          u.UserName;

        if (id && name) {
          userMap[String(id)] = name;
        }
      });
    }
  } catch (err) {
    console.warn("getAcademicMaps: failed to load users:", err);
  }

  // 5. Academic Years
  const academicYearMap = {};
  let academicYearsList = [];
  let currentAcademicYear = null;
  let latestAcademicYear = null;

  try {
    let academicYears = [];
    try {
      academicYears = await getAllAcademicYear();
    } catch {
      academicYears = await getAcademicYearDropdown();
    }

    const yearList = Array.isArray(academicYears)
      ? academicYears
      : academicYears?.data || academicYears?.Data || [];

    if (Array.isArray(yearList) && yearList.length > 0) {
      academicYearsList = yearList;

      yearList.forEach((y) => {
        const id = y.Id ?? y.id ?? y.code ?? y.Code;
        const name =
          y.YearName ?? y.yearName ?? y.Name ?? y.name ?? y.text ?? y.Text;

        if (id !== undefined && id !== null && name) {
          academicYearMap[String(id)] = String(name);
        }

        const isCurr = y.IsCurrent ?? y.isCurrent ?? false;
        if (isCurr) {
          currentAcademicYear = y;
        }
      });

      const sorted = [...yearList].sort((a, b) => {
        const idA = Number(a.Id ?? a.id ?? a.code ?? a.Code ?? 0);
        const idB = Number(b.Id ?? b.id ?? b.code ?? b.Code ?? 0);
        return idB - idA;
      });
      latestAcademicYear = sorted[0];
    }
  } catch (err) {
    console.warn("getAcademicMaps: failed to load academic years:", err);
  }

  cachedAcademicMaps = {
    deptMap,
    classMap,
    secMap,
    userMap,
    academicYearMap,
    academicYearsList,
    currentAcademicYear,
    latestAcademicYear,
  };
  lastMapsFetchTime = now;

  return cachedAcademicMaps;
};

// =====================================================
// RESOLVE STUDENT ACADEMIC YEAR (INTELLIGENT RESOLUTION)
// =====================================================

export const resolveStudentAcademicYear = (student, maps = {}) => {
  if (!student || typeof student !== "object") {
    return { academicYearId: null, academicYearName: "" };
  }

  const {
    academicYearMap = {},
    academicYearsList = [],
    currentAcademicYear = null,
    latestAcademicYear = null,
  } = maps;

  let yearId =
    student.AcademicYearId ??
    student.academicYearId ??
    student.AcademicYear?.Id ??
    student.academicYear?.id ??
    null;

  let yearName =
    student.AcademicYearName ??
    student.academicYearName ??
    student.AcademicYear?.YearName ??
    student.academicYear?.yearName ??
    "";

  // Check saved localStorage mapping FIRST (overrides server defaults)
  const savedYear =
    getSavedStudentAcademicYear(student.Id ?? student.id) ||
    getSavedStudentAcademicYear(
      student.AdmissionNumber ?? student.admissionNumber,
    ) ||
    getSavedStudentAcademicYear(student.UserId ?? student.userId);

  if (savedYear) {
    yearId = savedYear;
    yearName = "";
  }

  // 1. Direct match from academicYearMap if yearId is present
  if (yearId && !yearName && academicYearMap[String(yearId)]) {
    yearName = academicYearMap[String(yearId)];
  }

  // 2. Check local storage cache mapping (saved from CreateStudent/UpdateStudent)
  if (!yearName) {
    const localMap = getStoredStudentAcademicYearMap();
    const idKey = student.Id ? String(student.Id).trim() : null;
    const admKey =
      (student.AdmissionNumber ?? student.admissionNumber)
        ? String(student.AdmissionNumber ?? student.admissionNumber).trim()
        : null;
    const userKey =
      (student.UserId ?? student.userId)
        ? String(student.UserId ?? student.userId).trim()
        : null;

    const matchedLocalId =
      (idKey && (localMap[idKey] || localMap[idKey.toLowerCase()])) ||
      (admKey && (localMap[admKey] || localMap[admKey.toLowerCase()])) ||
      (userKey && (localMap[userKey] || localMap[userKey.toLowerCase()]));

    if (matchedLocalId) {
      yearId = matchedLocalId;
      if (academicYearMap[String(yearId)]) {
        yearName = academicYearMap[String(yearId)];
      }
    }
  }

  // 3. Match against student's AdmissionDate or CreatedDate (ONLY if yearId is still unknown)
  if (
    !yearName &&
    (!yearId || yearId === "null") &&
    Array.isArray(academicYearsList) &&
    academicYearsList.length > 0
  ) {
    const dateToMatch = student.AdmissionDate || student.CreatedDate;
    if (dateToMatch) {
      const d = new Date(dateToMatch);
      if (!isNaN(d.getTime())) {
        // 3a. Exact date range match (StartDate <= d <= EndDate)
        const matchedByRange = academicYearsList.find((y) => {
          const start = y.StartDate || y.startDate;
          const end = y.EndDate || y.endDate;
          if (start && end) {
            const sd = new Date(start);
            const ed = new Date(end);
            if (!isNaN(sd.getTime()) && !isNaN(ed.getTime())) {
              return d >= sd && d <= ed;
            }
          }
          return false;
        });

        if (matchedByRange) {
          yearId =
            matchedByRange.Id ??
            matchedByRange.id ??
            matchedByRange.code ??
            matchedByRange.Code;
          yearName =
            matchedByRange.YearName ??
            matchedByRange.yearName ??
            matchedByRange.Name ??
            matchedByRange.name ??
            matchedByRange.text ??
            matchedByRange.Text ??
            "";
        }

        // 3b. Match calendar year string in YearName (e.g. 2025 in "2025-2026")
        if (!yearName) {
          const calYear = String(d.getFullYear());
          const matchedByCalYear = academicYearsList.find((y) => {
            const yName = String(
              y.YearName ??
                y.yearName ??
                y.Name ??
                y.name ??
                y.text ??
                y.Text ??
                "",
            );
            return yName.includes(calYear);
          });

          if (matchedByCalYear) {
            yearId =
              matchedByCalYear.Id ??
              matchedByCalYear.id ??
              matchedByCalYear.code ??
              matchedByCalYear.Code;
            yearName =
              matchedByCalYear.YearName ??
              matchedByCalYear.yearName ??
              matchedByCalYear.Name ??
              matchedByCalYear.name ??
              matchedByCalYear.text ??
              matchedByCalYear.Text ??
              "";
          }
        }
      }
    }
  }

  // 4. Fallback: ONLY if yearId is still unknown and yearName is empty
  if (!yearName && (!yearId || yearId === "null")) {
    const fallback =
      currentAcademicYear ||
      latestAcademicYear ||
      (academicYearsList.length > 0 ? academicYearsList[0] : null);

    if (fallback) {
      yearId =
        fallback.Id ?? fallback.id ?? fallback.code ?? fallback.Code ?? yearId;
      yearName =
        fallback.YearName ??
        fallback.yearName ??
        fallback.Name ??
        fallback.name ??
        fallback.text ??
        fallback.Text ??
        "";
    }
  }

  // 5. Final fallback if yearId exists but yearName not found
  if (!yearName && yearId && yearId !== "null") {
    yearName = academicYearMap[String(yearId)] || `Year #${yearId}`;
  }

  return {
    academicYearId:
      yearId !== null && yearId !== undefined && yearId !== "null"
        ? String(yearId)
        : null,
    academicYearName: yearName || "",
  };
};

// =====================================================
// ENRICH STUDENT WITH ACADEMIC LABELS AND PHOTO
// =====================================================

export const enrichStudent = (student, maps = {}) => {
  if (!student || typeof student !== "object") {
    return student;
  }

  const { deptMap = {}, classMap = {}, secMap = {}, userMap = {} } = maps;

  const resolved = resolveStudentAcademicYear(student, maps);
  const academicYearId =
    resolved.academicYearId ||
    student.AcademicYearId ||
    student.academicYearId ||
    null;
  const academicYearName =
    resolved.academicYearName ||
    student.AcademicYearName ||
    student.academicYearName ||
    "";

  const deptName =
    student.DepartmentName ||
    (student.DepartmentId && deptMap[String(student.DepartmentId)]) ||
    (student.DepartmentId ? `Dept #${student.DepartmentId}` : "");

  const className =
    student.ClassName ||
    (student.SchoolClassId && classMap[String(student.SchoolClassId)]) ||
    (student.SchoolClassId ? `Class #${student.SchoolClassId}` : "");

  const secName =
    student.SectionName ||
    (student.SectionId && secMap[String(student.SectionId)]) ||
    (student.SectionId ? `Sec #${student.SectionId}` : "");

  const createdByRaw = student.CreatedBy;
  const updatedByRaw = student.UpdatedBy;

  const currentUserId = getUserId();
  const currentUsername = getUsername();

  const createdByName =
    student.CreatedByName ||
    (createdByRaw && userMap[String(createdByRaw)]) ||
    (createdByRaw &&
    currentUserId &&
    String(createdByRaw) === String(currentUserId)
      ? currentUsername
      : null) ||
    createdByRaw ||
    "-";

  const updatedByName =
    student.UpdatedByName ||
    (updatedByRaw && userMap[String(updatedByRaw)]) ||
    (updatedByRaw &&
    currentUserId &&
    String(updatedByRaw) === String(currentUserId)
      ? currentUsername
      : null) ||
    (updatedByRaw ? updatedByRaw : null);

  const academicHistory =
    student.AcademicHistory ??
    student.academicHistory ??
    student.StudentAcademicYears ??
    student.studentAcademicYears ??
    [];

  const studentStatus = student.Status ?? student.status ?? "Active";
  const studentIsPromoted = Boolean(
    student.IsPromoted ?? student.isPromoted ?? studentStatus === "Promoted",
  );
  const studentPhoto = formatPhotoUrl(student.Photo ?? student.photo);

  return {
    ...student,

    // PascalCase
    AcademicYearId: academicYearId,
    AcademicYearName: academicYearName,
    AcademicHistory: academicHistory,
    StudentAcademicYears: academicHistory,
    Status: studentStatus,
    IsPromoted: studentIsPromoted,
    DepartmentName: deptName,
    ClassName: className,
    SectionName: secName,
    CreatedByName: createdByName,
    UpdatedByName: updatedByName,
    Photo: studentPhoto,

    // camelCase
    academicYearId: academicYearId,
    academicYearName: academicYearName,
    academicHistory: academicHistory,
    studentAcademicYears: academicHistory,
    status: studentStatus,
    isPromoted: studentIsPromoted,
    departmentName: deptName,
    className: className,
    sectionName: secName,
    createdByName: createdByName,
    updatedByName: updatedByName,
    photo: studentPhoto,
  };
};

// =====================================================
// GET ALL STUDENTS
// =====================================================

export const getAllStudents = async (allowSoftDeleted = false) => {
  checkToken();

  const response = await fetch(`${API_URL}Student/All`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(normalizeStudent)
    .filter((s) => (allowSoftDeleted ? true : !isStudentSoftDeleted(s)));
};

// =====================================================
// GET ALL STUDENTS WITH DETAILS (ENRICHED)
// =====================================================

export const getAllStudentsWithDetails = async (allowSoftDeleted = false) => {
  const [students, maps] = await Promise.all([
    getAllStudents(allowSoftDeleted),

    getAcademicMaps().catch(() => ({
      deptMap: {},
      classMap: {},
      secMap: {},
    })),
  ]);

  if (!Array.isArray(students)) {
    return [];
  }

  return students
    .filter((s) => (allowSoftDeleted ? true : !isStudentSoftDeleted(s)))
    .map((s) => enrichStudent(s, maps));
};

// =====================================================
// GET STUDENT BY ID OR ADMISSION NUMBER
// =====================================================

export const getStudentById = async (id, allowSoftDeleted = false) => {
  checkToken();

  if (!id) {
    throw new Error("Student ID or Admission Number is required.");
  }

  const cleanId = String(id).trim();

  if (!allowSoftDeleted && isStudentSoftDeleted(cleanId)) {
    throw new Error(
      `Student with ID ${cleanId} not found or has been deleted.`,
    );
  }

  const maps = await getAcademicMaps().catch(() => ({
    deptMap: {},
    classMap: {},
    secMap: {},
  }));

  // 1. Try direct API endpoint if ID is numeric
  if (!isNaN(cleanId) && Number(cleanId) > 0) {
    try {
      const response = await fetch(`${API_URL}Student/id/${cleanId}`, {
        method: "GET",
        headers: getHeaders(),
      });

      if (response.ok) {
        const data = await handleResponse(response);
        const normalized = normalizeStudent(data);
        if (!allowSoftDeleted && isStudentSoftDeleted(normalized)) {
          throw new Error(
            `Student with ID ${cleanId} not found or has been deleted.`,
          );
        }
        return enrichStudent(normalized, maps);
      }
    } catch (err) {
      if (err.message && err.message.includes("deleted")) throw err;
      console.warn(
        "Direct Student/id/{id} failed, trying getAllStudents fallback:",
        err,
      );
    }
  }

  // 2. Fallback: Search in getAllStudents()
  try {
    const all = await getAllStudents(allowSoftDeleted);

    const queryLower = cleanId.toLowerCase();

    const matched = all.find((s) => {
      const sId = String(s.Id ?? s.id ?? "");
      const sAdm = String(
        s.AdmissionNumber ??
          s.admissionNumber ??
          s.AdmissionNo ??
          s.admissionNo ??
          "",
      ).toLowerCase();
      const sRoll = String(
        s.RollNumber ?? s.rollNumber ?? s.RollNo ?? s.rollNo ?? "",
      ).toLowerCase();
      const sUser = String(s.UserId ?? s.userId ?? "").toLowerCase();
      const sName = String(s.StudentName ?? s.studentName ?? "").toLowerCase();

      return (
        sId === cleanId ||
        sAdm === queryLower ||
        sRoll === queryLower ||
        sUser === queryLower ||
        sName === queryLower
      );
    });

    if (matched) {
      return enrichStudent(normalizeStudent(matched), maps);
    }
  } catch (allErr) {
    console.warn(
      "getAllStudents search in getStudentById fallback failed:",
      allErr,
    );
  }

  throw new Error(`Student record not found for "${cleanId}".`);
};

// =====================================================
// GET STUDENT BY NAME
// =====================================================

export const getStudentByName = async (name) => {
  checkToken();

  if (!name || !name.trim()) {
    throw new Error("Student name is required.");
  }

  const query = name.trim();

  const maps = await getAcademicMaps().catch(() => ({
    deptMap: {},
    classMap: {},
    secMap: {},
  }));

  // 1. Try direct API endpoint first
  try {
    const response = await fetch(
      `${API_URL}Student/Name/${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (response.ok) {
      const data = await response.json().catch(() => null);

      const rawList = Array.isArray(data)
        ? data
        : data?.data || data?.Data
          ? Array.isArray(data.data)
            ? data.data
            : data.Data
          : data
            ? [data]
            : [];

      if (Array.isArray(rawList) && rawList.length > 0) {
        return rawList
          .map(normalizeStudent)
          .filter((s) => !isStudentSoftDeleted(s))
          .map((s) => enrichStudent(s, maps));
      }
    }
  } catch (err) {
    console.warn(
      "Direct Student/Name/{name} failed, trying getAllStudents fallback:",
      err,
    );
  }

  // 2. Fallback: Search inside all students
  try {
    const allStudents = await getAllStudents();

    const q = query.toLowerCase();

    const matched = allStudents.filter((s) => {
      const fn = String(s.FirstName || "").toLowerCase();

      const mn = String(s.MiddleName || "").toLowerCase();

      const ln = String(s.LastName || "").toLowerCase();

      const full = `${fn} ${mn} ${ln}`.replace(/\s+/g, " ").trim();

      const un = String(s.UserName || "").toLowerCase();

      const adm = String(s.AdmissionNumber || "").toLowerCase();

      const em = String(s.Email || "").toLowerCase();

      const ph = String(s.PhoneNumber || "").toLowerCase();

      return (
        fn.includes(q) ||
        mn.includes(q) ||
        ln.includes(q) ||
        full.includes(q) ||
        un.includes(q) ||
        adm.includes(q) ||
        em.includes(q) ||
        ph.includes(q)
      );
    });

    if (matched.length > 0) {
      return matched.map((s) => enrichStudent(s, maps));
    }
  } catch (allErr) {
    console.warn("getAllStudents search fallback failed:", allErr);
  }

  throw new Error(`Student record not found for "${query}".`);
};

// =====================================================
// GET DEPARTMENT DROPDOWN
// =====================================================

export const getStudentDepartmentDropdown = async () => {
  checkToken();

  try {
    const response = await fetch(`${API_URL}Student/dropdown/department`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (response.ok) {
      const data = await response.json().catch(() => null);

      const list = Array.isArray(data) ? data : data?.data || data?.Data;

      if (Array.isArray(list) && list.length > 0) {
        return list.map((item) => ({
          id: item.id ?? item.Id ?? item.departmentId ?? item.DepartmentId,
          name:
            item.name ??
            item.Name ??
            item.departmentName ??
            item.DepartmentName,
          text:
            item.name ??
            item.Name ??
            item.departmentName ??
            item.DepartmentName,
        }));
      }
    }
  } catch (err) {
    console.warn(
      "Student/dropdown/department failed, using getDepartmentDropdown fallback:",
      err,
    );
  }

  // Fallback: use getDepartmentDropdown from departmentService
  try {
    return await getDepartmentDropdown();
  } catch (err) {
    console.warn("getDepartmentDropdown fallback failed:", err);

    return [];
  }
};

// =====================================================
// GET CLASS DROPDOWN
// =====================================================

export const getStudentClassDropdown = async (departmentId) => {
  checkToken();

  if (!departmentId) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_URL}Student/dropdown/class?departmentId=${Number(departmentId)}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (response.ok) {
      const data = await response.json().catch(() => null);

      const list = Array.isArray(data) ? data : data?.data || data?.Data;

      if (Array.isArray(list) && list.length > 0) {
        return list.map((item) => ({
          id:
            item.id ??
            item.Id ??
            item.schoolClassId ??
            item.SchoolClassId ??
            item.classId ??
            item.ClassId,
          name: item.name ?? item.Name ?? item.className ?? item.ClassName,
          text: item.name ?? item.Name ?? item.className ?? item.ClassName,
          departmentId: item.departmentId ?? item.DepartmentId ?? departmentId,
        }));
      }
    }
  } catch (err) {
    console.warn(
      "Student/dropdown/class failed, using getAllClass fallback:",
      err,
    );
  }

  // Fallback 1: use getAllClass from classService
  try {
    const allClasses = await getAllClass();

    if (Array.isArray(allClasses) && allClasses.length > 0) {
      const filtered = allClasses.filter((c) => {
        const dId = c.DepartmentId ?? c.departmentId;

        return !dId || String(dId) === String(departmentId);
      });

      if (filtered.length > 0) {
        return filtered.map((c) => ({
          id: c.Id ?? c.id,

          text:
            c.ClassName ?? c.className ?? c.Name ?? c.name ?? `Class ${c.Id}`,

          departmentId: c.DepartmentId ?? c.departmentId,
        }));
      }
    }
  } catch (err) {
    console.warn("getAllClass fallback failed:", err);
  }

  // Fallback 2: use getClassDropdown from classService
  try {
    const classes = await getClassDropdown();

    if (Array.isArray(classes) && classes.length > 0) {
      return classes;
    }
  } catch (err) {
    console.warn("getClassDropdown fallback failed:", err);
  }

  return [];
};

// =====================================================
// GET SECTION DROPDOWN
// =====================================================

export const getStudentSectionDropdown = async (classId) => {
  checkToken();

  if (!classId) {
    return [];
  }

  try {
    const response = await fetch(
      `${API_URL}Student/dropdown/section?classId=${Number(classId)}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (response.ok) {
      const data = await response.json().catch(() => null);

      const list = Array.isArray(data) ? data : data?.data || data?.Data;

      if (Array.isArray(list) && list.length > 0) {
        return list.map((item) => ({
          id:
            item.id ??
            item.Id ??
            item.sectionId ??
            item.SectionId ??
            item.value,
          name: item.name ?? item.Name ?? item.sectionName ?? item.SectionName,
          text:
            item.name ??
            item.Name ??
            item.sectionName ??
            item.SectionName ??
            item.text,
          schoolClassId:
            item.schoolClassId ??
            item.SchoolClassId ??
            item.classId ??
            item.ClassId ??
            classId,
          classId:
            item.schoolClassId ??
            item.SchoolClassId ??
            item.classId ??
            item.ClassId ??
            classId,
        }));
      }
    }
  } catch (err) {
    console.warn(
      "Student/dropdown/section failed, using getAllSection fallback:",
      err,
    );
  }

  // Fallback 1: use getAllSection from sectionService
  try {
    const allSections = await getAllSection();

    if (Array.isArray(allSections) && allSections.length > 0) {
      const filtered = allSections.filter((s) => {
        const cId =
          s.schoolClassId ?? s.SchoolClassId ?? s.classId ?? s.ClassId;

        return !cId || String(cId) === String(classId);
      });

      if (filtered.length > 0) {
        return filtered.map((s) => ({
          id: s.id ?? s.Id ?? s.sectionId ?? s.SectionId,

          text:
            s.sectionName ??
            s.SectionName ??
            s.text ??
            s.Text ??
            `Section ${s.id ?? s.Id}`,

          classId: s.schoolClassId ?? s.SchoolClassId ?? s.classId,
        }));
      }
    }
  } catch (err) {
    console.warn("getAllSection fallback failed:", err);
  }

  // Fallback 2: use getSectionDropdown from sectionService
  try {
    const sections = await getSectionDropdown();

    if (Array.isArray(sections) && sections.length > 0) {
      return sections.filter((section) => {
        const sectionClassId =
          section.schoolClassId ??
          section.SchoolClassId ??
          section.classId ??
          section.ClassId;
        return String(sectionClassId) === String(classId);
      });
    }
  } catch (err) {
    console.warn("getSectionDropdown fallback failed:", err);
  }

  return [];
};

// =====================================================
// GET STUDENT DROPDOWN
// =====================================================

export const getStudentDropdown = async (departmentId, classId, sectionId) => {
  checkToken();

  try {
    const response = await fetch(
      `${API_URL}Student/dropdown/student?departmentId=${Number(
        departmentId,
      )}&classId=${Number(classId)}&sectionId=${Number(sectionId)}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (response.ok) {
      const data = await response.json().catch(() => null);

      const list = Array.isArray(data) ? data : data?.data || data?.Data;

      if (Array.isArray(list) && list.length > 0) {
        return list.filter((item) => !isStudentSoftDeleted(item));
      }
    }
  } catch (err) {
    console.warn(
      "Student/dropdown/student failed, using getAllStudents filter fallback:",
      err,
    );
  }

  // Fallback: filter from getAllStudents()
  try {
    const all = await getAllStudents();

    if (Array.isArray(all) && all.length > 0) {
      const filtered = all.filter((s) => {
        const dMatch =
          !departmentId ||
          String(s.DepartmentId ?? s.departmentId) === String(departmentId);

        const cMatch =
          !classId ||
          String(
            s.SchoolClassId ?? s.schoolClassId ?? s.ClassId ?? s.classId,
          ) === String(classId);

        const sMatch =
          !sectionId ||
          String(s.SectionId ?? s.sectionId) === String(sectionId);

        return dMatch && cMatch && sMatch;
      });

      return filtered.map((s) => ({
        id: s.Id,

        text: `${s.Id} - ${
          [s.FirstName, s.LastName].filter(Boolean).join(" ") ||
          s.AdmissionNumber
        }`,

        firstName: s.FirstName,

        lastName: s.LastName,

        admissionNumber: s.AdmissionNumber,
      }));
    }
  } catch (err) {
    console.warn(
      "getAllStudents filter in getStudentDropdown fallback failed:",
      err,
    );
  }

  return [];
};

// =====================================================
// CREATE STUDENT
// =====================================================

export const createStudent = async (studentData) => {
  checkToken();

  if (!studentData) {
    throw new Error("Student data is required.");
  }

  // ===================================================
  // VALIDATION
  // ===================================================

  if (!studentData.UserId) {
    throw new Error("Student User is required.");
  }

  if (!studentData.DepartmentId) {
    throw new Error("Department is required.");
  }

  if (!studentData.SchoolClassId) {
    throw new Error("Class is required.");
  }

  if (!studentData.SectionId) {
    throw new Error("Section is required.");
  }

  if (
    !studentData.AdmissionNumber ||
    !String(studentData.AdmissionNumber).trim()
  ) {
    throw new Error("Admission Number is required.");
  }

  if (!studentData.AdmissionDate) {
    throw new Error("Admission Date is required.");
  }

  if (!studentData.FirstName || !String(studentData.FirstName).trim()) {
    throw new Error("First Name is required.");
  }

  if (!studentData.LastName || !String(studentData.LastName).trim()) {
    throw new Error("Last Name is required.");
  }

  if (!studentData.DOB) {
    throw new Error("Date of Birth is required.");
  }

  if (!studentData.Gender) {
    throw new Error("Gender is required.");
  }

  // ===================================================
  // CREATE PAYLOAD
  // ===================================================

  const academicYearId =
    studentData.AcademicYearId !== undefined &&
    studentData.AcademicYearId !== null &&
    String(studentData.AcademicYearId).trim() !== ""
      ? Number(studentData.AcademicYearId)
      : studentData.academicYearId !== undefined &&
          studentData.academicYearId !== null &&
          String(studentData.academicYearId).trim() !== ""
        ? Number(studentData.academicYearId)
        : null;

  const payload = {
    UserId: String(studentData.UserId),

    AcademicYearId: academicYearId,
    academicYearId: academicYearId,

    RollNumber:
      studentData.RollNumber !== undefined && studentData.RollNumber !== null
        ? String(studentData.RollNumber).trim() || null
        : studentData.rollNumber !== undefined &&
            studentData.rollNumber !== null
          ? String(studentData.rollNumber).trim() || null
          : null,

    DepartmentId: Number(studentData.DepartmentId),

    SchoolClassId: Number(studentData.SchoolClassId),

    SectionId: Number(studentData.SectionId),

    AdmissionNumber: String(studentData.AdmissionNumber).trim(),

    AdmissionDate: studentData.AdmissionDate,

    FirstName: String(studentData.FirstName).trim(),

    MiddleName: studentData.MiddleName
      ? String(studentData.MiddleName).trim()
      : null,

    LastName: String(studentData.LastName).trim(),

    FatherName:
      studentData.FatherName !== undefined && studentData.FatherName !== null
        ? String(studentData.FatherName).trim() || null
        : studentData.fatherName !== undefined &&
            studentData.fatherName !== null
          ? String(studentData.fatherName).trim() || null
          : null,

    MotherName:
      studentData.MotherName !== undefined && studentData.MotherName !== null
        ? String(studentData.MotherName).trim() || null
        : studentData.motherName !== undefined &&
            studentData.motherName !== null
          ? String(studentData.motherName).trim() || null
          : null,

    DOB: studentData.DOB,

    Gender: String(studentData.Gender).trim(),

    BloodGroup: studentData.BloodGroup
      ? String(studentData.BloodGroup).trim()
      : null,

    Photo:
      studentData.Photo && String(studentData.Photo).trim()
        ? String(studentData.Photo).trim()
        : null,

    AadhaarNumber: studentData.AadhaarNumber
      ? String(studentData.AadhaarNumber).trim()
      : null,

    Religion: studentData.Religion ? String(studentData.Religion).trim() : null,

    Category: studentData.Category ? String(studentData.Category).trim() : null,

    Nationality: studentData.Nationality
      ? String(studentData.Nationality).trim()
      : null,

    Email: studentData.Email ? String(studentData.Email).trim() : null,

    PhoneNumber: studentData.PhoneNumber
      ? String(studentData.PhoneNumber).trim()
      : null,

    AlternatePhoneNumber: studentData.AlternatePhoneNumber
      ? String(studentData.AlternatePhoneNumber).trim()
      : null,

    Address: studentData.Address ? String(studentData.Address).trim() : null,
  };

  console.log("Create Student Payload:", payload);

  // ===================================================
  // API CALL
  // ===================================================

  const endpoints = [
    `${API_URL}Student/CreateStudent`,
    `${API_URL}Student/Create`,
    `${API_URL}Student`,
  ];

  let lastError = null;

  for (const ep of endpoints) {
    try {
      const response = await fetch(ep, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await handleResponse(response);

        const academicYearVal =
          studentData.AcademicYearId || studentData.academicYearId;
        const createdId = data?.Id ?? data?.id;

        if (academicYearVal) {
          if (createdId) saveStudentAcademicYear(createdId, academicYearVal);
          if (studentData.AdmissionNumber)
            saveStudentAcademicYear(
              studentData.AdmissionNumber,
              academicYearVal,
            );
          if (studentData.UserId)
            saveStudentAcademicYear(studentData.UserId, academicYearVal);

          // Try backend enrollStudent if createdId exists
          if (createdId) {
            try {
              await enrollStudent({
                studentId: Number(createdId),
                academicYearId: Number(academicYearVal),
                schoolClassId: payload.SchoolClassId
                  ? Number(payload.SchoolClassId)
                  : null,
                sectionId: payload.SectionId ? Number(payload.SectionId) : null,
                rollNumber: payload.RollNumber
                  ? String(payload.RollNumber)
                  : null,
              });
            } catch (enrollErr) {
              console.warn("Auto-enroll notice in createStudent:", enrollErr);
            }
          }
        }

        const rollVal = studentData.RollNumber || studentData.rollNumber;
        if (rollVal) {
          if (createdId) saveStudentRollNumber(createdId, rollVal);
          if (studentData.AdmissionNumber)
            saveStudentRollNumber(studentData.AdmissionNumber, rollVal);
          if (studentData.UserId)
            saveStudentRollNumber(studentData.UserId, rollVal);
        }

        return normalizeStudent(data);
      }

      if (response.status === 404 || response.status === 405) {
        continue;
      }

      return await handleResponse(response);
    } catch (err) {
      lastError = err;
      if (
        err.message &&
        !err.message.includes("404") &&
        !err.message.includes("405") &&
        !err.message.includes("permission") &&
        !err.message.includes("Failed to fetch")
      ) {
        throw new Error(parseStudentErrorMessage(err));
      }
    }
  }

  if (lastError) {
    throw new Error(parseStudentErrorMessage(lastError));
  }

  throw new Error("Failed to create student.");
};

// =====================================================
// UPDATE STUDENT
// =====================================================

export const updateStudent = async (id, studentData) => {
  checkToken();

  if (!id) {
    throw new Error("Student ID is required.");
  }

  if (!studentData) {
    throw new Error("Student data is required.");
  }

  const cleanPhoto =
    studentData.Photo && String(studentData.Photo).trim()
      ? String(studentData.Photo).trim()
      : null;

  // UpdatedBy is intentionally NOT sent from frontend.
  // Backend gets the logged-in UserId from JWT.
  const payload = {
    ...studentData,
    Id: Number(id),
    id: Number(id),
    RollNumber:
      studentData.RollNumber !== undefined && studentData.RollNumber !== null
        ? String(studentData.RollNumber).trim() || null
        : studentData.rollNumber !== undefined &&
            studentData.rollNumber !== null
          ? String(studentData.rollNumber).trim() || null
          : null,
    FatherName:
      studentData.FatherName !== undefined && studentData.FatherName !== null
        ? String(studentData.FatherName).trim() || null
        : studentData.fatherName !== undefined &&
            studentData.fatherName !== null
          ? String(studentData.fatherName).trim() || null
          : null,
    MotherName:
      studentData.MotherName !== undefined && studentData.MotherName !== null
        ? String(studentData.MotherName).trim() || null
        : studentData.motherName !== undefined &&
            studentData.motherName !== null
          ? String(studentData.motherName).trim() || null
          : null,
    Photo: cleanPhoto,
  };

  const cleanId = String(id).trim();
  const endpoints = [
    `${API_URL}Student/UpdateStudent/${encodeURIComponent(cleanId)}`,
    `${API_URL}Student/Update/${encodeURIComponent(cleanId)}`,
    `${API_URL}Student/${encodeURIComponent(cleanId)}`,
    `${API_URL}Student/UpdateStudent`,
  ];

  let lastError = null;

  for (const ep of endpoints) {
    try {
      const response = await fetch(ep, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const rollVal = studentData.RollNumber || studentData.rollNumber;
        if (rollVal) {
          saveStudentRollNumber(cleanId, rollVal);
          if (studentData.AdmissionNumber)
            saveStudentRollNumber(studentData.AdmissionNumber, rollVal);
        }
        return await handleResponse(response);
      }

      if (response.status === 404 || response.status === 405) {
        continue;
      }

      return await handleResponse(response);
    } catch (err) {
      lastError = err;
      if (
        err.message &&
        !err.message.includes("404") &&
        !err.message.includes("405") &&
        !err.message.includes("permission") &&
        !err.message.includes("Failed to fetch")
      ) {
        throw new Error(parseStudentErrorMessage(err));
      }
    }
  }

  if (lastError) {
    throw new Error(parseStudentErrorMessage(lastError));
  }

  throw new Error("Failed to update student.");
};

// =====================================================
// PARTIAL UPDATE STUDENT
// =====================================================

export const partialUpdateStudent = async (id, studentData) => {
  checkToken();

  if (!id) {
    throw new Error("Student ID is required.");
  }

  if (!studentData) {
    throw new Error("Student data is required.");
  }

  const headers = {
    ...getHeaders(),
    "Content-Type": "application/json-patch+json",
  };

  const response = await fetch(`${API_URL}Student/PartialStudentUpdate/${id}`, {
    method: "PATCH",
    headers,
    body: JSON.stringify(studentData),
  });

  return await handleResponse(response);
};

// =====================================================
// DELETE STUDENT
// =====================================================

export const deleteStudent = async (id, studentData = null) => {
  checkToken();

  if (!id) {
    throw new Error("Student ID is required.");
  }

  const cleanId = String(id).trim();

  // 1. Mark as soft-deleted in local registry
  softDeleteStudent(cleanId, studentData);

  // 2. Try calling backend DELETE endpoints
  const endpoints = [
    `${API_URL}Student/DeleteStudent/${encodeURIComponent(cleanId)}`,
    `${API_URL}Student/Delete/${encodeURIComponent(cleanId)}`,
    `${API_URL}Student/${encodeURIComponent(cleanId)}`,
  ];

  let backendDeleted = false;
  for (const ep of endpoints) {
    try {
      const response = await fetch(ep, {
        method: "DELETE",
        headers: getHeaders(),
      });
      if (response.ok) {
        backendDeleted = true;
        break;
      }
    } catch {
      // Continue to fallback
    }
  }

  // 3. Safely sync Inactive status to backend if needed
  if (!backendDeleted && studentData && typeof studentData === "object") {
    try {
      await updateStudent(cleanId, {
        ...studentData,
        IsActive: false,
      });
    } catch (err) {
      console.warn(
        "Could not sync inactive status to backend on soft delete:",
        err,
      );
    }
  }

  return {
    status: true,
    message: "Student deleted successfully (Soft Deleted).",
  };
};
