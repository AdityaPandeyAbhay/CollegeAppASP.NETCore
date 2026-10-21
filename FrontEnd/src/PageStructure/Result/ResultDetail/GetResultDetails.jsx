// =====================================================
// GET RESULT DETAILS
// Cascading Academic Filters: Academic Year -> Department -> Class -> Section -> Student
// Auto-loads and presents complete student result scorecard upon selection
// =====================================================

import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
  getSavedStudentRollNumber,
} from "../../../Services/studentService";

import {
  getResultDetails,
  getStudentPreviousResults,
  getExamDropdown,
  getAllExams,
  getAllResultBatches,
  getBatchResults,
} from "../../../Services/resultService";

import generateMarksheetPdf from "../../../Utils/generateMarksheetPdf";
import { isTeacherRole } from "../../../Utils/auth";
import {
  getMyClassTeacherAssignment,
  getCachedClassTeacherAssignment,
} from "../../../Services/classTeacherService";

import "./GetResultDetails.css";

const GetResultDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // =====================================================
  // FILTER STATES (CASCADING)
  // =====================================================
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);

  // Selected Filter Values
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Cached all sections for class-wise filtering
  const [allSections, setAllSections] = useState([]);

  // =====================================================
  // RESULT DATA STATES
  // =====================================================
  const [studentResults, setStudentResults] = useState([]);
  const [sessionExamCards, setSessionExamCards] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [masterExams, setMasterExams] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [activeResultId, setActiveResultId] = useState(null);
  const [activeExamId, setActiveExamId] = useState(null);

  // Direct Result ID Search (Secondary / Quick lookup)
  const [manualResultId, setManualResultId] = useState("");
  const [showManualSearch, setShowManualSearch] = useState(false);

  // =====================================================
  // LOADING & ERROR STATES
  // =====================================================
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingResult, setLoadingResult] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
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
    if (value === null || value === undefined || value === "") {
      return "-";
    }
    const num = Number(value);
    if (isNaN(num)) return "-";
    return `${num.toFixed(2)}%`;
  };

  const getStudentDisplayName = (student) => {
    if (!student) return "";
    const first = student.firstName ?? student.FirstName ?? "";
    const last = student.lastName ?? student.LastName ?? "";
    const full = `${first} ${last}`.trim();
    if (full) return full;
    return (
      student.studentName ??
      student.StudentName ??
      student.text ??
      student.Text ??
      student.name ??
      student.Name ??
      "Student"
    );
  };

  const getStudentRollNo = (student, result = null) => {
    if (result?.rollNumber || result?.RollNumber) {
      return result.rollNumber || result.RollNumber;
    }
    const sId =
      student?.id ?? student?.Id ?? student?.studentId ?? student?.StudentId;
    const adm =
      student?.admissionNumber ??
      student?.AdmissionNumber ??
      result?.admissionNumber ??
      result?.AdmissionNumber;

    return (
      student?.rollNumber ??
      student?.RollNumber ??
      (sId ? getSavedStudentRollNumber(sId) : null) ??
      (adm ? getSavedStudentRollNumber(adm) : null) ??
      "—"
    );
  };

  // Context Display Helpers
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

  // =====================================================
  // INITIAL DATA LOAD & AUTO-POPULATION
  // =====================================================
  useEffect(() => {
    const initialize = async () => {
      const initialSections = await loadInitialData();
      let navState =
        location.state ||
        (() => {
          try {
            const raw = sessionStorage.getItem("active_result_detail_nav");
            return raw ? JSON.parse(raw) : null;
          } catch (_) {
            return null;
          }
        })();

      if ((!navState || !navState.classId) && isTeacherRole()) {
        const cached = getCachedClassTeacherAssignment();
        const ctAssignment =
          cached?.isClassTeacher
            ? cached
            : await getMyClassTeacherAssignment().catch(() => null);
        if (ctAssignment?.isClassTeacher) {
          navState = {
            ...(navState || {}),
            academicYearId:
              navState?.academicYearId || ctAssignment.academicYearId,
            departmentId:
              navState?.departmentId || ctAssignment.departmentId,
            classId: ctAssignment.classId,
            sectionId: ctAssignment.sectionId,
            fromTeacherDashboard: true,
          };
        }
      }

      if (navState) {
        await handleIncomingNavigation(navState, initialSections);
      }
    };
    initialize();
  }, []);

  // Handle subsequent incoming route state
  useEffect(() => {
    const handleState = async () => {
      if (location.state) {
        let st = location.state;
        if (!st.classId && isTeacherRole()) {
          const cached = getCachedClassTeacherAssignment();
          const ctAssignment =
            cached?.isClassTeacher
              ? cached
              : await getMyClassTeacherAssignment().catch(() => null);
          if (ctAssignment?.isClassTeacher) {
            st = {
              ...st,
              academicYearId: st.academicYearId || ctAssignment.academicYearId,
              departmentId: st.departmentId || ctAssignment.departmentId,
              classId: ctAssignment.classId,
              sectionId: ctAssignment.sectionId,
            };
          }
        }
        handleIncomingNavigation(st);
      }
    };
    handleState();
  }, [location.state]);

  async function loadInitialData() {
    let resolvedSections = [];
    try {
      setLoadingInitial(true);
      setError("");

      const [
        yearDataResult,
        deptDataResult,
        sectionsResult,
        examsResult,
        batchesResult,
      ] = await Promise.allSettled([
        getAllAcademicYear(),
        getDepartmentDropdown(),
        getAllSection(),
        getExamDropdown(),
        getAllResultBatches(),
      ]);

      // 1. Academic Years (Sorted newest first)
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

      // Default to most recently created academic year
      if (sortedYears.length > 0 && !selectedAcademicYearId) {
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

      // 3. Sections (for class-wise filtering)
      if (
        sectionsResult.status === "fulfilled" &&
        Array.isArray(sectionsResult.value)
      ) {
        resolvedSections = sectionsResult.value;
        setAllSections(resolvedSections);
      } else {
        setAllSections([]);
      }

      // 4. Master Exams
      let examList = [];
      if (
        examsResult.status === "fulfilled" &&
        Array.isArray(examsResult.value) &&
        examsResult.value.length > 0
      ) {
        examList = examsResult.value;
      } else {
        try {
          const allEx = await getAllExams();
          examList = Array.isArray(allEx) ? allEx : [];
        } catch (_) {}
      }
      setMasterExams(examList);

      // 5. Result Batches
      if (
        batchesResult.status === "fulfilled" &&
        Array.isArray(batchesResult.value)
      ) {
        setAllBatches(batchesResult.value);
      } else {
        setAllBatches([]);
      }

      return resolvedSections;
    } catch (err) {
      setError(err?.message || "Failed to load initial filter parameters.");
      return resolvedSections;
    } finally {
      setLoadingInitial(false);
    }
  }

  async function handleIncomingNavigation(st, loadedAllSections = null) {
    if (!st) return;

    if (st.resultId) {
      setManualResultId(String(st.resultId));
      await fetchDirectResultDetails(Number(st.resultId));
      return;
    }

    try {
      setLoadingResult(true);
      setError("");

      // 1. Set Academic Year
      const yrId = st.academicYearId
        ? String(st.academicYearId)
        : selectedAcademicYearId;
      if (yrId) {
        setSelectedAcademicYearId(yrId);
      }

      // 2. Set Department & Load Classes for Department
      const deptId = st.departmentId ? String(st.departmentId) : "";
      if (deptId) {
        setSelectedDepartmentId(deptId);
        try {
          let classList = [];
          const data = await getClassDropdown(deptId).catch(() => []);
          if (Array.isArray(data) && data.length > 0) {
            classList = data;
          } else {
            const allClasses = await getAllClass().catch(() => []);
            classList = Array.isArray(allClasses)
              ? allClasses.filter(
                  (c) =>
                    String(c.departmentId ?? c.DepartmentId) === String(deptId),
                )
              : [];
          }
          setClasses(classList);
        } catch (_) {}
      }

      // 3. Set Class & Load Sections for Class
      const clsId = st.classId ? String(st.classId) : "";
      if (clsId) {
        setSelectedClassId(clsId);
        try {
          let sourceSections = loadedAllSections || allSections;
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
        } catch (_) {}
      }

      // 4. Set Section & Load Students for Class and Section
      const secId = st.sectionId ? String(st.sectionId) : "";
      if (secId) {
        setSelectedSectionId(secId);
      }

      if (clsId && secId) {
        try {
          const studentList = await fetchStudentsForClassSection(
            deptId,
            clsId,
            secId,
          );
          setStudents(studentList);
        } catch (_) {}
      }

      // 5. Set Selected Student if provided
      const sId = st.studentId ? Number(st.studentId) : null;
      if (sId) {
        setSelectedStudentId(String(sId));
        if (st.studentData) {
          setSelectedStudent(st.studentData);
        }

        // 6. Load Student Results
        await loadStudentResults(sId, st.studentData, yrId, clsId, secId);
      }
    } catch (err) {
      console.error("Failed to auto-populate result detail:", err);
      setError("Failed to auto-populate result detail.");
    } finally {
      setLoadingResult(false);
    }
  }

  // =====================================================
  // FILTER CHANGE HANDLERS (CASCADE)
  // =====================================================

  // 1. Academic Year Change
  const handleAcademicYearChange = (e) => {
    const yrId = e.target.value;
    setSelectedAcademicYearId(yrId);
    setError("");

    // If a student is already selected, re-load results under new year filter
    if (selectedStudentId) {
      loadStudentResults(
        Number(selectedStudentId),
        selectedStudent,
        yrId,
        selectedClassId,
        selectedSectionId,
      );
    }
  };

  // 2. Department Change
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
    setStudentResults([]);
    setSelectedResult(null);
    setActiveResultId(null);
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

  // 3. Class Change
  const handleClassChange = async (e) => {
    const clsId = e.target.value;
    setSelectedClassId(clsId || "");
    setSelectedSectionId("");
    setSelectedStudentId("");
    setSelectedStudent(null);
    setSections([]);
    setStudents([]);
    setStudentResults([]);
    setSelectedResult(null);
    setActiveResultId(null);
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

  // 4. Section Change
  const handleSectionChange = async (e) => {
    const secId = e.target.value;
    setSelectedSectionId(secId);
    setSelectedStudentId("");
    setSelectedStudent(null);
    setStudents([]);
    setStudentResults([]);
    setSelectedResult(null);
    setActiveResultId(null);
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

  // Helper: Fetch students for selected class and section
  async function fetchStudentsForClassSection(deptId, clsId, secId) {
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

  // 5. Student Change -> AUTO-OPENS STUDENT RESULT DETAIL
  const handleStudentChange = async (e) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    setError("");
    setStudentResults([]);
    setSelectedResult(null);
    setActiveResultId(null);

    if (!sId) {
      setSelectedStudent(null);
      return;
    }

    const matched = students.find(
      (s) => String(s.id ?? s.Id ?? s.studentId ?? s.StudentId) === String(sId),
    );
    setSelectedStudent(matched || null);

    await loadStudentResults(
      Number(sId),
      matched,
      selectedAcademicYearId,
      selectedClassId,
      selectedSectionId,
    );
  };

  // =====================================================
  // LOAD STUDENT RESULTS & EXAM DETAIL CARD
  // Matches exact exams and batch results (like GetStudentResult)
  // =====================================================
  async function loadStudentResults(
    sId,
    fallbackStudent = null,
    overrideYearId = null,
    overrideClassId = null,
    overrideSectionId = null,
  ) {
    try {
      setLoadingResult(true);
      setError("");

      const effectiveYearId = overrideYearId || selectedAcademicYearId;
      const effectiveClassId = overrideClassId || selectedClassId;
      const effectiveSectionId = overrideSectionId || selectedSectionId;
      const effectiveStudent = fallbackStudent || selectedStudent;
      const studentAdm = String(
        effectiveStudent?.admissionNumber ??
          effectiveStudent?.AdmissionNumber ??
          "",
      ).trim();

      // 1. Ensure batches are available
      let batches = allBatches;
      if (!batches || batches.length === 0) {
        try {
          const freshBatches = await getAllResultBatches();
          batches = Array.isArray(freshBatches)
            ? freshBatches
            : freshBatches?.data || freshBatches?.Data || [];
          setAllBatches(batches);
        } catch (_) {
          batches = [];
        }
      }

      // 2. Filter batches matching current Academic Year and Class
      const matchingBatches = batches.filter((b) => {
        const yMatch =
          !effectiveYearId ||
          Number(b.academicYearId ?? b.AcademicYearId) ===
            Number(effectiveYearId);
        const cMatch =
          !effectiveClassId ||
          Number(b.classId ?? b.ClassId) === Number(effectiveClassId);
        const sMatch =
          !effectiveSectionId ||
          Number(b.sectionId ?? b.SectionId) === Number(effectiveSectionId);
        return yMatch && cMatch && sMatch;
      });

      // 3. Resolve exact session exams (Unit Tests, Half Yearly, Annual, etc.)
      let sessionExams = masterExams.map((e) => {
        const id = Number(e.id ?? e.Id ?? e.examId ?? e.ExamId);
        const name =
          e.examName ||
          e.ExamName ||
          e.text ||
          e.Text ||
          e.name ||
          `Exam ${id}`;
        return { id, examId: id, examName: name.trim() };
      });

      // Include exams present in matching batches
      matchingBatches.forEach((b) => {
        const bExamId = Number(b.examId ?? b.ExamId);
        const bExamName = (
          b.examName ||
          b.ExamName ||
          `Exam ${bExamId}`
        ).trim();
        if (
          bExamId &&
          !sessionExams.some((ex) => Number(ex.examId) === bExamId)
        ) {
          sessionExams.push({
            id: bExamId,
            examId: bExamId,
            examName: bExamName,
          });
        }
      });

      // If still empty, derive unique exams from batches
      if (sessionExams.length === 0 && matchingBatches.length > 0) {
        const map = new Map();
        matchingBatches.forEach((b) => {
          const id = Number(b.examId ?? b.ExamId);
          if (id && !map.has(id)) {
            map.set(id, {
              id,
              examId: id,
              examName: (b.examName || b.ExamName || `Exam ${id}`).trim(),
            });
          }
        });
        sessionExams = Array.from(map.values());
      }

      // 4. Query batch results for each matching batch to find this student's declared results
      const examResultLookup = {};

      const batchPromises = matchingBatches.map(async (batch) => {
        const batchId = Number(batch.id ?? batch.Id);
        const examId = Number(batch.examId ?? batch.ExamId);
        try {
          const res = await getBatchResults(batchId);
          const data = res?.data || res?.Data || res || [];
          if (Array.isArray(data) && data.length > 0) {
            // Calculate Rank across all students in this class and section batch based on total marks obtained
            const sortedByScore = [...data].sort((a, b) => {
              const obtA = Number(a.obtainedMarks ?? a.ObtainedMarks ?? 0);
              const obtB = Number(b.obtainedMarks ?? b.ObtainedMarks ?? 0);
              if (obtB !== obtA) return obtB - obtA;
              const pctA = Number(a.percentage ?? a.Percentage ?? 0);
              const pctB = Number(b.percentage ?? b.Percentage ?? 0);
              return pctB - pctA;
            });

            let currentRank = 1;
            const rankedStudents = sortedByScore.map((studentItem, index) => {
              if (index > 0) {
                const prevItem = sortedByScore[index - 1];
                const prevObt = Number(
                  prevItem.obtainedMarks ?? prevItem.ObtainedMarks ?? 0,
                );
                const currObt = Number(
                  studentItem.obtainedMarks ?? studentItem.ObtainedMarks ?? 0,
                );
                if (currObt < prevObt) {
                  currentRank = index + 1;
                }
              }
              return {
                ...studentItem,
                calculatedRank: currentRank,
                totalClassStudents: sortedByScore.length,
              };
            });

            const found = rankedStudents.find((item) => {
              const itemSId =
                item.studentId ?? item.StudentId ?? item.id ?? item.Id;
              const itemAdm = String(
                item.admissionNumber ?? item.AdmissionNumber ?? "",
              ).trim();
              return (
                (sId && Number(itemSId) === Number(sId)) ||
                (studentAdm && itemAdm && itemAdm === studentAdm)
              );
            });

            if (found) {
              examResultLookup[examId] = {
                ...found,
                batchId,
                examId,
                examName: batch.examName || batch.ExamName,
                rank: found.calculatedRank,
                Rank: found.calculatedRank,
                totalClassStudents: found.totalClassStudents,
              };
            }
          }
        } catch (bErr) {
          console.warn(
            `Could not load batch results for batch ${batchId}:`,
            bErr,
          );
        }
      });

      await Promise.all(batchPromises);

      // 5. Fallback check: also check getStudentPreviousResults(sId) in case student has records
      try {
        const prevRes = await getStudentPreviousResults(Number(sId));
        const prevList = Array.isArray(
          prevRes?.data || prevRes?.Data || prevRes,
        )
          ? prevRes?.data || prevRes?.Data || prevRes
          : [];

        prevList.forEach((prevItem) => {
          const prevExamId = Number(prevItem.examId ?? prevItem.ExamId);
          const prevExamName = String(
            prevItem.examName ?? prevItem.ExamName ?? "",
          ).trim();

          if (prevExamId && !examResultLookup[prevExamId]) {
            const matchedExam = sessionExams.find(
              (ex) =>
                Number(ex.examId) === prevExamId ||
                (prevExamName &&
                  ex.examName.toLowerCase() === prevExamName.toLowerCase()),
            );
            if (matchedExam) {
              examResultLookup[matchedExam.examId] = {
                ...prevItem,
                examId: matchedExam.examId,
                examName: matchedExam.examName,
              };
            }
          }
        });
      } catch (_) {}

      // 6. Build unified session exam cards: each exam appears EXACTLY ONCE!
      const unifiedCards = sessionExams.map((exam) => {
        const declaredResult = examResultLookup[exam.examId] || null;
        return {
          exam,
          result: declaredResult,
          isDeclared: !!declaredResult,
        };
      });

      setSessionExamCards(unifiedCards);

      const declaredResultsList = unifiedCards
        .filter((c) => c.isDeclared && c.result)
        .map((c) => c.result);
      setStudentResults(declaredResultsList);

      // 7. Select the first declared exam by default, or placeholder if none declared
      const firstDeclared = unifiedCards.find((c) => c.isDeclared && c.result);
      if (firstDeclared) {
        const rId =
          firstDeclared.result.resultId ??
          firstDeclared.result.ResultId ??
          firstDeclared.result.id ??
          firstDeclared.result.Id;
        setActiveExamId(firstDeclared.exam.examId);
        setActiveResultId(rId);
        await loadSingleResultDetails(
          rId,
          firstDeclared.result,
          effectiveStudent,
        );
      } else {
        setActiveExamId(null);
        setActiveResultId(null);
        setSelectedResult({
          isPlaceholder: true,
          studentName: getStudentDisplayName(effectiveStudent),
          admissionNumber: studentAdm || "—",
          rollNumber: getStudentRollNo(effectiveStudent, null),
          className: getSelectedClassName(),
          sectionName: getSelectedSectionName(),
          academicYear: getSelectedAcademicYearName(),
          fatherName:
            effectiveStudent?.fatherName ?? effectiveStudent?.FatherName ?? "—",
          motherName:
            effectiveStudent?.motherName ?? effectiveStudent?.MotherName ?? "—",
          totalMarks: 0,
          obtainedMarks: 0,
          percentage: 0,
          grade: "—",
          rank: "—",
          resultStatus: "Not Declared",
          subjects: [],
        });
      }
    } catch (err) {
      setError(err?.message || "Failed to load student examination results.");
      setSessionExamCards([]);
      setSelectedResult(null);
    } finally {
      setLoadingResult(false);
    }
  };

  // Load single detailed result (ensures subjects array is fully populated)
  async function loadSingleResultDetails(
    rId,
    initialResultData = null,
    studentData = null,
  ) {
    try {
      setLoadingDetails(true);
      let fullResult = initialResultData ? { ...initialResultData } : null;

      const existingSubjects =
        initialResultData?.subjects ??
        initialResultData?.Subjects ??
        initialResultData?.resultDetails ??
        initialResultData?.ResultDetails ??
        [];

      // If subjects not loaded in summary, query getResultDetails
      if (rId && (!fullResult || existingSubjects.length === 0)) {
        try {
          const detailsResp = await getResultDetails(Number(rId));
          const detailedData =
            detailsResp?.data || detailsResp?.Data || detailsResp;
          if (Array.isArray(detailedData)) {
            fullResult = {
              ...(fullResult || initialResultData || {}),
              subjects: detailedData,
              resultDetails: detailedData,
            };
          } else if (detailedData && typeof detailedData === "object") {
            fullResult = {
              ...(fullResult || initialResultData || {}),
              ...detailedData,
              subjects:
                detailedData.subjects ||
                detailedData.Subjects ||
                detailedData.resultDetails ||
                detailedData.ResultDetails ||
                [],
            };
          }
        } catch (err) {
          console.warn("getResultDetails fallback to summary data:", err);
        }
      }

      if (fullResult) {
        // Retain dynamically calculated rank from batch result
        const calcRank =
          initialResultData?.rank ??
          initialResultData?.Rank ??
          fullResult.rank ??
          fullResult.Rank ??
          "—";
        fullResult.rank = calcRank;
        fullResult.Rank = calcRank;
        fullResult.totalClassStudents =
          initialResultData?.totalClassStudents ??
          fullResult.totalClassStudents ??
          null;

        // Guarantee student identifiers
        const effectiveStudent = studentData || selectedStudent;
        if (effectiveStudent) {
          fullResult.studentName =
            fullResult.studentName ||
            fullResult.StudentName ||
            getStudentDisplayName(effectiveStudent);

          fullResult.admissionNumber =
            fullResult.admissionNumber ||
            fullResult.AdmissionNumber ||
            effectiveStudent.admissionNumber ||
            effectiveStudent.AdmissionNumber;

          fullResult.rollNumber =
            fullResult.rollNumber ||
            fullResult.RollNumber ||
            getStudentRollNo(effectiveStudent, fullResult);

          fullResult.fatherName =
            fullResult.fatherName ||
            fullResult.FatherName ||
            effectiveStudent.fatherName ||
            effectiveStudent.FatherName ||
            "—";

          fullResult.motherName =
            fullResult.motherName ||
            fullResult.MotherName ||
            effectiveStudent.motherName ||
            effectiveStudent.MotherName ||
            "—";
        }

        setSelectedResult(fullResult);
      }
    } catch (err) {
      console.error("Failed to load result details:", err);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Exam Tab Selection (When student has multiple exams)
  // =====================================================
  // OPEN SPECIFIC EXAM PDF IN NEW TAB
  // =====================================================
  const handleDirectExamPdfOpen = async (resultRecord, e) => {
    if (e) e.stopPropagation();
    if (!resultRecord) return;

    // Check if server saved PDF URL exists
    const serverPath =
      resultRecord.pdfFilePath ||
      resultRecord.pdfUrl ||
      resultRecord.resultPdfUrl ||
      resultRecord.PdfFilePath;

    if (
      serverPath &&
      typeof serverPath === "string" &&
      serverPath.trim() !== "" &&
      !serverPath.includes("undefined")
    ) {
      const fullUrl = serverPath.startsWith("http")
        ? serverPath
        : `https://localhost:7164${serverPath.startsWith("/") ? "" : "/"}${serverPath}`;
      window.open(fullUrl, "_blank");
      return;
    }

    // Generate PDF on the fly and open in new tab
    try {
      setGeneratingPdf(true);

      // Load complete subjects details if current record only has summary
      let recordWithDetails = { ...resultRecord };
      const rId =
        resultRecord.resultId ??
        resultRecord.ResultId ??
        resultRecord.id ??
        resultRecord.Id;
      const existingSubs =
        resultRecord.subjects ??
        resultRecord.Subjects ??
        resultRecord.resultDetails ??
        resultRecord.ResultDetails ??
        [];

      if (rId && existingSubs.length === 0) {
        try {
          const detailsResp = await getResultDetails(Number(rId));
          const detailedData =
            detailsResp?.data || detailsResp?.Data || detailsResp;
          if (detailedData) {
            recordWithDetails = { ...recordWithDetails, ...detailedData };
          }
        } catch (_) {}
      }

      const studentInfo = {
        name:
          resultRecord.studentName ??
          resultRecord.StudentName ??
          getStudentDisplayName(selectedStudent),
        fatherName:
          resultRecord.fatherName ??
          resultRecord.FatherName ??
          selectedStudent?.fatherName ??
          selectedStudent?.FatherName ??
          "—",
        motherName:
          resultRecord.motherName ??
          resultRecord.MotherName ??
          selectedStudent?.motherName ??
          selectedStudent?.MotherName ??
          "—",
        rollNumber:
          resultRecord.rollNumber ??
          resultRecord.RollNumber ??
          getStudentRollNo(selectedStudent, resultRecord),
        admissionNumber:
          resultRecord.admissionNumber ??
          resultRecord.AdmissionNumber ??
          selectedStudent?.admissionNumber ??
          "—",
        photo:
          selectedStudent?.photo ||
          selectedStudent?.Photo ||
          resultRecord.photo ||
          "",
        className:
          resultRecord.className ??
          resultRecord.ClassName ??
          getSelectedClassName(),
        sectionName:
          resultRecord.sectionName ??
          resultRecord.SectionName ??
          getSelectedSectionName(),
        academicYear:
          resultRecord.academicYear ??
          resultRecord.AcademicYear ??
          getSelectedAcademicYearName(),
      };

      const subjectsList = (
        recordWithDetails.subjects ??
        recordWithDetails.Subjects ??
        recordWithDetails.resultDetails ??
        recordWithDetails.ResultDetails ??
        []
      ).map((s) => ({
        subjectName: s.subjectName || s.SubjectName || s.name || "Subject",
        maxMarks: Number(s.maxMarks ?? s.MaxMarks ?? 100),
        obtainedMarks: Number(s.obtainedMarks ?? s.ObtainedMarks ?? 0),
        grade: s.grade || s.Grade || "-",
        remarks: s.remarks || s.Remarks || "",
      }));

      const doc = await generateMarksheetPdf({
        student: studentInfo,
        examName:
          resultRecord.examName ??
          resultRecord.ExamName ??
          "Examination Result",
        academicYear: studentInfo.academicYear,
        className: studentInfo.className,
        sectionName: studentInfo.sectionName,
        subjects: subjectsList,
        totalMaxMarks:
          recordWithDetails.totalMarks ?? recordWithDetails.TotalMarks ?? 0,
        totalObtainedMarks:
          recordWithDetails.obtainedMarks ??
          recordWithDetails.ObtainedMarks ??
          0,
        percentage:
          recordWithDetails.percentage ?? recordWithDetails.Percentage ?? 0,
        grade: recordWithDetails.grade ?? recordWithDetails.Grade ?? "-",
        rank: recordWithDetails.rank ?? recordWithDetails.Rank ?? "-",
        resultStatus:
          recordWithDetails.resultStatus ??
          recordWithDetails.ResultStatus ??
          "Pass",
      });

      if (doc?.pdfUrl) {
        window.open(doc.pdfUrl, "_blank");
      } else if (doc?.doc) {
        const blobUrl = doc.doc.output("bloburl");
        window.open(blobUrl, "_blank");
      }
    } catch (err) {
      console.error("Direct exam PDF error:", err);
      alert("Could not generate marksheet PDF: " + (err?.message || "Error"));
    } finally {
      setGeneratingPdf(false);
    }
  };

  const handleExamSelect = async (examRecord) => {
    const rId =
      examRecord.resultId ??
      examRecord.ResultId ??
      examRecord.id ??
      examRecord.Id;

    setActiveResultId(rId);
    setError("");
    await loadSingleResultDetails(rId, examRecord, selectedStudent);
  };

  // Card click handler: activates this exam and smoothly scrolls down to subject marks detail (PDF is opened via Download Result button)
  const handleCardClick = async (card) => {
    if (!card.isDeclared || !card.result) {
      alert(
        `Examination result for "${card.exam.examName}" has not been created or declared yet for this student.`,
      );
      return;
    }

    setActiveExamId(card.exam.examId);
    const rId =
      card.result.resultId ??
      card.result.ResultId ??
      card.result.id ??
      card.result.Id;
    setActiveResultId(rId);

    // 1. Load only this exam's subject details
    await loadSingleResultDetails(rId, card.result, selectedStudent);

    // 2. Smoothly scroll down to subject marks detail
    setTimeout(() => {
      const section = document.getElementById("subject-breakdown-section");
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // =====================================================
  // DIRECT SEARCH BY RESULT ID (SECONDARY / MANUAL SEARCH)
  // =====================================================
  const handleManualSearch = async (e) => {
    e.preventDefault();
    setError("");
    setSelectedResult(null);
    setStudentResults([]);

    if (!manualResultId.trim()) {
      setError("Result ID is required.");
      return;
    }

    const id = Number(manualResultId);
    if (!Number.isInteger(id) || id <= 0) {
      setError("Please enter a valid numeric Result ID.");
      return;
    }

    fetchDirectResultDetails(id);
  };

  async function fetchDirectResultDetails(id) {
    try {
      setLoadingResult(true);
      setError("");

      const response = await getResultDetails(id);
      const data = response?.data || response?.Data || response;

      if (!data) {
        setError(`Result details not found for ID #${id}.`);
        return;
      }

      setSelectedResult(data);
      setActiveResultId(id);
      setStudentResults([data]);
    } catch (err) {
      setError(err.message || "Failed to load result details.");
    } finally {
      setLoadingResult(false);
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
    setSelectedStudentId("");
    setSelectedStudent(null);
    setClasses([]);
    setSections([]);
    setStudents([]);
    setStudentResults([]);
    setSelectedResult(null);
    setActiveResultId(null);
    setManualResultId("");
    setError("");
  };

  // =====================================================
  // DOWNLOAD MARKSHEET PDF
  // =====================================================
  const handleDownloadMarksheetPdf = async () => {
    if (!selectedResult) return;
    try {
      setGeneratingPdf(true);
      const subjectsList =
        selectedResult.subjects ??
        selectedResult.Subjects ??
        selectedResult.resultDetails ??
        selectedResult.ResultDetails ??
        [];

      const studentInfo = {
        name:
          selectedResult.studentName ??
          selectedResult.StudentName ??
          getStudentDisplayName(selectedStudent),
        admissionNumber:
          selectedResult.admissionNumber ??
          selectedResult.AdmissionNumber ??
          selectedStudent?.admissionNumber ??
          "-",
        rollNumber:
          selectedResult.rollNumber ??
          selectedResult.RollNumber ??
          getStudentRollNo(selectedStudent, selectedResult),
        className:
          selectedResult.className ??
          selectedResult.ClassName ??
          getSelectedClassName(),
        sectionName:
          selectedResult.sectionName ??
          selectedResult.SectionName ??
          getSelectedSectionName(),
        academicYear:
          selectedResult.academicYear ??
          selectedResult.AcademicYear ??
          getSelectedAcademicYearName(),
      };

      const doc = await generateMarksheetPdf({
        student: studentInfo,
        examName:
          selectedResult.examName ??
          selectedResult.ExamName ??
          "Examination Result",
        academicYear:
          selectedResult.academicYear ??
          selectedResult.AcademicYear ??
          getSelectedAcademicYearName(),
        className:
          selectedResult.className ??
          selectedResult.ClassName ??
          getSelectedClassName(),
        sectionName:
          selectedResult.sectionName ??
          selectedResult.SectionName ??
          getSelectedSectionName(),
        subjects: subjectsList,
        totalMaxMarks:
          selectedResult.totalMarks ?? selectedResult.TotalMarks ?? 0,
        totalObtainedMarks:
          selectedResult.obtainedMarks ?? selectedResult.ObtainedMarks ?? 0,
        percentage: selectedResult.percentage ?? selectedResult.Percentage ?? 0,
        grade: selectedResult.grade ?? selectedResult.Grade ?? "-",
        rank: selectedResult.rank ?? selectedResult.Rank ?? "-",
        resultStatus:
          selectedResult.resultStatus ?? selectedResult.ResultStatus ?? "Pass",
      });

      const safeName = (studentInfo.name || "Student").replace(/\s+/g, "_");
      const safeExam = (
        selectedResult.examName ??
        selectedResult.ExamName ??
        "Result"
      ).replace(/\s+/g, "_");

      if (doc?.pdfUrl) {
        window.open(doc.pdfUrl, "_blank");
      } else if (doc?.doc) {
        const blobUrl = doc.doc.output("bloburl");
        window.open(blobUrl, "_blank");
      } else if (typeof doc?.save === "function") {
        try {
          const blobUrl = doc.output("bloburl");
          window.open(blobUrl, "_blank");
        } catch (_) {
          doc.save(`Marksheet_${safeName}_${safeExam}.pdf`);
        }
      }
    } catch (err) {
      console.error("Failed to generate marksheet PDF:", err);
      alert(
        "Could not generate marksheet PDF: " +
          (err?.message || "An unexpected error occurred."),
      );
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Compute Subject Totals for Table Footer
  const subjectsData = useMemo(() => {
    if (!selectedResult) return [];
    return (
      selectedResult.subjects ??
      selectedResult.Subjects ??
      selectedResult.resultDetails ??
      selectedResult.ResultDetails ??
      []
    );
  }, [selectedResult]);

  const subjectTotals = useMemo(() => {
    let totalMax = 0;
    let totalObt = 0;
    subjectsData.forEach((s) => {
      totalMax += Number(s.maxMarks ?? s.MaxMarks ?? 0);
      totalObt += Number(s.obtainedMarks ?? s.ObtainedMarks ?? 0);
    });
    return {
      totalMax,
      totalObt,
      percentage:
        totalMax > 0 ? ((totalObt / totalMax) * 100).toFixed(2) : "0.00",
    };
  }, [subjectsData]);

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="get-result-details-container">
      <div className="get-result-details-card">
        {/* =================================================
            HEADER
            ================================================= */}
        <div className="get-result-details-header">
          <div className="header-text">
            <h2>Student Result Details</h2>
            <p>
              Select academic parameters to view comprehensive student
              examination results and scorecards.
            </p>
          </div>
        </div>

        {/* FEEDBACK ERROR ALERT */}
        {error && <div className="get-result-details-error">{error}</div>}

        {/* =================================================
            5-LEVEL CASCADING FILTER SECTION
            Academic Year -> Department -> Class -> Section -> Student
            ================================================= */}
        <div className="get-result-details-filters">
          <div className="filter-section-header">
            <div className="filter-section-title">
              <span>Filter Academic Hierarchy</span>
              <small>
                Follow the 5-step cascade to instantly open the student result
              </small>
            </div>

            <button
              type="button"
              className="reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset all filters"
            >
              ↺ Reset Filters
            </button>
          </div>

          <div className="get-result-details-grid">
            {/* 1. ACADEMIC YEAR */}
            <div className="filter-col">
              <label htmlFor="res-det-academic-year">
                1. Academic Year <span>*</span>
              </label>
              <select
                id="res-det-academic-year"
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
              <label htmlFor="res-det-department">
                2. Department <span>*</span>
              </label>
              <select
                id="res-det-department"
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
              <label htmlFor="res-det-class">
                3. Class <span>*</span>
              </label>
              <select
                id="res-det-class"
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
              <label htmlFor="res-det-section">
                4. Section <span>*</span>
              </label>
              <select
                id="res-det-section"
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
              <label htmlFor="res-det-student">
                5. Student <span>*</span>
              </label>
              <select
                id="res-det-student"
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
                        : "-- Select Student to View Result --"}
                </option>
                {students.map((item) => {
                  const sId = item.id ?? item.Id;
                  const name = getStudentDisplayName(item);
                  const adm =
                    item.admissionNumber ??
                    item.AdmissionNumber ??
                    item.code ??
                    "";
                  const roll = getStudentRollNo(item);

                  const rollText = roll && roll !== "—" ? roll : "-";
                  const admText = adm ? adm : "-";

                  return (
                    <option key={sId} value={sId}>
                      {name} - Roll No: {rollText} - Adm No: {admText}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>

        {/* =================================================
            CONTENT STATE: PLACEHOLDER, LOADING, OR RESULT
            ================================================= */}
        {!selectedResult && !loadingResult && (
          <div className="get-result-details-placeholder">
            <div className="placeholder-icon">📋</div>
            <h3>
              {selectedStudentId
                ? "No Result Available"
                : "Select Parameters to Open Result Detail"}
            </h3>
            <p>
              {selectedStudentId
                ? "No examination records exist for this student in the selected academic year. You can upload results from the Result Upload section."
                : "Choose Academic Year, Department, Class, Section, and Student to view complete result breakdown and scorecards."}
            </p>
            {selectedStudentId && (
              <button
                type="button"
                className="upload-redirect-btn"
                onClick={() => navigate("/student-result/upload")}
              >
                Go to Upload Result
              </button>
            )}
          </div>
        )}

        {loadingResult && (
          <div className="get-result-details-loading">
            <div className="spinner"></div>
            <span>Loading complete student result scorecard...</span>
          </div>
        )}

        {/* =================================================
            STUDENT RESULT DETAILS OUTPUT CARD
            ================================================= */}
        {selectedResult && (
          <div className="get-result-details-output" id="printable-result-card">
            {/* STUDENT IDENTITY BANNER */}
            <div className="result-student-banner">
              <div className="banner-left">
                <div className="banner-avatar">
                  {(selectedResult.studentName ??
                    selectedResult.StudentName ??
                    getStudentDisplayName(selectedStudent) ??
                    "S")[0].toUpperCase()}
                </div>
                <div className="banner-details">
                  <h3>
                    {selectedResult.studentName ??
                      selectedResult.StudentName ??
                      getStudentDisplayName(selectedStudent)}
                  </h3>
                  <div className="banner-chips">
                    <span>
                      <strong>Admission No:</strong>{" "}
                      {selectedResult.admissionNumber ??
                        selectedResult.AdmissionNumber ??
                        selectedStudent?.admissionNumber ??
                        "—"}
                    </span>
                    <span>
                      <strong>Roll No:</strong>{" "}
                      {selectedResult.rollNumber ??
                        selectedResult.RollNumber ??
                        getStudentRollNo(selectedStudent, selectedResult)}
                    </span>
                    <span>
                      <strong>Class & Section:</strong>{" "}
                      {selectedResult.className ??
                        selectedResult.ClassName ??
                        getSelectedClassName()}{" "}
                      -{" "}
                      {selectedResult.sectionName ??
                        selectedResult.SectionName ??
                        getSelectedSectionName()}
                    </span>
                    <span>
                      <strong>Father Name:</strong>{" "}
                      {selectedResult.fatherName ??
                        selectedResult.FatherName ??
                        selectedStudent?.fatherName ??
                        selectedStudent?.FatherName ??
                        "—"}
                    </span>
                    <span>
                      <strong>Mother Name:</strong>{" "}
                      {selectedResult.motherName ??
                        selectedResult.MotherName ??
                        selectedStudent?.motherName ??
                        selectedStudent?.MotherName ??
                        "—"}
                    </span>
                    <span>
                      <strong>Academic Year:</strong>{" "}
                      {selectedResult.academicYear ??
                        selectedResult.AcademicYear ??
                        getSelectedAcademicYearName()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="banner-actions">
                <button
                  type="button"
                  className="print-action-btn"
                  onClick={() => window.print()}
                  title="Print result scorecard"
                >
                  🖨 Print Scorecard
                </button>

                <button
                  type="button"
                  className="download-pdf-btn"
                  onClick={handleDownloadMarksheetPdf}
                  disabled={generatingPdf}
                  title="Generate official marksheet PDF"
                >
                  {generatingPdf ? "Generating..." : "📄 Marksheet PDF"}
                </button>
              </div>
            </div>

            {/* =====================================================
            EXAMINATION RESULT PDF CARDS GALLERY (IN A ROW)
            Cards show prominent PDF logo with Exam Name detail below.
            Clicking anywhere on each card opens the related PDF in a new tab.
            ===================================================== */}
            <div className="exam-pdf-gallery-section">
              <div className="gallery-header">
                <div className="gallery-title-box">
                  <h4 className="gallery-title">
                    📄 Session Examinations & Result Marksheets (
                    {getSelectedAcademicYearName()})
                  </h4>
                  <p className="gallery-subtitle">
                    Select an exam card to inspect subject marks below and open
                    the official marksheet PDF.
                  </p>
                </div>
                <div className="gallery-stats-chip">
                  <span>
                    {sessionExamCards.filter((c) => c.isDeclared).length} /{" "}
                    {sessionExamCards.length} Exams Declared
                  </span>
                </div>
              </div>

              <div className="exam-pdf-cards-row">
                {sessionExamCards.map((card) => {
                  const { exam, result, isDeclared } = card;
                  const examId = exam.examId;
                  const examName = exam.examName;
                  const isSelected = String(examId) === String(activeExamId);

                  if (isDeclared && result) {
                    const pct = formatPercentage(
                      result.percentage ?? result.Percentage,
                    );
                    const grade = result.grade ?? result.Grade ?? "—";
                    const obt =
                      result.obtainedMarks ?? result.ObtainedMarks ?? 0;
                    const total = result.totalMarks ?? result.TotalMarks ?? 100;
                    const status =
                      result.resultStatus ?? result.ResultStatus ?? "Pass";

                    return (
                      <div
                        key={examId}
                        className={`exam-pdf-card declared-card ${isSelected ? "selected-card" : ""}`}
                        onClick={() => handleCardClick(card)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleCardClick(card);
                          }
                        }}
                        title={`Click card to view ${examName} subject marks below`}
                      >
                        <div className="card-top-bar">
                          <span
                            className={`status-badge status-${String(status).toLowerCase()}`}
                          >
                            {status}
                          </span>
                          {result.rank && (
                            <span className="rank-badge-pill">
                              Rank #{result.rank}
                            </span>
                          )}
                          {isSelected && (
                            <span className="active-badge">Active View</span>
                          )}
                        </div>

                        {/* PROMINENT PDF LOGO */}
                        <div className="card-pdf-icon-wrapper">
                          <div className="pdf-logo-box">
                            <svg
                              className="pdf-svg-icon"
                              viewBox="0 0 40 48"
                              width="46"
                              height="54"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M4 2C2.89543 2 2 2.89543 2 4V44C2 45.1046 2.89543 46 4 46H36C37.1046 46 38 45.1046 38 44V14L26 2H4Z"
                                fill="#DC2626"
                              />
                              <path d="M26 2V14H38L26 2Z" fill="#FCA5A5" />
                              <rect
                                x="6"
                                y="24"
                                width="28"
                                height="15"
                                rx="3"
                                fill="#991B1B"
                              />
                              <text
                                x="20"
                                y="35"
                                fill="#FFFFFF"
                                fontSize="9.5"
                                fontWeight="800"
                                textAnchor="middle"
                                fontFamily="Arial, sans-serif"
                                letterSpacing="0.5"
                              >
                                PDF
                              </text>
                            </svg>
                          </div>
                        </div>

                        {/* EXAM NAME DETAIL BELOW THE PDF LOGO */}
                        <div className="card-exam-details">
                          <h4 className="card-exam-name">{examName}</h4>
                          <div className="card-exam-metrics">
                            <div className="metric-item">
                              <span className="metric-label">Score</span>
                              <span className="metric-value">
                                <strong>{obt}</strong> / {total}
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">Percentage</span>
                              <span className="metric-value pct-highlight">
                                {pct}
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">Grade</span>
                              <span className="metric-value grade-highlight">
                                {grade}
                              </span>
                            </div>
                            <div className="metric-item">
                              <span className="metric-label">Class Rank</span>
                              <span className="metric-value rank-highlight">
                                {result.rank ? `#${result.rank}` : "—"}
                              </span>
                            </div>
                          </div>

                          {/* DOWNLOAD RESULT BUTTON (OPENS PDF IN NEW TAB) */}
                          <button
                            type="button"
                            className="card-download-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDirectExamPdfOpen(result, e);
                            }}
                            title={`Download official ${examName} marksheet PDF in a new tab`}
                          >
                            📥 Download Result
                          </button>

                          <div className="card-footer-hint">
                            <span>👇 Click card to view subject breakdown</span>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Undeclared / Pending Exam Card
                  return (
                    <div
                      key={examId}
                      className="exam-pdf-card not-declared-card"
                      onClick={() =>
                        alert(
                          `Examination result for "${examName}" has not been created or declared yet for this student.`,
                        )
                      }
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          alert(
                            `Examination result for "${examName}" has not been created or declared yet for this student.`,
                          );
                        }
                      }}
                      title={`${examName} result has not been created or declared yet.`}
                    >
                      <div className="card-top-bar">
                        <span className="status-badge status-pending">
                          Pending
                        </span>
                      </div>

                      {/* MUTED PDF LOGO */}
                      <div className="card-pdf-icon-wrapper muted">
                        <div className="pdf-logo-box muted">
                          <svg
                            className="pdf-svg-icon"
                            viewBox="0 0 40 48"
                            width="46"
                            height="54"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4 2C2.89543 2 2 2.89543 2 4V44C2 45.1046 2.89543 46 4 46H36C37.1046 46 38 45.1046 38 44V14L26 2H4Z"
                              fill="#94A3B8"
                            />
                            <path d="M26 2V14H38L26 2Z" fill="#CBD5E1" />
                            <rect
                              x="6"
                              y="24"
                              width="28"
                              height="15"
                              rx="3"
                              fill="#64748B"
                            />
                            <text
                              x="20"
                              y="35"
                              fill="#FFFFFF"
                              fontSize="9.5"
                              fontWeight="800"
                              textAnchor="middle"
                              fontFamily="Arial, sans-serif"
                              letterSpacing="0.5"
                            >
                              PDF
                            </text>
                          </svg>
                        </div>
                      </div>

                      {/* EXAM NAME DETAIL BELOW THE PDF LOGO */}
                      <div className="card-exam-details">
                        <h4 className="card-exam-name">{examName}</h4>
                        <div className="card-not-declared-pill">
                          ⚠️ Result not declared
                        </div>
                        <p className="card-not-declared-subtext">
                          Exam result has not been created yet
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {selectedResult?.isPlaceholder ? (
              <div className="placeholder-no-exams-box">
                <div className="placeholder-icon">📝</div>
                <h4>No Examination Results Declared Yet</h4>
                <p>
                  None of the session examinations have been created or declared
                  for{" "}
                  <strong>
                    {selectedResult.studentName ||
                      getStudentDisplayName(selectedStudent)}
                  </strong>{" "}
                  in academic year {getSelectedAcademicYearName()}.
                </p>
                <button
                  type="button"
                  className="upload-redirect-btn"
                  onClick={() => navigate("/student-result/upload")}
                >
                  Upload Result for Student ↗
                </button>
              </div>
            ) : (
              <>
                {/* PERFORMANCE SUMMARY CARDS */}
                <div className="get-result-details-summary">
                  <div className="summary-card">
                    <span>Total Marks</span>
                    <strong>
                      {selectedResult.totalMarks ??
                        selectedResult.TotalMarks ??
                        subjectTotals.totalMax}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Obtained Marks</span>
                    <strong>
                      {selectedResult.obtainedMarks ??
                        selectedResult.ObtainedMarks ??
                        subjectTotals.totalObt}
                    </strong>
                  </div>

                  <div className="summary-card highlight">
                    <span>Percentage</span>
                    <strong>
                      {formatPercentage(
                        selectedResult.percentage ??
                          selectedResult.Percentage ??
                          subjectTotals.percentage,
                      )}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Grade</span>
                    <strong className="grade-highlight">
                      {selectedResult.grade ?? selectedResult.Grade ?? "—"}
                    </strong>
                  </div>

                  <div className="summary-card">
                    <span>Class Rank</span>
                    <strong className="rank-highlight">
                      {selectedResult.rank && selectedResult.rank !== "—"
                        ? `#${selectedResult.rank}`
                        : "—"}
                    </strong>
                    {selectedResult.totalClassStudents > 1 && (
                      <small style={{ fontSize: "11px", color: "#64748b" }}>
                        in Section ({selectedResult.totalClassStudents}{" "}
                        Students)
                      </small>
                    )}
                  </div>

                  <div className="summary-card">
                    <span>Result Status</span>
                    <div>
                      <span
                        className={`status-pill ${
                          String(
                            selectedResult.resultStatus ??
                              selectedResult.ResultStatus ??
                              "Pass",
                          ).toLowerCase() === "pass"
                            ? "pass"
                            : "fail"
                        }`}
                      >
                        {selectedResult.resultStatus ??
                          selectedResult.ResultStatus ??
                          "Pass"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* METADATA OVERVIEW */}
                <div className="get-result-details-main">
                  <div>
                    <span>Examination</span>
                    <strong>
                      {selectedResult.examName ??
                        selectedResult.ExamName ??
                        "—"}
                    </strong>
                  </div>

                  <div>
                    <span>Academic Year</span>
                    <strong>
                      {selectedResult.academicYear ??
                        selectedResult.AcademicYear ??
                        getSelectedAcademicYearName()}
                    </strong>
                  </div>

                  <div>
                    <span>Class</span>
                    <strong>
                      {selectedResult.className ??
                        selectedResult.ClassName ??
                        getSelectedClassName()}
                    </strong>
                  </div>

                  <div>
                    <span>Section</span>
                    <strong>
                      {selectedResult.sectionName ??
                        selectedResult.SectionName ??
                        getSelectedSectionName()}
                    </strong>
                  </div>

                  <div>
                    <span>Published Status</span>
                    <strong>
                      {(selectedResult.isPublished ??
                      selectedResult.IsPublished ??
                      true) ? (
                        <span className="text-success">Published ✓</span>
                      ) : (
                        <span className="text-warning">Pending / Draft</span>
                      )}
                    </strong>
                  </div>
                </div>

                {/* SUBJECT BREAKDOWN TABLE */}
                <div
                  className="get-result-details-subjects"
                  id="subject-breakdown-section"
                >
                  <div className="subjects-table-header">
                    <h3>
                      Subject Breakdown & Marks:{" "}
                      <span className="active-exam-title">
                        {selectedResult.examName ??
                          selectedResult.ExamName ??
                          "Selected Examination"}
                      </span>
                    </h3>
                    <span className="badge-count">
                      {subjectsData.length} Subjects
                    </span>
                  </div>

                  <div className="get-result-details-table">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: "50px" }}>#</th>
                          <th>Subject</th>
                          <th style={{ textAlign: "right", width: "130px" }}>
                            Maximum Marks
                          </th>
                          <th style={{ textAlign: "right", width: "140px" }}>
                            Obtained Marks
                          </th>
                          <th style={{ textAlign: "center", width: "100px" }}>
                            Grade
                          </th>
                          <th>Remarks</th>
                        </tr>
                      </thead>

                      <tbody>
                        {subjectsData.length === 0 ? (
                          <tr>
                            <td
                              colSpan="6"
                              style={{
                                textAlign: "center",
                                padding: "24px",
                                color: "#888",
                              }}
                            >
                              {loadingDetails
                                ? "Loading subject marks..."
                                : "No subject breakdown available for this examination."}
                            </td>
                          </tr>
                        ) : (
                          subjectsData.map((item, index) => {
                            const max = Number(
                              item.maxMarks ?? item.MaxMarks ?? 0,
                            );
                            const obt = Number(
                              item.obtainedMarks ?? item.ObtainedMarks ?? 0,
                            );
                            const grade = item.grade ?? item.Grade ?? "—";
                            const remarks = item.remarks ?? item.Remarks ?? "—";

                            return (
                              <tr
                                key={
                                  item.id ??
                                  item.Id ??
                                  item.subjectId ??
                                  item.SubjectId ??
                                  index
                                }
                              >
                                <td>{index + 1}</td>
                                <td>
                                  <strong>
                                    {item.subjectName ??
                                      item.SubjectName ??
                                      item.name ??
                                      `Subject ${index + 1}`}
                                  </strong>
                                </td>
                                <td style={{ textAlign: "right" }}>{max}</td>
                                <td style={{ textAlign: "right" }}>
                                  <strong>{obt}</strong>
                                </td>
                                <td style={{ textAlign: "center" }}>
                                  <span className="grade-badge">{grade}</span>
                                </td>
                                <td>{remarks}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>

                      {subjectsData.length > 0 && (
                        <tfoot>
                          <tr className="table-totals-row">
                            <td colSpan="2">
                              <strong>Grand Total:</strong>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <strong>{subjectTotals.totalMax}</strong>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <strong>{subjectTotals.totalObt}</strong>
                            </td>
                            <td style={{ textAlign: "center" }}>
                              <strong>
                                {selectedResult.grade ??
                                  selectedResult.Grade ??
                                  "—"}
                              </strong>
                            </td>
                            <td>
                              <strong>
                                {subjectTotals.percentage}% Overall
                              </strong>
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetResultDetails;
