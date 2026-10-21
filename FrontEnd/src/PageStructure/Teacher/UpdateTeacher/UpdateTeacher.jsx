// =====================================================
// UPDATE TEACHER
// =====================================================

import { useEffect, useState, useMemo } from "react";
import {
  getAllTeachers,
  getTeacherByCode,
  updateTeacher,
  saveTeacherExtraFields,
} from "../../../Services/teacherService";
import { getDepartmentDropdown } from "../../../Services/departmentService";
import {
  getSubjectDropdown,
  getAllSubject,
  getSubjectDropdownByDepartment,
} from "../../../Services/subjectService";
import {
  compressImageFile,
  readPdfAsBase64,
  openPhotoInNewTab,
  openPdfInNewTab,
  formatFileUrl,
} from "../../../Utils/fileHelper";
import "./UpdateTeacher.css";

const UpdateTeacher = () => {
  // ===================================================
  // ALL TEACHERS LIST (FOR DROPDOWN)
  // ===================================================
  const [teachersList, setTeachersList] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(true);
  const [selectedTeacherCode, setSelectedTeacherCode] = useState("");

  // ===================================================
  // MANUAL SEARCH & LOADED IDENTIFIERS
  // ===================================================
  const [searchCode, setSearchCode] = useState("");
  const [loadedTeacherCode, setLoadedTeacherCode] = useState("");
  const [teacherId, setTeacherId] = useState(null);

  // ===================================================
  // DEPARTMENTS (MULTI-DEPARTMENT SUPPORT)
  // ===================================================
  const [departments, setDepartments] = useState([]);
  const [departmentLoading, setDepartmentLoading] = useState(true);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [showAddDeptDropdown, setShowAddDeptDropdown] = useState(false);
  const [additionalDeptSelect, setAdditionalDeptSelect] = useState("");
  const [deptModalOpen, setDeptModalOpen] = useState(false);

  // ===================================================
  // SUBJECTS (MULTI-SUBJECT SUPPORT)
  // ===================================================
  const [subjects, setSubjects] = useState([]);
  const [subjectsLoading, setSubjectsLoading] = useState(true);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [showAddSubjectDropdown, setShowAddSubjectDropdown] = useState(false);
  const [additionalSubjectSelect, setAdditionalSubjectSelect] = useState("");
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);

  // ===================================================
  // FORM DATA
  // ===================================================
  const [formData, setFormData] = useState({
    DepartmentId: "",
    SubjectId: "",
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
    IsActive: true,
    FatherName: "",
    MotherName: "",
    Photo: "",
    EducationPdf: "",
    EducationFileName: "",
  });

  // ===================================================
  // PHOTO & PDF STATE & HANDLERS
  // ===================================================
  const [photoCompressing, setPhotoCompressing] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [selectedPdfName, setSelectedPdfName] = useState("");

  // ===================================================
  // UI STATUS
  // ===================================================
  const [searching, setSearching] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [teacherLoaded, setTeacherLoaded] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // ===================================================
  // POPUP
  // ===================================================
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
    }, 4500);
  };

  const closePopup = () => {
    setPopup({
      show: false,
      type: "",
      message: "",
    });
  };

  // ===================================================
  // LOAD INITIAL DATA (DEPARTMENTS, SUBJECTS & ALL TEACHERS)
  // ===================================================
  useEffect(() => {
    const init = async () => {
      const depts = await loadDepartments();
      await loadSubjects(depts);
      await loadTeachers();
    };
    init();
  }, []);

  const loadDepartments = async () => {
    try {
      setDepartmentLoading(true);
      const result = await getDepartmentDropdown();
      const list = Array.isArray(result) ? result : result?.data || [];
      setDepartments(list);
      return list;
    } catch (err) {
      const errorMessage = err?.message || "Failed to load departments.";
      setError(errorMessage);
      return [];
    } finally {
      setDepartmentLoading(false);
    }
  };

  const loadSubjects = async (deptsList = null) => {
    try {
      setSubjectsLoading(true);
      const currDepts =
        Array.isArray(deptsList) && deptsList.length > 0
          ? deptsList
          : departments;
      let subjectData = [];
      try {
        const fullRes = await getAllSubject();
        const list =
          Array.isArray(fullRes)
            ? fullRes
            : fullRes?.data || fullRes?.Data || [];
        if (list.length > 0) {
          subjectData = list.map((s) => {
            const dId = s.departmentId ?? s.DepartmentId ?? null;
            const deptObj = currDepts.find((d) => Number(d.id) === Number(dId));
            const deptName =
              s.departmentName ??
              s.DepartmentName ??
              deptObj?.text ??
              deptObj?.name ??
              (dId ? `Dept ${dId}` : "");
            const subName =
              s.subjectName ??
              s.SubjectName ??
              s.name ??
              s.text ??
              `Subject ${s.id ?? s.Id}`;
            return {
              id: s.id ?? s.Id,
              departmentId: dId !== null ? Number(dId) : null,
              departmentName: deptName,
              code: s.subjectCode ?? s.SubjectCode ?? s.code ?? "",
              name: subName,
              text: deptName ? `${subName} [${deptName}]` : subName,
            };
          });
        }
      } catch (err) {
        console.warn("Could not load full subjects list:", err);
      }

      setSubjects(subjectData);
      return subjectData;
    } catch (err) {
      console.warn("Could not load subjects:", err);
      setSubjects([]);
      return [];
    } finally {
      setSubjectsLoading(false);
    }
  };

  const loadTeachers = async () => {
    try {
      setTeachersLoading(true);
      const result = await getAllTeachers();
      setTeachersList(Array.isArray(result) ? result : []);
    } catch (err) {
      console.warn("Could not load all teachers for dropdown:", err);
    } finally {
      setTeachersLoading(false);
    }
  };

  // ===================================================
  // MULTI-DEPARTMENT HANDLERS
  // ===================================================
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
  // MULTI-SUBJECT HANDLERS
  // ===================================================
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
  // DEPARTMENT-BASED SUBJECT FILTERING & AUTO CLEANUP
  // ===================================================
  const selectedDeptIds = useMemo(() => {
    const ids = new Set();
    if (
      formData.DepartmentId &&
      !isNaN(formData.DepartmentId) &&
      Number(formData.DepartmentId) > 0
    ) {
      ids.add(Number(formData.DepartmentId));
    }
    selectedDepartments.forEach((d) => {
      const numId = Number(d.id);
      if (!isNaN(numId) && numId > 0) {
        ids.add(numId);
      }
    });
    return ids;
  }, [formData.DepartmentId, selectedDepartments]);

  // Load and merge subjects for all selected departments whenever selectedDeptIds change
  useEffect(() => {
    let isCancelled = false;
    const deptIdsArray = Array.from(selectedDeptIds);

    if (deptIdsArray.length === 0) {
      return;
    }

    const fetchDepartmentSubjects = async () => {
      try {
        setSubjectsLoading(true);
        const results = await Promise.all(
          deptIdsArray.map(async (deptId) => {
            try {
              const res = await getSubjectDropdownByDepartment(deptId);
              const list = Array.isArray(res) ? res : res?.data || [];
              const deptObj = departments.find(
                (d) => Number(d.id) === Number(deptId),
              );
              const deptName = deptObj
                ? deptObj.text ?? deptObj.name ?? `Dept ${deptId}`
                : `Dept ${deptId}`;
              return list.map((s) => ({
                id: s.id ?? s.Id,
                departmentId: Number(deptId),
                departmentName: deptName,
                code: s.code ?? s.Code ?? "",
                name:
                  s.name ??
                  s.text ??
                  s.SubjectName ??
                  `Subject ${s.id ?? s.Id}`,
                text: `${s.name ?? s.text ?? s.SubjectName ?? `Subject ${s.id ?? s.Id}`} [${deptName}]`,
              }));
            } catch (err) {
              console.warn(
                `Could not load subjects for department ${deptId}:`,
                err,
              );
              return [];
            }
          }),
        );

        if (!isCancelled) {
          const fetchedSubjects = results.flat();
          setSubjects((prev) => {
            const map = new Map();
            prev.forEach((s) => {
              if (s.id) map.set(String(s.id), s);
            });
            fetchedSubjects.forEach((s) => {
              if (s.id) map.set(String(s.id), s);
            });
            return Array.from(map.values());
          });
        }
      } catch (err) {
        console.error("Error loading department subjects:", err);
      } finally {
        if (!isCancelled) {
          setSubjectsLoading(false);
        }
      }
    };

    fetchDepartmentSubjects();

    return () => {
      isCancelled = true;
    };
  }, [selectedDeptIds, departments]);

  const filteredSubjects = useMemo(() => {
    if (selectedDeptIds.size === 0) {
      return [];
    }
    const matched = subjects.filter((s) => {
      if (s.departmentId !== null && s.departmentId !== undefined) {
        return selectedDeptIds.has(Number(s.departmentId));
      }
      return false;
    });
    const uniqueMap = new Map();
    matched.forEach((s) => {
      if (s.id && !uniqueMap.has(String(s.id))) {
        uniqueMap.set(String(s.id), s);
      }
    });
    return Array.from(uniqueMap.values());
  }, [subjects, selectedDeptIds]);

  // Clean up selected subjects if their department was unselected
  useEffect(() => {
    if (selectedDeptIds.size === 0) {
      if (selectedSubjects.length > 0 || formData.SubjectId) {
        setSelectedSubjects([]);
        setFormData((prev) => ({ ...prev, SubjectId: "" }));
      }
      return;
    }

    setSelectedSubjects((prev) => {
      const valid = prev.filter((s) => {
        const subObj = subjects.find((sub) => String(sub.id) === String(s.id));
        if (
          !subObj ||
          subObj.departmentId === null ||
          subObj.departmentId === undefined
        )
          return true;
        return selectedDeptIds.has(Number(subObj.departmentId));
      });
      if (valid.length !== prev.length) {
        if (valid.length > 0) {
          if (!valid.some((s) => s.isPrimary)) valid[0].isPrimary = true;
          const primary = valid.find((s) => s.isPrimary) || valid[0];
          setFormData((fd) => ({ ...fd, SubjectId: String(primary.id) }));
        } else {
          setFormData((fd) => ({ ...fd, SubjectId: "" }));
        }
      }
      return valid;
    });

    if (formData.SubjectId) {
      const currentSubObj = subjects.find(
        (s) => String(s.id) === String(formData.SubjectId),
      );
      if (
        currentSubObj &&
        currentSubObj.departmentId !== null &&
        currentSubObj.departmentId !== undefined &&
        !selectedDeptIds.has(Number(currentSubObj.departmentId))
      ) {
        setFormData((prev) => ({ ...prev, SubjectId: "" }));
      }
    }
  }, [selectedDeptIds, subjects]);

  const getSubjectDisplayLabel = (s) => {
    if (!s) return "";
    const rawName = s.name || s.subjectName || s.text || `Subject ${s.id}`;
    const cleanName = String(rawName)
      .replace(/\s*\[.*?\]$/, "")
      .replace(/\s*\(Dept.*?\)$/, "")
      .trim();
    const dId = s.departmentId;
    const deptObj = departments.find((d) => Number(d.id) === Number(dId));
    const deptName =
      s.departmentName ||
      deptObj?.text ||
      deptObj?.name ||
      (dId ? `Dept ${dId}` : "");
    return deptName ? `${cleanName} [${deptName}]` : cleanName;
  };

  // ===================================================
  // DATE CONVERSION HELPER
  // ===================================================
  const convertDateForInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // ===================================================
  // FETCH & LOAD TEACHER DETAILS (BY CODE)
  // ===================================================
  const fetchAndLoadTeacher = async (codeToFetch) => {
    if (!codeToFetch || !String(codeToFetch).trim()) {
      const msg = "Please select or enter a valid Teacher Code.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    const cleanCode = String(codeToFetch).trim();
    setMessage("");
    setError("");

    try {
      setSearching(true);
      // Ensure departments & subjects lists are loaded
      let currDepts = departments;
      if (currDepts.length === 0) {
        currDepts = await loadDepartments();
      }
      let currSubjs = subjects;
      if (currSubjs.length === 0) {
        currSubjs = await loadSubjects();
      }

      // allowSoftDeleted = true ensures both Active and Inactive/soft-deleted teachers can be loaded
      const result = await getTeacherByCode(cleanCode, true);

      if (!result) {
        throw new Error(`Teacher with code "${cleanCode}" was not found.`);
      }

      setTeacherId(result.Id ?? null);
      const activeCode = result.TeacherCode || cleanCode;
      setLoadedTeacherCode(activeCode);
      setSelectedTeacherCode(activeCode);
      setSearchCode(activeCode);

      // Populate multiple departments
      const loadedDepts = [];
      if (Array.isArray(result.departments) && result.departments.length > 0) {
        result.departments.forEach((d) => {
          const dId = Number(d.id ?? d.Id);
          const deptObj = currDepts.find((dp) => Number(dp.id) === dId);
          const dName =
            d.name || d.text || deptObj?.text || deptObj?.name || `Department ${dId}`;
          loadedDepts.push({
            id: dId,
            name: dName,
            isPrimary: Boolean(
              d.isPrimary ?? (dId === Number(result.DepartmentId)),
            ),
          });
        });
      } else if (
        Array.isArray(result.DepartmentIds) &&
        result.DepartmentIds.length > 0
      ) {
        result.DepartmentIds.forEach((id, idx) => {
          const dId = Number(id);
          const deptObj = currDepts.find((dp) => Number(dp.id) === dId);
          const dName = deptObj?.text || deptObj?.name || `Department ${dId}`;
          loadedDepts.push({
            id: dId,
            name: dName,
            isPrimary:
              dId === Number(result.DepartmentId) ||
              (idx === 0 && !result.DepartmentId),
          });
        });
      } else if (result.DepartmentId) {
        const dId = Number(result.DepartmentId);
        const deptObj = currDepts.find((dp) => Number(dp.id) === dId);
        loadedDepts.push({
          id: dId,
          name:
            deptObj?.text ||
            deptObj?.name ||
            result.DepartmentName ||
            `Department ${dId}`,
          isPrimary: true,
        });
      }
      if (loadedDepts.length > 0 && !loadedDepts.some((d) => d.isPrimary)) {
        loadedDepts[0].isPrimary = true;
      }
      setSelectedDepartments(loadedDepts);

      // Populate multiple subjects
      const loadedSubjs = [];
      if (Array.isArray(result.subjects) && result.subjects.length > 0) {
        result.subjects.forEach((s) => {
          const sId = Number(s.id ?? s.Id);
          const subObj = currSubjs.find((sp) => Number(sp.id) === sId);
          const sName =
            s.name || s.text || subObj?.text || subObj?.name || `Subject ${sId}`;
          loadedSubjs.push({
            id: sId,
            name: sName,
            isPrimary: Boolean(
              s.isPrimary ?? (sId === Number(result.SubjectId)),
            ),
          });
        });
      } else if (
        Array.isArray(result.SubjectIds) &&
        result.SubjectIds.length > 0
      ) {
        result.SubjectIds.forEach((id, idx) => {
          const sId = Number(id);
          const subObj = currSubjs.find((sp) => Number(sp.id) === sId);
          const sName = subObj?.text || subObj?.name || `Subject ${sId}`;
          loadedSubjs.push({
            id: sId,
            name: sName,
            isPrimary:
              sId === Number(result.SubjectId) ||
              (idx === 0 && !result.SubjectId),
          });
        });
      } else if (result.SubjectId) {
        const sId = Number(result.SubjectId);
        const subObj = currSubjs.find((sp) => Number(sp.id) === sId);
        loadedSubjs.push({
          id: sId,
          name:
            subObj?.text ||
            subObj?.name ||
            result.SubjectName ||
            `Subject ${sId}`,
          isPrimary: true,
        });
      }
      if (loadedSubjs.length > 0 && !loadedSubjs.some((s) => s.isPrimary)) {
        loadedSubjs[0].isPrimary = true;
      }
      setSelectedSubjects(loadedSubjs);

      const primaryDeptId =
        loadedDepts.find((d) => d.isPrimary)?.id ?? result.DepartmentId ?? "";
      const primarySubjId =
        loadedSubjs.find((s) => s.isPrimary)?.id ?? result.SubjectId ?? "";

      setFormData({
        DepartmentId: primaryDeptId ? String(primaryDeptId) : "",
        SubjectId: primarySubjId ? String(primarySubjId) : "",
        FirstName: result.FirstName ?? "",
        MiddleName: result.MiddleName ?? "",
        LastName: result.LastName ?? "",
        DateOfBirth: convertDateForInput(result.DateOfBirth),
        Gender: result.Gender ?? "",
        Email: result.Email ?? "",
        PhoneNumber: result.PhoneNumber ?? "",
        AlternatePhoneNumber: result.AlternatePhoneNumber ?? "",
        Address: result.Address ?? "",
        Qualification: result.Qualification ?? "",
        Experience: result.Experience ?? "",
        JoiningDate: convertDateForInput(result.JoiningDate),
        Salary: result.Salary ?? "",
        IsClassTeacher: Boolean(result.IsClassTeacher),
        IsActive: Boolean(result.IsActive),
        FatherName: result.FatherName ?? "",
        MotherName: result.MotherName ?? "",
        Photo: result.Photo ?? "",
        EducationPdf: result.EducationPdf ?? "",
        EducationFileName: result.EducationFileName ?? "",
      });

      setSelectedPhotoName("");
      setSelectedPdfName(
        result.EducationFileName ||
          (result.EducationPdf ? "Current_Education_Document.pdf" : ""),
      );

      setTeacherLoaded(true);

      const teacherFullName = [
        result.FirstName,
        result.MiddleName,
        result.LastName,
      ]
        .filter(Boolean)
        .join(" ");

      const successMsg = `Teacher "${teacherFullName || activeCode}" loaded successfully.`;
      setMessage(successMsg);
      showPopup("success", successMsg);
    } catch (err) {
      const errorMessage = err?.message || "Failed to load teacher profile.";
      setError(errorMessage);
      showPopup("error", errorMessage);
      setTeacherLoaded(false);
    } finally {
      setSearching(false);
    }
  };

  // ===================================================
  // DROPDOWN SELECT HANDLER
  // ===================================================
  const handleDropdownSelect = async (e) => {
    const selected = e.target.value;
    setSelectedTeacherCode(selected);
    if (selected) {
      setSearchCode(selected);
      await fetchAndLoadTeacher(selected);
    }
  };

  // ===================================================
  // MANUAL SEARCH HANDLER
  // ===================================================
  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!searchCode.trim()) {
      const msg = "Please enter a Teacher Code.";
      setError(msg);
      showPopup("error", msg);
      return;
    }
    await fetchAndLoadTeacher(searchCode.trim());
  };

  // ===================================================
  // PHOTO UPLOAD & CHANGE HANDLERS
  // ===================================================
  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, JPEG, PNG, WebP).");
      showPopup("error", "Please select a valid image file (JPG, PNG, WebP).");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Photo file size must be less than 10 MB.");
      showPopup("error", "Photo file size must be less than 10 MB.");
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
      console.error("Photo processing error:", err);
      setError("Failed to process selected image.");
      showPopup("error", "Failed to process image.");
    } finally {
      setPhotoCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setFormData((prev) => ({ ...prev, Photo: "" }));
    setSelectedPhotoName("");
    const input = document.getElementById("update-teacher-photo-file");
    if (input) input.value = "";
    showPopup("info", "Photograph removed.");
  };

  // ===================================================
  // PDF UPLOAD & RE-UPLOAD HANDLERS
  // ===================================================
  const handlePdfFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "application/pdf" &&
      !file.name?.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      showPopup("error", "Please select a valid PDF file.");
      e.target.value = "";
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setError("PDF file size must be less than 15 MB.");
      showPopup("error", "PDF file size must be less than 15 MB.");
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
      showPopup("success", "New education PDF attached successfully.");
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
    const input = document.getElementById("update-teacher-pdf-file");
    if (input) input.value = "";
    showPopup("info", "Education PDF document removed.");
  };

  // ===================================================
  // FORM CHANGE
  // ===================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ===================================================
  // SUBMIT UPDATE
  // ===================================================
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (teacherId === null || teacherId === undefined) {
      const msg = "Please search and load a teacher first.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    if (
      formData.DepartmentId === null ||
      formData.DepartmentId === undefined ||
      String(formData.DepartmentId).trim() === ""
    ) {
      const msg = "Department is required.";
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
      setUpdating(true);

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
        TeacherCode: loadedTeacherCode || searchCode,
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

      await updateTeacher(teacherId, payload);

      // Save extra fields (FatherName, MotherName, Photo, EducationPdf, multi-dept, multi-subject)
      saveTeacherExtraFields(teacherId, payload);
      if (loadedTeacherCode) {
        saveTeacherExtraFields(loadedTeacherCode, payload);
      }

      const successMessage = "Teacher profile updated successfully with departments and subjects.";
      setMessage(successMessage);
      showPopup("success", successMessage);

      // Refresh teachers list to update dropdown options & status indicators
      loadTeachers();
    } catch (err) {
      const errorMessage = err?.message || "Failed to update teacher.";
      setError(errorMessage);
      showPopup("error", errorMessage);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="teacher-update-page">
      {/* =================================================
          POPUP
      ================================================= */}
      {popup.show && (
        <div
          className={`teacher-update-popup teacher-update-popup-${popup.type}`}
        >
          <div className="teacher-update-popup-icon">
            {popup.type === "success" ? "✓" : "!"}
          </div>
          <div className="teacher-update-popup-content">
            <strong>{popup.type === "success" ? "Success" : "Notice"}</strong>
            <span>{popup.message}</span>
          </div>
          <button
            type="button"
            onClick={closePopup}
            className="teacher-update-popup-close"
          >
            ×
          </button>
        </div>
      )}

      <div className="teacher-update-container">
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="teacher-update-header">
          <h1>Update Teacher Profile</h1>
          <p>
            Select any Active or Inactive teacher from the dropdown or search by
            code to view and update photo, education documents, personal and
            academic details.
          </p>
        </div>

        {/* =================================================
            TEACHER SELECTOR / SEARCH BAR
        ================================================= */}
        <div className="teacher-update-selector-card">
          <div className="teacher-dropdown-picker-group">
            <label
              htmlFor="teacher-select-dropdown"
              className="teacher-picker-label"
            >
              Select Teacher (Active & Inactive):
            </label>
            <select
              id="teacher-select-dropdown"
              className="teacher-select-dropdown"
              value={selectedTeacherCode}
              onChange={handleDropdownSelect}
              disabled={teachersLoading || searching}
            >
              <option value="">
                {teachersLoading
                  ? "⏳ Loading teachers list..."
                  : `-- Choose a Teacher (${teachersList.length} registered) --`}
              </option>
              {teachersList.map((t) => {
                const name =
                  [t.FirstName, t.MiddleName, t.LastName]
                    .filter(Boolean)
                    .join(" ") || "Unnamed Teacher";
                const code = t.TeacherCode || t.teacherCode || String(t.Id);
                const isActive = Boolean(t.IsActive ?? t.isActive);
                const statusTag = isActive ? "Active" : "Inactive";
                return (
                  <option key={t.Id ?? code} value={code}>
                    {name} ({code}) - [{statusTag}]
                  </option>
                );
              })}
            </select>
          </div>

          <div className="teacher-selector-divider">
            <span>OR SEARCH BY CODE</span>
          </div>

          <form className="teacher-update-search" onSubmit={handleManualSearch}>
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              placeholder="Enter Teacher Code (e.g. TCH001)"
              disabled={searching}
            />
            <button type="submit" disabled={searching}>
              {searching ? "Loading..." : "Load Teacher"}
            </button>
          </form>
        </div>

        {/* =================================================
            FEEDBACK MESSAGES
        ================================================= */}
        {message && (
          <div className="teacher-update-message success">{message}</div>
        )}
        {error && <div className="teacher-update-message error">{error}</div>}

        {/* =================================================
            TEACHER EDIT FORM
        ================================================= */}
        {teacherLoaded && (
          <form className="teacher-update-form" onSubmit={handleUpdate}>
            {/* =================================================
                BANNER: TEACHER SUMMARY & STATUS
            ================================================= */}
            <div className="teacher-profile-summary-banner teacher-update-full">
              <div className="summary-left">
                <span className="summary-title">Editing Teacher Profile</span>
                <span className="summary-code-tag">
                  Code: <strong>{loadedTeacherCode || "N/A"}</strong>
                </span>
                <span className="summary-id-tag">ID: #{teacherId}</span>
              </div>
              <div className="summary-right">
                <span
                  className={`status-pill ${
                    formData.IsActive ? "status-active" : "status-inactive"
                  }`}
                >
                  ● {formData.IsActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            {/* =================================================
                TEACHER PHOTO SECTION
            ================================================= */}
            <div className="teacher-update-group teacher-update-full teacher-photo-section-card">
              <label className="section-card-title">Teacher Photograph</label>
              <div className="teacher-photo-management-row">
                <div className="current-photo-container">
                  {formData.Photo ? (
                    <div className="photo-display-box">
                      <img
                        src={formatFileUrl(formData.Photo)}
                        alt="Teacher"
                        className="teacher-current-photo-img"
                        onClick={() =>
                          openPhotoInNewTab(
                            formData.Photo,
                            `${formData.FirstName} ${formData.LastName} Photo`,
                          )
                        }
                        title="Click to view full photo in new tab"
                      />
                      <div className="photo-actions-under">
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
                          👁 View Full Photo ↗
                        </button>
                        <button
                          type="button"
                          className="teacher-remove-btn"
                          onClick={handleRemovePhoto}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="no-photo-placeholder-box">
                      <span className="placeholder-icon">👤</span>
                      <span className="placeholder-label">
                        No Photo Uploaded
                      </span>
                    </div>
                  )}
                </div>

                <div className="change-photo-controls">
                  <label
                    htmlFor="update-teacher-photo-file"
                    className="photo-input-label"
                  >
                    {formData.Photo
                      ? "Change / Replace Photograph:"
                      : "Upload Photograph:"}
                  </label>
                  <input
                    id="update-teacher-photo-file"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    className="teacher-file-input"
                    disabled={updating || photoCompressing}
                  />
                  {photoCompressing && (
                    <div className="file-status-indicator processing">
                      ⏳ Compressing & processing photograph...
                    </div>
                  )}
                  {selectedPhotoName && (
                    <div className="file-status-indicator success">
                      ✓ Selected new photo: {selectedPhotoName}
                    </div>
                  )}
                  <p className="field-hint">
                    Select a JPG, JPEG, PNG, or WebP file. Images are
                    automatically compressed for optimal storage and loading
                    speed.
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                DEPARTMENT (MULTI-DEPARTMENT SUPPORT)
            ================================================= */}
            <div className="teacher-update-group teacher-update-full">
              <label>Department(s) *</label>

              <div className="primary-dept-select-row">
                <select
                  name="DepartmentId"
                  value={formData.DepartmentId}
                  onChange={handlePrimaryDeptChange}
                  required
                  disabled={departmentLoading || updating}
                >
                  <option value="">
                    {departmentLoading
                      ? "Loading departments..."
                      : "Select Primary Department *"}
                  </option>
                  {departments.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.text || department.name || `Department ${department.id}`}
                    </option>
                  ))}
                </select>

                {formData.DepartmentId && (
                  <button
                    type="button"
                    className="btn-add-another-dept"
                    onClick={() => setShowAddDeptDropdown(!showAddDeptDropdown)}
                    title="Assign another academic department to this teacher"
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
            <div className="teacher-update-group teacher-update-full">
              <label>Subject(s) / Teaching Specialization</label>

              <div className="primary-dept-select-row">
                <select
                  name="SubjectId"
                  value={formData.SubjectId}
                  onChange={handlePrimarySubjectChange}
                  disabled={
                    subjectsLoading || updating || selectedDeptIds.size === 0
                  }
                >
                  <option value="">
                    {subjectsLoading
                      ? "Loading subjects..."
                      : selectedDeptIds.size === 0
                        ? "-- Please select a Department first --"
                        : filteredSubjects.length === 0
                          ? "-- No subjects found for selected department(s) --"
                          : `-- Select Primary Subject (${filteredSubjects.length} available) --`}
                  </option>
                  {filteredSubjects.map((subject) => (
                    <option key={subject.id} value={subject.id}>
                      {getSubjectDisplayLabel(subject)}
                    </option>
                  ))}
                </select>

                {formData.SubjectId && (
                  <button
                    type="button"
                    className="btn-add-another-dept"
                    onClick={() =>
                      setShowAddSubjectDropdown(!showAddSubjectDropdown)
                    }
                    title="Assign another subject to this teacher"
                  >
                    {showAddSubjectDropdown
                      ? "✕ Cancel"
                      : "+ Add Another Subject"}
                  </button>
                )}
              </div>

              {/* Additional Subject Inline Selector */}
              {showAddSubjectDropdown && (
                <div className="add-additional-dept-panel">
                  <div className="add-additional-dept-row">
                    <select
                      value={additionalSubjectSelect}
                      onChange={(e) =>
                        setAdditionalSubjectSelect(e.target.value)
                      }
                      className="select-additional-dept"
                    >
                      <option value="">-- Choose 2nd, 3rd, 4th Subject --</option>
                      {filteredSubjects
                        .filter(
                          (s) =>
                            !selectedSubjects.some(
                              (ss) => String(ss.id) === String(s.id),
                            ),
                        )
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {getSubjectDisplayLabel(s)}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      className="btn-confirm-add-dept"
                      onClick={() =>
                        handleAddAdditionalSubject(additionalSubjectSelect)
                      }
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

            {/* =================================================
                TEACHER CODE (READ ONLY)
            ================================================= */}
            <div className="teacher-update-group">
              <label>Teacher Code</label>
              <input
                type="text"
                value={loadedTeacherCode || searchCode}
                disabled
              />
            </div>

            {/* =================================================
                FIRST NAME
            ================================================= */}
            <div className="teacher-update-group">
              <label>First Name *</label>
              <input
                type="text"
                name="FirstName"
                value={formData.FirstName}
                onChange={handleChange}
                placeholder="Enter first name"
                required
                disabled={updating}
              />
            </div>

            {/* =================================================
                MIDDLE NAME
            ================================================= */}
            <div className="teacher-update-group">
              <label>Middle Name</label>
              <input
                type="text"
                name="MiddleName"
                value={formData.MiddleName}
                onChange={handleChange}
                placeholder="Enter middle name"
                disabled={updating}
              />
            </div>

            {/* =================================================
                LAST NAME
            ================================================= */}
            <div className="teacher-update-group">
              <label>Last Name *</label>
              <input
                type="text"
                name="LastName"
                value={formData.LastName}
                onChange={handleChange}
                placeholder="Enter last name"
                required
                disabled={updating}
              />
            </div>

            {/* =================================================
                FATHER'S NAME
            ================================================= */}
            <div className="teacher-update-group">
              <label>Father's Name</label>
              <input
                type="text"
                name="FatherName"
                value={formData.FatherName}
                onChange={handleChange}
                placeholder="Enter father's name"
                disabled={updating}
              />
            </div>

            {/* =================================================
                MOTHER'S NAME
            ================================================= */}
            <div className="teacher-update-group">
              <label>Mother's Name</label>
              <input
                type="text"
                name="MotherName"
                value={formData.MotherName}
                onChange={handleChange}
                placeholder="Enter mother's name"
                disabled={updating}
              />
            </div>

            {/* =================================================
                DATE OF BIRTH
            ================================================= */}
            <div className="teacher-update-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                name="DateOfBirth"
                value={formData.DateOfBirth}
                onChange={handleChange}
                required
                disabled={updating}
              />
            </div>

            {/* =================================================
                GENDER
            ================================================= */}
            <div className="teacher-update-group">
              <label>Gender *</label>
              <select
                name="Gender"
                value={formData.Gender}
                onChange={handleChange}
                required
                disabled={updating}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* =================================================
                EMAIL
            ================================================= */}
            <div className="teacher-update-group">
              <label>Email *</label>
              <input
                type="email"
                name="Email"
                value={formData.Email}
                onChange={handleChange}
                placeholder="Enter email"
                required
                disabled={updating}
              />
            </div>

            {/* =================================================
                PHONE NUMBER
            ================================================= */}
            <div className="teacher-update-group">
              <label>Phone Number *</label>
              <input
                type="tel"
                name="PhoneNumber"
                value={formData.PhoneNumber}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
                disabled={updating}
              />
            </div>

            {/* =================================================
                ALTERNATE PHONE
            ================================================= */}
            <div className="teacher-update-group">
              <label>Alternate Phone</label>
              <input
                type="tel"
                name="AlternatePhoneNumber"
                value={formData.AlternatePhoneNumber}
                onChange={handleChange}
                placeholder="Enter alternate phone"
                disabled={updating}
              />
            </div>

            {/* =================================================
                QUALIFICATION
            ================================================= */}
            <div className="teacher-update-group">
              <label>Qualification *</label>
              <input
                type="text"
                name="Qualification"
                value={formData.Qualification}
                onChange={handleChange}
                placeholder="e.g. B.Ed, M.Sc, Ph.D"
                required
                disabled={updating}
              />
            </div>

            {/* =================================================
                EXPERIENCE
            ================================================= */}
            <div className="teacher-update-group">
              <label>Experience (Years)</label>
              <input
                type="number"
                name="Experience"
                value={formData.Experience}
                onChange={handleChange}
                placeholder="Enter years of experience"
                min="0"
                step="0.1"
                disabled={updating}
              />
            </div>

            {/* =================================================
                JOINING DATE
            ================================================= */}
            <div className="teacher-update-group">
              <label>Joining Date *</label>
              <input
                type="date"
                name="JoiningDate"
                value={formData.JoiningDate}
                onChange={handleChange}
                required
                disabled={updating}
              />
            </div>

            {/* =================================================
                SALARY
            ================================================= */}
            <div className="teacher-update-group">
              <label>Salary</label>
              <input
                type="number"
                name="Salary"
                value={formData.Salary}
                onChange={handleChange}
                placeholder="Enter salary"
                min="0"
                step="0.01"
                disabled={updating}
              />
            </div>

            {/* =================================================
                ADDRESS
            ================================================= */}
            <div className="teacher-update-group teacher-update-full">
              <label>Address</label>
              <textarea
                name="Address"
                value={formData.Address}
                onChange={handleChange}
                placeholder="Enter residential address"
                rows="3"
                disabled={updating}
              />
            </div>

            {/* =================================================
                EDUCATION PDF RE-UPLOAD & VIEW SECTION
            ================================================= */}
            <div className="teacher-update-group teacher-update-full teacher-pdf-section-card">
              <label className="section-card-title">
                Combined Education Documents (PDF)
              </label>

              <div className="pdf-management-wrapper">
                {formData.EducationPdf ? (
                  <div className="current-pdf-display-card">
                    <div className="pdf-display-left">
                      <span className="pdf-file-icon">📄</span>
                      <div className="pdf-file-details">
                        <span className="pdf-file-name">
                          {formData.EducationFileName ||
                            selectedPdfName ||
                            "Education_Documents.pdf"}
                        </span>
                        <span className="pdf-file-tag">
                          Current Document Attached
                        </span>
                      </div>
                    </div>
                    <div className="pdf-display-actions">
                      <button
                        type="button"
                        className="teacher-view-pdf-btn"
                        onClick={() =>
                          openPdfInNewTab(
                            formData.EducationPdf,
                            `${formData.FirstName} ${formData.LastName} Education Documents`,
                          )
                        }
                      >
                        🔗 View Current PDF (Open in New Tab) ↗
                      </button>
                      <button
                        type="button"
                        className="teacher-remove-btn"
                        onClick={handleRemovePdf}
                      >
                        ✕ Remove PDF
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="no-pdf-notice-box">
                    <span className="notice-icon">📂</span>
                    <span>No educational document currently attached.</span>
                  </div>
                )}

                <div className="reupload-pdf-controls">
                  <label
                    htmlFor="update-teacher-pdf-file"
                    className="pdf-input-label"
                  >
                    {formData.EducationPdf
                      ? "Re-upload / Replace Education PDF:"
                      : "Upload Education PDF:"}
                  </label>
                  <input
                    id="update-teacher-pdf-file"
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handlePdfFileChange}
                    className="teacher-file-input"
                    disabled={updating || pdfProcessing}
                  />
                  {pdfProcessing && (
                    <div className="file-status-indicator processing">
                      ⏳ Processing and encoding PDF document...
                    </div>
                  )}
                  {selectedPdfName && formData.EducationPdf && (
                    <div className="file-status-indicator success">
                      ✓ Ready to save: {selectedPdfName}
                    </div>
                  )}
                  <p className="field-hint">
                    Upload combined certificates and qualification degrees in a
                    single PDF file (Max 15MB).
                  </p>
                </div>
              </div>
            </div>

            {/* =================================================
                CHECKBOXES (CLASS TEACHER & ACTIVE)
            ================================================= */}
            <div className="teacher-update-checkboxes teacher-update-full">
              <div className="teacher-role-badge-display">
                <span className="teacher-role-badge-label">
                  Class Teacher Status:
                </span>
                {formData.IsClassTeacher ? (
                  <span className="teacher-role-pill assigned">
                    🟢 Assigned as Class Teacher (Managed via Class Teacher
                    Allocation)
                  </span>
                ) : (
                  <span className="teacher-role-pill unassigned">
                    ⚪ Not Assigned as Class Teacher
                  </span>
                )}
              </div>

              <label className="checkbox-item">
                <input
                  type="checkbox"
                  name="IsActive"
                  checked={formData.IsActive}
                  onChange={handleChange}
                  disabled={updating}
                />
                <span>
                  Is Active{" "}
                  <small className="checkbox-note">
                    (
                    {formData.IsActive
                      ? "Teacher is currently Active"
                      : "Teacher is marked Inactive"}
                    )
                  </small>
                </span>
              </label>
            </div>

            {/* =================================================
                UPDATE BUTTON
            ================================================= */}
            <div className="teacher-update-actions teacher-update-full">
              <button
                type="submit"
                disabled={updating || departmentLoading}
                className="btn-update-teacher"
              >
                {updating ? "Saving Changes..." : "Update Teacher Profile"}
              </button>
            </div>
          </form>
        )}
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
                <h3>🏢 Assigned Academic Departments</h3>
                <span className="dept-modal-count-badge">
                  {selectedDepartments.length}{" "}
                  {selectedDepartments.length === 1
                    ? "Department"
                    : "Departments"}
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
                Departments currently assigned to this teacher. You can manage
                primary department or remove additional departments below.
              </p>
              <div className="dept-modal-table-wrap">
                <table className="dept-modal-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Department Name</th>
                      <th>Department ID</th>
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

export default UpdateTeacher;
