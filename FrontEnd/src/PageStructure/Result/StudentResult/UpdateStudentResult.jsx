// =====================================================
// UPDATE STUDENT RESULT
// =====================================================

import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";

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
  getResultById,
  updateStudentResult,
} from "../../../Services/resultService";

import "./UpdateStudentResult.css";

const UpdateStudentResult = () => {
  const location = useLocation();

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
  // BATCH STUDENTS & EDITING STATE
  // =====================================================
  const [batchStudents, setBatchStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [result, setResult] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // LOADING & NOTICES
  // =====================================================
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingBatchStudents, setLoadingBatchStudents] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [message, setMessage] = useState("");
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

  // Grade calculation scale (sync with backend ResultService)
  const calculateGrade = (obtained, max) => {
    if (obtained === "" || obtained === undefined || obtained === null) {
      return "";
    }
    const obtNum = parseFloat(obtained);
    const maxNum = parseFloat(max);
    if (isNaN(obtNum) || isNaN(maxNum) || maxNum <= 0 || obtNum < 0) {
      return "";
    }
    const percentage = (obtNum / maxNum) * 100;
    if (percentage >= 90) return "A+";
    if (percentage >= 80) return "A";
    if (percentage >= 70) return "B";
    if (percentage >= 60) return "C";
    if (percentage >= 50) return "D";
    if (percentage >= 33) return "E";
    return "F";
  };

  // =====================================================
  // LOAD INITIAL DATA
  // =====================================================
  useEffect(() => {
    loadInitialData();
  }, []);

  // Handle direct navigation with location.state (e.g., from GetBatchResult)
  useEffect(() => {
    if (location.state?.resultId) {
      const id = Number(location.state.resultId);
      if (id > 0) {
        fetchResultById(id);
      }
    }
  }, [location.state]);

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
    setSelectedExamId("");
    setSelectedBatchId("");
    setBatchStudents([]);
    setSelectedStudentId("");
    setResult(null);
    setSubjects([]);
    setError("");
    setMessage("");

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
    setBatchStudents([]);
    setSelectedStudentId("");
    setResult(null);
    setSubjects([]);
    setError("");
    setMessage("");

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
    setSelectedExamId("");
    setSelectedBatchId("");
    setSections([]);
    setPublishedExams([]);
    setBatchStudents([]);
    setSelectedStudentId("");
    setResult(null);
    setSubjects([]);
    setError("");
    setMessage("");

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
    setBatchStudents([]);
    setSelectedStudentId("");
    setResult(null);
    setSubjects([]);
    setError("");
    setMessage("");

    updatePublishedExams(
      selectedAcademicYearId,
      selectedClassId,
      secId,
      allBatches,
    );
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

  const handleExamChange = async (e) => {
    const examIdVal = e.target.value;
    setSelectedExamId(examIdVal);
    setError("");
    setMessage("");
    setBatchStudents([]);
    setSelectedStudentId("");
    setResult(null);
    setSubjects([]);

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
      await fetchBatchStudents(resolvedBatchId);
    }
  };

  // =====================================================
  // FETCH BATCH STUDENTS
  // =====================================================
  const fetchBatchStudents = async (batchIdVal) => {
    try {
      setLoadingBatchStudents(true);
      setError("");

      const response = await getBatchResults(Number(batchIdVal));
      const data = response?.data || response?.Data || response || [];
      const list = Array.isArray(data) ? data : [];
      setBatchStudents(list);

      if (list.length === 0) {
        setError("No uploaded results found for this batch to update.");
      }
    } catch (err) {
      setError(err?.message || "Failed to load batch student results.");
    } finally {
      setLoadingBatchStudents(false);
    }
  };

  // =====================================================
  // FETCH RESULT BY ID (FOR EDITING)
  // =====================================================
  const fetchResultById = async (id) => {
    setError("");
    setMessage("");
    setResult(null);
    setSubjects([]);

    try {
      setLoadingResult(true);
      const response = await getResultById(Number(id));
      const data = response?.data || response?.Data || response;

      if (!data) {
        setError("Student result could not be found.");
        return;
      }

      setResult(data);
      const sId = String(data.studentId ?? data.StudentId ?? "");
      setSelectedStudentId(sId);

      const detailList =
        data.subjects ??
        data.Subjects ??
        data.resultDetails ??
        data.ResultDetails ??
        [];

      setSubjects(
        detailList.map((item) => {
          const max = item.maxMarks ?? item.MaxMarks ?? 100;
          const obt = item.obtainedMarks ?? item.ObtainedMarks ?? "";
          const calculated = calculateGrade(obt, max);
          return {
            id: item.id ?? item.Id,
            subjectId: item.subjectId ?? item.SubjectId,
            subjectName: item.subjectName ?? item.SubjectName ?? "",
            maxMarks: max,
            obtainedMarks: obt,
            grade: item.grade ?? item.Grade ?? calculated,
            remarks: item.remarks ?? item.Remarks ?? "",
          };
        }),
      );
    } catch (err) {
      setError(err?.message || "Failed to load student result for editing.");
    } finally {
      setLoadingResult(false);
    }
  };

  // When a student is selected from the batch
  const handleSelectStudent = (studentItem) => {
    const resultId =
      studentItem.resultId ?? studentItem.ResultId ?? studentItem.id;
    if (resultId) {
      fetchResultById(resultId);
    } else {
      setError("Unable to find result record for selected student.");
    }
  };

  // =====================================================
  // SUBJECT MARKS CHANGES & 0.5 STEPPER
  // =====================================================
  const handleSubjectChange = (index, field, value) => {
    setSubjects((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;

        const updated = {
          ...item,
          [field]: value,
        };

        // Automatically update Grade according to obtained and max marks
        if (field === "obtainedMarks") {
          const maxVal = updated.maxMarks || 100;
          updated.grade = calculateGrade(value, maxVal);
        } else if (field === "maxMarks") {
          if (
            updated.obtainedMarks !== "" &&
            updated.obtainedMarks !== undefined
          ) {
            updated.grade = calculateGrade(updated.obtainedMarks, value);
          }
        }

        return updated;
      }),
    );

    setError("");
    setMessage("");
  };

  const handleStepMark = (index, delta) => {
    const current = subjects[index] || {};
    const currentVal =
      current.obtainedMarks === "" || current.obtainedMarks === undefined
        ? 0
        : parseFloat(current.obtainedMarks);
    const maxVal = parseFloat(current.maxMarks || 100);

    let newVal = Math.round((currentVal + delta) * 10) / 10;
    if (newVal < 0) newVal = 0;
    if (newVal > maxVal) newVal = maxVal;

    handleSubjectChange(index, "obtainedMarks", String(newVal));
  };

  // =====================================================
  // SUBMIT UPDATE
  // =====================================================
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!result) {
      setError("Please select a student result to update.");
      return;
    }

    if (subjects.length === 0) {
      setError("No result subjects found to update.");
      return;
    }

    const subjectData = [];

    for (const item of subjects) {
      const maxMarks = Number(item.maxMarks);
      const obtainedMarks = Number(item.obtainedMarks);

      if (Number.isNaN(maxMarks) || maxMarks <= 0) {
        setError(`Invalid maximum marks for ${item.subjectName}.`);
        return;
      }

      if (
        Number.isNaN(obtainedMarks) ||
        obtainedMarks < 0 ||
        obtainedMarks > maxMarks
      ) {
        setError(
          `Obtained marks for ${item.subjectName} must be between 0 and ${maxMarks}.`,
        );
        return;
      }

      subjectData.push({
        subjectId: Number(item.subjectId),
        subjectName: item.subjectName,
        maxMarks,
        obtainedMarks,
        grade: item.grade || calculateGrade(obtainedMarks, maxMarks) || null,
        remarks: item.remarks || null,
      });
    }

    try {
      setUpdating(true);

      const payload = {
        resultId: result.id ?? result.Id,
        resultBatchId: result.resultBatchId ?? result.ResultBatchId,
        studentId: result.studentId ?? result.StudentId,
        subjects: subjectData,
      };

      const response = await updateStudentResult(payload);
      const data = response?.data || response?.Data;

      setMessage("Student result updated successfully!");

      if (data) {
        setResult(data);
      }

      // Refresh batch students list to show updated totals
      if (selectedBatchId) {
        fetchBatchStudents(selectedBatchId);
      }
    } catch (err) {
      setError(err?.message || "Failed to update student result.");
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // RESET ALL FILTERS
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
    setBatchStudents([]);
    setSelectedStudentId("");
    setResult(null);
    setSubjects([]);
    setSearchTerm("");
    setError("");
    setMessage("");

    if (defaultYear) {
      updatePublishedExams(defaultYear, "", "", allBatches);
    }
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

  const getSelectedExamName = () => {
    const item = publishedExams.find(
      (e) => String(e.examId) === String(selectedExamId),
    );
    return item?.examName ?? "-";
  };

  const allFiltersApplied = Boolean(
    selectedAcademicYearId &&
    selectedDepartmentId &&
    selectedClassId &&
    selectedSectionId &&
    selectedExamId,
  );

  const filteredBatchStudents = useMemo(() => {
    if (!searchTerm.trim()) return batchStudents;
    const term = searchTerm.toLowerCase().trim();
    return batchStudents.filter((item) => {
      const name = String(
        item.studentName ?? item.StudentName ?? item.name ?? "",
      ).toLowerCase();
      const adm = String(
        item.admissionNumber ?? item.AdmissionNumber ?? item.code ?? "",
      ).toLowerCase();
      return name.includes(term) || adm.includes(term);
    });
  }, [batchStudents, searchTerm]);

  return (
    <div className="update-student-result-container">
      <div className="update-student-result-card">
        {/* =================================================
            HEADER
            ================================================= */}
        <div className="update-student-result-header">
          <div className="header-text">
            <h2>Update Student Examination Result</h2>
            <p>
              Filter by Academic Year, Department, Class, Section, and Published
              Exam to modify individual student marks with auto-calculated
              grades.
            </p>
          </div>
        </div>

        {/* FEEDBACK MESSAGES */}
        {message && (
          <div className="update-student-result-success">{message}</div>
        )}
        {error && <div className="update-student-result-error">{error}</div>}

        {/* =================================================
            5-STEP CASCADING FILTER BAR (HIDDEN WHEN IN DIRECT EDIT IF NEEDED)
            ================================================= */}
        <div className="update-filter-section">
          <div className="filter-section-header">
            <div className="filter-section-title">
              <span>Filter Parameters</span>
              <small>
                Select class and published exam to load uploaded results
              </small>
            </div>

            <button
              type="button"
              className="update-reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset all filter selections"
            >
              ↺ Reset Filters
            </button>
          </div>

          <div className="update-filter-grid">
            {/* 1. ACADEMIC YEAR */}
            <div className="update-filter-col">
              <label htmlFor="update-academic-year">
                1. Academic Year <span>*</span>
              </label>
              <select
                id="update-academic-year"
                value={selectedAcademicYearId}
                onChange={handleAcademicYearChange}
                disabled={loadingInitial || updating}
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
            <div className="update-filter-col">
              <label htmlFor="update-department">
                2. Department <span>*</span>
              </label>
              <select
                id="update-department"
                value={selectedDepartmentId}
                onChange={handleDepartmentChange}
                disabled={loadingInitial || updating}
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
            <div className="update-filter-col">
              <label htmlFor="update-class">
                3. Class <span>*</span>
              </label>
              <select
                id="update-class"
                value={selectedClassId}
                onChange={handleClassChange}
                disabled={!selectedDepartmentId || loadingClasses || updating}
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
            <div className="update-filter-col">
              <label htmlFor="update-section">
                4. Section <span>*</span>
              </label>
              <select
                id="update-section"
                value={selectedSectionId}
                onChange={handleSectionChange}
                disabled={!selectedClassId || loadingSections || updating}
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
            <div className="update-filter-col">
              <label htmlFor="update-exam">
                5. Exam (Published Only) <span>*</span>
              </label>
              <select
                id="update-exam"
                value={selectedExamId}
                onChange={handleExamChange}
                disabled={!selectedSectionId || updating}
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
              <div className="update-filter-notice">
                ℹ No published result batches found for this Class and Section.
                Please ensure a Result Batch is created and published first.
              </div>
            )}
        </div>

        {/* =================================================
            CONTENT: PLACEHOLDER OR STUDENT SELECTOR & FORM
            ================================================= */}
        {!allFiltersApplied && !result ? (
          <div className="update-placeholder-box">
            <div className="placeholder-icon">✏️</div>
            <h3>Select Filter Parameters</h3>
            <p>
              Please choose <strong>Academic Year</strong>,{" "}
              <strong>Department</strong>, <strong>Class</strong>,{" "}
              <strong>Section</strong>, and a <strong>Published Exam</strong> to
              select an uploaded student result for modification.
            </p>
          </div>
        ) : loadingBatchStudents ? (
          <div className="update-loading-state">
            <div className="spinner"></div>
            <span>Loading batch student results...</span>
          </div>
        ) : !result ? (
          /* STUDENT LIST TO SELECT FROM */
          <div className="update-student-selection-panel">
            <div className="update-selection-header">
              <div className="header-info">
                <h3>Uploaded Students in Batch</h3>
                <small>
                  Select a student to edit marks and recalculate grade
                </small>
              </div>

              {batchStudents.length > 0 && (
                <div className="update-search-box">
                  <input
                    type="text"
                    placeholder="Search by student name or admission no..."
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

            {filteredBatchStudents.length === 0 ? (
              <div className="update-empty-box">
                {batchStudents.length === 0
                  ? "No student results found for this batch."
                  : "No students matching your search criteria."}
              </div>
            ) : (
              <div className="update-student-cards-grid">
                {filteredBatchStudents.map((s) => {
                  const name =
                    s.studentName ?? s.StudentName ?? s.name ?? "Student";
                  const adm =
                    s.admissionNumber ?? s.AdmissionNumber ?? s.code ?? "-";
                  const obt = s.obtainedMarks ?? s.ObtainedMarks ?? 0;
                  const max = s.totalMarks ?? s.TotalMarks ?? 0;
                  const grade = s.grade ?? s.Grade ?? "-";
                  const isPass =
                    String(
                      s.resultStatus ?? s.ResultStatus ?? "",
                    ).toLowerCase() === "pass";

                  return (
                    <div
                      key={s.resultId ?? s.ResultId ?? s.id}
                      className="update-student-card"
                      onClick={() => handleSelectStudent(s)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="card-top">
                        <div
                          className={`student-avatar ${
                            isPass ? "pass" : "fail"
                          }`}
                        >
                          {(name[0] || "S").toUpperCase()}
                        </div>
                        <div className="student-info">
                          <h4 className="student-name">{name}</h4>
                          <span className="student-adm">Adm: {adm}</span>
                        </div>
                      </div>

                      <div className="card-meta-row">
                        <div className="score-badge">
                          <span>Marks:</span>
                          <strong>
                            {obt} / {max}
                          </strong>
                        </div>
                        <span className="grade-badge">{grade}</span>
                      </div>

                      <button
                        type="button"
                        className="card-edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectStudent(s);
                        }}
                      >
                        Edit Marks ✎
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : loadingResult ? (
          <div className="update-loading-state">
            <div className="spinner"></div>
            <span>Loading student marks for editing...</span>
          </div>
        ) : (
          /* EDIT RESULT MARKS FORM */
          <form className="update-student-result-form" onSubmit={handleUpdate}>
            {/* CONTEXT INFORMATION (ZERO RAW IDS) */}
            <div className="update-context-banner">
              <div className="banner-col">
                <span className="banner-label">Student Name</span>
                <strong className="banner-val">
                  {result.studentName ?? result.StudentName ?? "-"}
                </strong>
              </div>
              <div className="banner-col">
                <span className="banner-label">Admission Number</span>
                <strong className="banner-val">
                  {result.admissionNumber ?? result.AdmissionNumber ?? "-"}
                </strong>
              </div>
              {(result.rollNumber ?? result.RollNumber) && (
                <div className="banner-col">
                  <span className="banner-label">Roll Number</span>
                  <strong className="banner-val">
                    {result.rollNumber ?? result.RollNumber}
                  </strong>
                </div>
              )}
              {selectedAcademicYearId && (
                <div className="banner-col">
                  <span className="banner-label">Academic Year</span>
                  <strong className="banner-val">
                    {getSelectedAcademicYearName()}
                  </strong>
                </div>
              )}
              {selectedClassId && (
                <div className="banner-col">
                  <span className="banner-label">Class & Section</span>
                  <strong className="banner-val">
                    {getSelectedClassName()} - {getSelectedSectionName()}
                  </strong>
                </div>
              )}
              {selectedExamId && (
                <div className="banner-col">
                  <span className="banner-label">Exam</span>
                  <strong className="banner-val">
                    {getSelectedExamName()}
                  </strong>
                </div>
              )}
            </div>

            {/* SUBJECT MARKS TABLE WITH 0.5 STEPPER & AUTO-GRADE */}
            <div className="update-subjects-card">
              <div className="subjects-card-header">
                <h3>Subject Marks & Evaluation</h3>
                <small>
                  Use -0.5 / +0.5 steppers or type marks directly; grade updates
                  automatically
                </small>
              </div>

              <div className="update-table-wrapper">
                <table className="update-table">
                  <thead>
                    <tr>
                      <th className="th-idx">#</th>
                      <th>Subject</th>
                      <th className="th-max">Max Marks</th>
                      <th className="th-obt">Obtained Marks (±0.5)</th>
                      <th className="th-grade">Auto Grade</th>
                      <th>Remarks</th>
                    </tr>
                  </thead>

                  <tbody>
                    {subjects.map((item, index) => (
                      <tr key={item.id ?? index}>
                        <td className="th-idx">{index + 1}</td>

                        <td className="td-subj">
                          <strong>{item.subjectName || "-"}</strong>
                        </td>

                        <td className="th-max">
                          <input
                            type="number"
                            min="1"
                            step="1"
                            value={item.maxMarks}
                            onChange={(e) =>
                              handleSubjectChange(
                                index,
                                "maxMarks",
                                e.target.value,
                              )
                            }
                            disabled={updating}
                            className="max-marks-input"
                          />
                        </td>

                        <td className="th-obt">
                          <div className="stepper-input-group">
                            <button
                              type="button"
                              className="stepper-btn minus"
                              onClick={() => handleStepMark(index, -0.5)}
                              disabled={updating}
                              title="Decrease by 0.5"
                            >
                              - 0.5
                            </button>

                            <input
                              type="number"
                              min="0"
                              max={item.maxMarks || 100}
                              step="0.5"
                              value={item.obtainedMarks}
                              onChange={(e) =>
                                handleSubjectChange(
                                  index,
                                  "obtainedMarks",
                                  e.target.value,
                                )
                              }
                              disabled={updating}
                              className="obt-marks-input"
                            />

                            <button
                              type="button"
                              className="stepper-btn plus"
                              onClick={() => handleStepMark(index, 0.5)}
                              disabled={updating}
                              title="Increase by 0.5"
                            >
                              + 0.5
                            </button>
                          </div>
                        </td>

                        <td className="th-grade">
                          <span
                            className={`grade-badge-auto ${
                              item.grade === "F" ? "fail" : "pass"
                            }`}
                          >
                            {item.grade || "-"}
                          </span>
                        </td>

                        <td>
                          <input
                            type="text"
                            placeholder="Optional remark..."
                            value={item.remarks}
                            onChange={(e) =>
                              handleSubjectChange(
                                index,
                                "remarks",
                                e.target.value,
                              )
                            }
                            disabled={updating}
                            className="remarks-input"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="update-actions-bar">
              <button
                type="button"
                className="update-back-btn"
                onClick={() => {
                  setResult(null);
                  setSubjects([]);
                  setMessage("");
                  setError("");
                }}
                disabled={updating}
              >
                ← Back to Student List
              </button>

              <button
                type="submit"
                className="update-submit-btn"
                disabled={updating}
              >
                {updating ? "Saving Changes..." : "✓ Save & Update Result"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateStudentResult;
