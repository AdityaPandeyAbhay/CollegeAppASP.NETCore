// =====================================================
// ATTENDANCE REGISTER & PROGRESSION MATRIX
// (Excel-Style Sheet with Academic Year, Department, Class, Section & Month Filters)
// =====================================================

import React, { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAllClassTeachersWithDetails,
  getMyClassTeacherAssignment,
  getHalfYearlyCutoffDate,
  setHalfYearlyCutoffDate,
  resetHalfYearlyCutoffDate,
  getAnnualCutoffDate,
  setAnnualCutoffDate,
  resetAnnualCutoffDate,
  getDayDeclarations,
  setDayDeclaration,
  removeDayDeclaration,
  resetAllDayDeclarations,
  getSectionClassId,
} from "../../Services/classTeacherService";
import { getAllAttendance } from "../../Services/attendanceService";
import {
  getAllStudentsWithDetails,
  getAllStudents,
  isStudentSoftDeleted,
} from "../../Services/studentService";
import { getAllDepartment } from "../../Services/departmentService";
import { getAllClasses } from "../../Services/classService";
import { getAllSections } from "../../Services/sectionService";
import { getAllAcademicYear } from "../../Services/academicYearService";
import { getRole } from "../../Utils/auth";
import "./AttendanceRegister.css";

// Academic Year starts in April and ends in March
const ACADEMIC_MONTHS = [
  { monthNum: 4, name: "April" },
  { monthNum: 5, name: "May" },
  { monthNum: 6, name: "June" },
  { monthNum: 7, name: "July" },
  { monthNum: 8, name: "August" },
  { monthNum: 9, name: "September" },
  { monthNum: 10, name: "October" },
  { monthNum: 11, name: "November" },
  { monthNum: 12, name: "December" },
  { monthNum: 1, name: "January" },
  { monthNum: 2, name: "February" },
  { monthNum: 3, name: "March" },
];

const WEEKDAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Helper to parse academic year start & end years from name e.g. "2025-2026"
const getAcademicYearSpan = (yearName) => {
  if (!yearName) {
    const cy = new Date().getFullYear();
    return { startYear: cy, endYear: cy + 1 };
  }
  const parts = String(yearName).match(/\d{4}/g);
  if (parts && parts.length >= 2) {
    return {
      startYear: parseInt(parts[0], 10),
      endYear: parseInt(parts[1], 10),
    };
  } else if (parts && parts.length === 1) {
    const y = parseInt(parts[0], 10);
    return { startYear: y, endYear: y + 1 };
  }
  const cy = new Date().getFullYear();
  return { startYear: cy, endYear: cy + 1 };
};

// Helper: For Apr-Dec -> startYear, For Jan-Mar -> endYear
const resolveDefaultYearForMonth = (monthNum, yearName) => {
  const { startYear, endYear } = getAcademicYearSpan(yearName);
  if (monthNum >= 4 && monthNum <= 12) {
    return startYear;
  }
  return endYear; // Jan, Feb, Mar
};

function AttendanceRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const paramClassId = queryParams.get("classId");
  const paramSectionId = queryParams.get("sectionId");

  const role = (getRole() || "").toLowerCase();
  const isTeacher = role === "teacher";
  const isOperator = role === "operator";
  const canTakeAttendance =
    (role === "super admin" ||
      role === "superadmin" ||
      role === "admin" ||
      role === "teacher") &&
    !isOperator;
  const canConfigureSettings =
    role === "super admin" || role === "superadmin" || role === "admin";
  const canAdmin =
    role === "super admin" ||
    role === "superadmin" ||
    role === "admin" ||
    role === "operator" ||
    role === "office employee" ||
    role === "officeemployee" ||
    role === "officestaff" ||
    role === "office staff";

  // Filter States
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");

  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const [allClassesList, setAllClassesList] = useState([]);
  const [allSectionsList, setAllSectionsList] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState(paramClassId || "");
  const [selectedSectionId, setSelectedSectionId] = useState(
    paramSectionId || "",
  );

  const [classTeacherInfo, setClassTeacherInfo] = useState(null);

  // Month & Year Filter (Default to current month & calculated year)
  const currentMonthNum = new Date().getMonth() + 1; // 1-12
  const [selectedMonth, setSelectedMonth] = useState(currentMonthNum);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Dynamic Exam Cutoff Dates & Special Day Declarations (BLANK by default)
  const [halfYearlyCutoff, setHyCutoff] = useState("");
  const [annualCutoff, setAnnCutoff] = useState("");
  const [dayDeclarations, setDayDeclarations] = useState({});

  // Bottom Accordion state for Exam & Holiday container
  const [bottomSettingsOpen, setBottomSettingsOpen] = useState(false);

  // Modals for Super Admin / Admin
  const [examModalOpen, setExamModalOpen] = useState(false);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [modalHyInput, setModalHyInput] = useState("");
  const [modalAnnInput, setModalAnnInput] = useState("");
  const [holidayDateInput, setHolidayDateInput] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [holidayTypeInput, setHolidayTypeInput] = useState("Holiday"); // "Holiday" | "Exam"
  const [holidayRemarkInput, setHolidayRemarkInput] = useState("");

  // Data States
  const [allStudentsRaw, setAllStudentsRaw] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchStudent, setSearchStudent] = useState("");
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3500);
  };

  // Find active academic year name for calculations
  const currentAcademicYearObj = useMemo(() => {
    return (
      academicYears.find(
        (y) => String(y.id ?? y.Id) === String(selectedAcademicYearId),
      ) || null
    );
  }, [academicYears, selectedAcademicYearId]);

  const currentAcademicYearName =
    currentAcademicYearObj?.yearName ?? currentAcademicYearObj?.YearName ?? "";

  // =====================================================
  // 1. INITIAL LOAD: ACADEMIC YEARS, DEPARTMENTS, CLASSES, SECTIONS
  // =====================================================
  useEffect(() => {
    const initData = async () => {
      try {
        setLoading(true);
        setError("");

        const [yRes, dRes, cRes, sRes] = await Promise.allSettled([
          getAllAcademicYear(),
          getAllDepartment(),
          getAllClasses(),
          getAllSections(),
        ]);

        const yArr =
          yRes.status === "fulfilled" && Array.isArray(yRes.value)
            ? yRes.value
            : yRes.value?.data || [];
        const dArr =
          dRes.status === "fulfilled" && Array.isArray(dRes.value)
            ? dRes.value
            : dRes.value?.data || [];
        const cArr =
          cRes.status === "fulfilled" && Array.isArray(cRes.value)
            ? cRes.value
            : cRes.value?.data || [];
        const sArr =
          sRes.status === "fulfilled" && Array.isArray(sRes.value)
            ? sRes.value
            : sRes.value?.data || [];

        setAcademicYears(yArr);
        setDepartments(dArr);
        setAllClassesList(cArr);
        setAllSectionsList(sArr);

        // Select Current Academic Year
        const currentYear = yArr.find((y) => y.isCurrent ?? y.IsCurrent);
        const resolvedYearId = currentYear
          ? String(currentYear.id ?? currentYear.Id)
          : yArr.length > 0
            ? String(yArr[0].id ?? yArr[0].Id)
            : "";
        setSelectedAcademicYearId(resolvedYearId);

        const activeYearName =
          currentYear?.yearName ?? currentYear?.YearName ?? "";
        const autoYear = resolveDefaultYearForMonth(
          currentMonthNum,
          activeYearName,
        );
        setSelectedYear(autoYear);

        // If teacher, check Class Teacher Assignment
        if (isTeacher) {
          const myCT = await getMyClassTeacherAssignment().catch(() => null);
          if (myCT && myCT.isClassTeacher) {
            setSelectedClassId(String(myCT.classId));
            setSelectedSectionId(String(myCT.sectionId));
            setClassTeacherInfo(myCT);

            // Find matching class to set department
            const matchedCls = cArr.find(
              (c) => String(c.id ?? c.Id) === String(myCT.classId),
            );
            if (matchedCls) {
              const deptId =
                matchedCls.departmentId ??
                matchedCls.DepartmentId ??
                matchedCls.department?.id;
              if (deptId) setSelectedDepartmentId(String(deptId));
            }
          } else if (paramClassId && paramSectionId) {
            setSelectedClassId(paramClassId);
            setSelectedSectionId(paramSectionId);
            const matchedCls = cArr.find(
              (c) => String(c.id ?? c.Id) === String(paramClassId),
            );
            if (matchedCls) {
              const deptId =
                matchedCls.departmentId ??
                matchedCls.DepartmentId ??
                matchedCls.department?.id;
              if (deptId) setSelectedDepartmentId(String(deptId));
            }
          }
        } else {
          // Super Admin / Admin / Operator default selection
          if (paramClassId) {
            setSelectedClassId(String(paramClassId));
            const matchedCls = cArr.find(
              (c) => String(c.id ?? c.Id) === String(paramClassId),
            );
            if (matchedCls) {
              const deptId =
                matchedCls.departmentId ??
                matchedCls.DepartmentId ??
                matchedCls.department?.id;
              if (deptId) setSelectedDepartmentId(String(deptId));
            }
            if (paramSectionId) {
              setSelectedSectionId(String(paramSectionId));
            } else {
              const clsSections = sArr.filter(
                (s) => String(getSectionClassId(s)) === String(paramClassId),
              );
              if (clsSections.length > 0) {
                setSelectedSectionId(
                  String(clsSections[0].id ?? clsSections[0].Id),
                );
              }
            }
          } else if (cArr.length > 0) {
            const firstCls = cArr[0];
            const firstClsId = String(firstCls.id ?? firstCls.Id);
            const deptId =
              firstCls.departmentId ??
              firstCls.DepartmentId ??
              firstCls.department?.id;
            if (deptId) setSelectedDepartmentId(String(deptId));
            setSelectedClassId(firstClsId);

            const clsSections = sArr.filter(
              (s) => String(getSectionClassId(s)) === firstClsId,
            );
            if (clsSections.length > 0) {
              setSelectedSectionId(
                String(clsSections[0].id ?? clsSections[0].Id),
              );
            }
          }
        }
      } catch (err) {
        console.error("Failed to initialize attendance register:", err);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, [isTeacher]);

  // =====================================================
  // 2. AUTO-SELECT YEAR WHEN MONTH OR ACADEMIC YEAR CHANGES
  // =====================================================
  const handleAcademicYearChange = (yearId) => {
    setSelectedAcademicYearId(yearId);
    const yrObj = academicYears.find(
      (y) => String(y.id ?? y.Id) === String(yearId),
    );
    const yrName = yrObj?.yearName ?? yrObj?.YearName ?? "";
    const autoYear = resolveDefaultYearForMonth(selectedMonth, yrName);
    setSelectedYear(autoYear);
  };

  const handleMonthChange = (monthNum) => {
    setSelectedMonth(monthNum);
    const autoYear = resolveDefaultYearForMonth(
      monthNum,
      currentAcademicYearName,
    );
    setSelectedYear(autoYear);
  };

  // =====================================================
  // 3. FILTERED CLASSES & SECTIONS BASED ON DEPT & CLASS
  // =====================================================
  const availableClasses = useMemo(() => {
    if (!selectedDepartmentId) return allClassesList;
    return allClassesList.filter((c) => {
      const dId = c.departmentId ?? c.DepartmentId ?? c.department?.id;
      return String(dId) === String(selectedDepartmentId);
    });
  }, [allClassesList, selectedDepartmentId]);

  const availableSections = useMemo(() => {
    if (!selectedClassId) return allSectionsList;
    return allSectionsList.filter((s) => {
      const cId = getSectionClassId(s);
      return String(cId) === String(selectedClassId);
    });
  }, [allSectionsList, selectedClassId]);

  // Handle Department Change
  const handleDepartmentChange = (deptId) => {
    setSelectedDepartmentId(deptId);
    if (!deptId) {
      // "All Departments" selected - keep current class if valid or select first class
      if (allClassesList.length > 0) {
        const stillValid = allClassesList.some(
          (c) => String(c.id ?? c.Id) === String(selectedClassId),
        );
        if (!stillValid) {
          const firstClsId = String(
            allClassesList[0].id ?? allClassesList[0].Id,
          );
          setSelectedClassId(firstClsId);
          const clsSections = allSectionsList.filter(
            (s) => String(getSectionClassId(s)) === firstClsId,
          );
          setSelectedSectionId(
            clsSections.length > 0
              ? String(clsSections[0].id ?? clsSections[0].Id)
              : "",
          );
        }
      }
      return;
    }
    const matchingClasses = allClassesList.filter((c) => {
      const dId = c.departmentId ?? c.DepartmentId ?? c.department?.id;
      return String(dId) === String(deptId);
    });

    if (matchingClasses.length > 0) {
      const newClassId = String(matchingClasses[0].id ?? matchingClasses[0].Id);
      setSelectedClassId(newClassId);

      const matchingSections = allSectionsList.filter(
        (s) => String(getSectionClassId(s)) === newClassId,
      );
      if (matchingSections.length > 0) {
        setSelectedSectionId(
          String(matchingSections[0].id ?? matchingSections[0].Id),
        );
      } else {
        setSelectedSectionId("");
      }
    } else {
      setSelectedClassId("");
      setSelectedSectionId("");
    }
  };

  // Handle Class Change
  const handleClassChange = (classId) => {
    setSelectedClassId(classId);

    // Automatically synchronize selectedDepartmentId to this class's department
    if (classId) {
      const matchedCls = allClassesList.find(
        (c) => String(c.id ?? c.Id) === String(classId),
      );
      if (matchedCls) {
        const dId =
          matchedCls.departmentId ??
          matchedCls.DepartmentId ??
          matchedCls.department?.id;
        if (dId) setSelectedDepartmentId(String(dId));
      }

      const matchingSections = allSectionsList.filter(
        (s) => String(getSectionClassId(s)) === String(classId),
      );
      if (matchingSections.length > 0) {
        setSelectedSectionId(
          String(matchingSections[0].id ?? matchingSections[0].Id),
        );
      } else {
        setSelectedSectionId("");
      }
    } else {
      setSelectedSectionId("");
    }
  };

  // =====================================================
  // 4. LOAD CUTOFF DATES & DAY DECLARATIONS (DEFAULT BLANK)
  // =====================================================
  useEffect(() => {
    if (selectedClassId && selectedSectionId) {
      const savedHy = getHalfYearlyCutoffDate(
        selectedClassId,
        selectedSectionId,
        selectedAcademicYearId,
      );
      const savedAnn = getAnnualCutoffDate(
        selectedClassId,
        selectedSectionId,
        selectedAcademicYearId,
      );
      const savedDecls = getDayDeclarations(
        selectedClassId,
        selectedSectionId,
        selectedAcademicYearId,
      );

      setHyCutoff(savedHy || "");
      setAnnCutoff(savedAnn || "");
      setModalHyInput(savedHy || "");
      setModalAnnInput(savedAnn || "");
      setDayDeclarations(savedDecls || {});
    }
  }, [selectedClassId, selectedSectionId, selectedAcademicYearId]);

  // Save Exam Cutoffs
  const handleSaveExamCutoffs = () => {
    setHalfYearlyCutoffDate(
      modalHyInput,
      selectedClassId,
      selectedSectionId,
      selectedAcademicYearId,
    );
    setAnnualCutoffDate(
      modalAnnInput,
      selectedClassId,
      selectedSectionId,
      selectedAcademicYearId,
    );
    setHyCutoff(modalHyInput);
    setAnnCutoff(modalAnnInput);
    setExamModalOpen(false);
    showToast("Exam Cutoff Dates updated successfully!");
  };

  // Save Day Declaration (Holiday / Exam)
  const handleSaveDayDeclaration = () => {
    if (!holidayDateInput) {
      alert("Please select a date.");
      return;
    }
    setDayDeclaration(
      holidayDateInput,
      holidayTypeInput,
      holidayRemarkInput ||
        (holidayTypeInput === "Holiday"
          ? "Declared Holiday"
          : "Examination Day"),
      selectedClassId,
      selectedSectionId,
      selectedAcademicYearId,
    );
    const updated = getDayDeclarations(
      selectedClassId,
      selectedSectionId,
      selectedAcademicYearId,
    );
    setDayDeclarations(updated);
    setHolidayModalOpen(false);
    setHolidayRemarkInput("");
    showToast(
      `${holidayTypeInput} for ${holidayDateInput} registered successfully!`,
    );
  };

  // Remove Day Declaration
  const handleRemoveDayDeclaration = (dStr) => {
    removeDayDeclaration(
      dStr,
      selectedClassId,
      selectedSectionId,
      selectedAcademicYearId,
    );
    const updated = getDayDeclarations(
      selectedClassId,
      selectedSectionId,
      selectedAcademicYearId,
    );
    setDayDeclarations(updated);
    showToast(`Declaration removed for ${dStr}`);
  };

  // Reset Half-Yearly Cutoff (Admin / Super Admin)
  const handleResetHalfYearlyCutoff = () => {
    if (
      !window.confirm(
        "Are you sure you want to reset the Half-Yearly cutoff date back to default (Blank)?",
      )
    ) {
      return;
    }
    resetHalfYearlyCutoffDate(
      selectedClassId,
      selectedSectionId,
      selectedAcademicYearId,
    );
    setHyCutoff("");
    setModalHyInput("");
    showToast("Half-Yearly cutoff date reset to default (Blank).");
  };

  // Reset Annual Cutoff (Admin / Super Admin)
  const handleResetAnnualCutoff = () => {
    if (
      !window.confirm(
        "Are you sure you want to reset the Annual cutoff date back to default (Blank)?",
      )
    ) {
      return;
    }
    resetAnnualCutoffDate(
      selectedClassId,
      selectedSectionId,
      selectedAcademicYearId,
    );
    setAnnCutoff("");
    setModalAnnInput("");
    showToast("Annual cutoff date reset to default (Blank).");
  };

  // Reset All Special Day Declarations (Admin / Super Admin)
  const handleResetAllDayDeclarations = () => {
    if (
      !window.confirm(
        "Are you sure you want to reset all declared holidays and exam days for this class and year?",
      )
    ) {
      return;
    }
    resetAllDayDeclarations(
      selectedClassId,
      selectedSectionId,
      selectedAcademicYearId,
    );
    setDayDeclarations({});
    showToast("All special holiday and exam day declarations have been reset.");
  };

  // =====================================================
  // 5. FETCH STUDENTS & ATTENDANCE DATA (ROBUST & GRACEFUL)
  // =====================================================
  useEffect(() => {
    if (!selectedClassId || !selectedSectionId) {
      setStudents([]);
      setAttendanceData([]);
      return;
    }

    const fetchRegisterData = async () => {
      try {
        setLoading(true);
        setError("");

        let rawStudentsList = allStudentsRaw;
        if (rawStudentsList.length === 0) {
          try {
            rawStudentsList = await getAllStudentsWithDetails(true);
          } catch {
            rawStudentsList = await getAllStudents(true).catch(() => []);
          }
          setAllStudentsRaw(
            Array.isArray(rawStudentsList) ? rawStudentsList : [],
          );
        }

        const [allAttRes, ctDetailsRes] = await Promise.allSettled([
          getAllAttendance(),
          getAllClassTeachersWithDetails(),
        ]);

        const rawAttendance =
          allAttRes.status === "fulfilled" && Array.isArray(allAttRes.value)
            ? allAttRes.value
            : allAttRes.value?.data || [];

        const ctDetailsList =
          ctDetailsRes.status === "fulfilled" &&
          Array.isArray(ctDetailsRes.value)
            ? ctDetailsRes.value
            : ctDetailsRes.value?.data || [];

        const matchedCT = ctDetailsList.find(
          (item) =>
            String(item.classId) === String(selectedClassId) &&
            String(item.sectionId) === String(selectedSectionId),
        );
        setClassTeacherInfo(matchedCT);

        const rawStudents = Array.isArray(rawStudentsList)
          ? rawStudentsList
          : [];

        // Match student records considering Academic Year History if available
        const filtered = rawStudents
          .filter((s) => !isStudentSoftDeleted(s))
          .map((s) => {
            const history =
              s.AcademicHistory ||
              s.academicHistory ||
              s.StudentAcademicYears ||
              s.studentAcademicYears;

            if (
              Array.isArray(history) &&
              history.length > 0 &&
              selectedAcademicYearId
            ) {
              const matchedHist = history.find(
                (h) =>
                  String(h.AcademicYearId ?? h.academicYearId) ===
                  String(selectedAcademicYearId),
              );
              if (matchedHist) {
                const sClsId =
                  matchedHist.SchoolClassId ??
                  matchedHist.schoolClassId ??
                  s.SchoolClassId ??
                  s.schoolClassId;
                const sSecId =
                  matchedHist.SectionId ??
                  matchedHist.sectionId ??
                  s.SectionId ??
                  s.sectionId;
                const sDeptId =
                  matchedHist.DepartmentId ??
                  matchedHist.departmentId ??
                  s.DepartmentId ??
                  s.departmentId;
                const sRoll =
                  matchedHist.RollNumber ??
                  matchedHist.rollNumber ??
                  s.RollNumber ??
                  s.rollNumber;

                return {
                  ...s,
                  SchoolClassId: sClsId,
                  schoolClassId: sClsId,
                  ClassId: sClsId,
                  classId: sClsId,
                  SectionId: sSecId,
                  sectionId: sSecId,
                  DepartmentId: sDeptId,
                  departmentId: sDeptId,
                  RollNumber: sRoll,
                  rollNumber: sRoll,
                };
              }
            }
            return s;
          })
          .filter((s) => {
            const cId =
              s.SchoolClassId ?? s.schoolClassId ?? s.ClassId ?? s.classId;
            const sId = s.SectionId ?? s.sectionId;

            const matchesClass = String(cId) === String(selectedClassId);
            const matchesSection = String(sId) === String(selectedSectionId);

            return matchesClass && matchesSection;
          })
          .sort((a, b) => {
            const rollA = parseInt(
              a.RollNumber || a.rollNumber || a.RollNo || a.rollNo || 0,
              10,
            );
            const rollB = parseInt(
              b.RollNumber || b.rollNumber || b.RollNo || b.rollNo || 0,
              10,
            );
            return rollA - rollB;
          });

        setStudents(filtered);

        const studentIdSet = new Set(filtered.map((s) => String(s.id ?? s.Id)));

        // Filter attendance data for this class and section
        const classAttendance = rawAttendance.filter((att) => {
          const cId =
            att.schoolClassId ??
            att.SchoolClassId ??
            att.teacherAssignment?.schoolClassId ??
            att.teacherAssignment?.SchoolClassId;
          const sId =
            att.sectionId ??
            att.SectionId ??
            att.teacherAssignment?.sectionId ??
            att.teacherAssignment?.SectionId;
          const taId = att.teacherAssignmentId ?? att.TeacherAssignmentId;

          // 1. Direct class & section match
          if (
            cId &&
            sId &&
            String(cId) === String(selectedClassId) &&
            String(sId) === String(selectedSectionId)
          ) {
            return true;
          }

          // 2. Class teacher match
          if (
            matchedCT?.teacherAssignmentId &&
            String(taId) === String(matchedCT.teacherAssignmentId)
          ) {
            return true;
          }

          // 3. Student membership match (if attendance contains any student of this class roster)
          const details =
            att.students ||
            att.Students ||
            att.attendanceDetails ||
            att.AttendanceDetails ||
            [];
          if (
            Array.isArray(details) &&
            details.some((d) =>
              studentIdSet.has(String(d.studentId ?? d.StudentId)),
            )
          ) {
            return true;
          }

          return false;
        });

        setAttendanceData(classAttendance);
      } catch (err) {
        console.warn("Notice while loading attendance data:", err);
        setAttendanceData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRegisterData();
  }, [
    selectedClassId,
    selectedSectionId,
    selectedDepartmentId,
    selectedAcademicYearId,
  ]);

  // Days in selected month
  const daysInMonth = useMemo(() => {
    return new Date(selectedYear, selectedMonth, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Fast map: dateString -> { studentId -> status }
  const attendanceDateMap = useMemo(() => {
    const map = {};
    attendanceData.forEach((att) => {
      const rawDate = att.attendanceDate || att.AttendanceDate;
      if (!rawDate) return;
      const dateStr = String(rawDate).split("T")[0];

      if (!map[dateStr]) map[dateStr] = {};

      const details =
        att.students ||
        att.Students ||
        att.attendanceDetails ||
        att.AttendanceDetails ||
        [];
      details.forEach((d) => {
        const sId = String(d.studentId ?? d.StudentId);
        const st = d.attendanceStatus ?? d.AttendanceStatus ?? "Present";
        map[dateStr][sId] = st;
      });
    });
    return map;
  }, [attendanceData]);

  // Filter students by search input
  const filteredStudents = useMemo(() => {
    if (!searchStudent.trim()) return students;
    const query = searchStudent.toLowerCase().trim();
    return students.filter((s) => {
      const name =
        [
          s.firstName || s.FirstName,
          s.middleName || s.MiddleName,
          s.lastName || s.LastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        s.studentName ||
        s.name ||
        s.StudentName ||
        "";
      const roll = String(
        s.rollNumber || s.RollNumber || s.rollNo || s.RollNo || "",
      );
      const adm = String(
        s.admissionNumber ||
          s.AdmissionNumber ||
          s.admissionNo ||
          s.AdmissionNo ||
          "",
      ).toLowerCase();
      const father = String(s.fatherName || s.FatherName || "").toLowerCase();

      return (
        name.toLowerCase().includes(query) ||
        roll.toLowerCase().includes(query) ||
        adm.includes(query) ||
        father.includes(query)
      );
    });
  }, [students, searchStudent]);

  // Helper: check day meta (Sunday, Holiday, Exam)
  const getDayMeta = (year, month, dayNum) => {
    const dStr = `${year}-${String(month).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
    const dateObj = new Date(year, month - 1, dayNum);
    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
    const weekdayName = WEEKDAY_NAMES[dayOfWeek];
    const isSunday = dayOfWeek === 0;

    const decl = dayDeclarations[dStr];
    const isHoliday = isSunday || decl?.type === "Holiday";
    const isExam = decl?.type === "Exam";
    const holidayRemark = isSunday ? "Sunday" : decl?.remark || "Holiday";
    const examRemark = decl?.remark || "Exam Day";
    const isRecorded = Boolean(
      attendanceDateMap[dStr] &&
      Object.keys(attendanceDateMap[dStr]).length > 0,
    );

    return {
      dStr,
      weekdayName,
      isSunday,
      isHoliday,
      isExam,
      holidayRemark,
      examRemark,
      isRecorded,
    };
  };

  // Helper: Student Initials for Avatar Circle (e.g. Aditi Yadav -> AY)
  const getStudentInitials = (nameStr) => {
    if (!nameStr || typeof nameStr !== "string") return "ST";
    const parts = nameStr.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "ST";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Helper: Heatmap day cell badge mapping
  const getHeatmapDayBadge = (dayNum, meta, status) => {
    if (meta.isHoliday || meta.isSunday) {
      return {
        className: "heatmap-day-badge off",
        label: dayNum,
        title: `Day ${dayNum} (${meta.weekdayName}) - ${meta.holidayRemark || "Weekly Off"}`,
      };
    }
    if (meta.isExam) {
      const isExA = status === "Absent" || status === "Exam-A";
      return {
        className: isExA ? "heatmap-day-badge exam-a" : "heatmap-day-badge exam-p",
        label: dayNum,
        title: `Day ${dayNum} (${meta.weekdayName}) - Exam ${isExA ? "Absent" : "Present"}: ${meta.examRemark || ""}`,
      };
    }
    if (status === "Present") {
      return {
        className: "heatmap-day-badge present",
        label: dayNum,
        title: `Day ${dayNum} (${meta.weekdayName}): Present`,
      };
    }
    if (status === "Absent") {
      return {
        className: "heatmap-day-badge absent",
        label: dayNum,
        title: `Day ${dayNum} (${meta.weekdayName}): Absent`,
      };
    }
    if (status === "Leave") {
      return {
        className: "heatmap-day-badge leave",
        label: dayNum,
        title: `Day ${dayNum} (${meta.weekdayName}): Leave`,
      };
    }
    if (status === "HalfDay") {
      return {
        className: "heatmap-day-badge halfday",
        label: dayNum,
        title: `Day ${dayNum} (${meta.weekdayName}): Half Day`,
      };
    }
    return {
      className: "heatmap-day-badge unmarked",
      label: dayNum,
      title: `Day ${dayNum} (${meta.weekdayName}): Not Recorded`,
    };
  };

  // Total days class was conducted / attendance recorded in selected month (excluding declared holidays)
  const totalDaysClassRunInMonth = useMemo(() => {
    let count = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const meta = getDayMeta(selectedYear, selectedMonth, d);
      if (meta.isRecorded && !meta.isHoliday) {
        count++;
      }
    }
    return count;
  }, [
    daysInMonth,
    selectedYear,
    selectedMonth,
    dayDeclarations,
    attendanceDateMap,
  ]);

  // Student Month Statistics (Total Present, Total Absent, Total Days Class Run)
  const getStudentMonthStats = (studentId) => {
    const sIdStr = String(studentId);
    let presentDays = 0;
    let absentDays = 0;
    let leaveDays = 0;
    let halfDays = 0;

    for (let d = 1; d <= daysInMonth; d++) {
      const meta = getDayMeta(selectedYear, selectedMonth, d);
      const status = attendanceDateMap[meta.dStr]?.[sIdStr];

      if (meta.isHoliday) {
        continue;
      } else if (meta.isExam) {
        if (status === "Present" || status === "Exam-P" || status === "EX") {
          presentDays++;
        } else if (status === "Absent" || status === "Exam-A") {
          absentDays++;
        }
      } else {
        if (status === "Present") presentDays++;
        else if (status === "HalfDay") {
          halfDays++;
          presentDays += 0.5;
        } else if (status === "Leave") leaveDays++;
        else if (status === "Absent") absentDays++;
      }
    }

    return {
      presentDays,
      absentDays,
      leaveDays,
      halfDays,
      classRunDays: totalDaysClassRunInMonth,
    };
  };

  // Half-Yearly (HY) Total Present & Working Days
  const getStudentHalfYearlyRatio = (studentId) => {
    const sIdStr = String(studentId);
    const hyTime = halfYearlyCutoff
      ? new Date(halfYearlyCutoff).getTime()
      : null;
    let presentCount = 0;
    let workingDaysCount = 0;

    Object.entries(attendanceDateMap).forEach(([dateStr, stMap]) => {
      const targetTime = new Date(dateStr).getTime();
      if (!hyTime || targetTime <= hyTime) {
        const decl = dayDeclarations[dateStr];
        if (decl?.type === "Holiday") return;

        workingDaysCount++;
        const status = stMap[sIdStr];
        if (status === "Present" || status === "Exam-P" || status === "EX") {
          presentCount++;
        } else if (status === "HalfDay") {
          presentCount += 0.5;
        }
      }
    });

    const displayWorking =
      workingDaysCount > 0 ? workingDaysCount : totalDaysClassRunInMonth;
    return {
      present: presentCount,
      totalWorking: displayWorking,
      ratioText: `${presentCount} / ${displayWorking}`,
      pct:
        displayWorking > 0
          ? ((presentCount / displayWorking) * 100).toFixed(1)
          : "0.0",
    };
  };

  // Annual Total Present & Working Days
  const getStudentAnnualRatio = (studentId) => {
    const sIdStr = String(studentId);
    const annTime = annualCutoff ? new Date(annualCutoff).getTime() : null;
    let presentCount = 0;
    let workingDaysCount = 0;

    Object.entries(attendanceDateMap).forEach(([dateStr, stMap]) => {
      const targetTime = new Date(dateStr).getTime();
      if (!annTime || targetTime <= annTime) {
        const decl = dayDeclarations[dateStr];
        if (decl?.type === "Holiday") return;

        workingDaysCount++;
        const status = stMap[sIdStr];
        if (status === "Present" || status === "Exam-P" || status === "EX") {
          presentCount++;
        } else if (status === "HalfDay") {
          presentCount += 0.5;
        }
      }
    });

    const displayWorking =
      workingDaysCount > 0 ? workingDaysCount : totalDaysClassRunInMonth;
    return {
      present: presentCount,
      totalWorking: displayWorking,
      ratioText: `${presentCount} / ${displayWorking}`,
      pct:
        displayWorking > 0
          ? ((presentCount / displayWorking) * 100).toFixed(1)
          : "0.0",
    };
  };

  // Daily Summary Footer Row (Day 1..daysInMonth)
  const dailySummary = useMemo(() => {
    const res = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const meta = getDayMeta(selectedYear, selectedMonth, d);
      let dayPresent = 0;
      let dayAbsent = 0;
      let dayLeave = 0;
      let dayHalfDay = 0;

      students.forEach((st) => {
        const stId = String(st.id ?? st.Id);
        const status = attendanceDateMap[meta.dStr]?.[stId];
        if (status === "Present" || status === "Exam-P" || status === "EX") {
          dayPresent++;
        } else if (status === "Absent" || status === "Exam-A") {
          dayAbsent++;
        } else if (status === "Leave") {
          dayLeave++;
        } else if (status === "HalfDay") {
          dayHalfDay++;
          dayPresent += 0.5;
        }
      });

      res.push({
        dayNum: d,
        weekdayName: meta.weekdayName,
        dateStr: meta.dStr,
        isHoliday: meta.isHoliday,
        isExam: meta.isExam,
        holidayRemark: meta.holidayRemark,
        examRemark: meta.examRemark,
        isRecorded: meta.isRecorded,
        present: dayPresent,
        absent: dayAbsent,
        leave: dayLeave,
        totalStudents: students.length,
      });
    }
    return res;
  }, [
    daysInMonth,
    selectedYear,
    selectedMonth,
    students,
    attendanceDateMap,
    dayDeclarations,
  ]);

  // Names for display
  const currentDeptName =
    departments.find(
      (d) => String(d.id ?? d.Id) === String(selectedDepartmentId),
    )?.departmentName ??
    departments.find(
      (d) => String(d.id ?? d.Id) === String(selectedDepartmentId),
    )?.DepartmentName ??
    "All Departments";

  const currentClassName =
    allClassesList.find((c) => String(c.id ?? c.Id) === String(selectedClassId))
      ?.className ??
    allClassesList.find((c) => String(c.id ?? c.Id) === String(selectedClassId))
      ?.ClassName ??
    `Class ${selectedClassId || "-"}`;

  const currentSectionName =
    allSectionsList.find(
      (s) => String(s.id ?? s.Id) === String(selectedSectionId),
    )?.sectionName ??
    allSectionsList.find(
      (s) => String(s.id ?? s.Id) === String(selectedSectionId),
    )?.SectionName ??
    `Section ${selectedSectionId || "-"}`;

  const selectedMonthObj = ACADEMIC_MONTHS.find(
    (m) => m.monthNum === selectedMonth,
  ) || {
    name: "Month",
  };

  // =====================================================
  // 6. EXPORT TO EXCEL FEATURE
  // =====================================================
  const handleExportExcel = () => {
    if (filteredStudents.length === 0) {
      alert("No student attendance data available to export.");
      return;
    }

    const monthName = selectedMonthObj.name;
    let html = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="utf-8" />
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Attendance Register</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Calibri, Arial, sans-serif; }
          th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: center; font-size: 11pt; }
          th { background-color: #f1f5f9; font-weight: bold; color: #0f172a; }
          .header-title { background-color: #1e3a8a; color: #ffffff; font-size: 14pt; font-weight: bold; text-align: center; }
          .header-meta { background-color: #e2e8f0; color: #1e293b; font-size: 11pt; font-weight: bold; }
          .status-p { background-color: #dcfce7; color: #166534; font-weight: bold; }
          .status-a { background-color: #fee2e2; color: #991b1b; font-weight: bold; }
          .status-l { background-color: #fef3c7; color: #92400e; }
          .status-h { background-color: #fce7f3; color: #9d174d; }
          .text-left { text-align: left; }
          .summary-th { background-color: #e0e7ff; color: #3730a3; font-weight: bold; }
          .footer-row { background-color: #f8fafc; font-weight: bold; border-top: 2px solid #0f172a; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <th colspan="${4 + daysInMonth + 5}" class="header-title">
              ATTENDANCE REGISTER & PROGRESSION REPORT - ${monthName.toUpperCase()} ${selectedYear}
            </th>
          </tr>
          <tr>
            <th colspan="${4 + daysInMonth + 6}" class="header-meta">
              Academic Year: ${currentAcademicYearName} | Department: ${currentDeptName} | Class: ${currentClassName} - ${currentSectionName} | Total Students: ${filteredStudents.length}
            </th>
          </tr>
          <tr>
            <th>#</th>
            <th>Roll No</th>
            <th>Adm No</th>
            <th>Student Name</th>
            <th>Father Name</th>
    `;

    // Date headers
    for (let d = 1; d <= daysInMonth; d++) {
      const meta = getDayMeta(selectedYear, selectedMonth, d);
      html += `<th>${d}<br/>${meta.weekdayName}</th>`;
    }

    // Summary headers
    html += `
            <th class="summary-th" style="background-color: #def7ec; color: #03543f;">Total Present (Month)</th>
            <th class="summary-th" style="background-color: #fde8e8; color: #9b1c1c;">Total Absent (Month)</th>
            <th class="summary-th" style="background-color: #e1effe; color: #1e429f;">Total Leave (Month)</th>
            <th class="summary-th" style="background-color: #eff6ff; color: #1e40af;">Total Days Class Run</th>
            <th class="summary-th">Half-Yearly (HY Present / Total)</th>
            <th class="summary-th">Annual (Annual Present / Total)</th>
          </tr>
    `;

    // Student Rows
    filteredStudents.forEach((st, idx) => {
      const stId = st.id ?? st.Id;
      const roll =
        st.RollNumber || st.rollNumber || st.RollNo || st.rollNo || idx + 1;
      const adm =
        st.AdmissionNumber ||
        st.admissionNumber ||
        st.AdmissionNo ||
        st.admissionNo ||
        `ADM-${stId}`;
      const name =
        [
          st.FirstName || st.firstName,
          st.MiddleName || st.middleName,
          st.LastName || st.lastName,
        ]
          .filter(Boolean)
          .join(" ") ||
        st.StudentName ||
        st.studentName ||
        "Student";
      const fatherName = st.FatherName || st.fatherName || "-";

      const mStats = getStudentMonthStats(stId);
      const hy = getStudentHalfYearlyRatio(stId);
      const ann = getStudentAnnualRatio(stId);

      html += `
        <tr>
          <td>${idx + 1}</td>
          <td>${roll}</td>
          <td>${adm}</td>
          <td class="text-left"><strong>${name}</strong></td>
          <td class="text-left">${fatherName}</td>
      `;

      for (let d = 1; d <= daysInMonth; d++) {
        const meta = getDayMeta(selectedYear, selectedMonth, d);
        const stStatus = attendanceDateMap[meta.dStr]?.[stId];

        if (meta.isHoliday) {
          html += `<td class="status-h">WO</td>`;
        } else if (meta.isExam) {
          html += `<td class="status-h">${stStatus === "Absent" ? "EX-A" : "EX-P"}</td>`;
        } else if (stStatus === "Present") {
          html += `<td class="status-p">P</td>`;
        } else if (stStatus === "Absent") {
          html += `<td class="status-a">A</td>`;
        } else if (stStatus === "Leave") {
          html += `<td class="status-l">L</td>`;
        } else if (stStatus === "HalfDay") {
          html += `<td class="status-p">HD</td>`;
        } else {
          html += `<td>-</td>`;
        }
      }

      html += `
          <td><strong>${mStats.presentDays}</strong></td>
          <td>${mStats.absentDays}</td>
          <td>${mStats.leaveDays}</td>
          <td>${mStats.classRunDays}</td>
          <td>${hy.ratioText} (${hy.pct}%)</td>
          <td>${ann.ratioText} (${ann.pct}%)</td>
        </tr>
      `;
    });

    // Footer summary row: Daily Total Present / Total Student
    html += `
      <tr class="footer-row">
        <td colspan="5" class="text-left"><strong>Daily Total Present / Total Students</strong></td>
    `;

    dailySummary.forEach((ds) => {
      if (ds.isHoliday) {
        html += `<td class="status-h">WO</td>`;
      } else if (ds.isRecorded) {
        html += `<td><strong>${ds.present}</strong> / ${ds.totalStudents}</td>`;
      } else {
        html += `<td>-</td>`;
      }
    });

    const totPresAll = filteredStudents.reduce(
      (acc, st) => acc + getStudentMonthStats(st.id ?? st.Id).presentDays,
      0,
    );
    const totAbsAll = filteredStudents.reduce(
      (acc, st) => acc + getStudentMonthStats(st.id ?? st.Id).absentDays,
      0,
    );
    const totLeaveAll = filteredStudents.reduce(
      (acc, st) => acc + getStudentMonthStats(st.id ?? st.Id).leaveDays,
      0,
    );

    html += `
        <td><strong>${totPresAll}</strong></td>
        <td><strong>${totAbsAll}</strong></td>
        <td><strong>${totLeaveAll}</strong></td>
        <td><strong>${totalDaysClassRunInMonth} Days</strong></td>
        <td colspan="2">Class Session Progress Active</td>
      </tr>
      </table>
      </body>
      </html>
    `;

    const blob = new Blob([html], {
      type: "application/vnd.ms-excel;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Attendance_Register_${currentClassName}_${currentSectionName}_${monthName}_${selectedYear}.xls`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("Excel attendance register downloaded successfully!");
  };

  return (
    <div className="attendance-register-page">
      <div className="attendance-register-container">
        {/* ================= TOP HEADER (NO BACK BUTTON) ================= */}
        <div className="register-header">
          <div className="header-titles">
            <div>
              <h1>Attendance Register & Progression Matrix</h1>
              <p className="subtitle">
                Comprehensive Excel-Sheet Grid View &bull; Academic Session
                (April to March)
                {isOperator && (
                  <span
                    style={{
                      marginLeft: "10px",
                      padding: "3px 9px",
                      background: "#e0f2fe",
                      color: "#0369a1",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: "600",
                      display: "inline-block",
                    }}
                  >
                    👁️ View Only (Operator)
                  </span>
                )}
              </p>
            </div>
          </div>

          <div className="header-actions">
            <button
              type="button"
              className="btn-excel-export"
              onClick={handleExportExcel}
              title="Download Excel Sheet"
            >
              📥 Export Excel
            </button>

            {canTakeAttendance && (
              <button
                type="button"
                className="btn-take-att"
                onClick={() => navigate("/attendance/take")}
              >
                ✍️ Take Attendance
              </button>
            )}

            <button
              type="button"
              className="btn-print"
              onClick={() => window.print()}
              title="Print Register"
            >
              🖨️ Print
            </button>
          </div>
        </div>

        {/* ================= TOAST NOTIFICATION ================= */}
        {toastMsg && <div className="register-toast">✓ {toastMsg}</div>}

        {/* ================= FILTER CONTROLS BAR ================= */}
        <div className="register-controls-card">
          <div className="filter-grid-layout">
            {/* 1. Academic Year */}
            <div className="filter-field-item">
              <label>Academic Year</label>
              <select
                value={selectedAcademicYearId}
                onChange={(e) => handleAcademicYearChange(e.target.value)}
              >
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

            {/* 2. Department */}
            <div className="filter-field-item">
              <label>Department</label>
              <select
                value={selectedDepartmentId}
                onChange={(e) => handleDepartmentChange(e.target.value)}
                disabled={isTeacher && !canAdmin}
              >
                <option value="">-- All Departments --</option>
                {departments.map((d) => {
                  const dId = d.id ?? d.Id;
                  const dName =
                    d.departmentName ??
                    d.DepartmentName ??
                    d.name ??
                    `Dept ${dId}`;
                  return (
                    <option key={dId} value={dId}>
                      {dName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 3. Class */}
            <div className="filter-field-item">
              <label>Class</label>
              <select
                value={selectedClassId}
                onChange={(e) => handleClassChange(e.target.value)}
                disabled={isTeacher && !canAdmin}
              >
                <option value="">-- Select Class --</option>
                {availableClasses.map((c) => {
                  const cId = c.id ?? c.Id;
                  const cName = c.className ?? c.ClassName ?? `Class ${cId}`;
                  return (
                    <option key={cId} value={cId}>
                      {cName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 4. Section */}
            <div className="filter-field-item">
              <label>Section</label>
              <select
                value={selectedSectionId}
                onChange={(e) => setSelectedSectionId(e.target.value)}
                disabled={!selectedClassId || (isTeacher && !canAdmin)}
              >
                <option value="">-- Select Section --</option>
                {availableSections.map((s) => {
                  const sId = s.id ?? s.Id;
                  const sName = s.sectionName ?? s.SectionName ?? `Sec ${sId}`;
                  return (
                    <option key={sId} value={sId}>
                      {sName}
                    </option>
                  );
                })}
              </select>
            </div>

            {/* 5. Month (April to March) */}
            <div className="filter-field-item month-picker-field">
              <label>Month (Session)</label>
              <select
                value={selectedMonth}
                onChange={(e) =>
                  handleMonthChange(parseInt(e.target.value, 10))
                }
              >
                {ACADEMIC_MONTHS.map((m) => (
                  <option key={m.monthNum} value={m.monthNum}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 6. Year (Auto-Selected by default based on Academic Year & Month) */}
            <div className="filter-field-item year-picker-field">
              <label>Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value, 10))}
              >
                {[
                  selectedYear - 2,
                  selectedYear - 1,
                  selectedYear,
                  selectedYear + 1,
                  selectedYear + 2,
                ].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* ================= SEARCH & SUMMARY STRIP ================= */}
        <div className="register-filter-bar">
          <input
            type="text"
            placeholder="Search student by name, roll no, admission number..."
            value={searchStudent}
            onChange={(e) => setSearchStudent(e.target.value)}
            className="student-filter-input"
          />
          <div className="class-indicator-badge">
            <span>
              🏫{" "}
              <strong>
                {currentClassName} - {currentSectionName}
              </strong>{" "}
              ({currentDeptName})
            </span>
            <span>&bull;</span>
            <span>
              👥 Enrolled: <strong>{filteredStudents.length} Students</strong>
            </span>
            <span>&bull;</span>
            <span>
              📅 Class Run Days:{" "}
              <strong>{totalDaysClassRunInMonth} Days</strong> (
              {selectedMonthObj.name} {selectedYear})
            </span>
          </div>
        </div>

        {/* ================= ERROR ================= */}
        {error && <div className="register-error-banner">{error}</div>}

        {/* ================= EXCEL-STYLE REGISTER TABLE ================= */}
        {loading ? (
          <div className="register-card loading">
            <div className="spinner"></div>
            <p>
              Compiling Excel attendance matrix and progression statistics...
            </p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="register-card empty">
            <p>
              No students found for {currentClassName} - {currentSectionName} in{" "}
              {currentAcademicYearName || "selected year"}.
            </p>
          </div>
        ) : (
          <div className="excel-table-container">
            {/* Top Table Summary & Legend Bar (from web_ui_prototype.html) */}
            <div className="table-top-legend-strip">
              <div className="legend-title-group">
                <h2 className="legend-sheet-title">
                  Attendance Sheet ({selectedMonthObj.name} {selectedYear})
                </h2>
                <p className="legend-sheet-subtitle">
                  {currentClassName} - {currentSectionName} ({currentDeptName})
                  &bull; Showing {daysInMonth} days dynamic grid &bull;
                  Enrolled: {filteredStudents.length} Students
                </p>
              </div>
              <div className="legend-badges-group">
                <span className="legend-badge-item">
                  <span className="legend-sample-badge present">01</span> Present
                </span>
                <span className="legend-badge-item">
                  <span className="legend-sample-badge absent">02</span> Absent
                </span>
                <span className="legend-badge-item">
                  <span className="legend-sample-badge halfday">03</span> Half Day
                </span>
                <span className="legend-badge-item">
                  <span className="legend-sample-badge leave">04</span> Leave
                </span>
                <span className="legend-badge-item">
                  <span className="legend-sample-badge off">05</span> Sunday / Holiday (WO)
                </span>
                <span className="legend-badge-item">
                  <span className="legend-sample-badge exam-p">06</span> Exam
                </span>
              </div>
            </div>

            <div className="excel-table-scroll-wrapper">
              <table className="excel-attendance-table">
                <thead>
                  {/* TIER 1: GROUP OVERARCHING HEADERS (Matching Heatmap Design) */}
                  <tr className="excel-group-header-row">
                    <th className="group-student-th" colSpan={4}>
                      👤 Student Profile &amp; Details
                    </th>
                    <th
                      colSpan={daysInMonth}
                      className="heatmap-group-header"
                    >
                      Attendance Heatmap ({`01/${String(selectedMonth).padStart(2, "0")}/${selectedYear}`} to {`${String(daysInMonth).padStart(2, "0")}/${String(selectedMonth).padStart(2, "0")}/${selectedYear}`})
                    </th>
                    <th colSpan={6} className="summary-group-header">
                      <div className="summary-hdr-status-group">
                        <span className="summary-hdr-item present">Present</span>
                        <span className="summary-hdr-item absent">Absent</span>
                        <span className="summary-hdr-item leave">Leaves</span>
                        <span className="summary-hdr-item payable">Cumulative</span>
                      </div>
                    </th>
                  </tr>

                  {/* TIER 2: MAIN COLUMN HEADERS */}
                  <tr className="excel-header-row">
                    <th className="col-index">#</th>
                    <th className="col-roll">Roll No</th>
                    <th className="col-name">Student Name</th>
                    <th className="col-father">Father Name</th>

                    {/* DAY 1..N COLUMNS */}
                    {Array.from({ length: daysInMonth }, (_, i) => {
                      const dayNum = i + 1;
                      const meta = getDayMeta(
                        selectedYear,
                        selectedMonth,
                        dayNum,
                      );
                      return (
                        <th
                          key={dayNum}
                          className={`day-col-header ${meta.isSunday ? "sunday" : ""} ${
                            meta.isHoliday ? "holiday" : ""
                          } ${meta.isExam ? "exam" : ""}`}
                          title={
                            meta.isHoliday
                              ? `Holiday: ${meta.holidayRemark}`
                              : meta.isExam
                                ? `Exam: ${meta.examRemark}`
                                : `${meta.weekdayName}, ${dayNum} ${selectedMonthObj.name}`
                          }
                        >
                          <span className="day-num-text">{dayNum}</span>
                        </th>
                      );
                    })}

                    {/* SUMMARY COLUMNS ON RIGHT */}
                    <th
                      className="summary-col-header col-month-p"
                      title="Total Present days in this month"
                    >
                      Present
                    </th>
                    <th
                      className="summary-col-header col-month-a"
                      title="Total Absent days in this month"
                    >
                      Absent
                    </th>
                    <th
                      className="summary-col-header col-month-l"
                      title="Total Leave days in this month"
                    >
                      Leaves
                    </th>
                    <th
                      className="summary-col-header col-month-run"
                      title="Total days class was run in this month"
                    >
                      Class Run
                    </th>
                    <th
                      className="summary-col-header col-hy-ratio"
                      title="Half-Yearly Present / Total Working Days"
                    >
                      Half-Yearly
                    </th>
                    <th
                      className="summary-col-header col-ann-ratio"
                      title="Annual Present / Total Working Days"
                    >
                      Annual
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredStudents.map((st, idx) => {
                    const stId = st.id ?? st.Id;
                    const roll =
                      st.RollNumber ||
                      st.rollNumber ||
                      st.RollNo ||
                      st.rollNo ||
                      idx + 1;
                    const adm =
                      st.AdmissionNumber ||
                      st.admissionNumber ||
                      st.AdmissionNo ||
                      st.admissionNo ||
                      `ADM-${stId}`;
                    const name =
                      [
                        st.FirstName || st.firstName,
                        st.MiddleName || st.middleName,
                        st.LastName || st.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      st.StudentName ||
                      st.studentName ||
                      "Student";
                    const fatherName = st.FatherName || st.fatherName || "-";

                    const monthStats = getStudentMonthStats(stId);
                    const hyRatio = getStudentHalfYearlyRatio(stId);
                    const annRatio = getStudentAnnualRatio(stId);

                    return (
                      <tr key={stId} className="excel-student-row">
                        {/* 1. Index */}
                        <td className="col-index">{idx + 1}</td>

                        {/* 2. Roll No */}
                        <td className="col-roll">
                          <span className="roll-badge">{roll}</span>
                        </td>

                        {/* 3. Student Profile / Name with Avatar Circle */}
                        <td className="col-name" title={name}>
                          <div className="student-profile-card">
                            <div className="student-avatar-circle" title={name}>
                              {getStudentInitials(name)}
                            </div>
                            <div className="student-profile-info">
                              <span className="student-name-bold" title={name}>
                                {name}
                              </span>
                              <span className="student-meta-sub" title={`Adm: ${adm}`}>
                                {adm}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* 4. Father Name */}
                        <td className="col-father" title={fatherName}>
                          <span className="student-father-text">
                            {fatherName}
                          </span>
                        </td>

                        {/* DAY ATTENDANCE CELLS (Modern Rounded Heatmap Badges with Bold Date Number) */}
                        {Array.from({ length: daysInMonth }, (_, i) => {
                          const dayNum = i + 1;
                          const meta = getDayMeta(
                            selectedYear,
                            selectedMonth,
                            dayNum,
                          );
                          const status =
                            attendanceDateMap[meta.dStr]?.[String(stId)];
                          const badge = getHeatmapDayBadge(dayNum, meta, status);

                          return (
                            <td
                              key={dayNum}
                              className={`day-cell ${
                                meta.isSunday ? "cell-sunday" : ""
                              } ${meta.isHoliday ? "cell-holiday" : ""} ${
                                meta.isExam ? "cell-exam" : ""
                              }`}
                            >
                              <span
                                className={badge.className}
                                title={badge.title}
                              >
                                {dayNum}
                              </span>
                            </td>
                          );
                        })}

                        {/* 1. Total Present in Month */}
                        <td className="summary-cell col-month-p">
                          <span className="summary-pill present">
                            {monthStats.presentDays}
                          </span>
                        </td>

                        {/* 2. Total Absent in Month */}
                        <td className="summary-cell col-month-a">
                          <span className="summary-pill absent">
                            {monthStats.absentDays}
                          </span>
                        </td>

                        {/* 3. Total Leave in Month */}
                        <td className="summary-cell col-month-l">
                          <span className="summary-pill leave">
                            {monthStats.leaveDays}
                          </span>
                        </td>

                        {/* 4. Total Days Class Run */}
                        <td className="summary-cell col-month-run">
                          <span className="summary-pill dark">
                            {monthStats.classRunDays} D
                          </span>
                        </td>

                        {/* 5. Half-Yearly (HY Present / Total) */}
                        <td className="summary-cell col-hy-ratio">
                          <div className="ratio-box hy-box">
                            <strong>{hyRatio.present}</strong> / {hyRatio.totalWorking}
                            <span className="ratio-pct-tag">
                              ({hyRatio.pct}%)
                            </span>
                          </div>
                        </td>

                        {/* 6. Annual (Annual Present / Total) */}
                        <td className="summary-cell col-ann-ratio">
                          <div className="ratio-box ann-box">
                            <strong>{annRatio.present}</strong> / {annRatio.totalWorking}
                            <span className="ratio-pct-tag">
                              ({annRatio.pct}%)
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>

                {/* ================= DAILY TOTAL FOOTER ROW ================= */}
                <tfoot>
                  <tr className="excel-footer-row daily-totals-row">
                    <td colSpan={4} className="footer-label-cell">
                      <div className="daily-present-label-wrapper">
                        <span className="daily-present-icon">📊</span>
                        <div className="daily-present-text-group">
                          <span className="daily-present-title">Daily Present ...</span>
                          <span className="daily-present-sub">
                            Present / Total Students
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Day-by-Day Totals */}
                    {dailySummary.map((ds) => (
                      <td
                        key={ds.dayNum}
                        className={`footer-day-cell ${
                          ds.isHoliday ? "holiday" : ds.isExam ? "exam" : ""
                        }`}
                        title={`Day ${ds.dayNum}: ${ds.present} Present out of ${ds.totalStudents} students`}
                      >
                        {ds.isHoliday ? (
                          <span className="ft-ratio-pill off">WO</span>
                        ) : ds.isRecorded ? (
                          <span
                            className={`ft-ratio-pill ${
                              ds.present > 0 ? "present" : "zero"
                            }`}
                          >
                            {ds.present}/{ds.totalStudents}
                          </span>
                        ) : (
                          <span className="ft-empty-dash">-</span>
                        )}
                      </td>
                    ))}

                    {/* Month Total Present (Sum) */}
                    <td className="footer-summary-cell col-month-p">
                      <span className="summary-pill present">
                        {filteredStudents.reduce(
                          (acc, st) =>
                            acc +
                            getStudentMonthStats(st.id ?? st.Id).presentDays,
                          0,
                        )}
                      </span>
                    </td>

                    {/* Month Total Absent (Sum) */}
                    <td className="footer-summary-cell col-month-a">
                      <span className="summary-pill absent">
                        {filteredStudents.reduce(
                          (acc, st) =>
                            acc +
                            getStudentMonthStats(st.id ?? st.Id).absentDays,
                          0,
                        )}
                      </span>
                    </td>

                    {/* Month Total Leave (Sum) */}
                    <td className="footer-summary-cell col-month-l">
                      <span className="summary-pill leave">
                        {filteredStudents.reduce(
                          (acc, st) =>
                            acc +
                            getStudentMonthStats(st.id ?? st.Id).leaveDays,
                          0,
                        )}
                      </span>
                    </td>

                    {/* Total Days of Class Run */}
                    <td className="footer-summary-cell col-month-run">
                      <span className="summary-pill dark">
                        {totalDaysClassRunInMonth} D
                      </span>
                    </td>

                    {/* HY & Annual Footer Indicators */}
                    <td className="footer-summary-cell col-hy-ratio" colSpan={2}>
                      <span className="summary-pill dark">
                        {(() => {
                          const totalPresent = filteredStudents.reduce(
                            (acc, st) =>
                              acc +
                              getStudentMonthStats(st.id ?? st.Id).presentDays,
                            0,
                          );
                          const totalPossible =
                            filteredStudents.length * totalDaysClassRunInMonth;
                          const pct =
                            totalPossible > 0
                              ? ((totalPresent / totalPossible) * 100).toFixed(1)
                              : "0.0";
                          return `${pct}% Overall Avg`;
                        })()}
                      </span>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ================= BOTTOM CONTAINER: EXAM & HOLIDAY CUTOFF CONFIGURATION ================= */}
        <div className="register-bottom-accordion-card">
          <div
            className="bottom-accordion-header"
            onClick={() => setBottomSettingsOpen(!bottomSettingsOpen)}
          >
            <div className="bottom-acc-title">
              <span>
                ⚙️ Examination Cutoff Dates & Special Day Declarations
              </span>
              <span className="bottom-acc-subtitle">
                Configure Half-Yearly / Annual Cutoffs and declare Special
                Holidays or Exam days
              </span>
            </div>
            <button type="button" className="btn-toggle-acc">
              {bottomSettingsOpen ? "▲ Hide Settings" : "▼ Open Settings"}
            </button>
          </div>

          {bottomSettingsOpen && (
            <div className="bottom-accordion-content">
              <div className="settings-cards-grid">
                {/* 1. Exam Cutoff Status */}
                <div className="setting-box">
                  <h4>📅 Examination Cutoff Dates</h4>
                  <p>
                    Declare cutoff dates to calculate Half-Yearly and Annual
                    exam progression eligibility.
                  </p>
                  <div className="cutoff-status-list">
                    <div className="cs-row">
                      <div className="cs-label-val">
                        <span>🌓 Half-Yearly Cutoff:</span>
                        <strong>
                          {halfYearlyCutoff
                            ? halfYearlyCutoff
                            : "Not Set (Blank)"}
                        </strong>
                      </div>
                      {canConfigureSettings && halfYearlyCutoff && (
                        <button
                          type="button"
                          className="btn-reset-inline"
                          onClick={handleResetHalfYearlyCutoff}
                          title="Reset Half-Yearly Cutoff to Blank"
                        >
                          ↺ Reset
                        </button>
                      )}
                    </div>
                    <div className="cs-row">
                      <div className="cs-label-val">
                        <span>🏆 Annual Cutoff:</span>
                        <strong>
                          {annualCutoff ? annualCutoff : "Not Set (Blank)"}
                        </strong>
                      </div>
                      {canConfigureSettings && annualCutoff && (
                        <button
                          type="button"
                          className="btn-reset-inline"
                          onClick={handleResetAnnualCutoff}
                          title="Reset Annual Cutoff to Blank"
                        >
                          ↺ Reset
                        </button>
                      )}
                    </div>
                  </div>
                  {canConfigureSettings && (
                    <div className="setting-actions-row">
                      <button
                        type="button"
                        className="btn-setting-action"
                        onClick={() => setExamModalOpen(true)}
                      >
                        ⚙️ Configure Cutoff Dates
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Special Day Declarations */}
                <div className="setting-box">
                  <div className="setting-box-header">
                    <h4>🎉 Special Holidays & Exam Days</h4>
                    {canConfigureSettings &&
                      Object.keys(dayDeclarations).length > 0 && (
                        <button
                          type="button"
                          className="btn-reset-all-decls"
                          onClick={handleResetAllDayDeclarations}
                          title="Reset all declared special days"
                        >
                          ↺ Reset All
                        </button>
                      )}
                  </div>
                  <p>
                    Declared holidays are excluded from school open days. Exam
                    days track examination attendance.
                  </p>
                  {Object.keys(dayDeclarations).length > 0 ? (
                    <div className="decls-tags-list">
                      {Object.entries(dayDeclarations).map(([dStr, val]) => (
                        <div
                          key={dStr}
                          className={`decl-tag ${val.type.toLowerCase()}`}
                        >
                          <span>
                            {dStr}: <strong>{val.remark || val.type}</strong> (
                            {val.type})
                          </span>
                          {canConfigureSettings && (
                            <button
                              type="button"
                              onClick={() => handleRemoveDayDeclaration(dStr)}
                              title="Remove Declaration"
                            >
                              ✕
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-decls-text">
                      No special days declared yet.
                    </div>
                  )}
                  {canConfigureSettings && (
                    <button
                      type="button"
                      className="btn-setting-action holiday-btn"
                      onClick={() => setHolidayModalOpen(true)}
                    >
                      🎉 Declare Holiday / Exam Day
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= MODAL: DECLARE EXAM CUTOFF DATES ================= */}
        {examModalOpen && (
          <div className="register-modal-overlay">
            <div className="register-modal-card">
              <div className="modal-header">
                <h3>⚙️ Declare Examination Cutoff Dates</h3>
                <button
                  className="btn-modal-close"
                  onClick={() => setExamModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <p className="modal-desc">
                  Set cutoff dates for Half-Yearly and Annual exam progression
                  calculation. Leave blank if not required.
                </p>

                <div className="modal-field">
                  <label>Half-Yearly Exam Cutoff Date:</label>
                  <div className="modal-input-group">
                    <input
                      type="date"
                      value={modalHyInput}
                      onChange={(e) => setModalHyInput(e.target.value)}
                    />
                    {modalHyInput && (
                      <button
                        type="button"
                        className="btn-input-clear"
                        onClick={() => setModalHyInput("")}
                        title="Clear field"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <small>
                    Leave blank to calculate against total active session days.
                  </small>
                </div>

                <div className="modal-field">
                  <label>Annual Exam Cutoff Date:</label>
                  <div className="modal-input-group">
                    <input
                      type="date"
                      value={modalAnnInput}
                      onChange={(e) => setModalAnnInput(e.target.value)}
                    />
                    {modalAnnInput && (
                      <button
                        type="button"
                        className="btn-input-clear"
                        onClick={() => setModalAnnInput("")}
                        title="Clear field"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <small>
                    Leave blank to calculate against full academic session days.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setExamModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-modal-save"
                  onClick={handleSaveExamCutoffs}
                >
                  Save & Apply
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= MODAL: DECLARE HOLIDAY / EXAM DAY ================= */}
        {holidayModalOpen && (
          <div className="register-modal-overlay">
            <div className="register-modal-card">
              <div className="modal-header">
                <h3>🎉 Declare Holiday / Exam Day</h3>
                <button
                  className="btn-modal-close"
                  onClick={() => setHolidayModalOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="modal-body">
                <div className="modal-field">
                  <label>Date:</label>
                  <input
                    type="date"
                    value={holidayDateInput}
                    onChange={(e) => setHolidayDateInput(e.target.value)}
                  />
                </div>

                <div className="modal-field">
                  <label>Category:</label>
                  <select
                    value={holidayTypeInput}
                    onChange={(e) => setHolidayTypeInput(e.target.value)}
                  >
                    <option value="Holiday">
                      🎉 Holiday (Excluded from School Open Days)
                    </option>
                    <option value="Exam">📝 Examination Day</option>
                  </select>
                </div>

                <div className="modal-field">
                  <label>Name / Remark:</label>
                  <input
                    type="text"
                    placeholder="e.g. Diwali Vacation, Gandhi Jayanti, Half-Yearly Math Exam..."
                    value={holidayRemarkInput}
                    onChange={(e) => setHolidayRemarkInput(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  className="btn-modal-cancel"
                  onClick={() => setHolidayModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn-modal-save"
                  onClick={handleSaveDayDeclaration}
                >
                  Register Special Day
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceRegister;
