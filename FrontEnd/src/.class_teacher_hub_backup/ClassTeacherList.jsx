// =====================================================
// CLASS TEACHER & SUBJECT TEACHER ALLOCATION MANAGEMENT
// Single Unified Hub for Class Teachers & Subject Faculty
// =====================================================

import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllClassTeachersWithDetails,
  getAllAcademicYearsList,
  assignClassTeacher,
  unassignClassTeacher,
  assignTeacherToClassSubjects,
  removeTeacherFromClassSubjects,
  getSectionClassId,
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
import "./ClassTeacherList.css";

function ClassTeacherList() {
  const navigate = useNavigate();
  const location = useLocation();
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

  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [currentAcademicYearName, setCurrentAcademicYearName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all, assigned, vacant
  const [filterDepartment, setFilterDepartment] = useState("all");

  // Toast Notification State
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: "", message: "" });
    }, 4500);
  };

  // ===================================================
  // STEP-BY-STEP HIERARCHICAL ASSIGNMENT MODAL STATE
  // ===================================================
  const [assignmentModal, setAssignmentModal] = useState({
    isOpen: false,
    mode: "create", // "create" | "manage"
    targetAllocation: null,
    // Step 1: Department
    selectedDeptId: "",
    // Step 2: Class
    selectedClassId: "",
    // Step 3: Section
    selectedSectionId: "",
    // Academic Year
    selectedAyId: "",
    // Step 4: Teacher
    selectedTeacherId: "",
    // Step 5: Multi-Subject selection
    selectedSubjectIds: [],
    // Step 6: Designate as Class Teacher
    isClassTeacher: false,
    // Submission status
    submitting: false,
    error: "",
  });

  // ===================================================
  // FACULTY BREAKDOWN VIEW MODAL (FOR ROW)
  // ===================================================
  const [facultyModal, setFacultyModal] = useState({
    isOpen: false,
    allocation: null,
  });

  // ===================================================
  // CONFLICT WARNING POPUP MODAL STATE
  // ===================================================
  const [conflictModal, setConflictModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    details: null,
  });

  // ===================================================
  // DE-ASSIGN CLASS TEACHER CONFIRMATION MODAL STATE
  // ===================================================
  const [deassignModal, setDeassignModal] = useState({
    isOpen: false,
    allocation: null,
    submitting: false,
  });

  // ===================================================
  // REMOVE TEACHER FACULTY CONFIRMATION MODAL STATE
  // ===================================================
  const [removeFacultyModal, setRemoveFacultyModal] = useState({
    isOpen: false,
    allocation: null,
    teacher: null,
    submitting: false,
  });

  // ===================================================
  // INITIAL DATA FETCH
  // ===================================================
  const fetchData = async (yearIdToFetch = null) => {
    try {
      setLoading(true);
      setError("");

      const [
        detailsRes,
        rawTeachers,
        rawDepts,
        rawClasses,
        rawSections,
        rawSubjects,
        activeYears,
      ] = await Promise.all([
        getAllClassTeachersWithDetails(yearIdToFetch).catch((err) => {
          console.error("Failed to load class teacher details:", err);
          return { allocations: [], academicYears: [], currentYearId: "" };
        }),
        getAllTeachers().catch(() => []),
        getDepartmentDropdown().catch(() => []),
        getAllClasses().catch(() => []),
        getAllSections().catch(() => []),
        getSubjectDropdown().catch(() => []),
        getAllAcademicYearsList().catch(() => []),
      ]);

      const allocs = detailsRes?.allocations || [];
      const years = detailsRes?.academicYears || activeYears || [];
      setAllocations(allocs);
      setAcademicYears(years);

      const activeTeachers = (
        Array.isArray(rawTeachers) ? rawTeachers : []
      ).filter((t) => !isTeacherSoftDeleted(t));
      setTeachers(activeTeachers);

      setDepartments(Array.isArray(rawDepts) ? rawDepts : []);
      setAllClasses(Array.isArray(rawClasses) ? rawClasses : rawClasses?.data || []);
      setAllSections(Array.isArray(rawSections) ? rawSections : rawSections?.data || []);
      setAllSubjects(Array.isArray(rawSubjects) ? rawSubjects : []);

      // Resolve current academic year
      const curYearId =
        yearIdToFetch ||
        detailsRes?.currentYearId ||
        years.find((y) => y.isActive ?? y.IsActive)?.id ||
        years[0]?.id ||
        "";
      setSelectedAcademicYearId(curYearId ? String(curYearId) : "");

      const curYearObj = years.find((y) => String(y.id ?? y.Id) === String(curYearId));
      setCurrentAcademicYearName(
        curYearObj?.yearName || curYearObj?.YearName || detailsRes?.currentYearName || ""
      );
    } catch (err) {
      console.error("Critical error in ClassTeacherList fetchData:", err);
      setError("Failed to load class teacher allocations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    if (location.state?.toast) {
      showToast(location.state.toast.type, location.state.toast.message);
      window.history.replaceState({}, document.title);
    }
  }, []);

  const handleAcademicYearChange = (e) => {
    const newYearId = e.target.value;
    setSelectedAcademicYearId(newYearId);
    const yr = academicYears.find((y) => String(y.id ?? y.Id) === String(newYearId));
    setCurrentAcademicYearName(yr?.yearName || yr?.YearName || "");
    fetchData(newYearId);
  };

  // ===================================================
  // CASCADING OPTIONS FOR HIERARCHICAL ASSIGNMENT MODAL
  // ===================================================

  // 1. Classes filtered by selected Department
  const filteredModalClasses = useMemo(() => {
    if (!assignmentModal.selectedDeptId) return allClasses;
    return allClasses.filter((c) => {
      const cDeptId = c.departmentId ?? c.DepartmentId;
      return String(cDeptId) === String(assignmentModal.selectedDeptId);
    });
  }, [allClasses, assignmentModal.selectedDeptId]);

  // 2. Sections filtered by selected Class
  const filteredModalSections = useMemo(() => {
    if (!assignmentModal.selectedClassId) return allSections;
    return allSections.filter((s) => {
      const sClassId = getSectionClassId(s);
      return String(sClassId) === String(assignmentModal.selectedClassId);
    });
  }, [allSections, assignmentModal.selectedClassId]);

  // 3. Teachers filtered by selected Department
  const filteredModalTeachers = useMemo(() => {
    if (!assignmentModal.selectedDeptId) return teachers;
    return teachers.filter((t) => {
      // Direct DepartmentId
      const singleDeptId = t.departmentId ?? t.DepartmentId;
      if (singleDeptId && String(singleDeptId) === String(assignmentModal.selectedDeptId)) {
        return true;
      }
      // Multi-department array
      const deptIds = t.DepartmentIds || t.departmentIds || [];
      if (
        Array.isArray(deptIds) &&
        deptIds.some((id) => String(id) === String(assignmentModal.selectedDeptId))
      ) {
        return true;
      }
      return false;
    });
  }, [teachers, assignmentModal.selectedDeptId]);

  // 4. Subjects available for the selected Teacher
  const availableTeacherSubjects = useMemo(() => {
    if (!assignmentModal.selectedTeacherId) return [];
    const teacher = teachers.find(
      (t) => String(t.id ?? t.Id) === String(assignmentModal.selectedTeacherId)
    );
    if (!teacher) return allSubjects;

    // Check teacher assigned subjects
    const teacherSubjectIds = [
      ...(Array.isArray(teacher.SubjectIds) ? teacher.SubjectIds : []),
      ...(Array.isArray(teacher.subjectIds) ? teacher.subjectIds : []),
      ...(teacher.SubjectId ? [teacher.SubjectId] : []),
      ...(teacher.subjectId ? [teacher.subjectId] : []),
    ].map(String);

    if (teacherSubjectIds.length > 0) {
      const matched = allSubjects.filter((s) => {
        const sId = String(s.id ?? s.Id ?? s.code ?? s.Code);
        return teacherSubjectIds.includes(sId);
      });
      return matched.length > 0 ? matched : allSubjects;
    }

    return allSubjects;
  }, [teachers, allSubjects, assignmentModal.selectedTeacherId]);

  // ===================================================
  // MODAL OPEN / CLOSE HANDLERS
  // ===================================================

  // Navigate to Dedicated Full-Page Assignment View
  const handleOpenCreateModal = () => {
    navigate("/class-teachers/assign", {
      state: { academicYearId: selectedAcademicYearId },
    });
  };

  // Open in "Manage" mode for a specific row -> Navigate to full page with pre-selected class & section
  const handleOpenManageModal = (allocation) => {
    navigate("/class-teachers/assign", {
      state: {
        academicYearId: allocation.academicYearId || selectedAcademicYearId,
        departmentId: allocation.departmentId,
        classId: allocation.classId,
        sectionId: allocation.sectionId,
      },
    });
  };

  // ===================================================
  // HIERARCHICAL FORM CHANGE HANDLERS
  // ===================================================

  // Department changed -> Reset class, section, teacher, subjects
  const handleModalDeptChange = (e) => {
    const deptId = e.target.value;
    setAssignmentModal((prev) => ({
      ...prev,
      selectedDeptId: deptId,
      selectedClassId: "",
      selectedSectionId: "",
      selectedTeacherId: "",
      selectedSubjectIds: [],
      error: "",
    }));
  };

  // Class changed -> Reset section
  const handleModalClassChange = (e) => {
    const classId = e.target.value;
    // Auto-detect Department if not yet set
    const cObj = allClasses.find((c) => String(c.id ?? c.Id) === String(classId));
    const autoDeptId = cObj ? cObj.departmentId ?? cObj.DepartmentId : "";

    setAssignmentModal((prev) => ({
      ...prev,
      selectedClassId: classId,
      selectedSectionId: "",
      selectedDeptId: prev.selectedDeptId || (autoDeptId ? String(autoDeptId) : ""),
      error: "",
    }));
  };

  // Teacher changed -> Pre-select their subjects
  const handleModalTeacherChange = (e) => {
    const tId = e.target.value;
    if (!tId) {
      setAssignmentModal((prev) => ({
        ...prev,
        selectedTeacherId: "",
        selectedSubjectIds: [],
        error: "",
      }));
      return;
    }

    const tObj = teachers.find((t) => String(t.id ?? t.Id) === String(tId));
    const tSubIds = [
      ...(Array.isArray(tObj?.SubjectIds) ? tObj.SubjectIds : []),
      ...(Array.isArray(tObj?.subjectIds) ? tObj.subjectIds : []),
      ...(tObj?.SubjectId ? [tObj.SubjectId] : []),
      ...(tObj?.subjectId ? [tObj.subjectId] : []),
    ].map(String);

    setAssignmentModal((prev) => ({
      ...prev,
      selectedTeacherId: tId,
      selectedSubjectIds: tSubIds.length > 0 ? tSubIds : [],
      error: "",
    }));
  };

  // Toggle subject selection chip
  const handleToggleSubject = (subIdStr) => {
    setAssignmentModal((prev) => {
      const exists = prev.selectedSubjectIds.includes(subIdStr);
      const next = exists
        ? prev.selectedSubjectIds.filter((id) => id !== subIdStr)
        : [...prev.selectedSubjectIds, subIdStr];
      return { ...prev, selectedSubjectIds: next, error: "" };
    });
  };

  // Quick Action: Select All Subjects
  const handleSelectAllSubjects = () => {
    const allIds = availableTeacherSubjects.map((s) =>
      String(s.id ?? s.Id ?? s.code ?? s.Code)
    );
    setAssignmentModal((prev) => ({
      ...prev,
      selectedSubjectIds: allIds,
      error: "",
    }));
  };

  // Quick Action: Clear Subjects
  const handleClearSubjects = () => {
    setAssignmentModal((prev) => ({
      ...prev,
      selectedSubjectIds: [],
      error: "",
    }));
  };

  // ===================================================
  // SAVE HIERARCHICAL ASSIGNMENT
  // ===================================================
  const handleSaveAssignment = async (e) => {
    e.preventDefault();
    const {
      selectedClassId,
      selectedSectionId,
      selectedTeacherId,
      selectedSubjectIds,
      selectedAyId,
      isClassTeacher,
    } = assignmentModal;

    if (!selectedClassId) {
      setAssignmentModal((prev) => ({ ...prev, error: "Please select a Class." }));
      return;
    }
    if (!selectedSectionId) {
      setAssignmentModal((prev) => ({ ...prev, error: "Please select a Section." }));
      return;
    }
    if (!selectedTeacherId) {
      setAssignmentModal((prev) => ({ ...prev, error: "Please select a Faculty/Teacher." }));
      return;
    }
    if (!selectedSubjectIds || selectedSubjectIds.length === 0) {
      setAssignmentModal((prev) => ({
        ...prev,
        error: "Please select at least one Subject for this teacher to teach.",
      }));
      return;
    }
    if (!selectedAyId) {
      setAssignmentModal((prev) => ({ ...prev, error: "Please select an Academic Year." }));
      return;
    }

    try {
      setAssignmentModal((prev) => ({ ...prev, submitting: true, error: "" }));

      const cObj = allClasses.find((c) => String(c.id ?? c.Id) === String(selectedClassId));
      const sObj = allSections.find((s) => String(s.id ?? s.Id) === String(selectedSectionId));
      const tObj = teachers.find((t) => String(t.id ?? t.Id) === String(selectedTeacherId));

      const cName = cObj?.className || cObj?.ClassName || `Class ${selectedClassId}`;
      const sName = sObj?.sectionName || sObj?.SectionName || `Section ${selectedSectionId}`;
      const tName = tObj?.TeacherName || tObj?.teacherName || `Teacher ${selectedTeacherId}`;

      await assignTeacherToClassSubjects({
        classId: selectedClassId,
        className: cName,
        sectionId: selectedSectionId,
        sectionName: sName,
        teacherId: selectedTeacherId,
        teacherName: tName,
        subjectIds: selectedSubjectIds,
        academicYearId: selectedAyId,
        isClassTeacher,
      });

      showToast(
        "success",
        `${tName} successfully assigned to ${cName} - ${sName} with ${selectedSubjectIds.length} subject(s)!`
      );

      handleCloseAssignmentModal();
      await fetchData(selectedAcademicYearId);
    } catch (err) {
      console.error("Assignment error:", err);
      // Conflict Warning Modal Trigger
      if (err.conflictType) {
        setConflictModal({
          isOpen: true,
          title: "Class Teacher Conflict Detected",
          message: err.message,
          details: {
            conflictType: err.conflictType,
            otherClassName: err.otherClassName,
            otherSectionName: err.otherSectionName,
            conflictTeacherName: err.conflictTeacherName,
          },
        });
      } else {
        setAssignmentModal((prev) => ({
          ...prev,
          error: err.message || "Failed to save assignment. Please try again.",
        }));
      }
    } finally {
      setAssignmentModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // ===================================================
  // DE-ASSIGN CLASS TEACHER HANDLER
  // ===================================================
  const handleOpenDeassignModal = (allocation) => {
    setDeassignModal({
      isOpen: true,
      allocation,
      submitting: false,
    });
  };

  const handleConfirmDeassign = async () => {
    const { allocation } = deassignModal;
    if (!allocation) return;

    try {
      setDeassignModal((prev) => ({ ...prev, submitting: true }));
      await unassignClassTeacher(
        allocation.classId,
        allocation.sectionId,
        allocation.academicYearId || selectedAcademicYearId
      );
      showToast(
        "success",
        `Class Teacher de-assigned from ${allocation.className} - ${allocation.sectionName}.`
      );
      setDeassignModal({ isOpen: false, allocation: null, submitting: false });
      await fetchData(selectedAcademicYearId);
    } catch (err) {
      console.error("Failed to de-assign Class Teacher:", err);
      showToast("error", err.message || "Failed to de-assign Class Teacher.");
      setDeassignModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // ===================================================
  // REMOVE TEACHER FROM CLASS FACULTY HANDLER
  // ===================================================
  const handleOpenRemoveFacultyModal = (allocation, teacher) => {
    setRemoveFacultyModal({
      isOpen: true,
      allocation,
      teacher,
      submitting: false,
    });
  };

  const handleConfirmRemoveFaculty = async () => {
    const { allocation, teacher } = removeFacultyModal;
    if (!allocation || !teacher) return;

    try {
      setRemoveFacultyModal((prev) => ({ ...prev, submitting: true }));
      await removeTeacherFromClassSubjects({
        classId: allocation.classId,
        sectionId: allocation.sectionId,
        teacherId: teacher.teacherId,
        academicYearId: allocation.academicYearId || selectedAcademicYearId,
        assignmentIds: teacher.assignmentIds,
      });

      showToast(
        "success",
        `${teacher.teacherName} removed from ${allocation.className} - ${allocation.sectionName}.`
      );
      setRemoveFacultyModal({
        isOpen: false,
        allocation: null,
        teacher: null,
        submitting: false,
      });

      // Also close modal if manage modal was open
      if (assignmentModal.isOpen && assignmentModal.mode === "manage") {
        handleCloseAssignmentModal();
      }
      if (facultyModal.isOpen) {
        setFacultyModal({ isOpen: false, allocation: null });
      }

      await fetchData(selectedAcademicYearId);
    } catch (err) {
      console.error("Failed to remove faculty:", err);
      showToast("error", err.message || "Failed to remove teacher from class.");
      setRemoveFacultyModal((prev) => ({ ...prev, submitting: false }));
    }
  };

  // ===================================================
  // HELPER: ROBUST DEPARTMENT DISPLAY RESOLUTION
  // ===================================================
  const getDeptDisplayName = (item) => {
    // 1. Direct from item if already present and valid
    if (item.departmentName && item.departmentName !== "General" && String(item.departmentName).trim() !== "") {
      return item.departmentName;
    }
    if (item.DepartmentName && item.DepartmentName !== "General" && String(item.DepartmentName).trim() !== "") {
      return item.DepartmentName;
    }

    // 2. Lookup in allClasses by classId
    const cObj = allClasses.find((c) => String(c.id ?? c.Id) === String(item.classId));
    if (cObj) {
      const cDeptName =
        cObj.DepartmentName ||
        cObj.departmentName ||
        cObj.Department?.Name ||
        cObj.Department?.DepartmentName;
      if (cDeptName && cDeptName !== "General" && String(cDeptName).trim() !== "") {
        return cDeptName;
      }
    }

    // 3. Lookup departmentId in departments dropdown
    const dId = item.departmentId ?? item.DepartmentId ?? cObj?.departmentId ?? cObj?.DepartmentId;
    if (dId !== null && dId !== undefined && departments.length > 0) {
      const found = departments.find(
        (d) => String(d.id ?? d.Id ?? d.code ?? d.Code) === String(dId)
      );
      if (found) {
        const foundName =
          found.text ??
          found.Text ??
          found.name ??
          found.Name ??
          found.departmentName ??
          found.DepartmentName;
        if (foundName && String(foundName).trim() !== "") {
          return foundName;
        }
      }
    }

    if (item.departmentName && item.departmentName !== "General") return item.departmentName;
    return "-";
  };

  // ===================================================
  // FILTERED ALLOCATIONS TABLE LIST
  // ===================================================
  const filteredAllocations = useMemo(() => {
    return allocations.filter((item) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const className = (item.className || "").toLowerCase();
        const sectionName = (item.sectionName || "").toLowerCase();
        const deptName = getDeptDisplayName(item).toLowerCase();
        const teacherName = (item.teacher?.teacherName || "").toLowerCase();
        const teacherCode = (item.teacher?.teacherCode || "").toLowerCase();
        const subjectTeachersNames = (item.subjectTeachers || [])
          .map((st) => (st.teacherName || "").toLowerCase())
          .join(" ");
        const subjectNames = (item.subjectTeachers || [])
          .flatMap((st) => (st.subjects || []).map((s) => (s.name || "").toLowerCase()))
          .join(" ");

        const matches =
          className.includes(query) ||
          sectionName.includes(query) ||
          deptName.includes(query) ||
          teacherName.includes(query) ||
          teacherCode.includes(query) ||
          subjectTeachersNames.includes(query) ||
          subjectNames.includes(query);

        if (!matches) return false;
      }

      // 2. Status Filter
      if (filterStatus === "assigned" && !item.isAssigned) return false;
      if (filterStatus === "vacant" && item.isAssigned) return false;

      // 3. Department Filter
      if (filterDepartment !== "all") {
        const cObj = allClasses.find((c) => String(c.id ?? c.Id) === String(item.classId));
        const itemDeptId = String(
          item.departmentId ??
          item.DepartmentId ??
          cObj?.departmentId ??
          cObj?.DepartmentId ??
          ""
        );
        if (itemDeptId !== String(filterDepartment)) {
          return false;
        }
      }

      return true;
    });
  }, [allocations, allClasses, departments, searchQuery, filterStatus, filterDepartment]);

  // Statistics
  const totalClassesCount = allocations.length;
  const assignedCTCount = allocations.filter((a) => a.isAssigned).length;
  const vacantCTCount = totalClassesCount - assignedCTCount;
  const totalFacultyAssignments = allocations.reduce(
    (acc, a) => acc + (a.subjectTeachers?.length || 0),
    0
  );

  return (
    <div className="class-teacher-page">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`ct-toast ct-toast-${toast.type}`}>
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

      <div className="class-teacher-container">
        {/* =====================================================
            HEADER & ACTIONS
        ===================================================== */}
        <div className="class-teacher-header">
          <div className="header-titles">
            <h1 className="main-title">
              Class Teachers &amp; Faculty Allocations
            </h1>
            <p className="sub-title">
              Comprehensive control hub: Department ➔ Class ➔ Section ➔ Faculty ➔ Subjects
            </p>
          </div>

          <div className="header-actions">
            {canManage && (
              <button
                className="btn-primary-action"
                onClick={handleOpenCreateModal}
                title="Hierarchical Class & Subject Teacher Assignment"
              >
                <span className="action-icon">＋</span> Assign Teachers to Class
              </button>
            )}
          </div>
        </div>

        {/* =====================================================
            STATISTICS STRIP
        ===================================================== */}
        <div className="ct-stat-strip">
          <div className="stat-card">
            <div className="stat-icon total">🏫</div>
            <div className="stat-content">
              <span className="stat-number">{totalClassesCount}</span>
              <span className="stat-label">Total Classes &amp; Sections</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon assigned">⭐</div>
            <div className="stat-content">
              <span className="stat-number">{assignedCTCount}</span>
              <span className="stat-label">Designated Class Teachers</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon vacant">⚠️</div>
            <div className="stat-content">
              <span className="stat-number">{vacantCTCount}</span>
              <span className="stat-label">Vacant Class Teachers</span>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon faculty">📚</div>
            <div className="stat-content">
              <span className="stat-number">{totalFacultyAssignments}</span>
              <span className="stat-label">Active Subject Assignments</span>
            </div>
          </div>
        </div>

        {/* =====================================================
            FILTER & SEARCH TOOLBAR
        ===================================================== */}
        <div className="class-teacher-toolbar">
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search by Class, Section, Teacher, or Subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                className="clear-search-btn"
                onClick={() => setSearchQuery("")}
                title="Clear Search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="filter-group">
            {/* Department Filter */}
            <div className="filter-item">
              <label>Department:</label>
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Departments</option>
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

            {/* CT Status Filter */}
            <div className="filter-item">
              <label>CT Status:</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="filter-select"
              >
                <option value="all">All Status</option>
                <option value="assigned">✓ Assigned CT</option>
                <option value="vacant">⚠️ Vacant CT</option>
              </select>
            </div>

            {/* Academic Year Filter */}
            <div className="filter-item">
              <label>Academic Year:</label>
              <select
                value={selectedAcademicYearId}
                onChange={handleAcademicYearChange}
                className="filter-select"
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
          </div>
        </div>

        {/* =====================================================
            MAIN CONTENT TABLE
        ===================================================== */}
        {loading ? (
          <div className="ct-loading-wrapper">
            <div className="ct-spinner"></div>
            <p>Loading class teacher and faculty allocations...</p>
          </div>
        ) : error ? (
          <div className="ct-error-state">
            <span className="error-icon">⚠️</span>
            <h3>Data Load Error</h3>
            <p>{error}</p>
            <button className="btn-retry" onClick={() => fetchData()}>
              🔄 Retry
            </button>
          </div>
        ) : filteredAllocations.length === 0 ? (
          <div className="ct-empty-state">
            <span className="empty-icon">📭</span>
            <h3>No Allocations Found</h3>
            <p>No classes or teacher assignments matched your current filters.</p>
            {canManage && (
              <button
                className="btn-primary-action"
                onClick={handleOpenCreateModal}
              >
                ＋ Assign Teachers to Class
              </button>
            )}
          </div>
        ) : (
          <div className="ct-table-responsive-container">
            <table className="ct-overview-table">
              <thead>
                <tr>
                  <th style={{ width: "16%" }}>Class &amp; Section</th>
                  <th style={{ width: "12%" }}>Department</th>
                  <th style={{ width: "10%" }}>Academic Year</th>
                  <th style={{ width: "22%" }}>Class Teacher</th>
                  <th style={{ width: "22%" }}>Subject Teachers (Assigned to Teach)</th>
                  <th style={{ width: "8%", textAlign: "center" }}>Students</th>
                  <th style={{ width: "10%", textAlign: "center" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAllocations.map((item) => {
                  const ct = item.teacher;
                  const hasPhoto = !!(ct?.photo || ct?.Photo || ct?.profilePhotoPath);
                  const photoSrc = ct?.photo || ct?.Photo || ct?.profilePhotoPath;
                  const combinedParts = [
                    ct?.FirstName ?? ct?.firstName,
                    ct?.MiddleName ?? ct?.middleName,
                    ct?.LastName ?? ct?.lastName,
                  ]
                    .filter(Boolean)
                    .map((s) => String(s).trim())
                    .filter(Boolean)
                    .join(" ");

                  const teacherName =
                    ct?.teacherName ||
                    ct?.TeacherName ||
                    ct?.fullName ||
                    ct?.FullName ||
                    ct?.name ||
                    ct?.Name ||
                    combinedParts ||
                    "Assigned Teacher";
                  const teacherCode =
                    ct?.teacherCode ||
                    ct?.TeacherCode ||
                    ct?.employeeCode ||
                    ct?.EmployeeCode ||
                    "";
                  const subjectTeachers = item.subjectTeachers || [];

                  return (
                    <tr key={item.key} className={item.isAssigned ? "row-assigned" : "row-vacant"}>
                      {/* Class & Section */}
                      <td>
                        <div className="cell-class-info">
                          <span className="cell-class-title">{item.className}</span>
                          <span className="cell-section-badge">
                            {item.sectionName?.toLowerCase().startsWith("section")
                              ? item.sectionName
                              : `Section ${item.sectionName}`}
                          </span>
                          {item.sectionCode && (
                            <span className="cell-subcode">{item.sectionCode}</span>
                          )}
                        </div>
                      </td>

                      {/* Department */}
                      <td>
                        <span className="cell-dept-badge">
                          {getDeptDisplayName(item)}
                        </span>
                      </td>

                      {/* Academic Year */}
                      <td>
                        <span className="cell-ay-pill">
                          {item.academicYearName || currentAcademicYearName || "Current"}
                        </span>
                      </td>

                      {/* Class Teacher */}
                      <td>
                        {item.isAssigned && ct ? (
                          <div className="cell-teacher-card">
                            <div className="ct-avatar-small">
                              {hasPhoto ? (
                                <img
                                  src={photoSrc}
                                  alt={teacherName}
                                  onError={(e) => {
                                    e.target.style.display = "none";
                                    if (e.target.nextSibling) {
                                      e.target.nextSibling.style.display = "flex";
                                    }
                                  }}
                                />
                              ) : null}
                              <div
                                className="ct-avatar-placeholder-small"
                                style={{ display: hasPhoto ? "none" : "flex" }}
                              >
                                {teacherName.charAt(0).toUpperCase()}
                              </div>
                            </div>
                            <div className="ct-teacher-info-text">
                              <span className="ct-name">{teacherName}</span>
                              {teacherCode && (
                                <span className="ct-code">ID: {teacherCode}</span>
                              )}
                              {canManage && (
                                <div className="ct-inline-btn-group">
                                  <button
                                    className="ct-link-btn change"
                                    onClick={() => handleOpenManageModal(item)}
                                    title="Change Class Teacher"
                                  >
                                    Change
                                  </button>
                                  <button
                                    className="ct-link-btn deassign"
                                    onClick={() => handleOpenDeassignModal(item)}
                                    title="De-assign Class Teacher"
                                  >
                                    De-assign
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="cell-vacant-indicator">
                            <span className="vacant-pill">⚠️ Not Assigned</span>
                            {canManage && (
                              <button
                                className="ct-btn-assign-small"
                                onClick={() => handleOpenManageModal(item)}
                              >
                                ＋ Assign
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Subject Teachers (Assigned to Teach) */}
                      <td>
                        {subjectTeachers.length === 0 ? (
                          <span className="no-faculty-pill">
                            ⚠️ Not Assigned
                          </span>
                        ) : (
                          <div className="ct-subject-teachers-cell">
                            {/* Render first 2 faculty chips */}
                            {subjectTeachers.slice(0, 2).map((st) => {
                              const subjectNames = (st.subjects || [])
                                .map((s) => s.name)
                                .join(", ");
                              return (
                                <div key={st.teacherId} className="ct-faculty-chip">
                                  <span className="faculty-name">
                                    {st.teacherName}
                                  </span>
                                  {subjectNames && (
                                    <span className="faculty-subjects">
                                      ({subjectNames})
                                    </span>
                                  )}
                                  {st.isClassTeacher ? (
                                    <span className="ct-star-badge" title="Designated Class Teacher">
                                      ⭐ CT
                                    </span>
                                  ) : (
                                    <span className="sub-teacher-badge">
                                      📚
                                    </span>
                                  )}
                                </div>
                              );
                            })}

                            {/* View All Button if > 2 faculty members */}
                            {subjectTeachers.length > 2 && (
                              <button
                                className="ct-btn-view-all-faculty"
                                onClick={() =>
                                  setFacultyModal({
                                    isOpen: true,
                                    allocation: item,
                                  })
                                }
                              >
                                👁️ View All ({subjectTeachers.length})
                              </button>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Students Count */}
                      <td style={{ textAlign: "center" }}>
                        <span className="ct-student-count-badge">
                          👥 {item.studentCount}
                        </span>
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: "center" }}>
                        <div className="table-actions-cluster">
                          {canManage && (
                            <button
                              className="ct-btn-action ct-btn-manage"
                              title="Manage Class Faculty &amp; Subjects"
                              onClick={() => handleOpenManageModal(item)}
                            >
                              ⚙️ Manage
                            </button>
                          )}
                          <button
                            className="ct-btn-action ct-btn-take"
                            title="Take Attendance for this class"
                            onClick={() =>
                              navigate(
                                `/attendance/take?classId=${item.classId}&sectionId=${item.sectionId}`
                              )
                            }
                          >
                            📋 Take
                          </button>
                          <button
                            className="ct-btn-action ct-btn-register"
                            title="View Attendance Register"
                            onClick={() =>
                              navigate(
                                `/attendance/register?classId=${item.classId}&sectionId=${item.sectionId}`
                              )
                            }
                          >
                            📊 Register
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>



      {/* =====================================================
          VIEW ALL FACULTY MODAL (ROW POPUP)
      ===================================================== */}
      {facultyModal.isOpen && facultyModal.allocation && (
        <div
          className="ct-modal-overlay"
          onClick={() => setFacultyModal({ isOpen: false, allocation: null })}
        >
          <div
            className="ct-modal-card ct-faculty-breakdown-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="ct-modal-header">
              <div>
                <h2>
                  Faculty Roster: {facultyModal.allocation.className} -{" "}
                  {facultyModal.allocation.sectionName}
                </h2>
                <p className="modal-header-desc">
                  All active faculty and teaching subjects assigned to this class
                </p>
              </div>
              <button
                className="ct-modal-close"
                onClick={() => setFacultyModal({ isOpen: false, allocation: null })}
              >
                ✕
              </button>
            </div>

            <div className="ct-faculty-roster-list">
              {(facultyModal.allocation.subjectTeachers || []).map((st) => (
                <div key={st.teacherId} className="roster-item-card">
                  <div className="roster-avatar">
                    {st.photo ? (
                      <img src={st.photo} alt={st.teacherName} />
                    ) : (
                      <div className="avatar-fallback">
                        {st.teacherName.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="roster-details">
                    <div className="roster-name-row">
                      <h4>{st.teacherName}</h4>
                      {st.isClassTeacher ? (
                        <span className="roster-ct-badge">⭐ Designated Class Teacher</span>
                      ) : (
                        <span className="roster-sub-badge">📚 Subject Teacher</span>
                      )}
                    </div>
                    {st.teacherCode && (
                      <p className="roster-code">Employee ID: {st.teacherCode}</p>
                    )}
                    <div className="roster-subjects-pill-list">
                      <strong>Subjects Taught:</strong>
                      {(st.subjects || []).length > 0 ? (
                        (st.subjects || []).map((sub) => (
                          <span key={sub.id} className="subject-chip-pill">
                            {sub.name}
                          </span>
                        ))
                      ) : (
                        <span className="none-text">No specific subject recorded</span>
                      )}
                    </div>
                  </div>
                  {canManage && (
                    <button
                      className="btn-faculty-remove-roster"
                      onClick={() =>
                        handleOpenRemoveFacultyModal(facultyModal.allocation, st)
                      }
                      title="Remove teacher from this class"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="ct-modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setFacultyModal({ isOpen: false, allocation: null })}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          CONFLICT WARNING POPUP MODAL
      ===================================================== */}
      {conflictModal.isOpen && (
        <div
          className="ct-modal-overlay"
          onClick={() => setConflictModal({ isOpen: false, title: "", message: "", details: null })}
        >
          <div
            className="ct-modal-card ct-conflict-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="conflict-icon-header">
              <span className="conflict-alert-icon">⚠️</span>
              <h3>{conflictModal.title}</h3>
            </div>
            <p className="conflict-desc">{conflictModal.message}</p>

            <div className="conflict-guidance-box">
              <h4>System Policy Guidelines:</h4>
              <ul>
                <li>Each Class &amp; Section can only have <strong>one</strong> designated Class Teacher.</li>
                <li>A Teacher can only serve as Class Teacher for <strong>one</strong> class in any academic year.</li>
                <li>
                  To assign this teacher, either unassign the existing Class Teacher first or remove their CT designation from the other class.
                </li>
              </ul>
            </div>

            <div className="ct-modal-actions">
              <button
                className="btn-submit-save"
                onClick={() =>
                  setConflictModal({
                    isOpen: false,
                    title: "",
                    message: "",
                    details: null,
                  })
                }
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          DE-ASSIGN CLASS TEACHER CONFIRMATION MODAL
      ===================================================== */}
      {deassignModal.isOpen && deassignModal.allocation && (
        <div
          className="ct-modal-overlay"
          onClick={() =>
            !deassignModal.submitting &&
            setDeassignModal({ isOpen: false, allocation: null, submitting: false })
          }
        >
          <div
            className="ct-modal-card ct-confirm-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>De-assign Class Teacher</h3>
            <p>
              Are you sure you want to remove{" "}
              <strong>
                {deassignModal.allocation.teacher?.teacherName || "the assigned teacher"}
              </strong>{" "}
              as Class Teacher from{" "}
              <strong>
                {deassignModal.allocation.className} - {deassignModal.allocation.sectionName}
              </strong>
              ?
            </p>
            <p className="confirm-subtext">
              The teacher will remain assigned to teach their respective subjects, but the Class Teacher role will become Vacant.
            </p>

            <div className="ct-modal-actions">
              <button
                className="btn-cancel"
                onClick={() =>
                  setDeassignModal({ isOpen: false, allocation: null, submitting: false })
                }
                disabled={deassignModal.submitting}
              >
                Cancel
              </button>
              <button
                className="btn-danger-confirm"
                onClick={handleConfirmDeassign}
                disabled={deassignModal.submitting}
              >
                {deassignModal.submitting ? "De-assigning..." : "Yes, De-assign"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================
          REMOVE FACULTY CONFIRMATION MODAL
      ===================================================== */}
      {removeFacultyModal.isOpen &&
        removeFacultyModal.allocation &&
        removeFacultyModal.teacher && (
          <div
            className="ct-modal-overlay"
            onClick={() =>
              !removeFacultyModal.submitting &&
              setRemoveFacultyModal({
                isOpen: false,
                allocation: null,
                teacher: null,
                submitting: false,
              })
            }
          >
            <div
              className="ct-modal-card ct-confirm-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Remove Faculty from Class</h3>
              <p>
                Are you sure you want to remove{" "}
                <strong>{removeFacultyModal.teacher.teacherName}</strong> from{" "}
                <strong>
                  {removeFacultyModal.allocation.className} -{" "}
                  {removeFacultyModal.allocation.sectionName}
                </strong>
                ?
              </p>
              <p className="confirm-subtext">
                All subject assignments for this teacher in this class will be deleted.
                {removeFacultyModal.teacher.isClassTeacher && (
                  <span className="warning-text">
                    {" "}
                    Note: This teacher is also the Class Teacher, so the Class Teacher designation will also be removed.
                  </span>
                )}
              </p>

              <div className="ct-modal-actions">
                <button
                  className="btn-cancel"
                  onClick={() =>
                    setRemoveFacultyModal({
                      isOpen: false,
                      allocation: null,
                      teacher: null,
                      submitting: false,
                    })
                  }
                  disabled={removeFacultyModal.submitting}
                >
                  Cancel
                </button>
                <button
                  className="btn-danger-confirm"
                  onClick={handleConfirmRemoveFaculty}
                  disabled={removeFacultyModal.submitting}
                >
                  {removeFacultyModal.submitting ? "Removing..." : "Yes, Remove"}
                </button>
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default ClassTeacherList;
