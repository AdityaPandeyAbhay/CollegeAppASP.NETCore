// =====================================================
// DELETE STUDENT
// UI Aligned with GetAllStudent Filters + Delete Teacher
// =====================================================

import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import {
  getStudentById,
  getAllStudentsWithDetails,
  getAllStudents,
  deleteStudent,
  getAcademicMaps,
  enrichStudent,
  getStudentDepartmentDropdown,
  getStudentClassDropdown,
  getStudentSectionDropdown,
  openPhotoInNewTab,
  isStudentSoftDeleted,
} from "../../Services/studentService";
import { getAllAcademicYear } from "../../Services/academicYearService";
import { formatFileUrl } from "../../Utils/fileHelper";
import "./DeleteStudent.css";

const DeleteStudent = () => {
  const location = useLocation();
  const deleteCardRef = useRef(null);

  // ===================================================
  // FILTER & LIST STATES (MATCHING GET ALL STUDENT)
  // ===================================================
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

  // ===================================================
  // SELECTED STUDENT & DELETION STATES
  // ===================================================
  const [student, setStudent] = useState(null);
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [loadingStudent, setLoadingStudent] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Messages & Toast
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
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
  // INITIAL LOAD
  // ===================================================
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

  // ===================================================
  // HANDLE URL QUERY PARAMS
  // ===================================================
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

  // ===================================================
  // FILTER BAR CHANGE HANDLERS
  // ===================================================
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

  // ===================================================
  // RESOLVE STUDENT ACADEMIC YEAR RECORD
  // ===================================================
  const resolveStudentForYear = (stu, yearId) => {
    if (!stu) return stu;
    const history =
      stu.AcademicHistory ||
      stu.academicHistory ||
      stu.StudentAcademicYears ||
      stu.studentAcademicYears;

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
              stu.ClassName &&
              stu.ClassName !== (matched.ClassName ?? matched.className)
            ? stu.ClassName
            : null;

        const nextSectionName = nextRecord
          ? (nextRecord.SectionName ??
            nextRecord.sectionName ??
            (nextRecord.SectionId ? `Sec ${nextRecord.SectionId}` : ""))
          : isPromotedRecord &&
              stu.SectionName &&
              stu.SectionName !== (matched.SectionName ?? matched.sectionName)
            ? stu.SectionName
            : null;

        const nextYearName = nextRecord
          ? (nextRecord.AcademicYearName ?? nextRecord.academicYearName ?? "")
          : isPromotedRecord &&
              stu.AcademicYearName &&
              stu.AcademicYearName !==
                (matched.AcademicYearName ?? matched.academicYearName)
            ? stu.AcademicYearName
            : "";

        return {
          ...stu,
          DepartmentId:
            matched.DepartmentId ?? matched.departmentId ?? stu.DepartmentId,
          DepartmentName:
            matched.DepartmentName ??
            matched.departmentName ??
            stu.DepartmentName,
          SchoolClassId:
            matched.SchoolClassId ?? matched.schoolClassId ?? stu.SchoolClassId,
          ClassName: matched.ClassName ?? matched.className ?? stu.ClassName,
          SectionId: matched.SectionId ?? matched.sectionId ?? stu.SectionId,
          SectionName:
            matched.SectionName ?? matched.sectionName ?? stu.SectionName,
          RollNumber:
            matched.RollNumber ?? matched.rollNumber ?? stu.RollNumber,
          AcademicYearId:
            matched.AcademicYearId ?? matched.academicYearId ?? yearId,
          AcademicYearName:
            matched.AcademicYearName ??
            matched.academicYearName ??
            stu.AcademicYearName,
          Status: isPromotedRecord
            ? "Promoted"
            : (matched.Status ?? matched.status ?? stu.Status ?? "Active"),
          IsPromoted: isPromotedRecord,
          PromotedToClassName: nextClassName,
          PromotedToSectionName: nextSectionName,
          PromotedToYearName: nextYearName,
        };
      }
    }
    return stu;
  };

  // ===================================================
  // FILTERING LOGIC
  // ===================================================
  const filteredStudents = useMemo(() => {
    const list = [];

    for (const rawStudent of students) {
      const history =
        rawStudent.AcademicHistory ||
        rawStudent.academicHistory ||
        rawStudent.StudentAcademicYears ||
        rawStudent.studentAcademicYears ||
        [];

      let stu = rawStudent;

      // 1. Academic Year Filter
      if (selectedAcademicYear) {
        if (Array.isArray(history) && history.length > 0) {
          const matched = history.find(
            (h) =>
              String(h.AcademicYearId ?? h.academicYearId) ===
              String(selectedAcademicYear),
          );
          if (matched) {
            stu = resolveStudentForYear(rawStudent, selectedAcademicYear);
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
            stu = resolveStudentForYear(
              rawStudent,
              matchedHistory.AcademicYearId ?? matchedHistory.academicYearId,
            );
          }
        }
      }

      // 2. Department Filter
      if (selectedDepartment) {
        const studentDeptId = String(
          stu.DepartmentId || stu.departmentId || "",
        );
        if (studentDeptId !== String(selectedDepartment)) {
          continue;
        }
      }

      // 3. Class Filter
      if (selectedClass) {
        const studentClassId = String(
          stu.SchoolClassId ||
            stu.schoolClassId ||
            stu.ClassId ||
            stu.classId ||
            "",
        );
        if (studentClassId !== String(selectedClass)) {
          continue;
        }
      }

      // 4. Section Filter
      if (selectedSection) {
        const studentSecId = String(stu.SectionId || stu.sectionId || "");
        if (studentSecId !== String(selectedSection)) {
          continue;
        }
      }

      // 5. Search Filter
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase().trim();
        const fullName = [stu.FirstName, stu.MiddleName, stu.LastName]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const adm = String(stu.AdmissionNumber || "").toLowerCase();
        const roll = String(
          stu.RollNumber || stu.rollNumber || "",
        ).toLowerCase();
        const father = String(
          stu.FatherName || stu.fatherName || "",
        ).toLowerCase();
        const mother = String(
          stu.MotherName || stu.motherName || "",
        ).toLowerCase();
        const email = String(stu.Email || "").toLowerCase();
        const phone = String(stu.PhoneNumber || "").toLowerCase();
        const className = String(stu.ClassName || "").toLowerCase();
        const secName = String(stu.SectionName || "").toLowerCase();
        const deptName = String(stu.DepartmentName || "").toLowerCase();
        const yearName = String(stu.AcademicYearName || "").toLowerCase();

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

      list.push(stu);
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

  // ===================================================
  // FETCH AND LOAD STUDENT
  // ===================================================
  const fetchAndLoadStudent = async (idToLoad) => {
    setMessage("");
    setError("");

    if (!idToLoad || !String(idToLoad).trim()) {
      const msg =
        "Please enter or select a valid Student ID or Admission Number.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    try {
      setLoadingStudent(true);

      let targetId = String(idToLoad).trim();

      const matchedByAdm = students.find(
        (s) =>
          String(s.AdmissionNumber || "").toLowerCase() ===
          targetId.toLowerCase(),
      );
      if (matchedByAdm) {
        targetId = String(matchedByAdm.Id ?? matchedByAdm.id);
      }

      const [rawData, maps] = await Promise.all([
        getStudentById(targetId, false),
        getAcademicMaps().catch(() => ({})),
      ]);

      if (!rawData || isStudentSoftDeleted(rawData)) {
        throw new Error("Student not found or has been deleted.");
      }

      const enriched = enrichStudent(rawData, maps);

      const loadedObj = {
        ...enriched,
        IsActive: enriched.IsActive ?? true,
      };

      setStudent(loadedObj);
      setSelectedStudentId(String(enriched.Id));

      const sName = [enriched.FirstName, enriched.LastName]
        .filter(Boolean)
        .join(" ");
      const successMsg = `Student "${sName || enriched.AdmissionNumber || enriched.Id}" selected for deletion review.`;
      setMessage(successMsg);
      showPopup("success", successMsg);

      // Smooth scroll down to deletion card
      setTimeout(() => {
        if (deleteCardRef.current) {
          deleteCardRef.current.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }, 100);
    } catch (err) {
      const errMsg = err?.message || "Student not found.";
      setError(errMsg);
      showPopup("error", errMsg);
      setStudent(null);
      setSelectedStudentId(null);
    } finally {
      setLoadingStudent(false);
    }
  };

  // ===================================================
  // DELETE ACTIONS
  // ===================================================
  const handleOpenConfirm = () => {
    if (!student) {
      const msg = "Please select a student from the list first.";
      setError(msg);
      showPopup("error", msg);
      return;
    }
    setError("");
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!student) return;

    const studentName =
      [student.FirstName, student.MiddleName, student.LastName]
        .filter(Boolean)
        .join(" ") ||
      student.AdmissionNumber ||
      `ID #${student.Id}`;

    try {
      setDeleting(true);

      await deleteStudent(student.Id, student);

      setShowConfirmModal(false);

      const successMsg = `Student "${studentName}" deleted successfully (Marked Inactive / Soft Deleted).`;
      setMessage(successMsg);
      showPopup("success", successMsg);

      setStudent(null);
      setSelectedStudentId(null);

      // Refresh student list
      await loadStudents();
    } catch (err) {
      const errMsg = err?.message || "Failed to delete student.";
      setError(errMsg);
      showPopup("error", errMsg);
    } finally {
      setDeleting(false);
    }
  };

  const fullName = student
    ? [student.FirstName, student.MiddleName, student.LastName]
        .filter(Boolean)
        .join(" ") || "Student Details"
    : "-";

  const getStudentFullName = (s) => {
    return [s.FirstName, s.MiddleName, s.LastName].filter(Boolean).join(" ");
  };

  return (
    <div className="student-delete-page">
      {/* ================= TOAST POPUP ================= */}
      {popup.show && (
        <div
          className={`student-delete-popup student-delete-popup-${popup.type}`}
        >
          <div className="student-delete-popup-icon">
            {popup.type === "success" ? "✓" : "!"}
          </div>
          <div className="student-delete-popup-content">
            <strong>{popup.type === "success" ? "Success" : "Error"}</strong>
            <span>{popup.message}</span>
          </div>
          <button
            type="button"
            className="student-delete-popup-close"
            onClick={closePopup}
          >
            ×
          </button>
        </div>
      )}

      <div className="student-delete-container">
        {/* ================= HEADER ================= */}
        <div className="student-delete-header">
          <h1>Delete Student Record</h1>
          <p>
            Filter or search students below, select a student to review their
            complete profile, and proceed with soft deletion.
          </p>
        </div>

        {/* ================= ACADEMIC FILTER BAR (MATCHING GET ALL STUDENT) ================= */}
        <div className="student-filter-bar-card">
          <div className="student-filter-grid">
            {/* ACADEMIC YEAR */}
            <div className="student-filter-group">
              <label htmlFor="delete-filter-academic-year">
                Academic Year:
              </label>
              <select
                id="delete-filter-academic-year"
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
              <label htmlFor="delete-filter-department">Department:</label>
              <select
                id="delete-filter-department"
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
              <label htmlFor="delete-filter-class">Class:</label>
              <select
                id="delete-filter-class"
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
              <label htmlFor="delete-filter-section">Section:</label>
              <select
                id="delete-filter-section"
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

        {/* ================= IN-PAGE MESSAGES ================= */}
        {message && (
          <div className="student-delete-message success">{message}</div>
        )}
        {error && <div className="student-delete-message error">{error}</div>}

        {/* ================= FILTERED STUDENTS TABLE ================= */}
        <div className="student-selection-list-section">
          <div className="selection-list-header">
            <h3>Matching Students ({filteredStudents.length})</h3>
            <span className="selection-list-hint">
              Click &quot;Select for Deletion&quot; on any student to review
              their deletion profile
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
                    const sFullName = getStudentFullName(stu) || "Student";
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
                              alt={sFullName}
                              className="student-avatar-thumb"
                              onClick={() =>
                                openPhotoInNewTab(photo, sFullName)
                              }
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
                          <span className="student-name-text">{sFullName}</span>
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
                            className={`student-row-delete-btn ${
                              isSelected ? "btn-active-delete-selection" : ""
                            }`}
                            onClick={() =>
                              fetchAndLoadStudent(stu.Id ?? stu.id)
                            }
                            disabled={loadingStudent}
                          >
                            {isSelected
                              ? "✓ Selected"
                              : "🗑️ Select for Deletion"}
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

        {/* ================= STUDENT DELETION PREVIEW CARD ================= */}
        {student && (
          <div
            ref={deleteCardRef}
            id="student-delete-card-section"
            className="student-delete-card"
          >
            <div className="student-delete-warning">
              <strong>⚠️ Warning: Permanent Record Inactivation</strong>
              <span>
                Deleting this student will deactivate them from the system,
                remove active enrollments, and mark the record as soft deleted.
              </span>
            </div>

            {/* Photo & Identity Banner */}
            <div className="student-photo-card-banner">
              {student.Photo ? (
                <img
                  src={formatFileUrl(student.Photo)}
                  alt={fullName}
                  className="student-detail-photo"
                  onClick={() =>
                    openPhotoInNewTab(formatFileUrl(student.Photo), fullName)
                  }
                  title="Click to view photo in new tab"
                />
              ) : (
                <div className="student-detail-photo-placeholder">👤</div>
              )}

              <div className="student-banner-info">
                <h3>{fullName}</h3>
                <div className="student-banner-meta">
                  <span>
                    <strong>Admission No:</strong>{" "}
                    {student.AdmissionNumber || "-"}
                  </span>
                  <span>
                    <strong>Roll No:</strong>{" "}
                    {student.RollNumber || student.rollNumber || "-"}
                  </span>
                  <span>
                    <strong>Student ID:</strong> #{student.Id}
                  </span>
                </div>
              </div>

              <div className="student-banner-status">
                <span
                  className={
                    student.IsActive
                      ? "status-badge active"
                      : "status-badge inactive"
                  }
                >
                  {student.IsActive ? "● Active" : "● Inactive"}
                </span>
              </div>
            </div>

            {/* Comprehensive Details Grid */}
            <div className="student-delete-details">
              <div>
                <label>Student ID</label>
                <p>#{student.Id}</p>
              </div>

              <div>
                <label>Admission Number</label>
                <p>{student.AdmissionNumber || "-"}</p>
              </div>

              <div>
                <label>Full Name</label>
                <p>{fullName}</p>
              </div>

              <div>
                <label>Roll Number</label>
                <p>{student.RollNumber || student.rollNumber || "-"}</p>
              </div>

              <div>
                <label>Department</label>
                <p>{student.DepartmentName || student.departmentName || "-"}</p>
              </div>

              <div>
                <label>Class &amp; Section</label>
                <p>
                  {[
                    student.SchoolClassName ||
                      student.ClassName ||
                      student.className,
                    student.SectionName || student.sectionName,
                  ]
                    .filter(Boolean)
                    .join(" - ") || "-"}
                </p>
              </div>

              <div>
                <label>Academic Year</label>
                <p>
                  {student.AcademicYearName ||
                    (student.AcademicYearId
                      ? `Year #${student.AcademicYearId}`
                      : "-")}
                </p>
              </div>

              <div>
                <label>Father&apos;s Name</label>
                <p>{student.FatherName || student.fatherName || "-"}</p>
              </div>

              <div>
                <label>Mother&apos;s Name</label>
                <p>{student.MotherName || student.motherName || "-"}</p>
              </div>

              <div>
                <label>Email Address</label>
                <p>{student.Email || "-"}</p>
              </div>

              <div>
                <label>Phone Number</label>
                <p>{student.PhoneNumber || "-"}</p>
              </div>

              <div>
                <label>Alternate Phone</label>
                <p>{student.AlternatePhoneNumber || "-"}</p>
              </div>

              <div>
                <label>Gender</label>
                <p>{student.Gender || "-"}</p>
              </div>

              <div>
                <label>Date of Birth</label>
                <p>
                  {student.DOB
                    ? new Date(student.DOB).toLocaleDateString("en-IN")
                    : "-"}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="student-delete-actions">
              <button
                type="button"
                className="student-delete-cancel-btn"
                onClick={() => {
                  setStudent(null);
                  setSelectedStudentId(null);
                }}
                disabled={deleting}
              >
                ✕ Cancel Selection
              </button>
              <button
                type="button"
                className="student-delete-confirm-btn"
                onClick={handleOpenConfirm}
                disabled={deleting}
              >
                🗑️ Delete Student Record
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= CONFIRMATION MODAL ================= */}
      {showConfirmModal && (
        <div className="student-delete-modal-overlay">
          <div className="student-delete-modal">
            <h3>Confirm Soft Deletion</h3>
            <p>
              Are you sure you want to delete student{" "}
              <strong>{fullName}</strong> (Admission No:{" "}
              <strong>{student?.AdmissionNumber || "N/A"}</strong>)?
            </p>
            <p className="modal-subtext">
              The student will be deactivated and marked as soft deleted in the
              database.
            </p>
            <div className="student-delete-modal-actions">
              <button
                type="button"
                className="student-modal-cancel"
                onClick={() => setShowConfirmModal(false)}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="student-modal-delete"
                onClick={handleConfirmDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Yes, Delete Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteStudent;
