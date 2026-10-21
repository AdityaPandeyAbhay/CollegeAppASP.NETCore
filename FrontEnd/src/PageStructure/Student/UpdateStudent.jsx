// =====================================================
// UPDATE STUDENT
// UI Aligned with GetAllStudent Filters + Update Teacher
// =====================================================

import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getStudentById,
  getAllStudentsWithDetails,
  getAllStudents,
  updateStudent,
  getStudentDepartmentDropdown,
  getStudentClassDropdown,
  getStudentSectionDropdown,
  openPhotoInNewTab,
  compressImageFile,
  saveStudentRollNumber,
  saveStudentAcademicYear,
  isStudentSoftDeleted,
  restoreStudent,
} from "../../Services/studentService";
import { getAllAcademicYear } from "../../Services/academicYearService";
import { formatFileUrl } from "../../Utils/fileHelper";
import "./UpdateStudent.css";

const initialFormData = {
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
  IsActive: true,
};

const UpdateStudent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formSectionRef = useRef(null);

  // =====================================================
  // FILTER & LIST STATES (MATCHING GET ALL STUDENT)
  // =====================================================
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState(true);

  // Academic Dropdowns for Filter Bar
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [defaultAcademicYearId, setDefaultAcademicYearId] = useState("");
  const [loadingAcademicYears, setLoadingAcademicYears] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);

  // =====================================================
  // SELECTED STUDENT & EDIT FORM STATES
  // =====================================================
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loadedAdmNo, setLoadedAdmNo] = useState("");
  const [studentLoaded, setStudentLoaded] = useState(false);
  const [formData, setFormData] = useState(initialFormData);

  // Form Cascading Dropdowns
  const [formClasses, setFormClasses] = useState([]);
  const [formSections, setFormSections] = useState([]);
  const [loadingFormClasses, setLoadingFormClasses] = useState(false);
  const [loadingFormSections, setLoadingFormSections] = useState(false);

  // Photo processing
  const [photoCompressing, setPhotoCompressing] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState("");

  // Status & UI
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Popup Toast
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

  const showPopup = (type, text) => {
    setPopup({ show: true, type, message: text });
    setTimeout(() => {
      setPopup({ show: false, type: "", message: "" });
    }, 4500);
  };

  const closePopup = () => {
    setPopup({ show: false, type: "", message: "" });
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingList(true);
      setError("");
      await Promise.all([
        loadStudents(),
        loadDepartments(),
        loadAcademicYears(),
      ]);
    } catch (err) {
      const msg = err?.message || "Failed to load initial data.";
      setError(msg);
      showPopup("error", msg);
    } finally {
      setLoadingList(false);
    }
  };

  const loadAcademicYears = async () => {
    try {
      setLoadingAcademicYears(true);
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
    } catch (err) {
      console.warn("Failed to load academic years:", err);
    } finally {
      setLoadingAcademicYears(false);
    }
  };

  const loadStudents = async () => {
    try {
      let data = [];
      try {
        data = await getAllStudentsWithDetails(false);
      } catch (e) {
        data = await getAllStudents(false);
      }
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.message || "Failed to load students.";
      setError(msg);
      showPopup("error", msg);
    }
  };

  const loadDepartments = async () => {
    try {
      setLoadingDepartments(true);
      const data = await getStudentDepartmentDropdown();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load departments:", err);
    } finally {
      setLoadingDepartments(false);
    }
  };

  // =====================================================
  // HANDLE URL QUERY PARAMS (AUTO-LOAD STUDENT)
  // =====================================================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const idParam = params.get("id") || params.get("studentId");
    const admParam =
      params.get("adm") ||
      params.get("admissionNo") ||
      params.get("admissionNumber");

    if (idParam) {
      fetchAndLoadStudent(idParam);
    } else if (admParam) {
      fetchAndLoadStudent(admParam);
    }
  }, [location.search, students.length]);

  // =====================================================
  // FILTER BAR CHANGE HANDLERS
  // =====================================================
  const handleDepartmentChange = async (e) => {
    const deptId = e.target.value;
    setSelectedDepartment(deptId);
    setSelectedClass("");
    setSelectedSection("");
    setClasses([]);
    setSections([]);

    if (!deptId) return;

    try {
      setLoadingClasses(true);
      const data = await getStudentClassDropdown(deptId);
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Load Classes Error:", err);
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleClassChange = async (e) => {
    const classId = e.target.value;
    setSelectedClass(classId);
    setSelectedSection("");
    setSections([]);

    if (!classId) return;

    try {
      setLoadingSections(true);
      const data = await getStudentSectionDropdown(classId);
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Load Sections Error:", err);
    } finally {
      setLoadingSections(false);
    }
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  const handleAcademicYearChange = (e) => {
    setSelectedAcademicYear(e.target.value);
  };

  const handleClearFilters = () => {
    setSelectedAcademicYear("");
    setSelectedDepartment("");
    setSelectedClass("");
    setSelectedSection("");
    setClasses([]);
    setSections([]);
    setSearchTerm("");
  };

  // =====================================================
  // RESOLVE STUDENT ACADEMIC YEAR RECORD
  // =====================================================
  const resolveStudentForYear = (student, yearId) => {
    if (!student) return student;
    const history =
      student.AcademicHistory ||
      student.academicHistory ||
      student.StudentAcademicYears ||
      student.studentAcademicYears;

    if (Array.isArray(history) && history.length > 0 && yearId) {
      const matched = history.find(
        (h) => String(h.AcademicYearId ?? h.academicYearId) === String(yearId),
      );
      if (matched) {
        const isPromotedRecord =
          matched.Status === "Promoted" ||
          matched.status === "Promoted" ||
          Boolean(matched.IsPromoted ?? matched.isPromoted);

        let nextRecord = null;
        if (isPromotedRecord) {
          const otherRecords = history.filter(
            (h) =>
              String(h.AcademicYearId ?? h.academicYearId) !== String(yearId),
          );
          nextRecord =
            otherRecords.find(
              (h) => h.Status === "Active" || h.status === "Active",
            ) || otherRecords[0];
        }

        const nextClassName = nextRecord
          ? (nextRecord.ClassName ??
            nextRecord.className ??
            (nextRecord.SchoolClassId
              ? `Class ${nextRecord.SchoolClassId}`
              : ""))
          : isPromotedRecord &&
              student.ClassName &&
              student.ClassName !== (matched.ClassName ?? matched.className)
            ? student.ClassName
            : null;

        const nextSectionName = nextRecord
          ? (nextRecord.SectionName ??
            nextRecord.sectionName ??
            (nextRecord.SectionId ? `Sec ${nextRecord.SectionId}` : ""))
          : isPromotedRecord &&
              student.SectionName &&
              student.SectionName !==
                (matched.SectionName ?? matched.sectionName)
            ? student.SectionName
            : null;

        const nextYearName = nextRecord
          ? (nextRecord.AcademicYearName ?? nextRecord.academicYearName ?? "")
          : isPromotedRecord &&
              student.AcademicYearName &&
              student.AcademicYearName !==
                (matched.AcademicYearName ?? matched.academicYearName)
            ? student.AcademicYearName
            : "";

        return {
          ...student,
          DepartmentId:
            matched.DepartmentId ??
            matched.departmentId ??
            student.DepartmentId,
          DepartmentName:
            matched.DepartmentName ??
            matched.departmentName ??
            student.DepartmentName,
          SchoolClassId:
            matched.SchoolClassId ??
            matched.schoolClassId ??
            student.SchoolClassId,
          ClassName:
            matched.ClassName ?? matched.className ?? student.ClassName,
          SectionId:
            matched.SectionId ?? matched.sectionId ?? student.SectionId,
          SectionName:
            matched.SectionName ?? matched.sectionName ?? student.SectionName,
          RollNumber:
            matched.RollNumber ?? matched.rollNumber ?? student.RollNumber,
          AcademicYearId:
            matched.AcademicYearId ?? matched.academicYearId ?? yearId,
          AcademicYearName:
            matched.AcademicYearName ??
            matched.academicYearName ??
            student.AcademicYearName,
          Status: isPromotedRecord
            ? "Promoted"
            : (matched.Status ?? matched.status ?? student.Status ?? "Active"),
          IsPromoted: isPromotedRecord,
          PromotedToClassName: nextClassName,
          PromotedToSectionName: nextSectionName,
          PromotedToYearName: nextYearName,
        };
      }
    }
    return student;
  };

  // =====================================================
  // FILTERING LOGIC
  // =====================================================
  const filteredStudents = useMemo(() => {
    const list = [];

    for (const rawStudent of students) {
      const history =
        rawStudent.AcademicHistory ||
        rawStudent.academicHistory ||
        rawStudent.StudentAcademicYears ||
        rawStudent.studentAcademicYears ||
        [];

      let student = rawStudent;

      // 1. Academic Year Filter
      if (selectedAcademicYear) {
        if (Array.isArray(history) && history.length > 0) {
          const matched = history.find(
            (h) =>
              String(h.AcademicYearId ?? h.academicYearId) ===
              String(selectedAcademicYear),
          );
          if (matched) {
            student = resolveStudentForYear(rawStudent, selectedAcademicYear);
          } else {
            const studentYearId = String(
              rawStudent.AcademicYearId || rawStudent.academicYearId || "",
            );
            if (studentYearId !== String(selectedAcademicYear)) {
              continue;
            }
          }
        } else {
          const studentYearId = String(
            rawStudent.AcademicYearId || rawStudent.academicYearId || "",
          );
          if (studentYearId && studentYearId !== String(selectedAcademicYear)) {
            continue;
          }
        }
      } else if (selectedClass || selectedSection || selectedDepartment) {
        if (Array.isArray(history) && history.length > 0) {
          const matchedHistory = history.find((h) => {
            const hDept = String(h.DepartmentId ?? h.departmentId ?? "");
            const hClass = String(h.SchoolClassId ?? h.schoolClassId ?? "");
            const hSec = String(h.SectionId ?? h.sectionId ?? "");

            const matchDept =
              !selectedDepartment || hDept === String(selectedDepartment);
            const matchClass =
              !selectedClass || hClass === String(selectedClass);
            const matchSec =
              !selectedSection || hSec === String(selectedSection);

            return matchDept && matchClass && matchSec;
          });

          if (matchedHistory) {
            student = resolveStudentForYear(
              rawStudent,
              matchedHistory.AcademicYearId ?? matchedHistory.academicYearId,
            );
          }
        }
      }

      // 2. Department Filter
      if (selectedDepartment) {
        const studentDeptId = String(
          student.DepartmentId || student.departmentId || "",
        );
        if (studentDeptId !== String(selectedDepartment)) {
          continue;
        }
      }

      // 3. Class Filter
      if (selectedClass) {
        const studentClassId = String(
          student.SchoolClassId ||
            student.schoolClassId ||
            student.ClassId ||
            student.classId ||
            "",
        );
        if (studentClassId !== String(selectedClass)) {
          continue;
        }
      }

      // 4. Section Filter
      if (selectedSection) {
        const studentSecId = String(
          student.SectionId || student.sectionId || "",
        );
        if (studentSecId !== String(selectedSection)) {
          continue;
        }
      }

      // 5. Search Filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const fullName = [
          student.FirstName,
          student.MiddleName,
          student.LastName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const adm = String(student.AdmissionNumber || "").toLowerCase();
        const roll = String(
          student.RollNumber || student.rollNumber || "",
        ).toLowerCase();
        const father = String(
          student.FatherName || student.fatherName || "",
        ).toLowerCase();
        const mother = String(
          student.MotherName || student.motherName || "",
        ).toLowerCase();
        const email = String(student.Email || "").toLowerCase();
        const phone = String(student.PhoneNumber || "").toLowerCase();
        const className = String(student.ClassName || "").toLowerCase();
        const secName = String(student.SectionName || "").toLowerCase();
        const deptName = String(student.DepartmentName || "").toLowerCase();
        const yearName = String(student.AcademicYearName || "").toLowerCase();

        const matchesSearch =
          fullName.includes(term) ||
          adm.includes(term) ||
          roll.includes(term) ||
          father.includes(term) ||
          mother.includes(term) ||
          email.includes(term) ||
          phone.includes(term) ||
          className.includes(term) ||
          secName.includes(term) ||
          deptName.includes(term) ||
          yearName.includes(term);

        if (!matchesSearch) {
          continue;
        }
      }

      list.push(student);
    }

    return list;
  }, [
    students,
    selectedAcademicYear,
    selectedDepartment,
    selectedClass,
    selectedSection,
    searchTerm,
  ]);

  // =====================================================
  // DATE FORMATTER
  // =====================================================
  const convertDateForInput = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // =====================================================
  // FETCH & POPULATE STUDENT FOR UPDATE
  // =====================================================
  const fetchAndLoadStudent = async (identifier) => {
    if (!identifier || !String(identifier).trim()) {
      const msg = "Please select or search a valid student.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    const cleanId = String(identifier).trim();
    setError("");
    setMessage("");

    try {
      setLoadingStudent(true);

      const queryLower = cleanId.toLowerCase();
      let found = students.find((s) => {
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
        return sId === cleanId || sAdm === queryLower || sRoll === queryLower;
      });

      if (!found) {
        found = await getStudentById(cleanId, true);
      }

      if (!found) {
        throw new Error(`Student with identifier "${cleanId}" not found.`);
      }

      const activeId = found.Id ?? found.id;
      const admNum =
        found.AdmissionNumber ||
        found.admissionNumber ||
        found.AdmissionNo ||
        found.admissionNo ||
        "";
      setSelectedStudentId(activeId);
      setLoadedAdmNo(admNum);

      const sDeptId = found.DepartmentId ?? found.departmentId ?? "";
      const sClassId =
        found.SchoolClassId ??
        found.schoolClassId ??
        found.ClassId ??
        found.classId ??
        "";

      if (sDeptId) {
        try {
          const clsData = await getStudentClassDropdown(sDeptId);
          setFormClasses(Array.isArray(clsData) ? clsData : []);
        } catch {}
      }

      if (sClassId) {
        try {
          const secData = await getStudentSectionDropdown(sClassId);
          setFormSections(Array.isArray(secData) ? secData : []);
        } catch {}
      }

      const isDeleted = isStudentSoftDeleted(found);
      const isActive =
        !isDeleted && Boolean(found.IsActive ?? found.isActive ?? true);

      setFormData({
        AcademicYearId: found.AcademicYearId ?? found.academicYearId ?? "",
        DepartmentId: sDeptId,
        SchoolClassId: sClassId,
        SectionId: found.SectionId ?? found.sectionId ?? "",
        AdmissionNumber: admNum,
        RollNumber:
          found.RollNumber ||
          found.rollNumber ||
          found.RollNo ||
          found.rollNo ||
          "",
        AdmissionDate: convertDateForInput(
          found.AdmissionDate ||
            found.admissionDate ||
            found.CreatedDate ||
            found.createdDate,
        ),
        FirstName: found.FirstName || found.firstName || "",
        MiddleName: found.MiddleName || found.middleName || "",
        LastName: found.LastName || found.lastName || "",
        FatherName: found.FatherName || found.fatherName || "",
        MotherName: found.MotherName || found.motherName || "",
        DOB: convertDateForInput(found.DOB || found.dob || found.DateOfBirth),
        Gender: found.Gender || found.gender || "",
        BloodGroup: found.BloodGroup || found.bloodGroup || "",
        Photo: found.Photo || found.photo || "",
        AadhaarNumber:
          found.AadhaarNumber ||
          found.aadhaarNumber ||
          found.AadharNumber ||
          found.aadharNumber ||
          "",
        Religion: found.Religion || found.religion || "",
        Category: found.Category || found.category || "",
        Nationality: found.Nationality || found.nationality || "Indian",
        Email: found.Email || found.email || "",
        PhoneNumber:
          found.PhoneNumber ||
          found.phoneNumber ||
          found.Phone ||
          found.phone ||
          "",
        AlternatePhoneNumber:
          found.AlternatePhoneNumber ||
          found.alternatePhoneNumber ||
          found.AlternatePhone ||
          found.alternatePhone ||
          "",
        Address: found.Address || found.address || "",
        IsActive: isActive,
      });

      setStudentLoaded(true);
      const sName = [found.FirstName, found.LastName].filter(Boolean).join(" ");
      const successMsg = `Loaded record for ${sName || admNum || `ID #${activeId}`}.`;
      setMessage(successMsg);
      showPopup("success", successMsg);

      // Smooth scroll to the form section
      setTimeout(() => {
        if (formSectionRef.current) {
          formSectionRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } catch (err) {
      const errMsg = err?.message || "Failed to load student.";
      setError(errMsg);
      showPopup("error", errMsg);
      setStudentLoaded(false);
    } finally {
      setLoadingStudent(false);
    }
  };

  // =====================================================
  // PHOTO HANDLERS
  // =====================================================
  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
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
    const input = document.getElementById("update-student-photo-file");
    if (input) input.value = "";
    showPopup("info", "Photograph removed.");
  };

  // =====================================================
  // FORM CHANGE & CASCADING DROPDOWNS
  // =====================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFormDepartmentChange = async (e) => {
    const deptId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      DepartmentId: deptId,
      SchoolClassId: "",
      SectionId: "",
    }));
    setFormClasses([]);
    setFormSections([]);

    if (!deptId) return;

    try {
      setLoadingFormClasses(true);
      const data = await getStudentClassDropdown(deptId);
      setFormClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Form Classes Load Error:", err);
    } finally {
      setLoadingFormClasses(false);
    }
  };

  const handleFormClassChange = async (e) => {
    const classId = e.target.value;
    setFormData((prev) => ({
      ...prev,
      SchoolClassId: classId,
      SectionId: "",
    }));
    setFormSections([]);

    if (!classId) return;

    try {
      setLoadingFormSections(true);
      const data = await getStudentSectionDropdown(classId);
      setFormSections(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Form Sections Load Error:", err);
    } finally {
      setLoadingFormSections(false);
    }
  };

  // =====================================================
  // FORM SUBMISSION (UPDATE)
  // =====================================================
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedStudentId) {
      setError("Please select a student record to update.");
      return;
    }

    if (!formData.FirstName.trim()) {
      setError("First Name is required.");
      showPopup("error", "First Name is required.");
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const payload = {
        Id: selectedStudentId,
        AcademicYearId: formData.AcademicYearId
          ? Number(formData.AcademicYearId)
          : null,
        DepartmentId: formData.DepartmentId
          ? Number(formData.DepartmentId)
          : null,
        SchoolClassId: formData.SchoolClassId
          ? Number(formData.SchoolClassId)
          : null,
        SectionId: formData.SectionId ? Number(formData.SectionId) : null,
        AdmissionNumber: formData.AdmissionNumber.trim(),
        RollNumber: formData.RollNumber.trim(),
        AdmissionDate: formData.AdmissionDate || null,
        FirstName: formData.FirstName.trim(),
        MiddleName: formData.MiddleName ? formData.MiddleName.trim() : "",
        LastName: formData.LastName ? formData.LastName.trim() : "",
        FatherName: formData.FatherName ? formData.FatherName.trim() : "",
        MotherName: formData.MotherName ? formData.MotherName.trim() : "",
        DOB: formData.DOB || null,
        Gender: formData.Gender || "",
        BloodGroup: formData.BloodGroup || "",
        Photo: formData.Photo || "",
        AadhaarNumber: formData.AadhaarNumber
          ? formData.AadhaarNumber.trim()
          : "",
        Religion: formData.Religion ? formData.Religion.trim() : "",
        Category: formData.Category ? formData.Category.trim() : "",
        Nationality: formData.Nationality
          ? formData.Nationality.trim()
          : "Indian",
        Email: formData.Email ? formData.Email.trim() : "",
        PhoneNumber: formData.PhoneNumber ? formData.PhoneNumber.trim() : "",
        AlternatePhoneNumber: formData.AlternatePhoneNumber
          ? formData.AlternatePhoneNumber.trim()
          : "",
        Address: formData.Address ? formData.Address.trim() : "",
        IsActive: formData.IsActive,
      };

      await updateStudent(selectedStudentId, payload);

      if (payload.IsActive) {
        restoreStudent(selectedStudentId);
        if (payload.AdmissionNumber) restoreStudent(payload.AdmissionNumber);
      }

      if (payload.RollNumber) {
        saveStudentRollNumber(selectedStudentId, payload.RollNumber);
      }
      if (payload.AcademicYearId) {
        saveStudentAcademicYear(selectedStudentId, payload.AcademicYearId);
      }

      const successMsg = `Student "${payload.FirstName} ${payload.LastName}" updated successfully.`;
      setMessage(successMsg);
      showPopup("success", successMsg);

      // Refresh list in memory
      await loadStudents();
    } catch (err) {
      console.error("Student Update Error:", err);
      const errMsg = err?.message || "Failed to update student profile.";
      setError(errMsg);
      showPopup("error", errMsg);
    } finally {
      setUpdating(false);
    }
  };

  const getFullName = (s) => {
    return [s.FirstName, s.MiddleName, s.LastName].filter(Boolean).join(" ");
  };

  return (
    <div className="student-update-page">
      {/* Toast Popup */}
      {popup.show && (
        <div
          className={`student-update-popup student-update-popup-${popup.type}`}
        >
          <div className="student-update-popup-icon">
            {popup.type === "success"
              ? "✓"
              : popup.type === "error"
                ? "✕"
                : "ℹ"}
          </div>
          <div className="student-update-popup-content">
            <strong>
              {popup.type === "success"
                ? "Success"
                : popup.type === "error"
                  ? "Error"
                  : "Notice"}
            </strong>
            <span>{popup.message}</span>
          </div>
          <button
            type="button"
            className="student-update-popup-close"
            onClick={closePopup}
          >
            ×
          </button>
        </div>
      )}

      <div className="student-update-container">
        {/* ================= HEADER ================= */}
        <div className="student-update-header">
          <h1>Update Student Profile</h1>
          <p>
            Filter or search students below, select a student to load their
            details, and edit their profile.
          </p>
        </div>

        {/* ================= ACADEMIC FILTER BAR (MATCHING GET ALL STUDENT) ================= */}
        <div className="student-filter-bar-card">
          <div className="student-filter-grid">
            {/* ACADEMIC YEAR */}
            <div className="student-filter-group">
              <label htmlFor="filter-academic-year">Academic Year:</label>
              <select
                id="filter-academic-year"
                value={selectedAcademicYear}
                onChange={handleAcademicYearChange}
                disabled={loadingAcademicYears}
              >
                <option value="">All Academic Years</option>
                {academicYears.map((ay) => {
                  const yId = String(ay.Id ?? ay.id);
                  const yName =
                    ay.YearName ??
                    ay.yearName ??
                    ay.AcademicYearName ??
                    ay.academicYearName ??
                    `Year #${yId}`;
                  const isCurrent = yId === String(defaultAcademicYearId);
                  return (
                    <option key={yId} value={yId}>
                      {yName}
                      {isCurrent ? " (Current)" : ""}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* DEPARTMENT */}
            <div className="student-filter-group">
              <label htmlFor="filter-department">Department:</label>
              <select
                id="filter-department"
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                disabled={loadingDepartments}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => {
                  const dId = dept.id ?? dept.Id ?? dept.code ?? dept.Code;
                  const dName =
                    dept.text ??
                    dept.Text ??
                    dept.name ??
                    dept.Name ??
                    `Dept ${dId}`;
                  return (
                    <option key={dId} value={dId}>
                      {dName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* CLASS */}
            <div className="student-filter-group">
              <label htmlFor="filter-class">Class:</label>
              <select
                id="filter-class"
                value={selectedClass}
                onChange={handleClassChange}
                disabled={!selectedDepartment || loadingClasses}
              >
                <option value="">
                  {!selectedDepartment
                    ? "All Classes (Select Dept first)"
                    : "All Classes"}
                </option>
                {classes.map((cls) => {
                  const cId = cls.id ?? cls.Id;
                  const cName =
                    cls.text ??
                    cls.Text ??
                    cls.name ??
                    cls.className ??
                    cls.ClassName ??
                    `Class ${cId}`;
                  return (
                    <option key={cId} value={cId}>
                      {cName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* SECTION */}
            <div className="student-filter-group">
              <label htmlFor="filter-section">Section:</label>
              <select
                id="filter-section"
                value={selectedSection}
                onChange={handleSectionChange}
                disabled={!selectedClass || loadingSections}
              >
                <option value="">
                  {!selectedClass
                    ? "All Sections (Select Class first)"
                    : "All Sections"}
                </option>
                {sections.map((sec) => {
                  const sId = sec.id ?? sec.Id;
                  const sName =
                    sec.text ??
                    sec.Text ??
                    sec.name ??
                    sec.sectionName ??
                    sec.SectionName ??
                    `Sec ${sId}`;
                  return (
                    <option key={sId} value={sId}>
                      {sName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {(selectedAcademicYear ||
            selectedDepartment ||
            selectedClass ||
            selectedSection ||
            searchTerm) && (
            <div className="student-filter-actions">
              <button
                type="button"
                className="student-reset-filter-btn"
                onClick={handleClearFilters}
              >
                ✕ Reset Filters
              </button>
            </div>
          )}
        </div>

        {/* ================= SEARCH BOX ================= */}
        <div className="student-search-box">
          <input
            type="text"
            placeholder="Search by admission number, roll no, name, father/mother name, class, section, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* ================= ERROR ================= */}
        {error && <div className="student-update-message error">{error}</div>}
        {message && (
          <div className="student-update-message success">{message}</div>
        )}

        {/* ================= FILTERED STUDENTS TABLE ================= */}
        <div className="student-selection-list-section">
          <div className="selection-list-header">
            <h3>Matching Students ({filteredStudents.length})</h3>
            <span className="selection-list-hint">
              Click &quot;Select &amp; Edit&quot; on any student to open the
              update form below
            </span>
          </div>

          {loadingList ? (
            <div className="student-loading">Loading students...</div>
          ) : filteredStudents.length === 0 ? (
            <div className="student-empty">
              {searchTerm ||
              selectedDepartment ||
              selectedClass ||
              selectedSection ||
              selectedAcademicYear
                ? "No students match your filter criteria."
                : "No students registered yet."}
            </div>
          ) : (
            <div className="student-table-wrapper">
              <table className="student-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Photo</th>
                    <th>Admission No.</th>
                    <th>Roll No.</th>
                    <th>Student Name</th>
                    <th>Class &amp; Section</th>
                    <th>Academic Year</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((stu, index) => {
                    const fullName = getFullName(stu) || "Student";
                    const isDeleted = isStudentSoftDeleted(stu);
                    const isPromoted =
                      stu.IsPromoted === true ||
                      stu.isPromoted === true ||
                      String(stu.Status || stu.status || "").toLowerCase() ===
                        "promoted";

                    const isActive =
                      !isDeleted &&
                      !isPromoted &&
                      Boolean(stu.IsActive ?? stu.isActive ?? true) &&
                      String(
                        stu.Status || stu.status || "active",
                      ).toLowerCase() !== "inactive";

                    const statusText = isPromoted
                      ? "Promoted"
                      : isActive
                        ? "Active"
                        : "Inactive";
                    const statusClass = isPromoted
                      ? "promoted"
                      : isActive
                        ? "active"
                        : "inactive";

                    const admNo =
                      stu.AdmissionNumber ||
                      stu.admissionNumber ||
                      stu.AdmissionNo ||
                      stu.admissionNo ||
                      "-";
                    const rollNo =
                      stu.RollNumber ||
                      stu.rollNumber ||
                      stu.RollNo ||
                      stu.rollNo ||
                      "-";
                    const className =
                      stu.ClassName ||
                      stu.className ||
                      (stu.SchoolClassId || stu.schoolClassId
                        ? `Class ${stu.SchoolClassId || stu.schoolClassId}`
                        : "-");
                    const secName =
                      stu.SectionName ||
                      stu.sectionName ||
                      (stu.SectionId || stu.sectionId
                        ? `Sec ${stu.SectionId || stu.sectionId}`
                        : "");
                    const classSec = secName
                      ? `${className} - ${secName}`
                      : className;
                    const yearName =
                      stu.AcademicYearName ||
                      stu.academicYearName ||
                      (stu.AcademicYearId || stu.academicYearId
                        ? `Year ${stu.AcademicYearId || stu.academicYearId}`
                        : "-");
                    const photo = stu.Photo || stu.photo;
                    const isSelected =
                      String(selectedStudentId) === String(stu.Id ?? stu.id);

                    return (
                      <tr
                        key={stu.Id ?? stu.id ?? admNo ?? index}
                        className={isSelected ? "selected-student-row" : ""}
                      >
                        <td>{index + 1}</td>
                        <td>
                          {photo ? (
                            <img
                              src={photo}
                              alt={fullName}
                              className="student-avatar-thumb"
                              onClick={() => openPhotoInNewTab(photo, fullName)}
                              title="Click to view full photo in new tab"
                            />
                          ) : (
                            <div className="student-avatar-placeholder">👤</div>
                          )}
                        </td>
                        <td>
                          <strong className="adm-badge">{admNo}</strong>
                        </td>
                        <td>{rollNo}</td>
                        <td>
                          <span className="student-name-text">{fullName}</span>
                        </td>
                        <td>
                          <span className="class-badge">{classSec}</span>
                        </td>
                        <td>{yearName}</td>
                        <td>
                          <span className={`student-status ${statusClass}`}>
                            {statusText}
                          </span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className={`student-row-select-btn ${
                              isSelected ? "btn-active-selection" : ""
                            }`}
                            onClick={() =>
                              fetchAndLoadStudent(stu.Id ?? stu.id)
                            }
                            disabled={loadingStudent}
                          >
                            {isSelected ? "✓ Selected" : "✏️ Select & Edit"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ================= EDIT FORM SECTION ================= */}
        {studentLoaded && (
          <div
            ref={formSectionRef}
            id="student-update-form-section"
            className="student-update-form-container"
          >
            <form className="student-update-form" onSubmit={handleUpdate}>
              {/* Summary Banner */}
              <div className="student-profile-summary-banner student-update-full">
                <div className="summary-left">
                  <span className="summary-title">Editing Student Profile</span>
                  <span className="summary-code-tag">
                    Adm No: <strong>{loadedAdmNo || "N/A"}</strong>
                  </span>
                  <span className="summary-code-tag">
                    ID: <strong>#{selectedStudentId}</strong>
                  </span>
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

              {/* Photo Section Card */}
              <div className="student-update-group student-update-full student-photo-section-card">
                <label className="section-card-title">Student Photograph</label>
                <div className="student-photo-management-row">
                  <div className="current-photo-container">
                    {formData.Photo ? (
                      <div className="photo-display-box">
                        <img
                          src={formatFileUrl(formData.Photo)}
                          alt="Student"
                          className="student-current-photo-img"
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
                            className="student-preview-btn"
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
                            className="student-remove-btn"
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

                  <div className="photo-upload-controls-box">
                    <p className="photo-upload-hint">
                      Upload a clean, passport-sized photograph (JPG, PNG,
                      WebP). Images will be automatically optimized.
                    </p>
                    <div className="photo-file-input-wrapper">
                      <input
                        type="file"
                        id="update-student-photo-file"
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        disabled={photoCompressing || updating}
                        className="photo-file-input"
                      />
                      <label
                        htmlFor="update-student-photo-file"
                        className="photo-file-label"
                      >
                        {photoCompressing
                          ? "⏳ Processing & Compressing..."
                          : formData.Photo
                            ? "📁 Replace Photo..."
                            : "📁 Choose Photograph..."}
                      </label>
                      {selectedPhotoName && (
                        <span className="selected-photo-filename">
                          📎 {selectedPhotoName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Section: Personal Information */}
              <div className="form-section-divider student-update-full">
                <span>Personal Information</span>
              </div>

              {/* Admission Number */}
              <div className="student-update-group">
                <label>
                  Admission Number <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="AdmissionNumber"
                  value={formData.AdmissionNumber}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Roll Number */}
              <div className="student-update-group">
                <label>Roll Number</label>
                <input
                  type="text"
                  name="RollNumber"
                  value={formData.RollNumber}
                  onChange={handleChange}
                />
              </div>

              {/* Admission Date */}
              <div className="student-update-group">
                <label>Admission Date</label>
                <input
                  type="date"
                  name="AdmissionDate"
                  value={formData.AdmissionDate}
                  onChange={handleChange}
                />
              </div>

              {/* First Name */}
              <div className="student-update-group">
                <label>
                  First Name <span className="required-star">*</span>
                </label>
                <input
                  type="text"
                  name="FirstName"
                  value={formData.FirstName}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Middle Name */}
              <div className="student-update-group">
                <label>Middle Name</label>
                <input
                  type="text"
                  name="MiddleName"
                  value={formData.MiddleName}
                  onChange={handleChange}
                />
              </div>

              {/* Last Name */}
              <div className="student-update-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="LastName"
                  value={formData.LastName}
                  onChange={handleChange}
                />
              </div>

              {/* DOB */}
              <div className="student-update-group">
                <label>Date of Birth</label>
                <input
                  type="date"
                  name="DOB"
                  value={formData.DOB}
                  onChange={handleChange}
                />
              </div>

              {/* Gender */}
              <div className="student-update-group">
                <label>Gender</label>
                <select
                  name="Gender"
                  value={formData.Gender}
                  onChange={handleChange}
                >
                  <option value="">-- Select Gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Blood Group */}
              <div className="student-update-group">
                <label>Blood Group</label>
                <select
                  name="BloodGroup"
                  value={formData.BloodGroup}
                  onChange={handleChange}
                >
                  <option value="">-- Select Blood Group --</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                </select>
              </div>

              {/* Aadhaar Number */}
              <div className="student-update-group">
                <label>Aadhaar / National ID</label>
                <input
                  type="text"
                  name="AadhaarNumber"
                  value={formData.AadhaarNumber}
                  onChange={handleChange}
                  maxLength={16}
                />
              </div>

              {/* Religion */}
              <div className="student-update-group">
                <label>Religion</label>
                <input
                  type="text"
                  name="Religion"
                  value={formData.Religion}
                  onChange={handleChange}
                />
              </div>

              {/* Category */}
              <div className="student-update-group">
                <label>Category / Caste</label>
                <select
                  name="Category"
                  value={formData.Category}
                  onChange={handleChange}
                >
                  <option value="">-- Select Category --</option>
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>

              {/* Nationality */}
              <div className="student-update-group">
                <label>Nationality</label>
                <input
                  type="text"
                  name="Nationality"
                  value={formData.Nationality}
                  onChange={handleChange}
                />
              </div>

              {/* Section: Academic Allocation */}
              <div className="form-section-divider student-update-full">
                <span>Academic Details</span>
              </div>

              {/* Academic Year */}
              <div className="student-update-group">
                <label>Academic Year</label>
                <select
                  name="AcademicYearId"
                  value={formData.AcademicYearId}
                  onChange={handleChange}
                >
                  <option value="">-- Select Academic Year --</option>
                  {academicYears.map((ay) => {
                    const yId = String(ay.Id ?? ay.id);
                    const yName =
                      ay.YearName ??
                      ay.yearName ??
                      ay.AcademicYearName ??
                      ay.academicYearName ??
                      `Year #${yId}`;
                    return (
                      <option key={yId} value={yId}>
                        {yName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Department */}
              <div className="student-update-group">
                <label>Department</label>
                <select
                  name="DepartmentId"
                  value={formData.DepartmentId}
                  onChange={handleFormDepartmentChange}
                >
                  <option value="">-- Select Department --</option>
                  {departments.map((d) => {
                    const dId = d.id ?? d.Id ?? d.code ?? d.Code;
                    const dName =
                      d.text ?? d.Text ?? d.name ?? d.Name ?? `Dept ${dId}`;
                    return (
                      <option key={dId} value={dId}>
                        {dName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Class */}
              <div className="student-update-group">
                <label>Class</label>
                <select
                  name="SchoolClassId"
                  value={formData.SchoolClassId}
                  onChange={handleFormClassChange}
                  disabled={!formData.DepartmentId || loadingFormClasses}
                >
                  <option value="">
                    {!formData.DepartmentId
                      ? "-- Select Department First --"
                      : loadingFormClasses
                        ? "Loading Classes..."
                        : "-- Select Class --"}
                  </option>
                  {formClasses.map((c) => {
                    const cId = c.id ?? c.Id ?? c.code ?? c.Code;
                    const cName =
                      c.text ??
                      c.Text ??
                      c.className ??
                      c.ClassName ??
                      c.name ??
                      `Class ${cId}`;
                    return (
                      <option key={cId} value={cId}>
                        {cName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Section */}
              <div className="student-update-group">
                <label>Section</label>
                <select
                  name="SectionId"
                  value={formData.SectionId}
                  onChange={handleChange}
                  disabled={!formData.SchoolClassId || loadingFormSections}
                >
                  <option value="">
                    {!formData.SchoolClassId
                      ? "-- Select Class First --"
                      : loadingFormSections
                        ? "Loading Sections..."
                        : "-- Select Section --"}
                  </option>
                  {formSections.map((sec) => {
                    const sId = sec.id ?? sec.Id ?? sec.code ?? sec.Code;
                    const sName =
                      sec.text ??
                      sec.Text ??
                      sec.sectionName ??
                      sec.SectionName ??
                      sec.name ??
                      `Section ${sId}`;
                    return (
                      <option key={sId} value={sId}>
                        {sName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Section: Parents & Guardian */}
              <div className="form-section-divider student-update-full">
                <span>Parents &amp; Guardian Information</span>
              </div>

              {/* Father Name */}
              <div className="student-update-group">
                <label>Father&apos;s Name</label>
                <input
                  type="text"
                  name="FatherName"
                  value={formData.FatherName}
                  onChange={handleChange}
                />
              </div>

              {/* Mother Name */}
              <div className="student-update-group">
                <label>Mother&apos;s Name</label>
                <input
                  type="text"
                  name="MotherName"
                  value={formData.MotherName}
                  onChange={handleChange}
                />
              </div>

              {/* Section: Contact & Communication */}
              <div className="form-section-divider student-update-full">
                <span>Contact &amp; Address</span>
              </div>

              {/* Email */}
              <div className="student-update-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                />
              </div>

              {/* Phone */}
              <div className="student-update-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  name="PhoneNumber"
                  value={formData.PhoneNumber}
                  onChange={handleChange}
                />
              </div>

              {/* Alternate Phone */}
              <div className="student-update-group">
                <label>Alternate / Guardian Phone</label>
                <input
                  type="tel"
                  name="AlternatePhoneNumber"
                  value={formData.AlternatePhoneNumber}
                  onChange={handleChange}
                />
              </div>

              {/* Address */}
              <div className="student-update-group student-update-full">
                <label>Residential Address</label>
                <textarea
                  name="Address"
                  value={formData.Address}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              {/* Status Toggle */}
              <div className="student-update-group student-update-full student-update-checkbox-group">
                <label className="checkbox-toggle-container">
                  <input
                    type="checkbox"
                    name="IsActive"
                    checked={formData.IsActive}
                    onChange={handleChange}
                  />
                  <span className="checkbox-toggle-label">
                    Active Student Account (Enable for attendance, exams, fees
                    &amp; dashboard access)
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="student-update-buttons student-update-full">
                <button
                  type="button"
                  className="student-update-cancel-btn"
                  onClick={() => {
                    setStudentLoaded(false);
                    setSelectedStudentId(null);
                    setFormData(initialFormData);
                  }}
                  disabled={updating}
                >
                  ✕ Close Form
                </button>
                <button
                  type="submit"
                  className="student-update-submit-btn"
                  disabled={updating || photoCompressing}
                >
                  {updating
                    ? "💾 Saving Changes..."
                    : "💾 Update Student Profile"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateStudent;
