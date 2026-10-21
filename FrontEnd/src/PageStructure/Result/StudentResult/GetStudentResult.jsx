// =====================================================
// GET STUDENT RESULT - MULTI-EXAM MATRIX VIEW
// Shows comprehensive student result matrix across all exams in session
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
  getExamDropdown,
  getAllExams,
} from "../../../Services/resultService";

import { getAllStudentsWithDetails } from "../../../Services/studentService";
import generateMarksheetPdf from "../../../Utils/generateMarksheetPdf";
import { isTeacherRole } from "../../../Utils/auth";
import {
  getMyClassTeacherAssignment,
  getCachedClassTeacherAssignment,
} from "../../../Services/classTeacherService";

import "./GetStudentResult.css";

const GetStudentResult = () => {
  const navigate = useNavigate();

  // =====================================================
  // FILTER STATES
  // =====================================================
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [sectionsForClass, setSectionsForClass] = useState([]);
  const [masterExams, setMasterExams] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [allEnrolledStudents, setAllEnrolledStudents] = useState([]);

  // Selected filters
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState(""); // "" = All Sections

  // =====================================================
  // MATRIX DATA STATE
  // =====================================================
  const [matrixExams, setMatrixExams] = useState([]);
  const [matrixStudents, setMatrixStudents] = useState([]);
  const [resultsLookup, setResultsLookup] = useState({});

  // =====================================================
  // UI & LOADING STATES
  // =====================================================
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [error, setError] = useState("");

  // Search & Filter Tabs
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL"); // "ALL" | "COMPLETE" | "PENDING"

  // Detailed Modal State
  const [detailModal, setDetailModal] = useState({
    isOpen: false,
    student: null,
    exam: null,
    result: null,
  });

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

  // =====================================================
  // 1. INITIAL LOAD (YEARS, DEPTS, EXAMS, BATCHES, SECTIONS, STUDENTS)
  // =====================================================
  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      setError("");

      const [
        yearResult,
        deptResult,
        examResult,
        batchesResult,
        sectionsResult,
        studentsResult,
      ] = await Promise.allSettled([
        getAllAcademicYear(),
        getDepartmentDropdown(),
        getExamDropdown(),
        getAllResultBatches(),
        getAllSection(),
        getAllStudentsWithDetails(),
      ]);

      // 1. Academic Years (sort newest first)
      let rawYears = [];
      if (
        yearResult.status === "fulfilled" &&
        Array.isArray(yearResult.value) &&
        yearResult.value.length > 0
      ) {
        rawYears = yearResult.value;
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
        const defaultYear = String(sortedYears[0].id ?? sortedYears[0].Id);
        setSelectedAcademicYearId(defaultYear);
      }

      // 2. Departments
      if (deptResult.status === "fulfilled" && Array.isArray(deptResult.value)) {
        setDepartments(deptResult.value);
      }

      // 3. Exams
      let examList = [];
      if (examResult.status === "fulfilled" && Array.isArray(examResult.value)) {
        examList = examResult.value;
      }
      if (examList.length === 0) {
        try {
          const allEx = await getAllExams();
          examList = Array.isArray(allEx) ? allEx : [];
        } catch (_) {}
      }
      setMasterExams(examList);

      // 4. Batches
      if (
        batchesResult.status === "fulfilled" &&
        Array.isArray(batchesResult.value)
      ) {
        setAllBatches(batchesResult.value);
      }

      // 5. Sections
      if (
        sectionsResult.status === "fulfilled" &&
        Array.isArray(sectionsResult.value)
      ) {
        setAllSections(sectionsResult.value);
      }

      // 6. Enrolled Students
      if (
        studentsResult.status === "fulfilled" &&
        Array.isArray(studentsResult.value)
      ) {
        setAllEnrolledStudents(studentsResult.value);
      }

      // Check incoming location state or auto-detect Class Teacher assignment
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
        if (targetYear) setSelectedAcademicYearId(String(targetYear));
        if (targetDept) {
          setSelectedDepartmentId(String(targetDept));
          // Load classes for this department
          let classList = [];
          try {
            const data = await getClassDropdown(targetDept);
            if (Array.isArray(data) && data.length > 0) classList = data;
          } catch (_) {}
          if (classList.length === 0) {
            const allClasses = await getAllClass().catch(() => []);
            if (Array.isArray(allClasses)) {
              classList = allClasses
                .filter((c) => String(c.DepartmentId ?? c.departmentId) === String(targetDept))
                .map((c) => ({
                  id: c.Id ?? c.id,
                  text: c.ClassName ?? c.className ?? `Class ${c.Id ?? c.id}`,
                }));
            }
          }
          setClasses(classList);
        }
        if (targetClass) {
          setSelectedClassId(String(targetClass));
          // Load sections for this class
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
          setSectionsForClass(filteredSecs);
        }
        if (targetSec) {
          setSelectedSectionId(String(targetSec));
        }
      }
    } catch (err) {
      setError(err?.message || "Failed to load initial data.");
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // =====================================================
  // 2. FILTER CHANGE HANDLERS
  // =====================================================
  const handleAcademicYearChange = (e) => {
    const yearId = e.target.value;
    setSelectedAcademicYearId(yearId);
    setError("");
  };

  const handleDepartmentChange = async (e) => {
    const deptId = e.target.value;
    setSelectedDepartmentId(deptId);
    setSelectedClassId("");
    setSelectedSectionId("");
    setClasses([]);
    setSectionsForClass([]);
    setMatrixExams([]);
    setMatrixStudents([]);
    setResultsLookup({});
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
    setSectionsForClass([]);
    setMatrixExams([]);
    setMatrixStudents([]);
    setResultsLookup({});
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

      setSectionsForClass(filtered);
    } catch (err) {
      setError(err?.message || "Failed to load sections for class.");
    } finally {
      setLoadingSections(false);
    }
  };

  const handleSectionChange = (e) => {
    setSelectedSectionId(e.target.value);
  };

  // =====================================================
  // 3. MATRIX DATA
  // =====================================================
  const loadMatrixData = async () => {
    try {
      setLoadingMatrix(true);
      setError("");

      // 1. Find batches for this Academic Year and Class (and section if filtered)
      const matchingBatches = allBatches.filter((b) => {
        const yMatch =
          Number(b.academicYearId ?? b.AcademicYearId) ===
          Number(selectedAcademicYearId);
        const cMatch =
          Number(b.classId ?? b.ClassId) === Number(selectedClassId);
        const sMatch =
          !selectedSectionId ||
          Number(b.sectionId ?? b.SectionId) === Number(selectedSectionId);
        return yMatch && cMatch && sMatch;
      });

      // 2. Resolve Exams list for table columns
      // Start with master exams dropdown
      let examsList = masterExams.map((e) => {
        const id = Number(e.id ?? e.Id ?? e.examId ?? e.ExamId);
        const name =
          e.examName || e.ExamName || e.text || e.Text || e.name || `Exam ${id}`;
        return { id, examId: id, examName: name.trim() };
      });

      // Add any exams present in batches that might not be in master dropdown
      matchingBatches.forEach((b) => {
        const bExamId = Number(b.examId ?? b.ExamId);
        const bExamName =
          (b.examName || b.ExamName || `Exam ${bExamId}`).trim();
        if (
          bExamId &&
          !examsList.some((ex) => Number(ex.examId) === bExamId)
        ) {
          examsList.push({
            id: bExamId,
            examId: bExamId,
            examName: bExamName,
          });
        }
      });

      // If still empty, derive unique exams from batches
      if (examsList.length === 0 && matchingBatches.length > 0) {
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
        examsList = Array.from(map.values());
      }

      setMatrixExams(examsList);

      // 3. Fetch batch results for every matching batch
      const lookup = {};
      const studentMapFromBatches = new Map();

      const batchResultsPromises = matchingBatches.map(async (batch) => {
        const batchId = Number(batch.id ?? batch.Id);
        const examId = Number(batch.examId ?? batch.ExamId);
        const secId = Number(batch.sectionId ?? batch.SectionId);

        try {
          const res = await getBatchResults(batchId);
          const data = res?.data || res?.Data || res || [];
          if (Array.isArray(data)) {
            data.forEach((item) => {
              const sId = item.studentId ?? item.StudentId ?? item.id ?? item.Id;
              const adm = String(
                item.admissionNumber ?? item.AdmissionNumber ?? "",
              ).trim();
              const roll = String(
                item.rollNumber ?? item.RollNumber ?? "",
              ).trim();

              const enrichedResult = {
                ...item,
                batchId,
                examId,
                sectionId: secId,
                examName: batch.examName || batch.ExamName,
              };

              if (sId) {
                lookup[`${sId}_${examId}`] = enrichedResult;
              }
              if (adm) {
                lookup[`adm_${adm}_${examId}`] = enrichedResult;
              }

              // Track student profile from batch if not already present
              const studentKey = sId ? String(sId) : `adm_${adm}`;
              if (!studentMapFromBatches.has(studentKey)) {
                studentMapFromBatches.set(studentKey, {
                  id: sId,
                  studentId: sId,
                  admissionNumber: adm,
                  rollNumber: roll,
                  studentName:
                    item.studentName ?? item.StudentName ?? item.name ?? "Student",
                  fatherName: item.fatherName ?? item.FatherName ?? "",
                  motherName: item.motherName ?? item.MotherName ?? "",
                  sectionId: secId,
                });
              }
            });
          }
        } catch (subErr) {
          console.warn(`Could not load results for batch ${batchId}:`, subErr);
        }
      });

      await Promise.all(batchResultsPromises);
      setResultsLookup(lookup);

      // 4. Resolve students belonging to this class & section
      let classStudents = allEnrolledStudents.filter((s) => {
        const sClassId = getSectionClassId(s) ?? s.SchoolClassId ?? s.ClassId;
        const cMatch =
          Number(sClassId) === Number(selectedClassId);
        const sMatch =
          !selectedSectionId ||
          Number(s.SectionId ?? s.sectionId) === Number(selectedSectionId);
        return cMatch && sMatch;
      });

      // If enrolled students list was empty or missing some students from batches, merge
      studentMapFromBatches.forEach((batchStudent, key) => {
        const exists = classStudents.some((s) => {
          const sId = s.id ?? s.Id ?? s.studentId ?? s.StudentId;
          const sAdm = String(s.AdmissionNumber ?? s.admissionNumber ?? "").trim();
          return (
            (batchStudent.id && String(sId) === String(batchStudent.id)) ||
            (batchStudent.admissionNumber &&
              sAdm &&
              sAdm === batchStudent.admissionNumber)
          );
        });

        if (!exists) {
          classStudents.push({
            id: batchStudent.id,
            Id: batchStudent.id,
            studentName: batchStudent.studentName,
            FirstName: batchStudent.studentName,
            AdmissionNumber: batchStudent.admissionNumber,
            RollNumber: batchStudent.rollNumber,
            FatherName: batchStudent.fatherName,
            MotherName: batchStudent.motherName,
            SectionId: batchStudent.sectionId,
          });
        }
      });

      // Sort students by Roll Number or Name
      classStudents.sort((a, b) => {
        const rollA = Number(a.RollNumber ?? a.rollNumber ?? 0);
        const rollB = Number(b.RollNumber ?? b.rollNumber ?? 0);
        if (rollA && rollB && rollA !== rollB) return rollA - rollB;

        const nameA = String(
          a.studentName ?? `${a.FirstName ?? ""} ${a.LastName ?? ""}`,
        ).trim().toLowerCase();
        const nameB = String(
          b.studentName ?? `${b.FirstName ?? ""} ${b.LastName ?? ""}`,
        ).trim().toLowerCase();
        return nameA.localeCompare(nameB);
      });

      setMatrixStudents(classStudents);
    } catch (err) {
      setError(err?.message || "Failed to load result matrix data.");
    } finally {
      setLoadingMatrix(false);
    }
  };

  useEffect(() => {
    if (selectedAcademicYearId && selectedClassId) {
      loadMatrixData();
    } else {
      setMatrixExams([]);
      setMatrixStudents([]);
      setResultsLookup({});
    }
  }, [
    selectedAcademicYearId,
    selectedClassId,
    selectedSectionId,
    allBatches,
    allEnrolledStudents,
    masterExams,
  ]);

  // =====================================================
  // RESET FILTERS
  // =====================================================
    // =====================================================
  // REDIRECT TO GET RESULT DETAIL
  // =====================================================
  const handleStudentClick = (studentItem) => {
    const rawStudent = studentItem.raw || studentItem;
    const sId =
      rawStudent.id ??
      rawStudent.Id ??
      rawStudent.studentId ??
      rawStudent.StudentId;

    const navState = {
      studentId: Number(sId),
      academicYearId: selectedAcademicYearId,
      departmentId: selectedDepartmentId,
      classId: selectedClassId,
      sectionId:
        selectedSectionId ||
        String(rawStudent.SectionId ?? rawStudent.sectionId ?? ""),
      studentData: rawStudent,
    };

    try {
      sessionStorage.setItem(
        "active_result_detail_nav",
        JSON.stringify(navState),
      );
    } catch (_) {}

    navigate("/result-detail/details", { state: navState });
  };

  const handleResetFilters = () => {
    const defaultYear =
      academicYears.length > 0
        ? String(academicYears[0].id ?? academicYears[0].Id)
        : "";
    setSelectedAcademicYearId(defaultYear);
    setSelectedDepartmentId("");
    setSelectedClassId("");
    setSelectedSectionId("");
    setClasses([]);
    setSectionsForClass([]);
    setMatrixExams([]);
    setMatrixStudents([]);
    setResultsLookup({});
    setSearchTerm("");
    setStatusFilter("ALL");
    setError("");
  };

  // =====================================================
  // CONTEXT NAMES (NO RAW IDS)
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
    return item?.text ?? item?.Text ?? item?.className ?? item?.ClassName ?? "-";
  };

  const getSelectedSectionName = (secId = null) => {
    const targetId = secId || selectedSectionId;
    if (!targetId) return "All Sections";
    const item = sectionsForClass.find(
      (s) => String(s.id ?? s.Id) === String(targetId),
    );
    return item ? getSectionText(item) : "All Sections";
  };

  // =====================================================
  // RESULT RESOLUTION HELPER FOR MATRIX CELL
  // =====================================================
  const getStudentExamResult = (student, exam) => {
    const sId = student.id ?? student.Id ?? student.studentId ?? student.StudentId;
    const adm = String(
      student.admissionNumber ?? student.AdmissionNumber ?? "",
    ).trim();
    const eId = exam.examId ?? exam.id;

    let res = null;
    if (sId) {
      res = resultsLookup[`${sId}_${eId}`];
    }
    if (!res && adm) {
      res = resultsLookup[`adm_${adm}_${eId}`];
    }
    return res || null;
  };

  // =====================================================
  // OPEN PDF IN NEW TAB (SERVER STORED OR CLIENT GENERATED)
  // =====================================================
  const handleOpenPdf = async (student, exam, resultData) => {
    if (!resultData) return;

    // 1. Check if backend already provided a saved PDF path or URL
    const serverPath =
      resultData.pdfFilePath ||
      resultData.pdfUrl ||
      resultData.resultPdfUrl ||
      resultData.PdfFilePath;

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

    // 2. Generate on the fly using our multi-mode PDF generator and open in a new tab
    try {
      const sName =
        student.studentName ||
        `${student.FirstName ?? ""} ${student.LastName ?? ""}`.trim() ||
        resultData.studentName ||
        "Student";

      const meta = {
        academicYearName: getSelectedAcademicYearName(),
        departmentName: getSelectedDepartmentName(),
        className: getSelectedClassName(),
        sectionName:
          getSelectedSectionName(student.SectionId ?? student.sectionId) ||
          "Section",
        examName: exam.examName || "Examination",
      };

      const studentPayload = {
        id: student.id ?? student.Id ?? resultData.studentId,
        studentName: sName,
        photo:
          student.photo ||
          student.Photo ||
          student.photoUrl ||
          student.PhotoUrl ||
          student.UserPhoto ||
          resultData.photo ||
          resultData.Photo ||
          "",
        fatherName:
          student.FatherName ||
          student.fatherName ||
          resultData.fatherName ||
          "",
        motherName:
          student.MotherName ||
          student.motherName ||
          resultData.motherName ||
          "",
        rollNumber:
          student.RollNumber ||
          student.rollNumber ||
          resultData.rollNumber ||
          "",
        admissionNumber:
          student.AdmissionNumber ||
          student.admissionNumber ||
          resultData.admissionNumber ||
          "",
        departmentName: meta.departmentName,
        className: meta.className,
        sectionName: meta.sectionName,
        academicYearName: meta.academicYearName,
      };

      const subjects = (resultData.subjects || []).map((s) => ({
        subjectName: s.subjectName || s.SubjectName || s.name || "Subject",
        maxMarks: Number(s.maxMarks ?? s.MaxMarks ?? 100),
        obtainedMarks: Number(s.obtainedMarks ?? s.ObtainedMarks ?? 0),
        internalMarks: Number(s.internalMarks ?? s.InternalMarks ?? 0),
        externalMarks: Number(
          s.externalMarks ?? s.ExternalMarks ?? s.obtainedMarks ?? 0,
        ),
        grade: s.grade || s.Grade || "-",
        remarks: s.remarks || s.Remarks || "",
      }));

      const totals = {
        totalMax: Number(resultData.totalMarks ?? resultData.TotalMarks ?? 0),
        totalObtained: Number(
          resultData.obtainedMarks ?? resultData.ObtainedMarks ?? 0,
        ),
        percentage: Number(
          resultData.percentage ?? resultData.Percentage ?? 0,
        ),
        grade: resultData.grade || resultData.Grade || "-",
        resultStatus:
          resultData.resultStatus || resultData.ResultStatus || "Pass",
      };

      const gen = await generateMarksheetPdf({
        student: studentPayload,
        subjects,
        marks: totals,
        totals,
        meta,
        annualMeta: resultData.annualMeta || {},
      });

      if (gen?.pdfUrl) {
        window.open(gen.pdfUrl, "_blank");
      }
    } catch (err) {
      console.error("Error generating marksheet PDF:", err);
      alert(
        "Could not generate marksheet PDF: " +
          (err?.message || "Unknown error"),
      );
    }
  };

  // =====================================================
  // COMPUTED STUDENT ROWS WITH STATUS
  // =====================================================
  const computedStudents = useMemo(() => {
    return matrixStudents.map((student) => {
      const sName =
        student.studentName ||
        `${student.FirstName ?? ""} ${student.LastName ?? ""}`.trim() ||
        "Student";
      const roll = student.RollNumber ?? student.rollNumber ?? "-";
      const adm = student.AdmissionNumber ?? student.admissionNumber ?? "-";
      const father = student.FatherName ?? student.fatherName ?? "-";
      const mother = student.MotherName ?? student.motherName ?? "-";
      const secName = getSelectedSectionName(
        student.SectionId ?? student.sectionId,
      );

      let completedCount = 0;
      const examResults = matrixExams.map((exam) => {
        const res = getStudentExamResult(student, exam);
        const isCompleted = Boolean(
          res &&
            (res.obtainedMarks !== undefined ||
              res.totalMarks > 0 ||
              (res.subjects && res.subjects.length > 0) ||
              res.pdfFilePath),
        );
        if (isCompleted) completedCount++;
        return { exam, result: res, isCompleted };
      });

      const totalExams = matrixExams.length;
      const isAllCompleted = totalExams > 0 && completedCount === totalExams;

      return {
        raw: student,
        studentName: sName,
        rollNumber: roll,
        admissionNumber: adm,
        fatherName: father,
        motherName: mother,
        sectionName: secName,
        examResults,
        completedCount,
        totalExams,
        isAllCompleted,
      };
    });
  }, [matrixStudents, matrixExams, resultsLookup, sectionsForClass]);

  // Filtered by Search Term and Status Tabs
  const filteredStudents = useMemo(() => {
    let list = computedStudents;

    // Status Filter
    if (statusFilter === "COMPLETE") {
      list = list.filter((s) => s.isAllCompleted);
    } else if (statusFilter === "PENDING") {
      list = list.filter((s) => !s.isAllCompleted);
    }

    // Search Term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      list = list.filter((s) => {
        return (
          s.studentName.toLowerCase().includes(term) ||
          s.admissionNumber.toLowerCase().includes(term) ||
          s.rollNumber.toLowerCase().includes(term) ||
          s.fatherName.toLowerCase().includes(term)
        );
      });
    }

    return list;
  }, [computedStudents, statusFilter, searchTerm]);

  // Overall Statistics
  const stats = useMemo(() => {
    const total = computedStudents.length;
    const completed = computedStudents.filter((s) => s.isAllCompleted).length;
    const pending = total - completed;
    return {
      total,
      completed,
      pending,
      totalExams: matrixExams.length,
    };
  }, [computedStudents, matrixExams]);

  const hasSelectedClass = Boolean(
    selectedAcademicYearId && selectedDepartmentId && selectedClassId,
  );

  return (
    <div className="get-student-result-container">
      <div className="get-student-result-card">
        {/* =================================================
            HEADER
            ================================================= */}
        <div className="get-student-result-header">
          <div className="header-text">
            <h2>Student Mark Sheet & Examination Results</h2>
            <p>
              View multi-exam student result matrix for the entire class.
              Click on any exam PDF link to open marksheet in a new tab.
            </p>
          </div>

          <div className="header-actions">
            {hasSelectedClass && (
              <button
                type="button"
                className="student-print-btn"
                onClick={() => window.print()}
                title="Print student result matrix"
              >
                🖨 Print Matrix
              </button>
            )}
          </div>
        </div>

        {/* FEEDBACK ERROR */}
        {error && <div className="get-student-result-error">{error}</div>}

        {/* =================================================
            4-STEP CASCADING FILTER BAR
            ================================================= */}
        <div className="student-filter-section">
          <div className="filter-section-header">
            <div className="filter-section-title">
              <span>Filter Parameters</span>
              <small>
                Select Academic Year, Department, and Class to view the multi-exam result matrix
              </small>
            </div>

            <button
              type="button"
              className="student-reset-filters-btn"
              onClick={handleResetFilters}
              title="Reset all filter selections"
            >
              ↺ Reset Filters
            </button>
          </div>

          <div className="student-filter-grid">
            {/* 1. ACADEMIC YEAR */}
            <div className="student-filter-col">
              <label htmlFor="matrix-academic-year">
                1. Academic Year <span>*</span>
              </label>
              <select
                id="matrix-academic-year"
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
            <div className="student-filter-col">
              <label htmlFor="matrix-department">
                2. Department <span>*</span>
              </label>
              <select
                id="matrix-department"
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
            <div className="student-filter-col">
              <label htmlFor="matrix-class">
                3. Class <span>*</span>
              </label>
              <select
                id="matrix-class"
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

            {/* 4. SECTION (OPTIONAL: ALL SECTIONS BY DEFAULT) */}
            <div className="student-filter-col">
              <label htmlFor="matrix-section">
                4. Section (Optional)
              </label>
              <select
                id="matrix-section"
                value={selectedSectionId}
                onChange={handleSectionChange}
                disabled={!selectedClassId || loadingSections}
              >
                <option value="">-- All Sections --</option>
                {sectionsForClass.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {getSectionText(item)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* =================================================
            CONTENT: PLACEHOLDER OR MATRIX TABLE
            ================================================= */}
        {!hasSelectedClass ? (
          <div className="student-placeholder-box">
            <div className="placeholder-icon">📑</div>
            <h3>Select Academic Year, Department, and Class</h3>
            <p>
              Please choose an <strong>Academic Year</strong>,{" "}
              <strong>Department</strong>, and <strong>Class</strong> above.
              The multi-exam marksheet matrix will automatically load showing
              all students, individual exam PDF links, and completion statuses.
            </p>
          </div>
        ) : loadingMatrix ? (
          <div className="student-loading-state">
            <div className="spinner"></div>
            <span>Loading examination result matrix for {getSelectedClassName()}...</span>
          </div>
        ) : (
          <div className="matrix-content-area">
            {/* ACTIVE CONTEXT & SUMMARY STATS BAR */}
            <div className="matrix-stats-bar">
              <div className="stats-context-info">
                <span className="stats-tag">
                  {getSelectedAcademicYearName()}
                </span>
                <span className="stats-tag">
                  {getSelectedDepartmentName()}
                </span>
                <span className="stats-tag highlight">
                  {getSelectedClassName()}
                </span>
                <span className="stats-tag">
                  {getSelectedSectionName()}
                </span>
              </div>

              <div className="stats-metrics-group">
                <div className="metric-pill">
                  <span>Total Students:</span>
                  <strong>{stats.total}</strong>
                </div>
                <div className="metric-pill">
                  <span>Exams in Session:</span>
                  <strong>{stats.totalExams}</strong>
                </div>
                <div className="metric-pill complete">
                  <span>All Completed:</span>
                  <strong>{stats.completed}</strong>
                </div>
                <div className="metric-pill pending">
                  <span>Pending Exams:</span>
                  <strong>{stats.pending}</strong>
                </div>
              </div>
            </div>

            {/* CONTROLS BAR: SEARCH & STATUS FILTER TABS */}
            <div className="matrix-controls-bar">
              <div className="matrix-filter-tabs">
                <button
                  type="button"
                  className={`tab-btn ${statusFilter === "ALL" ? "active" : ""}`}
                  onClick={() => setStatusFilter("ALL")}
                >
                  All Students ({stats.total})
                </button>
                <button
                  type="button"
                  className={`tab-btn complete ${statusFilter === "COMPLETE" ? "active" : ""}`}
                  onClick={() => setStatusFilter("COMPLETE")}
                >
                  ✓ Complete ({stats.completed})
                </button>
                <button
                  type="button"
                  className={`tab-btn pending ${statusFilter === "PENDING" ? "active" : ""}`}
                  onClick={() => setStatusFilter("PENDING")}
                >
                  ⏳ Pending ({stats.pending})
                </button>
              </div>

              <div className="matrix-search-box">
                <input
                  type="text"
                  placeholder="Search by student name, roll no, adm no, or father name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    type="button"
                    className="clear-search-btn"
                    onClick={() => setSearchTerm("")}
                    title="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* MATRIX TABLE */}
            {matrixExams.length === 0 ? (
              <div className="matrix-empty-warning">
                ⚠️ No examination batches or master exams found for {getSelectedClassName()} in {getSelectedAcademicYearName()}.
                Please create result batches for this class first.
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="matrix-empty-warning">
                {computedStudents.length === 0
                  ? "No students enrolled in this Class & Section."
                  : "No students matching your search or filter."}
              </div>
            ) : (
              <div className="matrix-table-wrapper">
                <table className="matrix-table">
                  <thead>
                    <tr>
                      <th className="th-sn sticky-col col-1">S.N.</th>
                      <th className="th-roll sticky-col col-2">Roll No.</th>
                      <th className="th-adm sticky-col col-3">Adm No.</th>
                      <th className="th-name sticky-col col-4">Student Name</th>
                      <th className="th-father">Father's Name</th>
                      <th className="th-sec">Section</th>

                      {/* DYNAMIC EXAM COLUMNS */}
                      {matrixExams.map((exam) => (
                        <th key={exam.examId ?? exam.id} className="th-exam-col">
                          <div className="exam-th-content">
                            <span className="exam-th-title">{exam.examName}</span>
                            <span className="exam-th-badge">Marksheet PDF</span>
                          </div>
                        </th>
                      ))}

                      {/* RESULT STATUS */}
                      <th className="th-status sticky-col-right">Result Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStudents.map((item, idx) => (
                      <tr key={item.raw.id ?? item.raw.Id ?? idx} className={item.isAllCompleted ? "row-complete" : "row-pending"}>
                        {/* 1. S.N. */}
                        <td className="td-sn sticky-col col-1">{idx + 1}</td>

                        {/* 2. ROLL NUMBER */}
                        <td
                          className="td-roll sticky-col col-2 clickable-cell"
                          onClick={() => handleStudentClick(item)}
                          title="Click to view detailed student result"
                        >
                          <strong>{item.rollNumber}</strong>
                        </td>

                        {/* 3. ADMISSION NUMBER */}
                        <td
                          className="td-adm sticky-col col-3 clickable-cell"
                          onClick={() => handleStudentClick(item)}
                          title="Click to view detailed student result"
                        >
                          <span className="adm-chip">{item.admissionNumber}</span>
                        </td>

                        {/* 4. STUDENT NAME */}
                        <td
                          className="td-name sticky-col col-4 clickable-cell"
                          onClick={() => handleStudentClick(item)}
                          title="Click to view detailed student result"
                        >
                          <div className="student-name-cell">
                            <div className="student-name-row">
                              <span className="s-name">{item.studentName}</span>
                              <span className="student-view-link">View Detail ↗</span>
                            </div>
                            {item.motherName && item.motherName !== "-" && (
                              <small className="s-mother">M: {item.motherName}</small>
                            )}
                          </div>
                        </td>

                        {/* 5. FATHER NAME */}
                        <td className="td-father">{item.fatherName}</td>

                        {/* 6. SECTION */}
                        <td className="td-sec">
                          <span className="sec-badge">{item.sectionName}</span>
                        </td>

                        {/* DYNAMIC EXAM CELLS */}
                        {item.examResults.map(({ exam, result, isCompleted }) => (
                          <td key={exam.examId ?? exam.id} className={`td-exam-cell ${isCompleted ? "has-result" : "is-pending"}`}>
                            {isCompleted && result ? (
                              <div className="exam-cell-content">
                                {/* CLICKABLE PDF BUTTON / LINK */}
                                <button
                                  type="button"
                                  className="exam-pdf-btn"
                                  onClick={() => handleOpenPdf(item.raw, exam, result)}
                                  title={`Open ${exam.examName} Marksheet PDF in a new tab`}
                                >
                                  📄 View PDF
                                </button>

                                {/* MARKS & GRADE CHIP (CLICK TO INSPECT) */}
                                <div
                                  className="exam-score-chip"
                                  onClick={() =>
                                    setDetailModal({
                                      isOpen: true,
                                      student: item,
                                      exam,
                                      result,
                                    })
                                  }
                                  title="Click to view subject-wise breakdown"
                                >
                                  <span className="score-marks">
                                    {result.obtainedMarks ?? result.ObtainedMarks ?? 0} /{" "}
                                    {result.totalMarks ?? result.TotalMarks ?? 0}
                                  </span>
                                  <span className="score-grade">
                                    Grade: {result.grade ?? result.Grade ?? "-"}
                                  </span>
                                </div>
                              </div>
                            ) : (
                              <div className="exam-not-declared-placeholder">
                                <span className="not-declared-badge">Result not declared</span>
                                <small className="not-declared-exam-name">{exam.examName}</small>
                              </div>
                            )}
                          </td>
                        ))}

                        {/* RESULT STATUS */}
                        <td className="td-status sticky-col-right">
                          {item.isAllCompleted ? (
                            <span className="status-badge complete" title="All examinations completed">
                              ✓ Complete
                            </span>
                          ) : (
                            <span
                              className="status-badge pending"
                              title={`${item.completedCount} of ${item.totalExams} examinations completed`}
                            >
                              ⏳ Pending ({item.completedCount}/{item.totalExams})
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* =================================================
            SUBJECT BREAKDOWN MODAL
            ================================================= */}
        {detailModal.isOpen && detailModal.result && (
          <div className="matrix-modal-overlay" onClick={() => setDetailModal({ isOpen: false, student: null, exam: null, result: null })}>
            <div className="matrix-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="matrix-modal-header">
                <div>
                  <span className="modal-tag">SUBJECT-WISE MARKSHEET</span>
                  <h3>{detailModal.student?.studentName}</h3>
                  <small>
                    {detailModal.exam?.examName} • Adm No: {detailModal.student?.admissionNumber} • Roll: {detailModal.student?.rollNumber}
                  </small>
                </div>

                <button
                  type="button"
                  className="modal-close-btn"
                  onClick={() => setDetailModal({ isOpen: false, student: null, exam: null, result: null })}
                >
                  ✕
                </button>
              </div>

              <div className="modal-metrics-strip">
                <div className="m-metric">
                  <span>Total Marks:</span>
                  <strong>{detailModal.result.totalMarks ?? detailModal.result.TotalMarks ?? 0}</strong>
                </div>
                <div className="m-metric">
                  <span>Obtained:</span>
                  <strong>{detailModal.result.obtainedMarks ?? detailModal.result.ObtainedMarks ?? 0}</strong>
                </div>
                <div className="m-metric">
                  <span>Percentage:</span>
                  <strong>{Number(detailModal.result.percentage ?? detailModal.result.Percentage ?? 0).toFixed(2)}%</strong>
                </div>
                <div className="m-metric">
                  <span>Grade:</span>
                  <strong className="highlight">{detailModal.result.grade ?? detailModal.result.Grade ?? "-"}</strong>
                </div>
                <div className="m-metric">
                  <span>Status:</span>
                  <span className={`status-pill ${String(detailModal.result.resultStatus || "").toLowerCase() === "pass" ? "pass" : "fail"}`}>
                    {detailModal.result.resultStatus ?? detailModal.result.ResultStatus ?? "Pass"}
                  </span>
                </div>
              </div>

              <div className="modal-table-container">
                <table className="modal-subjects-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Subject</th>
                      <th>Max Marks</th>
                      <th>Internal</th>
                      <th>External</th>
                      <th>Total</th>
                      <th>Grade</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(detailModal.result.subjects || []).map((subj, sIdx) => (
                      <tr key={sIdx}>
                        <td>{sIdx + 1}</td>
                        <td><strong>{subj.subjectName || subj.SubjectName || "Subject"}</strong></td>
                        <td>{subj.maxMarks ?? subj.MaxMarks ?? 100}</td>
                        <td>{subj.internalMarks ?? subj.InternalMarks ?? "-"}</td>
                        <td>{subj.externalMarks ?? subj.ExternalMarks ?? subj.obtainedMarks ?? 0}</td>
                        <td><strong>{subj.obtainedMarks ?? subj.ObtainedMarks ?? 0}</strong></td>
                        <td><span className="grade-badge">{subj.grade || subj.Grade || "-"}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="matrix-modal-actions">
                <button
                  type="button"
                  className="modal-pdf-btn"
                  onClick={() => handleOpenPdf(detailModal.student.raw, detailModal.exam, detailModal.result)}
                >
                  📄 Open Marksheet PDF in New Tab
                </button>
                <button
                  type="button"
                  className="modal-close-secondary-btn"
                  onClick={() => setDetailModal({ isOpen: false, student: null, exam: null, result: null })}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetStudentResult;
