// =====================================================
// PREVIEW / PREVIOUS STUDENT RESULT
// =====================================================

import React, { Fragment, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

import {
  getAllAcademicYear,
  getAcademicYearDropdown,
} from "../../../Services/academicYearService";

import { getDepartmentDropdown } from "../../../Services/departmentService";

import { getClassDropdown, getAllClass } from "../../../Services/classService";

import { getAllSection } from "../../../Services/sectionService";

import {
  getAllStudents,
  getStudentDropdown,
} from "../../../Services/studentService";

import { getStudentPreviousResults } from "../../../Services/resultService";

import "./PreviousResult.css";

const PreviousResult = () => {
  const location = useLocation();

  // =====================================================
  // FILTERS STATE
  // =====================================================
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Cached data
  const [allSections, setAllSections] = useState([]);

  // =====================================================
  // RESULTS STATE
  // =====================================================
  const [results, setResults] = useState([]);
  const [expandedResultId, setExpandedResultId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // LOADING & ERROR STATE
  // =====================================================
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingResults, setLoadingResults] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // HELPERS
  // =====================================================
  const getSectionClassId = (section) => {
    if (!section) return null;
    return (
      section.SchoolClassId ??
      section.schoolClassId ??
      section.ClassId ??
      section.classId ??
      section.SchoolClass?.Id ??
      section.schoolClass?.id ??
      section.Class?.Id ??
      section.class?.id ??
      null
    );
  };

  const getSectionText = (section) => {
    if (!section) return "";
    return (
      section.sectionName ||
      section.SectionName ||
      section.text ||
      section.Text ||
      section.name ||
      section.Name ||
      section.sectionCode ||
      section.SectionCode ||
      `Section ${section.id ?? section.Id ?? ""}`
    ).trim();
  };

  const formatPercentage = (value) => {
    if (value === null || value === undefined) return "-";
    return `${Number(value).toFixed(2)}%`;
  };

  // =====================================================
  // LOAD INITIAL DATA
  // =====================================================
  useEffect(() => {
    loadInitialData();
  }, []);

  // Detect incoming navigation from GetBatchResult or GetStudentResult
  useEffect(() => {
    const handleIncomingState = async () => {
      if (location.state?.studentId) {
        const incomingId = Number(location.state.studentId);
        if (incomingId > 0) {
          setSelectedStudentId(String(incomingId));
          if (location.state.studentData) {
            setSelectedStudent(location.state.studentData);
          }
          if (location.state.academicYearId) {
            setSelectedAcademicYearId(String(location.state.academicYearId));
          }
          if (location.state.departmentId) {
            const deptId = String(location.state.departmentId);
            setSelectedDepartmentId(deptId);
            try {
              let classList = await getClassDropdown(deptId).catch(() => []);
              if (!Array.isArray(classList) || classList.length === 0) {
                const allClasses = await getAllClass().catch(() => []);
                if (Array.isArray(allClasses)) {
                  classList = allClasses
                    .filter(
                      (c) =>
                        String(c.DepartmentId ?? c.departmentId) === deptId,
                    )
                    .map((c) => ({
                      id: c.Id ?? c.id,
                      text:
                        c.ClassName ?? c.className ?? `Class ${c.Id ?? c.id}`,
                    }));
                }
              }
              setClasses(Array.isArray(classList) ? classList : []);
            } catch (_) {}
          }
          if (location.state.classId) {
            const clsId = String(location.state.classId);
            setSelectedClassId(clsId);
            try {
              const freshSections = await getAllSection().catch(() => []);
              const source = Array.isArray(freshSections) ? freshSections : [];
              setAllSections(source);
              const filtered = source
                .filter((s) => {
                  const sClassId = getSectionClassId(s);
                  return sClassId !== null && String(sClassId) === clsId;
                })
                .map((s) => ({
                  id: s.id ?? s.Id,
                  text: getSectionText(s),
                  sectionName: getSectionText(s),
                  schoolClassId: getSectionClassId(s),
                }));
              setSections(filtered);
            } catch (_) {}
          }
          if (location.state.sectionId) {
            const secId = String(location.state.sectionId);
            setSelectedSectionId(secId);
            if (location.state.classId) {
              try {
                const studentList = await fetchStudentsForClassSection(
                  location.state.departmentId,
                  location.state.classId,
                  secId,
                );
                setStudents(studentList);
              } catch (_) {}
            }
          }
          fetchPreviousResults(incomingId, location.state.studentData);
        }
      }
    };

    handleIncomingState();
  }, [location.state]);

  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      setError("");

      const [yearDataResult, deptDataResult, sectionsResult] =
        await Promise.allSettled([
          getAllAcademicYear(),
          getDepartmentDropdown(),
          getAllSection(),
        ]);

      // 1. Academic Years (newest first)
      let rawYears = [];
      if (
        yearDataResult.status === "fulfilled" &&
        Array.isArray(yearDataResult.value) &&
        yearDataResult.value.length > 0
      ) {
        rawYears = yearDataResult.value;
      } else {
        try {
          const dropYears = await getAcademicYearDropdown();
          rawYears = Array.isArray(dropYears) ? dropYears : [];
        } catch (_) {
          rawYears = [];
        }
      }

      const sortedYears = [...rawYears].sort((a, b) => {
        const dateA = a.createdDate ?? a.CreatedDate;
        const dateB = b.createdDate ?? b.CreatedDate;
        if (dateA && dateB) {
          const diff = new Date(dateB).getTime() - new Date(dateA).getTime();
          if (diff !== 0) return diff;
        }
        const idA = Number(a.id ?? a.Id ?? 0);
        const idB = Number(b.id ?? b.Id ?? 0);
        return idB - idA;
      });

      setAcademicYears(sortedYears);

      if (sortedYears.length > 0 && !location.state?.academicYearId) {
        const recentYearId = String(sortedYears[0].id ?? sortedYears[0].Id);
        setSelectedAcademicYearId(recentYearId);
      }

      // 2. Departments
      if (
        deptDataResult.status === "fulfilled" &&
        Array.isArray(deptDataResult.value)
      ) {
        setDepartments(deptDataResult.value);
      } else {
        setDepartments([]);
      }

      // 3. Sections
      if (
        sectionsResult.status === "fulfilled" &&
        Array.isArray(sectionsResult.value)
      ) {
        setAllSections(sectionsResult.value);
      } else {
        setAllSections([]);
      }
    } catch (err) {
      setError(err?.message || "Failed to load initial filter data.");
    } finally {
      setLoadingInitial(false);
    }
  };

  // =====================================================
  // FILTER CHANGE HANDLERS
  // =====================================================
  const handleAcademicYearChange = (e) => {
    const yearId = e.target.value;
    setSelectedAcademicYearId(yearId);
  };

  const handleDepartmentChange = async (e) => {
    const deptId = e.target.value;
    setSelectedDepartmentId(deptId);
    setSelectedClassId("");
    setSelectedSectionId("");
    setSelectedStudentId("");
    setSelectedStudent(null);
    setClasses([]);
    setSections([]);
    setStudents([]);
    setResults([]);
    setError("");

    if (!deptId) return;

    try {
      setLoadingClasses(true);
      let classList = [];
      try {
        const data = await getClassDropdown(deptId);
        if (Array.isArray(data) && data.length > 0) {
          classList = data;
        }
      } catch (_) {}

      if (classList.length === 0) {
        const allClasses = await getAllClass().catch(() => []);
        if (Array.isArray(allClasses)) {
          classList = allClasses
            .filter(
              (c) =>
                String(c.DepartmentId ?? c.departmentId) === String(deptId),
            )
            .map((c) => ({
              id: c.Id ?? c.id,
              text: c.ClassName ?? c.className ?? `Class ${c.Id ?? c.id}`,
            }));
        }
      }

      setClasses(classList);
    } catch (err) {
      setError(err?.message || "Failed to load classes for department.");
    } finally {
      setLoadingClasses(false);
    }
  };

  const handleClassChange = async (e) => {
    const clsId = e.target.value;
    setSelectedClassId(clsId || "");
    setSelectedSectionId("");
    setSelectedStudentId("");
    setSelectedStudent(null);
    setSections([]);
    setStudents([]);
    setResults([]);
    setError("");

    if (!clsId) return;

    try {
      setLoadingSections(true);
      let sourceSections = allSections;

      if (!sourceSections || sourceSections.length === 0) {
        const freshSections = await getAllSection().catch(() => []);
        sourceSections = Array.isArray(freshSections) ? freshSections : [];
        setAllSections(sourceSections);
      }

      const filtered = sourceSections
        .filter((s) => {
          const sClassId = getSectionClassId(s);
          return sClassId !== null && String(sClassId) === String(clsId);
        })
        .map((s) => ({
          id: s.id ?? s.Id,
          text: getSectionText(s),
          sectionName: getSectionText(s),
          schoolClassId: getSectionClassId(s),
        }));

      setSections(filtered);
    } catch (err) {
      setError(err?.message || "Failed to load sections for class.");
    } finally {
      setLoadingSections(false);
    }
  };

  const handleSectionChange = async (e) => {
    const secId = e.target.value;
    setSelectedSectionId(secId);
    setSelectedStudentId("");
    setSelectedStudent(null);
    setStudents([]);
    setResults([]);
    setError("");

    if (!secId || !selectedClassId) return;

    try {
      setLoadingStudents(true);
      const studentList = await fetchStudentsForClassSection(
        selectedDepartmentId,
        selectedClassId,
        secId,
      );
      setStudents(studentList);
      if (studentList.length === 0) {
        setError("No students found in this Class and Section.");
      }
    } catch (err) {
      setError(err?.message || "Failed to load students for section.");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStudentsForClassSection = async (deptId, clsId, secId) => {
    let list = [];
    try {
      const all = await getAllStudents();
      if (Array.isArray(all) && all.length > 0) {
        list = all.filter((s) => {
          const sClassId = String(
            s.SchoolClassId ?? s.schoolClassId ?? s.ClassId ?? s.classId ?? "",
          );
          const sSectionId = String(s.SectionId ?? s.sectionId ?? "");
          const sDeptId = String(s.DepartmentId ?? s.departmentId ?? "");

          const matchClass = sClassId === String(clsId);
          const matchSection = sSectionId === String(secId);
          const matchDept = !deptId || sDeptId === String(deptId);

          return matchClass && matchSection && matchDept;
        });
      }
    } catch (_) {}

    if (list.length === 0) {
      try {
        const dropdownList = await getStudentDropdown(deptId, clsId, secId);
        if (Array.isArray(dropdownList)) {
          list = dropdownList.map((item) => ({
            id: item.id ?? item.Id,
            firstName:
              item.firstName ??
              item.FirstName ??
              (item.text || item.name || "").split(" ")[0] ??
              "",
            lastName:
              item.lastName ??
              item.LastName ??
              (item.text || item.name || "").split(" ").slice(1).join(" ") ??
              "",
            admissionNumber:
              item.admissionNumber ??
              item.AdmissionNumber ??
              item.code ??
              item.Code ??
              "",
            rollNumber: item.rollNumber ?? item.RollNumber ?? "",
          }));
        }
      } catch (_) {}
    }

    return list;
  };

  const handleStudentChange = async (e) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    setError("");
    setResults([]);

    if (!sId) {
      setSelectedStudent(null);
      return;
    }

    const matched = students.find(
      (s) => String(s.id ?? s.Id ?? s.studentId ?? s.StudentId) === String(sId),
    );
    setSelectedStudent(matched || null);

    await fetchPreviousResults(Number(sId), matched);
  };

  // =====================================================
  // FETCH STUDENT PREVIOUS RESULTS
  // =====================================================
  const fetchPreviousResults = async (sId, fallbackStudent = null) => {
    try {
      setLoadingResults(true);
      setError("");

      const response = await getStudentPreviousResults(Number(sId));
      const data = response?.data || response?.Data || response || [];
      const list = Array.isArray(data) ? data : [];
      setResults(list);

      if (list.length > 0 && !selectedStudent) {
        const first = list[0];
        setSelectedStudent({
          studentName: first.studentName ?? first.StudentName,
          admissionNumber: first.admissionNumber ?? first.AdmissionNumber,
          rollNumber: first.rollNumber ?? first.RollNumber,
          ...fallbackStudent,
        });
      }

      if (list.length === 0) {
        setError("No examination results found for this student.");
      }
    } catch (err) {
      setError(err?.message || "Failed to load previous results.");
    } finally {
      setLoadingResults(false);
    }
  };

  // =====================================================
  // RESET FILTERS
  // =====================================================
  const handleResetFilters = () => {
    const defaultYear =
      academicYears.length > 0
        ? String(academicYears[0].id ?? academicYears[0].Id)
        : "";
    setSelectedAcademicYearId(defaultYear);
    setSelectedDepartmentId("");
    setSelectedClassId("");
    setSelectedSectionId("");
    setSelectedStudentId("");
    setSelectedStudent(null);
    setClasses([]);
    setSections([]);
    setStudents([]);
    setResults([]);
    setSearchTerm("");
    setExpandedResultId(null);
    setError("");
  };

  // =====================================================
  // CONTEXT DISPLAY GETTERS
  // =====================================================
  const getSelectedAcademicYearName = () => {
    const item = academicYears.find(
      (y) => String(y.id ?? y.Id) === String(selectedAcademicYearId),
    );
    return item?.yearName ?? item?.YearName ?? item?.text ?? item?.Text ?? "-";
  };

  const getSelectedDepartmentName = () => {
    const item = departments.find(
      (d) => String(d.id ?? d.Id) === String(selectedDepartmentId),
    );
    return item?.text ?? item?.Text ?? item?.name ?? item?.Name ?? "-";
  };

  const getSelectedClassName = () => {
    const item = classes.find(
      (c) => String(c.id ?? c.Id) === String(selectedClassId),
    );
    return (
      item?.text ?? item?.Text ?? item?.className ?? item?.ClassName ?? "-"
    );
  };

  const getSelectedSectionName = () => {
    const item = sections.find(
      (s) => String(s.id ?? s.Id) === String(selectedSectionId),
    );
    return item ? getSectionText(item) : "-";
  };

  const getStudentName = () => {
    if (selectedStudent) {
      if (selectedStudent.studentName || selectedStudent.StudentName) {
        return selectedStudent.studentName || selectedStudent.StudentName;
      }
      const first =
        selectedStudent.firstName ?? selectedStudent.FirstName ?? "";
      const last = selectedStudent.lastName ?? selectedStudent.LastName ?? "";
      const full = `${first} ${last}`.trim();
      if (full) return full;
    }
    if (results.length > 0) {
      return results[0].studentName ?? results[0].StudentName ?? "Student";
    }
    return "Student";
  };

  const getStudentAdmissionNumber = () => {
    if (selectedStudent) {
      return (
        selectedStudent.admissionNumber ??
        selectedStudent.AdmissionNumber ??
        selectedStudent.code ??
        selectedStudent.Code ??
        "-"
      );
    }
    if (results.length > 0) {
      return results[0].admissionNumber ?? results[0].AdmissionNumber ?? "-";
    }
    return "-";
  };

  // Filter results by search term
  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return results;
    const term = searchTerm.toLowerCase().trim();
    return results.filter((item) => {
      const exam = String(item.examName ?? item.ExamName ?? "").toLowerCase();
      const yr = String(
        item.academicYear ?? item.AcademicYear ?? "",
      ).toLowerCase();
      const grade = String(item.grade ?? item.Grade ?? "").toLowerCase();
      return exam.includes(term) || yr.includes(term) || grade.includes(term);
    });
  }, [results, searchTerm]);

  return (
    <div className="previous-result-container">
      <div className="previous-result-card">
        {/* =================================================
            HEADER
            ================================================= */}
        <div className="previous-result-header">
          <div className="header-text">
            <h2>Student Result Preview</h2>
            <p>
              Inspect previous examination results, historical scores, and
              progress records for a student across all academic terms.
            </p>
          </div>
        </div>

        {/* FEEDBACK ERROR */}
        {error && <div className="previous-result-error">{error}</div>}

        {/* =================================================
            FILTER SECTION WITH UPPER-RIGHT RESET BUTTON
            ================================================= */}
        <div className="previous-filter-section">
          <div className="filter-section-header">
            <div className="filter-section-title">
              <span>Filter Parameters</span>
              <small>Select class and section to choose a student</small>
            </div>

            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset all filter selections"
            >
              ↺ Reset Filters
            </button>
          </div>

          <div className="previous-filter-grid">
            {/* 1. ACADEMIC YEAR */}
            <div className="filter-col">
              <label htmlFor="prev-academic-year">
                1. Academic Year <span>*</span>
              </label>
              <select
                id="prev-academic-year"
                value={selectedAcademicYearId}
                onChange={handleAcademicYearChange}
                disabled={loadingInitial}
              >
                <option value="">
                  {loadingInitial ? "Loading Years..." : "-- Select Year --"}
                </option>
                {academicYears.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.yearName ?? item.YearName ?? item.text ?? item.Text}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. DEPARTMENT */}
            <div className="filter-col">
              <label htmlFor="prev-department">
                2. Department <span>*</span>
              </label>
              <select
                id="prev-department"
                value={selectedDepartmentId}
                onChange={handleDepartmentChange}
                disabled={loadingInitial}
              >
                <option value="">-- Select Department --</option>
                {departments.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ?? item.Text ?? item.name ?? item.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. CLASS */}
            <div className="filter-col">
              <label htmlFor="prev-class">
                3. Class <span>*</span>
              </label>
              <select
                id="prev-class"
                value={selectedClassId}
                onChange={handleClassChange}
                disabled={!selectedDepartmentId || loadingClasses}
              >
                <option value="">
                  {!selectedDepartmentId
                    ? "-- Select Department First --"
                    : loadingClasses
                      ? "Loading Classes..."
                      : classes.length === 0
                        ? "-- No Classes Found --"
                        : "-- Select Class --"}
                </option>
                {classes.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ?? item.Text ?? item.className ?? item.ClassName}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. SECTION */}
            <div className="filter-col">
              <label htmlFor="prev-section">
                4. Section <span>*</span>
              </label>
              <select
                id="prev-section"
                value={selectedSectionId}
                onChange={handleSectionChange}
                disabled={!selectedClassId || loadingSections}
              >
                <option value="">
                  {!selectedClassId
                    ? "-- Select Class First --"
                    : loadingSections
                      ? "Loading Sections..."
                      : sections.length === 0
                        ? "-- No Sections Found --"
                        : "-- Select Section --"}
                </option>
                {sections.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {getSectionText(item)}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. STUDENT */}
            <div className="filter-col">
              <label htmlFor="prev-student">
                5. Student <span>*</span>
              </label>
              <select
                id="prev-student"
                value={selectedStudentId}
                onChange={handleStudentChange}
                disabled={!selectedSectionId || loadingStudents}
              >
                <option value="">
                  {!selectedSectionId
                    ? "-- Select Section First --"
                    : loadingStudents
                      ? "Loading Students..."
                      : students.length === 0
                        ? "-- No Students Found --"
                        : "-- Select Student --"}
                </option>
                {students.map((item) => {
                  const sId = item.id ?? item.Id;
                  const first = item.firstName ?? item.FirstName ?? "";
                  const last = item.lastName ?? item.LastName ?? "";
                  const name =
                    `${first} ${last}`.trim() ||
                    item.text ||
                    item.name ||
                    "Student";
                  const adm =
                    item.admissionNumber ??
                    item.AdmissionNumber ??
                    item.code ??
                    "";
                  return (
                    <option key={sId} value={sId}>
                      {name} {adm ? `(${adm})` : ""}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* =================================================
            CONTENT: PLACEHOLDER OR STUDENT RESULTS HISTORY
            ================================================= */}
        {!selectedStudentId && results.length === 0 ? (
          <div className="previous-placeholder-box">
            <div className="placeholder-icon">🎓</div>
            <h3>Select a Student</h3>
            <p>
              Choose <strong>Academic Year</strong>, <strong>Department</strong>
              , <strong>Class</strong>, <strong>Section</strong>, and{" "}
              <strong>Student</strong> to preview past examination records.
            </p>
          </div>
        ) : loadingResults ? (
          <div className="previous-loading-state">
            <div className="spinner"></div>
            <span>Loading student examination history...</span>
          </div>
        ) : (
          <div className="previous-results-content" id="printable-preview">
            {/* STUDENT CONTEXT BANNER (ZERO DB IDS) */}
            <div className="previous-student-banner">
              <div className="banner-left">
                <div className="banner-avatar">
                  {(getStudentName()[0] || "S").toUpperCase()}
                </div>
                <div className="banner-meta">
                  <h3 className="banner-title">{getStudentName()}</h3>
                  <div className="banner-chips">
                    <span>
                      <strong>Admission No:</strong>{" "}
                      {getStudentAdmissionNumber()}
                    </span>
                    <span>
                      <strong>Roll No:</strong>{" "}
                      {studentSummary?.rollNumber ||
                        studentSummary?.RollNumber ||
                        selectedStudent?.rollNumber ||
                        selectedStudent?.RollNumber ||
                        "—"}
                    </span>
                    {selectedClassId && (
                      <span>
                        <strong>Class & Section:</strong>{" "}
                        {getSelectedClassName()} - {getSelectedSectionName()}
                      </span>
                    )}
                    {selectedDepartmentId && (
                      <span>
                        <strong>Department:</strong>{" "}
                        {getSelectedDepartmentName()}
                      </span>
                    )}
                    {selectedAcademicYearId && (
                      <span>
                        <strong>Academic Year:</strong>{" "}
                        {getSelectedAcademicYearName()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="banner-actions">
                <button
                  type="button"
                  className="print-btn"
                  onClick={() => window.print()}
                  title="Print Preview"
                >
                  🖨 Print Preview
                </button>
              </div>
            </div>

            {/* TOOLBAR: STATS & SEARCH */}
            <div className="previous-toolbar">
              <div className="results-count-pill">
                <span>Total Exam Records:</span>
                <strong>{results.length}</strong>
              </div>

              {results.length > 0 && (
                <div className="search-box">
                  <input
                    type="text"
                    placeholder="Search by exam or year..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      className="clear-search-btn"
                      onClick={() => setSearchTerm("")}
                    >
                      ✕
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* RESULTS TABLE */}
            {filteredResults.length === 0 ? (
              <div className="empty-results-box">
                {results.length === 0
                  ? "No previous examination records found for this student."
                  : "No examination records matching your search."}
              </div>
            ) : (
              <div className="previous-result-table-wrapper">
                <table className="previous-table">
                  <thead>
                    <tr>
                      <th className="th-idx">#</th>
                      <th>Academic Year</th>
                      <th>Exam Name</th>
                      <th className="th-num">Total Marks</th>
                      <th className="th-num">Obtained Marks</th>
                      <th className="th-num">Percentage</th>
                      <th className="th-grade">Grade</th>
                      <th className="th-rank">Rank</th>
                      <th className="th-status">Status</th>
                      <th className="th-action">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredResults.map((item, index) => {
                      const yr =
                        item.academicYear ??
                        item.AcademicYear ??
                        item.yearName ??
                        "-";
                      const exam =
                        item.examName ??
                        item.ExamName ??
                        `Exam Record ${index + 1}`;
                      const max = item.totalMarks ?? item.TotalMarks ?? 0;
                      const obt = item.obtainedMarks ?? item.ObtainedMarks ?? 0;
                      const pct = formatPercentage(
                        item.percentage ?? item.Percentage,
                      );
                      const grade = item.grade ?? item.Grade ?? "-";
                      const rank = item.rank ?? item.Rank ?? "-";
                      const status =
                        item.resultStatus ?? item.ResultStatus ?? "Pass";
                      const isPass = String(status).toLowerCase() === "pass";
                      const rId =
                        item.resultId ?? item.ResultId ?? item.id ?? index;
                      const isExpanded = expandedResultId === rId;
                      const subjList = item.subjects ?? item.Subjects ?? [];

                      const pdfPath =
                        item.pdfFilePath ??
                        item.PdfFilePath ??
                        item.pdfUrl ??
                        item.PdfUrl;

                      return (
                        <Fragment key={rId}>
                          <tr className={isExpanded ? "row-expanded" : ""}>
                            <td className="th-idx">{index + 1}</td>
                            <td>
                              <strong>{yr}</strong>
                            </td>
                            <td className="td-exam">
                              <span>{exam}</span>
                            </td>
                            <td className="th-num">{max}</td>
                            <td className="th-num">
                              <strong>{obt}</strong>
                            </td>
                            <td className="th-num">
                              <strong>{pct}</strong>
                            </td>
                            <td className="th-grade">
                              <span className="grade-badge">{grade}</span>
                            </td>
                            <td className="th-rank">{rank}</td>
                            <td className="th-status">
                              <span
                                className={`status-pill ${
                                  isPass ? "pass" : "fail"
                                }`}
                              >
                                {isPass ? "✓ Pass" : "✕ Fail"}
                              </span>
                            </td>
                            <td className="th-action">
                              <div className="action-buttons-group">
                                {pdfPath && (
                                  <a
                                    href={pdfPath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="pdf-link-btn"
                                    title="View Uploaded PDF Mark Sheet"
                                  >
                                    📄 PDF
                                  </a>
                                )}

                                {subjList.length > 0 && (
                                  <button
                                    type="button"
                                    className="toggle-details-btn"
                                    onClick={() =>
                                      setExpandedResultId(
                                        isExpanded ? null : rId,
                                      )
                                    }
                                  >
                                    {isExpanded ? "Hide" : "Details"}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>

                          {isExpanded && subjList.length > 0 && (
                            <tr className="expanded-details-row">
                              <td colSpan="10">
                                <div className="nested-subject-breakdown">
                                  <div className="breakdown-header">
                                    <h4>Subject Breakdown - {exam}</h4>
                                    <span>{subjList.length} Subjects</span>
                                  </div>
                                  <table className="nested-subjects-table">
                                    <thead>
                                      <tr>
                                        <th>#</th>
                                        <th>Subject Name</th>
                                        <th className="th-num">Max Marks</th>
                                        <th className="th-num">
                                          Obtained Marks
                                        </th>
                                        <th className="th-grade">Grade</th>
                                        <th>Remarks</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {subjList.map((sub, sIdx) => {
                                        const subName =
                                          sub.subjectName ??
                                          sub.SubjectName ??
                                          sub.name ??
                                          `Subject ${sIdx + 1}`;
                                        const subMax =
                                          sub.maxMarks ?? sub.MaxMarks ?? 100;
                                        const subObt =
                                          sub.obtainedMarks ??
                                          sub.ObtainedMarks ??
                                          0;
                                        const subGrade =
                                          sub.grade ?? sub.Grade ?? "-";
                                        const subRemarks =
                                          sub.remarks ?? sub.Remarks ?? "-";

                                        return (
                                          <tr key={sIdx}>
                                            <td>{sIdx + 1}</td>
                                            <td>
                                              <strong>{subName}</strong>
                                            </td>
                                            <td className="th-num">{subMax}</td>
                                            <td className="th-num">
                                              <strong>{subObt}</strong>
                                            </td>
                                            <td className="th-grade">
                                              <span className="grade-badge">
                                                {subGrade}
                                              </span>
                                            </td>
                                            <td>{subRemarks}</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PreviousResult;
