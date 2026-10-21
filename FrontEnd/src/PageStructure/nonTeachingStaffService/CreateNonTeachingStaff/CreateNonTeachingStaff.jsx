import { useEffect, useState, useMemo } from "react";

import {
  createNonTeachingStaff,
  getUserDropdownByUserType,
  getAllNonTeachingStaff,
  getStoredStaffExtraMap,
  saveStaffExtraFields,
  isStaffSoftDeleted,
} from "../../../Services/nonTeachingStaffService";

import {
  getAllTeachers,
  getStoredTeacherExtraMap,
} from "../../../Services/teacherService";

import { getAllStudents } from "../../../Services/studentService";
import {
  getAllUsers,
  getUserTypeDropdown,
  getUserDropdownByRole,
  createUser,
  getRoleDropdown,
} from "../../../Services/userService";

import {
  compressImageFile,
  readPdfAsBase64,
  openPhotoInNewTab,
  openPdfInNewTab,
} from "../../../Utils/fileHelper";
import { isOperatorRole, isOperatorRecord } from "../../../Utils/auth";
import QuickRegisterUserCard from "../../../Components/Common/QuickRegisterUserCard";
import "./CreateNonTeachingStaff.css";

const NON_TEACHING_STAFF_USER_TYPE_ID = 4;

const initialFormData = {
  UserId: "",
  StaffCode: "",
  FirstName: "",
  MiddleName: "",
  LastName: "",
  DateOfBirth: "",
  Gender: "",
  Email: "",
  PhoneNumber: "",
  AlternatePhoneNumber: "",
  Address: "",
  Designation: "",
  Qualification: "",
  Salary: "",
  JoiningDate: "",
  FatherName: "",
  MotherName: "",
  Photo: "",
  EducationPdf: "",
  EducationFileName: "",
};

const CreateNonTeachingStaff = () => {
  // =====================================================
  // FORM & FILE STATES (Declared First to Avoid Reference Errors)
  // =====================================================

  const [formData, setFormData] = useState(initialFormData);
  const [photoCompressing, setPhotoCompressing] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [selectedPdfName, setSelectedPdfName] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // POPUP NOTIFICATION (SUCCESS & ERROR)
  // =====================================================
  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: "",
  });

  const showPopup = (type, popupMessage) => {
    setPopup({
      show: true,
      type,
      message: popupMessage,
    });

    setTimeout(() => {
      setPopup({
        show: false,
        type: "",
        message: "",
      });
    }, 4000);
  };

  // =====================================================
  // USERS & EXISTING PROFILES (STAFF, TEACHERS, STUDENTS)
  // =====================================================

  const [users, setUsers] = useState([]);
  const [existingStaff, setExistingStaff] = useState([]);
  const [existingTeachers, setExistingTeachers] = useState([]);
  const [existingStudents, setExistingStudents] = useState([]);

  const getStaffUserId = (user) => {
    if (!user) return "";
    const id =
      user.code ??
      user.Code ??
      user.id ??
      user.Id ??
      user.userId ??
      user.UserId ??
      user.userID ??
      user.UserID ??
      user.value ??
      user.Value ??
      "";
    const str = id !== null && id !== undefined ? String(id).trim() : "";
    if (str && str !== "0") return str;
    const fallback = user.code ?? user.Code ?? user.id ?? user.Id ?? "";
    return fallback !== null && fallback !== undefined
      ? String(fallback).trim()
      : "";
  };

  const getStaffUserName = (user) => {
    if (!user) return "";
    return (
      user.text ??
      user.Text ??
      user.username ??
      user.Username ??
      user.name ??
      user.Name ??
      user.displayName ??
      user.DisplayName ??
      user.label ??
      user.Label ??
      ""
    ).trim();
  };

  const getStaffUserEmail = (user) => {
    if (!user) return "";
    const email =
      user.email ?? user.Email ?? user.userEmail ?? user.UserEmail ?? "";
    return email ? String(email).trim().toLowerCase() : "";
  };

  const getSelectedUserRole = (userId) => {
    if (!userId) return "";
    const cleanId = String(userId).trim().toLowerCase();

    // 1. Check local lookup cache first (e.g. from Step 1 user registration)
    try {
      const raw = localStorage.getItem("school_user_roles_lookup_v1");
      if (raw) {
        const map = JSON.parse(raw);
        if (map[cleanId]) return map[cleanId];
        if (map[String(userId).trim()]) return map[String(userId).trim()];
      }
    } catch (_) {}

    const found = users.find(
      (u) =>
        getStaffUserId(u).toLowerCase() === cleanId ||
        String(u.id ?? u.Id ?? u.userId ?? u.UserId ?? "").toLowerCase() ===
          cleanId ||
        String(u.username ?? u.Username ?? "").toLowerCase() === cleanId,
    );

    if (!found) {
      try {
        const raw = localStorage.getItem("school_user_roles_lookup_v1");
        if (raw) {
          const map = JSON.parse(raw);
          if (map[cleanId]) return map[cleanId];
        }
      } catch (_) {}
      return "";
    }

    const rId = String(
      found.roleId ??
        found.RoleId ??
        found.roleIds?.[0] ??
        found.RoleIds?.[0] ??
        "",
    );
    const roleIdsList = Array.isArray(found.roleIds)
      ? found.roleIds
      : Array.isArray(found.RoleIds)
        ? found.RoleIds
        : [];

    if (rId === "6" || roleIdsList.includes(6) || roleIdsList.includes("6")) {
      return "Operator";
    }
    if (rId === "7" || roleIdsList.includes(7) || roleIdsList.includes("7")) {
      return "Office Staff";
    }
    if (rId === "4" || roleIdsList.includes(4) || roleIdsList.includes("4")) {
      return "Other Non Teaching Staff";
    }

    let role = (
      found.roleName ||
      found.RoleName ||
      found.role ||
      found.Role ||
      found.userRole ||
      found.UserRole ||
      ""
    ).trim();

    if (!role || role.toLowerCase() === "staff") {
      if (rId === "6") role = "Operator";
      else if (rId === "7") role = "Office Staff";
      else if (rId === "4") role = "Other Non Teaching Staff";
    }
    if (role.toLowerCase().includes("operator")) return "Operator";
    if (role.toLowerCase().includes("office")) return "Office Staff";
    if (role.toLowerCase().includes("other")) return "Other Non Teaching Staff";

    if (!role && found.text?.includes("(") && found.text?.includes(")")) {
      const match = found.text.match(/\(([^)]+)\)/);
      if (match) role = match[1].trim();
    }

    return role || "Operator";
  };

  const generateNextStaffCode = (staffList = existingStaff) => {
    const list = Array.isArray(staffList) ? staffList : [];
    const usedCodes = new Set(
      list
        .map((s) =>
          (s?.staffCode || s?.StaffCode || "").toString().trim().toUpperCase(),
        )
        .filter(Boolean),
    );

    try {
      const reg = JSON.parse(
        localStorage.getItem("school_nts_registry_v1") || "{}",
      );
      Object.values(reg).forEach((item) => {
        const c = (item?.staffCode || item?.StaffCode || "")
          .toString()
          .trim()
          .toUpperCase();
        if (c) usedCodes.add(c);
      });
    } catch (_) {}

    let hasStaffPrefix = false;
    let maxStaffNum = 0;
    let maxNtsNum = 0;

    usedCodes.forEach((code) => {
      const match = code.match(/(\d+)/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (code.startsWith("STAFF")) {
          hasStaffPrefix = true;
          if (num > maxStaffNum) maxStaffNum = num;
        } else if (code.startsWith("NTS")) {
          if (num > maxNtsNum) maxNtsNum = num;
        } else {
          if (num > maxStaffNum) maxStaffNum = num;
        }
      }
    });

    const prefix = hasStaffPrefix ? "Staff" : "NTS";
    let nextNum = (hasStaffPrefix ? maxStaffNum : maxNtsNum) + 1;
    if (nextNum <= 0) nextNum = 1;

    let candidate = `${prefix}${String(nextNum).padStart(3, "0")}`;
    while (
      usedCodes.has(candidate.toUpperCase()) ||
      usedCodes.has(`STAFF${String(nextNum).padStart(3, "0")}`) ||
      usedCodes.has(`NTS${String(nextNum).padStart(3, "0")}`)
    ) {
      nextNum++;
      candidate = `${prefix}${String(nextNum).padStart(3, "0")}`;
    }
    return candidate;
  };

  const loadExistingProfiles = async () => {
    try {
      const [staffRes, teacherRes, studentRes] = await Promise.allSettled([
        getAllNonTeachingStaff(),
        getAllTeachers(),
        getAllStudents(),
      ]);

      if (staffRes.status === "fulfilled") {
        const list = Array.isArray(staffRes.value)
          ? staffRes.value
          : staffRes.value?.data || staffRes.value?.Data || [];
        setExistingStaff(list);
        setFormData((prev) => {
          if (!prev.StaffCode) {
            return { ...prev, StaffCode: generateNextStaffCode(list) };
          }
          return prev;
        });
      }

      if (teacherRes.status === "fulfilled") {
        const list = Array.isArray(teacherRes.value)
          ? teacherRes.value
          : teacherRes.value?.data || teacherRes.value?.Data || [];
        setExistingTeachers(list);
      }

      if (studentRes.status === "fulfilled") {
        const list = Array.isArray(studentRes.value)
          ? studentRes.value
          : studentRes.value?.data || studentRes.value?.Data || [];
        setExistingStudents(list);
      }
    } catch (err) {
      console.warn(
        "Could not load existing profiles for duplicate check:",
        err,
      );
    }
  };

  // =====================================================
  // UNASSIGNED / AVAILABLE NON-TEACHING STAFF USERS FILTER
  // Excludes users whose profile has already been created / assigned
  // =====================================================

  const assignedIdentifiers = useMemo(() => {
    const ids = new Set();
    const usernames = new Set();
    const emails = new Set();

    const addId = (id) => {
      if (id !== null && id !== undefined) {
        const str = String(id).trim().toLowerCase();
        if (str && str !== "0" && str !== "null" && str !== "undefined") {
          ids.add(str);
        }
      }
    };

    const addUsername = (name) => {
      if (name && typeof name === "string" && name.trim()) {
        usernames.add(name.trim().toLowerCase());
      }
    };

    const addEmail = (email) => {
      if (
        email &&
        typeof email === "string" &&
        email.trim() &&
        email.includes("@")
      ) {
        emails.add(email.trim().toLowerCase());
      }
    };

    // 1. Existing Staff (only active, not soft deleted)
    if (Array.isArray(existingStaff)) {
      existingStaff
        .filter(
          (s) =>
            s &&
            (typeof isStaffSoftDeleted === "function"
              ? !isStaffSoftDeleted(s)
              : true),
        )
        .forEach((s) => {
          if (!s) return;
          addId(
            s.UserId ??
              s.userId ??
              s.UserID ??
              s.userID ??
              s.User?.Id ??
              s.User?.id ??
              s.user?.Id ??
              s.user?.id,
          );
          addUsername(
            s.user?.username ??
              s.User?.userName ??
              s.Username ??
              s.username ??
              s.userName ??
              s.UserName,
          );
          addEmail(
            s.Email ??
              s.email ??
              s.user?.email ??
              s.User?.email ??
              s.userEmail ??
              s.UserEmail,
          );
        });
    }

    // 2. Existing Teachers
    if (Array.isArray(existingTeachers)) {
      existingTeachers.forEach((t) => {
        if (!t) return;
        addId(
          t.UserId ??
            t.userId ??
            t.UserID ??
            t.userID ??
            t.User?.Id ??
            t.User?.id ??
            t.user?.Id ??
            t.user?.id,
        );
        addUsername(
          t.user?.username ??
            t.User?.userName ??
            t.Username ??
            t.username ??
            t.userName ??
            t.UserName,
        );
        addEmail(
          t.Email ??
            t.email ??
            t.user?.email ??
            t.User?.email ??
            t.userEmail ??
            t.UserEmail,
        );
      });
    }

    // 3. Existing Students
    if (Array.isArray(existingStudents)) {
      existingStudents.forEach((st) => {
        if (!st) return;
        addId(
          st.UserId ??
            st.userId ??
            st.UserID ??
            st.userID ??
            st.User?.Id ??
            st.User?.id ??
            st.user?.Id ??
            st.user?.id,
        );
        addUsername(
          st.user?.username ??
            st.User?.userName ??
            st.Username ??
            st.username ??
            st.userName ??
            st.UserName,
        );
        addEmail(
          st.Email ??
            st.email ??
            st.user?.email ??
            st.User?.email ??
            st.userEmail ??
            st.UserEmail,
        );
      });
    }

    return { ids, usernames, emails };
  }, [existingStaff, existingTeachers, existingStudents]);

  const availableStaffUsers = useMemo(() => {
    if (!Array.isArray(users)) return [];
    const isCurrentOp = isOperatorRole();

    return users.filter((u) => {
      const uId = getStaffUserId(u);
      if (!uId) return false;

      // Operator cannot create/assign another Operator (DB Role ID 4)
      if (isCurrentOp) {
        if (isOperatorRecord(u)) return false;
        const roleLabel = getSelectedUserRole(uId).toLowerCase();
        if (roleLabel.includes("operator")) return false;
        const rId = String(
          u.roleId ?? u.RoleId ?? u.roleIds?.[0] ?? u.RoleIds?.[0] ?? "",
        );
        if (rId === "4") return false;
      }

      // If user is currently selected in form, keep visible
      if (
        formData.UserId &&
        String(formData.UserId).trim().toLowerCase() === uId.toLowerCase()
      ) {
        return true;
      }

      // Check if user is flagged as assigned
      if (
        u.isAssigned === true ||
        u.IsAssigned === true ||
        u.isMapped === true ||
        u.IsMapped === true ||
        u.isAllocated === true ||
        u.IsAllocated === true ||
        u.isProfileCreated === true ||
        u.IsProfileCreated === true ||
        u.assigned === true ||
        u.Assigned === true
      ) {
        return false;
      }

      const cleanId = uId.toLowerCase();
      const uName = getStaffUserName(u).toLowerCase();
      const uEmail = getStaffUserEmail(u);

      if (assignedIdentifiers.ids.has(cleanId)) return false;
      if (
        uName &&
        (assignedIdentifiers.usernames.has(uName) ||
          assignedIdentifiers.ids.has(uName))
      )
        return false;
      if (uEmail && assignedIdentifiers.emails.has(uEmail)) return false;

      return true;
    });
  }, [users, assignedIdentifiers, formData.UserId]);

  // ===================================================
  // PHOTO & PDF FILE HANDLERS
  // ===================================================

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Photo file size must be less than 10 MB.");
      e.target.value = "";
      return;
    }
    try {
      setPhotoCompressing(true);
      setError("");
      const compressed = await compressImageFile(file);
      setFormData((prev) => ({ ...prev, Photo: compressed }));
      setSelectedPhotoName(file.name);
    } catch (err) {
      console.error("Photo processing error:", err);
      setError("Failed to process selected image.");
    } finally {
      setPhotoCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, Photo: "" }));
    setSelectedPhotoName("");
    const input = document.getElementById("nts-photo-file");
    if (input) input.value = "";
  };

  const handlePdfFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      file.type !== "application/pdf" &&
      !file.name?.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      e.target.value = "";
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("PDF file size must be less than 15 MB.");
      e.target.value = "";
      return;
    }
    try {
      setPdfProcessing(true);
      setError("");
      const base64Pdf = await readPdfAsBase64(file);
      setFormData((prev) => ({
        ...prev,
        EducationPdf: base64Pdf,
        EducationFileName: file.name,
      }));
      setSelectedPdfName(file.name);
    } catch (err) {
      console.error("PDF processing error:", err);
      setError("Failed to process selected PDF.");
    } finally {
      setPdfProcessing(false);
    }
  };

  const handleRemovePdf = () => {
    setFormData((prev) => ({
      ...prev,
      EducationPdf: "",
      EducationFileName: "",
    }));
    setSelectedPdfName("");
    const input = document.getElementById("nts-pdf-file");
    if (input) input.value = "";
  };

  // =====================================================
  // LOAD NON TEACHING STAFF USERS & PROFILES
  // Filter users according to Non-Teaching Staff user type (UserTypeId = 4) & roles
  // =====================================================

  useEffect(() => {
    loadExistingProfiles();
    loadNonTeachingStaffUsers();
  }, []);

  const loadNonTeachingStaffUsers = async () => {
    try {
      setLoadingUsers(true);
      setError("");

      let staffUsersList = [];
      const staffTypeIds = new Set(["4"]);

      // 1. Discover user types dynamically to find non-teaching staff type IDs
      try {
        const utRes = await getUserTypeDropdown();
        const utList = Array.isArray(utRes)
          ? utRes
          : utRes?.data || utRes?.Data || [];
        utList.forEach((ut) => {
          const name = String(
            ut.text ?? ut.Text ?? ut.name ?? ut.Name ?? "",
          ).toLowerCase();
          const id = String(ut.id ?? ut.Id ?? ut.code ?? ut.Code ?? "");
          if (id && (name.includes("non") || name.includes("staff"))) {
            staffTypeIds.add(id);
          }
        });
      } catch (err) {
        console.warn("Could not load user types dropdown:", err);
      }

      // 2. Fetch all users and filter
      try {
        const allUsersResponse = await getAllUsers();
        const allUsers = Array.isArray(allUsersResponse)
          ? allUsersResponse
          : allUsersResponse?.data || allUsersResponse?.Data || [];

        if (Array.isArray(allUsers) && allUsers.length > 0) {
          staffUsersList = allUsers.filter((user) => {
            const uTypeId = String(
              user.userTypeId ??
                user.UserTypeId ??
                user.typeId ??
                user.TypeId ??
                "",
            );
            const rId = String(
              user.roleId ??
                user.RoleId ??
                user.roleIds?.[0] ??
                user.RoleIds?.[0] ??
                "",
            );
            const typeName = String(
              user.userTypeName ??
                user.UserTypeName ??
                user.userType ??
                user.UserType ??
                user.typeName ??
                user.TypeName ??
                "",
            )
              .trim()
              .toLowerCase();
            const roleName = String(
              user.roleName ?? user.RoleName ?? user.role ?? user.Role ?? "",
            )
              .trim()
              .toLowerCase();

            // Exclude teacher, student, superadmin, admin
            if (
              uTypeId === "3" ||
              uTypeId === "5" ||
              rId === "3" ||
              rId === "5" ||
              rId === "1" ||
              rId === "2" ||
              typeName.includes("teacher") ||
              typeName.includes("student") ||
              roleName.includes("teacher") ||
              roleName.includes("student") ||
              typeName.includes("superadmin") ||
              typeName.includes("super admin") ||
              roleName.includes("superadmin") ||
              roleName.includes("super admin") ||
              typeName === "admin" ||
              roleName === "admin" ||
              typeName.includes("principal") ||
              roleName.includes("principal")
            ) {
              return false;
            }

            return true;
          });
        }
      } catch (userErr) {
        console.warn("Failed to load users from getAllUsers:", userErr);
      }

      // 3. Merge with dropdown endpoints (User Type 4, Role 5 = Office Employee, 7 = Other Staff, 4 = Operator)
      const dropdownFetchers = [
        getUserDropdownByUserType(4),
        getUserDropdownByRole(5),
        getUserDropdownByRole(7),
        getUserDropdownByRole(4),
      ];

      try {
        const dropdownResults = await Promise.allSettled(dropdownFetchers);
        dropdownResults.forEach((res) => {
          if (res.status === "fulfilled") {
            const raw = res.value;
            const items = Array.isArray(raw)
              ? raw
              : raw?.data || raw?.Data || [];
            if (Array.isArray(items)) {
              const existingIds = new Set(
                staffUsersList.map((u) => getStaffUserId(u)).filter(Boolean),
              );
              for (const user of items) {
                const uId = getStaffUserId(user);
                if (uId && !existingIds.has(uId)) {
                  staffUsersList.push(user);
                  existingIds.add(uId);
                }
              }
            }
          }
        });
      } catch (dropErr) {
        console.warn("Dropdown merge Notice:", dropErr);
      }

      const isCurrentOp = isOperatorRole();
      const validUsers = staffUsersList.filter((u) => {
        const uId = getStaffUserId(u);
        if (!uId) return false;
        const uname = String(
          u.username || u.Username || u.name || u.Name || "",
        ).toLowerCase();
        const roleName = String(
          u.roleName ||
            u.RoleName ||
            u.role ||
            u.Role ||
            u.userTypeName ||
            u.UserTypeName ||
            u.userType ||
            u.UserType ||
            "",
        ).toLowerCase();
        const rId = String(
          u.roleId ?? u.RoleId ?? u.roleIds?.[0] ?? u.RoleIds?.[0] ?? "",
        );

        if (
          uname === "admin" ||
          uname === "superadmin" ||
          uname === "amin" ||
          roleName.includes("admin") ||
          roleName.includes("amin") ||
          roleName.includes("super") ||
          rId === "1" ||
          rId === "2" ||
          roleName.includes("teacher") ||
          roleName.includes("student")
        ) {
          return false;
        }

        // If current user is operator, exclude operator accounts (DB Role ID 4)
        if (
          isCurrentOp &&
          (isOperatorRecord(u) || roleName.includes("operator") || rId === "4")
        ) {
          return false;
        }

        return true;
      });
      setUsers(validUsers);
    } catch (err) {
      setError(err?.message || "Failed to load Non Teaching Staff users.");
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "UserId") {
      const selectedUser = users.find(
        (u) => getStaffUserId(u) === String(value).trim(),
      );
      const userEmail = selectedUser ? getStaffUserEmail(selectedUser) : "";

      setFormData((previous) => ({
        ...previous,
        UserId: value,
        Email: !previous.Email && userEmail ? userEmail : previous.Email,
      }));
      setError("");
      setMessage("");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // 1. Verify User Selection
    if (!formData.UserId) {
      const msg =
        "Please select a User to create Non Teaching Staff Profile (or register a user in Step 1 above).";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    const cleanUser = String(formData.UserId).trim().toLowerCase();
    if (assignedIdentifiers.ids.has(cleanUser)) {
      const msg =
        "This User is already assigned to an existing profile. Please select an unassigned user.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    // 2. Staff Code Validation & Auto-generation
    let finalStaffCode = formData.StaffCode?.trim();
    if (!finalStaffCode) {
      finalStaffCode = `NTS${String(Date.now()).slice(-4)}`;
    }

    const cleanStaffCode = finalStaffCode.toLowerCase();
    const isDuplicateCode = existingStaff
      .filter(
        (s) =>
          s &&
          (typeof isStaffSoftDeleted === "function"
            ? !isStaffSoftDeleted(s)
            : true),
      )
      .some(
        (s) =>
          (s.staffCode || s.StaffCode || "").toString().trim().toLowerCase() ===
          cleanStaffCode,
      );
    if (isDuplicateCode) {
      finalStaffCode = `NTS${String(Date.now()).slice(-4)}_${Math.floor(Math.random() * 100)}`;
    }

    if (!formData.FirstName?.trim()) {
      const msg = "First Name is required.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    if (!formData.LastName?.trim()) {
      const msg = "Last Name is required.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    if (!formData.DateOfBirth) {
      const msg = "Date of Birth is required.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    if (!formData.Gender) {
      const msg = "Gender is required.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    if (!formData.Email?.trim()) {
      const msg = "Email is required.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    const cleanEmail = formData.Email.trim().toLowerCase();
    const isDuplicateEmail = existingStaff
      .filter(
        (s) =>
          s &&
          (typeof isStaffSoftDeleted === "function"
            ? !isStaffSoftDeleted(s)
            : true),
      )
      .some((s) => {
        const sUserId = String(s.userId ?? s.UserId ?? "")
          .trim()
          .toLowerCase();
        const sEmail = (s.email || s.Email || "")
          .toString()
          .trim()
          .toLowerCase();
        if (sUserId && sUserId === cleanUser) return false;
        return sEmail && sEmail === cleanEmail;
      });
    if (isDuplicateEmail) {
      const msg = `Email "${formData.Email.trim()}" is already registered with another staff profile. Please use a unique Email.`;
      setError(msg);
      showPopup("error", msg);
      return;
    }

    if (!formData.PhoneNumber?.trim()) {
      const msg = "Phone Number is required.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    if (!formData.Designation?.trim()) {
      const msg = "Designation is required.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    if (!formData.Qualification?.trim()) {
      const msg = "Qualification is required.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    if (!formData.JoiningDate) {
      const msg = "Joining Date is required.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    try {
      setLoading(true);

      const finalUserId = String(formData.UserId).trim();

      if (!finalUserId) {
        const msg =
          "Please select a valid registered User to create Non Teaching Staff Profile.";
        setError(msg);
        showPopup("error", msg);
        setLoading(false);
        return;
      }

      const roleName = getSelectedUserRole(formData.UserId) || "Staff";

      const payload = {
        UserId: finalUserId,
        StaffCode: finalStaffCode,
        FirstName: formData.FirstName.trim(),
        MiddleName: formData.MiddleName?.trim() || "",
        LastName: formData.LastName.trim(),
        DateOfBirth: formData.DateOfBirth,
        Gender: formData.Gender.trim(),
        Email: formData.Email.trim(),
        PhoneNumber: formData.PhoneNumber.trim(),
        AlternatePhoneNumber: formData.AlternatePhoneNumber?.trim() || "",
        Address: formData.Address?.trim() || "",
        Designation: formData.Designation.trim(),
        Qualification: formData.Qualification.trim(),
        Salary: Number(formData.Salary) || 0,
        JoiningDate: formData.JoiningDate,
        roleName: roleName,
        RoleName: roleName,
        role: roleName,
        Role: roleName,
        userRole: roleName,
        UserRole: roleName,
        FatherName: formData.FatherName?.trim() || null,
        MotherName: formData.MotherName?.trim() || null,
        Photo: formData.Photo || null,
        EducationPdf: formData.EducationPdf || null,
        EducationFileName: formData.EducationFileName || null,
      };

      const extraFieldsToSave = {
        Photo: formData.Photo || null,
        photo: formData.Photo || null,
        FatherName: formData.FatherName?.trim() || "",
        fatherName: formData.FatherName?.trim() || "",
        MotherName: formData.MotherName?.trim() || "",
        motherName: formData.MotherName?.trim() || "",
        EducationPdf: formData.EducationPdf || null,
        educationPdf: formData.EducationPdf || null,
        EducationFileName: formData.EducationFileName || "",
        educationFileName: formData.EducationFileName || "",
        roleName: roleName,
        RoleName: roleName,
        role: roleName,
        Role: roleName,
        userRole: roleName,
        UserRole: roleName,
        UserId: finalUserId,
        userId: finalUserId,
        StaffCode: formData.StaffCode.trim(),
        staffCode: formData.StaffCode.trim(),
      };

      saveStaffExtraFields(formData.StaffCode.trim(), extraFieldsToSave);
      saveStaffExtraFields(
        formData.StaffCode.trim().toLowerCase(),
        extraFieldsToSave,
      );
      saveStaffExtraFields(finalUserId, extraFieldsToSave);
      saveStaffExtraFields(finalUserId.toLowerCase(), extraFieldsToSave);

      const createdResult = await createNonTeachingStaff(payload);
      console.log("Created Non Teaching Staff in Database:", createdResult);

      if (createdResult?.id || createdResult?.Id) {
        saveStaffExtraFields(
          String(createdResult.id || createdResult.Id),
          extraFieldsToSave,
        );
      }

      const successMsg = `Non Teaching Staff "${payload.FirstName} ${payload.LastName}" created successfully!`;
      setMessage(successMsg);
      showPopup("success", successMsg);

      // Refresh all existing profiles & users list
      await loadExistingProfiles();
      await loadNonTeachingStaffUsers();

      setFormData(initialFormData);
      setSelectedPhotoName("");
      setSelectedPdfName("");
    } catch (err) {
      const errorMsg = err?.message || "Failed to create Non Teaching Staff.";
      setError(errorMsg);
      showPopup("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // HANDLE QUICK USER CREATION (STEP 1)
  // =====================================================
  const handleUserCreated = (newUser) => {
    if (!newUser) return;
    const newId = String(
      newUser.id ??
        newUser.Id ??
        newUser.userId ??
        newUser.UserId ??
        newUser.numericUserId ??
        "",
    ).trim();

    // Add to users dropdown list if not already present or merge
    setUsers((prev) => {
      const exists = prev.some((u) => getStaffUserId(u) === newId);
      if (!exists) {
        return [newUser, ...prev];
      }
      return prev.map((u) =>
        getStaffUserId(u) === newId ? { ...u, ...newUser } : u,
      );
    });

    // Pre-select the user in the staff form & autofill email and suggested staff code
    setFormData((prev) => ({
      ...prev,
      UserId: newId,
      StaffCode: prev.StaffCode || `NTS${String(Date.now()).slice(-4)}`,
      Email:
        !prev.Email && (newUser.username?.includes("@") || newUser.email)
          ? newUser.email || newUser.username
          : prev.Email,
    }));
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="nts-create-page teacher-create-page">
      {/* =================================================
          POPUP (MATCHING TEACHER POPUP)
      ================================================= */}
      {popup.show && (
        <div
          className={`teacher-popup teacher-popup-${popup.type} nts-popup nts-popup-${popup.type}`}
        >
          <div className="teacher-popup-icon nts-popup-icon">
            {popup.type === "success" ? "✓" : "!"}
          </div>

          <div className="teacher-popup-content nts-popup-content">
            <strong>{popup.type === "success" ? "Success" : "Error"}</strong>
            <span>{popup.message}</span>
          </div>

          <button
            type="button"
            className="teacher-popup-close nts-popup-close"
            onClick={() =>
              setPopup({
                show: false,
                type: "",
                message: "",
              })
            }
          >
            ×
          </button>
        </div>
      )}

      <div className="nts-create-container">
        <div className="nts-create-header">
          <h2>Create Non Teaching Staff</h2>
          <p>Enter staff information below</p>
        </div>

        {/* =================================================
            STEP 1: USER ACCOUNT REGISTRATION
        ================================================= */}
        <QuickRegisterUserCard
          userType="NonTeachingStaff"
          onUserCreated={handleUserCreated}
          targetScrollId="staff-profile-form-section"
        />

        {message && <div className="nts-success">{message}</div>}
        {error && <div className="nts-error">{error}</div>}

        <form
          id="staff-profile-form-section"
          className="nts-create-form"
          onSubmit={handleSubmit}
        >
          <div className="nts-form-grid">
            {/* =================================================
                STEP 2 HEADER
            ================================================= */}
            <div className="step-2-section-header">
              <span className="step-badge step-2-badge">STEP 2</span>
              <div>
                <h2>Non-Teaching Staff Profile Details</h2>
                <p className="step-2-desc">
                  Select the registered staff user account (or pick an existing
                  user) and fill out staff information.
                </p>
              </div>
            </div>

            <div className="nts-form-group">
              <label>
                Select User to create Non Teaching Staff Profile{" "}
                <span
                  style={{
                    color: "#6b7280",
                    fontWeight: "normal",
                    fontSize: "13px",
                  }}
                >
                  (Unassigned Users)
                </span>
              </label>

              <select
                name="UserId"
                value={formData.UserId}
                onChange={handleChange}
                disabled={loadingUsers}
              >
                <option value="">
                  {loadingUsers
                    ? "Loading Non Teaching Staff users..."
                    : availableStaffUsers.length === 0
                      ? "-- Register User in Step 1 or Auto-Create on Submit --"
                      : "-- Select Non Teaching Staff User --"}
                </option>

                {formData.UserId &&
                  !availableStaffUsers.some(
                    (u) => getStaffUserId(u) === String(formData.UserId).trim(),
                  ) && (
                    <option value={formData.UserId}>
                      {formData.UserId} - (Selected User)
                    </option>
                  )}

                {availableStaffUsers.map((user, index) => {
                  const userId = getStaffUserId(user);
                  const username = getStaffUserName(user);
                  const role =
                    getSelectedUserRole(userId) ||
                    user.roleName ||
                    user.RoleName ||
                    user.role ||
                    user.Role ||
                    "Staff";

                  if (!userId) return null;

                  const displayText = username
                    ? `${userId} - ${username} (${role})`
                    : `${userId} (${role})`;

                  return (
                    <option key={`${userId}-${index}`} value={userId}>
                      {displayText}
                    </option>
                  );
                })}
              </select>

              <small
                style={{
                  display: "block",
                  marginTop: "6px",
                  fontSize: "12px",
                  fontWeight: "500",
                  color:
                    availableStaffUsers.length === 0 ? "#059669" : "#4b5563",
                }}
              >
                {availableStaffUsers.length > 0
                  ? `Showing ${availableStaffUsers.length} unassigned non-teaching staff account(s).`
                  : "✓ You can register a user in Step 1 above, or click Create to automatically link credentials."}
              </small>

              {formData.UserId && (
                <div className="nts-user-role-badge-row">
                  <span className="nts-role-badge type-badge">
                    👤 User Type: <strong>Non-Teaching Staff</strong>
                  </span>
                  <span className="nts-role-badge role-badge">
                    🏷️ Role:{" "}
                    <strong>
                      {getSelectedUserRole(formData.UserId) || "Staff"}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className="nts-form-group">
              <label>Staff Code</label>
              <input
                type="text"
                name="StaffCode"
                value={formData.StaffCode}
                onChange={handleChange}
                required
              />
            </div>

            <div className="nts-form-group">
              <label>First Name</label>
              <input
                type="text"
                name="FirstName"
                value={formData.FirstName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="nts-form-group">
              <label>Middle Name</label>
              <input
                type="text"
                name="MiddleName"
                value={formData.MiddleName}
                onChange={handleChange}
              />
            </div>

            <div className="nts-form-group">
              <label>Last Name</label>
              <input
                type="text"
                name="LastName"
                value={formData.LastName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="nts-form-group">
              <label>Date of Birth</label>
              <input
                type="date"
                name="DateOfBirth"
                value={formData.DateOfBirth}
                onChange={handleChange}
                required
              />
            </div>

            <div className="nts-form-group">
              <label>Gender</label>
              <select
                name="Gender"
                value={formData.Gender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="nts-form-group">
              <label>Father's Name</label>
              <input
                type="text"
                name="FatherName"
                value={formData.FatherName}
                onChange={handleChange}
                placeholder="Enter father's name"
              />
            </div>

            <div className="nts-form-group">
              <label>Mother's Name</label>
              <input
                type="text"
                name="MotherName"
                value={formData.MotherName}
                onChange={handleChange}
                placeholder="Enter mother's name"
              />
            </div>

            <div className="nts-form-group">
              <label>Email</label>
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="nts-form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="PhoneNumber"
                value={formData.PhoneNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="nts-form-group">
              <label>Alternate Phone Number</label>
              <input
                type="tel"
                name="AlternatePhoneNumber"
                value={formData.AlternatePhoneNumber}
                onChange={handleChange}
              />
            </div>

            <div className="nts-form-group">
              <label>Designation</label>
              <input
                type="text"
                name="Designation"
                value={formData.Designation}
                onChange={handleChange}
                required
              />
            </div>

            <div className="nts-form-group">
              <label>Qualification</label>
              <input
                type="text"
                name="Qualification"
                value={formData.Qualification}
                onChange={handleChange}
                required
              />
            </div>

            <div className="nts-form-group">
              <label>Salary</label>
              <input
                type="number"
                name="Salary"
                value={formData.Salary}
                onChange={handleChange}
                min="0"
                required
              />
            </div>

            <div className="nts-form-group">
              <label>Joining Date</label>
              <input
                type="date"
                name="JoiningDate"
                value={formData.JoiningDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* Photo Upload Field */}
            <div className="nts-form-group">
              <label>Staff Photo</label>
              <div className="nts-file-upload-box">
                <input
                  type="file"
                  id="nts-photo-file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoFileChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="nts-file-btn"
                  onClick={() =>
                    document.getElementById("nts-photo-file")?.click()
                  }
                  disabled={photoCompressing}
                >
                  📷 {photoCompressing ? "Processing..." : "Select Photo"}
                </button>
                {selectedPhotoName && (
                  <span className="nts-file-name">{selectedPhotoName}</span>
                )}
                {formData.Photo && (
                  <div className="nts-file-preview-group">
                    <button
                      type="button"
                      className="nts-preview-btn"
                      onClick={() =>
                        openPhotoInNewTab(
                          formData.Photo,
                          `${formData.FirstName || "Staff"} Photo`,
                        )
                      }
                    >
                      👁️ Preview
                    </button>
                    <button
                      type="button"
                      className="nts-remove-file-btn"
                      onClick={handleRemovePhoto}
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* PDF Upload Field */}
            <div className="nts-form-group">
              <label>Education / Qualification Document (PDF)</label>
              <div className="nts-file-upload-box">
                <input
                  type="file"
                  id="nts-pdf-file"
                  accept="application/pdf"
                  onChange={handlePdfFileChange}
                  style={{ display: "none" }}
                />
                <button
                  type="button"
                  className="nts-file-btn"
                  onClick={() =>
                    document.getElementById("nts-pdf-file")?.click()
                  }
                  disabled={pdfProcessing}
                >
                  📄 {pdfProcessing ? "Processing..." : "Select PDF Document"}
                </button>
                {selectedPdfName && (
                  <span className="nts-file-name">{selectedPdfName}</span>
                )}
                {formData.EducationPdf && (
                  <div className="nts-file-preview-group">
                    <button
                      type="button"
                      className="nts-preview-btn"
                      onClick={() =>
                        openPdfInNewTab(
                          formData.EducationPdf,
                          `${formData.FirstName || "Staff"} Document`,
                        )
                      }
                    >
                      👁️ View PDF
                    </button>
                    <button
                      type="button"
                      className="nts-remove-file-btn"
                      onClick={handleRemovePdf}
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="nts-form-group nts-full-width">
              <label>Address</label>
              <textarea
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                rows="3"
                required
              />
            </div>
          </div>

          <div className="nts-form-actions">
            <button type="submit" disabled={loading || loadingUsers}>
              {loading ? "Creating..." : "Create Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateNonTeachingStaff;
