// src/Services/nonTeachingStaffService.jsx

import { getToken } from "../Utils/auth";

// =====================================================
// BASE API URL
// =====================================================

const API_URL = "https://localhost:7164/api";

// =====================================================
// SOFT DELETED STAFF REGISTRY & HELPERS
// =====================================================
const SOFT_DELETED_STAFF_KEY = "school_soft_deleted_staff_v1";

export const getSoftDeletedStaffMap = () => {
  try {
    const raw = localStorage.getItem(SOFT_DELETED_STAFF_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
};

export const isStaffSoftDeleted = (staffOrCode) => {
  if (!staffOrCode) return false;
  try {
    const map = getSoftDeletedStaffMap();
    if (typeof staffOrCode === "object") {
      const code = (staffOrCode.StaffCode || staffOrCode.staffCode || "")
        .toString()
        .trim()
        .toLowerCase();
      const id = staffOrCode.Id ?? staffOrCode.id;
      if (code && map[code]) return true;
      if (id && map[String(id)]) return true;
      if (staffOrCode.isDeleted || staffOrCode.IsDeleted) return true;
      return false;
    }
    const clean = String(staffOrCode).trim().toLowerCase();
    return Boolean(map[clean] || map[String(staffOrCode).trim()]);
  } catch (_) {
    return false;
  }
};

export const softDeleteNonTeachingStaff = (staffOrCode, staffObj = null) => {
  if (!staffOrCode && !staffObj) return;
  try {
    const map = getSoftDeletedStaffMap();
    const code = (
      staffObj?.StaffCode ||
      staffObj?.staffCode ||
      (typeof staffOrCode === "string" ? staffOrCode : "")
    )
      .toString()
      .trim();
    const id =
      staffObj?.Id ??
      staffObj?.id ??
      (typeof staffOrCode !== "object" && !isNaN(staffOrCode)
        ? String(staffOrCode).trim()
        : null);
    const name = [
      staffObj?.FirstName || staffObj?.firstName,
      staffObj?.MiddleName || staffObj?.middleName,
      staffObj?.LastName || staffObj?.lastName,
    ]
      .filter(Boolean)
      .join(" ");

    const record = {
      code: code || null,
      id: id || null,
      name: name || `Staff ${code || id}`,
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
    if (staffOrCode && typeof staffOrCode !== "object") {
      map[String(staffOrCode).trim()] = record;
      map[String(staffOrCode).trim().toLowerCase()] = record;
    }

    localStorage.setItem(SOFT_DELETED_STAFF_KEY, JSON.stringify(map));
    return record;
  } catch (e) {
    console.warn("Could not record soft deleted staff:", e);
  }
};

export const restoreNonTeachingStaff = (staffOrCode) => {
  if (!staffOrCode) return;
  try {
    const map = getSoftDeletedStaffMap();
    if (typeof staffOrCode === "object") {
      const code = (staffOrCode.StaffCode || staffOrCode.staffCode || "")
        .toString()
        .trim()
        .toLowerCase();
      const id = staffOrCode.Id ?? staffOrCode.id;
      if (code) {
        delete map[code];
        delete map[code.toLowerCase()];
      }
      if (id) {
        delete map[String(id)];
        delete map[Number(id)];
      }
    } else {
      const clean = String(staffOrCode).trim().toLowerCase();
      delete map[clean];
      delete map[String(staffOrCode).trim()];
    }
    localStorage.setItem(SOFT_DELETED_STAFF_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Could not restore staff:", e);
  }
};

// =====================================================
// USER ROLE LOOKUP & CACHE (Maps UserId/Username/Email -> Role Name)
// =====================================================
const USER_ROLE_CACHE_KEY = "school_user_roles_lookup_v1";

export const getCachedUserRoles = () => {
  try {
    const raw = localStorage.getItem(USER_ROLE_CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
};

export const fetchAndCacheUserRoles = async () => {
  try {
    const [userRes, roleRes] = await Promise.allSettled([
      fetch(`${API_URL}/User/All`, {
        method: "GET",
        headers: getHeaders(),
      }),
      fetch(`${API_URL}/Role/All`, {
        method: "GET",
        headers: getHeaders(),
      }),
    ]);

    const map = getCachedUserRoles();
    const idToRoleNameMap = {
      1: "Super Admin",
      1: "Super Admin",
      2: "Admin",
      2: "Admin",
      3: "Teacher",
      3: "Teacher",
      4: "Other Non Teaching Staff",
      4: "Other Non Teaching Staff",
      5: "Student",
      5: "Student",
      6: "Operator",
      6: "Operator",
      7: "Office Staff",
      7: "Office Staff",
    };

    if (roleRes.status === "fulfilled" && roleRes.value.ok) {
      try {
        const rolesData = await roleRes.value.json();
        const roleList = Array.isArray(rolesData)
          ? rolesData
          : rolesData?.data || rolesData?.Data || [];
        if (Array.isArray(roleList)) {
          roleList.forEach((r) => {
            if (!r) return;
            const rId = String(r.id ?? r.Id ?? r.code ?? r.Code ?? "").trim();
            const rName = String(
              r.roleName ??
                r.RoleName ??
                r.name ??
                r.Name ??
                r.text ??
                r.Text ??
                "",
            ).trim();
            if (rId && rName) {
              idToRoleNameMap[rId] = rName;
              idToRoleNameMap[Number(rId)] = rName;
            }
          });
        }
      } catch (_) {}
    }

    if (userRes.status === "fulfilled" && userRes.value.ok) {
      const resData = await userRes.value.json();
      const list = Array.isArray(resData)
        ? resData
        : resData?.data || resData?.Data || [];

      if (Array.isArray(list)) {
        list.forEach((u) => {
          if (!u) return;
          const uId = String(u.id ?? u.Id ?? u.userId ?? u.UserId ?? "").trim();
          const uName = String(u.username ?? u.Username ?? u.name ?? "")
            .trim()
            .toLowerCase();
          const uEmail = String(u.email ?? u.Email ?? "")
            .trim()
            .toLowerCase();

          const roleIdsList = Array.isArray(u.roleIds)
            ? u.roleIds
            : Array.isArray(u.RoleIds)
              ? u.RoleIds
              : [];
          const singleRoleId = u.roleId ?? u.RoleId ?? roleIdsList[0] ?? "";

          let role = String(
            u.roleName ||
              u.RoleName ||
              u.role ||
              u.Role ||
              u.userRole ||
              u.UserRole ||
              "",
          ).trim();

          // Map from roleIds if role string isn't explicitly on the User object
          if (!role && roleIdsList.length > 0) {
            for (const rid of roleIdsList) {
              if (idToRoleNameMap[String(rid)]) {
                role = idToRoleNameMap[String(rid)];
                break;
              }
            }
          }

          if (!role && singleRoleId && idToRoleNameMap[String(singleRoleId)]) {
            role = idToRoleNameMap[String(singleRoleId)];
          }

          if (!role) {
            if (String(u.userTypeId ?? u.UserTypeId) === "4") {
              role = "Operator";
            } else {
              role = "Staff";
            }
          }

          if (uId) {
            map[uId] = role;
            map[uId.toLowerCase()] = role;
          }
          if (uName) {
            map[uName] = role;
            map[uName.toLowerCase()] = role;
          }
          if (uEmail) {
            map[uEmail] = role;
            map[uEmail.toLowerCase()] = role;
          }
        });
      }
    }

    try {
      localStorage.setItem(USER_ROLE_CACHE_KEY, JSON.stringify(map));
    } catch (_) {}

    return map;
  } catch (err) {
    console.warn("fetchAndCacheUserRoles warning:", err);
    return getCachedUserRoles();
  }
};

// =====================================================
// SAVED STAFF REGISTRY (Local persistence to ensure instant availability)
// =====================================================
const SAVED_STAFF_REGISTRY_KEY = "school_saved_staff_registry_v1";

export const getSavedStaffRegistry = () => {
  try {
    const raw = localStorage.getItem(SAVED_STAFF_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
};

export const saveStaffToRegistry = (staffObj) => {
  if (!staffObj) return;
  try {
    const map = getSavedStaffRegistry();
    const code = (staffObj.staffCode || staffObj.StaffCode || "")
      .toString()
      .trim();
    const id =
      staffObj.id ||
      staffObj.Id ||
      (code ? `staff_${code}` : `staff_${Date.now()}`);

    const roleName =
      staffObj.roleName ||
      staffObj.RoleName ||
      staffObj.role ||
      staffObj.Role ||
      staffObj.userRole ||
      staffObj.UserRole ||
      "Staff";

    const cleanStaff = {
      ...staffObj,
      id: id,
      Id: id,
      staffCode: code,
      StaffCode: code,
      firstName: staffObj.firstName || staffObj.FirstName || "",
      FirstName: staffObj.firstName || staffObj.FirstName || "",
      middleName: staffObj.middleName || staffObj.MiddleName || "",
      MiddleName: staffObj.middleName || staffObj.MiddleName || "",
      lastName: staffObj.lastName || staffObj.LastName || "",
      LastName: staffObj.lastName || staffObj.LastName || "",
      gender: staffObj.gender || staffObj.Gender || "",
      Gender: staffObj.gender || staffObj.Gender || "",
      dateOfBirth: staffObj.dateOfBirth || staffObj.DateOfBirth || "",
      DateOfBirth: staffObj.dateOfBirth || staffObj.DateOfBirth || "",
      email: staffObj.email || staffObj.Email || "",
      Email: staffObj.email || staffObj.Email || "",
      phoneNumber: staffObj.phoneNumber || staffObj.PhoneNumber || "",
      PhoneNumber: staffObj.phoneNumber || staffObj.PhoneNumber || "",
      alternatePhoneNumber:
        staffObj.alternatePhoneNumber || staffObj.AlternatePhoneNumber || "",
      AlternatePhoneNumber:
        staffObj.alternatePhoneNumber || staffObj.AlternatePhoneNumber || "",
      address: staffObj.address || staffObj.Address || "",
      Address: staffObj.address || staffObj.Address || "",
      designation: staffObj.designation || staffObj.Designation || "",
      Designation: staffObj.designation || staffObj.Designation || "",
      qualification: staffObj.qualification || staffObj.Qualification || "",
      Qualification: staffObj.qualification || staffObj.Qualification || "",
      salary: Number(staffObj.salary || staffObj.Salary || 0),
      Salary: Number(staffObj.salary || staffObj.Salary || 0),
      joiningDate:
        staffObj.joiningDate ||
        staffObj.JoiningDate ||
        new Date().toISOString(),
      JoiningDate:
        staffObj.joiningDate ||
        staffObj.JoiningDate ||
        new Date().toISOString(),
      roleName: roleName,
      RoleName: roleName,
      role: roleName,
      Role: roleName,
      userId: staffObj.userId || staffObj.UserId || "",
      UserId: staffObj.userId || staffObj.UserId || "",
      fatherName: staffObj.fatherName || staffObj.FatherName || "",
      FatherName: staffObj.fatherName || staffObj.FatherName || "",
      motherName: staffObj.motherName || staffObj.MotherName || "",
      MotherName: staffObj.motherName || staffObj.MotherName || "",
      photo: staffObj.photo || staffObj.Photo || null,
      Photo: staffObj.photo || staffObj.Photo || null,
      educationPdf: staffObj.educationPdf || staffObj.EducationPdf || null,
      EducationPdf: staffObj.educationPdf || staffObj.EducationPdf || null,
      educationFileName:
        staffObj.educationFileName || staffObj.EducationFileName || "",
      EducationFileName:
        staffObj.educationFileName || staffObj.EducationFileName || "",
      isActive: staffObj.isActive !== undefined ? staffObj.isActive : true,
      IsActive: staffObj.isActive !== undefined ? staffObj.isActive : true,
    };

    if (code) {
      map[code] = cleanStaff;
      map[code.toLowerCase()] = cleanStaff;
    }
    map[String(id)] = cleanStaff;
    localStorage.setItem(SAVED_STAFF_REGISTRY_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Could not save staff to registry:", e);
  }
};

// =====================================================
// NON-TEACHING STAFF EXTRA FIELDS PERSISTENCE (Photo, Father, Mother, Education PDF, Role)
// =====================================================
const STAFF_EXTRA_FIELDS_KEY = "school_staff_extra_fields_map";

export const getStoredStaffExtraMap = () => {
  try {
    const raw = localStorage.getItem(STAFF_EXTRA_FIELDS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (_) {
    return {};
  }
};

export const saveStaffExtraFields = (identifier, data) => {
  if (!identifier || !data) return;
  try {
    const map = getStoredStaffExtraMap();
    const cleanId = String(identifier).trim();
    const existing = map[cleanId] || map[cleanId.toLowerCase()] || {};

    const roleName =
      data.roleName ||
      data.RoleName ||
      data.role ||
      data.Role ||
      data.userRole ||
      data.UserRole ||
      existing.roleName ||
      "Staff";

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
      roleName: roleName,
      RoleName: roleName,
      role: roleName,
      Role: roleName,
      photo:
        data.photo !== undefined
          ? data.photo
          : data.Photo !== undefined
            ? data.Photo
            : existing.photo,
      Photo:
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
      FatherName:
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
      MotherName:
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
      EducationPdf:
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
      EducationFileName:
        data.educationFileName !== undefined
          ? data.educationFileName
          : data.EducationFileName !== undefined
            ? data.EducationFileName
            : existing.educationFileName,
      staffCode: data.staffCode || data.StaffCode || existing.staffCode || "",
      StaffCode: data.staffCode || data.StaffCode || existing.staffCode || "",
    };

    map[cleanId] = merged;
    map[cleanId.toLowerCase()] = merged;
    if (data.staffCode || data.StaffCode) {
      const code = String(data.staffCode || data.StaffCode).trim();
      map[code] = merged;
      map[code.toLowerCase()] = merged;
    }
    if (data.id || data.Id) {
      map[String(data.id || data.Id).trim()] = merged;
    }

    localStorage.setItem(STAFF_EXTRA_FIELDS_KEY, JSON.stringify(map));
  } catch (e) {
    console.warn("Could not save staff extra fields:", e);
  }
};

export const getSavedStaffExtraFields = (identifier) => {
  if (!identifier) return {};
  try {
    const map = getStoredStaffExtraMap();
    const cleanId = String(identifier).trim();
    return map[cleanId] || map[cleanId.toLowerCase()] || {};
  } catch (_) {
    return {};
  }
};

export const enrichStaff = (staff, userRoleMap = null) => {
  if (!staff || typeof staff !== "object") return staff;
  const sCode = (staff.staffCode || staff.StaffCode || "").toString().trim();
  const sId = (staff.id || staff.Id || "").toString().trim();
  const uId = (staff.userId || staff.UserId || "").toString().trim();
  const email = (staff.email || staff.Email || "")
    .toString()
    .trim()
    .toLowerCase();

  const extra = {
    ...getSavedStaffExtraFields(sCode),
    ...getSavedStaffExtraFields(sCode.toLowerCase()),
    ...getSavedStaffExtraFields(sId),
    ...getSavedStaffExtraFields(uId),
    ...getSavedStaffExtraFields(uId.toLowerCase()),
    ...getSavedStaffExtraFields(email),
  };

  const sanitizeVal = (val) => {
    if (!val || typeof val !== "string") return "";
    const clean = val.trim();
    if (
      clean.toLowerCase() === "string" ||
      clean.toLowerCase() === "null" ||
      clean.toLowerCase() === "undefined"
    ) {
      return "";
    }
    return clean;
  };

  const sanitizeMedia = (val) => {
    if (!val || typeof val !== "string") return null;
    const clean = val.trim();
    if (
      clean.toLowerCase() === "string" ||
      clean.toLowerCase() === "null" ||
      clean.toLowerCase() === "undefined" ||
      clean.length < 15
    ) {
      return null;
    }
    return clean;
  };

  const photo =
    sanitizeMedia(staff.photo || staff.Photo) ||
    sanitizeMedia(extra.photo || extra.Photo) ||
    null;
  const fatherName =
    sanitizeVal(staff.fatherName || staff.FatherName) ||
    sanitizeVal(extra.fatherName || extra.FatherName) ||
    "";
  const motherName =
    sanitizeVal(staff.motherName || staff.MotherName) ||
    sanitizeVal(extra.motherName || extra.MotherName) ||
    "";
  const educationPdf =
    sanitizeMedia(staff.educationPdf || staff.EducationPdf) ||
    sanitizeMedia(extra.educationPdf || extra.EducationPdf) ||
    null;
  const educationFileName =
    sanitizeVal(staff.educationFileName || staff.EducationFileName) ||
    sanitizeVal(extra.educationFileName || extra.EducationFileName) ||
    "";
  const userId =
    staff.userId || staff.UserId || extra.userId || extra.UserId || uId;

  // Resolve Role Name (Priority: Entity role from backend -> roleMap from live users -> explicit extra role -> default)
  let roleMap = userRoleMap;
  if (!roleMap) {
    try {
      const raw = localStorage.getItem(USER_ROLE_CACHE_KEY);
      roleMap = raw ? JSON.parse(raw) : {};
    } catch (_) {
      roleMap = {};
    }
  }

  let roleName = "";

  // 1. Direct from backend entity/DTO
  const rawRole =
    staff.roleName ||
    staff.RoleName ||
    staff.role ||
    staff.Role ||
    staff.userRole ||
    staff.UserRole ||
    staff.User?.Role?.roleName ||
    staff.User?.roleName ||
    staff.user?.roleName ||
    "";

  if (
    rawRole &&
    typeof rawRole === "string" &&
    rawRole.trim() &&
    rawRole.trim().toLowerCase() !== "staff"
  ) {
    roleName = rawRole.trim();
  }

  // 2. From User Role Map (computed from /User/All and /Role/All)
  if (!roleName) {
    if (uId && roleMap[uId]) {
      roleName = roleMap[uId];
    } else if (userId && roleMap[String(userId)]) {
      roleName = roleMap[String(userId)];
    } else if (email && roleMap[email]) {
      roleName = roleMap[email];
    } else if (sCode && roleMap[sCode.toLowerCase()]) {
      roleName = roleMap[sCode.toLowerCase()];
    }
  }

  // 3. From Extra / LocalStorage cache if specific
  if (!roleName) {
    const extraRole =
      extra.roleName || extra.RoleName || extra.role || extra.Role || "";
    if (extraRole && extraRole.toLowerCase() !== "staff") {
      roleName = extraRole.trim();
    }
  }

  // 4. Default fallback
  if (!roleName) {
    roleName = rawRole || "Operator";
  }

  return {
    ...staff,
    id: staff.id || staff.Id || sCode,
    Id: staff.id || staff.Id || sCode,
    staffCode: sCode,
    StaffCode: sCode,
    firstName: staff.firstName || staff.FirstName || "",
    FirstName: staff.firstName || staff.FirstName || "",
    middleName: staff.middleName || staff.MiddleName || "",
    MiddleName: staff.middleName || staff.MiddleName || "",
    lastName: staff.lastName || staff.LastName || "",
    LastName: staff.lastName || staff.LastName || "",
    gender: staff.gender || staff.Gender || "N/A",
    Gender: staff.gender || staff.Gender || "N/A",
    dateOfBirth: staff.dateOfBirth || staff.DateOfBirth || "",
    DateOfBirth: staff.dateOfBirth || staff.DateOfBirth || "",
    email: staff.email || staff.Email || "N/A",
    Email: staff.email || staff.Email || "N/A",
    phoneNumber: staff.phoneNumber || staff.PhoneNumber || "N/A",
    PhoneNumber: staff.phoneNumber || staff.PhoneNumber || "N/A",
    alternatePhoneNumber:
      staff.alternatePhoneNumber || staff.AlternatePhoneNumber || "",
    AlternatePhoneNumber:
      staff.alternatePhoneNumber || staff.AlternatePhoneNumber || "",
    address: staff.address || staff.Address || "",
    Address: staff.address || staff.Address || "",
    designation: staff.designation || staff.Designation || "Staff",
    Designation: staff.designation || staff.Designation || "Staff",
    qualification: staff.qualification || staff.Qualification || "N/A",
    Qualification: staff.qualification || staff.Qualification || "N/A",
    salary: Number(staff.salary ?? staff.Salary ?? 0),
    Salary: Number(staff.salary ?? staff.Salary ?? 0),
    joiningDate: staff.joiningDate || staff.JoiningDate || "",
    JoiningDate: staff.joiningDate || staff.JoiningDate || "",
    roleName: roleName,
    RoleName: roleName,
    role: roleName,
    Role: roleName,
    userRole: roleName,
    UserRole: roleName,
    userId: userId,
    UserId: userId,
    photo: photo,
    Photo: photo,
    fatherName: fatherName,
    FatherName: fatherName,
    motherName: motherName,
    MotherName: motherName,
    educationPdf: educationPdf,
    EducationPdf: educationPdf,
    educationFileName: educationFileName,
    EducationFileName: educationFileName,
    isActive:
      staff.isActive !== undefined
        ? staff.isActive
        : staff.IsActive !== undefined
          ? staff.IsActive
          : true,
    IsActive:
      staff.isActive !== undefined
        ? staff.isActive
        : staff.IsActive !== undefined
          ? staff.IsActive
          : true,
  };
};

export const enrichStaffList = (data, userRoleMap = null) => {
  if (!data) return [];
  if (Array.isArray(data))
    return data.map((item) => enrichStaff(item, userRoleMap));
  if (Array.isArray(data.data))
    return data.data.map((item) => enrichStaff(item, userRoleMap));
  if (Array.isArray(data.Data))
    return data.Data.map((item) => enrichStaff(item, userRoleMap));
  return data;
};

// =====================================================
// COMMON HEADERS
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
// HANDLE RESPONSE
// =====================================================

const handleResponse = async (response) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  // 401
  if (response.status === 401) {
    throw new Error(
      "Unauthorized (401). Your login session may have expired. Please login again.",
    );
  }

  // 403
  if (response.status === 403) {
    throw new Error(
      "Access denied (403). You do not have permission to perform this operation.",
    );
  }

  // 404
  if (response.status === 404) {
    let message =
      data?.Message ||
      data?.message ||
      data?.Title ||
      data?.title ||
      "Staff record not found.";

    if (Array.isArray(data?.Errors) && data.Errors.length > 0) {
      message = data.Errors.join(", ");
    }
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join(", ");
    }

    throw new Error(message);
  }

  // Other HTTP errors
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

    throw new Error(message);
  }

  // API response failure flag check
  if (data && (data.Status === false || data.status === false)) {
    let message = data?.Message || data?.message || "Request failed.";

    if (Array.isArray(data?.Errors) && data.Errors.length > 0) {
      message = data.Errors.join(", ");
    }

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      message = data.errors.join(", ");
    }

    throw new Error(message);
  }

  // Unwrap Data/data if present
  if (data && Object.prototype.hasOwnProperty.call(data, "Data")) {
    return data.Data;
  }

  if (data && Object.prototype.hasOwnProperty.call(data, "data")) {
    return data.data;
  }

  return data;
};

// =====================================================
// GET ALL NON-TEACHING STAFF
// GET /api/NonTeachingStaff/AllNonTeachingStaff
// =====================================================

export const getAllNonTeachingStaff = async () => {
  let serverList = [];
  const userRoleMap = await fetchAndCacheUserRoles();

  try {
    const response = await fetch(
      `${API_URL}/NonTeachingStaff/AllNonTeachingStaff`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (response.ok) {
      const data = await handleResponse(response);
      const rawList = Array.isArray(data)
        ? data
        : data?.data || data?.Data || [];
      if (Array.isArray(rawList)) {
        serverList = rawList;
      }
    }
  } catch (err) {
    console.warn("Could not fetch non-teaching staff from server:", err);
  }

  // Merge with locally saved registry staff to guarantee immediate display
  const staffRegistry = getSavedStaffRegistry();
  const seenCodes = new Set();
  const combinedList = [];

  serverList.forEach((item) => {
    if (!item) return;
    const code = (item.staffCode || item.StaffCode || "")
      .toString()
      .trim()
      .toLowerCase();
    const id = String(item.id ?? item.Id ?? "")
      .trim()
      .toLowerCase();
    if (code) seenCodes.add(code);
    if (id) seenCodes.add(id);
    combinedList.push(item);
  });

  Object.values(staffRegistry).forEach((localItem) => {
    if (!localItem) return;
    const code = (localItem.staffCode || localItem.StaffCode || "")
      .toString()
      .trim()
      .toLowerCase();
    const id = String(localItem.id ?? localItem.Id ?? "")
      .trim()
      .toLowerCase();
    if (code && !seenCodes.has(code) && (!id || !seenCodes.has(id))) {
      seenCodes.add(code);
      if (id) seenCodes.add(id);
      combinedList.push(localItem);
    }
  });

  return combinedList
    .map((item) => enrichStaff(item, userRoleMap))
    .filter((s) => !isStaffSoftDeleted(s));
};

// =====================================================
// GET NON-TEACHING STAFF BY CODE
// GET /api/NonTeachingStaff/StaffCode/{code}
// =====================================================

export const getNonTeachingStaffByCode = async (code) => {
  if (isStaffSoftDeleted(code)) {
    return null;
  }

  if (!code || !code.trim()) {
    throw new Error("Staff code is required.");
  }

  const cleanCode = code.trim();
  const userRoleMap = await fetchAndCacheUserRoles();

  let serverData = null;
  try {
    const response = await fetch(
      `${API_URL}/NonTeachingStaff/StaffCode/${encodeURIComponent(cleanCode)}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (response.ok) {
      serverData = await handleResponse(response);
    }
  } catch (err) {
    console.warn("getNonTeachingStaffByCode warning:", err);
  }

  const allStaff = await getAllNonTeachingStaff();
  const found = allStaff.find(
    (s) =>
      (s.staffCode || s.StaffCode || "").toLowerCase() ===
        cleanCode.toLowerCase() ||
      String(s.id || s.Id).toLowerCase() === cleanCode.toLowerCase(),
  );

  if (serverData) {
    return enrichStaff({ ...(found || {}), ...serverData }, userRoleMap);
  }

  if (found) {
    return enrichStaff(found, userRoleMap);
  }

  throw new Error(`Staff with code "${cleanCode}" not found.`);
};

// =====================================================
// GET NON-TEACHING STAFF BY ID
// =====================================================

export const getNonTeachingStaffById = async (id) => {
  if (!id || !String(id).trim()) {
    throw new Error("Staff ID is required.");
  }

  const cleanId = String(id).trim();
  const userRoleMap = await fetchAndCacheUserRoles();

  try {
    const response = await fetch(
      `${API_URL}/NonTeachingStaff/StaffCode/${encodeURIComponent(cleanId)}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (response.ok) {
      const data = await handleResponse(response);
      if (data) return enrichStaff(data, userRoleMap);
    }
  } catch (err) {
    console.warn("getNonTeachingStaffById warning:", err);
  }

  const allStaff = await getAllNonTeachingStaff();
  const found = allStaff.find(
    (s) =>
      String(s.id || s.Id) === cleanId ||
      String(s.staffCode || s.StaffCode).toLowerCase() ===
        cleanId.toLowerCase(),
  );
  if (found) return enrichStaff(found, userRoleMap);

  throw new Error(`Staff record with ID "${cleanId}" not found.`);
};

// =====================================================
// GET NON-TEACHING STAFF BY NAME
// GET /api/NonTeachingStaff/Name/{name}
// =====================================================

export const getNonTeachingStaffByName = async (name) => {
  if (!name || !name.trim()) {
    throw new Error("Staff name is required.");
  }

  const cleanName = name.trim().toLowerCase();
  const userRoleMap = await fetchAndCacheUserRoles();
  let serverList = [];

  try {
    const response = await fetch(
      `${API_URL}/NonTeachingStaff/Name/${encodeURIComponent(name.trim())}`,
      {
        method: "GET",
        headers: getHeaders(),
      },
    );

    if (response.ok) {
      const data = await handleResponse(response);
      const raw = Array.isArray(data)
        ? data
        : data?.data || data?.Data || (data ? [data] : []);
      if (Array.isArray(raw) && raw.length > 0) {
        serverList = raw;
      }
    }
  } catch (err) {
    console.warn("getNonTeachingStaffByName warning:", err);
  }

  const allStaff = await getAllNonTeachingStaff();
  const matched = allStaff.filter((s) => {
    const fullName = [
      s.firstName || s.FirstName,
      s.middleName || s.MiddleName,
      s.lastName || s.LastName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return (
      fullName.includes(cleanName) ||
      (s.staffCode || s.StaffCode || "").toLowerCase().includes(cleanName)
    );
  });

  const seenCodes = new Set();
  const finalResults = [];

  [...serverList, ...matched].forEach((item) => {
    if (!item) return;
    const code = (item.staffCode || item.StaffCode || "")
      .toString()
      .trim()
      .toLowerCase();
    if (code && seenCodes.has(code)) return;
    if (code) seenCodes.add(code);
    finalResults.push(item);
  });

  return enrichStaffList(finalResults, userRoleMap).filter(
    (s) => !isStaffSoftDeleted(s),
  );
};

// =====================================================
// GET NON-TEACHING STAFF DROPDOWN
// GET /api/NonTeachingStaff/dropdown
// =====================================================

export const getNonTeachingStaffDropdown = async () => {
  let dropdownList = [];

  try {
    const response = await fetch(`${API_URL}/NonTeachingStaff/dropdown`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (response.ok) {
      const res = await handleResponse(response);
      const list = Array.isArray(res) ? res : res?.data || res?.Data || [];
      if (Array.isArray(list) && list.length > 0) {
        dropdownList = list;
      }
    }
  } catch (err) {
    console.warn("getNonTeachingStaffDropdown warning:", err);
  }

  const allStaff = await getAllNonTeachingStaff();
  const seenCodes = new Set(
    dropdownList.map((d) =>
      String(d.code || d.Code || d.id || d.Id || "")
        .trim()
        .toLowerCase(),
    ),
  );

  allStaff.forEach((s) => {
    const code = String(s.staffCode || s.StaffCode || "").trim();
    if (!code || seenCodes.has(code.toLowerCase())) return;
    const name = [s.firstName, s.lastName].filter(Boolean).join(" ") || code;
    dropdownList.push({
      id: s.id || s.Id || code,
      code: code,
      text: `${code} - ${name}`,
    });
    seenCodes.add(code.toLowerCase());
  });

  return dropdownList.filter(
    (item) => !isStaffSoftDeleted(item.code || item.id || item),
  );
};

// =====================================================
// GET USER DROPDOWN BY USER TYPE
// =====================================================

export const getUserDropdownByUserType = async (userTypeId) => {
  if (userTypeId === null || userTypeId === undefined || userTypeId === "") {
    throw new Error("User Type ID is required.");
  }

  const response = await fetch(
    `${API_URL}/User/GetUserDropdownByUserType/${encodeURIComponent(
      userTypeId,
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  return handleResponse(response);
};

// =====================================================
// CREATE NON-TEACHING STAFF
// POST /api/NonTeachingStaff/CreateStaff
// =====================================================

export const createNonTeachingStaff = async (staffData) => {
  if (!staffData) {
    throw new Error("Staff data is required.");
  }

  const cleanCode = String(
    staffData.StaffCode || staffData.staffCode || "",
  ).trim();

  const rawUserId = staffData.UserId ?? staffData.userId;
  const cleanUserId =
    rawUserId !== null && rawUserId !== undefined
      ? String(rawUserId).trim()
      : "";

  if (!cleanUserId) {
    throw new Error(
      "A valid registered User ID is required to create a Non-Teaching Staff profile.",
    );
  }

  if (!cleanCode) {
    throw new Error("Staff Code is required.");
  }

  const formatDateOnly = (d) => {
    if (!d) return null;
    const str = String(d).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return str.substring(0, 10);
    }
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().substring(0, 10);
    }
    return str;
  };

  const formatDateTime = (d) => {
    if (!d) return null;
    const str = String(d).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return `${str}T00:00:00`;
    }
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
    return str;
  };

  const firstName = String(staffData.FirstName || staffData.firstName || "")
    .trim()
    .slice(0, 50);
  const middleName =
    (staffData.MiddleName || staffData.middleName)?.trim().slice(0, 50) || "";
  const lastName = String(staffData.LastName || staffData.lastName || "")
    .trim()
    .slice(0, 50);
  const gender = String(staffData.Gender || staffData.gender || "Male")
    .trim()
    .slice(0, 10);
  const email = String(staffData.Email || staffData.email || "")
    .trim()
    .slice(0, 100);
  const phoneNumber = String(
    staffData.PhoneNumber || staffData.phoneNumber || "",
  )
    .trim()
    .slice(0, 15);
  const altPhoneNumber =
    (staffData.AlternatePhoneNumber || staffData.alternatePhoneNumber)
      ?.trim()
      .slice(0, 15) || "";
  const address =
    (staffData.Address || staffData.address)?.trim().slice(0, 300) || "";
  const designation = String(
    staffData.Designation || staffData.designation || "Staff",
  )
    .trim()
    .slice(0, 100);
  const qualification = String(
    staffData.Qualification || staffData.qualification || "Graduate",
  )
    .trim()
    .slice(0, 100);
  const salary = Number(staffData.Salary ?? staffData.salary ?? 0) || 0;
  const rawDob = staffData.DateOfBirth || staffData.dateOfBirth;
  const rawJoin = staffData.JoiningDate || staffData.joiningDate;
  const dobDateOnly = formatDateOnly(rawDob) || "2000-01-01";
  const joinDateTime =
    formatDateTime(rawJoin) ||
    `${new Date().toISOString().split("T")[0]}T00:00:00`;
  const fatherName = staffData.FatherName || staffData.fatherName || null;
  const motherName = staffData.MotherName || staffData.motherName || null;
  const photo = staffData.Photo || staffData.photo || null;
  const educationPdf = staffData.EducationPdf || staffData.educationPdf || null;
  const educationFileName =
    staffData.EducationFileName || staffData.educationFileName || null;
  const roleName =
    staffData.roleName ||
    staffData.RoleName ||
    staffData.role ||
    staffData.Role ||
    staffData.userRole ||
    staffData.UserRole ||
    "Staff";

  // Backend DTO Payload matching CreateNonTeachingStaffDTO.cs
  const backendDtoPayload = {
    UserId: cleanUserId,
    StaffCode: cleanCode.slice(0, 20),
    FirstName: firstName,
    MiddleName: middleName,
    LastName: lastName,
    DateOfBirth: dobDateOnly,
    Gender: gender,
    Email: email,
    PhoneNumber: phoneNumber,
    AlternatePhoneNumber: altPhoneNumber,
    Address: address,
    Designation: designation,
    Qualification: qualification,
    Salary: salary,
    JoiningDate: joinDateTime,
    FatherName: fatherName,
    MotherName: motherName,
    Photo: photo,
    EducationPdf: educationPdf,
    EducationFileName: educationFileName,
  };

  const extraPayload = {
    ...staffData,
    ...backendDtoPayload,
    roleName,
    RoleName: roleName,
    role: roleName,
    Role: roleName,
    fatherName,
    FatherName: fatherName,
    motherName,
    MotherName: motherName,
    photo,
    Photo: photo,
    educationPdf,
    EducationPdf: educationPdf,
    educationFileName,
    EducationFileName: educationFileName,
  };
  saveStaffExtraFields(cleanCode, extraPayload);
  saveStaffExtraFields(cleanUserId, extraPayload);

  const response = await fetch(`${API_URL}/NonTeachingStaff/CreateStaff`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(backendDtoPayload),
  });

  const res = await handleResponse(response);

  const fullLocalData = {
    ...extraPayload,
    ...(typeof res === "object" ? res : {}),
    StaffCode: cleanCode,
    staffCode: cleanCode,
    UserId: cleanUserId,
    userId: cleanUserId,
  };

  restoreNonTeachingStaff(cleanCode, fullLocalData);
  restoreNonTeachingStaff(cleanUserId, fullLocalData);
  if (fullLocalData.id || fullLocalData.Id) {
    restoreNonTeachingStaff(
      fullLocalData.id || fullLocalData.Id,
      fullLocalData,
    );
  }
  saveStaffToRegistry(fullLocalData);
  saveStaffExtraFields(cleanCode, fullLocalData);
  saveStaffExtraFields(cleanUserId, fullLocalData);

  return res || fullLocalData;
};

// =====================================================
// UPDATE NON-TEACHING STAFF
// PUT /api/NonTeachingStaff/UpdateStaff/{code}
// =====================================================

export const updateNonTeachingStaff = async (code, staffData) => {
  if (!code || !code.trim()) {
    throw new Error("Staff code is required for update.");
  }

  if (!staffData) {
    throw new Error("Staff data is required for update.");
  }

  const cleanCode = code.trim();
  const rawUserId = staffData.UserId ?? staffData.userId;
  const cleanUserId =
    rawUserId !== null && rawUserId !== undefined
      ? String(rawUserId).trim()
      : "";

  const formatDateOnly = (d) => {
    if (!d) return null;
    const str = String(d).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
      return str.substring(0, 10);
    }
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().substring(0, 10);
    }
    return str;
  };

  const formatDateTime = (d) => {
    if (!d) return null;
    const str = String(d).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
      return `${str}T00:00:00`;
    }
    const parsed = new Date(d);
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString();
    }
    return str;
  };

  const firstName = String(
    staffData.FirstName || staffData.firstName || "",
  ).trim();
  const middleName =
    (staffData.MiddleName || staffData.middleName)?.trim() || "";
  const lastName = String(
    staffData.LastName || staffData.lastName || "",
  ).trim();
  const gender = String(staffData.Gender || staffData.gender || "").trim();
  const email = String(staffData.Email || staffData.email || "").trim();
  const phoneNumber = String(
    staffData.PhoneNumber || staffData.phoneNumber || "",
  ).trim();
  const altPhoneNumber =
    (
      staffData.AlternatePhoneNumber || staffData.alternatePhoneNumber
    )?.trim() || "";
  const address = (staffData.Address || staffData.address)?.trim() || "";
  const designation = String(
    staffData.Designation || staffData.designation || "",
  ).trim();
  const qualification = String(
    staffData.Qualification || staffData.qualification || "",
  ).trim();
  const salary = Number(staffData.Salary ?? staffData.salary ?? 0) || 0;
  const rawDob = staffData.DateOfBirth || staffData.dateOfBirth;
  const rawJoin = staffData.JoiningDate || staffData.joiningDate;
  const dobDateOnly = formatDateOnly(rawDob);
  const joinDateTime = formatDateTime(rawJoin);
  const fatherName = staffData.FatherName || staffData.fatherName || null;
  const motherName = staffData.MotherName || staffData.motherName || null;
  const photo = staffData.Photo || staffData.photo || null;
  const educationPdf = staffData.EducationPdf || staffData.educationPdf || null;
  const educationFileName =
    staffData.EducationFileName || staffData.educationFileName || null;
  const roleName =
    staffData.roleName ||
    staffData.RoleName ||
    staffData.role ||
    staffData.Role ||
    staffData.userRole ||
    staffData.UserRole ||
    "Staff";

  const fullLocalData = {
    ...staffData,
    staffCode: cleanCode,
    StaffCode: cleanCode,
    userId: cleanUserId,
    UserId: cleanUserId,
    roleName: roleName,
    RoleName: roleName,
    role: roleName,
    Role: roleName,
    fatherName: fatherName,
    FatherName: fatherName,
    motherName: motherName,
    MotherName: motherName,
    photo: photo,
    Photo: photo,
    educationPdf: educationPdf,
    EducationPdf: educationPdf,
    educationFileName: educationFileName,
    EducationFileName: educationFileName,
  };
  restoreNonTeachingStaff(cleanCode, fullLocalData);
  if (cleanUserId) {
    restoreNonTeachingStaff(String(cleanUserId), fullLocalData);
  }
  if (fullLocalData.id || fullLocalData.Id) {
    restoreNonTeachingStaff(
      fullLocalData.id || fullLocalData.Id,
      fullLocalData,
    );
  }
  saveStaffToRegistry(fullLocalData);
  saveStaffExtraFields(cleanCode, fullLocalData);
  if (cleanUserId) {
    saveStaffExtraFields(String(cleanUserId), fullLocalData);
  }

  // Update Non-Teaching Staff DTO payload matching UpdateNonTeachingStaffDTO.cs
  const updateDtoPayload = {
    FirstName: firstName,
    MiddleName: middleName,
    LastName: lastName,
    DateOfBirth: dobDateOnly,
    Gender: gender,
    Email: email,
    PhoneNumber: phoneNumber,
    AlternatePhoneNumber: altPhoneNumber,
    Address: address,
    Designation: designation,
    Qualification: qualification,
    FatherName: fatherName,
    MotherName: motherName,
    Photo: photo,
    EducationPdf: educationPdf,
    EducationFileName: educationFileName,
    Salary: salary,
    JoiningDate: joinDateTime,
    IsActive:
      staffData.IsActive !== undefined
        ? Boolean(staffData.IsActive)
        : staffData.isActive !== undefined
          ? Boolean(staffData.isActive)
          : true,
  };

  const response = await fetch(
    `${API_URL}/NonTeachingStaff/UpdateStaff/${encodeURIComponent(cleanCode)}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(updateDtoPayload),
    },
  );

  const res = await handleResponse(response);

  const merged = {
    ...fullLocalData,
    ...(typeof res === "object" ? res : {}),
  };
  saveStaffToRegistry(merged);
  saveStaffExtraFields(cleanCode, merged);
  return res || merged;
};

// =====================================================
// DELETE NON-TEACHING STAFF
// DELETE /api/NonTeachingStaff/DeleteStaff/{code}
// =====================================================

export const deleteNonTeachingStaff = async (code, staffData = null) => {
  if (!code || !code.trim()) {
    throw new Error("Staff code is required.");
  }

  const cleanCode = code.trim();

  // Mark as soft-deleted locally for instant UI update
  softDeleteNonTeachingStaff(cleanCode, staffData);

  const response = await fetch(
    `${API_URL}/NonTeachingStaff/DeleteStaff/${encodeURIComponent(cleanCode)}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );

  await handleResponse(response);

  return {
    status: true,
    message: "Non Teaching Staff deleted successfully.",
  };
};
