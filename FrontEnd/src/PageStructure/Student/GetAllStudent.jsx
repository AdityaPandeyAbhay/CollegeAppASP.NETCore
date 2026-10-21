// =====================================================
// GET ALL STUDENTS
// UI Aligned with GetAllTeacher
// =====================================================

import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllStudentsWithDetails,
  isStudentSoftDeleted,
  getStudentDepartmentDropdown,
  getStudentClassDropdown,
  getStudentSectionDropdown,
  openPhotoInNewTab,
} from "../../Services/studentService";
import { getAllAcademicYear } from "../../Services/academicYearService";
import {
  getMyClassTeacherAssignment,
  getCachedClassTeacherAssignment,
} from "../../Services/classTeacherService";
import { isOfficeEmployeeRole, isTeacherRole } from "../../Utils/auth";
import "./GetAllStudent.css";

const GetAllStudent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // ACADEMIC DROPDOWN STATES (ACADEMIC YEAR, DEPARTMENT, CLASS, SECTION)
  // =====================================================
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

  // Popup Toast
  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

  const showPopup = (type, message) => {
    setPopup({ show: true, type, message });
    setTimeout(() => {
      setPopup({ show: false, type: "", message: "" });
    }, 4500);
  };

  const closePopup = () => {
    setPopup({ show: false, type: "", message: "" });
  };

  const hideActions =
    isOfficeEmployeeRole() ||
    isTeacherRole() ||
    Boolean(location.state?.fromTeacherDashboard);

  // =====================================================
  // INITIAL LOAD
  // =====================================================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      await Promise.all([
        loadStudents(),
        loadDepartments(),
        loadAcademicYears(),
      ]);

      // Check for incoming pre-selected class/section from dashboard or logged-in teacher role
      let targetDept = location.state?.departmentId;
      let targetClass = location.state?.classId;
      let targetSec = location.state?.sectionId;
      let targetAy = location.state?.academicYearId;

      if ((!targetClass || !targetSec) && isTeacherRole()) {
        try {
          const cachedCT = getCachedClassTeacherAssignment();
          const ctAssignment =
            cachedCT && cachedCT.isClassTeacher
              ? cachedCT
              : await getMyClassTeacherAssignment().catch(() => null);
          if (ctAssignment && ctAssignment.isClassTeacher) {
            targetDept = targetDept || ctAssignment.departmentId;
            targetClass = targetClass || ctAssignment.classId;
            targetSec = targetSec || ctAssignment.sectionId;
            targetAy = targetAy || ctAssignment.academicYearId;
          }
        } catch (_) {}
      }

      if (targetDept) {
        setSelectedDepartment(String(targetDept));
        const clsData = await getStudentClassDropdown(targetDept).catch(() => []);
        setClasses(Array.isArray(clsData) ? clsData : []);
      }
      if (targetClass) {
        setSelectedClass(String(targetClass));
        const secData = await getStudentSectionDropdown(targetClass).catch(() => []);
        setSections(Array.isArray(secData) ? secData : []);
      }
      if (targetSec) {
        setSelectedSection(String(targetSec));
      }
      if (targetAy) {
        setSelectedAcademicYear(String(targetAy));
      }
    } catch (err) {
      const msg = err?.message || "Failed to load student data.";
      setError(msg);
      showPopup("error", msg);
    } finally {
      setLoading(false);
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
      setSelectedAcademicYear("");
    } catch (err) {
      console.warn("Failed to load academic years:", err);
    } finally {
      setLoadingAcademicYears(false);
    }
  };

  const loadStudents = async () => {
    try {
      // Load all students (active and inactive), excluding soft-deleted students
      const data = await getAllStudentsWithDetails(false);
      const studentList = Array.isArray(data) ? data : [];
      setStudents(studentList);
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
  // HELPER: RESOLVE STUDENT SPECIFIC ACADEMIC YEAR RECORD
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

        // Find the destination record (the next year or active record the student was promoted to)
        let nextRecord = null;
        if (isPromotedRecord) {
          const otherRecords = history.filter(
            (h) =>
              String(h.AcademicYearId ?? h.academicYearId) !== String(yearId),
          );
          // Prioritize active record or subsequent academic year
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
              continue; // Student was not enrolled in this academic year
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
        // If All Academic Years is selected but a specific Class/Section/Dept is filtered,
        // resolve to matching historical enrollment if present
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

  const getFullName = (s) => {
    return [s.FirstName, s.MiddleName, s.LastName].filter(Boolean).join(" ");
    if (!s) return "";
    const composed = [
      s.FirstName || s.firstName,
      s.MiddleName || s.middleName,
      s.LastName || s.lastName,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      composed ||
      s.StudentName ||
      s.studentName ||
      s.Name ||
      s.name ||
      "Student"
    );
  };

  return (
    <div className="student-all-page">
      {/* ================= TOAST POPUP ================= */}
      {popup.show && (
        <div className={`student-all-popup student-all-popup-${popup.type}`}>
          <div className="student-all-popup-icon">
            {popup.type === "success" ? "✓" : "!"}
          </div>
          <div className="student-all-popup-content">
            <strong>{popup.type === "success" ? "Success" : "Notice"}</strong>
            <span>{popup.message}</span>
          </div>
          <button
            type="button"
            onClick={closePopup}
            className="student-all-popup-close"
          >
            ×
          </button>
        </div>
      )}

      <div className="student-all-container">
        {/* ================= HEADER ================= */}
        <div className="student-all-header">
          <div>
            <h1>All Students</h1>
            <p>
              View and manage all registered students across academic years,
              departments, classes, and sections.
            </p>
          </div>

          <div className="student-header-actions">
            {!isOfficeEmployeeRole() && !isTeacherRole() && (
              <button
                type="button"
                className="student-promote-nav-btn"
                onClick={() => navigate("/student/promote")}
              >
                🚀 Promote Students
              </button>
            )}
            <button
              type="button"
              className="student-refresh-btn"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* ================= ACADEMIC FILTER BAR ================= */}
        <div className="student-filter-bar-card">
          <div className="student-filter-grid">
            {/* ACADEMIC YEAR */}
            <div className="student-filter-group">
              <label htmlFor="filter-year">Academic Year:</label>
              <select
                id="filter-year"
                value={selectedAcademicYear}
                onChange={handleAcademicYearChange}
                disabled={loadingAcademicYears}
              >
                <option value="">All Academic Years</option>
                {academicYears.map((year) => {
                  const yId = year.Id ?? year.id;
                  const yName =
                    year.YearName ??
                    year.yearName ??
                    year.Name ??
                    `Year ${yId}`;
                  return (
                    <option key={yId} value={yId}>
                      {yName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* DEPARTMENT */}
            <div className="student-filter-group">
              <label htmlFor="filter-dept">Department:</label>
              <select
                id="filter-dept"
                value={selectedDepartment}
                onChange={handleDepartmentChange}
                disabled={loadingDepartments}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => {
                  const dId = dept.id ?? dept.Id;
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
        {error && <div className="student-all-error">{error}</div>}

        {/* ================= TABLE ================= */}
        {loading ? (
          <div className="student-loading">Loading students...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="student-empty">
            {searchTerm ||
            selectedDepartment ||
            selectedClass ||
            selectedSection
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
                  <th>Father Name</th>
                  <th>Mother Name</th>
                  <th>Class & Section</th>
                  <th>Academic Year</th>
                  <th>Gender</th>
                  <th>Date of Birth</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  {!hideActions && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student, index) => {
                  const fullName = getFullName(student) || "Student";
                  const isDeleted = isStudentSoftDeleted(student);
                  const isPromoted =
                    student.IsPromoted === true ||
                    student.isPromoted === true ||
                    String(
                      student.Status || student.status || "",
                    ).toLowerCase() === "promoted";

                  const isActive =
                    !isDeleted &&
                    !isPromoted &&
                    Boolean(student.IsActive ?? student.isActive ?? true) &&
                    String(
                      student.Status || student.status || "active",
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
                    student.AdmissionNumber ||
                    student.admissionNumber ||
                    student.AdmissionNo ||
                    student.admissionNo ||
                    "-";
                  const rollNo =
                    student.RollNumber ||
                    student.rollNumber ||
                    student.RollNo ||
                    student.rollNo ||
                    "-";
                  const className =
                    student.ClassName ||
                    student.className ||
                    (student.SchoolClassId || student.schoolClassId
                      ? `Class ${student.SchoolClassId || student.schoolClassId}`
                      : "-");
                  const secName =
                    student.SectionName ||
                    student.sectionName ||
                    (student.SectionId || student.sectionId
                      ? `Sec ${student.SectionId || student.sectionId}`
                      : "");
                  const classSec = secName
                    ? `${className} - ${secName}`
                    : className;
                  const yearName =
                    student.AcademicYearName ||
                    student.academicYearName ||
                    (student.AcademicYearId || student.academicYearId
                      ? `Year ${student.AcademicYearId || student.academicYearId}`
                      : "-");
                  const fatherName =
                    student.FatherName || student.fatherName || "-";
                  const motherName =
                    student.MotherName || student.motherName || "-";
                  const gender = student.Gender || student.gender || "-";
                  const dobVal =
                    student.DOB ||
                    student.dob ||
                    student.DateOfBirth ||
                    student.dateOfBirth;
                  const email = student.Email || student.email || "-";
                  const phone =
                    student.PhoneNumber ||
                    student.phoneNumber ||
                    student.Phone ||
                    student.phone ||
                    "-";
                  const photo = student.Photo || student.photo;

                  return (
                    <tr key={student.Id ?? student.id ?? admNo ?? index}>
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
                      <td>{fatherName}</td>
                      <td>{motherName}</td>
                      <td>
                        <span className="class-badge">{classSec}</span>
                        {isPromoted && student.PromotedToClassName && (
                          <div
                            className="promoted-to-hint-badge"
                            title={`Promoted to ${student.PromotedToClassName}${student.PromotedToSectionName ? ` - ${student.PromotedToSectionName}` : ""}${student.PromotedToYearName ? ` (${student.PromotedToYearName})` : ""}`}
                          >
                            <span className="promoted-to-icon">🎯</span>
                            <span>
                              Promoted to:{" "}
                              <strong>
                                {student.PromotedToClassName}
                                {student.PromotedToSectionName
                                  ? ` - ${student.PromotedToSectionName}`
                                  : ""}
                              </strong>
                              {student.PromotedToYearName && (
                                <span className="promoted-to-hint-year">
                                  {" "}
                                  ({student.PromotedToYearName})
                                </span>
                              )}
                            </span>
                          </div>
                        )}
                      </td>
                      <td>{yearName}</td>
                      <td>{gender}</td>
                      <td>
                        {dobVal
                          ? new Date(dobVal).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                      <td>{email}</td>
                      <td>{phone}</td>
                      <td>
                        <div className="student-status-col">
                          <span
                            className={`student-status ${statusClass}`}
                            title={
                              isPromoted
                                ? "Student has been promoted from this academic year and class"
                                : statusText
                            }
                          >
                            {statusText}
                          </span>
                          {isPromoted && student.PromotedToClassName && (
                            <span
                              className="status-promoted-tag"
                              title={`Promoted to ${student.PromotedToClassName}${student.PromotedToSectionName ? ` (${student.PromotedToSectionName})` : ""}`}
                            >
                              ➔ {student.PromotedToClassName}
                              {student.PromotedToSectionName
                                ? ` (${student.PromotedToSectionName})`
                                : ""}
                            </span>
                          )}
                        </div>
                      </td>
                      {!hideActions && (
                        <td>
                          <div className="student-actions-cell">
                            <button
                              type="button"
                              className="student-action-edit-btn"
                              title="Edit / Update Student Profile"
                              onClick={() =>
                                navigate(
                                  `/student/update?id=${encodeURIComponent(
                                    student.Id ?? student.id ?? admNo,
                                  )}`,
                                )
                              }
                            >
                              ✏️ Edit
                            </button>
                            <button
                              type="button"
                              className="student-action-delete-btn"
                              title="Delete Student Record"
                              onClick={() =>
                                navigate(
                                  `/student/delete?id=${encodeURIComponent(
                                    student.Id ?? student.id ?? admNo,
                                  )}`,
                                )
                              }
                            >
                              🗑️ Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetAllStudent;
