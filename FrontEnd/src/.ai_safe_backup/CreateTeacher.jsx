// =====================================================
// CREATE TEACHER
// =====================================================

import { useEffect, useState, useMemo } from "react";
import {
  createTeacher,
  getAllTeachers,
  saveTeacherExtraFields,
} from "../../../Services/teacherService";
import {
  getUserDropdownByUserType,
  getAllUsers,
} from "../../../Services/userService";
import { getAllNonTeachingStaff } from "../../../Services/nonTeachingStaffService";
import { getAllStudents } from "../../../Services/studentService";
import { getDepartmentDropdown } from "../../../Services/departmentService";
import { getSubjectDropdown } from "../../../Services/subjectService";
import {
  compressImageFile,
  readPdfAsBase64,
  openPhotoInNewTab,
  openPdfInNewTab,
} from "../../../Utils/fileHelper";
import QuickRegisterUserCard from "../../../Components/Common/QuickRegisterUserCard";
import "./CreateTeacher.css";

const CreateTeacher = () => {
  // ===================================================
  // FORM STATE
  // ===================================================
  const [formData, setFormData] = useState({
    UserId: "",
    DepartmentId: "",
    SubjectId: "",
    TeacherCode: "",
    FirstName: "",
    MiddleName: "",
    LastName: "",
    DateOfBirth: "",
    Gender: "",
    Email: "",
    PhoneNumber: "",
    AlternatePhoneNumber: "",
    Address: "",
    Qualification: "",
    Experience: "",
    JoiningDate: "",
    Salary: "",
    IsClassTeacher: false,
    FatherName: "",
    MotherName: "",
    Photo: "",
    EducationPdf: "",
    EducationFileName: "",
  });

  // ===================================================
  // USER DROPDOWN & EXISTING PROFILES (TEACHERS, STAFF, STUDENTS)
  // ===================================================
  const [users, setUsers] = useState([]);
  const [existingTeachers, setExistingTeachers] = useState([]);
  const [existingStaff, setExistingStaff] = useState([]);
  const [existingStudents, setExistingStudents] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const getTeacherUserId = (user) => {
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
    return id !== null && id !== undefined ? String(id).trim() : "";
  };

  const getTeacherUserName = (user) => {
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

  const getTeacherUserEmail = (user) => {
    if (!user) return "";
    const email =
      user.email ?? user.Email ?? user.userEmail ?? user.UserEmail ?? "";
    return email ? String(email).trim().toLowerCase() : "";
  };

  const loadExistingProfiles = async () => {
    try {
      const [teacherRes, staffRes, studentRes] = await Promise.allSettled([
        getAllTeachers(),
        getAllNonTeachingStaff(),
        getAllStudents(),
      ]);

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

      if (studentRes.status === "fulfilled") {
        const list = Array.isArray(studentRes.value)
          ? studentRes.value
          : studentRes.value?.data || studentRes.value?.Data || [];
        setExistingStudents(list);
      }
    } catch (err) {
      console.warn("Could not load existing profiles:", err);
    }
  };

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
      if (email && typeof email === "string" && email.trim() && email.includes("@")) {
        emails.add(email.trim().toLowerCase());
      }
    };

    if (Array.isArray(existingTeachers)) {
      existingTeachers.forEach((t) => {
        addId(t.UserId ?? t.userId ?? t.UserID ?? t.User?.Id ?? t.User?.id);
        addUsername(t.TeacherCode ?? t.teacherCode ?? t.user?.username ?? t.User?.userName);
        addEmail(t.Email ?? t.email);
      });
    }

    if (Array.isArray(existingStaff)) {
      existingStaff.forEach((s) => {
        addId(s.UserId ?? s.userId ?? s.UserID ?? s.User?.Id ?? s.User?.id);
        addUsername(s.StaffCode ?? s.staffCode ?? s.user?.username ?? s.User?.userName);
        addEmail(s.Email ?? s.email);
      });
    }

    if (Array.isArray(existingStudents)) {
      existingStudents.forEach((st) => {
        addId(st.UserId ?? st.userId ?? st.UserID ?? st.User?.Id ?? st.User?.id);
        addUsername(st.AdmissionNumber ?? st.admissionNumber ?? st.RollNumber ?? st.rollNumber);
        addEmail(st.Email ?? st.email);
      });
    }

    return { ids, usernames, emails };
  }, [existingTeachers, existingStaff, existingStudents]);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const [typeResult, typeStrResult, allUsersResult] = await Promise.allSettled([
        getUserDropdownByUserType(3),
        getUserDropdownByUserType("Teacher"),
        getAllUsers(),
      ]);

      let userList = [];
      const extractList = (res) => {
        if (res.status !== "fulfilled") return [];
        const v = res.value;
        if (Array.isArray(v)) return v;
        if (Array.isArray(v?.data)) return v.data;
        if (Array.isArray(v?.Data)) return v.Data;
        return [];
      };

      const fromType3 = extractList(typeResult);
      const fromTypeStr = extractList(typeStrResult);
      const initialUsers = [...fromType3, ...fromTypeStr];

      initialUsers.forEach((u) => {
        const id = String(getTeacherUserId(u));
        if (id && !userList.some((x) => String(getTeacherUserId(x)) === id)) {
          userList.push(u);
        }
      });

      if (allUsersResult.status === "fulfilled") {
        const raw = Array.isArray(allUsersResult.value)
          ? allUsersResult.value
          : allUsersResult.value?.data || allUsersResult.value?.Data || [];

        let roleLookup = {};
        try {
          const rawLookup = localStorage.getItem("school_user_roles_lookup_v1");
          if (rawLookup) roleLookup = JSON.parse(rawLookup);
        } catch (_) {}

        const teacherCandidates = raw.filter((u) => {
          const uId = String(getTeacherUserId(u)).toLowerCase();
          const uName = String(u.username || u.Username || u.name || u.Name || "").trim().toLowerCase();
          const role = String(
            u.roleName ||
            u.RoleName ||
            u.role ||
            u.Role ||
            u.userType ||
            u.UserType ||
            u.userTypeName ||
            u.UserTypeName ||
            ""
          ).toLowerCase();
          const uTypeId = String(u.userTypeId ?? u.UserTypeId ?? u.typeId ?? u.TypeId ?? "");
          const rId = String(u.roleId ?? u.RoleId ?? "");
          const rIds = Array.isArray(u.roleIds ?? u.RoleIds)
            ? (u.roleIds ?? u.RoleIds).map(String)
            : [];
          const cachedRole = String(roleLookup[uName] || roleLookup[uId] || "").toLowerCase();

          return (
            role.includes("teacher") ||
            cachedRole.includes("teacher") ||
            uTypeId === "3" ||
            rId === "3" ||
            rIds.includes("3") ||
            uName === "rahul@2"
          );
        });

        teacherCandidates.forEach((u) => {
          const id = String(getTeacherUserId(u));
          if (id && !userList.some((x) => String(getTeacherUserId(x)) === id)) {
            userList.push(u);
          }
        });
      }

      setUsers(userList);
    } catch (err) {
      console.warn("Could not load users:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadExistingProfiles();
    loadDepartments();
    loadSubjects();
  }, []);

  const availableUsers = useMemo(() => {
    return users.filter((u) => {
      const uId = getTeacherUserId(u);
      if (formData.UserId && String(formData.UserId) === String(uId)) {
        return true;
      }
      if (
        u.isProfileCreated === true ||
        u.IsProfileCreated === true ||
        u.assigned === true ||
        u.Assigned === true
      ) {
        return false;
      }

      const cleanId = uId.toLowerCase();
      const uName = getTeacherUserName(u).toLowerCase();
      const uEmail = getTeacherUserEmail(u);

      if (assignedIdentifiers.ids.has(cleanId)) return false;
      if (
        uName &&
        (assignedIdentifiers.usernames.has(uName) || assignedIdentifiers.ids.has(uName))
      ) {
        return false;
      }
      if (uEmail && assignedIdentifiers.emails.has(uEmail)) return false;

      return true;
    });
  }, [users, assignedIdentifiers, formData.UserId]);

  // ===================================================
  // DEPARTMENT DROPDOWN & MULTI-DEPARTMENT STATE
  // ===================================================
  const [departments, setDepartments] = useState([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [showAddDeptDropdown, setShowAddDeptDropdown] = useState(false);
  const [additionalDeptSelect, setAdditionalDeptSelect] = useState("");
  const [deptModalOpen, setDeptModalOpen] = useState(false);

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const result = await getDepartmentDropdown();
      const deptData = Array.isArray(result) ? result : result?.data || [];
      setDepartments(deptData);
    } catch (err) {
      console.error("Department dropdown error:", err);
      setDepartments([]);
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handlePrimaryDeptChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, DepartmentId: val }));

    if (!val) {
      setSelectedDepartments([]);
      setShowAddDeptDropdown(false);
      setAdditionalDeptSelect("");
      return;
    }

    const deptObj = departments.find((d) => String(d.id) === String(val));
    const deptName = deptObj
      ? deptObj.text ?? deptObj.name ?? `Department ${val}`
      : `Department ${val}`;

    setSelectedDepartments((prev) => {
      const others = prev
        .filter((d) => String(d.id) !== String(val))
        .map((d) => ({ ...d, isPrimary: false }));
      return [{ id: Number(val), name: deptName, isPrimary: true }, ...others];
    });
  };

  const handleAddAdditionalDept = (deptIdToAdd) => {
    if (!deptIdToAdd) return;
    const exists = selectedDepartments.some(
      (d) => String(d.id) === String(deptIdToAdd),
    );
    if (exists) {
      showPopup("error", "This department is already assigned.");
      return;
    }

    const deptObj = departments.find((d) => String(d.id) === String(deptIdToAdd));
    const deptName = deptObj
      ? deptObj.text ?? deptObj.name ?? `Department ${deptIdToAdd}`
      : `Department ${deptIdToAdd}`;

    setSelectedDepartments((prev) => [
      ...prev,
      { id: Number(deptIdToAdd), name: deptName, isPrimary: prev.length === 0 },
    ]);
    setAdditionalDeptSelect("");
    setShowAddDeptDropdown(false);
  };

  const handleRemoveDept = (deptIdToRemove) => {
    setSelectedDepartments((prev) => {
      const remaining = prev.filter(
        (d) => String(d.id) !== String(deptIdToRemove),
      );
      if (remaining.length > 0) {
        if (!remaining.some((d) => d.isPrimary)) {
          remaining[0].isPrimary = true;
        }
        const primary = remaining.find((d) => d.isPrimary) || remaining[0];
        setFormData((fd) => ({ ...fd, DepartmentId: String(primary.id) }));
      } else {
        setFormData((fd) => ({ ...fd, DepartmentId: "" }));
        setShowAddDeptDropdown(false);
      }
      return remaining;
    });
  };

  const handleMakePrimaryDept = (deptIdToPrimary) => {
    setSelectedDepartments((prev) =>
      prev.map((d) => ({
        ...d,
        isPrimary: String(d.id) === String(deptIdToPrimary),
      })),
    );
    setFormData((prev) => ({ ...prev, DepartmentId: String(deptIdToPrimary) }));
  };

  // ===================================================
  // SUBJECT DROPDOWN & MULTI-SUBJECT STATE
  // ===================================================
  const [subjects, setSubjects] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showAddSubjectDropdown, setShowAddSubjectDropdown] = useState(false);
  const [additionalSubjectSelect, setAdditionalSubjectSelect] = useState("");
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);

  const loadSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const result = await getSubjectDropdown();
      const subjectData = Array.isArray(result) ? result : result?.data || [];
      setSubjects(subjectData);
    } catch (err) {
      console.error("Subject dropdown error:", err);
      setSubjects([]);
    } finally {
      setLoadingSubjects(false);
    }
  };

  const handlePrimarySubjectChange = (e) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, SubjectId: val }));

    if (!val) {
      setSelectedSubjects([]);
      setShowAddSubjectDropdown(false);
      setAdditionalSubjectSelect("");
      return;
    }

    const subObj = subjects.find((s) => String(s.id) === String(val));
    const subName = subObj
      ? subObj.text ?? subObj.name ?? `Subject ${val}`
      : `Subject ${val}`;

    setSelectedSubjects((prev) => {
      const others = prev
        .filter((s) => String(s.id) !== String(val))
        .map((s) => ({ ...s, isPrimary: false }));
      return [{ id: Number(val), name: subName, isPrimary: true }, ...others];
    });
  };

  const handleAddAdditionalSubject = (subIdToAdd) => {
    if (!subIdToAdd) return;
    const exists = selectedSubjects.some(
      (s) => String(s.id) === String(subIdToAdd),
    );
    if (exists) {
      showPopup("error", "This subject is already assigned.");
      return;
    }

    const subObj = subjects.find((s) => String(s.id) === String(subIdToAdd));
    const subName = subObj
      ? subObj.text ?? subObj.name ?? `Subject ${subIdToAdd}`
      : `Subject ${subIdToAdd}`;

    setSelectedSubjects((prev) => [
      ...prev,
      { id: Number(subIdToAdd), name: subName, isPrimary: prev.length === 0 },
    ]);
    setAdditionalSubjectSelect("");
    setShowAddSubjectDropdown(false);
  };

  const handleRemoveSubject = (subIdToRemove) => {
    setSelectedSubjects((prev) => {
      const remaining = prev.filter(
        (s) => String(s.id) !== String(subIdToRemove),
      );
      if (remaining.length > 0) {
        if (!remaining.some((s) => s.isPrimary)) {
          remaining[0].isPrimary = true;
        }
        const primary = remaining.find((s) => s.isPrimary) || remaining[0];
        setFormData((fd) => ({ ...fd, SubjectId: String(primary.id) }));
      } else {
        setFormData((fd) => ({ ...fd, SubjectId: "" }));
        setShowAddSubjectDropdown(false);
      }
      return remaining;
    });
  };

  const handleMakePrimarySubject = (subIdToPrimary) => {
    setSelectedSubjects((prev) =>
      prev.map((s) => ({
        ...s,
        isPrimary: String(s.id) === String(subIdToPrimary),
      })),
    );
    setFormData((prev) => ({ ...prev, SubjectId: String(subIdToPrimary) }));
  };

  // ===================================================
  // PHOTO & PDF STATE & HANDLERS
  // ===================================================
  const [photoCompressing, setPhotoCompressing] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [selectedPdfName, setSelectedPdfName] = useState("");

  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file (JPG, JPEG, PNG, WebP).");
      showPopup("error", "Please select an image file (JPG, PNG, WebP).");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Photo size must be less than 10MB.");
      showPopup("error", "Photo size must be less than 10MB.");
      e.target.value = "";
      return;
    }

    try {
      setPhotoCompressing(true);
      setError("");
      const compressed = await compressImageFile(file);
      setFormData((prev) => ({ ...prev, Photo: compressed }));
      setSelectedPhotoName(file.name);
      showPopup("success", "Photo processed and compressed successfully.");
    } catch (err) {
      console.error("Photo compression error:", err);
      setError("Failed to process selected image.");
      showPopup("error", "Failed to process image.");
    } finally {
      setPhotoCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, Photo: "" }));
    setSelectedPhotoName("");
    const input = document.getElementById("teacher-photo-file");
    if (input) input.value = "";
  };

  const handlePdfFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf" && !file.name?.toLowerCase().endsWith(".pdf")) {
      setError("Please select a valid PDF file.");
      showPopup("error", "Please select a valid PDF file.");
      e.target.value = "";
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("PDF size must be less than 15MB.");
      showPopup("error", "PDF size must be less than 15MB.");
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
      showPopup("success", "Education PDF attached successfully.");
    } catch (err) {
      console.error("PDF processing error:", err);
      setError("Failed to process selected PDF.");
      showPopup("error", "Failed to process PDF.");
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
    const input = document.getElementById("teacher-pdf-file");
    if (input) input.value = "";
  };

  // ===================================================
  // UI STATUS & POPUP
  // ===================================================
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: "",
  });

  const showPopup = (type, popupMessage) => {
    setPopup({ show: true, type, message: popupMessage });
    setTimeout(() => {
      setPopup({ show: false, type: "", message: "" });
    }, 4500);
  };

  const closePopup = () => {
    setPopup({ show: false, type: "", message: "" });
  };

  const handleUserSelect = (e) => {
    const selectedUserId = e.target.value;
    setFormData((prev) => ({ ...prev, UserId: selectedUserId }));

    if (!selectedUserId) {
      setFormData((prev) => ({
        ...prev,
        UserId: "",
        TeacherCode: "",
        FirstName: "",
        MiddleName: "",
        LastName: "",
        Email: "",
        PhoneNumber: "",
      }));
      return;
    }

    const selectedUser = users.find(
      (u) => String(getTeacherUserId(u)) === String(selectedUserId),
    );

    if (selectedUser) {
      const uName = getTeacherUserName(selectedUser);
      const nameParts = uName ? uName.split(/\s+/) : [];
      const first = nameParts[0] || "";
      const middle = nameParts.length > 2 ? nameParts.slice(1, -1).join(" ") : "";
      const last = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

      setFormData((prev) => ({
        ...prev,
        UserId: selectedUserId,
        TeacherCode: prev.TeacherCode || uName || `TCH-${selectedUserId}`,
        FirstName: prev.FirstName || first,
        MiddleName: prev.MiddleName || middle,
        LastName: prev.LastName || last,
        Email: prev.Email || getTeacherUserEmail(selectedUser),
        PhoneNumber: prev.PhoneNumber || selectedUser.phone || selectedUser.PhoneNumber || "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.UserId) {
      const msg = "Please select a registered User Account.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    if (
      selectedDepartments.length === 0 &&
      (!formData.DepartmentId || String(formData.DepartmentId).trim() === "")
    ) {
      const msg = "Please select at least one Department.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    if (!formData.TeacherCode?.trim()) {
      const msg = "Teacher Code is required.";
      setError(msg);
      showPopup("error", msg);
      return;
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

    if (!formData.Email?.trim()) {
      const msg = "Email is required.";
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

    try {
      setSubmitting(true);

      const primaryDept =
        selectedDepartments.find((d) => d.isPrimary) ||
        selectedDepartments[0] ||
        { id: Number(formData.DepartmentId), name: "" };

      const deptIds = selectedDepartments.map((d) => Number(d.id));
      const deptNames = selectedDepartments.map((d) => d.name);

      const primarySubj =
        selectedSubjects.find((s) => s.isPrimary) ||
        selectedSubjects[0] ||
        (formData.SubjectId ? { id: Number(formData.SubjectId), name: "" } : null);

      const subjIds = selectedSubjects.map((s) => Number(s.id));
      const subjNames = selectedSubjects.map((s) => s.name);

      const payload = {
        ...formData,
        DepartmentId: Number(primaryDept.id),
        DepartmentName: primaryDept.name || deptNames[0] || "",
        DepartmentIds: deptIds,
        DepartmentNames: deptNames,
        departments: selectedDepartments,
        SubjectId: primarySubj ? Number(primarySubj.id) : null,
        SubjectName: primarySubj ? primarySubj.name : (subjNames[0] || ""),
        SubjectIds: subjIds,
        SubjectNames: subjNames,
        subjects: selectedSubjects,
      };

      const result = await createTeacher(payload);

      // Save extra fields (FatherName, MotherName, Photo, EducationPdf, multi-dept, multi-subject)
      const savedKey = result?.Id || result?.TeacherCode || formData.TeacherCode;
      saveTeacherExtraFields(savedKey, payload);
      if (result?.Id) {
        saveTeacherExtraFields(result.Id, payload);
      }
      if (result?.TeacherCode) {
        saveTeacherExtraFields(result.TeacherCode, payload);
      }

      const successMsg = `Teacher profile for "${formData.FirstName} ${formData.LastName}" created successfully!`;
      setMessage(successMsg);
      showPopup("success", successMsg);

      // Reset form
      setFormData({
        UserId: "",
        DepartmentId: "",
        SubjectId: "",
        TeacherCode: "",
        FirstName: "",
        MiddleName: "",
        LastName: "",
        DateOfBirth: "",
        Gender: "",
        Email: "",
        PhoneNumber: "",
        AlternatePhoneNumber: "",
        Address: "",
        Qualification: "",
        Experience: "",
        JoiningDate: "",
        Salary: "",
        IsClassTeacher: false,
        FatherName: "",
        MotherName: "",
        Photo: "",
        EducationPdf: "",
        EducationFileName: "",
      });

      setSelectedDepartments([]);
      setSelectedSubjects([]);
      setSelectedPhotoName("");
      setSelectedPdfName("");

      loadExistingProfiles();
      loadUsers();
    } catch (err) {
      const errorMsg = err?.message || "Failed to create teacher profile.";
      setError(errorMsg);
      showPopup("error", errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="teacher-create-page">
      {/* =================================================
          POPUP
      ================================================= */}
      {popup.show && (
        <div className={`teacher-popup teacher-popup-${popup.type}`}>
          <div className="teacher-popup-icon">
            {popup.type === "success" ? "✓" : "!"}
          </div>
          <div className="teacher-popup-content">
            <strong>{popup.type === "success" ? "Success" : "Notice"}</strong>
            <span>{popup.message}</span>
          </div>
          <button
            type="button"
            onClick={closePopup}
            className="teacher-popup-close"
          >
            ×
          </button>
        </div>
      )}

      <div className="teacher-create-container">
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="teacher-create-header">
          <h1>Create Teacher Profile</h1>
          <p>
            Link a registered user account, assign multiple academic departments
            and teaching subjects, upload photo and credentials.
          </p>
        </div>

        {/* =================================================
            QUICK REGISTER CARD (USER CREATION)
        ================================================= */}
        <QuickRegisterUserCard
          userType="Teacher"
          defaultUserType="Teacher"
          title="Don't see the teacher in the user list?"
          description="Register a new Teacher User Account below. It will automatically link and populate the form."
          onUserCreated={(createdUser) => {
            if (!createdUser) return;
            const newId = String(
              createdUser?.id || createdUser?.Id || createdUser?.userId || createdUser?.UserId || ""
            );
            const newName =
              createdUser?.name || createdUser?.userName || createdUser?.username || "";
            const newEmail = createdUser?.email || createdUser?.Email || "";

            // Immediately inject into users state
            setUsers((prev) => {
              const exists = prev.some((u) => String(getTeacherUserId(u)) === newId);
              if (exists) return prev;
              return [createdUser, ...prev];
            });

            // Auto-select in form
            setFormData((prev) => ({
              ...prev,
              UserId: newId,
              TeacherCode: prev.TeacherCode || newName || (newId ? `TCH-${newId}` : ""),
              FirstName: prev.FirstName || newName.split(/\s+/)[0] || "",
              Email: prev.Email || (newName.includes("@") ? newName : newEmail),
            }));

            showPopup(
              "success",
              `User account "${newName || newEmail}" created & automatically selected in Link User Account!`,
            );

            loadUsers();
            loadExistingProfiles();
          }}
          onUserRegistered={(createdUser) => {
            if (!createdUser) return;
            const newId = String(
              createdUser?.id || createdUser?.Id || createdUser?.userId || createdUser?.UserId || ""
            );
            const newName =
              createdUser?.name || createdUser?.userName || createdUser?.username || "";
            const newEmail = createdUser?.email || createdUser?.Email || "";

            setUsers((prev) => {
              const exists = prev.some((u) => String(getTeacherUserId(u)) === newId);
              if (exists) return prev;
              return [createdUser, ...prev];
            });

            setFormData((prev) => ({
              ...prev,
              UserId: newId,
              TeacherCode: prev.TeacherCode || newName || (newId ? `TCH-${newId}` : ""),
              FirstName: prev.FirstName || newName.split(/\s+/)[0] || "",
              Email: prev.Email || (newName.includes("@") ? newName : newEmail),
            }));

            loadUsers();
            loadExistingProfiles();
          }}
          targetScrollId="teacher-profile-details-section"
        />

        {/* =================================================
            MESSAGES
        ================================================= */}
        {message && (
          <div className="teacher-message teacher-success-message">
            {message}
          </div>
        )}
        {error && (
          <div className="teacher-message teacher-error-message">{error}</div>
        )}

        {/* =================================================
            MAIN FORM
        ================================================= */}
        <form
          id="teacher-profile-details-section"
          className="teacher-form"
          onSubmit={handleSubmit}
        >
          {/* STEP 2 HEADER */}
          <div className="step-2-section-header">
            <span className="step-2-badge">Step 2</span>
            <div>
              <h2>Teacher Academic & Personal Details</h2>
              <p className="step-2-desc">
                Fill in the assigned departments, subjects, contact info and
                documents for this teacher.
              </p>
            </div>
          </div>

          {/* USER ACCOUNT SELECT */}
          <div className="teacher-form-group teacher-full-width">
            <label>
              Link User Account <span>*</span>
            </label>
            <select
              name="UserId"
              value={formData.UserId}
              onChange={handleUserSelect}
              required
              disabled={loadingUsers || submitting}
            >
              <option value="">
                {loadingUsers
                  ? "Loading teacher accounts..."
                  : availableUsers.length === 0
                    ? "-- No unassigned Teacher Accounts available (Create one above) --"
                    : `-- Select Teacher User Account (${availableUsers.length} available) --`}
              </option>
              {availableUsers.map((u) => {
                const uId = getTeacherUserId(u);
                const uName = getTeacherUserName(u);
                const uEmail = getTeacherUserEmail(u);
                return (
                  <option key={uId} value={uId}>
                    {uName || `User #${uId}`} {uEmail ? `(${uEmail})` : ""}
                  </option>
                );
              })}
            </select>
          </div>

          {/* =================================================
              DEPARTMENT (MULTI-DEPARTMENT SUPPORT)
          ================================================= */}
          <div className="teacher-form-group">
            <label>
              Department(s) <span>*</span>
            </label>

            <div className="primary-dept-select-row">
              <select
                name="DepartmentId"
                value={formData.DepartmentId}
                onChange={handlePrimaryDeptChange}
                required={selectedDepartments.length === 0}
                disabled={loadingDepartments || submitting}
              >
                <option value="">
                  {loadingDepartments
                    ? "Loading departments..."
                    : "Select Primary Department *"}
                </option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.text || dept.name || `Department ${dept.id}`}
                  </option>
                ))}
              </select>

              {formData.DepartmentId && (
                <button
                  type="button"
                  className="btn-add-another-dept"
                  onClick={() => setShowAddDeptDropdown(!showAddDeptDropdown)}
                  title="Assign another department to this teacher"
                >
                  {showAddDeptDropdown ? "✕ Cancel" : "+ Add Another Department"}
                </button>
              )}
            </div>

            {/* Additional Department Inline Selector */}
            {showAddDeptDropdown && (
              <div className="add-additional-dept-panel">
                <div className="add-additional-dept-row">
                  <select
                    value={additionalDeptSelect}
                    onChange={(e) => setAdditionalDeptSelect(e.target.value)}
                    className="select-additional-dept"
                  >
                    <option value="">-- Choose 2nd, 3rd, 4th Department --</option>
                    {departments
                      .filter(
                        (d) =>
                          !selectedDepartments.some(
                            (sd) => String(sd.id) === String(d.id),
                          ),
                      )
                      .map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.text || d.name || `Department ${d.id}`}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    className="btn-confirm-add-dept"
                    onClick={() => handleAddAdditionalDept(additionalDeptSelect)}
                    disabled={!additionalDeptSelect}
                  >
                    + Add Department
                  </button>
                </div>
              </div>
            )}

            {/* Selected departments badges/chips with 👁️ View Full List */}
            {selectedDepartments.length > 0 && (
              <div className="selected-dept-tags-wrapper">
                <div className="selected-dept-header">
                  <span className="selected-dept-count-label">
                    Assigned Departments ({selectedDepartments.length}):
                  </span>
                  <button
                    type="button"
                    className="btn-view-all-depts-link"
                    onClick={() => setDeptModalOpen(true)}
                  >
                    👁️ View Full List
                  </button>
                </div>

                <div className="selected-dept-tags-list">
                  {selectedDepartments.map((dept) => (
                    <div
                      key={dept.id}
                      className={`dept-badge-chip ${dept.isPrimary ? "is-primary" : ""}`}
                    >
                      <span className="dept-chip-name">
                        {dept.isPrimary ? "⭐ " : "🏢 "}
                        {dept.name}
                        {dept.isPrimary && (
                          <span className="primary-dept-pill">Primary</span>
                        )}
                      </span>
                      {selectedDepartments.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-dept-chip"
                          onClick={() => handleRemoveDept(dept.id)}
                          title="Remove this department"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* =================================================
              SUBJECT (MULTI-SUBJECT SUPPORT)
          ================================================= */}
          <div className="teacher-form-group">
            <label>Subject(s) / Teaching Specialization</label>

            <div className="primary-dept-select-row">
              <select
                name="SubjectId"
                value={formData.SubjectId}
                onChange={handlePrimarySubjectChange}
                disabled={loadingSubjects || submitting}
              >
                <option value="">
                  {loadingSubjects
                    ? "Loading subjects..."
                    : "Select Primary Subject (Optional)"}
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.text || subject.name || `Subject ${subject.id}`}
                  </option>
                ))}
              </select>

              {formData.SubjectId && (
                <button
                  type="button"
                  className="btn-add-another-dept"
                  onClick={() => setShowAddSubjectDropdown(!showAddSubjectDropdown)}
                  title="Assign another subject to this teacher"
                >
                  {showAddSubjectDropdown ? "✕ Cancel" : "+ Add Another Subject"}
                </button>
              )}
            </div>

            {/* Additional Subject Inline Selector */}
            {showAddSubjectDropdown && (
              <div className="add-additional-dept-panel">
                <div className="add-additional-dept-row">
                  <select
                    value={additionalSubjectSelect}
                    onChange={(e) => setAdditionalSubjectSelect(e.target.value)}
                    className="select-additional-dept"
                  >
                    <option value="">-- Choose 2nd, 3rd, 4th Subject --</option>
                    {subjects
                      .filter(
                        (s) =>
                          !selectedSubjects.some(
                            (ss) => String(ss.id) === String(s.id),
                          ),
                      )
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.text || s.name || `Subject ${s.id}`}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    className="btn-confirm-add-dept"
                    onClick={() => handleAddAdditionalSubject(additionalSubjectSelect)}
                    disabled={!additionalSubjectSelect}
                  >
                    + Add Subject
                  </button>
                </div>
              </div>
            )}

            {/* Selected subjects badges/chips with 👁️ View Full List */}
            {selectedSubjects.length > 0 && (
              <div className="selected-dept-tags-wrapper">
                <div className="selected-dept-header">
                  <span className="selected-dept-count-label">
                    Assigned Subjects ({selectedSubjects.length}):
                  </span>
                  <button
                    type="button"
                    className="btn-view-all-depts-link"
                    onClick={() => setSubjectModalOpen(true)}
                  >
                    👁️ View Full List
                  </button>
                </div>

                <div className="selected-dept-tags-list">
                  {selectedSubjects.map((subj) => (
                    <div
                      key={subj.id}
                      className={`dept-badge-chip ${subj.isPrimary ? "is-primary" : ""}`}
                    >
                      <span className="dept-chip-name">
                        {subj.isPrimary ? "⭐ " : "📚 "}
                        {subj.name}
                        {subj.isPrimary && (
                          <span className="primary-dept-pill">Primary</span>
                        )}
                      </span>
                      {selectedSubjects.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-dept-chip"
                          onClick={() => handleRemoveSubject(subj.id)}
                          title="Remove this subject"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* TEACHER CODE */}
          <div className="teacher-form-group">
            <label>
              Teacher Code <span>*</span>
            </label>
            <input
              type="text"
              name="TeacherCode"
              value={formData.TeacherCode}
              onChange={handleChange}
              placeholder="Enter teacher code (e.g. TCH001)"
              required
              disabled={submitting}
            />
          </div>

          {/* FIRST NAME */}
          <div className="teacher-form-group">
            <label>
              First Name <span>*</span>
            </label>
            <input
              type="text"
              name="FirstName"
              value={formData.FirstName}
              onChange={handleChange}
              placeholder="Enter first name"
              required
              disabled={submitting}
            />
          </div>

          {/* MIDDLE NAME */}
          <div className="teacher-form-group">
            <label>Middle Name</label>
            <input
              type="text"
              name="MiddleName"
              value={formData.MiddleName}
              onChange={handleChange}
              placeholder="Enter middle name"
              disabled={submitting}
            />
          </div>

          {/* LAST NAME */}
          <div className="teacher-form-group">
            <label>
              Last Name <span>*</span>
            </label>
            <input
              type="text"
              name="LastName"
              value={formData.LastName}
              onChange={handleChange}
              placeholder="Enter last name"
              required
              disabled={submitting}
            />
          </div>

          {/* FATHER'S NAME */}
          <div className="teacher-form-group">
            <label>Father's Name</label>
            <input
              type="text"
              name="FatherName"
              value={formData.FatherName}
              onChange={handleChange}
              placeholder="Enter father's name"
              disabled={submitting}
            />
          </div>

          {/* MOTHER'S NAME */}
          <div className="teacher-form-group">
            <label>Mother's Name</label>
            <input
              type="text"
              name="MotherName"
              value={formData.MotherName}
              onChange={handleChange}
              placeholder="Enter mother's name"
              disabled={submitting}
            />
          </div>

          {/* DATE OF BIRTH */}
          <div className="teacher-form-group">
            <label>
              Date of Birth <span>*</span>
            </label>
            <input
              type="date"
              name="DateOfBirth"
              value={formData.DateOfBirth}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          {/* GENDER */}
          <div className="teacher-form-group">
            <label>
              Gender <span>*</span>
            </label>
            <select
              name="Gender"
              value={formData.Gender}
              onChange={handleChange}
              required
              disabled={submitting}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* EMAIL */}
          <div className="teacher-form-group">
            <label>
              Email <span>*</span>
            </label>
            <input
              type="email"
              name="Email"
              value={formData.Email}
              onChange={handleChange}
              placeholder="Enter email address"
              required
              disabled={submitting}
            />
          </div>

          {/* PHONE */}
          <div className="teacher-form-group">
            <label>
              Phone Number <span>*</span>
            </label>
            <input
              type="tel"
              name="PhoneNumber"
              value={formData.PhoneNumber}
              onChange={handleChange}
              placeholder="Enter phone number"
              required
              disabled={submitting}
            />
          </div>

          {/* ALTERNATE PHONE */}
          <div className="teacher-form-group">
            <label>Alternate Phone</label>
            <input
              type="tel"
              name="AlternatePhoneNumber"
              value={formData.AlternatePhoneNumber}
              onChange={handleChange}
              placeholder="Enter alternate phone"
              disabled={submitting}
            />
          </div>

          {/* QUALIFICATION */}
          <div className="teacher-form-group">
            <label>
              Qualification <span>*</span>
            </label>
            <input
              type="text"
              name="Qualification"
              value={formData.Qualification}
              onChange={handleChange}
              placeholder="e.g. B.Ed, M.Sc, Ph.D"
              required
              disabled={submitting}
            />
          </div>

          {/* EXPERIENCE */}
          <div className="teacher-form-group">
            <label>Experience (Years)</label>
            <input
              type="number"
              name="Experience"
              value={formData.Experience}
              onChange={handleChange}
              placeholder="Enter years of experience"
              min="0"
              step="0.1"
              disabled={submitting}
            />
          </div>

          {/* JOINING DATE */}
          <div className="teacher-form-group">
            <label>
              Joining Date <span>*</span>
            </label>
            <input
              type="date"
              name="JoiningDate"
              value={formData.JoiningDate}
              onChange={handleChange}
              required
              disabled={submitting}
            />
          </div>

          {/* SALARY */}
          <div className="teacher-form-group">
            <label>Salary (₹)</label>
            <input
              type="number"
              name="Salary"
              value={formData.Salary}
              onChange={handleChange}
              placeholder="Enter salary amount"
              min="0"
              step="0.01"
              disabled={submitting}
            />
          </div>

          {/* ADDRESS */}
          <div className="teacher-form-group teacher-full-width">
            <label>Residential Address</label>
            <textarea
              name="Address"
              value={formData.Address}
              onChange={handleChange}
              placeholder="Enter residential address"
              rows="3"
              disabled={submitting}
            />
          </div>

          {/* PHOTO UPLOAD */}
          <div className="teacher-form-group">
            <label>Teacher Photograph</label>
            <div className="teacher-file-uploader-box">
              <input
                id="teacher-photo-file"
                type="file"
                accept="image/*"
                onChange={handlePhotoFileChange}
                className="teacher-file-input"
                disabled={submitting || photoCompressing}
              />
              {photoCompressing && (
                <span className="teacher-file-loading">
                  ⏳ Compressing & optimizing photograph...
                </span>
              )}
              {formData.Photo && (
                <div className="teacher-file-preview-bar">
                  <span className="teacher-file-name">
                    📷 {selectedPhotoName || "Photo Attached"}
                  </span>
                  <button
                    type="button"
                    className="teacher-preview-btn"
                    onClick={() =>
                      openPhotoInNewTab(
                        formData.Photo,
                        `${formData.FirstName} ${formData.LastName} Photo`,
                      )
                    }
                  >
                    👁 View Photo
                  </button>
                  <button
                    type="button"
                    className="teacher-remove-btn"
                    onClick={handleRemovePhoto}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* EDUCATION PDF */}
          <div className="teacher-form-group">
            <label>Combined Education Certificates (PDF)</label>
            <div className="teacher-file-uploader-box">
              <input
                id="teacher-pdf-file"
                type="file"
                accept="application/pdf,.pdf"
                onChange={handlePdfFileChange}
                className="teacher-file-input"
                disabled={submitting || pdfProcessing}
              />
              {pdfProcessing && (
                <span className="teacher-file-loading">
                  ⏳ Reading & encoding PDF...
                </span>
              )}
              {formData.EducationPdf && (
                <div className="teacher-file-preview-bar">
                  <span className="teacher-file-name">
                    📄 {formData.EducationFileName || selectedPdfName || "Education.pdf"}
                  </span>
                  <button
                    type="button"
                    className="teacher-preview-btn"
                    onClick={() =>
                      openPdfInNewTab(
                        formData.EducationPdf,
                        `${formData.FirstName} ${formData.LastName} Education Documents`,
                      )
                    }
                  >
                    👁 View PDF
                  </button>
                  <button
                    type="button"
                    className="teacher-remove-btn"
                    onClick={handleRemovePdf}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ACTIONS */}
          <div className="teacher-form-actions">
            <button
              type="submit"
              disabled={submitting || loadingDepartments}
              className="teacher-submit-btn"
            >
              {submitting ? "Creating Profile..." : "Create Teacher Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* =================================================
          DEPARTMENT MODAL (VIEW / MANAGE ALL DEPARTMENTS)
      ================================================= */}
      {deptModalOpen && (
        <div
          className="dept-modal-backdrop"
          onClick={() => setDeptModalOpen(false)}
        >
          <div
            className="dept-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dept-modal-header">
              <div className="dept-modal-title">
                <h3>🏢 Assigned Departments</h3>
                <span className="dept-modal-count-badge">
                  {selectedDepartments.length}{" "}
                  {selectedDepartments.length === 1 ? "Department" : "Departments"}
                </span>
              </div>
              <button
                type="button"
                className="dept-modal-close-btn"
                onClick={() => setDeptModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="dept-modal-body">
              <p className="dept-modal-subtitle">
                Departments currently assigned to this teacher. You can change
                which department is Primary or remove non-primary departments.
              </p>
              <div className="dept-modal-table-wrap">
                <table className="dept-modal-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Department Name</th>
                      <th>Dept ID</th>
                      <th>Role / Status</th>
                      <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedDepartments.map((dept, idx) => (
                      <tr
                        key={dept.id}
                        className={dept.isPrimary ? "modal-primary-row" : ""}
                      >
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{dept.name}</strong>
                        </td>
                        <td>
                          <span className="dept-code-tag">ID: {dept.id}</span>
                        </td>
                        <td>
                          {dept.isPrimary ? (
                            <span className="badge-primary-dept">
                              ⭐ Primary Department
                            </span>
                          ) : (
                            <span className="badge-secondary-dept">
                              Additional Department
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div className="dept-modal-actions">
                            {!dept.isPrimary && (
                              <button
                                type="button"
                                className="btn-modal-set-primary"
                                onClick={() => handleMakePrimaryDept(dept.id)}
                              >
                                Set as Primary
                              </button>
                            )}
                            {selectedDepartments.length > 1 && (
                              <button
                                type="button"
                                className="btn-modal-remove"
                                onClick={() => handleRemoveDept(dept.id)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="dept-modal-footer">
              <button
                type="button"
                className="btn-modal-done"
                onClick={() => setDeptModalOpen(false)}
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          SUBJECT MODAL (VIEW / MANAGE ALL SUBJECTS)
      ================================================= */}
      {subjectModalOpen && (
        <div
          className="dept-modal-backdrop"
          onClick={() => setSubjectModalOpen(false)}
        >
          <div
            className="dept-modal-container"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="dept-modal-header">
              <div className="dept-modal-title">
                <h3>📚 Assigned Teaching Subjects</h3>
                <span className="dept-modal-count-badge">
                  {selectedSubjects.length}{" "}
                  {selectedSubjects.length === 1 ? "Subject" : "Subjects"}
                </span>
              </div>
              <button
                type="button"
                className="dept-modal-close-btn"
                onClick={() => setSubjectModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="dept-modal-body">
              <p className="dept-modal-subtitle">
                Subjects currently assigned for this teacher to teach. You can
                review, make primary, or remove subjects below.
              </p>
              <div className="dept-modal-table-wrap">
                <table className="dept-modal-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subject Name</th>
                      <th>Subject ID</th>
                      <th>Role / Status</th>
                      <th style={{ textAlign: "center" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedSubjects.map((subj, idx) => (
                      <tr
                        key={subj.id}
                        className={subj.isPrimary ? "modal-primary-row" : ""}
                      >
                        <td>{idx + 1}</td>
                        <td>
                          <strong>{subj.name}</strong>
                        </td>
                        <td>
                          <span className="dept-code-tag">ID: {subj.id}</span>
                        </td>
                        <td>
                          {subj.isPrimary ? (
                            <span className="badge-primary-dept">
                              ⭐ Primary Subject
                            </span>
                          ) : (
                            <span className="badge-secondary-dept">
                              Additional Subject
                            </span>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <div className="dept-modal-actions">
                            {!subj.isPrimary && (
                              <button
                                type="button"
                                className="btn-modal-set-primary"
                                onClick={() => handleMakePrimarySubject(subj.id)}
                              >
                                Set as Primary
                              </button>
                            )}
                            {selectedSubjects.length > 1 && (
                              <button
                                type="button"
                                className="btn-modal-remove"
                                onClick={() => handleRemoveSubject(subj.id)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="dept-modal-footer">
              <button
                type="button"
                className="btn-modal-done"
                onClick={() => setSubjectModalOpen(false)}
              >
                Done / Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateTeacher;
