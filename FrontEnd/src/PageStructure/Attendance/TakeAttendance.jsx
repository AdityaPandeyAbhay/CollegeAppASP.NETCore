import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  getMyClassTeacherAssignment,
  getSectionClassId,
  checkAttendanceLocked,
  getDayDeclarations,
  setDayDeclaration,
} from "../../Services/classTeacherService";
import { getAllClasses } from "../../Services/classService";
import { getAllSections } from "../../Services/sectionService";
import { getAllDepartment } from "../../Services/departmentService";
import { getAllAcademicYear } from "../../Services/academicYearService";
import { getAllTeacherAssignments } from "../../Services/teacherAssignmentService";
import {
  takeAttendance,
  getAttendanceByDate,
  getAllAttendance,
  updateAttendance,
} from "../../Services/attendanceService";
import {
  getAllStudentsWithDetails,
  getAllStudents,
  isStudentSoftDeleted,
} from "../../Services/studentService";
import { getRole } from "../../Utils/auth";
import DeclareHolidayModal from "../../components/DeclareHolidayModal/DeclareHolidayModal";
import "./TakeAttendance.css";

function TakeAttendance() {
  const navigate = useNavigate();
  const role = (getRole() || "").toLowerCase();
  const isOperator = role === "operator";
  const isAdminOrSuper =
    (role === "super admin" ||
      role === "superadmin" ||
      role === "admin" ||
      role === "office employee" ||
      role === "officeemployee" ||
      role === "officestaff" ||
      role === "office staff") &&
    !isOperator;

  const [searchParams] = useSearchParams();
  const paramClassId = searchParams.get("classId");
  const paramSectionId = searchParams.get("sectionId");
  const paramYearId = searchParams.get("academicYearId");

  // Lookup Lists
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState(
    paramYearId || "",
  );

  const [departments, setDepartments] = useState([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState("");

  const [classList, setClassList] = useState([]);
  const [sectionList, setSectionList] = useState([]);
  const [assignmentsList, setAssignmentsList] = useState([]);

  const [classInfo, setClassInfo] = useState(null);
  const [isClassTeacher, setIsClassTeacher] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [restrictionMessage, setRestrictionMessage] = useState("");

  // Attendance Form State
  const todayStr = new Date().toISOString().split("T")[0];
  const [attendanceDate, setAttendanceDate] = useState(todayStr);
  const [dayType, setDayType] = useState("Regular"); // "Regular" | "Holiday" | "Exam"
  const [holidayRemark, setHolidayRemark] = useState("");
  const [lockedInfo, setLockedInfo] = useState({ isLocked: false, reason: "" });
  const [showHolidayModal, setShowHolidayModal] = useState(false);

  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState({}); // { [studentId]: { status: "Present", remarks: "" } }
  const [dayRemarks, setDayRemarks] = useState("");
  const [existingAttendanceId, setExistingAttendanceId] = useState(null);

  const [loadingStudents, setLoadingStudents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // 1. Initial Load & Verify Teacher / Admin Assignment
  useEffect(() => {
    const initPage = async () => {
      try {
        setLoadingInitial(true);

        const [yRes, dRes, cRes, sRes, aRes] = await Promise.allSettled([
          getAllAcademicYear(),
          getAllDepartment(),
          getAllClasses(),
          getAllSections(),
          getAllTeacherAssignments(),
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
        const aArr =
          aRes.status === "fulfilled" && Array.isArray(aRes.value)
            ? aRes.value
            : aRes.value?.data || [];

        setAcademicYears(yArr);
        setDepartments(dArr);
        setClassList(cArr);
        setSectionList(sArr);
        setAssignmentsList(aArr);

        // Find Current Academic Year
        const currentYear = yArr.find((y) => y.isCurrent ?? y.IsCurrent);
        const resolvedYearId = paramYearId
          ? paramYearId
          : currentYear
            ? String(currentYear.id ?? currentYear.Id)
            : yArr.length > 0
              ? String(yArr[0].id ?? yArr[0].Id)
              : "5";
        setSelectedAcademicYearId(resolvedYearId);

        // Check if teacher
        if (!isAdminOrSuper) {
          const info = await getMyClassTeacherAssignment().catch(() => null);
          if (info && info.isClassTeacher) {
            setIsClassTeacher(true);
            setClassInfo({
              classId: String(info.classId),
              sectionId: String(info.sectionId),
              className: info.className || `Class ${info.classId}`,
              sectionName: info.sectionName || `Section ${info.sectionId}`,
              teacherAssignmentId: info.teacherAssignmentId || 0,
              academicYearId: resolvedYearId,
            });
            return;
          } else {
            setIsClassTeacher(false);
            setRestrictionMessage(
              info?.message ||
                "You are not assigned as a Class Teacher. Attendance can only be marked by designated Class Teachers or Administrators.",
            );
            return;
          }
        }

        // Admin / Super Admin mode
        setIsClassTeacher(true);

        if (paramClassId && paramSectionId) {
          const matchedCls = cArr.find(
            (c) => String(c.id ?? c.Id) === String(paramClassId),
          );
          const matchedSec = sArr.find(
            (s) => String(s.id ?? s.Id) === String(paramSectionId),
          );
          const matchedAssign = aArr.find(
            (a) =>
              String(a.schoolClassId ?? a.SchoolClassId) ===
                String(paramClassId) &&
              String(a.sectionId ?? a.SectionId) === String(paramSectionId),
          );

          if (matchedCls) {
            const dId =
              matchedCls.departmentId ??
              matchedCls.DepartmentId ??
              matchedCls.department?.id;
            if (dId) setSelectedDepartmentId(String(dId));
          }

          setClassInfo({
            classId: String(paramClassId),
            sectionId: String(paramSectionId),
            className:
              matchedCls?.className ??
              matchedCls?.ClassName ??
              `Class ${paramClassId}`,
            sectionName:
              matchedSec?.sectionName ??
              matchedSec?.SectionName ??
              `Section ${paramSectionId}`,
            teacherAssignmentId:
              matchedAssign?.id ??
              matchedAssign?.Id ??
              (aArr.length > 0 ? (aArr[0].id ?? aArr[0].Id) : 0),
            academicYearId: resolvedYearId,
          });
        } else if (cArr.length > 0) {
          const firstCls = cArr[0];
          const firstClsId = String(firstCls.id ?? firstCls.Id);
          const validSecs = sArr.filter(
            (s) => String(getSectionClassId(s)) === firstClsId,
          );
          const firstSec = validSecs[0] || sArr[0];
          const firstSecId = firstSec
            ? String(firstSec.id ?? firstSec.Id)
            : "1";

          const matchedAssign = aArr.find(
            (a) =>
              String(a.schoolClassId ?? a.SchoolClassId) === firstClsId &&
              String(a.sectionId ?? a.SectionId) === firstSecId,
          );

          const dId =
            firstCls.departmentId ??
            firstCls.DepartmentId ??
            firstCls.department?.id;
          if (dId) setSelectedDepartmentId(String(dId));

          setClassInfo({
            classId: firstClsId,
            sectionId: firstSecId,
            className:
              firstCls.className ?? firstCls.ClassName ?? `Class ${firstClsId}`,
            sectionName:
              firstSec?.sectionName ??
              firstSec?.SectionName ??
              `Section ${firstSecId}`,
            teacherAssignmentId:
              matchedAssign?.id ??
              matchedAssign?.Id ??
              (aArr.length > 0 ? (aArr[0].id ?? aArr[0].Id) : 0),
            academicYearId: resolvedYearId,
          });
        }
      } catch (err) {
        console.error("Failed to initialize Take Attendance:", err);
      } finally {
        setLoadingInitial(false);
      }
    };

    initPage();
  }, [isAdminOrSuper, paramClassId, paramSectionId, paramYearId]);

  // Handle Academic Year Change
  const handleAcademicYearChange = (newYearId) => {
    setSelectedAcademicYearId(newYearId);
    setClassInfo((prev) =>
      prev ? { ...prev, academicYearId: newYearId } : prev,
    );
  };

  // Handle Admin Department Change
  const handleDepartmentChange = (newDeptId) => {
    setSelectedDepartmentId(newDeptId);
    const matchingClasses = classList.filter((c) => {
      const dId = c.departmentId ?? c.DepartmentId ?? c.department?.id;
      return !newDeptId || String(dId) === String(newDeptId);
    });

    if (matchingClasses.length > 0) {
      const firstCls = matchingClasses[0];
      const newClsId = String(firstCls.id ?? firstCls.Id);
      const validSecs = sectionList.filter(
        (s) => String(getSectionClassId(s)) === newClsId,
      );
      const firstSec = validSecs[0];
      const newSecId = firstSec ? String(firstSec.id ?? firstSec.Id) : "";

      const matchedAssign = assignmentsList.find(
        (a) =>
          String(a.schoolClassId ?? a.SchoolClassId) === newClsId &&
          String(a.sectionId ?? a.SectionId) === newSecId,
      );

      setClassInfo({
        classId: newClsId,
        sectionId: newSecId,
        className:
          firstCls.className ?? firstCls.ClassName ?? `Class ${newClsId}`,
        sectionName:
          firstSec?.sectionName ??
          firstSec?.SectionName ??
          `Section ${newSecId}`,
        teacherAssignmentId:
          matchedAssign?.id ??
          matchedAssign?.Id ??
          (assignmentsList.length > 0
            ? (assignmentsList[0].id ?? assignmentsList[0].Id)
            : 0),
        academicYearId: selectedAcademicYearId,
      });
    }
  };

  // Handle Admin Class Change
  const handleAdminClassChange = (newClsId) => {
    const matchedCls = classList.find(
      (c) => String(c.id ?? c.Id) === String(newClsId),
    );
    if (matchedCls) {
      const dId =
        matchedCls.departmentId ??
        matchedCls.DepartmentId ??
        matchedCls.department?.id;
      if (dId) setSelectedDepartmentId(String(dId));
    }

    const validSections = sectionList.filter(
      (s) => String(getSectionClassId(s)) === String(newClsId),
    );
    const firstSec = validSections[0];
    const newSecId = firstSec ? String(firstSec.id ?? firstSec.Id) : "";

    const matchedAssign = assignmentsList.find(
      (a) =>
        String(a.schoolClassId ?? a.SchoolClassId) === String(newClsId) &&
        String(a.sectionId ?? a.SectionId) === String(newSecId),
    );

    setClassInfo({
      classId: newClsId,
      sectionId: newSecId,
      className:
        matchedCls?.className ?? matchedCls?.ClassName ?? `Class ${newClsId}`,
      sectionName:
        firstSec?.sectionName ?? firstSec?.SectionName ?? `Section ${newSecId}`,
      teacherAssignmentId:
        matchedAssign?.id ??
        matchedAssign?.Id ??
        (assignmentsList.length > 0
          ? (assignmentsList[0].id ?? assignmentsList[0].Id)
          : 0),
      academicYearId: selectedAcademicYearId,
    });
  };

  // Handle Admin Section Change
  const handleAdminSectionChange = (newSecId) => {
    const matchedSec = sectionList.find(
      (s) => String(s.id ?? s.Id) === String(newSecId),
    );
    const currentClsId = classInfo?.classId;
    const matchedAssign = assignmentsList.find(
      (a) =>
        String(a.schoolClassId ?? a.SchoolClassId) === String(currentClsId) &&
        String(a.sectionId ?? a.SectionId) === String(newSecId),
    );

    setClassInfo((prev) => ({
      ...prev,
      sectionId: newSecId,
      sectionName:
        matchedSec?.sectionName ??
        matchedSec?.SectionName ??
        `Section ${newSecId}`,
      teacherAssignmentId:
        matchedAssign?.id ??
        matchedAssign?.Id ??
        prev?.teacherAssignmentId ??
        0,
      academicYearId: selectedAcademicYearId,
    }));
  };

  // 2. Lock check whenever date, classInfo, or year changes
  useEffect(() => {
    if (classInfo && attendanceDate) {
      const lockCheck = checkAttendanceLocked(
        attendanceDate,
        classInfo.classId,
        classInfo.sectionId,
        selectedAcademicYearId,
      );
      setLockedInfo(lockCheck);

      // Check for day declaration (Holiday / Exam)
      const dayDecls = getDayDeclarations(
        classInfo.classId,
        classInfo.sectionId,
        selectedAcademicYearId,
      );
      const decl = dayDecls[attendanceDate];
      if (decl) {
        setDayType(decl.type || "Holiday");
        setHolidayRemark(decl.remark || "");
      } else {
        setDayType("Regular");
        setHolidayRemark("");
      }
    }
  }, [classInfo, attendanceDate, selectedAcademicYearId]);

  // 3. Fetch students & existing attendance when classInfo, date, or year changes
  useEffect(() => {
    if (!classInfo || !classInfo.classId || !classInfo.sectionId) return;

    let isMounted = true;

    const fetchClassStudentsAndAttendance = async () => {
      try {
        setLoadingStudents(true);
        setMessage({ type: "", text: "" });

        const [studentsRes, allAttendanceRes] = await Promise.allSettled([
          getAllStudentsWithDetails(true),
          getAllAttendance(),
        ]);

        if (!isMounted) return;

        let rawStudents = [];
        if (
          studentsRes.status === "fulfilled" &&
          Array.isArray(studentsRes.value)
        ) {
          rawStudents = studentsRes.value;
        } else {
          rawStudents = await getAllStudents(true).catch(() => []);
        }

        const rawAttendance =
          allAttendanceRes.status === "fulfilled" &&
          Array.isArray(allAttendanceRes.value)
            ? allAttendanceRes.value
            : allAttendanceRes.value?.data || [];

        // Filter and map students according to Academic Year History
        const filteredStudents = (rawStudents || [])
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
                const sStatus =
                  matchedHist.Status ??
                  matchedHist.status ??
                  s.Status ??
                  s.status;

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
                  Status: sStatus,
                  status: sStatus,
                };
              }
            }
            return s;
          })
          .filter((s) => {
            const cId =
              s.SchoolClassId ?? s.schoolClassId ?? s.ClassId ?? s.classId;
            const sId = s.SectionId ?? s.sectionId;

            const matchesClass = String(cId) === String(classInfo.classId);
            const matchesSection = String(sId) === String(classInfo.sectionId);

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

        setStudents(filteredStudents);

        // Find saved attendance for this date, class, and section
        const matchedAttendance = rawAttendance.find((att) => {
          const rawDate = att.attendanceDate || att.AttendanceDate;
          const dateStr = rawDate ? rawDate.split("T")[0] : "";
          if (dateStr !== attendanceDate) return false;

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

          const matchesClass = cId && String(cId) === String(classInfo.classId);
          const matchesSection =
            sId && String(sId) === String(classInfo.sectionId);
          const matchesAssignment =
            classInfo.teacherAssignmentId &&
            String(taId) === String(classInfo.teacherAssignmentId);

          return (matchesClass && matchesSection) || matchesAssignment;
        });

        let existingRecordsMap = {};
        let existingId = null;

        if (matchedAttendance) {
          existingId =
            matchedAttendance.attendanceId ??
            matchedAttendance.id ??
            matchedAttendance.Id;
          setExistingAttendanceId(existingId);
          setDayRemarks(
            matchedAttendance.remarks || matchedAttendance.Remarks || "",
          );

          // Check if saved as Holiday or Exam
          const savedRemarks = (
            matchedAttendance.remarks ||
            matchedAttendance.Remarks ||
            ""
          ).toLowerCase();
          if (savedRemarks.includes("holiday")) {
            setDayType("Holiday");
          } else if (savedRemarks.includes("exam")) {
            setDayType("Exam");
          }

          const details =
            matchedAttendance.students ||
            matchedAttendance.Students ||
            matchedAttendance.attendanceDetails ||
            matchedAttendance.AttendanceDetails ||
            [];

          details.forEach((d) => {
            const sId = d.studentId ?? d.StudentId;
            existingRecordsMap[sId] = {
              status: d.attendanceStatus ?? d.AttendanceStatus ?? "Present",
              remarks: d.remarks ?? d.Remarks ?? "",
            };
          });

          setMessage({
            type: "info",
            text: `Saved attendance loaded for ${attendanceDate} (Editing Mode). All entries are editable - modify and click Update Attendance to save.`,
          });
        } else {
          setExistingAttendanceId(null);
          setDayRemarks("");
        }

        // Initialize / Pre-fill records for every active student
        const initialMap = {};
        filteredStudents.forEach((st) => {
          const stId = st.id ?? st.Id;
          initialMap[stId] = existingRecordsMap[stId] || {
            status: "Present",
            remarks: "",
          };
        });

        setAttendanceRecords(initialMap);
      } catch (err) {
        console.error("Error loading students or attendance:", err);
        if (isMounted) {
          setMessage({
            type: "error",
            text: "Failed to load students for this class.",
          });
        }
      } finally {
        if (isMounted) {
          setLoadingStudents(false);
        }
      }
    };

    fetchClassStudentsAndAttendance();

    return () => {
      isMounted = false;
    };
  }, [classInfo, attendanceDate, selectedAcademicYearId]);

  // Quick Action: Set all students to a given status
  const handleSetAll = (status) => {
    const updated = { ...attendanceRecords };
    students.forEach((s) => {
      const sId = s.id ?? s.Id;
      updated[sId] = {
        ...(updated[sId] || {}),
        status,
      };
    });
    setAttendanceRecords(updated);
  };

  // Handle Day Category change (Regular / Holiday / Exam)
  const handleDayTypeChange = (type) => {
    setDayType(type);
    if (type === "Holiday") {
      handleSetAll("Holiday");
    } else if (type === "Exam") {
      // Keep statuses or present for exam
    }
  };

  // Change individual student status (Fully Editable)
  const handleStudentStatusChange = (studentId, status) => {
    if (lockedInfo.isLocked) return;
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        status,
      },
    }));
  };

  // Change individual student remarks (Fully Editable)
  const handleStudentRemarksChange = (studentId, remarks) => {
    if (lockedInfo.isLocked) return;
    setAttendanceRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        remarks,
      },
    }));
  };

  // Count metrics
  const totalCount = students.length;
  let presentCount = 0;
  let absentCount = 0;
  let leaveCount = 0;
  let halfDayCount = 0;
  let holidayCount = 0;
  let examCount = 0;

  Object.values(attendanceRecords).forEach((rec) => {
    if (rec.status === "Present") presentCount++;
    else if (rec.status === "Absent") absentCount++;
    else if (rec.status === "Leave") leaveCount++;
    else if (rec.status === "HalfDay") halfDayCount++;
    else if (rec.status === "Holiday") holidayCount++;
    else if (rec.status === "Exam") examCount++;
  });

  const attendancePercentage =
    totalCount > 0 && dayType === "Regular"
      ? (((presentCount + halfDayCount * 0.5) / totalCount) * 100).toFixed(1)
      : dayType === "Holiday"
        ? "N/A (Holiday)"
        : `${presentCount} / ${totalCount}`;

  // Submit attendance to backend (Handles Create or Update)
  const handleSubmitAttendance = async (e) => {
    e.preventDefault();
    if (lockedInfo.isLocked) {
      setMessage({
        type: "error",
        text:
          lockedInfo.reason ||
          "Attendance for this date is permanently locked.",
      });
      return;
    }

    if (students.length === 0) {
      setMessage({
        type: "error",
        text: "No students available to submit attendance.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMessage({ type: "", text: "" });

      // Save day declaration if Holiday or Exam
      if (dayType !== "Regular") {
        setDayDeclaration(
          attendanceDate,
          dayType,
          holidayRemark ||
            (dayType === "Holiday" ? "Declared Holiday" : "Examination Day"),
          classInfo.classId,
          classInfo.sectionId,
          selectedAcademicYearId,
        );
      }

      const studentPayload = students.map((s) => {
        const sId = s.id ?? s.Id;
        const rec = attendanceRecords[sId] || {
          status: "Present",
          remarks: "",
        };
        return {
          studentId: parseInt(sId, 10),
          attendanceStatus: dayType === "Holiday" ? "Holiday" : rec.status,
          remarks:
            rec.remarks || (dayType === "Holiday" ? holidayRemark : null),
        };
      });

      // Resolve a valid teacher assignment ID
      let resolvedAssignmentId = classInfo.teacherAssignmentId;
      if (!resolvedAssignmentId || resolvedAssignmentId === 0) {
        const matched = assignmentsList.find(
          (a) =>
            String(a.schoolClassId ?? a.SchoolClassId) ===
              String(classInfo.classId) &&
            String(a.sectionId ?? a.SectionId) === String(classInfo.sectionId),
        );
        resolvedAssignmentId =
          matched?.id ??
          matched?.Id ??
          (assignmentsList.length > 0
            ? (assignmentsList[0].id ?? assignmentsList[0].Id)
            : 0);
      }

      const payload = {
        teacherAssignmentId: parseInt(resolvedAssignmentId || 0, 10),
        attendanceDate: attendanceDate,
        remarks:
          dayType === "Holiday"
            ? `Holiday: ${holidayRemark || "Declared Holiday"}`
            : dayType === "Exam"
              ? `Exam: ${holidayRemark || "Examination Day"}`
              : dayRemarks || "Daily attendance",
        students: studentPayload,
      };

      if (existingAttendanceId) {
        await updateAttendance({
          attendanceId: existingAttendanceId,
          ...payload,
        });
        setMessage({
          type: "success",
          text: `Attendance for ${attendanceDate} successfully updated!`,
        });
      } else {
        const res = await takeAttendance(payload);
        const newId =
          res?.data?.id ??
          res?.data?.attendanceId ??
          res?.id ??
          res?.attendanceId;
        if (newId) setExistingAttendanceId(newId);
        setMessage({
          type: "success",
          text: `Attendance for ${attendanceDate} successfully submitted!`,
        });
      }
    } catch (err) {
      console.error("Attendance submission failed:", err);
      setMessage({
        type: "error",
        text: err.message || "Failed to submit attendance. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter available classes by selected department
  const filteredClasses = useMemo(() => {
    if (!selectedDepartmentId) return classList;
    return classList.filter((c) => {
      const dId = c.departmentId ?? c.DepartmentId ?? c.department?.id;
      return String(dId) === String(selectedDepartmentId);
    });
  }, [classList, selectedDepartmentId]);

  // Filter available sections by selected class
  const filteredSections = useMemo(() => {
    if (!classInfo?.classId) return sectionList;
    return sectionList.filter((s) => {
      const cId = getSectionClassId(s);
      return String(cId) === String(classInfo?.classId);
    });
  }, [sectionList, classInfo?.classId]);

  // Loading Initial Verification
  if (loadingInitial) {
    return (
      <div className="take-attendance-page">
        <div className="take-attendance-container">
          <div className="loading-card">
            <div className="spinner"></div>
            <p>Verifying Class Teacher assignment...</p>
          </div>
        </div>
      </div>
    );
  }

  // Operator: Read-Only restriction for attendance marking
  if (isOperator) {
    return (
      <div className="take-attendance-page">
        <div className="take-attendance-container">
          <div className="restricted-card">
            <div className="restricted-icon">📋</div>
            <h2>Attendance Marking Restricted</h2>
            <p className="restricted-msg">
              As an Operator, you can view the complete Attendance Register for
              all classes and sections, but attendance marking and updates are
              reserved for Class Teachers and Administrators.
            </p>
            <div className="restricted-actions">
              <button
                className="btn-back-dash"
                onClick={() => navigate("/dashboard/operator")}
              >
                Return to Operator Dashboard
              </button>
              <button
                className="btn-view-reg"
                onClick={() => navigate("/attendance/register")}
              >
                📊 Go to Attendance Register
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not a Class Teacher
  if (!isClassTeacher && !isAdminOrSuper) {
    return (
      <div className="take-attendance-page">
        <div className="take-attendance-container">
          <div className="restricted-card">
            <div className="restricted-icon">🔒</div>
            <h2>Attendance Access Restricted</h2>
            <p className="restricted-msg">{restrictionMessage}</p>
            <div className="restricted-actions">
              <button
                className="btn-back-dash"
                onClick={() => navigate("/dashboard/teacher")}
              >
                Return to Dashboard
              </button>
              <button
                className="btn-view-reg"
                onClick={() => navigate("/attendance/register")}
              >
                View Attendance Register
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="take-attendance-page">
      <div className="take-attendance-container">
        {/* ================= HEADER ================= */}
        <div className="attendance-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              ← Back
            </button>
            <div>
              <h1>Take Daily Attendance</h1>
              <p className="header-sub">
                Class Teacher & Admin Portal: Mark daily presence, holidays, and
                exam attendance
              </p>
            </div>
          </div>

          <div className="header-right-actions">
            <button
              type="button"
              className="btn-declare-holiday-header"
              onClick={() => setShowHolidayModal(true)}
              title="Declare or Manage School / Class Holidays & Week-Offs"
            >
              🏖️ Declare Holiday / Week-Off
            </button>
            <button
              className="btn-to-register"
              onClick={() =>
                navigate(
                  `/attendance/register?classId=${classInfo?.classId}&sectionId=${classInfo?.sectionId}`,
                )
              }
            >
              📊 Attendance Register
            </button>
          </div>
        </div>

        {/* ================= LOCKED ALERT BANNER ================= */}
        {lockedInfo.isLocked && (
          <div
            className={`attendance-locked-alert ${
              lockedInfo.isHoliday ? "holiday-locked-alert" : ""
            }`}
          >
            <span className="lock-icon">{lockedInfo.isHoliday ? "🏖️" : "🔒"}</span>
            <div className="lock-text">
              <strong>
                {lockedInfo.isHoliday
                  ? "ATTENDANCE BLOCKED: DECLARED HOLIDAY / WEEK-OFF"
                  : "ATTENDANCE IS LOCKED FOR THIS DATE"}
              </strong>
              <p>{lockedInfo.reason}</p>
            </div>
            {lockedInfo.isHoliday && (
              <button
                type="button"
                className="btn-manage-holidays-inline"
                onClick={() => setShowHolidayModal(true)}
              >
                View / Manage Holidays
              </button>
            )}
          </div>
        )}

        {/* ================= CLASS & DATE BAR ================= */}
        <div className="class-context-card">
          <div className="context-left">
            {isAdminOrSuper ? (
              <>
                <div className="context-item select-item">
                  <span className="context-label">Academic Year *</span>
                  <select
                    className="context-select"
                    value={selectedAcademicYearId}
                    onChange={(e) => handleAcademicYearChange(e.target.value)}
                  >
                    {academicYears.map((y) => {
                      const yId = y.id ?? y.Id;
                      const yName =
                        y.yearName ?? y.YearName ?? y.name ?? `Year ${yId}`;
                      const isCurr = y.isCurrent ?? y.IsCurrent;
                      return (
                        <option key={yId} value={yId}>
                          {yName} {isCurr ? "(Current)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="context-item select-item">
                  <span className="context-label">Department</span>
                  <select
                    className="context-select"
                    value={selectedDepartmentId}
                    onChange={(e) => handleDepartmentChange(e.target.value)}
                  >
                    <option value="">All Departments</option>
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
                <div className="context-item select-item">
                  <span className="context-label">Select Class *</span>
                  <select
                    className="context-select"
                    value={classInfo?.classId || ""}
                    onChange={(e) => handleAdminClassChange(e.target.value)}
                  >
                    {filteredClasses.map((c) => {
                      const cId = c.id ?? c.Id;
                      const cName =
                        c.className ?? c.ClassName ?? c.name ?? `Class ${cId}`;
                      return (
                        <option key={cId} value={cId}>
                          {cName}
                        </option>
                      );
                    })}
                  </select>
                </div>
                <div className="context-item select-item">
                  <span className="context-label">Select Section *</span>
                  <select
                    className="context-select"
                    value={classInfo?.sectionId || ""}
                    onChange={(e) => handleAdminSectionChange(e.target.value)}
                  >
                    {filteredSections.map((s) => {
                      const sId = s.id ?? s.Id;
                      const sName =
                        s.sectionName ??
                        s.SectionName ??
                        s.name ??
                        `Section ${sId}`;
                      return (
                        <option key={sId} value={sId}>
                          {sName}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </>
            ) : (
              <>
                <div className="context-item">
                  <span className="context-label">Class</span>
                  <span className="context-val highlight">
                    {classInfo?.className || "Class 10"}
                  </span>
                </div>
                <div className="context-item">
                  <span className="context-label">Section</span>
                  <span className="context-val highlight">
                    {classInfo?.sectionName || "Section A"}
                  </span>
                </div>
                <div className="context-item">
                  <span className="context-label">Class Teacher</span>
                  <span className="context-val">
                    {classInfo?.teacher?.teacherName ||
                      classInfo?.teacher?.name ||
                      "Me"}
                  </span>
                </div>
              </>
            )}
          </div>

          <div className="context-right">
            <div className="date-picker-wrap">
              <label htmlFor="attDateInput" className="date-label">
                📅 Attendance Date:
              </label>
              <input
                id="attDateInput"
                type="date"
                className="date-input"
                value={attendanceDate}
                max={todayStr}
                onChange={(e) => setAttendanceDate(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ================= DAY TYPE SELECTOR BAR ================= */}
        <div className="day-type-bar">
          <div className="day-type-left">
            <span className="day-type-label">Day Category:</span>
            <div className="day-type-pills">
              <button
                type="button"
                className={`day-pill ${dayType === "Regular" ? "active regular" : ""}`}
                onClick={() => handleDayTypeChange("Regular")}
                disabled={lockedInfo.isLocked}
              >
                🏫 Regular School Day
              </button>
              <button
                type="button"
                className={`day-pill ${dayType === "Holiday" ? "active holiday" : ""}`}
                onClick={() => handleDayTypeChange("Holiday")}
                disabled={lockedInfo.isLocked}
              >
                🎉 Holiday / Vacation
              </button>
              <button
                type="button"
                className={`day-pill ${dayType === "Exam" ? "active exam" : ""}`}
                onClick={() => handleDayTypeChange("Exam")}
                disabled={lockedInfo.isLocked}
              >
                📝 Examination Day
              </button>
            </div>
          </div>

          {dayType !== "Regular" && (
            <div className="day-type-remark-box">
              <input
                type="text"
                className="day-type-remark-input"
                placeholder={
                  dayType === "Holiday"
                    ? "Holiday Name (e.g. Diwali, Gandhi Jayanti, Sunday)..."
                    : "Exam Name (e.g. Half-Yearly Math, Annual English)..."
                }
                value={holidayRemark}
                onChange={(e) => setHolidayRemark(e.target.value)}
                disabled={lockedInfo.isLocked}
              />
            </div>
          )}
        </div>

        {/* ================= KPI STATS COUNTER BAR ================= */}
        <div className="stats-counter-bar">
          <div className="counter-item total">
            <span className="num">{totalCount}</span>
            <span className="lbl">Total Students</span>
          </div>
          <div className="counter-item present">
            <span className="num">{presentCount}</span>
            <span className="lbl">Present</span>
          </div>
          <div className="counter-item absent">
            <span className="num">{absentCount}</span>
            <span className="lbl">Absent</span>
          </div>
          <div className="counter-item leave">
            <span className="num">{leaveCount}</span>
            <span className="lbl">On Leave</span>
          </div>
          <div className="counter-item halfday">
            <span className="num">{halfDayCount}</span>
            <span className="lbl">Half Day</span>
          </div>
          <div className="counter-item percentage">
            <span className="num">{attendancePercentage}</span>
            <span className="lbl">Daily %</span>
          </div>
        </div>

        {/* ================= QUICK CONTROLS BAR ================= */}
        {!lockedInfo.isLocked && dayType === "Regular" && (
          <div className="quick-actions-bar">
            <div className="quick-left">
              <span className="quick-label">Quick Actions:</span>
              <button
                type="button"
                className="quick-btn present"
                onClick={() => handleSetAll("Present")}
              >
                ✓ Mark All Present
              </button>
              <button
                type="button"
                className="quick-btn absent"
                onClick={() => handleSetAll("Absent")}
              >
                ✕ Mark All Absent
              </button>
            </div>

            {existingAttendanceId && (
              <div className="status-existing-pill">
                ℹ️ Existing attendance loaded for this date (Editing Mode)
              </div>
            )}
          </div>
        )}

        {/* ================= ALERTS ================= */}
        {message.text && (
          <div className={`alert-box ${message.type}`}>{message.text}</div>
        )}

        {/* ================= STUDENT ATTENDANCE ROSTER ================= */}
        {loadingStudents ? (
          <div className="loading-card">
            <div className="spinner"></div>
            <p>Loading student roster...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="empty-card">
            <p>No active students enrolled in this class and section.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmitAttendance}>
            <div className="roster-table-wrapper">
              <table className="roster-table">
                <thead>
                  <tr>
                    <th style={{ width: "65px" }}>Photo</th>
                    <th style={{ width: "60px" }}>Roll</th>
                    <th>Student Name & Admission</th>
                    <th>Father Name</th>
                    <th>Mother Name</th>
                    <th>Mobile No</th>
                    <th style={{ width: "320px", textAlign: "center" }}>
                      Attendance Status
                    </th>
                    <th style={{ width: "160px" }}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st, idx) => {
                    const stId = st.id ?? st.Id;
                    const rollNo =
                      st.rollNo ??
                      st.RollNo ??
                      st.rollNumber ??
                      st.RollNumber ??
                      idx + 1;
                    const admNo =
                      st.admissionNo ??
                      st.AdmissionNo ??
                      st.admissionNumber ??
                      st.AdmissionNumber ??
                      `ADM-${stId}`;
                    const name =
                      [
                        st.firstName || st.FirstName,
                        st.middleName || st.MiddleName,
                        st.lastName || st.LastName,
                      ]
                        .filter(Boolean)
                        .join(" ") ||
                      st.studentName ||
                      st.name ||
                      st.StudentName ||
                      "Student";
                    const photo =
                      st.photo ?? st.Photo ?? st.profilePhotoPath ?? null;
                    const fatherName = st.fatherName || st.FatherName || "-";
                    const motherName = st.motherName || st.MotherName || "-";
                    const phone =
                      st.phoneNumber ||
                      st.PhoneNumber ||
                      st.mobileNo ||
                      st.MobileNo ||
                      "-";

                    const currentRec = attendanceRecords[stId] || {
                      status: dayType === "Holiday" ? "Holiday" : "Present",
                      remarks: "",
                    };
                    const curStatus =
                      dayType === "Holiday" ? "Holiday" : currentRec.status;

                    return (
                      <tr
                        key={stId}
                        className={`student-row row-${(curStatus || "present").toLowerCase()} ${
                          lockedInfo.isLocked ? "row-locked" : ""
                        }`}
                      >
                        <td className="cell-photo">
                          <div className="avatar-wrap">
                            {photo ? (
                              <img
                                src={photo}
                                alt={name}
                                className="student-avatar"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.nextSibling.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className="avatar-placeholder"
                              style={{ display: photo ? "none" : "flex" }}
                            >
                              {name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        </td>
                        <td className="cell-roll">
                          <span className="roll-badge">{rollNo}</span>
                        </td>
                        <td className="cell-name">
                          <div className="name-box">
                            <span className="student-name">{name}</span>
                            <span className="student-adm">Adm: {admNo}</span>
                          </div>
                        </td>
                        <td className="cell-parent-name">{fatherName}</td>
                        <td className="cell-parent-name">{motherName}</td>
                        <td className="cell-phone">{phone}</td>
                        <td className="cell-status-btns">
                          {dayType === "Holiday" ? (
                            <span className="status-badge-holiday">
                              🎉 Holiday ({holidayRemark || "Off Day"})
                            </span>
                          ) : (
                            <div className="status-toggle-group">
                              <button
                                type="button"
                                className={`status-btn btn-p ${
                                  curStatus === "Present" ? "active" : ""
                                }`}
                                onClick={() =>
                                  handleStudentStatusChange(stId, "Present")
                                }
                                disabled={lockedInfo.isLocked}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                className={`status-btn btn-a ${
                                  curStatus === "Absent" ? "active" : ""
                                }`}
                                onClick={() =>
                                  handleStudentStatusChange(stId, "Absent")
                                }
                                disabled={lockedInfo.isLocked}
                              >
                                Absent
                              </button>
                              <button
                                type="button"
                                className={`status-btn btn-l ${
                                  curStatus === "Leave" ? "active" : ""
                                }`}
                                onClick={() =>
                                  handleStudentStatusChange(stId, "Leave")
                                }
                                disabled={lockedInfo.isLocked}
                              >
                                Leave
                              </button>
                              <button
                                type="button"
                                className={`status-btn btn-hd ${
                                  curStatus === "HalfDay" ? "active" : ""
                                }`}
                                onClick={() =>
                                  handleStudentStatusChange(stId, "HalfDay")
                                }
                                disabled={lockedInfo.isLocked}
                              >
                                Half Day
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="cell-remarks">
                          <input
                            type="text"
                            className="student-remark-input"
                            placeholder="Optional remark..."
                            value={currentRec.remarks}
                            onChange={(e) =>
                              handleStudentRemarksChange(stId, e.target.value)
                            }
                            disabled={lockedInfo.isLocked}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Bottom Bar: General Remarks & Submit */}
            <div className="attendance-bottom-bar">
              <div className="day-remarks-group">
                <label htmlFor="dayRemarksInput">Day Remarks / Notes:</label>
                <input
                  id="dayRemarksInput"
                  type="text"
                  placeholder="e.g. Regular working day, Sports period, Rainy day..."
                  value={dayRemarks}
                  onChange={(e) => setDayRemarks(e.target.value)}
                  disabled={lockedInfo.isLocked}
                />
              </div>

              <div className="submit-actions">
                <button
                  type="submit"
                  className="btn-save-attendance"
                  disabled={submitting || lockedInfo.isLocked}
                >
                  {submitting
                    ? "Saving Attendance..."
                    : lockedInfo.isHoliday
                      ? "🏖️ Attendance Blocked: Declared Holiday"
                      : lockedInfo.isLocked
                        ? "🔒 Attendance Locked"
                        : existingAttendanceId
                          ? "💾 Update Attendance"
                          : "✓ Submit Attendance"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* ================= MODAL: DECLARE HOLIDAY / WEEK-OFF (ATH STYLE) ================= */}
        {showHolidayModal && (
          <DeclareHolidayModal
            onClose={() => setShowHolidayModal(false)}
            onSaved={() => {
              // Re-check lock and reload day declaration for currently chosen date
              if (classInfo && attendanceDate) {
                const lockCheck = checkAttendanceLocked(
                  attendanceDate,
                  classInfo.classId,
                  classInfo.sectionId,
                  selectedAcademicYearId,
                );
                setLockedInfo(lockCheck);

                const dayDecls = getDayDeclarations(
                  classInfo.classId,
                  classInfo.sectionId,
                  selectedAcademicYearId,
                );
                const decl = dayDecls[attendanceDate];
                if (decl) {
                  setDayType(decl.type || "Holiday");
                  setHolidayRemark(decl.remark || "");
                } else {
                  setDayType("Regular");
                  setHolidayRemark("");
                }
              }
            }}
            classId={classInfo?.classId || "default"}
            sectionId={classInfo?.sectionId || "default"}
            academicYearId={selectedAcademicYearId || "default"}
            departmentList={departments}
            classList={classList}
            students={students}
            teacherAssignmentId={classInfo?.teacherAssignmentId}
          />
        )}
      </div>
    </div>
  );
}

export default TakeAttendance;
