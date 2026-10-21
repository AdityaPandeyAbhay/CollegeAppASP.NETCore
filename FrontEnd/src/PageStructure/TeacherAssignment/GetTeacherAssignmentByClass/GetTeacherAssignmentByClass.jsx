// =====================================================
// GET TEACHER ASSIGNMENTS BY CLASS & SECTION
// Allows filtering by:
// 1. Academic Year * (e.g. 2026-2027)
// 2. Department (Optional Filter)
// 3. Class *
// 4. Section *
// Displays which teacher teaches what subject and who is the Class Teacher.
// =====================================================

import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getAllClassTeachersWithDetails,
  getAllAcademicYearsList,
  getSectionClassId,
} from "../../../Services/classTeacherService";
import { getAllClasses } from "../../../Services/classService";
import { getAllSections } from "../../../Services/sectionService";
import { getDepartmentDropdown } from "../../../Services/departmentService";
import { getTeacherDisplayName } from "../../ClassTeacher/AssignClassTeachersPage";
import "./GetTeacherAssignmentByClass.css";

const GetTeacherAssignmentByClass = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ===================================================
  // MASTER DROPDOWN DATA
  // ===================================================
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);

  // ===================================================
  // FILTER FORM STATE
  // ===================================================
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");

  // ===================================================
  // LOADED ALLOCATIONS & STATUS
  // ===================================================
  const [allAllocations, setAllAllocations] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  // ===================================================
  // 1. LOAD MASTER DROPDOWNS & INITIAL DATA
  // ===================================================
  useEffect(() => {
    const initMasterData = async () => {
      try {
        setLoadingInitial(true);
        const [yearsRes, deptsRes, classesRes, sectionsRes] =
          await Promise.allSettled([
            getAllAcademicYearsList(),
            getDepartmentDropdown(),
            getAllClasses(),
            getAllSections(),
          ]);

        const yList = yearsRes.status === "fulfilled" ? yearsRes.value : [];
        setAcademicYears(yList);

        // Auto-select current academic year (or first)
        const currentYear =
          yList.find((y) => y.isCurrent ?? y.IsCurrent) || yList[0];
        const defaultYearId = currentYear
          ? String(currentYear.id ?? currentYear.Id)
          : "";
        setSelectedAcademicYearId(defaultYearId);

        const dList = deptsRes.status === "fulfilled" ? deptsRes.value : [];
        setDepartments(dList);

        const cList = classesRes.status === "fulfilled" ? classesRes.value : [];
        setClasses(Array.isArray(cList) ? cList : cList?.data || []);

        const sList =
          sectionsRes.status === "fulfilled" ? sectionsRes.value : [];
        setSections(Array.isArray(sList) ? sList : sList?.data || []);

        // Load allocations for default year
        if (defaultYearId) {
          fetchAllocationsForYear(defaultYearId);
        }
      } catch (err) {
        console.error("Failed to load initial master data:", err);
        setError("Failed to load dropdown master data.");
      } finally {
        setLoadingInitial(false);
      }
    };

    initMasterData();
  }, []);

  // ===================================================
  // 2. FETCH ALLOCATIONS WHEN YEAR CHANGES
  // ===================================================
  const fetchAllocationsForYear = async (ayId) => {
    try {
      setLoadingData(true);
      setError("");
      const data = await getAllClassTeachersWithDetails(ayId || null);
      const actualAllocs = Array.isArray(data)
        ? data
        : Array.isArray(data?.allocations)
        ? data.allocations
        : [];
      setAllAllocations(actualAllocs);
    } catch (err) {
      console.error("Failed to load allocations:", err);
      setError(err?.message || "Failed to load teacher allocation records.");
    } finally {
      setLoadingData(false);
    }
  };

  const handleAcademicYearChange = (newYearId) => {
    setSelectedAcademicYearId(newYearId);
    if (newYearId) {
      fetchAllocationsForYear(newYearId);
    }
  };

  // ===================================================
  // 3. DEPENDENT DROPDOWNS: CLASSES FILTERED BY DEPT
  // ===================================================
  const availableClasses = useMemo(() => {
    if (!selectedDepartmentId) return classes;
    return classes.filter((c) => {
      const deptId = c.departmentId ?? c.DepartmentId;
      return (
        deptId !== undefined &&
        deptId !== null &&
        String(deptId) === String(selectedDepartmentId)
      );
    });
  }, [classes, selectedDepartmentId]);

  const handleDepartmentChange = (deptId) => {
    setSelectedDepartmentId(deptId);
    setSelectedClassId("");
    setSelectedSectionId("");
  };

  // ===================================================
  // 4. DEPENDENT DROPDOWNS: SECTIONS FILTERED BY CLASS
  // ===================================================
  const availableSections = useMemo(() => {
    if (!selectedClassId) return [];
    return sections.filter((s) => {
      const cId = getSectionClassId(s);
      return (
        cId !== undefined &&
        cId !== null &&
        String(cId) === String(selectedClassId)
      );
    });
  }, [sections, selectedClassId]);

  const handleClassChange = (cId) => {
    setSelectedClassId(cId);
    setSelectedSectionId("");
  };

  // ===================================================
  // 5. SEARCH / APPLY FILTER
  // ===================================================
  const handleApplyFilter = (e) => {
    if (e) e.preventDefault();
    if (!selectedClassId) {
      setError("Please select a Class to view teacher assignments.");
      return;
    }
    setError("");
    setSearched(true);
  };

  const handleReset = () => {
    setSelectedDepartmentId("");
    setSelectedClassId("");
    setSelectedSectionId("");
    setSearched(false);
    setError("");
  };

  // ===================================================
  // 6. FILTERED RESULTS CALCULATION
  // ===================================================
  const filteredAllocations = useMemo(() => {
    if (!selectedClassId && !searched) return [];

    return allAllocations.filter((alloc) => {
      // Match Class
      if (
        selectedClassId &&
        String(alloc.classId) !== String(selectedClassId)
      ) {
        return false;
      }
      // Match Department (if selected)
      if (
        selectedDepartmentId &&
        alloc.departmentId &&
        String(alloc.departmentId) !== String(selectedDepartmentId)
      ) {
        return false;
      }
      // Match Section (if selected)
      if (
        selectedSectionId &&
        String(alloc.sectionId) !== String(selectedSectionId)
      ) {
        return false;
      }
      return true;
    });
  }, [
    allAllocations,
    selectedClassId,
    selectedDepartmentId,
    selectedSectionId,
    searched,
  ]);

  // Flatten allocations into individual teacher rows per class & section
  const facultyRows = useMemo(() => {
    const rows = [];
    filteredAllocations.forEach((alloc) => {
      const clsName = alloc.className || `Class ${alloc.classId}`;
      const secName = alloc.sectionName || `Section ${alloc.sectionId}`;
      const deptName = alloc.departmentName || "General";
      const ayName =
        alloc.academicYearName ||
        academicYears.find(
          (y) => String(y.id ?? y.Id) === String(selectedAcademicYearId),
        )?.yearName ||
        "2026-2027";

      // 1. If assigned teachers exist
      const assignedFaculty =
        alloc.subjectTeachers && alloc.subjectTeachers.length > 0
          ? alloc.subjectTeachers
          : alloc.teachers && alloc.teachers.length > 0
          ? alloc.teachers
          : alloc.teacher
          ? [
              {
                teacherId: alloc.teacher.id ?? alloc.teacher.Id,
                teacherName:
                  alloc.teacher.teacherName ||
                  alloc.teacher.TeacherName ||
                  "Assigned Teacher",
                teacherCode:
                  alloc.teacher.teacherCode ||
                  alloc.teacher.TeacherCode ||
                  "",
                isClassTeacher: true,
                subjects: [],
              },
            ]
          : [];

      if (assignedFaculty.length > 0) {
        assignedFaculty.forEach((t) => {
          rows.push({
            id: `${alloc.classId}_${alloc.sectionId}_${t.teacherId}`,
            classId: alloc.classId,
            sectionId: alloc.sectionId,
            className: clsName,
            sectionName: secName,
            departmentName: deptName,
            academicYearName: ayName,
            teacherId: t.teacherId,
            teacherName: t.teacherName || getTeacherDisplayName(t),
            teacherCode: t.teacherCode || "",
            isClassTeacher: Boolean(t.isClassTeacher),
            subjects: t.subjects || [],
            studentCount: alloc.studentCount || 0,
            hasTeacher: true,
          });
        });
      } else {
        // No teachers assigned yet to this class/section
        rows.push({
          id: `${alloc.classId}_${alloc.sectionId}_empty`,
          classId: alloc.classId,
          sectionId: alloc.sectionId,
          className: clsName,
          sectionName: secName,
          departmentName: deptName,
          academicYearName: ayName,
          teacherId: null,
          teacherName: "Not Assigned",
          teacherCode: "-",
          isClassTeacher: false,
          subjects: [],
          studentCount: alloc.studentCount || 0,
          hasTeacher: false,
        });
      }
    });
    return rows;
  }, [filteredAllocations, academicYears, selectedAcademicYearId]);

  // Get active Class Teacher for summary
  const activeClassTeacher = useMemo(() => {
    return facultyRows.find((r) => r.isClassTeacher);
  }, [facultyRows]);

  const totalAssignedTeachers = useMemo(() => {
    const uniqueIds = new Set();
    facultyRows.forEach((r) => {
      if (r.teacherId) uniqueIds.add(String(r.teacherId));
    });
    return uniqueIds.size;
  }, [facultyRows]);

  const selectedClassObj = classes.find(
    (c) => String(c.id ?? c.Id) === String(selectedClassId),
  );
  const selectedClassName =
    selectedClassObj?.className ??
    selectedClassObj?.ClassName ??
    (selectedClassId ? `Class ${selectedClassId}` : "");

  const selectedSectionObj = sections.find(
    (s) => String(s.id ?? s.Id) === String(selectedSectionId),
  );
  const selectedSectionName =
    selectedSectionObj?.sectionName ??
    selectedSectionObj?.SectionName ??
    (selectedSectionId ? `Section ${selectedSectionId}` : "All Sections");

  return (
    <div className="gt-class-page">
      <div className="gt-class-container">
        {/* =====================================================
            TOP NAVIGATION & HEADER
        ===================================================== */}
        <div className="gt-class-header">
          <div className="gt-header-info">
            <div className="gt-badge-tag">GET ALLOCATION REPORT</div>
            <h2>Faculty &amp; Subject Allocation By Class</h2>
            <p>
              View assigned Faculty, Class Teachers, and Subjects taught for any
              Class &amp; Section.
            </p>
          </div>

          <div className="gt-header-actions">
            <button
              type="button"
              className="gt-btn gt-btn-secondary"
              onClick={() => navigate("/class-teachers/assign")}
              title="Go to Assign Teachers & Faculty to Class page"
            >
              ✏️ Assign Teachers to Class
            </button>
            <button
              type="button"
              className="gt-btn gt-btn-ghost"
              onClick={() => navigate("/class-teachers")}
              title="View all Class Teachers Hub"
            >
              📋 Class Teachers Hub
            </button>
          </div>
        </div>

        {/* =====================================================
            FILTER CARD (4 SPECIFIED FILTERS)
        ===================================================== */}
        <div className="gt-filter-card">
          <form className="gt-filter-form" onSubmit={handleApplyFilter}>
            <div className="gt-form-grid">
              {/* 1. Academic Year * */}
              <div className="gt-form-group">
                <label>
                  Academic Year <span className="gt-required">*</span>
                </label>
                <select
                  value={selectedAcademicYearId}
                  onChange={(e) => handleAcademicYearChange(e.target.value)}
                  disabled={loadingInitial}
                >
                  <option value="">-- Select Academic Year --</option>
                  {academicYears.map((ay) => {
                    const ayId = ay.id ?? ay.Id;
                    const ayName =
                      ay.yearName ??
                      ay.YearName ??
                      ay.academicYear ??
                      ay.AcademicYear ??
                      `Year ${ayId}`;
                    return (
                      <option key={ayId} value={ayId}>
                        {ayName} {ay.isCurrent ? " (Current)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 2. Department (Optional Filter) */}
              <div className="gt-form-group">
                <label>Department (Optional Filter)</label>
                <select
                  value={selectedDepartmentId}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  disabled={loadingInitial}
                >
                  <option value="">-- All Departments --</option>
                  {departments.map((d) => {
                    const dId = d.id ?? d.Id ?? d.code ?? d.Code;
                    const dName =
                      d.text ??
                      d.Text ??
                      d.name ??
                      d.Name ??
                      d.departmentName ??
                      d.DepartmentName;
                    return (
                      <option key={dId} value={dId}>
                        {dName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 3. Class * */}
              <div className="gt-form-group">
                <label>
                  Class <span className="gt-required">*</span>
                </label>
                <select
                  value={selectedClassId}
                  onChange={(e) => handleClassChange(e.target.value)}
                  disabled={loadingInitial || availableClasses.length === 0}
                >
                  <option value="">-- Select Class --</option>
                  {availableClasses.map((cls) => {
                    const cId = cls.id ?? cls.Id;
                    const cName =
                      cls.className ?? cls.ClassName ?? `Class ${cId}`;
                    return (
                      <option key={cId} value={cId}>
                        {cName}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* 4. Section * */}
              <div className="gt-form-group">
                <label>Section</label>
                <select
                  value={selectedSectionId}
                  onChange={(e) => setSelectedSectionId(e.target.value)}
                  disabled={!selectedClassId || availableSections.length === 0}
                >
                  <option value="">-- All Sections --</option>
                  {availableSections.map((sec) => {
                    const sId = sec.id ?? sec.Id;
                    const sName =
                      sec.sectionName ??
                      sec.SectionName ??
                      sec.name ??
                      sec.Name ??
                      sec.sectionCode ??
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

            {/* Filter Action Buttons */}
            <div className="gt-form-actions">
              <button
                type="submit"
                className="gt-btn-filter-apply"
                disabled={loadingData}
              >
                {loadingData ? "Loading..." : "🔍 Apply Filter"}
              </button>
              <button
                type="button"
                className="gt-btn-filter-reset"
                onClick={handleReset}
                disabled={loadingData}
              >
                🔄 Reset
              </button>
            </div>
          </form>
        </div>

        {/* =====================================================
            ERROR NOTICE
        ===================================================== */}
        {error && (
          <div className="gt-error-alert">
            <span className="gt-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {/* =====================================================
            SUMMARY OVERVIEW STRIP (WHEN A CLASS IS SELECTED)
        ===================================================== */}
        {selectedClassId && (
          <div className="gt-summary-strip">
            <div className="gt-summary-item">
              <span className="gt-sum-label">Selected Class</span>
              <span className="gt-sum-value highlight">
                {selectedClassName}{" "}
                {selectedSectionId ? `(${selectedSectionName})` : ""}
              </span>
            </div>
            <div className="gt-summary-item">
              <span className="gt-sum-label">Total Faculty</span>
              <span className="gt-sum-value">
                {totalAssignedTeachers} Teachers
              </span>
            </div>
            <div className="gt-summary-item">
              <span className="gt-sum-label">Class Teacher (CT)</span>
              <span className="gt-sum-value ct-name">
                {activeClassTeacher ? (
                  <>⭐ {activeClassTeacher.teacherName}</>
                ) : (
                  <span className="vacant-text">Not Designated Yet</span>
                )}
              </span>
            </div>
            <div className="gt-summary-item">
              <span className="gt-sum-label">Direct Action</span>
              <button
                type="button"
                className="gt-sum-assign-btn"
                onClick={() =>
                  navigate(
                    `/class-teachers/assign?classId=${selectedClassId}${
                      selectedSectionId ? `&sectionId=${selectedSectionId}` : ""
                    }`,
                  )
                }
              >
                ✏️ Edit This Class
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            RESULTS TABLE
        ===================================================== */}
        {loadingData ? (
          <div className="gt-loading-box">
            <div className="gt-spinner" />
            <p>Fetching teacher and subject assignments...</p>
          </div>
        ) : !selectedClassId ? (
          <div className="gt-prompt-box">
            <div className="gt-prompt-icon">🔍</div>
            <h3>Select a Class to View Teacher Assignments</h3>
            <p>
              Please choose an Academic Year and Class from the filter bar above
              to see the list of teachers and their allocated subjects.
            </p>
          </div>
        ) : facultyRows.length === 0 ? (
          <div className="gt-empty-box">
            <div className="gt-empty-icon">📂</div>
            <h3>No Records Found</h3>
            <p>
              No faculty or section records were found matching your current
              filter criteria.
            </p>
            <button
              type="button"
              className="gt-btn gt-btn-primary"
              onClick={() => navigate("/class-teachers/assign")}
            >
              Assign Faculty Now
            </button>
          </div>
        ) : (
          <div className="gt-table-card">
            <div className="gt-table-header-bar">
              <span className="gt-table-title">
                Showing {facultyRows.length} Faculty Allocation
                {facultyRows.length !== 1 ? "s" : ""}
              </span>
              <span className="gt-table-subtitle">
                Academic Year:{" "}
                <strong>
                  {academicYears.find(
                    (y) =>
                      String(y.id ?? y.Id) === String(selectedAcademicYearId),
                  )?.yearName || "Current"}
                </strong>
              </span>
            </div>

            <div className="gt-table-responsive">
              <table className="gt-data-table">
                <thead>
                  <tr>
                    <th style={{ width: "50px" }}>#</th>
                    <th>Faculty Member</th>
                    <th>Teacher Code</th>
                    <th>Role / Designation</th>
                    <th>Class &amp; Section</th>
                    <th>Department</th>
                    <th>Subjects Taught</th>
                    <th>Status</th>
                    <th style={{ textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {facultyRows.map((row, idx) => (
                    <tr
                      key={row.id}
                      className={row.isClassTeacher ? "row-class-teacher" : ""}
                    >
                      <td className="gt-col-idx">{idx + 1}</td>

                      {/* Teacher Name & Avatar */}
                      <td className="gt-col-teacher">
                        <div className="gt-teacher-cell">
                          <div
                            className={`gt-avatar ${
                              row.isClassTeacher
                                ? "ct-avatar"
                                : !row.hasTeacher
                                  ? "empty-avatar"
                                  : ""
                            }`}
                          >
                            {row.hasTeacher
                              ? row.teacherName
                                  .split(" ")
                                  .filter(Boolean)
                                  .map((n) => n[0])
                                  .slice(0, 2)
                                  .join("")
                                  .toUpperCase()
                              : "—"}
                          </div>
                          <div>
                            <div className="gt-tname">
                              {row.teacherName}
                              {row.isClassTeacher && (
                                <span className="gt-ct-badge">
                                  Class Teacher
                                </span>
                              )}
                            </div>
                            {row.studentCount > 0 && (
                              <div className="gt-tsub">
                                {row.studentCount} Students Enrolled
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Teacher Code */}
                      <td>
                        <span className="gt-code-pill">
                          {row.teacherCode || "N/A"}
                        </span>
                      </td>

                      {/* Designation */}
                      <td>
                        {row.isClassTeacher ? (
                          <span className="gt-role-badge ct">
                            ⭐ Class Teacher
                          </span>
                        ) : row.hasTeacher ? (
                          <span className="gt-role-badge st">
                            📚 Subject Teacher
                          </span>
                        ) : (
                          <span className="gt-role-badge vacant">
                            ⚠️ Unassigned
                          </span>
                        )}
                      </td>

                      {/* Class & Section */}
                      <td>
                        <span className="gt-class-badge">
                          {row.className} - {row.sectionName}
                        </span>
                      </td>

                      {/* Department */}
                      <td>
                        <span className="gt-dept-badge">
                          {row.departmentName}
                        </span>
                      </td>

                      {/* Subjects */}
                      <td className="gt-col-subjects">
                        {row.subjects && row.subjects.length > 0 ? (
                          <div className="gt-subject-chips">
                            {row.subjects.map((sub, sIdx) => {
                              const sName =
                                typeof sub === "string"
                                  ? sub
                                  : sub.name || sub.SubjectName || sub.text;
                              return (
                                <span key={sIdx} className="gt-sub-chip">
                                  📘 {sName}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="gt-no-subjects">
                            {row.hasTeacher ? "No specific subjects" : "—"}
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        {row.hasTeacher ? (
                          <span className="gt-status-badge active">Active</span>
                        ) : (
                          <span className="gt-status-badge inactive">
                            Pending
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="gt-action-btn"
                          onClick={() =>
                            navigate(
                              `/class-teachers/assign?classId=${row.classId}&sectionId=${row.sectionId}`,
                            )
                          }
                          title="Open in Assign page"
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetTeacherAssignmentByClass;
