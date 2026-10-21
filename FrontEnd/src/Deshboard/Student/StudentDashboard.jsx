import SchoolVisionMission from "../../components/Common/SchoolVisionMission";
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import "../Dashboard.css";
import "./StudentDashboard.css";

import { getUsername, getUserId } from "../../Utils/auth";
import { getAllStudentsWithDetails } from "../../Services/studentService";
import {
  getAllResultBatches,
  getBatchResults,
  getAllExams,
  getExamDropdown,
} from "../../Services/resultService";
import { getAllStudentFees } from "../../Services/studentFeeService";
import { getAllFeeStructures } from "../../Services/feeStructureService";
import { getAllAcademicYear } from "../../Services/academicYearService";
import { getAllAttendance } from "../../Services/attendanceService";
import { getAllPublishedNotices } from "../../Services/noticeService";
import { getAllClassTeachersWithDetails } from "../../Services/classTeacherService";
import { getAllClass } from "../../Services/classService";
import { getAllSection } from "../../Services/sectionService";
import { getAllSubject } from "../../Services/subjectService";
import { formatFileUrl } from "../../Utils/fileHelper";
import generateMarksheetPdf from "../../Utils/generateMarksheetPdf";
import {
  generateFeeReceiptPdf,
  generateFeeStatementPdf,
} from "../../Utils/generateFeeReceiptPdf";
import UserProfileModal from "../../Components/Common/UserProfileModal";

function StudentDashboard() {
  const navigate = useNavigate();
  const username = getUsername();
  const userId = getUserId();

  // Profile Modal state
  // Active Tab State: "dashboard" | "results" | "fees" | "attendance" | "notices" | "classTeacher"
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("student_dashboard_active_tab") || "dashboard";
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("student_dashboard_active_tab", tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Student Profile Data
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [studentProfile, setStudentProfile] = useState(null);
  const [studentPhoto, setStudentPhoto] = useState(null);
  const [studentFullName, setStudentFullName] = useState("");

  // Global Academic & School Lookups
  const [allAcademicYears, setAllAcademicYears] = useState([]);
  const [allClassesList, setAllClassesList] = useState([]);
  const [allSectionsList, setAllSectionsList] = useState([]);
  const [allSubjectsList, setAllSubjectsList] = useState([]);

  // Subjects & Faculty Tab State
  const [subjectSearch, setSubjectSearch] = useState("");

  // Fee Receipt Generation State
  const [downloadingReceiptId, setDownloadingReceiptId] = useState(null);
  const [downloadingStatement, setDownloadingStatement] = useState(false);

  // =====================================================
  // FETCH STUDENT PHOTO FOR CIRCULAR AVATAR
  // RESULTS STATE
  // =====================================================
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedResultClassId, setSelectedResultClassId] = useState("");
  const [masterExams, setMasterExams] = useState([]);
  const [resultBatches, setResultBatches] = useState([]);
  const [studentExamResults, setStudentExamResults] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("ALL");
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // =====================================================
  // FEES STATE (CURRENT YEAR ONLY)
  // =====================================================
  const [loadingFees, setLoadingFees] = useState(false);
  const [currentYearFees, setCurrentYearFees] = useState({
    paid: [],
    unpaid: [],
    totalFee: 0,
    paidAmount: 0,
    remainderDue: 0,
    status: "PAID",
    currentAcademicYearName: "",
  });

  // =====================================================
  // ATTENDANCE STATE (CLASS & MONTH-WISE)
  // =====================================================
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [rawAttendanceList, setRawAttendanceList] = useState([]);
  const [attendanceClassId, setAttendanceClassId] = useState("");
  const [attendanceMonth, setAttendanceMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  // =====================================================
  // NOTICES STATE
  // =====================================================
  const [loadingNotices, setLoadingNotices] = useState(false);
  const [publishedNotices, setPublishedNotices] = useState([]);
  const [noticeSearch, setNoticeSearch] = useState("");

  // =====================================================
  // CLASS TEACHER STATE
  // =====================================================
  const [loadingClassTeachers, setLoadingClassTeachers] = useState(false);
  const [allClassTeachers, setAllClassTeachers] = useState([]);
  const [myClassTeacher, setMyClassTeacher] = useState(null);
  const [lookupClassId, setLookupClassId] = useState("");
  const [lookupSectionId, setLookupSectionId] = useState("");

  // =====================================================
  // 1. INITIAL LOAD: STUDENT PROFILE & LOOKUPS
  // =====================================================
  useEffect(() => {
    loadInitialStudentDashboard();
  }, []);

  const loadInitialStudentDashboard = async () => {
    try {
      setLoadingProfile(true);

      const [studentsRes, classesRes, sectionsRes, yearsRes, subjectsRes] =
        await Promise.allSettled([
          getAllStudentsWithDetails(),
          getAllClass(),
          getAllSection(),
          getAllAcademicYear(),
          getAllSubject(),
        ]);

      const studentsList =
        studentsRes.status === "fulfilled" && Array.isArray(studentsRes.value)
          ? studentsRes.value
          : [];

      const classes =
        classesRes.status === "fulfilled" && Array.isArray(classesRes.value)
          ? classesRes.value
          : [];
      setAllClassesList(classes);

      const sections =
        sectionsRes.status === "fulfilled" && Array.isArray(sectionsRes.value)
          ? sectionsRes.value
          : [];
      setAllSectionsList(sections);

      const years =
        yearsRes.status === "fulfilled" && Array.isArray(yearsRes.value)
          ? yearsRes.value
          : [];
      setAllAcademicYears(years);

      const subjects =
        subjectsRes.status === "fulfilled" && Array.isArray(subjectsRes.value)
          ? subjectsRes.value
          : subjectsRes.value?.data || [];
      setAllSubjectsList(subjects);

      // Match logged-in student
      const uNameLower = String(username || "")
        .toLowerCase()
        .trim();
      const uIdStr = String(userId || "").trim();

      const matched = studentsList.find((s) => {
        const sUserId = String(s.userId || s.UserId || "");
        const sAdm = String(s.admissionNumber || s.AdmissionNumber || "")
          .toLowerCase()
          .trim();
        const sRoll = String(s.rollNumber || s.RollNumber || "")
          .toLowerCase()
          .trim();
        const sEmail = String(s.email || s.Email || "")
          .toLowerCase()
          .trim();
        const sCode = String(s.code || s.Code || "")
          .toLowerCase()
          .trim();

        if (uIdStr && sUserId === uIdStr) return true;
        if (
          uNameLower &&
          (sAdm === uNameLower ||
            sRoll === uNameLower ||
            sEmail === uNameLower ||
            sCode === uNameLower)
        )
          return true;
        return false;
      });

      if (matched) {
        setStudentProfile(matched);
        setStudentPhoto(matched.photo || matched.Photo || null);
        const fullName = [
          matched.firstName || matched.FirstName,
          matched.middleName || matched.MiddleName,
          matched.lastName || matched.LastName,
        ]
          .filter(Boolean)
          .join(" ");
        setStudentFullName(fullName || username || "Student");

        const studentClassId = String(
          matched.schoolClassId ??
            matched.SchoolClassId ??
            matched.classId ??
            matched.ClassId ??
            "",
        );
        setSelectedResultClassId(studentClassId);
        setAttendanceClassId(studentClassId);
        setLookupClassId(studentClassId);
        setLookupSectionId(
          String(matched.sectionId ?? matched.SectionId ?? ""),
        );

        // Load modules for this student
        loadStudentResultsData(matched, classes);
        loadStudentFeesData(matched, years);
        loadStudentAttendanceData(matched);
        loadNoticesData();
        loadClassTeacherData(matched);
      } else {
        setStudentFullName(username || "Student");
        loadNoticesData();
        loadClassTeacherData(null);
      }
    } catch (err) {
      console.warn("Failed to load student dashboard info:", err);
    } finally {
      setLoadingProfile(false);
    }
  };

  // =====================================================
  // 2. LOAD RESULTS DATA
  // =====================================================
  const loadStudentResultsData = async (student, classes = allClassesList) => {
    if (!student) return;
    try {
      setLoadingResults(true);

      const [examsRes, batchesRes] = await Promise.allSettled([
        getAllExams().catch(() => getExamDropdown()),
        getAllResultBatches(),
      ]);

      const exams =
        examsRes.status === "fulfilled" && Array.isArray(examsRes.value)
          ? examsRes.value
          : [];
      setMasterExams(exams);

      const batches =
        batchesRes.status === "fulfilled" && Array.isArray(batchesRes.value)
          ? batchesRes.value
          : [];
      setResultBatches(batches);

      await fetchStudentClassResults(
        student,
        selectedResultClassId || student.schoolClassId || student.classId,
        batches,
        exams,
      );
    } catch (err) {
      console.warn("Error loading student results:", err);
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchStudentClassResults = async (
    student,
    classId,
    batches = resultBatches,
    exams = masterExams,
  ) => {
    if (!student || !classId) return;
    try {
      const studentId = String(student.id ?? student.Id ?? "");
      const admNum = String(
        student.admissionNumber ?? student.AdmissionNumber ?? "",
      ).trim();

      // Find matching batches for this class
      const matchingBatches = batches.filter((b) => {
        const bClassId = String(b.classId ?? b.ClassId ?? "");
        return bClassId === String(classId);
      });

      const examResultsList = [];

      for (const batch of matchingBatches) {
        const batchId = batch.id ?? batch.Id;
        const examId = batch.examId ?? batch.ExamId;
        const examName =
          batch.examName ||
          batch.ExamName ||
          exams.find((e) => Number(e.id ?? e.Id) === Number(examId))
            ?.examName ||
          `Exam #${examId}`;

        try {
          const res = await getBatchResults(batchId);
          const data = Array.isArray(res) ? res : res?.data || res?.Data || [];

          const found = data.find((r) => {
            const rStudentId = String(
              r.studentId ?? r.StudentId ?? r.id ?? r.Id ?? "",
            );
            const rAdm = String(
              r.admissionNumber ?? r.AdmissionNumber ?? "",
            ).trim();
            return (
              (studentId && rStudentId === studentId) ||
              (admNum && rAdm.toLowerCase() === admNum.toLowerCase())
            );
          });

          if (found) {
            const rawSubjects =
              found.subjects ||
              found.Subjects ||
              found.marks ||
              found.Marks ||
              [];

            let totalMax = 0;
            let totalObt = 0;

            const normalizedSubjects = rawSubjects.map((sub, idx) => {
              const subName =
                sub.subjectName ||
                sub.SubjectName ||
                sub.name ||
                sub.Name ||
                `Subject ${idx + 1}`;
              const maxMarks = Number(sub.maxMarks ?? sub.MaxMarks ?? 100);
              const obtMarks = Number(
                sub.obtainedMarks ?? sub.ObtainedMarks ?? 0,
              );
              const intMarks = sub.internalMarks ?? sub.InternalMarks ?? "-";
              const extMarks = sub.externalMarks ?? sub.ExternalMarks ?? "-";
              const grade = sub.grade || sub.Grade || "-";
              const remarks = sub.remarks || sub.Remarks || "";

              totalMax += maxMarks;
              totalObt += obtMarks;

              return {
                subjectName: subName,
                maxMarks,
                obtainedMarks: obtMarks,
                internalMarks: intMarks,
                externalMarks: extMarks,
                grade,
                remarks,
              };
            });

            const percentage =
              totalMax > 0
                ? ((totalObt / totalMax) * 100).toFixed(2)
                : Number(found.percentage ?? found.Percentage ?? 0).toFixed(2);

            const isPassed =
              found.isPassed ??
              found.IsPassed ??
              (Number(percentage) >= 33 &&
                !normalizedSubjects.some((s) => s.obtainedMarks < 33));

            const overallGrade =
              found.overallGrade ||
              found.OverallGrade ||
              found.grade ||
              found.Grade ||
              (Number(percentage) >= 90
                ? "A+"
                : Number(percentage) >= 75
                  ? "A"
                  : Number(percentage) >= 60
                    ? "B"
                    : Number(percentage) >= 45
                      ? "C"
                      : Number(percentage) >= 33
                        ? "D"
                        : "F");

            examResultsList.push({
              batchId,
              examId,
              examName,
              academicYearId: batch.academicYearId ?? batch.AcademicYearId,
              academicYearName:
                batch.academicYearName ?? batch.AcademicYearName,
              subjects: normalizedSubjects,
              totalMaxMarks: totalMax || Number(found.totalMarks ?? 100),
              totalObtainedMarks:
                totalObt || Number(found.obtainedMarks ?? obtMarks),
              percentage,
              isPassed,
              overallGrade,
              rank: found.rank || found.Rank || "-",
              remarks: found.remarks || found.Remarks || "",
              pdfUrl: found.pdfUrl || found.PdfUrl || null,
            });
          }
        } catch (e) {
          console.warn(`Error loading result for batch #${batchId}:`, e);
        }
      }

      setStudentExamResults(examResultsList);
    } catch (err) {
      console.warn("Failed to fetch class results:", err);
    }
  };

  const handleResultClassChange = (e) => {
    const classId = e.target.value;
    setSelectedResultClassId(classId);
    if (studentProfile) {
      fetchStudentClassResults(
        studentProfile,
        classId,
        resultBatches,
        masterExams,
      );
    }
  };

  const handleDownloadMarksheetPdf = async (examResult) => {
    if (!studentProfile || !examResult) return;
    try {
      setGeneratingPdf(true);
      const studentMeta = {
        name: studentFullName,
        studentName: studentFullName,
        admissionNumber:
          studentProfile.admissionNumber || studentProfile.AdmissionNumber,
        rollNumber: studentProfile.rollNumber || studentProfile.RollNumber,
        fatherName: studentProfile.fatherName || studentProfile.FatherName,
        motherName: studentProfile.motherName || studentProfile.MotherName,
        className:
          allClassesList.find(
            (c) => String(c.id ?? c.Id) === String(selectedResultClassId),
          )?.className ||
          studentProfile.className ||
          "Class",
        sectionName: studentProfile.sectionName || "Section A",
        examName: examResult.examName,
        academicYear:
          examResult.academicYearName ||
          studentProfile.academicYearName ||
          "Current Session",
        totalMax: examResult.totalMaxMarks,
        totalObtained: examResult.totalObtainedMarks,
        percentage: examResult.percentage,
        overallGrade: examResult.overallGrade,
        isPassed: examResult.isPassed,
        subjects: examResult.subjects,
      };

      await generateMarksheetPdf(studentMeta);
    } catch (err) {
      console.error("PDF Marksheet generation failed:", err);
      alert("Failed to generate marksheet PDF. Please try again.");
    } finally {
      setGeneratingPdf(false);
    }
  };

  // =====================================================
  // 3. LOAD FEES DATA (CURRENT ACADEMIC YEAR ONLY)
  // =====================================================
  const loadStudentFeesData = async (
    student,
    academicYears = allAcademicYears,
  ) => {
    if (!student) return;
    try {
      setLoadingFees(true);

      const [allFeesRes, allStructuresRes] = await Promise.allSettled([
        getAllStudentFees(),
        getAllFeeStructures(),
      ]);

      const allFees =
        allFeesRes.status === "fulfilled" && Array.isArray(allFeesRes.value)
          ? allFeesRes.value
          : [];

      const allStructures =
        allStructuresRes.status === "fulfilled" &&
        Array.isArray(allStructuresRes.value)
          ? allStructuresRes.value
          : [];

      const studentId = String(student.id ?? student.Id ?? "");
      const studentClassId = String(
        student.schoolClassId ??
          student.SchoolClassId ??
          student.classId ??
          student.ClassId ??
          "",
      );

      // Determine Current Academic Year
      let currentAy = academicYears.find((y) => y.isCurrent || y.IsCurrent);
      if (!currentAy && academicYears.length > 0) {
        // Sort highest ID as current year
        const sorted = [...academicYears].sort((a, b) => {
          return Number(b.id ?? b.Id ?? 0) - Number(a.id ?? a.Id ?? 0);
        });
        currentAy = sorted[0];
      }

      const currentAyId = currentAy ? String(currentAy.id ?? currentAy.Id) : "";
      const currentAyName = currentAy
        ? currentAy.yearName ||
          currentAy.YearName ||
          currentAy.name ||
          "Current Session"
        : "Current Session";

      // 1. Applicable structures for current year & student's class
      const currentYearStructures = allStructures.filter((fs) => {
        const matchClass =
          String(fs.classId ?? fs.ClassId ?? "") === studentClassId;
        const matchAy =
          !currentAyId ||
          String(fs.academicYearId ?? fs.AcademicYearId ?? "") === currentAyId;
        const isActive = fs.isActive !== false && fs.IsActive !== false;
        return matchClass && matchAy && isActive;
      });

      // 2. Student fee payments recorded for this student in current year
      const myAssignedFees = allFees.filter((sf) => {
        const matchStudent =
          String(sf.studentId ?? sf.StudentId ?? "") === studentId;
        if (!matchStudent) return false;
        if (!currentAyId) return true;

        const matchedStructure = allStructures.find(
          (fs) =>
            String(fs.id ?? fs.Id) ===
            String(sf.feeStructureId ?? sf.FeeStructureId),
        );
        const fsAyId = String(
          matchedStructure?.academicYearId ??
            matchedStructure?.AcademicYearId ??
            "",
        );
        return !fsAyId || fsAyId === currentAyId;
      });

      const paidList = [];
      const unpaidList = [];
      let totalAnnualFee = 0;
      let totalPaidAmount = 0;
      let totalRemainderDue = 0;

      // Correlate structures with payments
      currentYearStructures.forEach((struct) => {
        const structId = String(struct.id ?? struct.Id);
        const feeName =
          struct.feeCategoryName ||
          struct.FeeCategoryName ||
          struct.description ||
          struct.Description ||
          `Fee #${structId}`;
        const structAmount = Number(struct.amount ?? struct.Amount ?? 0);
        totalAnnualFee += structAmount;

        const matchPayment = myAssignedFees.find(
          (sf) => String(sf.feeStructureId ?? sf.FeeStructureId) === structId,
        );

        if (matchPayment) {
          const paidAmt = Number(
            matchPayment.paidAmount ?? matchPayment.PaidAmount ?? 0,
          );
          const balance = Number(
            matchPayment.balanceAmount !== undefined
              ? matchPayment.balanceAmount
              : matchPayment.BalanceAmount !== undefined
                ? matchPayment.BalanceAmount
                : Math.max(0, structAmount - paidAmt),
          );

          totalPaidAmount += paidAmt;
          totalRemainderDue += balance;

          if (paidAmt > 0) {
            paidList.push({
              id: matchPayment.id ?? matchPayment.Id,
              feeName,
              invoiceNo:
                matchPayment.invoiceNo ||
                matchPayment.InvoiceNo ||
                `INV-${structId}`,
              amountPaid: paidAmt,
              totalAmount: structAmount,
              balanceDue: balance,
              paymentDate:
                matchPayment.paymentDate ||
                matchPayment.PaymentDate ||
                matchPayment.createdDate ||
                matchPayment.CreatedDate ||
                "-",
              status: balance <= 0 ? "PAID" : "PARTIAL",
            });
          }

          if (balance > 0) {
            unpaidList.push({
              id: matchPayment.id ?? matchPayment.Id,
              feeName,
              totalAmount: structAmount,
              paidSoFar: paidAmt,
              balanceDue: balance,
              dueDate:
                matchPayment.dueDate ||
                matchPayment.DueDate ||
                struct.dueDate ||
                struct.DueDate ||
                "-",
              status: paidAmt > 0 ? "PARTIAL DUE" : "UNPAID",
            });
          }
        } else {
          // Entirely unpaid
          totalRemainderDue += structAmount;
          unpaidList.push({
            id: `pending-${structId}`,
            feeName,
            totalAmount: structAmount,
            paidSoFar: 0,
            balanceDue: structAmount,
            dueDate: struct.dueDate || struct.DueDate || "-",
            status: "UNPAID",
          });
        }
      });

      const overallStatus =
        totalRemainderDue <= 0 && totalAnnualFee > 0
          ? "PAID"
          : totalPaidAmount > 0
            ? "PARTIALLY PAID"
            : "PAYMENT DUE";

      setCurrentYearFees({
        paid: paidList,
        unpaid: unpaidList,
        totalFee: totalAnnualFee,
        paidAmount: totalPaidAmount,
        remainderDue: totalRemainderDue,
        status: overallStatus,
        currentAcademicYearName: currentAyName,
      });
    } catch (err) {
      console.warn("Failed to load student fees:", err);
    } finally {
      setLoadingFees(false);
    }
  };

  // =====================================================
  // 4. LOAD ATTENDANCE DATA (CLASS & MONTH-WISE)
  // =====================================================
  const loadStudentAttendanceData = async (student) => {
    if (!student) return;
    try {
      setLoadingAttendance(true);
      const res = await getAllAttendance().catch(() => []);
      const list = Array.isArray(res) ? res : res?.data || res?.Data || [];
      setRawAttendanceList(list);
    } catch (err) {
      console.warn("Failed to load attendance list:", err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  // Compute filtered monthly attendance records for selected class and month
  const monthlyAttendanceData = useMemo(() => {
    if (!studentProfile) return { days: [], stats: {} };

    const studentId = String(studentProfile.id ?? studentProfile.Id ?? "");
    const admNum = String(
      studentProfile.admissionNumber ?? studentProfile.AdmissionNumber ?? "",
    ).trim();

    const [yearStr, monthStr] = (attendanceMonth || "2026-09").split("-");
    const targetYear = Number(yearStr);
    const targetMonth = Number(monthStr); // 1-12

    // Get total days in target month
    const daysInMonth = new Date(targetYear, targetMonth, 0).getDate();
    const dayMap = {};

    // Filter attendance records
    rawAttendanceList.forEach((att) => {
      const attStudentId = String(
        att.studentId ?? att.StudentId ?? att.student?.id ?? "",
      );
      const attAdm = String(
        att.admissionNumber ?? att.AdmissionNumber ?? "",
      ).trim();

      const isMe =
        (studentId && attStudentId === studentId) ||
        (admNum && attAdm.toLowerCase() === admNum.toLowerCase());
      if (!isMe) return;

      const dateVal =
        att.attendanceDate || att.AttendanceDate || att.date || att.Date;
      if (!dateVal) return;

      const d = new Date(dateVal);
      if (d.getFullYear() === targetYear && d.getMonth() + 1 === targetMonth) {
        const dayNum = d.getDate();
        const rawStatus = String(
          att.status || att.Status || att.attendanceStatus || "",
        ).toLowerCase();

        let status = "Present";
        if (rawStatus.includes("absent") || rawStatus === "a")
          status = "Absent";
        else if (rawStatus.includes("leave") || rawStatus === "l")
          status = "Leave";
        else if (rawStatus.includes("holiday") || rawStatus === "h")
          status = "Holiday";
        else if (rawStatus.includes("half") || rawStatus === "hd")
          status = "Half Day";

        dayMap[dayNum] = {
          dayNumber: dayNum,
          dateString: d.toLocaleDateString(),
          status,
          remarks: att.remarks || att.Remarks || "",
        };
      }
    });

    const calendarDays = [];
    let presentCount = 0;
    let absentCount = 0;
    let leaveCount = 0;
    let holidayCount = 0;

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(targetYear, targetMonth - 1, day);
      const isSunday = dateObj.getDay() === 0;

      if (dayMap[day]) {
        const info = dayMap[day];
        if (info.status === "Present") presentCount++;
        else if (info.status === "Absent") absentCount++;
        else if (info.status === "Leave") leaveCount++;
        else if (info.status === "Holiday") holidayCount++;

        calendarDays.push({
          dayNumber: day,
          dayName: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
          status: info.status,
          remarks: info.remarks,
        });
      } else if (isSunday) {
        calendarDays.push({
          dayNumber: day,
          dayName: "Sun",
          status: "Sunday",
          remarks: "Weekly Off",
        });
      } else {
        calendarDays.push({
          dayNumber: day,
          dayName: dateObj.toLocaleDateString("en-US", { weekday: "short" }),
          status: "Not Marked",
          remarks: "",
        });
      }
    }

    const workingDays = presentCount + absentCount + leaveCount;
    const percentage =
      workingDays > 0
        ? ((presentCount / workingDays) * 100).toFixed(1)
        : "100.0";

    return {
      days: calendarDays,
      stats: {
        totalDays: daysInMonth,
        workingDays,
        present: presentCount,
        absent: absentCount,
        leave: leaveCount,
        holiday: holidayCount,
        percentage,
      },
    };
  }, [rawAttendanceList, studentProfile, attendanceMonth, attendanceClassId]);

  // =====================================================
  // 5. LOAD NOTICES DATA
  // =====================================================
  const loadNoticesData = async () => {
    try {
      setLoadingNotices(true);
      const res = await getAllPublishedNotices().catch(() => []);
      const list = Array.isArray(res) ? res : res?.data || res?.Data || [];
      // Sort newest first
      const sorted = [...list].sort((a, b) => {
        const dA = new Date(
          a.publishedDate || a.PublishedDate || a.createdDate || 0,
        );
        const dB = new Date(
          b.publishedDate || b.PublishedDate || b.createdDate || 0,
        );
        return dB - dA;
      });
      setPublishedNotices(sorted);
    } catch (err) {
      console.warn("Failed to load published notices:", err);
    } finally {
      setLoadingNotices(false);
    }
  };

  // =====================================================
  // 6. LOAD CLASS TEACHER DATA
  // =====================================================
  const loadClassTeacherData = async (student) => {
    try {
      setLoadingClassTeachers(true);
      const res = await getAllClassTeachersWithDetails().catch(() => []);
      const list = Array.isArray(res)
        ? res
        : res?.allocations || res?.data || res?.Data || [];
      setAllClassTeachers(list);

      if (student) {
        const studentClassId = String(
          student.schoolClassId ??
            student.SchoolClassId ??
            student.classId ??
            student.ClassId ??
            "",
        );
        const studentSecId = String(
          student.sectionId ?? student.SectionId ?? "",
        );

        const myTeacher = list.find((ct) => {
          const ctClassId = String(ct.classId ?? ct.ClassId ?? "");
          const ctSecId = String(ct.sectionId ?? ct.SectionId ?? "");
          return (
            ctClassId === studentClassId &&
            (!studentSecId || ctSecId === studentSecId)
          );
        });

        setMyClassTeacher(myTeacher || null);
      }
    } catch (err) {
      console.warn("Failed to load class teacher info:", err);
    } finally {
      setLoadingClassTeachers(false);
    }
  };

  // Matched class allocation for logged-in student
  const myClassAllocation = useMemo(() => {
    if (!studentProfile) return null;
    const sClassId = String(
      studentProfile.schoolClassId ??
        studentProfile.SchoolClassId ??
        studentProfile.classId ??
        studentProfile.ClassId ??
        ""
    );
    const sSecId = String(
      studentProfile.sectionId ?? studentProfile.SectionId ?? ""
    );

    return (
      allClassTeachers.find((ct) => {
        const ctClassId = String(ct.classId ?? ct.ClassId ?? "");
        const ctSecId = String(ct.sectionId ?? ct.SectionId ?? "");
        return ctClassId === sClassId && (!sSecId || ctSecId === sSecId);
      }) || null
    );
  }, [allClassTeachers, studentProfile]);

  // Comprehensive subject and assigned faculty roster for this student's class
  const myClassSubjectRoster = useMemo(() => {
    const list = [];
    const seenSubjects = new Set();
    const faculty = myClassAllocation?.subjectTeachers || [];

    // 1. Gather all subjects from faculty allocations
    faculty.forEach((teacher) => {
      (teacher.subjects || []).forEach((sub) => {
        const subName = sub.name || sub.subjectName || `Subject #${sub.id}`;
        const key = subName.toLowerCase().trim();
        let item = list.find((x) => x.key === key);
        if (!item) {
          item = {
            key,
            id: sub.id,
            name: subName,
            code: sub.code || `SUB-${sub.id || "01"}`,
            teachers: [],
          };
          list.push(item);
          seenSubjects.add(key);
        }
        item.teachers.push(teacher);
      });
    });

    // 2. Also check if there are other master subjects for this student's class
    if (studentProfile) {
      const sClassId = String(
        studentProfile.schoolClassId ??
          studentProfile.SchoolClassId ??
          studentProfile.classId ??
          studentProfile.ClassId ??
          ""
      );
      allSubjectsList.forEach((ms) => {
        const msClassId = String(
          ms.classId ?? ms.ClassId ?? ms.schoolClassId ?? ms.SchoolClassId ?? ""
        );
        const msName = ms.name || ms.subjectName || ms.SubjectName;
        if (!msName) return;
        const key = msName.toLowerCase().trim();
        if ((!msClassId || msClassId === sClassId) && !seenSubjects.has(key)) {
          list.push({
            key,
            id: ms.id ?? ms.Id,
            name: msName,
            code: ms.code || ms.Code || `SUB-${ms.id || "01"}`,
            teachers: [],
          });
          seenSubjects.add(key);
        }
      });
    }

    return list;
  }, [myClassAllocation, allSubjectsList, studentProfile]);

  // Filtered subject roster based on user search
  const filteredSubjectRoster = useMemo(() => {
    if (!subjectSearch.trim()) return myClassSubjectRoster;
    const q = subjectSearch.toLowerCase().trim();
    return myClassSubjectRoster.filter((item) => {
      const matchSub =
        item.name.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q);
      const matchTeacher = item.teachers.some((t) =>
        (t.teacherName || "").toLowerCase().includes(q) ||
        (t.teacherCode || "").toLowerCase().includes(q)
      );
      return matchSub || matchTeacher;
    });
  }, [myClassSubjectRoster, subjectSearch]);

  // Fee Receipt Download Handler
  const handleDownloadFeeReceipt = async (feeItem) => {
    if (!studentProfile || !feeItem) return;
    try {
      setDownloadingReceiptId(feeItem.id);
      await generateFeeReceiptPdf({
        student: {
          ...studentProfile,
          name: studentFullName,
          studentName: studentFullName,
        },
        feeItem,
        currentYearFees,
      });
    } catch (err) {
      console.error("Failed to generate fee receipt PDF:", err);
      alert("Failed to generate fee receipt PDF. Please try again.");
    } finally {
      setDownloadingReceiptId(null);
    }
  };

  // Fee Statement Download Handler
  const handleDownloadFeeStatement = async () => {
    if (!studentProfile) return;
    try {
      setDownloadingStatement(true);
      await generateFeeStatementPdf({
        student: {
          ...studentProfile,
          name: studentFullName,
          studentName: studentFullName,
        },
        currentYearFees,
      });
    } catch (err) {
      console.error("Failed to generate fee statement PDF:", err);
      alert("Failed to generate fee statement PDF. Please try again.");
    } finally {
      setDownloadingStatement(false);
    }
  };

  // Directory lookup teacher result
  const lookupTeacherResult = useMemo(() => {
    if (!lookupClassId) return null;
    return (
      allClassTeachers.find((ct) => {
        const cMatch =
          String(ct.classId ?? ct.ClassId) === String(lookupClassId);
        const sMatch =
          !lookupSectionId ||
          String(ct.sectionId ?? ct.SectionId) === String(lookupSectionId);
        return cMatch && sMatch;
      }) || null
    );
  }, [allClassTeachers, lookupClassId, lookupSectionId]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  return (
    <div className="dashboard student-portal-root">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside className="dashboard-sidebar">
        {/* STUDENT PROFILE HEADER & CIRCLE AVATAR */}
        <div className="student-sidebar-profile-header">
          <h2>Student Portal</h2>
          <span className="student-panel-subtitle">{studentFullName}</span>

          {/* CIRCLE PROFILE AVATAR (TRIGGER 75% MODAL) */}
          <div
            className="student-circle-avatar-container"
            onClick={() => setProfileModalOpen(true)}
            title="Click to view full 75% Student Profile"
          >
            {studentPhoto ? (
              <img
                src={formatFileUrl(studentPhoto)}
                alt={studentFullName}
                className="student-round-circle-img"
              />
            ) : (
              <div className="student-round-circle-placeholder">
                {String(studentFullName || username || "S")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <span className="avatar-online-dot"></span>
          </div>

          <button
            type="button"
            className="student-view-profile-btn"
            onClick={() => setProfileModalOpen(true)}
          >
            👤 My Profile
          </button>
        </div>

        {/* SIDEBAR NAVIGATION BUTTONS */}
        <button
          className={activeTab === "dashboard" ? "active-nav-btn" : ""}
          onClick={() => handleTabChange("dashboard")}
        >
          🏠 Dashboard
        </button>

        <button
          className={activeTab === "subjects" ? "active-nav-btn" : ""}
          onClick={() => handleTabChange("subjects")}
        >
          📚 My Subjects &amp; Faculty
        </button>

        <button
          className={activeTab === "results" ? "active-nav-btn" : ""}
          onClick={() => handleTabChange("results")}
        >
          📊 My Results
        </button>

        <button
          className={activeTab === "fees" ? "active-nav-btn" : ""}
          onClick={() => handleTabChange("fees")}
        >
          💳 Fee Status &amp; Receipts
        </button>

        <button
          className={activeTab === "attendance" ? "active-nav-btn" : ""}
          onClick={() => handleTabChange("attendance")}
        >
          📅 Attendance
        </button>

        <button
          className={activeTab === "notices" ? "active-nav-btn" : ""}
          onClick={() => handleTabChange("notices")}
        >
          📢 Notices
        </button>

        <button
          className={activeTab === "classTeacher" ? "active-nav-btn" : ""}
          onClick={() => handleTabChange("classTeacher")}
        >
          👨‍🏫 Class Teacher
        </button>

        {/* LOGOUT BUTTON */}
        <div className="sidebar-logout-wrapper">
          <button
            type="button"
            className="sidebar-logout-btn"
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* =====================================================
          MAIN CONTENT AREA
      ===================================================== */}
      <main className="dashboard-content student-content-area">
        {/* =====================================================
            TAB 1: DASHBOARD OVERVIEW
        ===================================================== */}
        {activeTab === "dashboard" && (
          <div className="student-tab-pane animate-fade-in">
            {/* WELCOME BANNER */}
            <div className="student-dashboard-welcome-banner">
              <div className="welcome-text-side">
                <h1>Welcome back, {studentFullName}!</h1>
                <p>
                  Class:{" "}
                  <strong>
                    {studentProfile?.className ||
                      studentProfile?.ClassName ||
                      "Enrolled"}
                  </strong>{" "}
                  | Roll No:{" "}
                  <strong>
                    {studentProfile?.rollNumber ||
                      studentProfile?.RollNumber ||
                      "N/A"}
                  </strong>{" "}
                  | Adm No:{" "}
                  <strong>
                    {studentProfile?.admissionNumber ||
                      studentProfile?.AdmissionNumber ||
                      "N/A"}
                  </strong>
                </p>
              </div>

              {/* Quick Profile Widget */}
              <div
                className="student-quick-profile-widget"
                onClick={() => setProfileModalOpen(true)}
                title="Click to view 75% Student Profile Card"
              >
                <div className="widget-avatar-circle">
                  {studentPhoto ? (
                    <img
                      src={formatFileUrl(studentPhoto)}
                      alt={studentFullName}
                    />
                  ) : (
                    <div className="widget-avatar-placeholder">
                      {String(studentFullName || username || "S")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="widget-user-info">
                  <strong>{studentFullName}</strong>
                  <span>🏷️ View Profile Card ➔</span>
                </div>
              </div>
            </div>

            {/* QUICK STAT METRICS CARDS */}
            <div className="student-metric-grid">
              {/* RESULTS METRIC */}
              <div
                className="student-metric-card cursor-pointer"
                onClick={() => handleTabChange("results")}
              >
                <div className="metric-icon-bubble purple-bubble">📊</div>
                <div className="metric-data">
                  <span className="metric-label">Latest Exam Result</span>
                  <strong className="metric-value">
                    {studentExamResults.length > 0
                      ? `${studentExamResults[0].percentage}% (Grade ${studentExamResults[0].overallGrade})`
                      : "View Marks"}
                  </strong>
                  <span className="metric-subtext">
                    {studentExamResults.length > 0
                      ? `${studentExamResults[0].examName} - ${studentExamResults[0].isPassed ? "Passed ✓" : "Needs Review"}`
                      : "Check Subject Breakdown ➔"}
                  </span>
                </div>
              </div>

              {/* FEES METRIC */}
              <div
                className="student-metric-card cursor-pointer"
                onClick={() => handleTabChange("fees")}
              >
                <div className="metric-icon-bubble green-bubble">💳</div>
                <div className="metric-data">
                  <span className="metric-label">
                    {currentYearFees.currentAcademicYearName} Fee
                  </span>
                  <strong className="metric-value">
                    ₹{currentYearFees.remainderDue.toLocaleString()} Due
                  </strong>
                  <span className="metric-subtext">
                    Paid: ₹{currentYearFees.paidAmount.toLocaleString()} of ₹
                    {currentYearFees.totalFee.toLocaleString()} ➔
                  </span>
                </div>
              </div>

              {/* ATTENDANCE METRIC */}
              <div
                className="student-metric-card cursor-pointer"
                onClick={() => handleTabChange("attendance")}
              >
                <div className="metric-icon-bubble blue-bubble">📅</div>
                <div className="metric-data">
                  <span className="metric-label">Monthly Attendance</span>
                  <strong className="metric-value">
                    {monthlyAttendanceData.stats.percentage || "100.0"}%
                  </strong>
                  <span className="metric-subtext">
                    {monthlyAttendanceData.stats.present || 0} Days Present of{" "}
                    {monthlyAttendanceData.stats.workingDays || 0} Working Days
                    ➔
                  </span>
                </div>
              </div>

              {/* NOTICES METRIC */}
              <div
                className="student-metric-card cursor-pointer"
                onClick={() => handleTabChange("notices")}
              >
                <div className="metric-icon-bubble orange-bubble">📢</div>
                <div className="metric-data">
                  <span className="metric-label">Active Notices</span>
                  <strong className="metric-value">
                    {publishedNotices.length} Published
                  </strong>
                  <span className="metric-subtext">
                    Read College Bulletins ➔
                  </span>
                </div>
              </div>

              {/* SUBJECTS & FACULTY METRIC */}
              <div
                className="student-metric-card cursor-pointer"
                onClick={() => handleTabChange("subjects")}
              >
                <div
                  className="metric-icon-bubble"
                  style={{ background: "#e0e7ff", color: "#4338ca" }}
                >
                  📚
                </div>
                <div className="metric-data">
                  <span className="metric-label">My Class Subjects</span>
                  <strong className="metric-value">
                    {myClassSubjectRoster.length > 0
                      ? `${myClassSubjectRoster.length} Subjects`
                      : "View Subjects"}
                  </strong>
                  <span className="metric-subtext">
                    {myClassAllocation?.subjectTeachers?.length || 0} Faculty Assigned ➔
                  </span>
                </div>
              </div>
            </div>

            {/* CLASS TEACHER & RECENT NOTICES SECTION */}
            <div className="student-home-sections-grid">
              {/* CURRENT CLASS TEACHER SUMMARY CARD */}
              <div className="student-section-box">
                <div className="section-box-header">
                  <h3>👨‍🏫 My Class Teacher</h3>
                  <button
                    type="button"
                    className="box-action-link"
                    onClick={() => handleTabChange("classTeacher")}
                  >
                    View Directory ➔
                  </button>
                </div>
                {myClassTeacher ? (
                  <div className="my-teacher-spotlight">
                    <div className="teacher-spotlight-photo">
                      {myClassTeacher.teacherPhoto ? (
                        <img
                          src={formatFileUrl(myClassTeacher.teacherPhoto)}
                          alt={myClassTeacher.teacherName}
                        />
                      ) : (
                        <div className="teacher-placeholder-circle">
                          {String(myClassTeacher.teacherName || "T")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="teacher-spotlight-info">
                      <h4>{myClassTeacher.teacherName}</h4>
                      <p className="teacher-role-tag">
                        Class Teacher - {myClassTeacher.className} (
                        {myClassTeacher.sectionName})
                      </p>
                      <div className="teacher-contact-badges">
                        {myClassTeacher.email && (
                          <span>📧 {myClassTeacher.email}</span>
                        )}
                        {myClassTeacher.phoneNumber && (
                          <span>📞 {myClassTeacher.phoneNumber}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-state-card-mini">
                    <p>
                      Class Teacher is currently assigned by the administrator.
                    </p>
                    <button
                      type="button"
                      className="btn-mini-action"
                      onClick={() => handleTabChange("classTeacher")}
                    >
                      Browse Class Directory
                    </button>
                  </div>
                )}
              </div>

              {/* LATEST NOTICES SNIPPET */}
              <div className="student-section-box">
                <div className="section-box-header">
                  <h3>📢 Latest Published Notices</h3>
                  <button
                    type="button"
                    className="box-action-link"
                    onClick={() => handleTabChange("notices")}
                  >
                    All Notices ➔
                  </button>
                </div>
                {publishedNotices.length > 0 ? (
                  <div className="notice-mini-list">
                    {publishedNotices.slice(0, 3).map((notice, idx) => (
                      <div
                        key={notice.id || idx}
                        className="notice-mini-item"
                        onClick={() => handleTabChange("notices")}
                      >
                        <div className="notice-mini-icon">📌</div>
                        <div className="notice-mini-body">
                          <strong>{notice.title || notice.Title}</strong>
                          <span>
                            📅{" "}
                            {new Date(
                              notice.publishedDate ||
                                notice.PublishedDate ||
                                notice.createdDate ||
                                Date.now(),
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="empty-text">No active notices published yet.</p>
                )}
              </div>
            </div>

            {/* ================= SCHOOL VISION & MISSION ================= */}
            <SchoolVisionMission />
          </div>
        )}

        {/* =====================================================
            TAB: MY SUBJECTS & FACULTY ROSTER
        ===================================================== */}
        {activeTab === "subjects" && (
          <div className="student-tab-pane animate-fade-in">
            <div className="tab-pane-header">
              <div>
                <h2>📚 My Class Subjects &amp; Faculty Roster</h2>
                <p>
                  All academic subjects registered for your class and the teachers assigned to teach them.
                </p>
              </div>

              {/* SEARCH INPUT */}
              <div className="pane-filter-group">
                <input
                  type="text"
                  placeholder="🔍 Search subject or teacher..."
                  value={subjectSearch}
                  onChange={(e) => setSubjectSearch(e.target.value)}
                  className="student-search-input"
                />
              </div>
            </div>

            {/* CLASS HERO BANNER */}
            <div className="subject-class-hero">
              <div className="hero-meta">
                <h2>
                  {studentProfile?.className || "Enrolled Class"}{" "}
                  {studentProfile?.sectionName
                    ? `(${studentProfile.sectionName})`
                    : ""}
                </h2>
                <div className="hero-badges-wrap">
                  <span className="hero-badge-item">
                    🏛️ Department:{" "}
                    {studentProfile?.departmentName ||
                      myClassAllocation?.departmentName ||
                      "General"}
                  </span>
                  <span className="hero-badge-item">
                    🗓️ Session:{" "}
                    {currentYearFees?.currentAcademicYearName ||
                      studentProfile?.academicYearName ||
                      "Current Session"}
                  </span>
                  <span className="hero-badge-item">
                    📖 {myClassSubjectRoster.length} Total Subjects
                  </span>
                  {myClassTeacher && (
                    <span className="hero-badge-item hero-badge-ct">
                      👑 Class Teacher: {myClassTeacher.teacherName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* SUBJECTS & FACULTY CARDS GRID */}
            {filteredSubjectRoster.length === 0 ? (
              <div className="student-empty-state">
                <div className="empty-state-icon">📚</div>
                <h3>No Subjects Found</h3>
                <p>
                  {subjectSearch.trim()
                    ? `No subjects or faculty matched your search query "${subjectSearch}".`
                    : "Subjects and teacher allocations for your class will appear here once finalized by the administration."}
                </p>
              </div>
            ) : (
              <div className="subjects-grid-layout">
                {filteredSubjectRoster.map((subItem) => {
                  const assignedTeachers = subItem.teachers || [];
                  return (
                    <div key={subItem.key} className="subject-faculty-card">
                      {/* Top: Subject Name & Code */}
                      <div className="subject-card-head">
                        <div className="subject-title-area">
                          <h3>{subItem.name}</h3>
                          <span className="subject-code-tag">
                            Code: {subItem.code}
                          </span>
                        </div>
                        <div className="subject-icon-box">📖</div>
                      </div>

                      {/* Middle: Faculty / Teacher details */}
                      {assignedTeachers.length === 0 ? (
                        <div
                          className="empty-faculty-state"
                          style={{
                            color: "#94a3b8",
                            fontSize: "13px",
                            padding: "10px 0",
                          }}
                        >
                          ℹ️ Subject registered. Teacher allocation in progress.
                        </div>
                      ) : (
                        assignedTeachers.map((tch) => {
                          const isCt = Boolean(
                            tch.isClassTeacher ||
                              (myClassTeacher &&
                                String(
                                  myClassTeacher.teacherId ||
                                    myClassTeacher.id,
                                ) === String(tch.teacherId || tch.id)),
                          );
                          const photoUrl =
                            tch.photo || tch.Photo || tch.profilePhotoPath;

                          return (
                            <div
                              key={tch.teacherId}
                              className="subject-teacher-profile"
                            >
                              <div className="teacher-avatar-circle-sm">
                                {photoUrl ? (
                                  <img
                                    src={formatFileUrl(photoUrl)}
                                    alt={tch.teacherName}
                                  />
                                ) : (
                                  <div className="avatar-letter">
                                    {String(tch.teacherName || "T")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="teacher-info-column">
                                <h4>{tch.teacherName}</h4>
                                <span
                                  className={`teacher-designation-pill ${
                                    isCt ? "is-ct" : "is-st"
                                  }`}
                                >
                                  {isCt
                                    ? "⭐ Class Teacher & Faculty"
                                    : "📚 Subject Faculty"}
                                </span>

                                <div className="subject-teacher-contacts">
                                  {tch.teacherCode && (
                                    <span>🆔 {tch.teacherCode}</span>
                                  )}
                                  {tch.email && <span>📧 {tch.email}</span>}
                                  {tch.phoneNumber && (
                                    <span>📞 {tch.phoneNumber}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            TAB 2: EXAMINATION RESULTS (CLASS-WISE)
        ===================================================== */}
        {activeTab === "results" && (
          <div className="student-tab-pane animate-fade-in">
            <div className="tab-pane-header">
              <div>
                <h2>📊 Academic & Examination Results</h2>
                <p>
                  View your complete exam results, marks breakdown, grades, and
                  download marksheet.
                </p>
              </div>

              {/* CLASS SELECTOR (STUDENTS SELECT CLASS INSTEAD OF ACADEMIC YEAR) */}
              <div className="pane-filter-group">
                <label htmlFor="result-class-select">Select Class:</label>
                <select
                  id="result-class-select"
                  value={selectedResultClassId}
                  onChange={handleResultClassChange}
                  className="student-filter-select"
                >
                  <option value="">-- Choose Class --</option>
                  {allClassesList.map((c) => {
                    const cId = String(c.id ?? c.Id);
                    const cName = c.className || c.ClassName || `Class ${cId}`;
                    const isCurrent =
                      studentProfile &&
                      String(
                        studentProfile.schoolClassId ??
                          studentProfile.classId ??
                          "",
                      ) === cId;
                    return (
                      <option key={cId} value={cId}>
                        {cName} {isCurrent ? "(Current Class)" : ""}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {loadingResults ? (
              <div className="student-loading-box">
                <div className="spinner"></div>
                <p>Loading your exam results...</p>
              </div>
            ) : studentExamResults.length === 0 ? (
              <div className="student-empty-state">
                <div className="empty-state-icon">📋</div>
                <h3>No Results Uploaded Yet for This Class</h3>
                <p>
                  Your exam results for the selected class will appear here once
                  published by your class teacher.
                </p>
              </div>
            ) : (
              <div className="exam-results-container">
                {studentExamResults.map((result, idx) => (
                  <div key={result.batchId || idx} className="exam-result-card">
                    {/* CARD HEADER */}
                    <div className="exam-card-header">
                      <div className="exam-title-badge-wrap">
                        <span className="exam-type-tag">
                          📝 {result.examName}
                        </span>
                        {result.academicYearName && (
                          <span className="academic-session-tag">
                            🗓️ {result.academicYearName}
                          </span>
                        )}
                      </div>

                      {/* MARKSHEET DOWNLOAD BUTTON */}
                      <button
                        type="button"
                        className="btn-download-marksheet"
                        onClick={() => handleDownloadMarksheetPdf(result)}
                        disabled={generatingPdf}
                      >
                        {generatingPdf
                          ? "⏳ Generating..."
                          : "📄 Marksheet PDF"}
                      </button>
                    </div>

                    {/* METRIC BADGES ROW */}
                    <div className="result-score-overview">
                      <div className="score-stat-chip">
                        <span>Total Marks</span>
                        <strong>
                          {result.totalObtainedMarks} / {result.totalMaxMarks}
                        </strong>
                      </div>

                      <div className="score-stat-chip">
                        <span>Percentage</span>
                        <strong>{result.percentage}%</strong>
                      </div>

                      <div className="score-stat-chip">
                        <span>Grade</span>
                        <strong className="grade-highlight">
                          {result.overallGrade}
                        </strong>
                      </div>

                      <div className="score-stat-chip">
                        <span>Status</span>
                        <strong
                          className={
                            result.isPassed ? "status-pass" : "status-fail"
                          }
                        >
                          {result.isPassed ? "PASSED ✓" : "NEEDS IMPROVEMENT"}
                        </strong>
                      </div>
                    </div>

                    {/* SUBJECT-WISE MARKS TABLE */}
                    <div className="subject-marks-table-wrapper">
                      <table className="subject-marks-table">
                        <thead>
                          <tr>
                            <th>Subject Name</th>
                            <th>Internal</th>
                            <th>External</th>
                            <th>Max Marks</th>
                            <th>Marks Obtained</th>
                            <th>Grade</th>
                            <th>Remarks</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.subjects.map((sub, sIdx) => (
                            <tr key={sIdx}>
                              <td className="font-semibold">
                                {sub.subjectName}
                              </td>
                              <td>{sub.internalMarks}</td>
                              <td>{sub.externalMarks}</td>
                              <td>{sub.maxMarks}</td>
                              <td className="obt-marks-cell">
                                <strong>{sub.obtainedMarks}</strong>
                              </td>
                              <td>
                                <span className="subject-grade-badge">
                                  {sub.grade}
                                </span>
                              </td>
                              <td className="text-muted">
                                {sub.remarks || "-"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            TAB 3: FEE STATUS (CURRENT ACADEMIC YEAR ONLY)
        ===================================================== */}
        {activeTab === "fees" && (
          <div className="student-tab-pane animate-fade-in">
            <div className="tab-pane-header">
              <div>
                <h2>💳 Student Fee Status &amp; Ledger</h2>
                <p>
                  View your fee dues, payment history, and official receipts for{" "}
                  <strong>{currentYearFees.currentAcademicYearName}</strong>.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  className="btn-download-statement-hdr"
                  onClick={handleDownloadFeeStatement}
                  disabled={downloadingStatement}
                >
                  {downloadingStatement
                    ? "⏳ Generating..."
                    : "📑 Download Fee Statement"}
                </button>
                <div className="session-indicator-badge">
                  🗓️ Session:{" "}
                  <strong>{currentYearFees.currentAcademicYearName}</strong>
                </div>
              </div>
            </div>

            {/* FEE SUMMARY BANNER */}
            <div className="fee-summary-metrics-row">
              <div className="fee-summary-card total-fee-box">
                <span>Total Annual Fee</span>
                <strong>₹{currentYearFees.totalFee.toLocaleString()}</strong>
                <small>Current Academic Year</small>
              </div>

              <div className="fee-summary-card paid-fee-box">
                <span>Total Submitted</span>
                <strong>₹{currentYearFees.paidAmount.toLocaleString()}</strong>
                <small className="text-green">Paid in full / partial</small>
              </div>

              <div className="fee-summary-card due-fee-box">
                <span>Remaining Due</span>
                <strong>
                  ₹{currentYearFees.remainderDue.toLocaleString()}
                </strong>
                <small className="text-red">Outstanding Balance</small>
              </div>

              <div className="fee-summary-card status-box">
                <span>Payment Status</span>
                <strong
                  className={
                    currentYearFees.remainderDue <= 0
                      ? "text-green"
                      : "text-amber"
                  }
                >
                  {currentYearFees.status}
                </strong>
                <small>Session 2026</small>
              </div>
            </div>

            {/* TWO COLUMNS: PAID FEES & UNPAID FEES */}
            <div className="fee-split-columns-container">
              {/* COLUMN 1: PAID FEES */}
              <div className="fee-column-card paid-column">
                <div className="fee-column-header">
                  <h3>
                    ✅ Paid Fee Installments ({currentYearFees.paid.length})
                  </h3>
                  <span className="fee-header-badge paid-badge">
                    ₹{currentYearFees.paidAmount.toLocaleString()} Received
                  </span>
                </div>

                {currentYearFees.paid.length === 0 ? (
                  <div className="empty-fee-column-state">
                    <p>No paid fee receipts recorded yet for this session.</p>
                  </div>
                ) : (
                  <div className="fee-item-cards-list">
                    {currentYearFees.paid.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="fee-item-card paid-item"
                      >
                        <div className="fee-item-top">
                          <strong>{item.feeName}</strong>
                          <span className="paid-tag-pill">PAID</span>
                        </div>
                        <div className="fee-item-details">
                          <span>
                            Receipt / Invoice: <code>{item.invoiceNo}</code>
                          </span>
                          <span>
                            Amount Paid:{" "}
                            <strong className="text-green">
                              ₹{item.amountPaid.toLocaleString()}
                            </strong>
                          </span>
                        </div>
                        {item.balanceDue > 0 && (
                          <div className="fee-item-footer text-amber">
                            Remaining Balance on item: ₹
                            {item.balanceDue.toLocaleString()}
                          </div>
                        )}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginTop: "8px",
                          }}
                        >
                          <button
                            type="button"
                            className="btn-download-fee-receipt"
                            onClick={() => handleDownloadFeeReceipt(item)}
                            disabled={downloadingReceiptId === item.id}
                          >
                            {downloadingReceiptId === item.id
                              ? "⏳ Generating..."
                              : "📄 Download Receipt"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* COLUMN 2: UNPAID & REMAINING DUE */}
              <div className="fee-column-card unpaid-column">
                <div className="fee-column-header">
                  <h3>
                    ⚠️ Unpaid &amp; Due Fees ({currentYearFees.unpaid.length})
                  </h3>
                  <span className="fee-header-badge due-badge">
                    ₹{currentYearFees.remainderDue.toLocaleString()} Pending
                  </span>
                </div>

                {currentYearFees.unpaid.length === 0 ? (
                  <div className="empty-fee-column-state all-clear-state">
                    <p>🎉 All fees are fully paid for this academic year!</p>
                  </div>
                ) : (
                  <div className="fee-item-cards-list">
                    {currentYearFees.unpaid.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="fee-item-card unpaid-item"
                      >
                        <div className="fee-item-top">
                          <strong>{item.feeName}</strong>
                          <span className="due-tag-pill">{item.status}</span>
                        </div>
                        <div className="fee-item-details">
                          <span>
                            Total Fee: ₹{item.totalAmount.toLocaleString()}
                          </span>
                          <span>
                            Due Balance:{" "}
                            <strong className="text-red">
                              ₹{item.balanceDue.toLocaleString()}
                            </strong>
                          </span>
                        </div>
                        <div className="fee-item-footer">
                          <span>📅 Due Date: {item.dueDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB 4: ATTENDANCE (CLASS & MONTH-WISE)
        ===================================================== */}
        {activeTab === "attendance" && (
          <div className="student-tab-pane animate-fade-in">
            <div className="tab-pane-header">
              <div>
                <h2>📅 Student Attendance Register</h2>
                <p>
                  Track your monthly attendance records, presence percentage,
                  and past attendance history.
                </p>
              </div>

              {/* SELECTORS: CLASS & MONTH */}
              <div className="attendance-controls-bar">
                <div className="pane-filter-group">
                  <label htmlFor="att-class-select">Class:</label>
                  <select
                    id="att-class-select"
                    value={attendanceClassId}
                    onChange={(e) => setAttendanceClassId(e.target.value)}
                    className="student-filter-select"
                  >
                    {allClassesList.map((c) => {
                      const cId = String(c.id ?? c.Id);
                      const cName =
                        c.className || c.ClassName || `Class ${cId}`;
                      return (
                        <option key={cId} value={cId}>
                          {cName}
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div className="pane-filter-group">
                  <label htmlFor="att-month-select">Month &amp; Year:</label>
                  <input
                    id="att-month-select"
                    type="month"
                    value={attendanceMonth}
                    onChange={(e) => setAttendanceMonth(e.target.value)}
                    className="student-month-input"
                  />
                </div>
              </div>
            </div>

            {/* STATS OVERVIEW CARDS */}
            <div className="attendance-stats-cards-row">
              <div className="att-stat-card">
                <span>Working Days</span>
                <strong>{monthlyAttendanceData.stats.workingDays || 0}</strong>
              </div>

              <div className="att-stat-card stat-present">
                <span>Present Days</span>
                <strong>{monthlyAttendanceData.stats.present || 0}</strong>
              </div>

              <div className="att-stat-card stat-absent">
                <span>Absent Days</span>
                <strong>{monthlyAttendanceData.stats.absent || 0}</strong>
              </div>

              <div className="att-stat-card stat-leave">
                <span>Leaves</span>
                <strong>{monthlyAttendanceData.stats.leave || 0}</strong>
              </div>

              <div className="att-stat-card stat-holiday">
                <span>Holidays</span>
                <strong>{monthlyAttendanceData.stats.holiday || 0}</strong>
              </div>

              <div className="att-stat-card stat-percentage">
                <span>Attendance %</span>
                <strong>
                  {monthlyAttendanceData.stats.percentage || "100.0"}%
                </strong>
              </div>
            </div>

            {/* MONTHLY CALENDAR GRID */}
            <div className="attendance-calendar-box">
              <div className="calendar-box-header">
                <h3>
                  📆 Day-by-Day Attendance Matrix (
                  {new Date(attendanceMonth + "-01").toLocaleDateString(
                    "en-US",
                    {
                      month: "long",
                      year: "numeric",
                    },
                  )}
                  )
                </h3>
                <div className="legend-pills-row">
                  <span className="legend-pill pill-present">● Present</span>
                  <span className="legend-pill pill-absent">● Absent</span>
                  <span className="legend-pill pill-leave">● Leave</span>
                  <span className="legend-pill pill-holiday">● Holiday</span>
                  <span className="legend-pill pill-sunday">● Sun / Off</span>
                </div>
              </div>

              <div className="calendar-days-grid">
                {monthlyAttendanceData.days.map((dayItem) => {
                  const statusClass =
                    dayItem.status === "Present"
                      ? "day-present"
                      : dayItem.status === "Absent"
                        ? "day-absent"
                        : dayItem.status === "Leave"
                          ? "day-leave"
                          : dayItem.status === "Holiday"
                            ? "day-holiday"
                            : dayItem.status === "Sunday"
                              ? "day-sunday"
                              : "day-unmarked";

                  return (
                    <div
                      key={dayItem.dayNumber}
                      className={`calendar-day-cell ${statusClass}`}
                      title={dayItem.remarks || dayItem.status}
                    >
                      <span className="cell-day-num">{dayItem.dayNumber}</span>
                      <span className="cell-day-name">{dayItem.dayName}</span>
                      <span className="cell-status-tag">{dayItem.status}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* =====================================================
            TAB 5: PUBLISHED NOTICES
        ===================================================== */}
        {activeTab === "notices" && (
          <div className="student-tab-pane animate-fade-in">
            <div className="tab-pane-header">
              <div>
                <h2>📢 Published College Notices &amp; Bulletins</h2>
                <p>
                  Stay updated with the latest circulars, events, and exams.
                </p>
              </div>

              {/* SEARCH INPUT */}
              <div className="pane-filter-group">
                <input
                  type="text"
                  placeholder="🔍 Search notice title..."
                  value={noticeSearch}
                  onChange={(e) => setNoticeSearch(e.target.value)}
                  className="student-search-input"
                />
              </div>
            </div>

            {loadingNotices ? (
              <div className="student-loading-box">
                <div className="spinner"></div>
                <p>Loading published notices...</p>
              </div>
            ) : publishedNotices.length === 0 ? (
              <div className="student-empty-state">
                <div className="empty-state-icon">📢</div>
                <h3>No Published Notices Available</h3>
                <p>There are currently no active public bulletins published.</p>
              </div>
            ) : (
              <div className="notices-cards-grid">
                {publishedNotices
                  .filter((n) => {
                    if (!noticeSearch.trim()) return true;
                    const q = noticeSearch.toLowerCase();
                    return (
                      String(n.title || n.Title || "")
                        .toLowerCase()
                        .includes(q) ||
                      String(n.description || n.Description || "")
                        .toLowerCase()
                        .includes(q)
                    );
                  })
                  .map((notice, idx) => {
                    const pdfPath =
                      notice.pdfFilePath ||
                      notice.PdfFilePath ||
                      notice.pdfPath ||
                      notice.pdfUrl ||
                      notice.fileUrl;

                    return (
                      <div
                        key={notice.id || idx}
                        className="published-notice-card"
                      >
                        <div className="notice-card-top">
                          <span className="notice-category-badge">
                            📌 Announcement
                          </span>
                          <span className="notice-date-stamp">
                            📅{" "}
                            {new Date(
                              notice.publishedDate ||
                                notice.PublishedDate ||
                                notice.createdDate ||
                                Date.now(),
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        <h3 className="notice-card-title">
                          {notice.title || notice.Title}
                        </h3>

                        <p className="notice-card-description">
                          {notice.description ||
                            notice.Description ||
                            "No additional description provided."}
                        </p>

                        {pdfPath && (
                          <div className="notice-card-actions">
                            <a
                              href={formatFileUrl(pdfPath)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn-notice-pdf"
                            >
                              📥 View / Download Notice PDF
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            TAB 6: CLASS TEACHER DIRECTORY
        ===================================================== */}
        {activeTab === "classTeacher" && (
          <div className="student-tab-pane animate-fade-in">
            <div className="tab-pane-header">
              <div>
                <h2>👨‍🏫 Class Teacher Directory</h2>
                <p>
                  View your current class teacher and look up teachers assigned
                  to other classes and sections.
                </p>
              </div>
            </div>

            {/* SECTION 1: MY CURRENT CLASS TEACHER */}
            <div className="class-teacher-spotlight-section">
              <h3 className="section-subtitle">⭐ My Assigned Class Teacher</h3>
              {myClassTeacher ? (
                <div className="my-class-teacher-main-card">
                  <div className="teacher-main-avatar">
                    {myClassTeacher.teacherPhoto ? (
                      <img
                        src={formatFileUrl(myClassTeacher.teacherPhoto)}
                        alt={myClassTeacher.teacherName}
                      />
                    ) : (
                      <div className="teacher-avatar-fallback">
                        {String(myClassTeacher.teacherName || "T")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="teacher-main-details">
                    <div className="teacher-name-row">
                      <h3>{myClassTeacher.teacherName}</h3>
                      <span className="active-teacher-badge">
                        Current Class Teacher
                      </span>
                    </div>

                    <div className="teacher-metadata-grid">
                      <div>
                        <span>Assigned Class:</span>
                        <strong>
                          {myClassTeacher.className} (
                          {myClassTeacher.sectionName})
                        </strong>
                      </div>

                      {myClassTeacher.departmentName && (
                        <div>
                          <span>Department:</span>
                          <strong>{myClassTeacher.departmentName}</strong>
                        </div>
                      )}

                      {myClassTeacher.email && (
                        <div>
                          <span>Email:</span>
                          <strong>{myClassTeacher.email}</strong>
                        </div>
                      )}

                      {myClassTeacher.phoneNumber && (
                        <div>
                          <span>Phone:</span>
                          <strong>{myClassTeacher.phoneNumber}</strong>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="student-empty-state">
                  <p>
                    Your class teacher is currently being assigned by
                    administration.
                  </p>
                </div>
              )}
            </div>

            {/* SECTION 2: LOOKUP CLASS TEACHER FOR OTHER CLASSES */}
            <div className="class-teacher-lookup-section">
              <h3 className="section-subtitle">
                🔍 Look Up Other Class Teachers
              </h3>

              <div className="lookup-filters-row">
                <div className="pane-filter-group">
                  <label htmlFor="lookup-class">Select Class:</label>
                  <select
                    id="lookup-class"
                    value={lookupClassId}
                    onChange={(e) => setLookupClassId(e.target.value)}
                    className="student-filter-select"
                  >
                    <option value="">-- Choose Class --</option>
                    {allClassesList.map((c) => (
                      <option key={c.id ?? c.Id} value={c.id ?? c.Id}>
                        {c.className || c.ClassName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pane-filter-group">
                  <label htmlFor="lookup-section">Section (Optional):</label>
                  <select
                    id="lookup-section"
                    value={lookupSectionId}
                    onChange={(e) => setLookupSectionId(e.target.value)}
                    className="student-filter-select"
                  >
                    <option value="">All Sections</option>
                    {allSectionsList.map((s) => (
                      <option key={s.id ?? s.Id} value={s.id ?? s.Id}>
                        {s.sectionName || s.SectionName || `Section ${s.id}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {lookupTeacherResult ? (
                <div className="lookup-result-card">
                  <div className="lookup-photo">
                    {lookupTeacherResult.teacherPhoto ? (
                      <img
                        src={formatFileUrl(lookupTeacherResult.teacherPhoto)}
                        alt={lookupTeacherResult.teacherName}
                      />
                    ) : (
                      <div className="lookup-placeholder">
                        {String(lookupTeacherResult.teacherName || "T")
                          .charAt(0)
                          .toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="lookup-info">
                    <h4>{lookupTeacherResult.teacherName}</h4>
                    <p className="text-muted">
                      Class Teacher for {lookupTeacherResult.className} (
                      {lookupTeacherResult.sectionName})
                    </p>
                    <div className="lookup-badges">
                      {lookupTeacherResult.departmentName && (
                        <span>🏛️ {lookupTeacherResult.departmentName}</span>
                      )}
                      {lookupTeacherResult.email && (
                        <span>📧 {lookupTeacherResult.email}</span>
                      )}
                    </div>
                  </div>
                </div>
              ) : lookupClassId ? (
                <div className="empty-lookup-state">
                  <p>
                    No Class Teacher assigned for the selected class/section
                    combination yet.
                  </p>
                </div>
              ) : (
                <p className="empty-text">
                  Select a class above to view the assigned class teacher.
                </p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* =====================================================
          75% WIDTH & HEIGHT STUDENT PROFILE MODAL
      ===================================================== */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        roleTitle="Student"
      />
    </div>
  );
}

export default StudentDashboard;
