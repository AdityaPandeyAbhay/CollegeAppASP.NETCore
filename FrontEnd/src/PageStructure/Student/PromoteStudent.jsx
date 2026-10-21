// =====================================================
// STUDENT PROMOTION & ACADEMIC PROGRESSION PAGE
// (Super Admin, Admin, Operator Management)
// =====================================================

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAcademicYear } from "../../Services/academicYearService";
import {
  getStudentDepartmentDropdown,
  getStudentClassDropdown,
  getStudentSectionDropdown,
  getAllStudentsWithDetails,
  getAllStudents,
  isStudentSoftDeleted,
  openPhotoInNewTab,
} from "../../Services/studentService";
import {
  getStudentsByYearClassSection,
  promoteStudents,
  syncExistingStudents,
} from "../../Services/studentPromotionService";
import { getRole } from "../../Utils/auth";
import "./PromoteStudent.css";

function PromoteStudent() {
  const navigate = useNavigate();
  const role = (getRole() || "").toLowerCase();
  const canManage =
    role === "super admin" ||
    role === "superadmin" ||
    role === "admin" ||
    role === "operator" ||
    role === "office employee" ||
    role === "officeemployee" ||
    role === "officestaff" ||
    role === "office staff";

  // Shared Data
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);

  // Source Selection
  const [sourceYearId, setSourceYearId] = useState("");
  const [sourceDeptId, setSourceDeptId] = useState("");
  const [sourceClassId, setSourceClassId] = useState("");
  const [sourceSectionId, setSourceSectionId] = useState("");

  const [sourceClasses, setSourceClasses] = useState([]);
  const [sourceSections, setSourceSections] = useState([]);
  const [sourceStudents, setSourceStudents] = useState([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");

  // Target Selection
  const [targetYearId, setTargetYearId] = useState("");
  const [targetDeptId, setTargetDeptId] = useState("");
  const [targetClassId, setTargetClassId] = useState("");
  const [targetSectionId, setTargetSectionId] = useState("");

  const [targetClasses, setTargetClasses] = useState([]);
  const [targetSections, setTargetSections] = useState([]);

  // Promotion Options
  const [rollNumberOption, setRollNumberOption] = useState("keep"); // "keep" or "sequential"
  const [promotionRemarks, setPromotionRemarks] = useState("");

  // Selected Student IDs
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());

  // UI States
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [resultModal, setResultModal] = useState({
    show: false,
    success: true,
    title: "",
    message: "",
    details: null,
  });

  // Selected students object list for Target preview
  const selectedStudentsList = useMemo(() => {
    return sourceStudents.filter((st) => selectedStudentIds.has(st.studentId));
  }, [sourceStudents, selectedStudentIds]);

  // Filter Target Academic Years strictly to forward/future academic years
  const validTargetAcademicYears = useMemo(() => {
    if (!sourceYearId || academicYears.length === 0) return [];
    const sourceYear = academicYears.find(
      (y) => String(y.id ?? y.Id) === String(sourceYearId),
    );
    if (!sourceYear) return [];

    const sourceStart = sourceYear.startDate ?? sourceYear.StartDate;
    const sourceYearName = String(
      sourceYear.yearName ?? sourceYear.YearName ?? "",
    );
    const sourceYearMatch = sourceYearName.match(/\d{4}/);
    const sourceStartNum = sourceYearMatch
      ? parseInt(sourceYearMatch[0], 10)
      : 0;

    return academicYears.filter((y) => {
      const yId = String(y.id ?? y.Id);
      if (yId === String(sourceYearId)) return false;

      const yStart = y.startDate ?? y.StartDate;
      if (sourceStart && yStart) {
        return new Date(yStart).getTime() > new Date(sourceStart).getTime();
      }

      const yName = String(y.yearName ?? y.YearName ?? "");
      const yMatch = yName.match(/\d{4}/);
      const yStartNum = yMatch ? parseInt(yMatch[0], 10) : 0;

      if (sourceStartNum > 0 && yStartNum > 0) {
        return yStartNum > sourceStartNum;
      }

      return (
        yName.localeCompare(sourceYearName) > 0 ||
        Number(yId) > Number(sourceYearId)
      );
    });
  }, [academicYears, sourceYearId]);

  // Reset target year if selected target is no longer in valid forward years
  useEffect(() => {
    if (targetYearId && validTargetAcademicYears.length > 0) {
      const isValid = validTargetAcademicYears.some(
        (y) => String(y.id ?? y.Id) === String(targetYearId),
      );
      if (!isValid) {
        setTargetYearId("");
      }
    }
  }, [validTargetAcademicYears, targetYearId]);

  // Toast
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 4500);
  };

  // ===================================================
  // INITIAL LOAD: ACADEMIC YEARS & DEPARTMENTS
  // ===================================================
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      const [yearsRes, deptRes] = await Promise.all([
        getAllAcademicYear().catch(() => []),
        getStudentDepartmentDropdown().catch(() => []),
      ]);

      const yearsList = Array.isArray(yearsRes)
        ? yearsRes
        : yearsRes?.data || [];
      const deptsList = Array.isArray(deptRes) ? deptRes : deptRes?.data || [];

      setAcademicYears(yearsList);
      setDepartments(deptsList);

      // Default source year to current or first
      const currentYear = yearsList.find((y) => y.isCurrent ?? y.IsCurrent);
      if (currentYear) {
        setSourceYearId(String(currentYear.id ?? currentYear.Id));
      } else if (yearsList.length > 0) {
        setSourceYearId(String(yearsList[0].id ?? yearsList[0].Id));
      }
    } catch (err) {
      console.error("Failed to load initial promotion data:", err);
      showToast("error", "Failed to load academic years and departments.");
    } finally {
      setLoadingInitial(false);
    }
  };

  // ===================================================
  // SOURCE CASCADING HANDLERS
  // ===================================================
  const handleSourceDeptChange = async (deptId) => {
    setSourceDeptId(deptId);
    setSourceClassId("");
    setSourceSectionId("");
    setSourceClasses([]);
    setSourceSections([]);
    setSourceStudents([]);
    setSelectedStudentIds(new Set());

    if (!deptId) return;

    try {
      const clsData = await getStudentClassDropdown(deptId);
      setSourceClasses(Array.isArray(clsData) ? clsData : []);
    } catch (err) {
      console.warn("Failed to load source classes:", err);
    }
  };

  const handleSourceClassChange = async (clsId) => {
    setSourceClassId(clsId);
    setSourceSectionId("");
    setSourceSections([]);
    setSourceStudents([]);
    setSelectedStudentIds(new Set());

    if (!clsId) return;

    try {
      const secData = await getStudentSectionDropdown(clsId);
      setSourceSections(Array.isArray(secData) ? secData : []);
    } catch (err) {
      console.warn("Failed to load source sections:", err);
    }
  };

  const handleSourceSectionChange = (secId) => {
    setSourceSectionId(secId);
    setSourceStudents([]);
    setSelectedStudentIds(new Set());
    if (secId && sourceClassId) {
      fetchSourceStudents(sourceYearId, sourceDeptId, sourceClassId, secId);
    }
  };

  const handleSearchStudents = async () => {
    if (!sourceClassId || !sourceSectionId) {
      showToast("error", "Please select Class and Section to search students.");
      return;
    }
    await fetchSourceStudents(
      sourceYearId,
      sourceDeptId,
      sourceClassId,
      sourceSectionId,
    );
  };

  const fetchSourceStudents = async (yearId, deptId, classId, secId) => {
    if (!classId || !secId) return;

    try {
      setLoadingStudents(true);
      let list = [];

      try {
        list = await getStudentsByYearClassSection({
          academicYearId: yearId || undefined,
          departmentId: deptId || undefined,
          schoolClassId: classId,
          sectionId: secId,
        });
      } catch (e) {
        console.warn("Backend StudentsByYear returned error, falling back:", e);
      }

      // If backend returns empty list or fails, fallback to getAllStudentsWithDetails
      if (!Array.isArray(list) || list.length === 0) {
        let allStudents = [];
        try {
          allStudents = await getAllStudentsWithDetails(true);
        } catch {
          allStudents = await getAllStudents(true);
        }

        const rawList = Array.isArray(allStudents) ? allStudents : [];
        const matching = rawList.filter((s) => {
          if (isStudentSoftDeleted(s)) return false;

          const sDept = String(s.DepartmentId ?? s.departmentId ?? "");
          const sClass = String(
            s.SchoolClassId ?? s.schoolClassId ?? s.ClassId ?? s.classId ?? "",
          );
          const sSec = String(s.SectionId ?? s.sectionId ?? "");
          const sYear = String(s.AcademicYearId ?? s.academicYearId ?? "");

          const matchDept = !deptId || sDept === String(deptId);
          const matchClass = sClass === String(classId);
          const matchSec = sSec === String(secId);
          const matchYear = !yearId || !sYear || sYear === String(yearId);

          return matchDept && matchClass && matchSec && matchYear;
        });

        list = matching.map((s) => {
          const sId = s.Id ?? s.id;
          const fullName =
            [
              s.FirstName ?? s.firstName,
              s.MiddleName ?? s.middleName,
              s.LastName ?? s.lastName,
            ]
              .filter(Boolean)
              .join(" ") ||
            s.StudentName ||
            s.studentName ||
            s.Name ||
            s.name ||
            "Student";

          return {
            id: 0,
            studentId: sId,
            admissionNumber:
              s.AdmissionNumber ?? s.admissionNumber ?? `ADM-${sId}`,
            studentName: fullName,
            photo: s.Photo ?? s.photo ?? null,
            academicYearId: Number(yearId) || 0,
            academicYearName: "",
            departmentId: s.DepartmentId ?? s.departmentId,
            schoolClassId: s.SchoolClassId ?? s.schoolClassId,
            sectionId: s.SectionId ?? s.sectionId,
            rollNumber:
              s.RollNumber ?? s.rollNumber ?? s.RollNo ?? s.rollNo ?? null,
            status: (s.IsActive ?? s.isActive ?? true) ? "Active" : "Inactive",
            isPromoted: false,
            enrollmentDate:
              s.AdmissionDate ?? s.admissionDate ?? new Date().toISOString(),
            remarks: null,
          };
        });
      }

      setSourceStudents(list);

      // By default, select all active students
      const allActive = new Set(
        list
          .filter((s) => s.status !== "Promoted" && s.status !== "Completed")
          .map((s) => s.studentId),
      );
      setSelectedStudentIds(allActive);

      if (list.length > 0) {
        showToast(
          "success",
          `Found ${list.length} student(s) for the selected class and section.`,
        );
      } else {
        showToast(
          "info",
          "No active students found matching the selected filters.",
        );
      }
    } catch (err) {
      console.error("Failed to load source students:", err);
      const message = err.message?.includes("status 404")
        ? "Student promotion API was not found. Restart the backend and try again."
        : err.message || "Failed to load students for selection.";
      showToast("error", message);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Filtered source students by search term
  const displayedSourceStudents = useMemo(() => {
    if (!studentSearchTerm.trim()) return sourceStudents;
    const term = studentSearchTerm.toLowerCase().trim();
    return sourceStudents.filter((st) => {
      const name = (st.studentName || "").toLowerCase();
      const adm = String(st.admissionNumber || "").toLowerCase();
      const roll = String(st.rollNumber || "").toLowerCase();
      return name.includes(term) || adm.includes(term) || roll.includes(term);
    });
  }, [sourceStudents, studentSearchTerm]);

  // ===================================================
  // TARGET CASCADING HANDLERS
  // ===================================================
  const handleTargetDeptChange = async (deptId) => {
    setTargetDeptId(deptId);
    setTargetClassId("");
    setTargetSectionId("");
    setTargetClasses([]);
    setTargetSections([]);

    if (!deptId) return;

    try {
      const clsData = await getStudentClassDropdown(deptId);
      setTargetClasses(Array.isArray(clsData) ? clsData : []);
    } catch (err) {
      console.warn("Failed to load target classes:", err);
    }
  };

  const handleTargetClassChange = async (clsId) => {
    setTargetClassId(clsId);
    setTargetSectionId("");
    setTargetSections([]);

    if (!clsId) return;

    try {
      const secData = await getStudentSectionDropdown(clsId);
      setTargetSections(Array.isArray(secData) ? secData : []);
    } catch (err) {
      console.warn("Failed to load target sections:", err);
    }
  };

  const resetFilters = () => {
    const currentYear = academicYears.find(
      (year) => year.isCurrent ?? year.IsCurrent,
    );
    setSourceYearId(
      currentYear ? String(currentYear.id ?? currentYear.Id) : "",
    );
    setSourceDeptId("");
    setSourceClassId("");
    setSourceSectionId("");
    setSourceClasses([]);
    setSourceSections([]);
    setSourceStudents([]);
    setStudentSearchTerm("");
    setTargetYearId("");
    setTargetDeptId("");
    setTargetClassId("");
    setTargetSectionId("");
    setTargetClasses([]);
    setTargetSections([]);
    setSelectedStudentIds(new Set());
    setPromotionRemarks("");
    setRollNumberOption("keep");
    showToast("success", "All promotion filters have been reset.");
  };

  // ===================================================
  // CHECKBOX SELECTION
  // ===================================================
  const handleToggleStudent = (studentId) => {
    setSelectedStudentIds((prev) => {
      const next = new Set(prev);
      if (next.has(studentId)) {
        next.delete(studentId);
      } else {
        next.add(studentId);
      }
      return next;
    });
  };

  const handleSelectAll = () => {
    if (
      selectedStudentIds.size === displayedSourceStudents.length &&
      displayedSourceStudents.length > 0
    ) {
      setSelectedStudentIds(new Set());
    } else {
      const allIds = new Set(displayedSourceStudents.map((s) => s.studentId));
      setSelectedStudentIds(allIds);
    }
  };

  // ===================================================
  // PROMOTION SUBMISSION
  // ===================================================
  const handleOpenConfirm = (e) => {
    e.preventDefault();

    if (!sourceYearId || !sourceClassId || !sourceSectionId) {
      showToast(
        "error",
        "Please select Source Academic Year, Class, and Section.",
      );
      return;
    }

    if (!targetYearId || !targetDeptId || !targetClassId || !targetSectionId) {
      showToast(
        "error",
        "Please select Target Academic Year, Department, Class, and Section.",
      );
      return;
    }

    if (
      String(sourceYearId) === String(targetYearId) &&
      String(sourceClassId) === String(targetClassId) &&
      String(sourceSectionId) === String(targetSectionId)
    ) {
      showToast(
        "error",
        "Target Academic Year, Class, and Section cannot be identical to Source.",
      );
      return;
    }

    if (selectedStudentIds.size === 0) {
      showToast("error", "Please select at least one student to promote.");
      return;
    }

    setConfirmModalOpen(true);
  };

  const handleExecutePromotion = async () => {
    try {
      setSubmitting(true);

      const studentItems = Array.from(selectedStudentIds).map((sId, index) => {
        const studentObj = sourceStudents.find((s) => s.studentId === sId);
        let roll = studentObj?.rollNumber || null;

        if (rollNumberOption === "sequential") {
          roll = String(index + 1);
        }

        return {
          studentId: sId,
          newRollNumber: roll,
          status: "Active",
        };
      });

      const payload = {
        sourceAcademicYearId: Number(sourceYearId),
        sourceSchoolClassId: Number(sourceClassId),
        sourceSectionId: Number(sourceSectionId),
        targetAcademicYearId: Number(targetYearId),
        targetDepartmentId: Number(targetDeptId),
        targetSchoolClassId: Number(targetClassId),
        targetSectionId: Number(targetSectionId),
        students: studentItems,
        remarks:
          promotionRemarks.trim() ||
          `Promoted from Class ${sourceClassId} (${sourceYearId})`,
      };

      await promoteStudents(payload);

      setConfirmModalOpen(false);
      setResultModal({
        show: true,
        success: true,
        title: "Promotion Executed Successfully!",
        message: `Successfully promoted ${studentItems.length} student(s) to ${getTargetClassName()} - ${getTargetSectionName()} for Academic Year ${getTargetYearName()}.`,
        details: {
          count: studentItems.length,
          targetClass: getTargetClassName(),
          targetSection: getTargetSectionName(),
          targetYear: getTargetYearName(),
          targetDepartment: getTargetDeptName(),
          sourceClass: getSourceClassName(),
          sourceSection: getSourceSectionName(),
          sourceYear: getSourceYearName(),
          sourceDepartment: getSourceDeptName(),
        },
      });

      showToast(
        "success",
        `Successfully promoted ${studentItems.length} student(s) to new class and academic year!`,
      );
      setConfirmModalOpen(false);

      // Refresh source roster
      fetchSourceStudents(
        sourceYearId,
        sourceDeptId,
        sourceClassId,
        sourceSectionId,
      );
    } catch (err) {
      console.error("Promotion failed:", err);
      setConfirmModalOpen(false);
      setResultModal({
        show: true,
        success: false,
        title: "Promotion Failed",
        message:
          err.message ||
          "Failed to execute student promotion. Please verify the selections and try again.",
        details: null,
      });
      showToast("error", err.message || "Failed to execute student promotion.");
    } finally {
      setSubmitting(false);
    }
  };

  const getSourceDeptName = () =>
    departments.find((d) => String(d.id ?? d.Id) === String(sourceDeptId))
      ?.text ||
    departments.find((d) => String(d.id ?? d.Id) === String(sourceDeptId))
      ?.name ||
    departments.find((d) => String(d.id ?? d.Id) === String(sourceDeptId))
      ?.departmentName ||
    "Department";

  const getTargetDeptName = () =>
    departments.find((d) => String(d.id ?? d.Id) === String(targetDeptId))
      ?.text ||
    departments.find((d) => String(d.id ?? d.Id) === String(targetDeptId))
      ?.name ||
    departments.find((d) => String(d.id ?? d.Id) === String(targetDeptId))
      ?.departmentName ||
    "Department";

  const getSourceYearName = () =>
    academicYears.find((y) => String(y.id ?? y.Id) === String(sourceYearId))
      ?.yearName || sourceYearId;
  const getTargetYearName = () =>
    academicYears.find((y) => String(y.id ?? y.Id) === String(targetYearId))
      ?.yearName || targetYearId;
  const getSourceClassName = () =>
    sourceClasses.find((c) => String(c.id ?? c.Id) === String(sourceClassId))
      ?.text ||
    sourceClasses.find((c) => String(c.id ?? c.Id) === String(sourceClassId))
      ?.className ||
    "Class";
  const getTargetClassName = () =>
    targetClasses.find((c) => String(c.id ?? c.Id) === String(targetClassId))
      ?.text ||
    targetClasses.find((c) => String(c.id ?? c.Id) === String(targetClassId))
      ?.className ||
    "Class";
  const getSourceSectionName = () =>
    sourceSections.find((s) => String(s.id ?? s.Id) === String(sourceSectionId))
      ?.text ||
    sourceSections.find((s) => String(s.id ?? s.Id) === String(sourceSectionId))
      ?.sectionName ||
    "Section";
  const getTargetSectionName = () =>
    targetSections.find((s) => String(s.id ?? s.Id) === String(targetSectionId))
      ?.text ||
    targetSections.find((s) => String(s.id ?? s.Id) === String(targetSectionId))
      ?.sectionName ||
    "Section";

  return (
    <div className="promote-student-page">
      {/* Toast Alert */}
      {toast.show && (
        <div className={`promote-toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === "success" ? "✓" : "!"}
          </div>
          <div className="toast-content">{toast.message}</div>
        </div>
      )}

      <div className="promote-student-container">
        {/* Header */}
        <div className="promote-student-header">
          <div>
            <h1>Student Promotion & Academic Progression</h1>
            <p>
              Promote students from one class and section to the next academic
              year. Previous year records are permanently preserved in history,
              and new active records are created.
            </p>
          </div>
          <div className="promotion-header-actions">
            <button
              type="button"
              className="btn-header-action"
              onClick={() => window.location.reload()}
            >
              ↻ Refresh Page
            </button>
            <button
              type="button"
              className="btn-header-action btn-reset-filters"
              onClick={resetFilters}
            >
              Reset Filters
            </button>
            <button
              type="button"
              className="btn-back-to-students"
              onClick={() => navigate("/student/all")}
            >
              ← Back to Student List
            </button>
          </div>
        </div>

        {/* Dual Panel Grid: Source vs Target */}
        <div className="promotion-split-grid">
          {/* ================= LEFT: SOURCE CLASS ================= */}
          <div className="panel-card source-panel">
            <div className="panel-header">
              <span className="panel-step-badge">1</span>
              <h3>Source Class (Current Academic Year)</h3>
            </div>

            <div className="panel-selectors-grid">
              <div className="form-field">
                <label>Academic Year *</label>
                <select
                  value={sourceYearId}
                  onChange={(e) => {
                    setSourceYearId(e.target.value);
                    setSourceStudents([]);
                    setSelectedStudentIds(new Set());
                  }}
                  disabled={loadingInitial}
                >
                  <option value="">-- Choose Academic Year --</option>
                  {academicYears.map((y) => {
                    const yId = y.id ?? y.Id;
                    const yName = y.yearName ?? y.YearName ?? `Year ${yId}`;
                    const isCurr = y.isCurrent ?? y.IsCurrent;
                    return (
                      <option key={yId} value={yId}>
                        {yName} {isCurr ? "(Current)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-field">
                <label>Department *</label>
                <select
                  value={sourceDeptId}
                  onChange={(e) => handleSourceDeptChange(e.target.value)}
                  disabled={loadingInitial}
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((d) => {
                    const dId = d.id ?? d.Id;
                    const dName = d.text ?? d.Text ?? d.name ?? `Dept ${dId}`;
                    return (
                      <option key={dId} value={dId}>
                        {dName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-field">
                <label>Class *</label>
                <select
                  value={sourceClassId}
                  onChange={(e) => handleSourceClassChange(e.target.value)}
                  disabled={!sourceDeptId}
                >
                  <option value="">
                    {!sourceDeptId
                      ? "-- Select Dept First --"
                      : "-- Choose Class --"}
                  </option>
                  {sourceClasses.map((c) => {
                    const cId = c.id ?? c.Id;
                    const cName =
                      c.text ??
                      c.Text ??
                      c.className ??
                      c.ClassName ??
                      c.name ??
                      c.Name ??
                      `Class ${cId}`;
                    return (
                      <option key={cId} value={cId}>
                        {cName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-field">
                <label>Section *</label>
                <select
                  value={sourceSectionId}
                  onChange={(e) => handleSourceSectionChange(e.target.value)}
                  disabled={!sourceClassId}
                >
                  <option value="">
                    {!sourceClassId
                      ? "-- Select Class First --"
                      : "-- Choose Section --"}
                  </option>
                  {sourceSections.map((s) => {
                    const sId = s.id ?? s.Id;
                    const sName =
                      s.text ??
                      s.Text ??
                      s.sectionName ??
                      s.SectionName ??
                      s.name ??
                      s.Name ??
                      `Section ${sId}`;
                    return (
                      <option key={sId} value={sId}>
                        {sName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Explicit Search Action Button */}
            <div className="source-filter-actions">
              <button
                type="button"
                className="btn-search-source-students"
                onClick={handleSearchStudents}
                disabled={loadingStudents || !sourceClassId || !sourceSectionId}
              >
                {loadingStudents
                  ? "⏳ Searching Students..."
                  : "🔍 Search Students"}
              </button>
              <button
                type="button"
                className="btn-clear-source-selection"
                onClick={() => {
                  setSourceStudents([]);
                  setSelectedStudentIds(new Set());
                  setStudentSearchTerm("");
                }}
                disabled={sourceStudents.length === 0}
              >
                Clear Results
              </button>
            </div>

            {/* Search Input for loaded students */}
            {sourceStudents.length > 0 && (
              <div className="source-student-search-bar">
                <span className="search-icon">🔍</span>
                <input
                  type="text"
                  placeholder="Search students by name, roll no, or admission number..."
                  value={studentSearchTerm}
                  onChange={(e) => setStudentSearchTerm(e.target.value)}
                />
                {studentSearchTerm && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setStudentSearchTerm("")}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}

            {/* Students Table */}
            <div className="students-selection-box">
              <div className="selection-box-top">
                <div className="selection-count">
                  <strong>Selected:</strong> {selectedStudentIds.size} of{" "}
                  {displayedSourceStudents.length} Students
                  {studentSearchTerm &&
                    ` (Filtered from ${sourceStudents.length})`}
                </div>
                {displayedSourceStudents.length > 0 && (
                  <label className="select-all-label">
                    <input
                      type="checkbox"
                      checked={
                        selectedStudentIds.size > 0 &&
                        selectedStudentIds.size ===
                          displayedSourceStudents.length
                      }
                      onChange={handleSelectAll}
                    />
                    Select All
                  </label>
                )}
              </div>

              {loadingStudents ? (
                <div className="roster-loading-state">
                  <div className="roster-spinner"></div>
                  <p>Loading students enrolled in this section...</p>
                </div>
              ) : !sourceSectionId ? (
                <div className="roster-empty-state">
                  <span className="empty-roster-icon">📋</span>
                  <p>
                    Select Academic Year, Department, Class, and Section above
                    to display students.
                  </p>
                </div>
              ) : sourceStudents.length === 0 ? (
                <div className="roster-empty-state">
                  <span className="empty-roster-icon">👤</span>
                  <p>
                    No students found enrolled in this Section and Academic
                    Year.
                  </p>
                </div>
              ) : displayedSourceStudents.length === 0 ? (
                <div className="roster-empty-state">
                  <span className="empty-roster-icon">🔍</span>
                  <p>
                    No students match the search term "{studentSearchTerm}".
                  </p>
                </div>
              ) : (
                <div className="roster-table-wrapper">
                  <table className="roster-table">
                    <thead>
                      <tr>
                        <th style={{ width: "40px" }}></th>
                        <th style={{ width: "50px" }}>Photo</th>
                        <th>Roll</th>
                        <th>Adm No</th>
                        <th>Student Name</th>
                        <th>Status</th>
                        <th>Promoted Class & Section</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayedSourceStudents.map((st) => {
                        const isSelected = selectedStudentIds.has(st.studentId);
                        const isAlreadyPromoted =
                          st.isPromoted === true || st.status === "Promoted";
                        const targetPromotedText = st.promotedToClassName
                          ? `${st.promotedToClassName} - ${st.promotedToSectionName || ""}`
                          : null;

                        return (
                          <tr
                            key={st.studentId}
                            className={`${isSelected ? "row-selected" : ""} ${
                              isAlreadyPromoted ? "row-already-promoted" : ""
                            }`}
                            onClick={() => handleToggleStudent(st.studentId)}
                          >
                            <td>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() =>
                                  handleToggleStudent(st.studentId)
                                }
                                onClick={(e) => e.stopPropagation()}
                              />
                            </td>
                            <td>
                              <div className="promo-avatar-wrap">
                                {st.photo ? (
                                  <img
                                    src={st.photo}
                                    alt={st.studentName}
                                    className="promo-student-avatar"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openPhotoInNewTab(
                                        st.photo,
                                        st.studentName,
                                      );
                                    }}
                                    title="Click to view full photo in new tab"
                                  />
                                ) : (
                                  <div className="promo-avatar-placeholder">
                                    👤
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="badge-roll">
                                {st.rollNumber || "-"}
                              </span>
                            </td>
                            <td>
                              <span className="badge-adm">
                                {st.admissionNumber}
                              </span>
                            </td>
                            <td className="cell-student-name">
                              <strong>{st.studentName}</strong>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  isAlreadyPromoted
                                    ? "status-promoted"
                                    : "status-not-promoted"
                                }`}
                              >
                                {isAlreadyPromoted
                                  ? "Promoted"
                                  : "Not Promoted"}
                              </span>
                            </td>
                            <td>
                              {targetPromotedText ? (
                                <span
                                  className="promoted-target-tag"
                                  title={`Promoted to ${targetPromotedText} (${st.promotedToYearName || ""})`}
                                >
                                  🎯 {targetPromotedText}
                                  {st.promotedToYearName && (
                                    <span className="promoted-year-badge">
                                      ({st.promotedToYearName})
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span className="promoted-na-tag">N/A</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* ================= RIGHT: TARGET CLASS ================= */}
          <div className="panel-card target-panel">
            <div className="panel-header">
              <span className="panel-step-badge">2</span>
              <h3>Target Class (Next Academic Year)</h3>
            </div>

            <div className="panel-selectors-grid">
              <div className="form-field">
                <label>
                  Target Academic Year *{" "}
                  <span className="field-hint-tag">Forward Year Only</span>
                </label>
                <select
                  value={targetYearId}
                  onChange={(e) => setTargetYearId(e.target.value)}
                  disabled={loadingInitial || !sourceYearId}
                >
                  <option value="">
                    {!sourceYearId
                      ? "-- Select Source Year First --"
                      : validTargetAcademicYears.length === 0
                        ? "-- No Future Academic Years Found --"
                        : "-- Choose Target Year --"}
                  </option>
                  {validTargetAcademicYears.map((y) => {
                    const yId = y.id ?? y.Id;
                    const yName = y.yearName ?? y.YearName ?? `Year ${yId}`;
                    return (
                      <option key={yId} value={yId}>
                        {yName} (Next Year)
                      </option>
                    );
                  })}
                </select>
                <small className="target-year-note">
                  Students are promoted to the next academic year (e.g.
                  2025-2026 ➔ 2026-2027). Reverse order is restricted.
                </small>
              </div>

              <div className="form-field">
                <label>Target Department *</label>
                <select
                  value={targetDeptId}
                  onChange={(e) => handleTargetDeptChange(e.target.value)}
                  disabled={loadingInitial}
                >
                  <option value="">-- Choose Department --</option>
                  {departments.map((d) => {
                    const dId = d.id ?? d.Id;
                    const dName = d.text ?? d.Text ?? d.name ?? `Dept ${dId}`;
                    return (
                      <option key={dId} value={dId}>
                        {dName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-field">
                <label>Target Class *</label>
                <select
                  value={targetClassId}
                  onChange={(e) => handleTargetClassChange(e.target.value)}
                  disabled={!targetDeptId}
                >
                  <option value="">
                    {!targetDeptId
                      ? "-- Select Dept First --"
                      : "-- Choose Target Class --"}
                  </option>
                  {targetClasses.map((c) => {
                    const cId = c.id ?? c.Id;
                    const cName =
                      c.text ??
                      c.Text ??
                      c.className ??
                      c.ClassName ??
                      c.name ??
                      c.Name ??
                      `Class ${cId}`;
                    return (
                      <option key={cId} value={cId}>
                        {cName}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="form-field">
                <label>Target Section *</label>
                <select
                  value={targetSectionId}
                  onChange={(e) => setTargetSectionId(e.target.value)}
                  disabled={!targetClassId}
                >
                  <option value="">
                    {!targetClassId
                      ? "-- Select Class First --"
                      : "-- Choose Target Section --"}
                  </option>
                  {targetSections.map((s) => {
                    const sId = s.id ?? s.Id;
                    const sName =
                      s.text ??
                      s.Text ??
                      s.sectionName ??
                      s.SectionName ??
                      s.name ??
                      s.Name ??
                      `Section ${sId}`;
                    return (
                      <option key={sId} value={sId}>
                        {sName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* From & To Visual Flow Card */}
            <div className="promotion-from-to-card">
              <div className="from-to-box from-box">
                <span className="from-to-tag">FROM SOURCE</span>
                <h4 className="from-to-title">
                  {sourceClassId && sourceSectionId
                    ? `${getSourceClassName()} - ${getSourceSectionName()}`
                    : "Select Source Class"}
                </h4>
                <div className="from-to-sub">
                  <span>
                    📁 {sourceDeptId ? getSourceDeptName() : "Department"}
                  </span>
                  <span>
                    📅 {sourceYearId ? getSourceYearName() : "Academic Year"}
                  </span>
                </div>
              </div>

              <div className="from-to-divider">
                <div className="from-to-arrow">➔</div>
                <span className="from-to-badge">PROMOTING TO</span>
              </div>

              <div className="from-to-box to-box">
                <span className="from-to-tag">TO TARGET</span>
                <h4 className="from-to-title">
                  {targetClassId && targetSectionId
                    ? `${getTargetClassName()} - ${getTargetSectionName()}`
                    : "Select Target Class"}
                </h4>
                <div className="from-to-sub">
                  <span>
                    📁 {targetDeptId ? getTargetDeptName() : "Department"}
                  </span>
                  <span>
                    📅 {targetYearId ? getTargetYearName() : "Academic Year"}
                  </span>
                </div>
              </div>
            </div>

            {/* Selected Students Queue for Promotion */}
            <div className="target-selected-students-box">
              <div className="target-selected-header">
                <div className="target-selected-title">
                  <span className="queue-title-text">
                    👥 Selected Students Queue
                  </span>
                  <span className="selected-count-pill">
                    {selectedStudentsList.length} Selected
                  </span>
                </div>
                {selectedStudentsList.length > 0 && (
                  <button
                    type="button"
                    className="btn-deselect-all"
                    onClick={() => setSelectedStudentIds(new Set())}
                    title="Clear selected queue"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {selectedStudentsList.length === 0 ? (
                <div className="target-empty-queue">
                  <span className="empty-queue-icon">👈</span>
                  <p>
                    No students selected. Check the checkboxes in the Source
                    Class list on the left to queue students for promotion.
                  </p>
                </div>
              ) : (
                <div className="target-selected-table-wrap">
                  <table className="target-selected-table">
                    <thead>
                      <tr>
                        <th style={{ width: "35px" }}>#</th>
                        <th style={{ width: "45px" }}>Photo</th>
                        <th>Adm No</th>
                        <th>Student Name</th>
                        <th>Source Roll</th>
                        <th>Target Roll (Est.)</th>
                        <th style={{ width: "45px" }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudentsList.map((st, idx) => {
                        const estRoll =
                          rollNumberOption === "sequential"
                            ? idx + 1
                            : st.rollNumber || "-";
                        return (
                          <tr key={st.studentId}>
                            <td>{idx + 1}</td>
                            <td>
                              <div className="promo-avatar-wrap">
                                {st.photo ? (
                                  <img
                                    src={st.photo}
                                    alt={st.studentName}
                                    className="promo-student-avatar"
                                    onClick={() =>
                                      openPhotoInNewTab(
                                        st.photo,
                                        st.studentName,
                                      )
                                    }
                                    title="View photo"
                                  />
                                ) : (
                                  <div className="promo-avatar-placeholder">
                                    👤
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="badge-adm">
                                {st.admissionNumber}
                              </span>
                            </td>
                            <td className="cell-student-name">
                              <strong>{st.studentName}</strong>
                            </td>
                            <td>
                              <span className="badge-roll">
                                {st.rollNumber || "-"}
                              </span>
                            </td>
                            <td>
                              <span className="badge-target-roll">
                                {estRoll}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="btn-remove-queued-student"
                                onClick={() =>
                                  handleToggleStudent(st.studentId)
                                }
                                title="Remove student from promotion list"
                              >
                                ✕
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

            {/* Target Options */}
            <div className="target-options-card">
              <h4>Promotion Configurations</h4>

              <div className="form-group-radio">
                <label className="radio-group-title">
                  Roll Number Handling in New Class:
                </label>
                <div className="radio-options">
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="rollOpt"
                      value="keep"
                      checked={rollNumberOption === "keep"}
                      onChange={() => setRollNumberOption("keep")}
                    />
                    <span>Keep same roll number from current class</span>
                  </label>
                  <label className="radio-item">
                    <input
                      type="radio"
                      name="rollOpt"
                      value="sequential"
                      checked={rollNumberOption === "sequential"}
                      onChange={() => setRollNumberOption("sequential")}
                    />
                    <span>Assign sequential roll numbers (1, 2, 3, 4...)</span>
                  </label>
                </div>
              </div>

              <div className="form-field" style={{ marginTop: "15px" }}>
                <label>Remarks / Notes (Optional)</label>
                <textarea
                  rows={3}
                  value={promotionRemarks}
                  onChange={(e) => setPromotionRemarks(e.target.value)}
                  placeholder="e.g. Promoted based on annual exam performance 2025-2026."
                />
              </div>

              {/* Summary of Action */}
              <div className="promotion-summary-box">
                <div className="summary-row">
                  <span>Students to Promote:</span>
                  <strong>{selectedStudentIds.size} Students</strong>
                </div>
                <div className="summary-row">
                  <span>From:</span>
                  <strong>
                    {sourceYearId ? getSourceYearName() : "—"} |{" "}
                    {sourceClassId
                      ? `${getSourceClassName()} - ${getSourceSectionName()}`
                      : "—"}
                  </strong>
                </div>
                <div className="summary-row">
                  <span>To:</span>
                  <strong>
                    {targetYearId ? getTargetYearName() : "—"} |{" "}
                    {targetClassId
                      ? `${getTargetClassName()} - ${getTargetSectionName()}`
                      : "—"}
                  </strong>
                </div>
              </div>

              <button
                type="button"
                className="btn-execute-promotion"
                onClick={handleOpenConfirm}
                disabled={selectedStudentIds.size === 0 || submitting}
              >
                🚀 Promote {selectedStudentIds.size} Selected Students
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModalOpen && (
        <div
          className="modal-backdrop"
          onClick={() => setConfirmModalOpen(false)}
        >
          <div
            className="modal-card promotion-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Confirm Student Promotion</h2>
              <button
                className="modal-close-btn"
                onClick={() => setConfirmModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="confirm-modal-body">
              <p className="confirm-main-text">
                Are you sure you want to promote{" "}
                <strong>{selectedStudentIds.size} students</strong> to the new
                academic year and class?
              </p>

              <div className="confirm-details-box">
                <div className="confirm-detail-item">
                  <span className="detail-label">Source Class:</span>
                  <span className="detail-val">
                    {getSourceYearName()} &bull; {getSourceClassName()} -{" "}
                    {getSourceSectionName()} ({getSourceDeptName()})
                  </span>
                </div>
                <div className="confirm-detail-arrow">➔</div>
                <div className="confirm-detail-item">
                  <span className="detail-label">Destination Class:</span>
                  <span className="detail-val">
                    {getTargetYearName()} &bull; {getTargetClassName()} -{" "}
                    {getTargetSectionName()} ({getTargetDeptName()})
                  </span>
                </div>
              </div>

              <div className="confirm-students-preview">
                <div className="preview-label">
                  Students ({selectedStudentsList.length}):
                </div>
                <div className="preview-chips-list">
                  {selectedStudentsList.map((st) => (
                    <span key={st.studentId} className="student-chip">
                      {st.studentName} ({st.admissionNumber})
                    </span>
                  ))}
                </div>
              </div>

              <div className="alert-notice">
                ℹ️ <strong>History Protection:</strong> The students' academic
                records in <strong>{getSourceYearName()}</strong> will be marked
                as <em>Promoted</em> and permanently preserved. A new active
                enrollment record will be created in{" "}
                <strong>{getTargetYearName()}</strong>.
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setConfirmModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-submit-promotion"
                onClick={handleExecutePromotion}
                disabled={submitting}
              >
                {submitting ? "Promoting..." : "Yes, Execute Promotion"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal (Success / Failure) */}
      {resultModal.show && (
        <div
          className="modal-backdrop"
          onClick={() => setResultModal((prev) => ({ ...prev, show: false }))}
        >
          <div
            className={`modal-card promotion-result-modal ${
              resultModal.success ? "result-success" : "result-failure"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="result-modal-header">
              <div className="result-icon-large">
                {resultModal.success ? "🎉" : "⚠️"}
              </div>
              <h2>{resultModal.title}</h2>
              <button
                className="modal-close-btn"
                onClick={() =>
                  setResultModal((prev) => ({ ...prev, show: false }))
                }
              >
                ✕
              </button>
            </div>

            <div className="result-modal-body">
              <p className="result-main-message">{resultModal.message}</p>

              {resultModal.details && (
                <div className="result-details-card">
                  <div className="result-detail-highlight-grid">
                    <div className="result-highlight-card target-highlight">
                      <span className="rh-tag">
                        🎯 PROMOTED TO (NEW RECORD)
                      </span>
                      <h4 className="rh-title">
                        {resultModal.details.targetClass} -{" "}
                        {resultModal.details.targetSection}
                      </h4>
                      <div className="rh-meta">
                        <span>
                          📅 <strong>Academic Year:</strong>{" "}
                          {resultModal.details.targetYear}
                        </span>
                        <span>
                          🏢 <strong>Department:</strong>{" "}
                          {resultModal.details.targetDepartment}
                        </span>
                      </div>
                    </div>

                    <div className="result-highlight-card source-highlight">
                      <span className="rh-tag">
                        📜 FROM SOURCE (PRESERVED AS PROMOTED)
                      </span>
                      <h4 className="rh-title">
                        {resultModal.details.sourceClass} -{" "}
                        {resultModal.details.sourceSection}
                      </h4>
                      <div className="rh-meta">
                        <span>
                          📅 <strong>Academic Year:</strong>{" "}
                          {resultModal.details.sourceYear}
                        </span>
                        <span>
                          🏢 <strong>Department:</strong>{" "}
                          {resultModal.details.sourceDepartment}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="result-summary-footer">
                    <span>👥 Total Students Promoted:</span>
                    <strong>{resultModal.details.count} Student(s)</strong>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className={`btn-result-close ${
                  resultModal.success ? "btn-success-close" : "btn-fail-close"
                }`}
                onClick={() =>
                  setResultModal((prev) => ({ ...prev, show: false }))
                }
              >
                {resultModal.success ? "Great, Done!" : "Close & Try Again"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromoteStudent;
