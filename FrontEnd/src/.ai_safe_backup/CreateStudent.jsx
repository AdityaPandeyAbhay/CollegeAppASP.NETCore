// =====================================================
// CREATE STUDENT
// =====================================================

import { useEffect, useState, useMemo } from "react";

import {
  createStudent,
  getAllStudents,
  getStudentDepartmentDropdown,
  getStudentClassDropdown,
  getStudentSectionDropdown,
  openPhotoInNewTab,
  compressImageFile,
  parseStudentErrorMessage,
  saveStudentAcademicYear,
  saveStudentRollNumber,
} from "../../Services/studentService";

import {
  getAllUsers,
  getUserTypeDropdown,
  getUserDropdownByUserType,
} from "../../Services/userService";

import {
  getAllTeachers,
  getStoredTeacherExtraMap,
} from "../../Services/teacherService";

import {
  getAllNonTeachingStaff,
  getStoredStaffExtraMap,
} from "../../Services/nonTeachingStaffService";

import { getAllAcademicYear } from "../../Services/academicYearService";
import QuickRegisterUserCard from "../../Components/Common/QuickRegisterUserCard";
import "./CreateStudent.css";

const CreateStudent = () => {
  // =====================================================
  // INITIAL FORM DATA
  // =====================================================

  const initialFormData = {
    UserId: "",
    AcademicYearId: "",
    DepartmentId: "",
    SchoolClassId: "",
    SectionId: "",

    AdmissionNumber: "",
    RollNumber: "",
    AdmissionDate: "",

    FirstName: "",
    MiddleName: "",
    LastName: "",
    FatherName: "",
    MotherName: "",

    DOB: "",
    Gender: "",

    BloodGroup: "",
    Photo: "",

    AadhaarNumber: "",
    Religion: "",
    Category: "",
    Nationality: "",

    Email: "",
    PhoneNumber: "",
    AlternatePhoneNumber: "",

    Address: "",
  };

  // =====================================================
  // FORM DATA
  // =====================================================

  const [formData, setFormData] = useState(initialFormData);
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [photoCompressing, setPhotoCompressing] = useState(false);

  const [studentUsers, setStudentUsers] = useState([]);
  const [existingStudents, setExistingStudents] = useState([]);
  const [existingTeachers, setExistingTeachers] = useState([]);
  const [existingStaff, setExistingStaff] = useState([]);

  const [academicYears, setAcademicYears] = useState([]);
  const [defaultAcademicYearId, setDefaultAcademicYearId] = useState("");

  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  // =====================================================
  // LOADING STATES
  // =====================================================

  const [loadingStudentUsers, setLoadingStudentUsers] = useState(false);

  const [loadingAcademicYears, setLoadingAcademicYears] = useState(true);

  const [loadingDepartments, setLoadingDepartments] = useState(true);

  const [loadingClasses, setLoadingClasses] = useState(false);

  const [loadingSections, setLoadingSections] = useState(false);

  // =====================================================
  // UI STATES
  // =====================================================

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  // =====================================================
  // GET VALUE FROM USER OBJECT
  // =====================================================

  const getStudentUserId = (user) => {
    if (!user) {
      return "";
    }

    const id =
      user.id ??
      user.Id ??
      user.code ??
      user.Code ??
      user.userId ??
      user.UserId ??
      user.value ??
      user.Value ??
      user.userID ??
      user.UserID ??
      "";

    return id !== null && id !== undefined ? String(id).trim() : "";
  };

  // =====================================================
  // GET USER NAME FROM USER OBJECT
  // =====================================================

  const getStudentUserName = (user) => {
    if (!user) {
      return "";
    }

    const name =
      user.username ??
      user.Username ??
      user.userName ??
      user.UserName ??
      user.text ??
      user.Text ??
      user.name ??
      user.Name ??
      user.displayName ??
      user.DisplayName ??
      user.label ??
      user.Label ??
      user.fullName ??
      user.FullName ??
      "";

    return name !== null && name !== undefined ? String(name).trim() : "";
  };

  const getStudentUserEmail = (user) => {
    if (!user) return "";
    const email =
      user.email ?? user.Email ?? user.userEmail ?? user.UserEmail ?? "";
    return email ? String(email).trim().toLowerCase() : "";
  };

  // =====================================================
  // EXTRACT ARRAY FROM API RESPONSE
  // =====================================================

  const extractArray = (response) => {
    if (Array.isArray(response)) {
      return response;
    }

    if (!response || typeof response !== "object") {
      return [];
    }

    // -------------------------------------------------
    // Direct common properties
    // -------------------------------------------------

    const directProperties = [
      "data",
      "Data",
      "result",
      "Result",
      "items",
      "Items",
      "records",
      "Records",
      "users",
      "Users",
    ];

    for (const property of directProperties) {
      if (Array.isArray(response[property])) {
        return response[property];
      }
    }

    // -------------------------------------------------
    // Check nested objects
    // -------------------------------------------------

    for (const property of directProperties) {
      const nested = response[property];

      if (nested && typeof nested === "object" && !Array.isArray(nested)) {
        const nestedArray = extractArray(nested);

        if (Array.isArray(nestedArray) && nestedArray.length > 0) {
          return nestedArray;
        }
      }
    }

    return [];
  };

  // =====================================================
  // LOAD STUDENT USERS (USER TYPE ID = 5 / STUDENT)
  // =====================================================

  useEffect(() => {
    loadStudentUsers();
  }, []);

  const loadStudentUsers = async () => {
    try {
      setLoadingStudentUsers(true);
      let studentList = [];

      // 1. Try to fetch all users and filter by userType (5 or "student")
      try {
        const allUsersResponse = await getAllUsers();
        const allUsers = Array.isArray(allUsersResponse)
          ? allUsersResponse
          : allUsersResponse?.data || allUsersResponse?.Data || [];

        if (Array.isArray(allUsers) && allUsers.length > 0) {
          studentList = allUsers.filter((user) => {
            const uTypeId =
              user.userTypeId ?? user.UserTypeId ?? user.typeId ?? user.TypeId;
            if (String(uTypeId) === "5") return true;

            const typeName = String(
              user.userTypeName ??
                user.UserTypeName ??
                user.userType ??
                user.UserType ??
                user.role ??
                user.Role ??
                "",
            )
              .trim()
              .toLowerCase();
            return typeName.includes("student");
          });
        }
      } catch (err) {
        console.warn(
          "Could not load users from getAllUsers in CreateStudent:",
          err,
        );
      }

      // 2. Merge with getUserDropdownByUserType(5)
      try {
        const dropdownRes = await getUserDropdownByUserType(5);
        const dropdownUsers = Array.isArray(dropdownRes)
          ? dropdownRes
          : dropdownRes?.data || dropdownRes?.Data || [];

        if (Array.isArray(dropdownUsers) && dropdownUsers.length > 0) {
          const existingIds = new Set(
            studentList.map((u) => getStudentUserId(u)).filter(Boolean),
          );
          for (const user of dropdownUsers) {
            const uId = getStudentUserId(user);
            if (uId && !existingIds.has(uId)) {
              studentList.push(user);
              existingIds.add(uId);
            }
          }
        }
      } catch (err) {
        console.warn(
          "getUserDropdownByUserType fallback in CreateStudent:",
          err,
        );
      }

      const validUsers = studentList.filter((u) =>
        Boolean(getStudentUserId(u)),
      );
      setStudentUsers(validUsers);
    } catch (err) {
      console.warn("Error loading student users:", err);
    } finally {
      setLoadingStudentUsers(false);
    }
  };

  // =====================================================
  // LOAD EXISTING PROFILES (STUDENTS, TEACHERS, STAFF)
  // =====================================================

  useEffect(() => {
    loadExistingProfiles();
  }, []);

  const loadExistingProfiles = async () => {
    try {
      const [studentRes, teacherRes, staffRes] = await Promise.allSettled([
        getAllStudents(),
        getAllTeachers(),
        getAllNonTeachingStaff(),
      ]);

      if (studentRes.status === "fulfilled") {
        const list = Array.isArray(studentRes.value)
          ? studentRes.value
          : studentRes.value?.data || studentRes.value?.Data || [];
        setExistingStudents(list);
      }

      if (teacherRes.status === "fulfilled") {
        const list = Array.isArray(teacherRes.value)
          ? teacherRes.value
          : teacherRes.value?.data || teacherRes.value?.Data || [];
        setExistingTeachers(list);
      }

      if (staffRes.status === "fulfilled") {
        const list = Array.isArray(staffRes.value)
          ? staffRes.value
          : staffRes.value?.data || staffRes.value?.Data || [];
        setExistingStaff(list);
      }
    } catch (err) {
      console.warn(
        "Could not load existing profiles for duplicate check:",
        err,
      );
    }
  };

  // =====================================================
  // UNASSIGNED / AVAILABLE STUDENT USERS FILTER
  // Excludes users whose profile has already been created / assigned
  // =====================================================

  const assignedIdentifiers = useMemo(() => {
    const ids = new Set();
    const usernames = new Set();
    const emails = new Set();

    const addId = (id) => {
      if (id !== null && id !== undefined) {
        const str = String(id).trim().toLowerCase();
        if (str && str !== "0") ids.add(str);
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

    // 1. Existing Students
    if (Array.isArray(existingStudents)) {
      existingStudents.forEach((st) => {
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
          st.AdmissionNumber ??
            st.admissionNumber ??
            st.RollNumber ??
            st.rollNumber ??
            st.user?.username ??
            st.User?.userName,
        );
        addEmail(st.Email ?? st.email);
      });
    }

    // 2. Existing Teachers
    if (Array.isArray(existingTeachers)) {
      existingTeachers.forEach((t) => {
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
          t.TeacherCode ??
            t.teacherCode ??
            t.user?.username ??
            t.User?.userName,
        );
        addEmail(t.Email ?? t.email);
      });
    }

    // 3. Existing Staff
    if (Array.isArray(existingStaff)) {
      existingStaff.forEach((s) => {
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
          s.StaffCode ?? s.staffCode ?? s.user?.username ?? s.User?.userName,
        );
        addEmail(s.Email ?? s.email);
      });
    }

    // 4. LocalStorage extra maps
    try {
      const tMap = getStoredTeacherExtraMap() || {};
      Object.values(tMap).forEach((item) => {
        addId(item.userId ?? item.UserId);
        addEmail(item.email ?? item.Email);
      });
    } catch (_) {}

    try {
      const sMap = getStoredStaffExtraMap() || {};
      Object.values(sMap).forEach((item) => {
        addId(item.userId ?? item.UserId);
        addEmail(item.email ?? item.Email);
      });
    } catch (_) {}

    return { ids, usernames, emails };
  }, [existingStudents, existingTeachers, existingStaff]);

  const availableStudentUsers = useMemo(() => {
    if (!Array.isArray(studentUsers)) return [];
    return studentUsers.filter((u) => {
      const uId = getStudentUserId(u);
      if (!uId) return false;

      // If currently selected in the form, always keep visible
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
      const uName = getStudentUserName(u).toLowerCase();
      const uEmail = getStudentUserEmail(u);

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
  }, [studentUsers, assignedIdentifiers, formData.UserId]);

  // =====================================================
  // LOAD ACADEMIC YEARS
  // Auto-select latest/last created academic year by default
  // =====================================================

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const loadAcademicYears = async () => {
    try {
      setLoadingAcademicYears(true);
      setError("");

      const data = await getAllAcademicYear();
      const yearList = Array.isArray(data) ? data : [];
      setAcademicYears(yearList);

      let latestYearId = "";
      if (yearList.length > 0) {
        const sorted = [...yearList].sort((a, b) => {
          const idA = Number(a.Id ?? a.id ?? 0);
          const idB = Number(b.Id ?? b.id ?? 0);
          return idB - idA;
        });
        latestYearId = String(sorted[0].Id ?? sorted[0].id ?? "");
      }

      setDefaultAcademicYearId(latestYearId);
      setFormData((prev) => ({
        ...prev,
        AcademicYearId: prev.AcademicYearId || "",
      }));
    } catch (err) {
      console.error("Load Academic Years Error:", err);
      setAcademicYears([]);
      setError(err?.message || "Failed to load academic years.");
    } finally {
      setLoadingAcademicYears(false);
    }
  };

  // =====================================================
  // LOAD DEPARTMENTS
  // =====================================================

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      setError("");

      const data = await getStudentDepartmentDropdown();

      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load Departments Error:", err);

      setDepartments([]);

      setError(err?.message || "Failed to load departments.");
    } finally {
      setLoadingDepartments(false);
    }
  };

  // =====================================================
  // HANDLE NORMAL INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "AadhaarNumber") {
      const cleanDigits = value.replace(/\D/g, "").slice(0, 12);
      setFormData((prev) => ({
        ...prev,
        [name]: cleanDigits,
      }));
      setError("");
      setSuccess("");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  // =====================================================
  // DEPARTMENT CHANGE
  // =====================================================

  const handleDepartmentChange = async (e) => {
    const departmentId = e.target.value;

    setFormData((prev) => ({
      ...prev,

      DepartmentId: departmentId,

      SchoolClassId: "",

      SectionId: "",
    }));

    setClasses([]);

    setSections([]);

    setError("");

    setSuccess("");

    if (!departmentId) {
      return;
    }

    try {
      setLoadingClasses(true);

      const data = await getStudentClassDropdown(departmentId);

      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load Classes Error:", err);

      setClasses([]);

      setError(err?.message || "Failed to load classes.");
    } finally {
      setLoadingClasses(false);
    }
  };

  // =====================================================
  // CLASS CHANGE
  // =====================================================

  const handleClassChange = async (e) => {
    const classId = e.target.value;

    setFormData((prev) => ({
      ...prev,

      SchoolClassId: classId,

      SectionId: "",
    }));

    setSections([]);

    setError("");

    setSuccess("");

    if (!classId) {
      return;
    }

    try {
      setLoadingSections(true);

      const data = await getStudentSectionDropdown(classId);

      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load Sections Error:", err);

      setSections([]);

      setError(err?.message || "Failed to load sections.");
    } finally {
      setLoadingSections(false);
    }
  };

  // =====================================================
  // PHOTO FILE CHANGE
  // =====================================================

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
      const compressedDataUrl = await compressImageFile(file);
      setFormData((prev) => ({
        ...prev,
        Photo: compressedDataUrl,
      }));
      setSelectedPhotoName(file.name);
    } catch (err) {
      console.error("Photo processing error:", err);
      setError("Failed to process selected image.");
    } finally {
      setPhotoCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({
      ...prev,
      Photo: "",
    }));
    setSelectedPhotoName("");
    const fileInput = document.getElementById("student-photo-file");
    if (fileInput) fileInput.value = "";
  };

  // =====================================================
  // VALIDATION
  // =====================================================

  const validateForm = () => {
    if (!String(formData.UserId).trim()) {
      return "Student User is required.";
    }

    // Check if selected UserId is already assigned to an existing profile
    if (formData.UserId) {
      const cleanUser = String(formData.UserId).trim().toLowerCase();
      if (assignedIdentifiers.ids.has(cleanUser)) {
        return "The selected student user account is already assigned to an existing profile. Please choose an unassigned student user.";
      }
    }

    if (!formData.AcademicYearId) {
      return "Academic Year is required.";
    }

    if (!formData.DepartmentId) {
      return "Department is required.";
    }

    if (!formData.SchoolClassId) {
      return "Class is required.";
    }

    if (!formData.SectionId) {
      return "Section is required.";
    }

    if (!String(formData.AdmissionNumber).trim()) {
      return "Admission Number is required.";
    }

    // Check if AdmissionNumber is already in use
    if (formData.AdmissionNumber && Array.isArray(existingStudents)) {
      const cleanAdm = String(formData.AdmissionNumber).trim().toLowerCase();
      const duplicateAdm = existingStudents.find(
        (s) =>
          s.AdmissionNumber &&
          String(s.AdmissionNumber).trim().toLowerCase() === cleanAdm,
      );
      if (duplicateAdm) {
        const studentName = [duplicateAdm.FirstName, duplicateAdm.LastName]
          .filter(Boolean)
          .join(" ");
        return `A student with Admission Number '${formData.AdmissionNumber.trim()}' already exists${studentName ? ` (${studentName})` : ""}. Please enter a unique admission number.`;
      }
    }

    if (!formData.AdmissionDate) {
      return "Admission Date is required.";
    }

    if (!String(formData.FirstName).trim()) {
      return "First Name is required.";
    }

    if (!String(formData.LastName).trim()) {
      return "Last Name is required.";
    }

    if (!formData.DOB) {
      return "Date of Birth is required.";
    }

    if (!formData.Gender) {
      return "Gender is required.";
    }

    // Aadhaar number validation: must be 12 numeric digits and unique if provided
    if (formData.AadhaarNumber && String(formData.AadhaarNumber).trim()) {
      const cleanAadhaar = String(formData.AadhaarNumber).trim();
      if (cleanAadhaar.length !== 12 || !/^\d{12}$/.test(cleanAadhaar)) {
        return "Aadhaar Number must be a valid 12-digit numeric number (e.g. 123456789012).";
      }

      if (Array.isArray(existingStudents)) {
        const duplicateAadhaar = existingStudents.find(
          (s) =>
            s.AadhaarNumber && String(s.AadhaarNumber).trim() === cleanAadhaar,
        );
        if (duplicateAadhaar) {
          const studentName = [
            duplicateAadhaar.FirstName,
            duplicateAadhaar.LastName,
          ]
            .filter(Boolean)
            .join(" ");
          return `A student with Aadhaar Number '${cleanAadhaar}' already exists${studentName ? ` (${studentName})` : ""}. Please check and enter a unique Aadhaar number.`;
        }
      }
    }

    if (!String(formData.Email).trim()) {
      return "Email is required.";
    }

    // Check if Email is already in use
    if (formData.Email && Array.isArray(existingStudents)) {
      const cleanEmail = String(formData.Email).trim().toLowerCase();
      const duplicateEmail = existingStudents.find(
        (s) => s.Email && String(s.Email).trim().toLowerCase() === cleanEmail,
      );
      if (duplicateEmail) {
        const studentName = [duplicateEmail.FirstName, duplicateEmail.LastName]
          .filter(Boolean)
          .join(" ");
        return `A student with Email '${formData.Email.trim()}' already exists${studentName ? ` (${studentName})` : ""}. Please enter a unique email address.`;
      }
    }

    if (!String(formData.PhoneNumber).trim()) {
      return "Phone Number is required.";
    }

    if (!String(formData.Address).trim()) {
      return "Address is required.";
    }

    return "";
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // -------------------------------------------------
    // VALIDATION
    // -------------------------------------------------

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSubmitting(true);

      // -------------------------------------------------
      // IMPORTANT
      //
      // Dropdown displays:
      //
      // USR001 - Rahul Sharma
      //
      // And:
      //
      // USR001
      //
      // is sent as UserId.
      // -------------------------------------------------

      const studentPayload = {
        ...formData,
        AcademicYearId: formData.AcademicYearId
          ? Number(formData.AcademicYearId)
          : null,
        academicYearId: formData.AcademicYearId
          ? Number(formData.AcademicYearId)
          : null,
        UserId: String(formData.UserId).trim(),
        AadhaarNumber: formData.AadhaarNumber
          ? String(formData.AadhaarNumber).trim()
          : null,
        Photo: formData.Photo ? String(formData.Photo).trim() : null,
      };

      console.log("Student Payload:", studentPayload);

      const result = await createStudent(studentPayload);

      console.log("Student Created:", result);

      // Persist chosen academic year mapping
      if (formData.AcademicYearId) {
        const createdId = result?.Id ?? result?.id;
        if (createdId) {
          saveStudentAcademicYear(createdId, formData.AcademicYearId);
        }
        if (formData.AdmissionNumber) {
          saveStudentAcademicYear(
            formData.AdmissionNumber,
            formData.AcademicYearId,
          );
        }
        if (formData.UserId) {
          saveStudentAcademicYear(formData.UserId, formData.AcademicYearId);
        }
      }

      if (formData.RollNumber) {
        const createdId = result?.Id ?? result?.id;
        if (createdId) {
          saveStudentRollNumber(createdId, formData.RollNumber);
        }
        if (formData.AdmissionNumber) {
          saveStudentRollNumber(formData.AdmissionNumber, formData.RollNumber);
        }
        if (formData.UserId) {
          saveStudentRollNumber(formData.UserId, formData.RollNumber);
        }
      }

      setSuccess("Student created successfully.");

      // Refresh all existing profiles & users list
      loadExistingProfiles();
      loadStudentUsers();

      // -------------------------------------------------
      // RESET FORM
      // -------------------------------------------------

      setFormData({
        ...initialFormData,
        AcademicYearId: "",
      });

      setSelectedPhotoName("");
      const fileInput = document.getElementById("student-photo-file");
      if (fileInput) fileInput.value = "";

      setClasses([]);
      setSections([]);
    } catch (err) {
      console.error("Create Student Error:", err);
      setError(parseStudentErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setFormData({
      ...initialFormData,
      AcademicYearId: "",
    });

    setSelectedPhotoName("");
    const fileInput = document.getElementById("student-photo-file");
    if (fileInput) fileInput.value = "";

    setClasses([]);

    setSections([]);

    setError("");

    setSuccess("");

    const photoInput = document.getElementById("student-photo");

    if (photoInput) {
      photoInput.value = "";
    }
  };

  // =====================================================
  // HANDLE USER CREATED
  // =====================================================

  const handleUserCreated = (newUser) => {
    if (!newUser) return;
    const newId = String(
      newUser.id ??
        newUser.Id ??
        newUser.userId ??
        newUser.UserId ??
        newUser.code ??
        newUser.Code ??
        "",
    );

    setStudentUsers((prev) => {
      const exists = prev.some((u) => getStudentUserId(u) === newId);
      if (exists) return prev;
      return [newUser, ...prev];
    });

    // Pre-select the user in the student form & autofill email if applicable
    setFormData((prev) => ({
      ...prev,
      UserId: newId,
      Email:
        !prev.Email &&
        (newUser.username?.includes("@") || newUser.Username?.includes("@"))
          ? newUser.username || newUser.Username
          : prev.Email,
    }));
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="student-page">
      <div className="student-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="student-header">
          <h1>Create Student</h1>

          <p>Add a new student to the school system.</p>
        </div>

        {/* =================================================
            STEP 1: USER ACCOUNT REGISTRATION
        ================================================= */}
        <QuickRegisterUserCard
          userType="Student"
          defaultUserType="Student"
          onUserCreated={handleUserCreated}
          onUserRegistered={handleUserCreated}
          targetScrollId="student-profile-form-section"
        />

        {/* =================================================
            ERROR
        ================================================= */}

        {error && <div className="student-alert student-error">{error}</div>}

        {/* =================================================
            SUCCESS
        ================================================= */}

        {success && (
          <div className="student-alert student-success">{success}</div>
        )}

        {/* =================================================
            STEP 2: FORM
        ================================================= */}

        <form
          id="student-profile-form-section"
          className="student-form"
          onSubmit={handleSubmit}
        >
          {/* =================================================
              USER INFORMATION & STEP 2 HEADER
          ================================================= */}

          <div className="student-section">
            <div className="step-2-section-header">
              <span className="step-badge step-2-badge">STEP 2</span>
              <div>
                <h2>Student Profile & Academic Enrollment</h2>
                <p className="step-2-desc">
                  Select the registered student user account (or pick an
                  existing user) and fill out the student details.
                </p>
              </div>
            </div>

            <div className="student-grid" style={{ marginTop: "16px" }}>
              {/* =================================================
                  STUDENT USER
              ================================================= */}

              <div className="student-field">
                <label>
                  Student User Account <span>*</span>
                </label>

                <select
                  name="UserId"
                  value={formData.UserId}
                  onChange={handleChange}
                  disabled={loadingStudentUsers}
                >
                  {/* -------------------------------------------------
                      DEFAULT OPTION
                  ------------------------------------------------- */}

                  <option value="">
                    {availableStudentUsers.length === 0
                      ? "-- Register User in Step 1 Above (No Unassigned Users) --"
                      : "-- Select Student User Account --"}
                  </option>

                  {/* -------------------------------------------------
                      STUDENT USERS (UNASSIGNED ONLY)
                  ------------------------------------------------- */}

                  {availableStudentUsers.map((user, index) => {
                    const userId = getStudentUserId(user);
                    const userName = getStudentUserName(user);

                    if (!userId) {
                      return null;
                    }

                    const displayText = userName
                      ? `${userId} - ${userName}`
                      : `${userId}`;

                    return (
                      <option key={`${userId}-${index}`} value={userId}>
                        {displayText}
                      </option>
                    );
                  })}
                </select>

                <small className="student-help">
                  Select an existing student user or register a new one in Step
                  1 above.
                </small>
              </div>
            </div>
          </div>

          {/* =================================================
              ACADEMIC INFORMATION
          ================================================= */}

          <div className="student-section">
            <h2>Academic Information</h2>

            <div className="student-grid">
              {/* ACADEMIC YEAR */}
              <div className="student-field">
                <label>
                  Academic Year <span>*</span>
                </label>

                <select
                  name="AcademicYearId"
                  value={formData.AcademicYearId}
                  onChange={handleChange}
                  disabled={loadingAcademicYears}
                >
                  <option value="">
                    {loadingAcademicYears
                      ? "Loading academic years..."
                      : "Select Academic Year"}
                  </option>

                  {academicYears.map((year) => {
                    const id = String(
                      year.Id ?? year.id ?? year.code ?? year.Code ?? "",
                    );
                    const name =
                      year.YearName ??
                      year.yearName ??
                      year.Name ??
                      year.name ??
                      year.text ??
                      year.Text ??
                      id;

                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* DEPARTMENT */}

              <div className="student-field">
                <label>
                  Department <span>*</span>
                </label>

                <select
                  name="DepartmentId"
                  value={formData.DepartmentId}
                  onChange={handleDepartmentChange}
                  disabled={loadingDepartments}
                >
                  <option value="">
                    {loadingDepartments
                      ? "Loading departments..."
                      : "Select Department"}
                  </option>

                  {departments.map((department) => {
                    const id = department.id ?? department.Id;

                    const name =
                      department.name ??
                      department.Name ??
                      department.text ??
                      department.Text;

                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* CLASS */}

              <div className="student-field">
                <label>
                  Class <span>*</span>
                </label>

                <select
                  name="SchoolClassId"
                  value={formData.SchoolClassId}
                  onChange={handleClassChange}
                  disabled={!formData.DepartmentId || loadingClasses}
                >
                  <option value="">
                    {loadingClasses ? "Loading classes..." : "Select Class"}
                  </option>

                  {classes.map((schoolClass) => {
                    const id = schoolClass.id ?? schoolClass.Id;

                    const name =
                      schoolClass.name ??
                      schoolClass.Name ??
                      schoolClass.text ??
                      schoolClass.Text;

                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* SECTION */}

              <div className="student-field">
                <label>
                  Section <span>*</span>
                </label>

                <select
                  name="SectionId"
                  value={formData.SectionId}
                  onChange={handleChange}
                  disabled={!formData.SchoolClassId || loadingSections}
                >
                  <option value="">
                    {loadingSections ? "Loading sections..." : "Select Section"}
                  </option>

                  {sections.map((section) => {
                    const id = section.id ?? section.Id;

                    const name =
                      section.name ??
                      section.Name ??
                      section.text ??
                      section.Text;

                    return (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* ADMISSION NUMBER */}

              <div className="student-field">
                <label>
                  Admission Number <span>*</span>
                </label>

                <input
                  type="text"
                  name="AdmissionNumber"
                  value={formData.AdmissionNumber}
                  onChange={handleChange}
                  placeholder="Enter admission number"
                />
              </div>

              {/* ROLL NUMBER */}

              <div className="student-field">
                <label>Roll Number</label>

                <input
                  type="text"
                  name="RollNumber"
                  value={formData.RollNumber}
                  onChange={handleChange}
                  placeholder="Enter roll number"
                />
              </div>

              {/* ADMISSION DATE */}

              <div className="student-field">
                <label>
                  Admission Date <span>*</span>
                </label>

                <input
                  type="date"
                  name="AdmissionDate"
                  value={formData.AdmissionDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* =================================================
              PERSONAL INFORMATION
          ================================================= */}

          <div className="student-section">
            <h2>Personal Information</h2>

            <div className="student-grid">
              {/* FIRST NAME */}

              <div className="student-field">
                <label>
                  First Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  placeholder="Enter first name"
                />
              </div>

              {/* MIDDLE NAME */}

              <div className="student-field">
                <label>Middle Name</label>

                <input
                  type="text"
                  name="MiddleName"
                  value={formData.MiddleName}
                  onChange={handleChange}
                  placeholder="Enter middle name"
                />
              </div>

              {/* LAST NAME */}

              <div className="student-field">
                <label>
                  Last Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                  placeholder="Enter last name"
                />
              </div>

              {/* FATHER'S NAME */}

              <div className="student-field">
                <label>Father's Name</label>

                <input
                  type="text"
                  name="FatherName"
                  value={formData.FatherName}
                  onChange={handleChange}
                  placeholder="Enter father's name"
                />
              </div>

              {/* MOTHER'S NAME */}

              <div className="student-field">
                <label>Mother's Name</label>

                <input
                  type="text"
                  name="MotherName"
                  value={formData.MotherName}
                  onChange={handleChange}
                  placeholder="Enter mother's name"
                />
              </div>

              {/* DOB */}

              <div className="student-field">
                <label>
                  Date of Birth <span>*</span>
                </label>

                <input
                  type="date"
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleChange}
                />
              </div>

              {/* GENDER */}

              <div className="student-field">
                <label>
                  Gender <span>*</span>
                </label>

                <select
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>

                  <option value="Male">Male</option>

                  <option value="Female">Female</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              {/* BLOOD GROUP */}

              <div className="student-field">
                <label>Blood Group</label>

                <select
                  name="BloodGroup"
                  value={formData.BloodGroup}
                  onChange={handleChange}
                >
                  <option value="">Select Blood Group</option>

                  <option value="A+">A+</option>

                  <option value="A-">A-</option>

                  <option value="B+">B+</option>

                  <option value="B-">B-</option>

                  <option value="AB+">AB+</option>

                  <option value="AB-">AB-</option>

                  <option value="O+">O+</option>

                  <option value="O-">O-</option>
                </select>
              </div>

              {/* CATEGORY */}

              <div className="student-field">
                <label>Category</label>

                <select
                  name="Category"
                  value={formData.Category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>

                  <option value="General">General</option>

                  <option value="OBC">OBC</option>

                  <option value="SC">SC</option>

                  <option value="ST">ST</option>

                  <option value="EWS">EWS</option>
                </select>
              </div>

              {/* RELIGION */}

              <div className="student-field">
                <label>Religion</label>

                <select
                  name="Religion"
                  value={formData.Religion}
                  onChange={handleChange}
                >
                  <option value="">Select Religion</option>

                  <option value="Hindu">Hindu</option>

                  <option value="Muslim">Muslim</option>

                  <option value="Sikh">Sikh</option>

                  <option value="Christian">Christian</option>

                  <option value="Buddhist">Buddhist</option>

                  <option value="Jain">Jain</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              {/* NATIONALITY */}

              <div className="student-field">
                <label>Nationality</label>

                <select
                  name="Nationality"
                  value={formData.Nationality}
                  onChange={handleChange}
                >
                  <option value="">Select Nationality</option>

                  <option value="Indian">Indian</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              {/* AADHAAR */}

              <div className="student-field">
                <label>Aadhaar Number (12 Digits)</label>

                <input
                  type="text"
                  name="AadhaarNumber"
                  value={formData.AadhaarNumber}
                  onChange={handleChange}
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength={12}
                  inputMode="numeric"
                />

                <small className="student-help">
                  Must be 12 numeric digits and unique.
                </small>
              </div>

              {/* PHOTO */}

              <div className="student-field student-full-width">
                <label>Student Photo (Select from PC)</label>

                <div className="student-photo-selector-box">
                  <input
                    id="student-photo-file"
                    type="file"
                    name="PhotoFile"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="student-file-input"
                  />

                  {photoCompressing && (
                    <span className="student-photo-loading">
                      ⏳ Processing selected photo...
                    </span>
                  )}

                  {formData.Photo && !photoCompressing && (
                    <div className="student-photo-preview-bar">
                      <span className="student-photo-name">
                        📷 Selected: {selectedPhotoName || "Photo Attached"}
                      </span>
                      <button
                        type="button"
                        onClick={() => openPhotoInNewTab(formData.Photo)}
                        className="student-photo-preview-btn"
                        title="Preview photo in new tab"
                      >
                        🔗 Preview Photo ↗
                      </button>
                      <button
                        type="button"
                        onClick={handleRemovePhoto}
                        className="student-photo-remove-btn"
                        title="Remove photo"
                      >
                        ✕ Remove
                      </button>
                    </div>
                  )}
                </div>

                <small className="student-help-text">
                  Select a photo file from your PC (JPG, PNG, WebP).
                </small>
              </div>
            </div>
          </div>

          {/* =================================================
              CONTACT INFORMATION
          ================================================= */}

          <div className="student-section">
            <h2>Contact Information</h2>

            <div className="student-grid">
              {/* EMAIL */}

              <div className="student-field">
                <label>
                  Email <span>*</span>
                </label>

                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </div>

              {/* PHONE */}

              <div className="student-field">
                <label>
                  Phone Number <span>*</span>
                </label>

                <input
                  type="tel"
                  name="PhoneNumber"
                  value={formData.PhoneNumber}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>

              {/* ALTERNATE PHONE */}

              <div className="student-field">
                <label>Alternate Phone Number</label>

                <input
                  type="tel"
                  name="AlternatePhoneNumber"
                  value={formData.AlternatePhoneNumber}
                  onChange={handleChange}
                  placeholder="Enter alternate phone number"
                />
              </div>

              {/* ADDRESS */}

              <div className="student-field student-full-width">
                <label>
                  Address <span>*</span>
                </label>

                <textarea
                  name="Address"
                  value={formData.Address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                />
              </div>
            </div>
          </div>

          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="student-actions">
            <button
              type="button"
              className="student-btn student-btn-secondary"
              onClick={handleReset}
              disabled={submitting}
            >
              Reset
            </button>

            <button
              type="submit"
              className="student-btn student-btn-primary"
              disabled={submitting}
            >
              {submitting ? "Creating..." : "Create Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudent;
