// =====================================================
// GET BATCH RESULT
// =====================================================

import { useEffect, useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import {
  getAllAcademicYear,
  getAcademicYearDropdown,
} from "../../../Services/academicYearService";

import { getDepartmentDropdown } from "../../../Services/departmentService";

import { getClassDropdown, getAllClass } from "../../../Services/classService";

import { getAllSection } from "../../../Services/sectionService";

import {
  getAllResultBatches,
  getBatchResults,
} from "../../../Services/resultService";

import { isTeacherRole } from "../../../Utils/auth";
import {
  getMyClassTeacherAssignment,
  getCachedClassTeacherAssignment,
} from "../../../Services/classTeacherService";

import "./GetBatchResult.css";

const GetBatchResult = () => {
  const navigate = useNavigate();

  // =====================================================
  // FILTERS STATE
  // =====================================================
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [publishedExams, setPublishedExams] = useState([]);

  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  // Cached data
  const [allBatches, setAllBatches] = useState([]);
  const [allSections, setAllSections] = useState([]);

  // =====================================================
  // RESULTS STATE
  // =====================================================
  const [results, setResults] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // LOADING & ERROR STATE
  // =====================================================
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
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

  const updatePublishedExams = (yearId, clsId, secId, batchList) => {
    if (!yearId || !clsId || !secId) {
      setPublishedExams([]);
      setSelectedExamId("");
      setSelectedBatchId("");
      return;
    }

    const matching = (Array.isArray(batchList) ? batchList : []).filter((b) => {
      const yMatch =
        String(b.academicYearId ?? b.AcademicYearId) === String(yearId);
      const cMatch = String(b.classId ?? b.ClassId) === String(clsId);
      const sMatch = String(b.sectionId ?? b.SectionId) === String(secId);
      const isPub = Boolean(b.isPublished ?? b.IsPublished);

      return yMatch && cMatch && sMatch && isPub;
    });

    const examsList = matching.map((b) => ({
      batchId: b.id ?? b.Id,
      examId: b.examId ?? b.ExamId,
      examName: b.examName || b.ExamName || `Exam ${b.examId ?? b.ExamId}`,
      batch: b,
    }));

    setPublishedExams(examsList);

    if (
      selectedExamId &&
      !examsList.some((e) => String(e.examId) === String(selectedExamId))
    ) {
      setSelectedExamId("");
      setSelectedBatchId("");
    }
  };

  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      setError("");

      const [yearDataResult, deptDataResult, batchesResult, sectionsResult] =
        await Promise.allSettled([
          getAllAcademicYear(),
          getDepartmentDropdown(),
          getAllResultBatches(),
          getAllSection(),
        ]);

      // 1. Academic Years (sorted descending, newest first)
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

      if (sortedYears.length > 0) {
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

      // 3. Batches
      if (
        batchesResult.status === "fulfilled" &&
        Array.isArray(batchesResult.value)
      ) {
        setAllBatches(batchesResult.value);
      } else {
        setAllBatches([]);
      }

      // 4. Sections
      if (
        sectionsResult.status === "fulfilled" &&
        Array.isArray(sectionsResult.value)
      ) {
        setAllSections(sectionsResult.value);
      } else {
        setAllSections([]);
      }

      // Check incoming state from teacher dashboard or auto-detect Class Teacher assignment
      let targetYear = location.state?.academicYearId;
      let targetDept = location.state?.departmentId;
      let targetClass = location.state?.classId;
      let targetSec = location.state?.sectionId;

      if ((!targetClass || !targetSec) && isTeacherRole()) {
        const cached = getCachedClassTeacherAssignment();
        const ctAssignment = cached?.isClassTeacher ? cached : await getMyClassTeacherAssignment().catch(() => null);
        if (ctAssignment?.isClassTeacher) {
          if (!targetYear && ctAssignment.academicYearId) targetYear = String(ctAssignment.academicYearId);
          if (!targetDept && ctAssignment.departmentId) targetDept = String(ctAssignment.departmentId);
          if (!targetClass && ctAssignment.classId) targetClass = String(ctAssignment.classId);
          if (!targetSec && ctAssignment.sectionId) targetSec = String(ctAssignment.sectionId);
        }
      }

      if (targetYear || targetDept || targetClass || targetSec) {
        const finalYear = targetYear ? String(targetYear) : (sortedYears[0]?.id ?? sortedYears[0]?.Id ? String(sortedYears[0]?.id ?? sortedYears[0]?.Id) : "");
        if (finalYear) setSelectedAcademicYearId(finalYear);

        let finalClasses = [];
        if (targetDept) {
          setSelectedDepartmentId(String(targetDept));
          try {
            const data = await getClassDropdown(targetDept);
            if (Array.isArray(data) && data.length > 0) finalClasses = data;
          } catch (_) {}
          if (finalClasses.length === 0) {
            const allClasses = await getAllClass().catch(() => []);
            if (Array.isArray(allClasses)) {
              finalClasses = allClasses
                .filter((c) => String(c.DepartmentId ?? c.departmentId) === String(targetDept))
                .map((c) => ({
                  id: c.Id ?? c.id,
                  text: c.ClassName ?? c.className ?? `Class ${c.Id ?? c.id}`,
                }));
            }
          }
          setClasses(finalClasses);
        }

        if (targetClass) {
          setSelectedClassId(String(targetClass));
          const rawSecs = sectionsResult.status === "fulfilled" && Array.isArray(sectionsResult.value) ? sectionsResult.value : [];
          const filteredSecs = rawSecs
            .filter((s) => {
              const sClassId = getSectionClassId(s);
              return sClassId !== null && String(sClassId) === String(targetClass);
            })
            .map((s) => ({
              id: s.id ?? s.Id,
              text: getSectionText(s),
              sectionName: getSectionText(s),
              schoolClassId: getSectionClassId(s),
            }));
          setSections(filteredSecs);
        }

        if (targetSec) {
          setSelectedSectionId(String(targetSec));
        }

        const batchesList = batchesResult.status === "fulfilled" && Array.isArray(batchesResult.value) ? batchesResult.value : [];
        if (finalYear && targetClass) {
          updatePublishedExams(finalYear, String(targetClass), targetSec ? String(targetSec) : "", batchesList);
        }
      }
    } catch (err) {
      setError(err?.message || "Failed to load initial filter data.");
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // =====================================================
  // FILTER CHANGE HANDLERS
  // =====================================================
  const handleAcademicYearChange = (e) => {
    const yearId = e.target.value;
    setSelectedAcademicYearId(yearId);
    setSelectedExamId("");
    setSelectedBatchId("");
    setResults([]);
    setError("");

    updatePublishedExams(
      yearId,
      selectedClassId,
      selectedSectionId,
      allBatches,
    );
  };

  const handleDepartmentChange = async (e) => {
    const deptId = e.target.value;
    setSelectedDepartmentId(deptId);
    setSelectedClassId("");
    setSelectedSectionId("");
    setSelectedExamId("");
    setSelectedBatchId("");
    setClasses([]);
    setSections([]);
    setPublishedExams([]);
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
    const clsId = e?.target ? e.target.value : e;
    setSelectedClassId(clsId || "");
    setSelectedSectionId("");
    setSelectedExamId("");
    setSelectedBatchId("");
    setSections([]);
    setPublishedExams([]);
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

  const handleSectionChange = (e) => {
    const secId = e.target.value;
    setSelectedSectionId(secId);
    setSelectedExamId("");
    setSelectedBatchId("");
    setResults([]);
    setError("");

    updatePublishedExams(
      selectedAcademicYearId,
      selectedClassId,
      secId,
      allBatches,
    );
  };

  const handleExamChange = async (e) => {
    const examIdVal = e.target.value;
    setSelectedExamId(examIdVal);
    setError("");
    setResults([]);

    if (!examIdVal) {
      setSelectedBatchId("");
      return;
    }

    const match = publishedExams.find(
      (item) => String(item.examId) === String(examIdVal),
    );
    const resolvedBatchId = match?.batchId ? String(match.batchId) : "";
    setSelectedBatchId(resolvedBatchId);

    if (resolvedBatchId) {
      await fetchBatchResults(resolvedBatchId);
    }
  };

  // =====================================================
  // FETCH BATCH RESULTS
  // =====================================================
  const fetchBatchResults = async (batchIdVal) => {
    try {
      setLoadingResults(true);
      setError("");

      const response = await getBatchResults(Number(batchIdVal));
      const data = response?.data || response?.Data || response || [];

      const list = Array.isArray(data) ? data : [];
      setResults(list);

      if (list.length === 0) {
        setError("No student results have been uploaded for this batch yet.");
      }
    } catch (err) {
      setError(err?.message || "Failed to load batch results.");
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
    setSelectedExamId("");
    setSelectedBatchId("");
    setClasses([]);
    setSections([]);
    setPublishedExams([]);
    setResults([]);
    setSearchTerm("");
    setError("");

    if (defaultYear) {
      updatePublishedExams(defaultYear, "", "", allBatches);
    }
  };

  // =====================================================
  // GETTERS FOR CONTEXT LABELS
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

  const getSelectedExamName = () => {
    const item = publishedExams.find(
      (e) => String(e.examId) === String(selectedExamId),
    );
    return item?.examName ?? "-";
  };

  // =====================================================
  // STATS & FILTERED RESULTS
  // =====================================================
  const allFiltersApplied = Boolean(
    selectedAcademicYearId &&
    selectedDepartmentId &&
    selectedClassId &&
    selectedSectionId &&
    selectedExamId,
  );

  const filteredResults = useMemo(() => {
    if (!searchTerm.trim()) return results;
    const term = searchTerm.toLowerCase().trim();

    return results.filter((r) => {
      const name = String(r.studentName ?? r.StudentName ?? "").toLowerCase();
      const adm = String(
        r.admissionNumber ?? r.AdmissionNumber ?? "",
      ).toLowerCase();
      const roll = String(r.rollNumber ?? r.RollNumber ?? "").toLowerCase();
      return name.includes(term) || adm.includes(term) || roll.includes(term);
    });
  }, [results, searchTerm]);

  const stats = useMemo(() => {
    const total = results.length;
    let passed = 0;
    let failed = 0;
    let totalScore = 0;

    results.forEach((r) => {
      const status = String(
        r.resultStatus ?? r.ResultStatus ?? "",
      ).toLowerCase();
      const pct = Number(r.percentage ?? r.Percentage ?? 0);

      if (status === "pass" || pct >= 33) {
        passed += 1;
      } else {
        failed += 1;
      }
      totalScore += pct;
    });

    const passRate = total > 0 ? ((passed / total) * 100).toFixed(1) : "0.0";
    const avgScore = total > 0 ? (totalScore / total).toFixed(1) : "0.0";

    return { total, passed, failed, passRate, avgScore };
  }, [results]);

  return (
    <div className="get-batch-result-container">
      <div className="get-batch-result-card">
        {/* =================================================
            HEADER
            ================================================= */}
        <div className="get-batch-result-header">
          <div className="header-text">
            <h2>Batch Examination Results</h2>
            <p>
              Filter by Academic Year, Department, Class, Section, and Published
              Exam to view the complete result sheet for the batch.
            </p>
          </div>
        </div>

        {/* FEEDBACK ERROR */}
        {error && <div className="get-batch-result-error">{error}</div>}

        {/* =================================================
            5-STEP CASCADING FILTER BAR
            ================================================= */}
        <div className="batch-filter-section">
          <div className="filter-section-header">
            <div className="filter-section-title">
              <span>Filter Parameters</span>
              <small>
                Select class and section to view published batch results
              </small>
            </div>

            <button
              type="button"
              className="batch-reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset all filter selections"
            >
              ↺ Reset Filters
            </button>
          </div>

          <div className="batch-filter-grid">
            {/* 1. ACADEMIC YEAR */}
            <div className="batch-filter-col">
              <label htmlFor="batch-academic-year">
                1. Academic Year <span>*</span>
              </label>
              <select
                id="batch-academic-year"
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
            <div className="batch-filter-col">
              <label htmlFor="batch-department">
                2. Department <span>*</span>
              </label>
              <select
                id="batch-department"
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
            <div className="batch-filter-col">
              <label htmlFor="batch-class">
                3. Class <span>*</span>
              </label>
              <select
                id="batch-class"
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
            <div className="batch-filter-col">
              <label htmlFor="batch-section">
                4. Section <span>*</span>
              </label>
              <select
                id="batch-section"
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

            {/* 5. PUBLISHED EXAM */}
            <div className="batch-filter-col">
              <label htmlFor="batch-exam">
                5. Exam (Published Only) <span>*</span>
              </label>
              <select
                id="batch-exam"
                value={selectedExamId}
                onChange={handleExamChange}
                disabled={!selectedSectionId}
              >
                <option value="">
                  {!selectedSectionId
                    ? "-- Select Section First --"
                    : publishedExams.length === 0
                      ? "-- No Published Exams --"
                      : "-- Select Exam --"}
                </option>
                {publishedExams.map((item) => (
                  <option key={item.batchId} value={item.examId}>
                    {item.examName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* NOTICE IF NO PUBLISHED BATCH */}
          {selectedAcademicYearId &&
            selectedClassId &&
            selectedSectionId &&
            publishedExams.length === 0 && (
              <div className="batch-filter-notice">
                ℹ No published result batches found for this Class and Section.
                Please ensure a Result Batch is created and published first.
              </div>
            )}
        </div>

        {/* =================================================
            CONTENT: PLACEHOLDER OR RESULTS
            ================================================= */}
        {!allFiltersApplied ? (
          <div className="batch-placeholder-box">
            <div className="placeholder-icon">📊</div>
            <h3>Select Filter Parameters</h3>
            <p>
              Please choose <strong>Academic Year</strong>,{" "}
              <strong>Department</strong>, <strong>Class</strong>,{" "}
              <strong>Section</strong>, and a <strong>Published Exam</strong> to
              load and review student scores.
            </p>
          </div>
        ) : loadingResults ? (
          <div className="batch-loading-state">
            <div className="spinner"></div>
            <span>Loading examination results for batch...</span>
          </div>
        ) : (
          <div className="batch-results-content">
            {/* ACTIVE BATCH PARAMETERS PANEL */}
            <div className="batch-context-panel">
              <div className="context-col">
                <span className="context-label">Academic Year</span>
                <strong className="context-value">
                  {getSelectedAcademicYearName()}
                </strong>
              </div>
              <div className="context-col">
                <span className="context-label">Department</span>
                <strong className="context-value">
                  {getSelectedDepartmentName()}
                </strong>
              </div>
              <div className="context-col">
                <span className="context-label">Class</span>
                <strong className="context-value">
                  {getSelectedClassName()}
                </strong>
              </div>
              <div className="context-col">
                <span className="context-label">Section</span>
                <strong className="context-value">
                  {getSelectedSectionName()}
                </strong>
              </div>
              <div className="context-col">
                <span className="context-label">Exam</span>
                <strong className="context-value">
                  {getSelectedExamName()}
                </strong>
              </div>
            </div>

            {/* SUMMARY STATS & SEARCH */}
            <div className="batch-toolbar">
              <div className="batch-stats-badges">
                <div className="stat-pill total">
                  <span>Total Students:</span>
                  <strong>{stats.total}</strong>
                </div>
                <div className="stat-pill pass">
                  <span>Passed:</span>
                  <strong>{stats.passed}</strong>
                </div>
                <div className="stat-pill fail">
                  <span>Failed:</span>
                  <strong>{stats.failed}</strong>
                </div>
                <div className="stat-pill rate">
                  <span>Pass Rate:</span>
                  <strong>{stats.passRate}%</strong>
                </div>
                <div className="stat-pill avg">
                  <span>Class Average:</span>
                  <strong>{stats.avgScore}%</strong>
                </div>
              </div>

              <div className="batch-search-box">
                <input
                  type="text"
                  placeholder="Search student by name or admission no..."
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
            </div>

            {/* RESULTS DATA TABLE (NO RESULT ID / NO BATCH ID) */}
            {filteredResults.length === 0 ? (
              <div className="batch-empty-results">
                {results.length === 0
                  ? "No results have been uploaded for this batch."
                  : "No students matching your search criteria."}
              </div>
            ) : (
              <div className="get-batch-result-table-wrapper">
                <table className="get-batch-result-table">
                  <thead>
                    <tr>
                      <th className="col-idx">#</th>
                      <th className="col-name">Student</th>
                      <th className="col-adm">Admission No</th>
                      <th className="col-roll">Roll No</th>
                      <th className="col-max">Max Marks</th>
                      <th className="col-obt">Obtained</th>
                      <th className="col-pct">Percentage</th>
                      <th className="col-grade">Grade</th>
                      <th className="col-rank">Rank</th>
                      <th className="col-status">Status</th>
                      <th className="col-action">Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredResults.map((item, index) => {
                      const studentName =
                        item.studentName ??
                        item.StudentName ??
                        item.name ??
                        "Student";
                      const admNo =
                        item.admissionNumber ??
                        item.AdmissionNumber ??
                        item.code ??
                        "-";
                      const rollNo = item.rollNumber ?? item.RollNumber ?? "";
                      const maxMarks = item.totalMarks ?? item.TotalMarks ?? 0;
                      const obtMarks =
                        item.obtainedMarks ?? item.ObtainedMarks ?? 0;
                      const pct = Number(
                        item.percentage ?? item.Percentage ?? 0,
                      ).toFixed(2);
                      const grade = item.grade ?? item.Grade ?? "-";
                      const rank = item.rank ?? item.Rank ?? "-";
                      const status =
                        item.resultStatus ?? item.ResultStatus ?? "Pass";
                      const isPass = String(status).toLowerCase() === "pass";

                      return (
                        <tr key={index}>
                          <td className="col-idx">{index + 1}</td>

                          <td className="col-name">
                            <div
                              className="batch-student-cell clickable"
                              onClick={() => {
                                const studentId =
                                  item.studentId ?? item.StudentId ?? item.id;
                                navigate("/student-result/previous", {
                                  state: {
                                    studentId,
                                    studentData: item,
                                    academicYearId: selectedAcademicYearId,
                                    departmentId: selectedDepartmentId,
                                    classId: selectedClassId,
                                    sectionId: selectedSectionId,
                                  },
                                });
                              }}
                              title="Click to preview student result history"
                              role="button"
                              tabIndex={0}
                            >
                              <div
                                className={`student-avatar ${
                                  isPass ? "pass" : "fail"
                                }`}
                              >
                                {(studentName[0] || "S").toUpperCase()}
                              </div>
                              <div className="student-meta">
                                <span className="student-name">
                                  {studentName}
                                </span>
                                {rollNo && (
                                  <small className="student-roll">
                                    Roll No: {rollNo}
                                  </small>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="col-adm">
                            <span className="adm-pill">{admNo}</span>
                          </td>

                          <td className="col-roll">
                            <strong>{rollNo || "—"}</strong>
                          </td>

                          <td className="col-max">{maxMarks}</td>

                          <td className="col-obt">
                            <strong>{obtMarks}</strong>
                          </td>

                          <td className="col-pct">
                            <strong>{pct}%</strong>
                          </td>

                          <td className="col-grade">
                            <span className="grade-badge">{grade}</span>
                          </td>

                          <td className="col-rank">{rank}</td>

                          <td className="col-status">
                            <span
                              className={`status-pill ${
                                isPass ? "pass" : "fail"
                              }`}
                            >
                              {isPass ? "✓ Pass" : "✕ Fail"}
                            </span>
                          </td>

                          <td className="col-action">
                            <div className="batch-actions-row">
                              <button
                                type="button"
                                className="batch-preview-btn"
                                onClick={() => {
                                  const studentId =
                                    item.studentId ?? item.StudentId ?? item.id;
                                  navigate("/student-result/previous", {
                                    state: {
                                      studentId,
                                      studentData: item,
                                      academicYearId: selectedAcademicYearId,
                                      departmentId: selectedDepartmentId,
                                      classId: selectedClassId,
                                      sectionId: selectedSectionId,
                                    },
                                  });
                                }}
                                title="Preview examination history for this student"
                              >
                                Preview
                              </button>

                              <button
                                type="button"
                                className="batch-action-btn"
                                onClick={() => {
                                  const resultId =
                                    item.resultId ?? item.ResultId ?? item.id;
                                  navigate("/student-result/update", {
                                    state: {
                                      resultId,
                                      studentData: item,
                                    },
                                  });
                                }}
                              >
                                Update
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
        )}
      </div>
    </div>
  );
};

export default GetBatchResult;
