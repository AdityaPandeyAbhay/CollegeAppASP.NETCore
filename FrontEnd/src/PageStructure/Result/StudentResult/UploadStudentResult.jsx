// =====================================================
// UPLOAD STUDENT RESULT
// =====================================================

import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllAcademicYear,
  getAcademicYearDropdown,
} from "../../../Services/academicYearService";

import { getDepartmentDropdown } from "../../../Services/departmentService";

import { getClassDropdown, getAllClass } from "../../../Services/classService";

import {
  getSectionDropdown,
  getAllSection,
} from "../../../Services/sectionService";

import {
  getAllResultBatches,
  getBatchResults,
  uploadStudentResult,
  getStudentPreviousResults,
  getResultDetails,
} from "../../../Services/resultService";

import {
  getAllStudents,
  getStudentDropdown,
  getStudentById,
  getSavedStudentRollNumber,
} from "../../../Services/studentService";

import {
  getSubjectDropdownByDepartment,
  getSubjectDropdown,
} from "../../../Services/subjectService";

import generateMarksheetPdf, {
  generateCertificateNumber,
  generateResultNumber,
  formatMarksheetDate,
  detectExamMode,
} from "../../../Utils/generateMarksheetPdf";

import "./UploadStudentResult.css";

export const DEFAULT_CO_SCHOLASTIC_LIST = [
  {
    trait: "APPEARANCE & PERSONALITY",
    hy: "A",
    ann: "A",
    attitude: "TO PROGRAMMES",
    hyAtt: "A",
    annAtt: "B+",
    activity: "LITERARY, SCIENTIFIC & CULTURAL",
    hyAct: "A",
    annAct: "A",
  },
  {
    trait: "CLEANLINESS",
    hy: "A",
    ann: "A+",
    attitude: "TO SCHOOL PROPERTY",
    hyAtt: "A",
    annAtt: "A",
    activity: "PUNCTUALITY",
    hyAct: "A",
    annAct: "A",
  },
  {
    trait: "CO-CURRICULAR",
    hy: "A",
    ann: "A",
    attitude: "TO SCHOOLMATES",
    hyAtt: "A",
    annAtt: "A",
    activity: "REGULARITY",
    hyAct: "B+",
    annAct: "A",
  },
  {
    trait: "DISCIPLINE",
    hy: "A",
    ann: "B+",
    attitude: "TO STUDIES",
    hyAtt: "A+",
    annAtt: "A+",
    activity: "SOCIAL SERVICE",
    hyAct: "A",
    annAct: "A+",
  },
  {
    trait: "HOBBY",
    hy: "A",
    ann: "A",
    attitude: "TO TEACHERS",
    hyAtt: "A",
    annAtt: "A",
    activity: "SPORTS & GAMES",
    hyAct: "A",
    annAct: "B+",
  },
];

export const classifyExamType = (examName = "") => {
  const name = (examName || "").toLowerCase().trim();
  if (
    name.includes("annual") ||
    name.includes("anual") ||
    name.includes("final") ||
    name.includes("session end") ||
    name.includes("session-ending") ||
    name.includes("session-end") ||
    name.includes("term 2") ||
    name.includes("term-2") ||
    name.includes("2nd term")
  ) {
    return "annual";
  }
  if (
    name.includes("half") ||
    name.includes("mid term") ||
    name.includes("mid-term") ||
    name.includes("midterm") ||
    name.includes("term 1") ||
    name.includes("term-1") ||
    name.includes("1st term") ||
    name.includes("sem 1") ||
    name.includes("semester 1")
  ) {
    return "halfYearly";
  }
  if (
    name.includes("ut 4") ||
    name.includes("ut-4") ||
    name.includes("ut4") ||
    name.includes("test 4") ||
    name.includes("test-4") ||
    name.includes("test4") ||
    name.includes("unit test 4") ||
    name.includes("unit test - 4") ||
    name.includes("unit test-4") ||
    name.includes("unit test iv") ||
    name.includes("4th unit test") ||
    name.includes("pt 4") ||
    name.includes("pt-4") ||
    name.includes("pt4") ||
    name.includes("periodic test 4")
  ) {
    return "ut4";
  }
  if (
    name.includes("ut 3") ||
    name.includes("ut-3") ||
    name.includes("ut3") ||
    name.includes("test 3") ||
    name.includes("test-3") ||
    name.includes("test3") ||
    name.includes("unit test 3") ||
    name.includes("unit test - 3") ||
    name.includes("unit test-3") ||
    name.includes("unit test iii") ||
    name.includes("3rd unit test") ||
    name.includes("pt 3") ||
    name.includes("pt-3") ||
    name.includes("pt3") ||
    name.includes("periodic test 3")
  ) {
    return "ut3";
  }
  if (
    name.includes("ut 2") ||
    name.includes("ut-2") ||
    name.includes("ut2") ||
    name.includes("test 2") ||
    name.includes("test-2") ||
    name.includes("test2") ||
    name.includes("unit test 2") ||
    name.includes("unit test - 2") ||
    name.includes("unit test-2") ||
    name.includes("unit test ii") ||
    name.includes("2nd unit test") ||
    name.includes("pt 2") ||
    name.includes("pt-2") ||
    name.includes("pt2") ||
    name.includes("periodic test 2")
  ) {
    return "ut2";
  }
  if (
    name.includes("ut 1") ||
    name.includes("ut-1") ||
    name.includes("ut1") ||
    name.includes("test 1") ||
    name.includes("test-1") ||
    name.includes("test1") ||
    name.includes("unit test 1") ||
    name.includes("unit test - 1") ||
    name.includes("unit test-1") ||
    name.includes("unit test i") ||
    name.includes("1st unit test") ||
    name.includes("pt 1") ||
    name.includes("pt-1") ||
    name.includes("pt1") ||
    name.includes("periodic test 1")
  ) {
    return "ut1";
  }
  return "regular";
};

export const getSubjectMark = (marksMap, subject) => {
  if (!marksMap || !subject) return undefined;
  const sId = String(subject.id ?? subject.Id ?? "");
  const sName = String(
    subject.text ??
      subject.Text ??
      subject.name ??
      subject.Name ??
      subject.subjectName ??
      "",
  )
    .trim()
    .toLowerCase();

  if (sId && marksMap[sId] !== undefined) return marksMap[sId];
  if (sName && marksMap[sName] !== undefined) return marksMap[sName];

  for (const key of Object.keys(marksMap)) {
    if (key.length > 2 && (sName.includes(key) || key.includes(sName))) {
      return marksMap[key];
    }
  }
  return undefined;
};

const UploadStudentResult = () => {
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
  const [loadingPreviousMarks, setLoadingPreviousMarks] = useState(false);
  const [autoLoadedInfo, setAutoLoadedInfo] = useState({
    hasLoaded: false,
    count: 0,
  });

  // Cached all result batches for instant filtering
  const [allBatches, setAllBatches] = useState([]);
  // Cached all sections for class-wise filtering
  const [allSections, setAllSections] = useState([]);

  // =====================================================
  // STUDENTS & RESULT STATUS STATE
  // =====================================================
  const [students, setStudents] = useState([]);
  const [uploadedResultsMap, setUploadedResultsMap] = useState(new Map());
  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // UPLOAD VIEW STATE (WHEN A STUDENT IS SELECTED)
  // =====================================================
  const [viewMode, setViewMode] = useState("list"); // "list" | "upload"
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [marks, setMarks] = useState({});
  const [pdfFile, setPdfFile] = useState(null);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [annualMeta, setAnnualMeta] = useState({
    attendanceHY: "",
    attendanceAnn: "",
    remarks: "",
    resultStatus: "",
    coScholastics: DEFAULT_CO_SCHOLASTIC_LIST,
  });

  // =====================================================
  // UI & LOADING STATE
  // =====================================================
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // =====================================================
  // SECTION HELPER FUNCTIONS (CLASS-WISE FILTERING)
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
  // LOAD INITIAL DATA (ACADEMIC YEARS, DEPARTMENTS, ALL BATCHES, ALL SECTIONS)
  // =====================================================
  useEffect(() => {
    loadInitialData();
  }, []);

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

      // 1. Process Academic Years (sorted descending: newest first)
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
      if (sortedYears.length > 0) {
        const recentYearId = String(sortedYears[0].id ?? sortedYears[0].Id);
        setSelectedAcademicYearId(recentYearId);
      }

      // 2. Process Departments
      if (
        deptDataResult.status === "fulfilled" &&
        Array.isArray(deptDataResult.value)
      ) {
        setDepartments(deptDataResult.value);
      } else {
        setDepartments([]);
      }

      // 3. Process Result Batches
      if (
        batchesResult.status === "fulfilled" &&
        Array.isArray(batchesResult.value)
      ) {
        setAllBatches(batchesResult.value);
      } else {
        setAllBatches([]);
      }

      // 4. Process All Sections (for class-wise filtering)
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

  // Academic Year Change
  const handleAcademicYearChange = (e) => {
    const yearId = e.target.value;
    setSelectedAcademicYearId(yearId);
    setSelectedExamId("");
    setSelectedBatchId("");
    setStudents([]);
    setUploadedResultsMap(new Map());
    setViewMode("list");
    setSelectedStudent(null);
    setError("");

    updatePublishedExams(
      yearId,
      selectedClassId,
      selectedSectionId,
      allBatches,
    );
  };

  // Department Change
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
    setStudents([]);
    setUploadedResultsMap(new Map());
    setViewMode("list");
    setSelectedStudent(null);
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

  // Class Change
  const handleClassChange = async (e) => {
    const clsId = e?.target ? e.target.value : e;
    setSelectedClassId(clsId || "");
    setSelectedSectionId("");
    setSelectedExamId("");
    setSelectedBatchId("");
    setSections([]);
    setPublishedExams([]);
    setStudents([]);
    setUploadedResultsMap(new Map());
    setViewMode("list");
    setSelectedStudent(null);
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

      // Filter sections strictly belonging to the selected class
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

  // Section Change
  const handleSectionChange = (e) => {
    const secId = e.target.value;
    setSelectedSectionId(secId);
    setSelectedExamId("");
    setSelectedBatchId("");
    setStudents([]);
    setUploadedResultsMap(new Map());
    setViewMode("list");
    setSelectedStudent(null);
    setError("");

    updatePublishedExams(
      selectedAcademicYearId,
      selectedClassId,
      secId,
      allBatches,
    );
  };

  // Helper: compute published exams matching Year, Class, Section
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

  // Exam Change
  const handleExamChange = async (e) => {
    const examId = e.target.value;
    setSelectedExamId(examId);
    setError("");
    setSuccess("");
    setViewMode("list");
    setSelectedStudent(null);

    if (!examId) {
      setSelectedBatchId("");
      setStudents([]);
      setUploadedResultsMap(new Map());
      return;
    }

    const match = publishedExams.find(
      (item) => String(item.examId) === String(examId),
    );
    const batchId = match?.batchId ? String(match.batchId) : "";
    setSelectedBatchId(batchId);

    if (batchId) {
      await loadStudentsAndResults(
        selectedDepartmentId,
        selectedClassId,
        selectedSectionId,
        batchId,
      );
    }
  };

  // =====================================================
  // LOAD STUDENTS & BATCH RESULT STATUSES
  // =====================================================
  const loadStudentsAndResults = async (deptId, clsId, secId, batchId) => {
    try {
      setLoadingStudents(true);
      setError("");

      const targetExam = publishedExams.find(
        (e) => String(e.batchId) === String(batchId),
      );
      const targetExamId = targetExam?.examId || selectedExamId;
      const targetExamName = targetExam?.examName || getSelectedExamName();

      // Find all batches matching this Academic Year, Class, and Exam
      const matchingBatches = (
        Array.isArray(allBatches) ? allBatches : []
      ).filter((b) => {
        const yMatch =
          String(b.academicYearId ?? b.AcademicYearId) ===
          String(selectedAcademicYearId);
        const cMatch = String(b.classId ?? b.ClassId) === String(clsId);
        const eMatch = String(b.examId ?? b.ExamId) === String(targetExamId);
        return yMatch && cMatch && eMatch;
      });

      const batchIdsToQuery = Array.from(
        new Set(
          [
            Number(batchId),
            ...matchingBatches.map((b) => Number(b.id ?? b.Id)),
          ].filter((id) => id > 0),
        ),
      );

      const [studentsData, ...allBatchResults] = await Promise.all([
        fetchStudentsForClassSection(deptId, clsId, secId),
        ...batchIdsToQuery.map((bId) => getBatchResults(bId).catch(() => [])),
      ]);

      setStudents(Array.isArray(studentsData) ? studentsData : []);

      const map = new Map();
      allBatchResults.flat().forEach((r) => {
        if (!r) return;
        const sId = String(r.studentId ?? r.StudentId);
        if (sId && !map.has(sId)) {
          map.set(sId, {
            ...r,
            examName: r.examName || r.ExamName || targetExamName,
            batchId: r.resultBatchId || r.ResultBatchId || batchId,
          });
        }
      });
      setUploadedResultsMap(map);
    } catch (err) {
      setError(err?.message || "Failed to load students and result statuses.");
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
    } catch (err) {
      console.warn("getAllStudents fallback to dropdown:", err);
    }

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
            fatherName: item.fatherName ?? item.FatherName ?? "",
            motherName: item.motherName ?? item.MotherName ?? "",
            admissionNumber:
              item.admissionNumber ??
              item.AdmissionNumber ??
              item.code ??
              item.Code ??
              "",
            rollNumber: item.rollNumber ?? item.RollNumber ?? "",
          }));
        }
      } catch (err) {
        console.warn("getStudentDropdown failed:", err);
      }
    }

    return list;
  };

  // =====================================================
  // FILTER CLEAR / RESET
  // =====================================================
  const handleClearFilters = () => {
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
    setStudents([]);
    setUploadedResultsMap(new Map());
    setViewMode("list");
    setSelectedStudent(null);
    setSearchTerm("");
    setError("");
    setSuccess("");

    if (defaultYear) {
      updatePublishedExams(defaultYear, "", "", allBatches);
    }
  };

  // =====================================================
  // FETCH STUDENT'S PREVIOUS EXAM MARKS FOR AUTO-FILL
  // Auto-loads UT1, UT2, HY, UT3, UT4 subject marks so users don't have to enter them
  // =====================================================
  const fetchStudentPreviousExamMarks = async (
    studentId,
    currentYearId,
    currentBatchId,
  ) => {
    const resultData = {
      ut1: {},
      ut2: {},
      halfYearly: {},
      ut3: {},
      ut4: {},
    };

    try {
      setLoadingPreviousMarks(true);

      // 1. Fetch all student's previous results
      const prevResp = await getStudentPreviousResults(Number(studentId)).catch(
        () => [],
      );
      const rawList = prevResp?.data || prevResp?.Data || prevResp || [];
      let studentExamRecords = Array.isArray(rawList) ? rawList : [];

      // Filter to current academic year if available
      if (currentYearId) {
        const yearMatches = studentExamRecords.filter((r) => {
          const yId = String(r.academicYearId ?? r.AcademicYearId ?? "");
          return yId === String(currentYearId);
        });
        if (yearMatches.length > 0) {
          studentExamRecords = yearMatches;
        }
      }

      // 2. Also check class batches in allBatches for any results not yet indexed
      if (Array.isArray(allBatches) && allBatches.length > 0) {
        const relatedBatches = allBatches.filter((b) => {
          const yMatch =
            String(b.academicYearId ?? b.AcademicYearId) ===
            String(currentYearId);
          const cMatch =
            String(b.classId ?? b.ClassId) === String(selectedClassId);
          const notSameBatch = String(b.id ?? b.Id) !== String(currentBatchId);
          return yMatch && cMatch && notSameBatch;
        });

        const existingBatchIds = new Set(
          studentExamRecords.map((r) =>
            String(r.resultBatchId ?? r.ResultBatchId ?? r.batchId ?? ""),
          ),
        );

        const missingBatches = relatedBatches.filter(
          (b) => !existingBatchIds.has(String(b.id ?? b.Id)),
        );

        if (missingBatches.length > 0) {
          const batchResultsArrays = await Promise.all(
            missingBatches.map((b) =>
              getBatchResults(Number(b.id ?? b.Id))
                .then((res) => {
                  const arr = res?.data || res?.Data || res || [];
                  return (Array.isArray(arr) ? arr : []).map((item) => ({
                    ...item,
                    examName: b.examName || b.ExamName,
                    resultBatchId: b.id ?? b.Id,
                  }));
                })
                .catch(() => []),
            ),
          );

          batchResultsArrays.flat().forEach((bResult) => {
            const sId = String(bResult.studentId ?? bResult.StudentId);
            if (sId === String(studentId)) {
              studentExamRecords.push(bResult);
            }
          });
        }
      }

      // 3. For each record, if subjects list is missing, fetch full details via getResultDetails
      const enrichedRecords = await Promise.all(
        studentExamRecords.map(async (rec) => {
          let subs =
            rec.subjects ??
            rec.Subjects ??
            rec.resultDetails ??
            rec.ResultDetails ??
            [];

          const rId = rec.resultId ?? rec.ResultId ?? rec.id ?? rec.Id;
          if ((!Array.isArray(subs) || subs.length === 0) && rId) {
            try {
              const det = await getResultDetails(Number(rId));
              const detData = det?.data || det?.Data || det;
              if (detData) {
                subs =
                  detData.subjects ??
                  detData.Subjects ??
                  detData.resultDetails ??
                  detData.ResultDetails ??
                  (Array.isArray(detData) ? detData : []);
              }
            } catch (_) {}
          }

          return {
            ...rec,
            resolvedSubjects: Array.isArray(subs) ? subs : [],
          };
        }),
      );

      let foundMarksCount = 0;

      // 4. Classify and map subject marks
      enrichedRecords.forEach((rec) => {
        const examName = rec.examName || rec.ExamName || "";
        const examType = classifyExamType(examName);
        const subList = rec.resolvedSubjects || [];

        subList.forEach((s) => {
          const sId = String(s.subjectId ?? s.SubjectId ?? s.id ?? s.Id ?? "");
          const sName = String(
            s.subjectName ?? s.SubjectName ?? s.name ?? s.Name ?? "",
          )
            .trim()
            .toLowerCase();
          const obt = parseFloat(s.obtainedMarks ?? s.ObtainedMarks ?? 0) || 0;
          const max = parseFloat(s.maxMarks ?? s.MaxMarks ?? 20) || 20;

          // Scale to 20 for Unit Tests if max was greater than 20
          const scaledTo20 =
            max > 20 ? Math.round((obt / max) * 20 * 10) / 10 : obt;

          const subKey = sId || sName;

          if (examType === "ut1") {
            resultData.ut1[subKey] = scaledTo20;
            if (sName) resultData.ut1[sName] = scaledTo20;
            foundMarksCount++;
          } else if (examType === "ut2") {
            resultData.ut2[subKey] = scaledTo20;
            if (sName) resultData.ut2[sName] = scaledTo20;
            foundMarksCount++;
          } else if (examType === "ut3") {
            resultData.ut3[subKey] = scaledTo20;
            if (sName) resultData.ut3[sName] = scaledTo20;
            foundMarksCount++;
          } else if (examType === "ut4") {
            resultData.ut4[subKey] = scaledTo20;
            if (sName) resultData.ut4[sName] = scaledTo20;
            foundMarksCount++;
          } else if (examType === "halfYearly") {
            const ext = parseFloat(s.externalMarks ?? s.ExternalMarks);
            const intM = parseFloat(s.internalMarks ?? s.InternalMarks);
            const rem = String(s.remarks ?? s.Remarks ?? "");

            const ut1Match = rem.match(/UT-1:s*([d.]+)/i);
            const ut2Match = rem.match(/UT-2:s*([d.]+)/i);
            const avgMatch = rem.match(/Avg:s*([d.]+)/i);
            const hyMatch = rem.match(/HY Exam:s*([d.]+)/i);
            const totMatch = rem.match(/Total:s*([d.]+)/i);

            const hyExamVal = !isNaN(ext)
              ? ext
              : hyMatch
                ? parseFloat(hyMatch[1])
                : Math.max(0, obt - (isNaN(intM) ? 0 : intM));

            const avg1Val = !isNaN(intM)
              ? intM
              : avgMatch
                ? parseFloat(avgMatch[1])
                : "";

            const totalHYVal = obt || (totMatch ? parseFloat(totMatch[1]) : 0);

            const ut1Val = ut1Match ? parseFloat(ut1Match[1]) : "";
            const ut2Val = ut2Match ? parseFloat(ut2Match[1]) : "";

            const hyObj = {
              ut1: ut1Val !== "" ? ut1Val : undefined,
              ut2: ut2Val !== "" ? ut2Val : undefined,
              avg1: avg1Val,
              hyExam: hyExamVal,
              totalHY: totalHYVal,
            };

            resultData.halfYearly[subKey] = hyObj;
            if (sName) resultData.halfYearly[sName] = hyObj;
            foundMarksCount++;
          }
        });
      });

      setAutoLoadedInfo({
        hasLoaded: foundMarksCount > 0,
        count: foundMarksCount,
      });
    } catch (err) {
      console.warn("Could not load previous exam marks for auto-fill:", err);
    } finally {
      setLoadingPreviousMarks(false);
    }

    return resultData;
  };

  // =====================================================
  // START UPLOAD FOR SELECTED STUDENT
  // =====================================================
  const handleStartUpload = async (student) => {
    const sId = String(student.id ?? student.Id);
    if (uploadedResultsMap.has(sId)) {
      const existing = uploadedResultsMap.get(sId);
      const examName = existing?.examName || getSelectedExamName();
      setError(
        `A result has already been created for ${getStudentFullName(student)} in "${examName}". Only one result per student is permitted for this Academic Year, Department, Class, and Exam. Please use Update Result to edit marks.`,
      );
      return;
    }

    setSelectedStudent(student);
    let activeStudent = student;
    const hasFather = student.fatherName || student.FatherName;
    const hasPhoto =
      student.photo ||
      student.Photo ||
      student.photoUrl ||
      student.PhotoUrl ||
      student.UserPhoto;
    if (!hasFather || !hasPhoto) {
      try {
        const full = await getStudentById(sId);
        if (full) {
          activeStudent = {
            ...student,
            ...full,
            fatherName:
              full.FatherName ||
              full.fatherName ||
              student.FatherName ||
              student.fatherName ||
              "",
            motherName:
              full.MotherName ||
              full.motherName ||
              student.MotherName ||
              student.motherName ||
              "",
            photo:
              full.Photo ||
              full.photo ||
              full.PhotoUrl ||
              full.photoUrl ||
              full.UserPhoto ||
              student.Photo ||
              student.photo ||
              student.PhotoUrl ||
              student.photoUrl ||
              "",
          };
        }
      } catch (e) {
        console.warn("Could not fetch full student details:", e);
      }
    }
    if (!activeStudent.photo) {
      activeStudent.photo =
        activeStudent.Photo ||
        activeStudent.PhotoUrl ||
        activeStudent.photoUrl ||
        activeStudent.UserPhoto ||
        "";
    }
    if (!activeStudent.rollNumber) {
      activeStudent.rollNumber =
        activeStudent.RollNumber ||
        activeStudent.RollNo ||
        activeStudent.rollNo ||
        getSavedStudentRollNumber(sId) ||
        getSavedStudentRollNumber(activeStudent.admissionNumber) ||
        getSavedStudentRollNumber(activeStudent.AdmissionNumber) ||
        "";
    }

    setSelectedStudent(activeStudent);
    setViewMode("upload");
    setError("");
    setSuccess("");
    setPdfFile(null);
    setAnnualMeta({
      attendanceHY: "",
      attendanceAnn: "",
      remarks: "",
      resultStatus: "",
      coScholastics: DEFAULT_CO_SCHOLASTIC_LIST,
    });

    try {
      setLoadingSubjects(true);

      let subList = [];
      if (selectedDepartmentId) {
        subList = await getSubjectDropdownByDepartment(
          selectedDepartmentId,
        ).catch(() => []);
      }
      if (!Array.isArray(subList) || subList.length === 0) {
        subList = await getSubjectDropdown().catch(() => []);
      }

      const list = Array.isArray(subList) ? subList : [];
      setSubjects(list);

      // Initialize marks dynamically according to active exam mode
      const currentMode = detectExamMode(getSelectedExamName());
      let previousMarks = {
        ut1: {},
        ut2: {},
        halfYearly: {},
        ut3: {},
        ut4: {},
      };

      if (currentMode === "halfYearly" || currentMode === "annual") {
        previousMarks = await fetchStudentPreviousExamMarks(
          sId,
          selectedAcademicYearId,
          selectedBatchId,
        );
      }

      const initMarks = {};
      list.forEach((sub) => {
        const subId = sub.id ?? sub.Id;
        if (currentMode === "annual") {
          const ut1Val = getSubjectMark(previousMarks.ut1, sub);
          const ut2Val = getSubjectMark(previousMarks.ut2, sub);
          const hyData = getSubjectMark(previousMarks.halfYearly, sub);
          const ut3Val = getSubjectMark(previousMarks.ut3, sub);
          const ut4Val = getSubjectMark(previousMarks.ut4, sub);

          const finalUt1 =
            ut1Val !== undefined
              ? String(ut1Val)
              : hyData?.ut1 !== undefined
                ? String(hyData.ut1)
                : "";
          const finalUt2 =
            ut2Val !== undefined
              ? String(ut2Val)
              : hyData?.ut2 !== undefined
                ? String(hyData.ut2)
                : "";

          let avg1Val =
            hyData?.avg1 !== undefined && hyData.avg1 !== ""
              ? String(hyData.avg1)
              : "";
          if (!avg1Val && (finalUt1 !== "" || finalUt2 !== "")) {
            const u1 = parseFloat(finalUt1) || 0;
            const u2 = parseFloat(finalUt2) || 0;
            avg1Val = String(Math.round(((u1 + u2) / 4) * 10) / 10);
          }

          const finalHyExam =
            hyData?.hyExam !== undefined && hyData.hyExam !== ""
              ? String(hyData.hyExam)
              : "";
          let totalHYVal =
            hyData?.totalHY !== undefined && hyData.totalHY !== ""
              ? String(hyData.totalHY)
              : "";
          if (!totalHYVal && (avg1Val !== "" || finalHyExam !== "")) {
            const a1 = parseFloat(avg1Val) || 0;
            const h = parseFloat(finalHyExam) || 0;
            totalHYVal = String(Math.round((a1 + h) * 10) / 10);
          }

          const finalUt3 = ut3Val !== undefined ? String(ut3Val) : "";
          const finalUt4 = ut4Val !== undefined ? String(ut4Val) : "";
          let avg2Val = "";
          if (finalUt3 !== "" || finalUt4 !== "") {
            const u3 = parseFloat(finalUt3) || 0;
            const u4 = parseFloat(finalUt4) || 0;
            avg2Val = String(Math.round(((u3 + u4) / 4) * 10) / 10);
          }

          initMarks[subId] = {
            ut1: finalUt1,
            ut2: finalUt2,
            avg1: avg1Val,
            hyExam: finalHyExam,
            totalHY: totalHYVal,
            ut3: finalUt3,
            ut4: finalUt4,
            avg2: avg2Val,
            annExam: "", // User enters only this!
            totalAnn: "",
            grandTotal: "",
            maxMarks: "100",
            obtainedMarks: "",
            totalMarks: "",
            grade: "",
            remarks: "",
            isAutoFilled: Boolean(
              finalUt1 || finalUt2 || finalHyExam || finalUt3 || finalUt4,
            ),
          };
        } else if (currentMode === "halfYearly") {
          const ut1Val = getSubjectMark(previousMarks.ut1, sub);
          const ut2Val = getSubjectMark(previousMarks.ut2, sub);
          const hyData = getSubjectMark(previousMarks.halfYearly, sub);

          const finalUt1 =
            ut1Val !== undefined
              ? String(ut1Val)
              : hyData?.ut1 !== undefined
                ? String(hyData.ut1)
                : "";
          const finalUt2 =
            ut2Val !== undefined
              ? String(ut2Val)
              : hyData?.ut2 !== undefined
                ? String(hyData.ut2)
                : "";

          let avg1Val = "";
          if (finalUt1 !== "" || finalUt2 !== "") {
            const u1 = parseFloat(finalUt1) || 0;
            const u2 = parseFloat(finalUt2) || 0;
            avg1Val = String(Math.round(((u1 + u2) / 4) * 10) / 10);
          } else if (hyData?.avg1 !== undefined && hyData.avg1 !== "") {
            avg1Val = String(hyData.avg1);
          }

          initMarks[subId] = {
            ut1: finalUt1,
            ut2: finalUt2,
            avg1: avg1Val,
            hyExam: "", // User enters only this!
            totalHY: "",
            maxMarks: "50",
            obtainedMarks: "",
            totalMarks: "",
            grade: "",
            remarks: "",
            isAutoFilled: Boolean(finalUt1 || finalUt2),
          };
        } else {
          initMarks[subId] = {
            maxMarks: "100",
            obtainedMarks: "",
            totalMarks: "",
            grade: "",
            remarks: "",
          };
        }
      });
      setMarks(initMarks);
    } catch (err) {
      setError(err?.message || "Failed to load subjects.");
    } finally {
      setLoadingSubjects(false);
    }
  };

  // =====================================================
  // VIEW / UPDATE ALREADY UPLOADED RESULT
  // =====================================================
  const handleViewOrEdit = (student, resultData) => {
    const resultId = resultData?.resultId ?? resultData?.ResultId;
    if (resultId) {
      navigate("/student-result/update", {
        state: {
          resultId,
          studentData: student,
        },
      });
    } else {
      navigate("/student-result/student");
    }
  };

  // =====================================================
  // CALCULATE GRADE ACCORDING TO OBTAINED & MAX MARKS
  // =====================================================
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
  // MARKS CHANGE IN UPLOAD FORM (DYNAMIC FOR ALL 3 MODES)
  // =====================================================
  const handleMarkChange = (subjectId, field, value) => {
    setMarks((prev) => {
      const currentSubject = prev[subjectId] || {};
      const updatedSubject = {
        ...currentSubject,
        [field]: value,
      };

      const parseNum = (v) => {
        if (v === "" || v === undefined || v === null) return null;
        const n = parseFloat(v);
        return isNaN(n) ? null : n;
      };

      if (examMode === "annual") {
        const ut1 = parseNum(updatedSubject.ut1);
        const ut2 = parseNum(updatedSubject.ut2);
        const hyExam = parseNum(updatedSubject.hyExam);
        const ut3 = parseNum(updatedSubject.ut3);
        const ut4 = parseNum(updatedSubject.ut4);
        const annExam = parseNum(updatedSubject.annExam);

        // Term 1: AVG. (10)
        let avg1 = null;
        if (ut1 !== null || ut2 !== null) {
          avg1 = Math.round((((ut1 || 0) + (ut2 || 0)) / 4) * 10) / 10;
          updatedSubject.avg1 = String(avg1);
        } else {
          updatedSubject.avg1 = "";
        }

        // Term 1: TOTAL (50)
        let totalHY = null;
        if (avg1 !== null || hyExam !== null) {
          totalHY = Math.round(((avg1 || 0) + (hyExam || 0)) * 10) / 10;
          updatedSubject.totalHY = String(totalHY);
        } else {
          updatedSubject.totalHY = "";
        }

        // Term 2: AVG. (10)
        let avg2 = null;
        if (ut3 !== null || ut4 !== null) {
          avg2 = Math.round((((ut3 || 0) + (ut4 || 0)) / 4) * 10) / 10;
          updatedSubject.avg2 = String(avg2);
        } else {
          updatedSubject.avg2 = "";
        }

        // Term 2: TOTAL (50)
        let totalAnn = null;
        if (avg2 !== null || annExam !== null) {
          totalAnn = Math.round(((avg2 || 0) + (annExam || 0)) * 10) / 10;
          updatedSubject.totalAnn = String(totalAnn);
        } else {
          updatedSubject.totalAnn = "";
        }

        // GRAND TOTAL (100)
        if (totalHY !== null || totalAnn !== null) {
          const grand =
            Math.round(((totalHY || 0) + (totalAnn || 0)) * 10) / 10;
          updatedSubject.grandTotal = String(grand);
          updatedSubject.obtainedMarks = String(grand);
          updatedSubject.totalMarks = String(grand);
          updatedSubject.maxMarks = "100";
          updatedSubject.grade = calculateGrade(grand, 100);
        } else {
          updatedSubject.grandTotal = "";
          updatedSubject.obtainedMarks = "";
          updatedSubject.totalMarks = "";
          updatedSubject.grade = "";
        }
      } else if (examMode === "halfYearly") {
        const ut1 = parseNum(updatedSubject.ut1);
        const ut2 = parseNum(updatedSubject.ut2);
        const hyExam = parseNum(updatedSubject.hyExam);

        // AVG. (10)
        let avg1 = null;
        if (ut1 !== null || ut2 !== null) {
          avg1 = Math.round((((ut1 || 0) + (ut2 || 0)) / 4) * 10) / 10;
          updatedSubject.avg1 = String(avg1);
        } else {
          updatedSubject.avg1 = "";
        }

        // TOTAL (50)
        if (avg1 !== null || hyExam !== null) {
          const totalHY = Math.round(((avg1 || 0) + (hyExam || 0)) * 10) / 10;
          updatedSubject.totalHY = String(totalHY);
          updatedSubject.obtainedMarks = String(totalHY);
          updatedSubject.totalMarks = String(totalHY);
          updatedSubject.maxMarks = "50";
          updatedSubject.grade = calculateGrade(totalHY, 50);
        } else {
          updatedSubject.totalHY = "";
          updatedSubject.obtainedMarks = "";
          updatedSubject.totalMarks = "";
          updatedSubject.grade = "";
        }
      } else {
        // Regular Mode (Max & Obtain marks only)
        const maxVal = parseFloat(updatedSubject.maxMarks || 100);
        const obtVal = updatedSubject.obtainedMarks;
        if (obtVal !== "" && obtVal !== undefined && obtVal !== null) {
          const obtNum = parseFloat(obtVal);
          const validObt = isNaN(obtNum) ? 0 : obtNum;
          updatedSubject.totalMarks = String(validObt);
          updatedSubject.grade = calculateGrade(validObt, maxVal);
        } else {
          updatedSubject.totalMarks = "";
          updatedSubject.grade = "";
        }
      }

      return {
        ...prev,
        [subjectId]: updatedSubject,
      };
    });
    setError("");
  };

  // =====================================================
  // STEP MARKS BY DELTA (+/- 0.5) WITH BOUNDS
  // =====================================================
  const handleStepMark = (subjectId, field, delta, maxLimit = 100) => {
    const current = marks[subjectId] || {};
    const currentVal =
      current[field] === "" || current[field] === undefined
        ? 0
        : parseFloat(current[field]);

    let newVal = Math.round((currentVal + delta) * 10) / 10;
    if (newVal < 0) newVal = 0;
    if (newVal > maxLimit) newVal = maxLimit;

    handleMarkChange(subjectId, field, String(newVal));
  };

  // =====================================================
  // CO-SCHOLASTIC QUALITIES HANDLERS
  // =====================================================
  const handleCoScholasticChange = (rowIndex, field, value) => {
    const list = [...(annualMeta.coScholastics || DEFAULT_CO_SCHOLASTIC_LIST)];
    list[rowIndex] = {
      ...list[rowIndex],
      [field]: (value || "").toUpperCase(),
    };
    setAnnualMeta((prev) => ({
      ...prev,
      coScholastics: list,
    }));
  };

  const handleSetAllCoScholasticsGrade = (grade = "A") => {
    const list = (annualMeta.coScholastics || DEFAULT_CO_SCHOLASTIC_LIST).map(
      (row) => ({
        ...row,
        hy: grade,
        ann: grade,
        hyAtt: grade,
        annAtt: grade,
        hyAct: grade,
        annAct: grade,
      }),
    );
    setAnnualMeta((prev) => ({
      ...prev,
      coScholastics: list,
    }));
  };

  // =====================================================
  // REVIEW SELECTED PDF IN NEW TAB
  // =====================================================
  const handleReviewPdf = () => {
    if (!pdfFile) return;
    try {
      const fileUrl = URL.createObjectURL(pdfFile);
      window.open(fileUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError("Failed to open PDF preview.");
    }
  };

  // =====================================================
  // REMOVE SELECTED PDF
  // =====================================================
  const handleRemovePdf = () => {
    setPdfFile(null);
    const fileInput = document.getElementById("result-pdf-input");
    if (fileInput) {
      fileInput.value = "";
    }
  };

  // =====================================================
  // HELPER GETTERS FOR DISPLAY & MARKSHEET METADATA
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

  const getStudentFullName = (student) => {
    if (!student) return "-";
    const first = student.firstName ?? student.FirstName ?? "";
    const last = student.lastName ?? student.LastName ?? "";
    const name = `${first} ${last}`.trim();
    return (
      name || student.admissionNumber || student.AdmissionNumber || "Student"
    );
  };

  const getStudentAdmissionNo = (student) => {
    return (
      student?.admissionNumber ??
      student?.AdmissionNumber ??
      student?.code ??
      student?.Code ??
      "-"
    );
  };

  // Detect active exam mode
  const examMode = useMemo(() => {
    return detectExamMode(getSelectedExamName());
  }, [selectedExamId, publishedExams]);

  // =====================================================
  // COMPUTE EXAMINATION TOTALS (DYNAMIC ACROSS MODES)
  // =====================================================
  const examinationTotals = useMemo(() => {
    if (!subjects || subjects.length === 0) {
      return {
        totalMax: 0,
        totalObtained: 0,
        totalHY: 0,
        totalAnn: 0,
        percentage: "0.00",
        overallGrade: "",
        isComplete: false,
        isPassed: false,
        enteredSubjectsCount: 0,
        mode: examMode,
      };
    }

    let totalMax = 0;
    let totalObtained = 0;
    let totalHY = 0;
    let totalAnn = 0;
    let enteredCount = 0;

    subjects.forEach((sub) => {
      const subId = sub.id ?? sub.Id;
      const m = marks[subId] || {};

      if (examMode === "annual") {
        totalMax += 100;
        const hyVal = parseFloat(m.totalHY || 0);
        const annVal = parseFloat(m.totalAnn || 0);
        const grandVal = parseFloat(m.grandTotal || 0);

        totalHY += isNaN(hyVal) ? 0 : hyVal;
        totalAnn += isNaN(annVal) ? 0 : annVal;
        totalObtained += isNaN(grandVal) ? 0 : grandVal;

        if (
          m.grandTotal !== "" &&
          m.grandTotal !== undefined &&
          m.grandTotal !== null
        ) {
          enteredCount += 1;
        }
      } else if (examMode === "halfYearly") {
        totalMax += 50;
        const hyVal = parseFloat(m.totalHY || 0);
        totalHY += isNaN(hyVal) ? 0 : hyVal;
        totalObtained += isNaN(hyVal) ? 0 : hyVal;

        if (m.totalHY !== "" && m.totalHY !== undefined && m.totalHY !== null) {
          enteredCount += 1;
        }
      } else {
        // Regular Mode
        const maxVal = parseFloat(m.maxMarks || 100);
        totalMax += isNaN(maxVal) ? 100 : maxVal;
        const obtVal = parseFloat(m.obtainedMarks || 0);
        totalObtained += isNaN(obtVal) ? 0 : obtVal;

        if (
          m.obtainedMarks !== "" &&
          m.obtainedMarks !== undefined &&
          m.obtainedMarks !== null
        ) {
          enteredCount += 1;
        }
      }
    });

    totalMax = Math.round(totalMax * 10) / 10;
    totalObtained = Math.round(totalObtained * 10) / 10;
    totalHY = Math.round(totalHY * 10) / 10;
    totalAnn = Math.round(totalAnn * 10) / 10;

    const isComplete = enteredCount === subjects.length && subjects.length > 0;
    const pct = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
    const percentageStr = pct.toFixed(1);
    const overallGrade = calculateGrade(totalObtained, totalMax);
    const isPassed = pct >= 33;

    return {
      totalMax,
      totalObtained,
      totalHY,
      totalAnn,
      percentage: percentageStr,
      overallGrade,
      isComplete,
      isPassed,
      enteredSubjectsCount: enteredCount,
      mode: examMode,
    };
  }, [subjects, marks, examMode]);

  // =====================================================
  // MARKSHEET METADATA & IDENTIFIER GENERATION
  // =====================================================
  const metaInfo = useMemo(
    () => ({
      academicYearName: getSelectedAcademicYearName(),
      departmentName: getSelectedDepartmentName(),
      className: getSelectedClassName(),
      sectionName: getSelectedSectionName(),
      examName: getSelectedExamName(),
      batchId: selectedBatchId,
      examId: selectedExamId,
    }),
    [
      selectedAcademicYearId,
      selectedDepartmentId,
      selectedClassId,
      selectedSectionId,
      selectedExamId,
      selectedBatchId,
      academicYears,
      departments,
      classes,
      sections,
      publishedExams,
    ],
  );

  const certNo = useMemo(() => {
    if (!selectedStudent) return "";
    return generateCertificateNumber(selectedStudent, metaInfo);
  }, [selectedStudent, metaInfo]);

  const resNo = useMemo(() => {
    if (!selectedStudent) return "";
    return generateResultNumber(selectedStudent, metaInfo);
  }, [selectedStudent, metaInfo]);

  // =====================================================
  // PREVIEW / REVIEW GENERATED MARKSHEET PDF IN NEW TAB
  // =====================================================
  const handlePreviewGeneratedPdf = async () => {
    if (!selectedStudent) {
      setError("Please select a student first.");
      return;
    }
    try {
      setGeneratingPdf(true);
      setError("");
      const gen = await generateMarksheetPdf({
        student: selectedStudent,
        subjects,
        marks,
        totals: examinationTotals,
        meta: metaInfo,
        examMode,
        annualMeta,
      });
      setPdfFile(gen.pdfFile);
      window.open(gen.pdfUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err?.message || "Failed to generate Marksheet PDF preview.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  // =====================================================
  // DOWNLOAD GENERATED MARKSHEET PDF
  // =====================================================
  const handleDownloadGeneratedPdf = async () => {
    if (!selectedStudent) {
      setError("Please select a student first.");
      return;
    }
    try {
      setGeneratingPdf(true);
      setError("");
      const gen = await generateMarksheetPdf({
        student: selectedStudent,
        subjects,
        marks,
        totals: examinationTotals,
        meta: metaInfo,
        examMode,
        annualMeta,
      });
      setPdfFile(gen.pdfFile);
      gen.doc.save(gen.fileName);
    } catch (err) {
      setError(err?.message || "Failed to download Marksheet PDF.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  // =====================================================
  // SUBMIT RESULT UPLOAD
  // =====================================================
  const handleSubmitUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedBatchId) {
      setError("Result Batch is not selected.");
      return;
    }

    if (!selectedStudent?.id && !selectedStudent?.Id) {
      setError("Please select a student to upload result.");
      return;
    }

    if (subjects.length === 0) {
      setError("No subjects available for this department/class.");
      return;
    }

    // Validate marks according to examMode
    const subjectData = [];
    for (const sub of subjects) {
      const subId = sub.id ?? sub.Id;
      const m = marks[subId] || {};
      const subName =
        sub.text ??
        sub.Text ??
        sub.name ??
        sub.Name ??
        sub.subjectName ??
        `Subject ${subId}`;

      let max = 100;
      let obtained = 0;
      let intMarks = 0;
      let extMarks = 0;
      let userRemarks = m.remarks?.trim() || "";
      let finalRemarks = "";

      if (examMode === "annual") {
        max = 100;
        if (m.annExam === "" || m.annExam === undefined) {
          setError(`Please enter Annual Exam marks for ${subName}.`);
          return;
        }

        const grand = parseFloat(m.grandTotal || 0);
        if (grand > 100) {
          setError(`Grand Total for ${subName} (${grand}) cannot exceed 100.`);
          return;
        }

        obtained = grand;
        intMarks = parseFloat(m.totalHY || 0);
        extMarks = parseFloat(m.totalAnn || 0);
        finalRemarks = `HY: ${m.totalHY || 0}/50 (UT1:${m.ut1 || 0}, UT2:${m.ut2 || 0}, Avg:${m.avg1 || 0}, HY:${m.hyExam || 0}) | ANN: ${m.totalAnn || 0}/50 (UT3:${m.ut3 || 0}, UT4:${m.ut4 || 0}, Avg:${m.avg2 || 0}, Ann:${m.annExam || 0}) | Grand: ${grand}/100`;
        if (userRemarks) finalRemarks = `${userRemarks} | ${finalRemarks}`;
      } else if (examMode === "halfYearly") {
        max = 50;
        if (m.hyExam === "" || m.hyExam === undefined) {
          setError(`Please enter Half Yearly Exam marks for ${subName}.`);
          return;
        }

        const totalHY = parseFloat(m.totalHY || 0);
        if (totalHY > 50) {
          setError(`Total for ${subName} (${totalHY}) cannot exceed 50.`);
          return;
        }

        obtained = totalHY;
        intMarks = parseFloat(m.avg1 || 0);
        extMarks = parseFloat(m.hyExam || 0);
        finalRemarks = `UT-1: ${m.ut1 || 0}/20, UT-2: ${m.ut2 || 0}/20, Avg: ${m.avg1 || 0}/10, HY Exam: ${m.hyExam || 0}/40, Total: ${totalHY}/50`;
        if (userRemarks) finalRemarks = `${userRemarks} | ${finalRemarks}`;
      } else {
        // Regular Mode: maxMarks & obtainedMarks
        if (m.maxMarks === "" || m.maxMarks === undefined) {
          setError(`Maximum marks is required for ${subName}.`);
          return;
        }

        max = Number(m.maxMarks);
        if (Number.isNaN(max) || max <= 0) {
          setError(
            `Invalid maximum marks for ${subName}. Must be a positive number.`,
          );
          return;
        }

        if (m.obtainedMarks === "" || m.obtainedMarks === undefined) {
          setError(`Obtained marks is required for ${subName}.`);
          return;
        }

        obtained = Number(m.obtainedMarks);
        if (Number.isNaN(obtained) || obtained < 0) {
          setError(`Obtained marks for ${subName} must be 0 or higher.`);
          return;
        }

        if (obtained > max) {
          setError(
            `Obtained marks (${obtained}) cannot exceed Maximum marks (${max}) for ${subName}.`,
          );
          return;
        }

        intMarks = 0;
        extMarks = obtained;
        finalRemarks = userRemarks
          ? `${userRemarks} (Max: ${max}, Obt: ${obtained})`
          : `Max: ${max} | Obt: ${obtained}`;
      }

      subjectData.push({
        subjectId: Number(subId),
        maxMarks: max,
        obtainedMarks: obtained,
        internalMarks: intMarks,
        externalMarks: extMarks,
        grade: m.grade?.trim() || calculateGrade(obtained, max),
        remarks: finalRemarks,
      });
    }

    const sId = String(selectedStudent.id ?? selectedStudent.Id);
    if (uploadedResultsMap.has(sId)) {
      const existing = uploadedResultsMap.get(sId);
      const examName = existing?.examName || getSelectedExamName();
      setError(
        `A result has already been created for ${getStudentFullName(selectedStudent)} in "${examName}". Duplicate result creation is not permitted for the same Academic Year, Department, Class, and Exam. Please use Update Result to modify marks.`,
      );
      return;
    }

    try {
      setUploading(true);

      // Auto-generate official marksheet PDF certificate
      let finalPdfFile = pdfFile;
      try {
        const genResult = await generateMarksheetPdf({
          student: selectedStudent,
          subjects,
          marks,
          totals: examinationTotals,
          meta: metaInfo,
          examMode,
          annualMeta,
        });
        if (genResult?.pdfFile) {
          finalPdfFile = genResult.pdfFile;
          setPdfFile(finalPdfFile);
        }
      } catch (pdfErr) {
        console.warn("Auto PDF generation encountered an issue:", pdfErr);
      }

      const payload = {
        ResultBatchId: Number(selectedBatchId),
        StudentId: Number(selectedStudent.id ?? selectedStudent.Id),
        ResultId: 0,
        Subjects: subjectData,
        PdfFile: finalPdfFile,
      };

      await uploadStudentResult(payload);

      const studentFullName =
        `${selectedStudent.firstName ?? selectedStudent.FirstName ?? ""} ${
          selectedStudent.lastName ?? selectedStudent.LastName ?? ""
        }`.trim() || "Student";

      setPopup({
        isOpen: true,
        type: "success",
        title: "Result Uploaded Successfully",
        message: `Result for ${studentFullName} has been uploaded successfully.`,
      });

      // Refresh batch results so the student list immediately shows "Result Created"
      const updatedResults = await getBatchResults(
        Number(selectedBatchId),
      ).catch(() => []);
      const newMap = new Map(uploadedResultsMap);
      (Array.isArray(updatedResults) ? updatedResults : []).forEach((r) => {
        const studentId = String(r.studentId ?? r.StudentId);
        newMap.set(studentId, {
          ...r,
          examName: r.examName || r.ExamName || getSelectedExamName(),
        });
      });
      setUploadedResultsMap(newMap);

      // Return to student list
      setViewMode("list");
      setSelectedStudent(null);
      setPdfFile(null);
    } catch (err) {
      setError(err?.message || "Failed to upload student result.");
    } finally {
      setUploading(false);
    }
  };

  // =====================================================
  // FILTERED STUDENTS FOR DISPLAY
  // =====================================================
  const filteredStudents = useMemo(() => {
    if (!searchTerm.trim()) return students;
    const term = searchTerm.toLowerCase().trim();

    return students.filter((s) => {
      const name = getStudentFullName(s).toLowerCase();
      const adm = String(getStudentAdmissionNo(s)).toLowerCase();
      const father = String(s.fatherName ?? s.FatherName ?? "").toLowerCase();
      const mother = String(s.motherName ?? s.MotherName ?? "").toLowerCase();
      return (
        name.includes(term) ||
        adm.includes(term) ||
        father.includes(term) ||
        mother.includes(term)
      );
    });
  }, [students, searchTerm]);

  // Statistics
  const uploadedCount = useMemo(() => {
    let count = 0;
    students.forEach((s) => {
      const sId = String(s.id ?? s.Id);
      if (uploadedResultsMap.has(sId)) {
        count += 1;
      }
    });
    return count;
  }, [students, uploadedResultsMap]);

  const pendingCount = Math.max(0, students.length - uploadedCount);

  // Checks if all 5 filters are actively selected
  const allFiltersApplied = Boolean(
    selectedAcademicYearId &&
    selectedDepartmentId &&
    selectedClassId &&
    selectedSectionId &&
    selectedExamId,
  );

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="upload-student-result-container">
      <div className="upload-student-result-card">
        {/* =================================================
            HEADER
            ================================================= */}
        <div className="upload-student-result-header">
          <div className="header-text">
            <h2>Upload Student Result</h2>
            <p>
              Filter by Academic Year, Department, Class, Section, and Published
              Exam to review student upload statuses and submit examination
              marks.
            </p>
          </div>
        </div>

        {/* FEEDBACK NOTICES */}
        {error && <div className="upload-student-result-error">{error}</div>}
        {success && (
          <div className="upload-student-result-success">{success}</div>
        )}

        {/* =================================================
            5-STEP CASCADING FILTER BAR
            ================================================= */}
        <div className="upload-filter-section">
          <div className="filter-section-header">
            <div className="filter-section-title">
              <span>Filter Parameters</span>
              <small>
                Follow the sequence to display eligible published exams
              </small>
            </div>

            <button
              type="button"
              className="upload-clear-filters-btn"
              onClick={handleClearFilters}
              title="Reset all filter selections"
            >
              ↺ Reset Filters
            </button>
          </div>

          <div className="upload-filter-grid">
            {/* 1. ACADEMIC YEAR */}
            <div className="upload-filter-col">
              <label htmlFor="select-academic-year">
                1. Academic Year <span>*</span>
              </label>
              <select
                id="select-academic-year"
                value={selectedAcademicYearId}
                onChange={handleAcademicYearChange}
                disabled={loadingInitial || uploading}
              >
                <option value="">
                  {loadingInitial
                    ? "Loading Years..."
                    : "-- Select Academic Year --"}
                </option>
                {academicYears.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.yearName ?? item.YearName ?? item.text ?? item.Text}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. DEPARTMENT */}
            <div className="upload-filter-col">
              <label htmlFor="select-department">
                2. Department <span>*</span>
              </label>
              <select
                id="select-department"
                value={selectedDepartmentId}
                onChange={handleDepartmentChange}
                disabled={loadingInitial || uploading}
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
            <div className="upload-filter-col">
              <label htmlFor="select-class">
                3. Class <span>*</span>
              </label>
              <select
                id="select-class"
                value={selectedClassId}
                onChange={handleClassChange}
                disabled={!selectedDepartmentId || loadingClasses || uploading}
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
            <div className="upload-filter-col">
              <label htmlFor="select-section">
                4. Section <span>*</span>
              </label>
              <select
                id="select-section"
                value={selectedSectionId}
                onChange={handleSectionChange}
                disabled={!selectedClassId || loadingSections || uploading}
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
            <div className="upload-filter-col">
              <label htmlFor="select-exam">
                5. Exam (Published Only) <span>*</span>
              </label>
              <select
                id="select-exam"
                value={selectedExamId}
                onChange={handleExamChange}
                disabled={!selectedSectionId || uploading}
              >
                <option value="">
                  {!selectedSectionId
                    ? "-- Select Section First --"
                    : publishedExams.length === 0
                      ? "-- No Published Exams for Batch --"
                      : "-- Select Published Exam --"}
                </option>
                {publishedExams.map((item) => (
                  <option key={item.batchId} value={item.examId}>
                    {item.examName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* NOTICE IF NO PUBLISHED EXAMS FOUND */}
          {selectedAcademicYearId &&
            selectedClassId &&
            selectedSectionId &&
            publishedExams.length === 0 && (
              <div className="upload-filter-notice">
                ℹ No published result batches found for the selected Academic
                Year, Class, and Section. Please create and publish a Result
                Batch first in order to upload individual student results.
              </div>
            )}
        </div>

        {/* =================================================
            VIEW 1: STUDENTS LIST & STATUS TABLE
            ================================================= */}
        {viewMode === "list" && (
          <div className="students-status-container">
            {/* PLACEHOLDER WHEN FILTERS INCOMPLETE */}
            {!allFiltersApplied && (
              <div className="upload-placeholder-box">
                <div className="placeholder-icon">📋</div>
                <h3>Complete the Filters Above</h3>
                <p>
                  Please select <strong>Academic Year</strong>,{" "}
                  <strong>Department</strong>, <strong>Class</strong>,{" "}
                  <strong>Section</strong>, and a{" "}
                  <strong>Published Exam</strong> to view all enrolled students
                  and their result upload statuses.
                </p>
              </div>
            )}

            {/* LOADING STUDENTS */}
            {allFiltersApplied && loadingStudents && (
              <div className="upload-students-loading">
                <div className="spinner"></div>
                <span>Loading students and result upload statuses...</span>
              </div>
            )}

            {/* LOADED STUDENTS SECTION */}
            {allFiltersApplied && !loadingStudents && (
              <div className="upload-students-wrapper">
                {/* SUMMARY METRICS & SEARCH */}
                <div className="students-status-toolbar">
                  <div className="metrics-badges">
                    <div className="metric-pill total">
                      <span>Total Students:</span>
                      <strong>{students.length}</strong>
                    </div>

                    <div className="metric-pill uploaded">
                      <span>Result Created:</span>
                      <strong>{uploadedCount}</strong>
                    </div>

                    <div className="metric-pill pending">
                      <span>Pending:</span>
                      <strong>{pendingCount}</strong>
                    </div>
                  </div>

                  <div className="students-search-box">
                    <input
                      type="text"
                      placeholder="Search student by name or admission number..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        type="button"
                        className="search-clear-btn"
                        onClick={() => setSearchTerm("")}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>

                {/* STUDENTS TABLE */}
                {filteredStudents.length === 0 ? (
                  <div className="upload-empty-students">
                    {students.length === 0
                      ? "No students found enrolled in this Class and Section."
                      : "No students matching your search criteria."}
                  </div>
                ) : (
                  <div className="students-table-responsive">
                    <table className="students-status-table">
                      <thead>
                        <tr>
                          <th className="col-idx">#</th>
                          <th className="col-roll">Roll No.</th>
                          <th className="col-name">Student Name</th>
                          <th className="col-father">Father Name</th>
                          <th className="col-mother">Mother Name</th>
                          <th className="col-adm">Admission Number</th>
                          <th className="col-status">
                            Result Status ({getSelectedExamName()})
                          </th>
                          <th className="col-action">Action</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredStudents.map((student, index) => {
                          const sId = String(student.id ?? student.Id);
                          const isUploaded = uploadedResultsMap.has(sId);
                          const resultRecord = uploadedResultsMap.get(sId);
                          const studentExamName =
                            resultRecord?.examName || getSelectedExamName();

                          return (
                            <tr
                              key={sId || index}
                              className={
                                isUploaded ? "row-uploaded" : "row-pending"
                              }
                              onClick={() => {
                                if (isUploaded) {
                                  handleViewOrEdit(student, resultRecord);
                                } else {
                                  handleStartUpload(student);
                                }
                              }}
                              title={
                                isUploaded
                                  ? `Result already created for ${studentExamName}. Click to view or update.`
                                  : `Click to upload result for ${getSelectedExamName()}`
                              }
                              style={{ cursor: "pointer" }}
                            >
                              <td className="col-idx">{index + 1}</td>

                              <td className="col-roll">
                                <span className="student-roll-badge">
                                  {student.rollNumber ||
                                    student.RollNumber ||
                                    student.RollNo ||
                                    "—"}
                                </span>
                              </td>

                              <td className="col-name">
                                <div className="student-profile-cell">
                                  <div
                                    className={`student-avatar ${
                                      isUploaded ? "uploaded" : "pending"
                                    }`}
                                  >
                                    {(
                                      student.firstName?.[0] ||
                                      student.FirstName?.[0] ||
                                      "S"
                                    ).toUpperCase()}
                                  </div>
                                  <div className="student-names">
                                    <span className="student-full-name">
                                      {getStudentFullName(student)}
                                    </span>
                                    {student.rollNumber && (
                                      <small className="student-roll">
                                        Roll No: {student.rollNumber}
                                      </small>
                                    )}
                                  </div>
                                </div>
                              </td>

                              <td className="col-father">
                                {student.fatherName ||
                                  student.FatherName ||
                                  "-"}
                              </td>

                              <td className="col-mother">
                                {student.motherName ||
                                  student.MotherName ||
                                  "-"}
                              </td>

                              <td className="col-adm">
                                <span className="adm-badge">
                                  {getStudentAdmissionNo(student)}
                                </span>
                              </td>

                              <td className="col-status">
                                {isUploaded ? (
                                  <div className="status-cell-uploaded">
                                    <span className="badge-status uploaded">
                                      ✓ Result Created: {studentExamName}
                                    </span>
                                    {resultRecord?.percentage !== undefined &&
                                      resultRecord?.percentage !== null && (
                                        <small className="result-snippet">
                                          Score: {resultRecord.percentage}%
                                          {resultRecord.grade
                                            ? ` (${resultRecord.grade})`
                                            : ""}
                                        </small>
                                      )}
                                  </div>
                                ) : (
                                  <div className="status-cell-pending">
                                    <span className="badge-status pending">
                                      ⏳ Not Created ({getSelectedExamName()})
                                    </span>
                                  </div>
                                )}
                              </td>

                              <td
                                className="col-action"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {isUploaded ? (
                                  <div className="upload-actions-row">
                                    <button
                                      type="button"
                                      className="action-btn view-btn"
                                      onClick={() =>
                                        handleViewOrEdit(student, resultRecord)
                                      }
                                      title={`Result already created for ${studentExamName}. Click to view or update.`}
                                    >
                                      View / Update
                                    </button>
                                    <button
                                      type="button"
                                      className="action-btn preview-mini-btn"
                                      onClick={() =>
                                        navigate("/student-result/previous", {
                                          state: {
                                            studentId: student.id ?? student.Id,
                                            studentData: student,
                                            academicYearId:
                                              selectedAcademicYearId,
                                            departmentId: selectedDepartmentId,
                                            classId: selectedClassId,
                                            sectionId: selectedSectionId,
                                          },
                                        })
                                      }
                                      title="Preview historical results for this student"
                                    >
                                      Preview
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    className="action-btn upload-btn"
                                    onClick={() => handleStartUpload(student)}
                                    title={`Upload result for ${getSelectedExamName()}`}
                                  >
                                    Upload Result
                                  </button>
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
            )}
          </div>
        )}

        {/* =================================================
            VIEW 2: DEDICATED STUDENT RESULT UPLOAD FORM
            ================================================= */}
        {viewMode === "upload" && selectedStudent && (
          <div className="upload-form-view">
            {/* TOP NAVIGATION / RETURN BAR */}
            <div className="upload-view-header">
              <button
                type="button"
                className="upload-back-btn"
                onClick={() => {
                  setViewMode("list");
                  setSelectedStudent(null);
                  setError("");
                }}
                disabled={uploading}
              >
                ← Back to Student List
              </button>

              <div className="upload-view-title">
                <h3>Enter Examination Marks</h3>
                <small>Review active parameters below and submit marks</small>
              </div>
            </div>

            {/* RULE CALLOUT: 1 STUDENT 1 RESULT PER EXAM */}
            <div className="upload-rule-callout">
              <span className="callout-icon">ℹ</span>
              <div className="callout-text">
                <strong>Policy:</strong> Each student is permitted only{" "}
                <strong>one result record</strong> for{" "}
                <strong>{getSelectedExamName()}</strong> in Academic Year{" "}
                <strong>{getSelectedAcademicYearName()}</strong>, Department{" "}
                <strong>{getSelectedDepartmentName()}</strong>, and Class{" "}
                <strong>{getSelectedClassName()}</strong>.
              </div>
            </div>

            {/* =================================================
                CONTEXT PARAMETERS COLUMNS GRID
                (Academic Year, Department, Class, Section, Exam, Student)
                ================================================= */}
            <div className="upload-context-panel">
              <div className="context-panel-title">
                Active Examination Details
              </div>

              <div className="upload-context-grid">
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

                <div className="context-col student-col">
                  <span className="context-label">Selected Student</span>
                  <strong className="context-value student-name">
                    {getStudentFullName(selectedStudent)}
                  </strong>
                  <small className="context-sub">
                    Roll No:{" "}
                    <strong>
                      {selectedStudent.rollNumber ||
                        selectedStudent.RollNumber ||
                        selectedStudent.RollNo ||
                        "—"}
                    </strong>{" "}
                    | Adm No: {getStudentAdmissionNo(selectedStudent)}
                  </small>
                  {(selectedStudent.fatherName ||
                    selectedStudent.FatherName) && (
                    <small className="context-sub">
                      Father:{" "}
                      {selectedStudent.fatherName || selectedStudent.FatherName}
                    </small>
                  )}
                  {(selectedStudent.motherName ||
                    selectedStudent.MotherName) && (
                    <small className="context-sub">
                      Mother:{" "}
                      {selectedStudent.motherName || selectedStudent.MotherName}
                    </small>
                  )}
                </div>
              </div>
            </div>

            {/* MARKS FORM */}
            <form onSubmit={handleSubmitUpload} className="upload-marks-form">
              {/* SUBJECT MARKS & EVALUATION SECTION */}
              <div className="upload-marks-section">
                <div className="marks-section-header">
                  <div className="marks-section-header-title">
                    <h4>Evaluation & Marks Entry</h4>
                    <small>
                      {examMode === "annual"
                        ? "12-Column Comprehensive Academic Evaluation (U.T I–IV, Projects, Half Yearly, and Annual Exam)"
                        : examMode === "halfYearly"
                          ? "Half Yearly Evaluation with U.T - I (20), U.T - II (20), AVG (10), H.Y. EXAM (40), and TOTAL (50)"
                          : "Standard Examination Evaluation (Max Marks & Obtained Marks)"}
                    </small>
                  </div>
                  <div className={`exam-mode-badge-tag ${examMode}`}>
                    {examMode === "annual"
                      ? "🏆 Annual Exam Mode (12-Columns)"
                      : examMode === "halfYearly"
                        ? "📘 Half Yearly Mode (UT-I, UT-II, Avg, HY, Total)"
                        : "📝 Regular Mode (Max & Obtain Marks)"}
                  </div>
                </div>

                {loadingSubjects ? (
                  <div className="upload-subjects-loading">
                    Loading subjects for {getSelectedDepartmentName()}...
                  </div>
                ) : subjects.length === 0 ? (
                  <div className="upload-subjects-empty">
                    No subjects found for this Department. Please assign
                    subjects first.
                  </div>
                ) : (
                  <>
                    {/* AUTO-LOADED PREVIOUS EXAM NOTICE BANNER */}
                    {examMode === "halfYearly" && (
                      <div className="autofill-notification-banner">
                        <span className="autofill-badge">⚡ Auto-Filled</span>
                        <span>
                          Unit Test 1 & 2 marks and Averages are automatically
                          loaded from student records.
                          <strong>
                            {" "}
                            Enter only Half Yearly Exam marks (Max 40) below. Previous records and averages are locked and non-editable.
                          </strong>
                        </span>
                      </div>
                    )}

                    {examMode === "annual" && (
                      <div className="autofill-notification-banner">
                        <span className="autofill-badge">⚡ Auto-Filled</span>
                        <span>
                          Previous examination records (U.T I–IV, Averages, H.Y.
                          Exam & Total) are automatically loaded.
                          <strong>
                            {" "}
                            Enter only Annual Exam marks (Max 40) below. Previous records, averages, and H.Y. totals are locked and non-editable.
                          </strong>
                        </span>
                      </div>
                    )}

                    <div className="marks-table-wrapper">
                      {/* MODE 1: ANNUAL EXAM (12 COLUMNS) */}
                      {examMode === "annual" && (
                        <table className="marks-entry-table annual-mode-table">
                          <thead>
                            <tr>
                              <th className="th-sub">SUBJECT</th>
                              <th className="th-eval-header th-locked-head" title="Auto-loaded from records (Non-editable)">U.T - I (20) 🔒</th>
                              <th className="th-eval-header th-locked-head" title="Auto-loaded from records (Non-editable)">
                                U.T - II (PROJ) (20) 🔒
                              </th>
                              <th className="th-eval-header th-calc-head">
                                AVG. (10)
                              </th>
                              <th className="th-eval-header th-locked-head" title="Auto-loaded from Half Yearly (Non-editable)">H.Y. EXAM (40) 🔒</th>
                              <th className="th-eval-header th-total-hy-head">
                                TOTAL (50)
                              </th>
                              <th className="th-eval-header th-locked-head" title="Auto-loaded from records (Non-editable)">U.T - III (20) 🔒</th>
                              <th className="th-eval-header th-locked-head" title="Auto-loaded from records (Non-editable)">
                                U.T - IV (PROJ) (20) 🔒
                              </th>
                              <th className="th-eval-header th-calc-head">
                                AVG. (10)
                              </th>
                              <th className="th-eval-header th-primary-entry-head">
                                ANN. EXAM (40) ✍️ (Enter Here) *
                              </th>
                              <th className="th-eval-header th-total-ann-head">
                                TOTAL (50)
                              </th>
                              <th className="th-eval-header th-grand-head">
                                GRAND TOTAL (100)
                              </th>
                              <th className="th-grade-head">GRADE</th>
                              <th className="th-remarks-head">REMARKS</th>
                            </tr>
                          </thead>

                          <tbody>
                            {subjects.map((sub) => {
                              const subId = sub.id ?? sub.Id;
                              const subName =
                                sub.text ??
                                sub.Text ??
                                sub.name ??
                                sub.Name ??
                                sub.subjectName ??
                                `Subject ${subId}`;
                              const m = marks[subId] || {};

                              return (
                                <tr key={subId}>
                                  <td className="td-sub">
                                    <strong>{subName}</strong>
                                  </td>

                                  {/* 1. U.T - I (20) - Auto-Loaded Non-Editable */}
                                  <td className="td-eval-input td-auto-locked">
                                    <input
                                      type="text"
                                      value={m.ut1 !== "" && m.ut1 !== undefined ? m.ut1 : "—"}
                                      readOnly
                                      disabled
                                      className="auto-loaded-readonly-input"
                                      title="Auto-loaded from Unit Test 1 records (Non-editable)"
                                    />
                                  </td>

                                  {/* 2. U.T - II (PROJECT) (20) - Auto-Loaded Non-Editable */}
                                  <td className="td-eval-input td-auto-locked">
                                    <input
                                      type="text"
                                      value={m.ut2 !== "" && m.ut2 !== undefined ? m.ut2 : "—"}
                                      readOnly
                                      disabled
                                      className="auto-loaded-readonly-input"
                                      title="Auto-loaded from Unit Test 2 records (Non-editable)"
                                    />
                                  </td>

                                  {/* 3. AVG. (10) - Auto */}
                                  <td className="td-eval-calc">
                                    <span className="calc-val-text">
                                      {m.avg1 !== "" && m.avg1 !== undefined
                                        ? m.avg1
                                        : "—"}
                                    </span>
                                  </td>

                                  {/* 4. H.Y. EXAM (40) - Auto-Loaded Non-Editable */}
                                  <td className="td-eval-input td-auto-locked">
                                    <input
                                      type="text"
                                      value={m.hyExam !== "" && m.hyExam !== undefined ? m.hyExam : "—"}
                                      readOnly
                                      disabled
                                      className="auto-loaded-readonly-input"
                                      title="Auto-loaded from Half Yearly Examination records (Non-editable)"
                                    />
                                  </td>

                                  {/* 5. TOTAL (50) - Auto */}
                                  <td className="td-eval-total-hy">
                                    <strong>
                                      {m.totalHY !== "" &&
                                      m.totalHY !== undefined
                                        ? m.totalHY
                                        : "—"}
                                    </strong>
                                  </td>

                                  {/* 6. U.T - III (20) - Auto-Loaded Non-Editable */}
                                  <td className="td-eval-input td-auto-locked">
                                    <input
                                      type="text"
                                      value={m.ut3 !== "" && m.ut3 !== undefined ? m.ut3 : "—"}
                                      readOnly
                                      disabled
                                      className="auto-loaded-readonly-input"
                                      title="Auto-loaded from Unit Test 3 records (Non-editable)"
                                    />
                                  </td>

                                  {/* 7. U.T - IV (PROJECT) (20) - Auto-Loaded Non-Editable */}
                                  <td className="td-eval-input td-auto-locked">
                                    <input
                                      type="text"
                                      value={m.ut4 !== "" && m.ut4 !== undefined ? m.ut4 : "—"}
                                      readOnly
                                      disabled
                                      className="auto-loaded-readonly-input"
                                      title="Auto-loaded from Unit Test 4 records (Non-editable)"
                                    />
                                  </td>

                                  {/* 8. AVG. (10) - Auto */}
                                  <td className="td-eval-calc">
                                    <span className="calc-val-text">
                                      {m.avg2 !== "" && m.avg2 !== undefined
                                        ? m.avg2
                                        : "—"}
                                    </span>
                                  </td>

                                  {/* 9. ANN. EXAM (40) - USER ENTRY */}
                                  <td className="td-eval-input td-primary-entry">
                                    <div className="marks-stepper-control">
                                      <button
                                        type="button"
                                        className="stepper-btn minus"
                                        onClick={() =>
                                          handleStepMark(
                                            subId,
                                            "annExam",
                                            -0.5,
                                            40,
                                          )
                                        }
                                        disabled={
                                          uploading ||
                                          !m.annExam ||
                                          Number(m.annExam) <= 0
                                        }
                                        title="Decrease by 0.5"
                                      >
                                        −
                                      </button>
                                      <input
                                        type="number"
                                        min="0"
                                        max="40"
                                        step="0.5"
                                        value={m.annExam ?? ""}
                                        onChange={(e) =>
                                          handleMarkChange(
                                            subId,
                                            "annExam",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="0.0"
                                        disabled={uploading}
                                        className="primary-target-input"
                                      />
                                      <button
                                        type="button"
                                        className="stepper-btn plus"
                                        onClick={() =>
                                          handleStepMark(
                                            subId,
                                            "annExam",
                                            0.5,
                                            40,
                                          )
                                        }
                                        disabled={
                                          uploading ||
                                          Number(m.annExam || 0) >= 40
                                        }
                                        title="Increase by 0.5"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>

                                  {/* 10. TOTAL (50) - Auto */}
                                  <td className="td-eval-total-ann">
                                    <strong>
                                      {m.totalAnn !== "" &&
                                      m.totalAnn !== undefined
                                        ? m.totalAnn
                                        : "—"}
                                    </strong>
                                  </td>

                                  {/* 11. GRAND TOTAL (100) - Auto */}
                                  <td className="td-eval-grand">
                                    <strong>
                                      {m.grandTotal !== "" &&
                                      m.grandTotal !== undefined
                                        ? m.grandTotal
                                        : "—"}
                                    </strong>
                                  </td>

                                  {/* 12. GRADE */}
                                  <td className="td-grade">
                                    <input
                                      type="text"
                                      maxLength={10}
                                      value={m.grade ?? ""}
                                      onChange={(e) =>
                                        handleMarkChange(
                                          subId,
                                          "grade",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Auto"
                                      disabled={uploading}
                                    />
                                  </td>

                                  {/* 13. REMARKS */}
                                  <td className="td-remarks">
                                    <input
                                      type="text"
                                      maxLength={100}
                                      value={m.remarks ?? ""}
                                      onChange={(e) =>
                                        handleMarkChange(
                                          subId,
                                          "remarks",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Optional"
                                      disabled={uploading}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>

                          <tfoot>
                            <tr className="marks-total-row">
                              <td className="td-sub total-label-cell">
                                <strong>TOTAL EVALUATION</strong>
                              </td>
                              <td
                                colSpan={4}
                                className="text-center total-summary-col"
                              >
                                <span>
                                  H.Y. Term:{" "}
                                  <strong>
                                    {examinationTotals.totalHY} /{" "}
                                    {subjects.length * 50}
                                  </strong>
                                </span>
                              </td>
                              <td className="td-eval-total-hy text-center">
                                <strong>{examinationTotals.totalHY}</strong>
                              </td>
                              <td
                                colSpan={4}
                                className="text-center total-summary-col"
                              >
                                <span>
                                  Ann. Term:{" "}
                                  <strong>
                                    {examinationTotals.totalAnn} /{" "}
                                    {subjects.length * 50}
                                  </strong>
                                </span>
                              </td>
                              <td className="td-eval-total-ann text-center">
                                <strong>{examinationTotals.totalAnn}</strong>
                              </td>
                              <td className="td-eval-grand text-center highlight">
                                <strong className="text-total">
                                  {examinationTotals.totalObtained} /{" "}
                                  {examinationTotals.totalMax}
                                </strong>
                              </td>
                              <td className="td-grade text-center">
                                {examinationTotals.overallGrade ? (
                                  <span className="total-grade-badge">
                                    {examinationTotals.overallGrade}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="td-remarks total-status-cell">
                                {examinationTotals.enteredSubjectsCount > 0 && (
                                  <span
                                    className={`status-chip ${
                                      examinationTotals.isPassed
                                        ? "chip-pass"
                                        : "chip-fail"
                                    }`}
                                  >
                                    {examinationTotals.isPassed
                                      ? "✓ Pass"
                                      : "✕ Fail"}{" "}
                                    ({examinationTotals.percentage}%)
                                  </span>
                                )}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      )}

                      {/* MODE 2: HALF YEARLY EXAM (UT-I, UT-II, AVG, HY EXAM, TOTAL) */}
                      {examMode === "halfYearly" && (
                        <table className="marks-entry-table hy-mode-table">
                          <thead>
                            <tr>
                              <th className="th-sub">Subject Name</th>
                              <th className="th-hy-input th-locked-head" title="Auto-loaded from records (Non-editable)">U.T - I (20) 🔒</th>
                              <th className="th-hy-input th-locked-head" title="Auto-loaded from records (Non-editable)">U.T - II (20) 🔒</th>
                              <th className="th-hy-calc">AVG. (10)</th>
                              <th className="th-hy-input th-primary-entry-head">
                                H.Y. EXAM (40) ✍️ (Enter Here) *
                              </th>
                              <th className="th-hy-total">TOTAL (50)</th>
                              <th className="th-grade">Grade (Auto)</th>
                              <th className="th-remarks">Remarks (Optional)</th>
                            </tr>
                          </thead>

                          <tbody>
                            {subjects.map((sub) => {
                              const subId = sub.id ?? sub.Id;
                              const subName =
                                sub.text ??
                                sub.Text ??
                                sub.name ??
                                sub.Name ??
                                sub.subjectName ??
                                `Subject ${subId}`;
                              const m = marks[subId] || {};

                              return (
                                <tr key={subId}>
                                  <td className="td-sub">
                                    <strong>{subName}</strong>
                                  </td>

                                  {/* U.T - I (20) - Auto-Loaded Non-Editable */}
                                  <td className="td-hy-input td-auto-locked">
                                    <input
                                      type="text"
                                      value={m.ut1 !== "" && m.ut1 !== undefined ? m.ut1 : "—"}
                                      readOnly
                                      disabled
                                      className="auto-loaded-readonly-input"
                                      title="Auto-loaded from Unit Test 1 records (Non-editable)"
                                    />
                                  </td>

                                  {/* U.T - II (20) - Auto-Loaded Non-Editable */}
                                  <td className="td-hy-input td-auto-locked">
                                    <input
                                      type="text"
                                      value={m.ut2 !== "" && m.ut2 !== undefined ? m.ut2 : "—"}
                                      readOnly
                                      disabled
                                      className="auto-loaded-readonly-input"
                                      title="Auto-loaded from Unit Test 2 records (Non-editable)"
                                    />
                                  </td>

                                  {/* AVG. (10) */}
                                  <td className="td-hy-calc">
                                    <div className="calc-marks-box">
                                      <span>
                                        {m.avg1 !== "" && m.avg1 !== undefined
                                          ? m.avg1
                                          : "—"}
                                      </span>
                                    </div>
                                  </td>

                                  {/* H.Y. EXAM (40) */}
                                  <td className="td-hy-input td-primary-entry">
                                    <div className="marks-stepper-control">
                                      <button
                                        type="button"
                                        className="stepper-btn minus"
                                        onClick={() =>
                                          handleStepMark(
                                            subId,
                                            "hyExam",
                                            -0.5,
                                            40,
                                          )
                                        }
                                        disabled={
                                          uploading ||
                                          !m.hyExam ||
                                          Number(m.hyExam) <= 0
                                        }
                                        title="Decrease by 0.5"
                                      >
                                        −
                                      </button>
                                      <input
                                        type="number"
                                        min="0"
                                        max="40"
                                        step="0.5"
                                        value={m.hyExam ?? ""}
                                        onChange={(e) =>
                                          handleMarkChange(
                                            subId,
                                            "hyExam",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="0.0"
                                        disabled={uploading}
                                        className="primary-target-input"
                                      />
                                      <button
                                        type="button"
                                        className="stepper-btn plus"
                                        onClick={() =>
                                          handleStepMark(
                                            subId,
                                            "hyExam",
                                            0.5,
                                            40,
                                          )
                                        }
                                        disabled={
                                          uploading ||
                                          Number(m.hyExam || 0) >= 40
                                        }
                                        title="Increase by 0.5"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>

                                  {/* TOTAL (50) */}
                                  <td className="td-hy-total">
                                    <div className="total-marks-box">
                                      <span className="total-marks-val">
                                        {m.totalHY !== "" &&
                                        m.totalHY !== undefined
                                          ? m.totalHY
                                          : "—"}
                                      </span>
                                    </div>
                                  </td>

                                  {/* GRADE */}
                                  <td className="td-grade">
                                    <input
                                      type="text"
                                      maxLength={10}
                                      value={m.grade ?? ""}
                                      onChange={(e) =>
                                        handleMarkChange(
                                          subId,
                                          "grade",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Auto"
                                      disabled={uploading}
                                    />
                                  </td>

                                  {/* REMARKS */}
                                  <td className="td-remarks">
                                    <input
                                      type="text"
                                      maxLength={100}
                                      value={m.remarks ?? ""}
                                      onChange={(e) =>
                                        handleMarkChange(
                                          subId,
                                          "remarks",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Optional"
                                      disabled={uploading}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>

                          <tfoot>
                            <tr className="marks-total-row">
                              <td className="td-sub total-label-cell">
                                <strong>HALF YEARLY TOTAL</strong>
                              </td>
                              <td
                                colSpan={3}
                                className="text-center total-summary-col"
                              >
                                <span>
                                  Evaluated:{" "}
                                  <strong>
                                    {examinationTotals.enteredSubjectsCount} /{" "}
                                    {subjects.length} Subjects
                                  </strong>
                                </span>
                              </td>
                              <td className="text-center total-summary-col">
                                <span>
                                  Max Marks:{" "}
                                  <strong>{examinationTotals.totalMax}</strong>
                                </span>
                              </td>
                              <td className="td-hy-total total-val-cell highlight">
                                <strong className="text-total">
                                  {examinationTotals.totalObtained}
                                </strong>
                              </td>
                              <td className="td-grade total-val-cell">
                                {examinationTotals.overallGrade ? (
                                  <span className="total-grade-badge">
                                    {examinationTotals.overallGrade}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="td-remarks total-status-cell">
                                {examinationTotals.enteredSubjectsCount > 0 && (
                                  <span
                                    className={`status-chip ${
                                      examinationTotals.isPassed
                                        ? "chip-pass"
                                        : "chip-fail"
                                    }`}
                                  >
                                    {examinationTotals.isPassed
                                      ? "✓ Pass"
                                      : "✕ Fail"}{" "}
                                    ({examinationTotals.percentage}%)
                                  </span>
                                )}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      )}

                      {/* MODE 3: REGULAR EXAM (MAX & OBTAIN MARKS ONLY) */}
                      {examMode === "regular" && (
                        <table className="marks-entry-table regular-mode-table">
                          <thead>
                            <tr>
                              <th className="th-sub">Subject Name</th>
                              <th className="th-max">Max Marks *</th>
                              <th className="th-obt">Obtained Marks *</th>
                              <th className="th-grade">Grade (Auto)</th>
                              <th className="th-remarks">Remarks (Optional)</th>
                            </tr>
                          </thead>

                          <tbody>
                            {subjects.map((sub) => {
                              const subId = sub.id ?? sub.Id;
                              const subName =
                                sub.text ??
                                sub.Text ??
                                sub.name ??
                                sub.Name ??
                                sub.subjectName ??
                                `Subject ${subId}`;
                              const m = marks[subId] || {};

                              return (
                                <tr key={subId}>
                                  <td className="td-sub">
                                    <strong>{subName}</strong>
                                  </td>

                                  {/* MAX MARKS */}
                                  <td className="td-max">
                                    <input
                                      type="number"
                                      min="1"
                                      step="1"
                                      value={m.maxMarks ?? ""}
                                      onChange={(e) =>
                                        handleMarkChange(
                                          subId,
                                          "maxMarks",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="100"
                                      disabled={uploading}
                                      required
                                    />
                                  </td>

                                  {/* OBTAINED MARKS */}
                                  <td className="td-obt">
                                    <div className="marks-stepper-control">
                                      <button
                                        type="button"
                                        className="stepper-btn minus"
                                        onClick={() =>
                                          handleStepMark(
                                            subId,
                                            "obtainedMarks",
                                            -0.5,
                                            parseFloat(m.maxMarks || 100),
                                          )
                                        }
                                        disabled={
                                          uploading ||
                                          !m.obtainedMarks ||
                                          Number(m.obtainedMarks) <= 0
                                        }
                                        title="Decrease by 0.5"
                                      >
                                        −
                                      </button>
                                      <input
                                        type="number"
                                        min="0"
                                        max={m.maxMarks || 100}
                                        step="0.5"
                                        value={m.obtainedMarks ?? ""}
                                        onChange={(e) =>
                                          handleMarkChange(
                                            subId,
                                            "obtainedMarks",
                                            e.target.value,
                                          )
                                        }
                                        placeholder="0.0"
                                        disabled={uploading}
                                        required
                                      />
                                      <button
                                        type="button"
                                        className="stepper-btn plus"
                                        onClick={() =>
                                          handleStepMark(
                                            subId,
                                            "obtainedMarks",
                                            0.5,
                                            parseFloat(m.maxMarks || 100),
                                          )
                                        }
                                        disabled={
                                          uploading ||
                                          Number(m.obtainedMarks || 0) >=
                                            Number(m.maxMarks || 100)
                                        }
                                        title="Increase by 0.5"
                                      >
                                        +
                                      </button>
                                    </div>
                                  </td>

                                  {/* GRADE */}
                                  <td className="td-grade">
                                    <input
                                      type="text"
                                      maxLength={10}
                                      value={m.grade ?? ""}
                                      onChange={(e) =>
                                        handleMarkChange(
                                          subId,
                                          "grade",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Auto"
                                      disabled={uploading}
                                    />
                                  </td>

                                  {/* REMARKS */}
                                  <td className="td-remarks">
                                    <input
                                      type="text"
                                      maxLength={100}
                                      value={m.remarks ?? ""}
                                      onChange={(e) =>
                                        handleMarkChange(
                                          subId,
                                          "remarks",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Optional remarks"
                                      disabled={uploading}
                                    />
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>

                          <tfoot>
                            <tr className="marks-total-row">
                              <td className="td-sub total-label-cell">
                                <strong>Grand Total</strong>
                              </td>
                              <td className="td-max total-val-cell">
                                <strong>{examinationTotals.totalMax}</strong>
                              </td>
                              <td className="td-obt total-val-cell highlight">
                                <strong className="text-total">
                                  {examinationTotals.totalObtained}
                                </strong>
                              </td>
                              <td className="td-grade total-val-cell">
                                {examinationTotals.overallGrade ? (
                                  <span className="total-grade-badge">
                                    {examinationTotals.overallGrade}
                                  </span>
                                ) : (
                                  "—"
                                )}
                              </td>
                              <td className="td-remarks total-status-cell">
                                {examinationTotals.enteredSubjectsCount > 0 && (
                                  <span
                                    className={`status-chip ${
                                      examinationTotals.isPassed
                                        ? "chip-pass"
                                        : "chip-fail"
                                    }`}
                                  >
                                    {examinationTotals.isPassed
                                      ? "✓ Pass"
                                      : "✕ Fail"}{" "}
                                    ({examinationTotals.percentage}%)
                                  </span>
                                )}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      )}
                    </div>
                  </>
                )}

                {/* CO-SCHOLASTIC QUALITIES EVALUATION TABLE (TRAITS, ATTITUDES & ACTIVITIES) */}
                {examMode === "annual" && (
                  <div className="co-scholastic-card">
                    <div className="co-scholastic-header">
                      <div className="co-scholastic-title">
                        <h5>
                          🌟 Co-Scholastic Qualities (Traits, Attitudes &amp;
                          Activities)
                        </h5>
                        <small>
                          Fill H.Y. and Annual examination grades for all 15
                          institutional evaluation parameters (these save and
                          print directly on the Annual Marksheet).
                        </small>
                      </div>
                      <div className="co-scholastic-quick-actions">
                        <span className="quick-fill-label">Quick Set:</span>
                        {["A+", "A", "B+", "B"].map((g) => (
                          <button
                            key={g}
                            type="button"
                            className="btn-quick-grade"
                            onClick={() => handleSetAllCoScholasticsGrade(g)}
                            title={`Set all co-scholastic grades to ${g}`}
                          >
                            All {g}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="co-scholastic-table-wrapper">
                      <table className="co-scholastic-table">
                        <thead>
                          <tr>
                            <th
                              colSpan="3"
                              className="co-head-category traits-head"
                            >
                              PERSONAL &amp; SOCIAL TRAITS
                            </th>
                            <th
                              colSpan="3"
                              className="co-head-category attitudes-head"
                            >
                              ATTITUDES &amp; VALUES
                            </th>
                            <th
                              colSpan="3"
                              className="co-head-category activities-head"
                            >
                              ACTIVITIES
                            </th>
                          </tr>
                          <tr className="co-sub-head-row">
                            <th className="co-col-item">TRAITS</th>
                            <th className="co-col-grade">HY</th>
                            <th className="co-col-grade">ANN</th>
                            <th className="co-col-item">ATTITUDE TOWARDS</th>
                            <th className="co-col-grade">HY</th>
                            <th className="co-col-grade">ANN</th>
                            <th className="co-col-item">
                              CO-CURRICULAR ACTIVITIES
                            </th>
                            <th className="co-col-grade">HY</th>
                            <th className="co-col-grade">ANN</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(
                            annualMeta.coScholastics ||
                            DEFAULT_CO_SCHOLASTIC_LIST
                          ).map((row, idx) => (
                            <tr key={idx}>
                              {/* 1. PERSONAL & SOCIAL TRAITS */}
                              <td className="co-label-cell">{row.trait}</td>
                              <td className="co-input-cell">
                                <input
                                  type="text"
                                  maxLength="3"
                                  value={row.hy || ""}
                                  onChange={(e) =>
                                    handleCoScholasticChange(
                                      idx,
                                      "hy",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="A"
                                />
                              </td>
                              <td className="co-input-cell">
                                <input
                                  type="text"
                                  maxLength="3"
                                  value={row.ann || ""}
                                  onChange={(e) =>
                                    handleCoScholasticChange(
                                      idx,
                                      "ann",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="A"
                                />
                              </td>

                              {/* 2. ATTITUDES & VALUES */}
                              <td className="co-label-cell">{row.attitude}</td>
                              <td className="co-input-cell">
                                <input
                                  type="text"
                                  maxLength="3"
                                  value={row.hyAtt || ""}
                                  onChange={(e) =>
                                    handleCoScholasticChange(
                                      idx,
                                      "hyAtt",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="A"
                                />
                              </td>
                              <td className="co-input-cell">
                                <input
                                  type="text"
                                  maxLength="3"
                                  value={row.annAtt || ""}
                                  onChange={(e) =>
                                    handleCoScholasticChange(
                                      idx,
                                      "annAtt",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="B+"
                                />
                              </td>

                              {/* 3. CO-CURRICULAR ACTIVITIES */}
                              <td className="co-label-cell">{row.activity}</td>
                              <td className="co-input-cell">
                                <input
                                  type="text"
                                  maxLength="3"
                                  value={row.hyAct || ""}
                                  onChange={(e) =>
                                    handleCoScholasticChange(
                                      idx,
                                      "hyAct",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="A"
                                />
                              </td>
                              <td className="co-input-cell">
                                <input
                                  type="text"
                                  maxLength="3"
                                  value={row.annAct || ""}
                                  onChange={(e) =>
                                    handleCoScholasticChange(
                                      idx,
                                      "annAct",
                                      e.target.value,
                                    )
                                  }
                                  placeholder="A"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ANNUAL EXAM EXTRA EVALUATION ATTENDANCE & REMARKS CARD */}
                {examMode === "annual" && (
                  <div className="annual-extra-card">
                    <div className="annual-extra-header">
                      <h5>📋 Institutional Evaluation & Remarks Details</h5>
                      <small>
                        Attendance fields can be left blank (they will auto-fill
                        from the upcoming Attendance module). Enter student
                        remarks and promotion status below.
                      </small>
                    </div>
                    <div className="annual-extra-grid">
                      <div className="annual-extra-field">
                        <label>
                          Attendance (H.Y.){" "}
                          <small
                            style={{ color: "#64748b", fontWeight: "normal" }}
                          >
                            (Auto-fills from Attendance module)
                          </small>
                        </label>
                        <input
                          type="text"
                          value={annualMeta.attendanceHY}
                          onChange={(e) =>
                            setAnnualMeta({
                              ...annualMeta,
                              attendanceHY: e.target.value,
                            })
                          }
                          placeholder="Leave blank (will auto-fill from Attendance)"
                        />
                      </div>
                      <div className="annual-extra-field">
                        <label>
                          Attendance (Annual){" "}
                          <small
                            style={{ color: "#64748b", fontWeight: "normal" }}
                          >
                            (Auto-fills from Attendance module)
                          </small>
                        </label>
                        <input
                          type="text"
                          value={annualMeta.attendanceAnn}
                          onChange={(e) =>
                            setAnnualMeta({
                              ...annualMeta,
                              attendanceAnn: e.target.value,
                            })
                          }
                          placeholder="Leave blank (will auto-fill from Attendance)"
                        />
                      </div>
                      <div className="annual-extra-field remarks-field">
                        <label>Class Teacher Remarks</label>
                        <input
                          type="text"
                          value={annualMeta.remarks}
                          onChange={(e) =>
                            setAnnualMeta({
                              ...annualMeta,
                              remarks: e.target.value,
                            })
                          }
                          placeholder="Enter remarks (e.g. Praiseworthy performance / Excellent / Good)"
                        />
                      </div>
                      <div className="annual-extra-field">
                        <label>Result / Promotion Status</label>
                        <input
                          type="text"
                          value={annualMeta.resultStatus}
                          onChange={(e) =>
                            setAnnualMeta({
                              ...annualMeta,
                              resultStatus: e.target.value,
                            })
                          }
                          placeholder="e.g. Passed, II-D / Promoted"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* =================================================
                    GRAND TOTAL SUMMARY SCORECARD (AFTER ENTERING MARKS)
                    ================================================= */}
                {examinationTotals.enteredSubjectsCount > 0 && (
                  <div className="upload-summary-card">
                    <div className="summary-card-top">
                      <div className="summary-card-heading">
                        <span className="summary-card-icon">📊</span>
                        <div>
                          <h4>Examination Marks Summary</h4>
                          <small>
                            {examinationTotals.isComplete
                              ? `All ${subjects.length} subjects evaluated`
                              : `${examinationTotals.enteredSubjectsCount} of ${subjects.length} subjects entered (in progress)`}
                          </small>
                        </div>
                      </div>

                      {examinationTotals.isComplete && (
                        <div
                          className={`summary-result-pill ${
                            examinationTotals.isPassed ? "passed" : "failed"
                          }`}
                        >
                          {examinationTotals.isPassed
                            ? "✓ RESULT: PASSED"
                            : "✕ RESULT: FAILED"}
                        </div>
                      )}
                    </div>

                    <div
                      className={`summary-stats-row ${
                        examMode === "annual" ? "annual-stats-row" : ""
                      }`}
                    >
                      <div className="summary-stat-item">
                        <span className="stat-name">Total Max Marks</span>
                        <span className="stat-number max-num">
                          {examinationTotals.totalMax}
                        </span>
                        <span className="stat-subtext">Sum of max marks</span>
                      </div>

                      {examMode === "annual" && (
                        <>
                          <div className="summary-stat-item">
                            <span className="stat-name">H.Y. Term Total</span>
                            <span className="stat-number int-num">
                              {examinationTotals.totalHY}
                            </span>
                            <span className="stat-subtext">
                              Out of {subjects.length * 50}
                            </span>
                          </div>

                          <div className="summary-stat-item">
                            <span className="stat-name">Annual Term Total</span>
                            <span className="stat-number ext-num">
                              {examinationTotals.totalAnn}
                            </span>
                            <span className="stat-subtext">
                              Out of {subjects.length * 50}
                            </span>
                          </div>
                        </>
                      )}

                      <div className="summary-stat-item highlight">
                        <span className="stat-name">Total Obtained Marks</span>
                        <span className="stat-number obt-num">
                          {examinationTotals.totalObtained}
                        </span>
                        <span className="stat-subtext">
                          {examMode === "annual"
                            ? `HY (${examinationTotals.totalHY}) + Ann (${examinationTotals.totalAnn})`
                            : "Total marks achieved"}
                        </span>
                      </div>

                      <div className="summary-stat-item">
                        <span className="stat-name">Overall Percentage</span>
                        <span className="stat-number pct-num">
                          {examinationTotals.isComplete
                            ? `${examinationTotals.percentage}%`
                            : `${examinationTotals.percentage}% (Partial)`}
                        </span>
                        <span className="stat-subtext">
                          Based on total obtained
                        </span>
                      </div>

                      <div className="summary-stat-item">
                        <span className="stat-name">Overall Grade</span>
                        <span className="stat-number grade-num">
                          {examinationTotals.overallGrade || "—"}
                        </span>
                        <span className="stat-subtext">Auto evaluation</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* =================================================
                  OFFICIAL MARKSHEET & CERTIFICATE (AUTO-GENERATED)
                  ================================================= */}
              <div className="upload-marksheet-card">
                <div className="marksheet-card-header">
                  <div className="marksheet-header-left">
                    <span className="marksheet-icon">📜</span>
                    <div>
                      <h4>Official Marksheet & Certificate (Auto-Generated)</h4>
                      <p className="marksheet-subtitle">
                        Institutional Marksheet issued by APNA SCHOOL PUBLIC
                        SCHOOL with verified student credentials, marks
                        breakdown, grand total, and authority signatures.
                      </p>
                    </div>
                  </div>
                  <div className="marksheet-header-badges">
                    <span
                      className={`badge-mode-pill ${examMode}`}
                      title="Active Exam Evaluation Mode"
                    >
                      {examMode === "annual"
                        ? "🏆 Annual Exam"
                        : examMode === "halfYearly"
                          ? "📘 Half Yearly Exam"
                          : "📝 Regular Exam"}
                    </span>
                    <span
                      className="badge-cert"
                      title="Auto-assigned Certificate Number"
                    >
                      Cert No: <strong>{certNo}</strong>
                    </span>
                    <span
                      className="badge-res"
                      title="Auto-assigned Result Number"
                    >
                      Result No: <strong>{resNo}</strong>
                    </span>
                  </div>
                </div>

                <div className="marksheet-summary-specs">
                  <div className="spec-row">
                    <div className="spec-item">
                      <span className="spec-label">Issuing Authority</span>
                      <span className="spec-value institution-name">
                        APNA SCHOOL PUBLIC SCHOOL
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Issue Date</span>
                      <span className="spec-value">
                        {formatMarksheetDate()}
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Candidate Name</span>
                      <span className="spec-value">
                        {getStudentFullName(selectedStudent)}
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Father's Name</span>
                      <span className="spec-value">
                        {selectedStudent?.FatherName ||
                          selectedStudent?.fatherName ||
                          "—"}
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Mother's Name</span>
                      <span className="spec-value">
                        {selectedStudent?.MotherName ||
                          selectedStudent?.motherName ||
                          "—"}
                      </span>
                    </div>
                    <div className="spec-item">
                      <span className="spec-label">Class & Section</span>
                      <span className="spec-value">
                        {getSelectedClassName()} - {getSelectedSectionName()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="marksheet-actions-bar">
                  <div className="marksheet-status-note">
                    <span className="status-dot green"></span>
                    <span>
                      PDF Marksheet is generated automatically upon clicking{" "}
                      <strong>"Upload Result"</strong>. No manual PDF upload
                      required.
                    </span>
                  </div>
                  <div className="marksheet-btn-group">
                    <button
                      type="button"
                      className="preview-marksheet-btn"
                      onClick={handlePreviewGeneratedPdf}
                      disabled={
                        uploading || generatingPdf || subjects.length === 0
                      }
                      title="Preview live generated Marksheet PDF in a new browser tab"
                    >
                      {generatingPdf
                        ? "Generating..."
                        : "👁 Review Marksheet PDF"}
                    </button>

                    <button
                      type="button"
                      className="download-marksheet-btn"
                      onClick={handleDownloadGeneratedPdf}
                      disabled={
                        uploading || generatingPdf || subjects.length === 0
                      }
                      title="Download generated Marksheet PDF document to your device"
                    >
                      📥 Download PDF
                    </button>
                  </div>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="upload-form-actions">
                <button
                  type="button"
                  className="upload-cancel-btn"
                  onClick={() => {
                    setViewMode("list");
                    setSelectedStudent(null);
                    setError("");
                  }}
                  disabled={uploading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="upload-submit-btn"
                  disabled={uploading || subjects.length === 0}
                >
                  {uploading ? "Uploading Result..." : "Upload Result"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* =================================================
          POPUP MODAL
          ================================================= */}
      {popup.isOpen && (
        <div className="upload-modal-overlay">
          <div className={`upload-modal-card ${popup.type}`}>
            <div className={`upload-modal-icon ${popup.type}`}>
              {popup.type === "success" ? "✓" : "✕"}
            </div>
            <h3>{popup.title}</h3>
            <p>{popup.message}</p>
            <button
              type="button"
              className="upload-modal-btn"
              onClick={() => setPopup({ ...popup, isOpen: false })}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadStudentResult;
