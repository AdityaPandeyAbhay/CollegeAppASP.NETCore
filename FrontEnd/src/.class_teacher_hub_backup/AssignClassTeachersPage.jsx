// =====================================================
// ASSIGN TEACHERS TO CLASS - DEDICATED PAGE
// Supports multi-teacher, multi-subject assignment for a class/section
// and single Class Teacher designation per class/section.
// Enforces:
// 1. A teacher can be Subject Teacher in multiple classes
// 2. A teacher can ONLY be Class Teacher in 1 class per academic year
// =====================================================

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllClassTeachersWithDetails,
  getAllAcademicYearsList,
  assignMultipleTeachersToClass,
} from "../../Services/classTeacherService";
import { getAllClasses } from "../../Services/classService";
import { getAllSections } from "../../Services/sectionService";
import {
  getAllTeachers,
  isTeacherSoftDeleted,
} from "../../Services/teacherService";
import { getDepartmentDropdown } from "../../Services/departmentService";
import { getSubjectDropdown } from "../../Services/subjectService";
import { getRole } from "../../Utils/auth";
import "./AssignClassTeachersPage.css";

// Robust Teacher Full Name & Code Resolver
export const getTeacherDisplayName = (t) => {
  if (!t) return "Faculty Member";
  if (typeof t === "string") return t.trim();

  // 1. Direct name properties
  const direct =
    t.TeacherName ||
    t.teacherName ||
    t.FullName ||
    t.fullName ||
    t.name ||
    t.Name ||
    t.text ||
    t.Text ||
    t.employeeName ||
    t.EmployeeName;

  if (direct && typeof direct === "string" && direct.trim()) {
    return direct.trim();
  }

  // 2. Combining parts (FirstName, MiddleName, LastName)
  const parts = [
    t.FirstName ?? t.firstName,
    t.MiddleName ?? t.middleName,
    t.LastName ?? t.lastName,
  ]
    .filter(Boolean)
    .map((s) => String(s).trim())
    .filter(Boolean)
    .join(" ");

  if (parts) return parts;

  // 3. Fallback
  const code =
    t.TeacherCode ?? t.teacherCode ?? t.employeeCode ?? t.EmployeeCode;
  if (code) return `Teacher (${code})`;

  return t.id ?? t.Id ? `Teacher #${t.id ?? t.Id}` : "Faculty Member";
};

function AssignClassTeachersPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = location.state || {};

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

  // ===================================================
  // MAIN DATA STATE
  // ===================================================
  const [allocations, setAllocations] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [allClasses, setAllClasses] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState("");

  // Hierarchy Selection State
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(
    navState.academicYearId || ""
  );
  const [selectedDeptId, setSelectedDeptId] = useState(
    navState.departmentId || ""
  );
  const [selectedClassId, setSelectedClassId] = useState(
    navState.classId || ""
  );
  const [selectedSectionId, setSelectedSectionId] = useState(
    navState.sectionId || ""
  );

  // Dynamic Teacher Allocation Rows
  // Each entry: { rowId, teacherId, subjectIds: [], isClassTeacher: false }
  const [teacherRows, setTeacherRows] = useState([
    {
      rowId: 1,
      teacherId: "",
      subjectIds: [],
      isClassTeacher: false,
    },
  ]);

  // Toast Notification
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 5000);
  };

  // Conflict Modal
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    title: "",
    message: "",
  });

  // ===================================================
  // DATA FETCHING
  // ===================================================
  useEffect(() => {
    const fetchPrerequisites = async () => {
      try {
        setLoading(true);
        setPageError("");

        const [
          yearsRes,
          deptsRes,
          classesRes,
          sectionsRes,
          subjectsRes,
          teachersRes,
        ] = await Promise.all([
          getAllAcademicYearsList().catch(() => []),
          getDepartmentDropdown().catch(() => []),
          getAllClasses().catch(() => []),
          getAllSections().catch(() => []),
          getSubjectDropdown().catch(() => []),
          getAllTeachers().catch(() => []),
        ]);

        const yList = Array.isArray(yearsRes) ? yearsRes : [];
        setAcademicYears(yList);

        // Auto-select current academic year if not provided
        let currentAyId = navState.academicYearId;
        if (!currentAyId) {
          const activeAy = yList.find(
            (y) => y.isCurrent || y.IsCurrent || y.active || y.status === "Active"
          );
          currentAyId = activeAy
            ? String(activeAy.id ?? activeAy.Id)
            : yList.length > 0
              ? String(yList[0].id ?? yList[0].Id)
              : "";
        }
        setSelectedAcademicYearId(currentAyId);

        setDepartments(Array.isArray(deptsRes) ? deptsRes : []);
        setAllClasses(Array.isArray(classesRes) ? classesRes : []);
        setAllSections(Array.isArray(sectionsRes) ? sectionsRes : []);
        setAllSubjects(Array.isArray(subjectsRes) ? subjectsRes : []);

        const validTeachers = (
          Array.isArray(teachersRes) ? teachersRes : []
        ).filter((t) => !isTeacherSoftDeleted(t));
        setTeachers(validTeachers);

        // Fetch allocations for the selected academic year to track existing Class Teachers
        if (currentAyId) {
          const allocsRes = await getAllClassTeachersWithDetails(
            currentAyId
          ).catch(() => []);
          setAllocations(Array.isArray(allocsRes) ? allocsRes : []);
        }
      } catch (err) {
        console.error("Failed to load prerequisite data:", err);
        setPageError("Failed to load required data. Please refresh or retry.");
      } finally {
        setLoading(false);
      }
    };

    fetchPrerequisites();
  }, []);

  // When Academic Year changes, reload allocations to track CT conflicts
  const handleAcademicYearChange = async (newAyId) => {
    setSelectedAcademicYearId(newAyId);
    try {
      const allocsRes = await getAllClassTeachersWithDetails(newAyId).catch(
        () => []
      );
      setAllocations(Array.isArray(allocsRes) ? allocsRes : []);
    } catch (e) {
      console.warn("Notice: reload allocations for AY:", e);
    }
  };

  // ===================================================
  // HIERARCHICAL FILTERING (DEPT -> CLASS -> SECTION)
  // ===================================================
  const filteredClasses = useMemo(() => {
    if (!selectedDeptId) return allClasses;
    return allClasses.filter((c) => {
      const dId = c.departmentId ?? c.DepartmentId ?? c.deptId;
      return String(dId) === String(selectedDeptId);
    });
  }, [allClasses, selectedDeptId]);

  const filteredSections = useMemo(() => {
    if (!selectedClassId) return [];
    return allSections.filter((s) => {
      const cId = s.classId ?? s.ClassId ?? s.schoolClassId ?? s.SchoolClassId;
      return String(cId) === String(selectedClassId);
    });
  }, [allSections, selectedClassId]);

  // When Department changes, reset class and section
  const handleDeptChange = (deptId) => {
    setSelectedDeptId(deptId);
    setSelectedClassId("");
    setSelectedSectionId("");
  };

  // When Class changes, reset section
  const handleClassChange = (classId) => {
    setSelectedClassId(classId);
    setSelectedSectionId("");
  };

  // ===================================================
  // CURRENT ROSTER FOR SELECTED CLASS & SECTION
  // ===================================================
  const currentClassAllocation = useMemo(() => {
    if (!selectedClassId || !selectedSectionId) return null;
    return (
      allocations.find(
        (a) =>
          String(a.classId) === String(selectedClassId) &&
          String(a.sectionId) === String(selectedSectionId)
      ) || null
    );
  }, [allocations, selectedClassId, selectedSectionId]);

  // Helper to load current roster into form
  const handleLoadCurrentRoster = () => {
    if (!currentClassAllocation) return;
    const subjectTeachers = currentClassAllocation.subjectTeachers || [];

    if (subjectTeachers.length === 0) {
      // If there's an assigned Class Teacher without subject breakdown
      if (currentClassAllocation.teacher) {
        setTeacherRows([
          {
            rowId: Date.now(),
            teacherId: String(
              currentClassAllocation.teacher.id ??
                currentClassAllocation.teacher.Id
            ),
            subjectIds: [],
            isClassTeacher: true,
          },
        ]);
        showToast("success", "Loaded current Class Teacher into form.");
      } else {
        showToast("info", "No faculty currently assigned to this class.");
      }
      return;
    }

    const rows = subjectTeachers.map((st, idx) => ({
      rowId: Date.now() + idx,
      teacherId: String(st.teacherId),
      subjectIds: (st.subjects || []).map((s) => String(s.id)),
      isClassTeacher: Boolean(st.isClassTeacher),
    }));

    setTeacherRows(rows);
    showToast(
      "success",
      `Loaded ${rows.length} existing faculty member(s) into the form!`
    );
  };

  // ===================================================
  // CONFLICT DETECTOR HELPER
  // Checks if a teacher is ALREADY a Class Teacher in another class
  // ===================================================
  const getTeacherCTConflict = (teacherId) => {
    if (!teacherId || !selectedAcademicYearId) return null;

    // Look through allocations for another class where this teacher is assigned as Class Teacher
    const conflict = allocations.find((alloc) => {
      const isSameClass =
        String(alloc.classId) === String(selectedClassId) &&
        String(alloc.sectionId) === String(selectedSectionId);
      if (isSameClass) return false; // Not a conflict if it's THIS class!

      const ctId = alloc.teacher?.id ?? alloc.teacher?.Id;
      return String(ctId) === String(teacherId) && alloc.isAssigned;
    });

    if (conflict) {
      return {
        className: conflict.className || `Class ${conflict.classId}`,
        sectionName: conflict.sectionName || `Section ${conflict.sectionId}`,
      };
    }
    return null;
  };

  // Available teachers filtered by department (or all if no dept selected)
  const availableTeachers = useMemo(() => {
    if (!selectedDeptId) return teachers;
    return teachers.filter((t) => {
      const dId = t.departmentId ?? t.DepartmentId ?? t.deptId;
      const deptIds = t.departmentIds || t.DepartmentIds;
      if (Array.isArray(deptIds)) {
        return deptIds.some((id) => String(id) === String(selectedDeptId));
      }
      return String(dId) === String(selectedDeptId);
    });
  }, [teachers, selectedDeptId]);

  // Helper: Get subjects available for a given teacher
  const getTeacherAvailableSubjects = (teacherId) => {
    if (!teacherId) return [];
    const t = teachers.find(
      (tech) => String(tech.id ?? tech.Id) === String(teacherId)
    );
    if (!t) return allSubjects;

    const teacherSubIds =
      t.subjectIds ||
      t.SubjectIds ||
      (t.subjectId || t.SubjectId ? [t.subjectId || t.SubjectId] : []);

    if (Array.isArray(teacherSubIds) && teacherSubIds.length > 0) {
      const subs = allSubjects.filter((s) => {
        const sId = String(s.id ?? s.Id ?? s.code ?? s.Code);
        return teacherSubIds.some((tsId) => String(tsId) === sId);
      });
      if (subs.length > 0) return subs;
    }

    return allSubjects;
  };

  // ===================================================
  // ROW MANAGEMENT FUNCTIONS
  // ===================================================
  const handleAddTeacherRow = () => {
    setTeacherRows((prev) => [
      ...prev,
      {
        rowId: Date.now() + Math.random(),
        teacherId: "",
        subjectIds: [],
        isClassTeacher: false,
      },
    ]);
  };

  const handleRemoveTeacherRow = (rowId) => {
    if (teacherRows.length <= 1) {
      // Just reset the single row instead of removing
      setTeacherRows([
        {
          rowId: Date.now(),
          teacherId: "",
          subjectIds: [],
          isClassTeacher: false,
        },
      ]);
      return;
    }
    setTeacherRows((prev) => prev.filter((r) => r.rowId !== rowId));
  };

  const handleTeacherChange = (rowId, teacherId) => {
    setTeacherRows((prev) =>
      prev.map((r) => {
        if (r.rowId !== rowId) return r;

        // Auto-select first available subject if any
        const availSubs = getTeacherAvailableSubjects(teacherId);
        const defaultSubs = availSubs.length > 0 ? [String(availSubs[0].id ?? availSubs[0].Id ?? availSubs[0].code)] : [];

        // Check if teacher is already CT in another class; if yes, cannot be CT here
        const conflict = getTeacherCTConflict(teacherId);
        const shouldBeCT = conflict ? false : r.isClassTeacher;

        return {
          ...r,
          teacherId,
          subjectIds: defaultSubs,
          isClassTeacher: shouldBeCT,
        };
      })
    );
  };

  const handleToggleSubject = (rowId, subjectId) => {
    const sIdStr = String(subjectId);
    setTeacherRows((prev) =>
      prev.map((r) => {
        if (r.rowId !== rowId) return r;
        const exists = r.subjectIds.includes(sIdStr);
        const updatedSubs = exists
          ? r.subjectIds.filter((id) => id !== sIdStr)
          : [...r.subjectIds, sIdStr];
        return {
          ...r,
          subjectIds: updatedSubs,
        };
      })
    );
  };

  const handleSelectAllSubjects = (rowId, teacherId) => {
    const avail = getTeacherAvailableSubjects(teacherId);
    const allIds = avail.map((s) => String(s.id ?? s.Id ?? s.code ?? s.Code));
    setTeacherRows((prev) =>
      prev.map((r) => (r.rowId === rowId ? { ...r, subjectIds: allIds } : r))
    );
  };

  const handleClearSubjects = (rowId) => {
    setTeacherRows((prev) =>
      prev.map((r) => (r.rowId === rowId ? { ...r, subjectIds: [] } : r))
    );
  };

  // Radio-like designation: only ONE teacher can be Class Teacher for this class
  const handleToggleClassTeacher = (rowId) => {
    setTeacherRows((prev) =>
      prev.map((r) => {
        if (r.rowId === rowId) {
          const willBeCT = !r.isClassTeacher;
          // Verify conflict
          if (willBeCT) {
            const conflict = getTeacherCTConflict(r.teacherId);
            if (conflict) {
              setConflictModal({
                isOpen: true,
                title: "Cannot Designate as Class Teacher",
                message: `This teacher is already designated as Class Teacher for ${conflict.className} - ${conflict.sectionName} in this academic year. A teacher can only be Class Teacher for ONE class.`,
              });
              return { ...r, isClassTeacher: false };
            }
          }
          return { ...r, isClassTeacher: willBeCT };
        } else {
          // Other rows cannot be CT
          return { ...r, isClassTeacher: false };
        }
      })
    );
  };

  // ===================================================
  // SUBMIT ALL ASSIGNMENTS
  // ===================================================
  const handleSaveAll = async (e) => {
    e.preventDefault();

    if (!selectedAcademicYearId) {
      setPageError("Please select an Academic Year.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!selectedClassId) {
      setPageError("Please select a Class.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (!selectedSectionId) {
      setPageError("Please select a Section.");
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Filter valid rows
    const validRows = teacherRows.filter((r) => Boolean(r.teacherId));
    if (validRows.length === 0) {
      setPageError("Please add at least one teacher with assigned subjects.");
      return;
    }

    // Check duplicate teachers in rows
    const teacherIdSet = new Set();
    for (const r of validRows) {
      if (teacherIdSet.has(r.teacherId)) {
        const dupTeacher = teachers.find(
          (t) => String(t.id ?? t.Id) === String(r.teacherId)
        );
        const name = getTeacherDisplayName(dupTeacher);
        setPageError(
          `${name} is added multiple times in the list. Please combine their subjects into a single entry.`
        );
        return;
      }
      teacherIdSet.add(r.teacherId);
    }

    // Check that each row has at least one subject
    for (const r of validRows) {
      if (!r.subjectIds || r.subjectIds.length === 0) {
        const tObj = teachers.find(
          (t) => String(t.id ?? t.Id) === String(r.teacherId)
        );
        const name = getTeacherDisplayName(tObj);
        setPageError(
          `Please select at least one subject for ${name}. Every teacher must teach at least one subject.`
        );
        return;
      }
    }

    // Format payload
    const cObj = allClasses.find(
      (c) => String(c.id ?? c.Id) === String(selectedClassId)
    );
    const sObj = allSections.find(
      (s) => String(s.id ?? s.Id) === String(selectedSectionId)
    );
    const cName = cObj?.className ?? cObj?.ClassName ?? `Class ${selectedClassId}`;
    const sName = sObj?.sectionName ?? sObj?.SectionName ?? `Section ${selectedSectionId}`;

    const formattedAllocations = validRows.map((r) => {
      const tObj = teachers.find(
        (t) => String(t.id ?? t.Id) === String(r.teacherId)
      );
      return {
        teacherId: r.teacherId,
        teacherName: getTeacherDisplayName(tObj),
        teacherCode:
          tObj?.TeacherCode ??
          tObj?.teacherCode ??
          tObj?.employeeCode ??
          tObj?.EmployeeCode ??
          "",
        subjectIds: r.subjectIds,
        isClassTeacher: Boolean(r.isClassTeacher),
      };
    });

    try {
      setSubmitting(true);
      setPageError("");

      await assignMultipleTeachersToClass({
        classId: selectedClassId,
        className: cName,
        sectionId: selectedSectionId,
        sectionName: sName,
        academicYearId: selectedAcademicYearId,
        allocations: formattedAllocations,
      });

      const ctName = formattedAllocations.find((a) => a.isClassTeacher)?.teacherName;
      const successMessage = ctName
        ? `Successfully assigned ${formattedAllocations.length} faculty member(s) to ${cName} - ${sName}, with ${ctName} designated as Class Teacher!`
        : `Successfully assigned ${formattedAllocations.length} faculty member(s) to ${cName} - ${sName}!`;

      showToast("success", successMessage);

      // Navigate back to overview after brief delay
      setTimeout(() => {
        navigate("/class-teachers", {
          state: {
            toast: {
              type: "success",
              message: successMessage,
            },
          },
        });
      }, 1200);
    } catch (err) {
      console.error("Failed to save class faculty allocations:", err);
      if (err.conflictType) {
        setConflictModal({
          isOpen: true,
          title: "Class Teacher Conflict",
          message: err.message,
        });
      } else {
        setPageError(
          err.message || "Failed to save assignments. Please check inputs and try again."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ===================================================
  // RENDER
  // ===================================================
  return (
    <div className="assign-page-wrapper">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`assign-toast toast-${toast.type}`}>
          <span className="toast-icon">
            {toast.type === "success" ? "✓" : "⚠️"}
          </span>
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={() => setToast({ show: false, type: "", message: "" })}
          >
            ✕
          </button>
        </div>
      )}

      {/* Conflict Modal */}
      {conflictModal.isOpen && (
        <div
          className="assign-conflict-overlay"
          onClick={() => setConflictModal({ isOpen: false, title: "", message: "" })}
        >
          <div
            className="assign-conflict-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="conflict-icon">🚫</div>
            <h3>{conflictModal.title}</h3>
            <p>{conflictModal.message}</p>
            <div className="conflict-actions">
              <button
                className="btn-conflict-dismiss"
                onClick={() =>
                  setConflictModal({ isOpen: false, title: "", message: "" })
                }
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="assign-page-container">
        {/* Top Breadcrumb Navigation */}
        <div className="assign-top-nav">
          <button
            type="button"
            className="btn-back-overview"
            onClick={() => navigate("/class-teachers")}
            title="Return to Class Teacher Overview"
          >
            ← Back to Allocations Overview
          </button>
          <span className="nav-page-badge">Full Class Assignment Mode</span>
        </div>

        {/* Page Header */}
        <div className="assign-header-strip">
          <div className="assign-titles">
            <h1 className="assign-main-title">
              Assign Teachers &amp; Faculty to Class
            </h1>
            <p className="assign-subtitle">
              Select the Class &amp; Section, then assign multiple faculty members with their subjects. Exactly one teacher can be designated as the Class Teacher.
            </p>
          </div>
        </div>

        {/* Page Inline Error */}
        {pageError && (
          <div className="assign-page-alert error">
            <span className="alert-icon">⚠️</span>
            <div className="alert-body">
              <strong>Error:</strong> {pageError}
            </div>
            <button
              className="alert-dismiss"
              onClick={() => setPageError("")}
            >
              ✕
            </button>
          </div>
        )}

        {loading ? (
          <div className="assign-loading-box">
            <div className="assign-spinner"></div>
            <p>Loading Class and Faculty configuration...</p>
          </div>
        ) : (
          <form onSubmit={handleSaveAll} className="assign-master-form">
            {/* =====================================================
                SECTION 1: TARGET CLASS & HIERARCHY SELECTOR
            ===================================================== */}
            <div className="assign-card hierarchy-card">
              <div className="card-header-badge">
                <span className="step-num">1</span>
                <div>
                  <h3>Select Target Class &amp; Section</h3>
                  <p>Choose the classroom to which faculty will be assigned</p>
                </div>
              </div>

              <div className="hierarchy-fields-grid">
                {/* 1. Academic Year */}
                <div className="field-group">
                  <label>
                    Academic Year <span className="req">*</span>
                  </label>
                  <select
                    value={selectedAcademicYearId}
                    onChange={(e) => handleAcademicYearChange(e.target.value)}
                    className="assign-select"
                  >
                    {academicYears.map((ay) => {
                      const yId = ay.id ?? ay.Id;
                      const yName = ay.yearName ?? ay.YearName;
                      return (
                        <option key={yId} value={yId}>
                          {yName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 2. Department */}
                <div className="field-group">
                  <label>Department (Optional Filter)</label>
                  <select
                    value={selectedDeptId}
                    onChange={(e) => handleDeptChange(e.target.value)}
                    className="assign-select"
                  >
                    <option value="">-- All Departments --</option>
                    {departments.map((d) => {
                      const dId = d.id ?? d.Id ?? d.code ?? d.Code;
                      const dName =
                        d.text ?? d.Text ?? d.name ?? d.Name ?? d.departmentName;
                      return (
                        <option key={dId} value={dId}>
                          {dName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 3. Class */}
                <div className="field-group">
                  <label>
                    Class <span className="req">*</span>
                  </label>
                  <select
                    value={selectedClassId}
                    onChange={(e) => handleClassChange(e.target.value)}
                    className="assign-select"
                  >
                    <option value="">-- Select Class --</option>
                    {filteredClasses.map((c) => {
                      const cId = c.id ?? c.Id;
                      const cName = c.className ?? c.ClassName;
                      const cDept = c.departmentName ?? c.DepartmentName;
                      return (
                        <option key={cId} value={cId}>
                          {cName}{cDept ? ` (${cDept})` : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* 4. Section */}
                <div className="field-group">
                  <label>
                    Section <span className="req">*</span>
                  </label>
                  <select
                    value={selectedSectionId}
                    onChange={(e) => setSelectedSectionId(e.target.value)}
                    disabled={!selectedClassId}
                    className="assign-select"
                  >
                    <option value="">-- Select Section --</option>
                    {filteredSections.map((s) => {
                      const sId = s.id ?? s.Id;
                      const sName = s.sectionName ?? s.SectionName;
                      return (
                        <option key={sId} value={sId}>
                          Section {sName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Current Roster Status Banner */}
              {selectedClassId && selectedSectionId && (
                <div className="current-class-status-banner">
                  <div className="status-banner-left">
                    <span className="banner-icon">🏫</span>
                    <div>
                      <h4>
                        Current Status for{" "}
                        {allClasses.find((c) => String(c.id ?? c.Id) === String(selectedClassId))?.className || `Class ${selectedClassId}`}{" "}
                        - Section{" "}
                        {allSections.find((s) => String(s.id ?? s.Id) === String(selectedSectionId))?.sectionName || `Section ${selectedSectionId}`}
                      </h4>
                      <p>
                        {currentClassAllocation?.isAssigned ? (
                          <>
                            <strong>Class Teacher:</strong>{" "}
                            <span className="assigned-name">
                              {currentClassAllocation.teacher?.teacherName ||
                                currentClassAllocation.teacher?.TeacherName}
                            </span>
                          </>
                        ) : (
                          <span className="vacant-tag">⚠️ Class Teacher Vacant</span>
                        )}
                        {" • "}
                        <strong>Faculty Assigned:</strong>{" "}
                        {(currentClassAllocation?.subjectTeachers || []).length} Teacher(s)
                      </p>
                    </div>
                  </div>

                  {currentClassAllocation && (
                    <button
                      type="button"
                      className="btn-load-roster"
                      onClick={handleLoadCurrentRoster}
                      title="Load the current faculty members of this class into the form below"
                    >
                      📥 Load Existing Roster to Edit
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* =====================================================
                SECTION 2: MULTI-TEACHER ALLOCATION CARDS
            ===================================================== */}
            <div className="assign-card faculty-list-card">
              <div className="card-header-badge">
                <span className="step-num">2</span>
                <div>
                  <h3>Teachers &amp; Subjects for this Class</h3>
                  <p>
                    Add each faculty member who teaches in this class, select their subjects, and optionally designate one as the Class Teacher.
                  </p>
                </div>
              </div>

              {/* Roster Rules Box */}
              <div className="rules-info-banner">
                <span className="info-icon">💡</span>
                <div className="info-text">
                  <strong>Assignment Rules:</strong>
                  <ul>
                    <li>
                      <strong>Subject Teacher:</strong> A teacher can be assigned as a Subject Teacher in <em>multiple classes and sections</em> without limit.
                    </li>
                    <li>
                      <strong>Class Teacher:</strong> A teacher can be designated as Class Teacher for <em>at most ONE class/section</em> per academic year. If already Class Teacher elsewhere, that option will be automatically locked.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Dynamic Teacher Rows */}
              <div className="teacher-cards-list">
                {teacherRows.map((row, idx) => {
                  const ctConflict = getTeacherCTConflict(row.teacherId);
                  const availSubs = getTeacherAvailableSubjects(row.teacherId);

                  return (
                    <div
                      key={row.rowId}
                      className={`teacher-allocation-card ${
                        row.isClassTeacher ? "is-class-teacher-card" : ""
                      }`}
                    >
                      {/* Card Header Bar */}
                      <div className="teacher-card-top-bar">
                        <div className="top-bar-left">
                          <span className="faculty-number-badge">
                            Faculty #{idx + 1}
                          </span>
                          {row.teacherId && (
                            <span className="faculty-card-name">
                              {getTeacherDisplayName(
                                teachers.find(
                                  (t) =>
                                    String(t.id ?? t.Id) ===
                                    String(row.teacherId)
                                )
                              )}
                            </span>
                          )}
                          {row.isClassTeacher && (
                            <span className="designated-ct-pill">
                              👑 Designated Class Teacher
                            </span>
                          )}
                          {!row.isClassTeacher && row.teacherId && (
                            <span className="subject-faculty-pill">
                              📚 Subject Teacher
                            </span>
                          )}
                        </div>

                        {teacherRows.length > 1 && (
                          <button
                            type="button"
                            className="btn-remove-card"
                            onClick={() => handleRemoveTeacherRow(row.rowId)}
                            title="Remove this teacher from this class"
                          >
                            🗑️ Remove
                          </button>
                        )}
                      </div>

                      {/* Teacher Selector Field */}
                      <div className="card-form-grid">
                        <div className="card-field-group">
                          <label>
                            Select Faculty / Teacher <span className="req">*</span>
                          </label>
                          <select
                            value={row.teacherId}
                            onChange={(e) =>
                              handleTeacherChange(row.rowId, e.target.value)
                            }
                            className="assign-select teacher-dropdown"
                          >
                            <option value="">-- Choose Faculty Member --</option>
                            {availableTeachers.map((t) => {
                              const tId = t.id ?? t.Id;
                              const tName = getTeacherDisplayName(t);
                              const tCode =
                                t.TeacherCode ??
                                t.teacherCode ??
                                t.employeeCode ??
                                t.EmployeeCode ??
                                "";
                              const otherCT = getTeacherCTConflict(tId);

                              const codeSuffix =
                                tCode && !tName.includes(tCode)
                                  ? ` (${tCode})`
                                  : "";
                              const ctStatus = otherCT
                                ? ` [CT in ${otherCT.className}-${otherCT.sectionName}]`
                                : "";

                              return (
                                <option key={tId} value={tId}>
                                  {tName}
                                  {codeSuffix}
                                  {ctStatus}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      </div>

                      {/* Multi-Subject Chips Grid */}
                      <div className="card-subjects-section">
                        <div className="subjects-title-row">
                          <label>
                            Assigned Subjects for this Class:{" "}
                            <span className="req">*</span>
                          </label>
                          {row.teacherId && availSubs.length > 0 && (
                            <div className="quick-subject-actions">
                              <button
                                type="button"
                                className="btn-chip-action"
                                onClick={() =>
                                  handleSelectAllSubjects(row.rowId, row.teacherId)
                                }
                              >
                                ✓ Select All
                              </button>
                              <button
                                type="button"
                                className="btn-chip-action clear"
                                onClick={() => handleClearSubjects(row.rowId)}
                              >
                                ✕ Clear
                              </button>
                              <span className="chip-count-tag">
                                {row.subjectIds.length} / {availSubs.length} selected
                              </span>
                            </div>
                          )}
                        </div>

                        {!row.teacherId ? (
                          <p className="no-teacher-prompt">
                            👉 Select a Faculty Member above to see their teaching subjects.
                          </p>
                        ) : availSubs.length === 0 ? (
                          <p className="no-teacher-prompt warning">
                            No subjects configured for this teacher profile.
                          </p>
                        ) : (
                          <div className="subject-chips-flex">
                            {availSubs.map((sub) => {
                              const sId = String(
                                sub.id ?? sub.Id ?? sub.code ?? sub.Code
                              );
                              const sName =
                                sub.text ??
                                sub.Text ??
                                sub.name ??
                                sub.Name ??
                                sub.subjectName ??
                                sub.SubjectName;
                              const isSelected = row.subjectIds.includes(sId);

                              return (
                                <button
                                  type="button"
                                  key={sId}
                                  className={`subject-chip-btn ${
                                    isSelected ? "active" : ""
                                  }`}
                                  onClick={() =>
                                    handleToggleSubject(row.rowId, sId)
                                  }
                                >
                                  <span className="chip-icon">
                                    {isSelected ? "✓" : "○"}
                                  </span>
                                  <span className="chip-label">{sName}</span>
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* Class Teacher Designation Bar */}
                      <div className="card-ct-designation-strip">
                        {ctConflict ? (
                          /* Teacher is ALREADY Class Teacher in another class -> Locked! */
                          <div className="ct-locked-state">
                            <span className="lock-icon">🚫</span>
                            <div className="lock-text">
                              <strong>Class Teacher Option Locked:</strong> This teacher is already the Class Teacher for{" "}
                              <span className="conflict-highlight">
                                {ctConflict.className} - {ctConflict.sectionName}
                              </span>
                              .
                              <p className="lock-sub">
                                A teacher can only be Class Teacher for 1 class per academic year. However, they can freely teach subjects in this class.
                              </p>
                            </div>
                          </div>
                        ) : (
                          /* Teacher is eligible to be Class Teacher */
                          <div
                            className={`ct-eligible-toggle ${
                              row.isClassTeacher ? "checked" : ""
                            }`}
                            onClick={() => handleToggleClassTeacher(row.rowId)}
                          >
                            <input
                              type="radio"
                              name="classTeacherSelection"
                              checked={row.isClassTeacher}
                              onChange={() => handleToggleClassTeacher(row.rowId)}
                              id={`ct-radio-${row.rowId}`}
                              className="ct-radio-input"
                            />
                            <label
                              htmlFor={`ct-radio-${row.rowId}`}
                              className="ct-radio-label"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <span className="ct-radio-title">
                                👑 Designate as Class Teacher
                              </span>
                              <span className="ct-radio-desc">
                                Only 1 teacher per class. Gives access to register verification, attendance locking, and daily declarations.
                              </span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add Faculty Button */}
              <div className="add-faculty-btn-wrap">
                <button
                  type="button"
                  className="btn-add-faculty"
                  onClick={handleAddTeacherRow}
                >
                  <span className="plus-sign">＋</span> Add Another Faculty Member to this Class
                </button>
              </div>
            </div>

            {/* =====================================================
                SECTION 3: ACTION BUTTONS (BOTTOM BAR)
            ===================================================== */}
            <div className="assign-footer-actions-bar">
              <button
                type="button"
                className="btn-cancel-action"
                onClick={() => navigate("/class-teachers")}
                disabled={submitting}
              >
                ✕ Cancel &amp; Return
              </button>

              <button
                type="submit"
                className="btn-save-all-action"
                disabled={submitting || !selectedClassId || !selectedSectionId}
              >
                {submitting ? (
                  <>
                    <span className="btn-spinner"></span> Saving Allocations...
                  </>
                ) : (
                  <>
                    <span className="btn-save-icon">💾</span> Save All Class Allocations
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default AssignClassTeachersPage;
