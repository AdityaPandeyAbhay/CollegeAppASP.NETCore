import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Dashboard.css";
import "./TeacherDashboard.css";
import { getUsername } from "../../Utils/auth";
import { getMyClassTeacherAssignment } from "../../Services/classTeacherService";
import { getAllStudentsWithDetails } from "../../Services/studentService";
import ErrorBoundary from "../../Component/ErrorBoundary.jsx";
import SchoolVisionMission from "../../components/Common/SchoolVisionMission";

// Helper to safely extract string text from any value (primitive or object)
const extractString = (val, fallback = "") => {
  if (val === null || val === undefined) return fallback;
  if (typeof val === "string") return val;
  if (typeof val === "number") return String(val);
  if (typeof val === "object") {
    return (
      val.yearName ||
      val.YearName ||
      val.className ||
      val.ClassName ||
      val.sectionName ||
      val.SectionName ||
      val.departmentName ||
      val.DepartmentName ||
      val.name ||
      val.Name ||
      fallback
    );
  }
  return String(val);
};

// Ensure all fields inside classInfo are strictly primitives, never React-unrenderable objects
const sanitizeClassInfo = (raw) => {
  if (!raw || !raw.isClassTeacher) return null;
  return {
    ...raw,
    className: extractString(raw.className, "Class"),
    sectionName: extractString(raw.sectionName, ""),
    departmentName: extractString(raw.departmentName, "General"),
    academicYearName: extractString(raw.academicYearName, "Current Session"),
  };
};

function TeacherDashboardInner() {
  const username = getUsername() || localStorage.getItem("username") || "Teacher";
  const navigate = useNavigate();

  // =====================================================
  // CLASS TEACHER ASSIGNMENT INFO & STATS
  // =====================================================
  const [classInfo, setClassInfo] = useState(() => {
    try {
      const raw =
        sessionStorage.getItem("teacherAssignedClassInfo") ||
        localStorage.getItem("teacherAssignedClassInfo");
      if (raw) {
        return sanitizeClassInfo(JSON.parse(raw));
      }
    } catch (_) {}
    return null;
  });

  const [loadingClassInfo, setLoadingClassInfo] = useState(true);
  const [studentCount, setStudentCount] = useState(null);

  // =====================================================
  // SIDEBAR DROPDOWN STATE (PERSISTED - ACCORDION STYLE)
  // =====================================================
  const [activeDropdown, setActiveDropdown] = useState(() => {
    try {
      const saved = localStorage.getItem("teacherActiveDropdown");
      if (saved) return saved;
      if (localStorage.getItem("teacherStudentDropdown") === "true") return "student";
      if (localStorage.getItem("teacherFeeDropdown") === "true") return "fee";
      if (localStorage.getItem("teacherExamDropdown") === "true") return "exam";
      if (localStorage.getItem("teacherResultDropdown") === "true") return "result";
      if (localStorage.getItem("teacherDepartmentDropdown") === "true") return "department";
      if (localStorage.getItem("teacherClassDropdown") === "true") return "class";
      if (localStorage.getItem("teacherSubjectDropdown") === "true") return "subject";
      if (localStorage.getItem("teacherAttendanceDropdown") === "true") return "attendance";
      if (localStorage.getItem("teacherNoticeDropdown") === "true") return "notice";
    } catch (_) {}
    return "";
  });

  // Load teacher assignment on mount
  useEffect(() => {
    let isMounted = true;
    const fetchAssignment = async () => {
      try {
        setLoadingClassInfo(true);
        const info = await getMyClassTeacherAssignment().catch(() => null);
        if (!isMounted) return;

        if (info && info.isClassTeacher) {
          const sanitized = sanitizeClassInfo(info);
          setClassInfo(sanitized);
          try {
            sessionStorage.setItem("teacherAssignedClassInfo", JSON.stringify(sanitized));
            localStorage.setItem("teacherAssignedClassInfo", JSON.stringify(sanitized));
          } catch (_) {}

          // Fetch student count in teacher's class
          try {
            const allStudents = await getAllStudentsWithDetails().catch(() => []);
            if (!isMounted) return;
            const count = (Array.isArray(allStudents) ? allStudents : []).filter((s) => {
              const cId = s.SchoolClassId ?? s.schoolClassId ?? s.ClassId ?? s.classId;
              const sId = s.SectionId ?? s.sectionId;
              const matchClass = String(cId) === String(info.classId);
              const matchSec = !info.sectionId || String(sId) === String(info.sectionId);
              return matchClass && matchSec;
            }).length;
            setStudentCount(count);
          } catch (_) {
            if (isMounted) setStudentCount(0);
          }
        } else {
          setClassInfo(null);
          setStudentCount(0);
        }
      } catch (err) {
        console.warn("Could not load teacher assignment in TeacherDashboard:", err);
      } finally {
        if (isMounted) setLoadingClassInfo(false);
      }
    };
    fetchAssignment();

    return () => {
      isMounted = false;
    };
  }, []);

  // Toggle accordion dropdown cleanly and safely
  const toggleDropdown = (key, e) => {
    if (e) {
      if (typeof e.preventDefault === "function") e.preventDefault();
      if (typeof e.stopPropagation === "function") e.stopPropagation();
    }
    const next = activeDropdown === key ? "" : key;
    try {
      localStorage.setItem("teacherActiveDropdown", next);
    } catch (_) {}
    setActiveDropdown(next);
  };

  // Helper for navigating to student list pre-selected with teacher's assigned class
  const handleNavAllStudents = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (classInfo && classInfo.isClassTeacher) {
      navigate("/student/all", {
        state: {
          departmentId: classInfo.departmentId,
          classId: classInfo.classId,
          sectionId: classInfo.sectionId,
          academicYearId: classInfo.academicYearId,
          fromTeacherDashboard: true,
        },
      });
    } else {
      navigate("/student/all", { state: { fromTeacherDashboard: true } });
    }
  };

  // Helper for navigating to student fees pre-filtered to teacher's class
  const handleNavStudentFee = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (classInfo && classInfo.isClassTeacher) {
      navigate("/student-fee/all", {
        state: {
          departmentId: classInfo.departmentId,
          classId: classInfo.classId,
          sectionId: classInfo.sectionId,
          academicYearId: classInfo.academicYearId,
          fromTeacherDashboard: true,
        },
      });
    } else {
      navigate("/student-fee/all", { state: { fromTeacherDashboard: true } });
    }
  };

  // Helper for navigating to class fee structure pre-filtered to teacher's class
  const handleNavClassFeeStructure = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (classInfo && classInfo.isClassTeacher) {
      navigate("/fee-structure/class", {
        state: {
          departmentId: classInfo.departmentId,
          classId: classInfo.classId,
          academicYearId: classInfo.academicYearId,
          fromTeacherDashboard: true,
        },
      });
    } else {
      navigate("/fee-structure/class", { state: { fromTeacherDashboard: true } });
    }
  };

  // Helper for navigating to student result matrix pre-filtered to teacher's class
  const handleNavStudentResult = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (classInfo && classInfo.isClassTeacher) {
      navigate("/student-result/student", {
        state: {
          departmentId: classInfo.departmentId,
          classId: classInfo.classId,
          sectionId: classInfo.sectionId,
          academicYearId: classInfo.academicYearId,
          fromTeacherDashboard: true,
        },
      });
    } else {
      navigate("/student-result/student", { state: { fromTeacherDashboard: true } });
    }
  };

  // Helper for navigating to batch result pre-filtered to teacher's class
  const handleNavBatchResult = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (classInfo && classInfo.isClassTeacher) {
      navigate("/student-result/batch", {
        state: {
          departmentId: classInfo.departmentId,
          classId: classInfo.classId,
          sectionId: classInfo.sectionId,
          academicYearId: classInfo.academicYearId,
          fromTeacherDashboard: true,
        },
      });
    } else {
      navigate("/student-result/batch", { state: { fromTeacherDashboard: true } });
    }
  };

  // Helper for navigating to result details
  const handleNavResultDetails = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (classInfo && classInfo.isClassTeacher) {
      navigate("/result-detail/details", {
        state: {
          departmentId: classInfo.departmentId,
          classId: classInfo.classId,
          sectionId: classInfo.sectionId,
          academicYearId: classInfo.academicYearId,
          fromTeacherDashboard: true,
        },
      });
    } else {
      navigate("/result-detail/details", { state: { fromTeacherDashboard: true } });
    }
  };

  const displayClassName = extractString(classInfo?.className, "Not Assigned");
  const displaySectionName = extractString(classInfo?.sectionName, "");
  const displayDepartmentName = extractString(classInfo?.departmentName, "General");
  const displayAcademicYearName = extractString(classInfo?.academicYearName, "Current Session");

  return (
    <div className="dashboard">
      {/* =====================================================
          SIDEBAR (SUPER ADMIN & ADMIN ALIGNED)
      ===================================================== */}
      <aside className="dashboard-sidebar">
        <h2>Teacher Panel {username || ""}</h2>

        {/* Dashboard Link */}
        <button type="button" onClick={() => navigate("/dashboard/teacher")}>
          Dashboard
        </button>

        {/* 1. STUDENTS */}
        <button
          type="button"
          className="sidebar-dropdown-button"
          onClick={(e) => toggleDropdown("student", e)}
        >
          <span>Students</span>
          <span className="dropdown-icon">
            {activeDropdown === "student" ? "▲" : "▼"}
          </span>
        </button>
        {activeDropdown === "student" && (
          <div className="sidebar-dropdown-box">
            <button type="button" onClick={handleNavAllStudents}>
              All Students
            </button>
          </div>
        )}

        {/* 2. STUDENT FEES */}
        <button
          type="button"
          className="sidebar-dropdown-button"
          onClick={(e) => toggleDropdown("fee", e)}
        >
          <span>Student Fees</span>
          <span className="dropdown-icon">
            {activeDropdown === "fee" ? "▲" : "▼"}
          </span>
        </button>
        {activeDropdown === "fee" && (
          <div className="sidebar-dropdown-box">
            <button type="button" onClick={handleNavStudentFee}>
              Student Fee Status
            </button>
            <button type="button" onClick={handleNavClassFeeStructure}>
              Class Fee Structure
            </button>
            <button type="button" onClick={() => navigate("/fee-category/all")}>
              All Fee Categories
            </button>
          </div>
        )}

        {/* 3. EXAMS */}
        <button
          type="button"
          className="sidebar-dropdown-button"
          onClick={(e) => toggleDropdown("exam", e)}
        >
          <span>Exams</span>
          <span className="dropdown-icon">
            {activeDropdown === "exam" ? "▲" : "▼"}
          </span>
        </button>
        {activeDropdown === "exam" && (
          <div className="sidebar-dropdown-box">
            <button type="button" onClick={() => navigate("/exam/all")}>
              All Exams
            </button>
          </div>
        )}

        {/* 4. RESULTS */}
        <button
          type="button"
          className="sidebar-dropdown-button"
          onClick={(e) => toggleDropdown("result", e)}
        >
          <span>Results</span>
          <span className="dropdown-icon">
            {activeDropdown === "result" ? "▲" : "▼"}
          </span>
        </button>
        {activeDropdown === "result" && (
          <div className="sidebar-dropdown-box">
            <button type="button" onClick={handleNavStudentResult}>
              Get Student Result
            </button>
            <button type="button" onClick={handleNavBatchResult}>
              Get Batch Result
            </button>
            <button type="button" onClick={handleNavResultDetails}>
              Get Result Details
            </button>
          </div>
        )}

        {/* 5. DEPARTMENTS */}
        <button
          type="button"
          className="sidebar-dropdown-button"
          onClick={(e) => toggleDropdown("department", e)}
        >
          <span>Departments</span>
          <span className="dropdown-icon">
            {activeDropdown === "department" ? "▲" : "▼"}
          </span>
        </button>
        {activeDropdown === "department" && (
          <div className="sidebar-dropdown-box">
            <button type="button" onClick={() => navigate("/department/all")}>
              All Departments
            </button>
          </div>
        )}

        {/* 6. CLASSES */}
        <button
          type="button"
          className="sidebar-dropdown-button"
          onClick={(e) => toggleDropdown("class", e)}
        >
          <span>Classes</span>
          <span className="dropdown-icon">
            {activeDropdown === "class" ? "▲" : "▼"}
          </span>
        </button>
        {activeDropdown === "class" && (
          <div className="sidebar-dropdown-box">
            <button type="button" onClick={() => navigate("/class/all")}>
              All Classes
            </button>
          </div>
        )}

        {/* 7. SUBJECTS */}
        <button
          type="button"
          className="sidebar-dropdown-button"
          onClick={(e) => toggleDropdown("subject", e)}
        >
          <span>Subjects</span>
          <span className="dropdown-icon">
            {activeDropdown === "subject" ? "▲" : "▼"}
          </span>
        </button>
        {activeDropdown === "subject" && (
          <div className="sidebar-dropdown-box">
            <button type="button" onClick={() => navigate("/subject/all")}>
              All Subjects
            </button>
          </div>
        )}

        {/* 8. ATTENDANCE & MY CLASSES */}
        <button
          type="button"
          className="sidebar-dropdown-button"
          onClick={(e) => toggleDropdown("attendance", e)}
        >
          <span>Attendance & Classes</span>
          <span className="dropdown-icon">
            {activeDropdown === "attendance" ? "▲" : "▼"}
          </span>
        </button>
        {activeDropdown === "attendance" && (
          <div className="sidebar-dropdown-box">
            <button type="button" onClick={() => navigate("/class-teachers")}>
              My Classes / Allocations
            </button>
            <button type="button" onClick={() => navigate("/attendance/take")}>
              Take Attendance
            </button>
            <button type="button" onClick={() => navigate("/attendance/register")}>
              Attendance Register
            </button>
          </div>
        )}

        {/* 9. NOTICES */}
        <button
          type="button"
          className="sidebar-dropdown-button"
          onClick={(e) => toggleDropdown("notice", e)}
        >
          <span>Notices</span>
          <span className="dropdown-icon">
            {activeDropdown === "notice" ? "▲" : "▼"}
          </span>
        </button>
        {activeDropdown === "notice" && (
          <div className="sidebar-dropdown-box">
            <button type="button" onClick={() => navigate("/notice")}>
              All Published Notices
            </button>
          </div>
        )}
      </aside>

      {/* =====================================================
          MAIN CONTENT AREA (CLEAN EXECUTIVE SUPER ADMIN STYLE)
      ===================================================== */}
      <main className="dashboard-content">
        <h1>Welcome, {username || "Teacher"}</h1>

        {/* CLASS TEACHER STATUS BANNER */}
        {!loadingClassInfo && (
          <div
            className={`teacher-class-banner ${
              classInfo?.isClassTeacher
                ? "teacher-class-banner-assigned"
                : "teacher-class-banner-unassigned"
            }`}
          >
            <div className="teacher-banner-left">
              <span className="teacher-banner-icon">
                {classInfo?.isClassTeacher ? "👑" : "👨‍🏫"}
              </span>
              <div>
                <h3 className="teacher-banner-title">
                  {classInfo?.isClassTeacher
                    ? `Class Teacher: ${displayClassName}${displaySectionName ? ` - ${displaySectionName}` : ""}`
                    : "Subject Faculty"}
                </h3>
                <p className="teacher-banner-subtitle">
                  {classInfo?.isClassTeacher
                    ? `Department: ${displayDepartmentName} | Academic Year: ${displayAcademicYearName} | All records and filters automatically linked to your class.`
                    : "You are currently not designated as a Class Teacher. You can view all academic departments, classes, subjects, and notices."}
                </p>
              </div>
            </div>
            {classInfo?.isClassTeacher && (
              <span className="teacher-banner-badge">
                👑 Designated Class Teacher
              </span>
            )}
          </div>
        )}

        <SchoolVisionMission />
      </main>
    </div>
  );
}

function TeacherDashboard() {
  return (
    <ErrorBoundary>
      <TeacherDashboardInner />
    </ErrorBoundary>
  );
}

export default TeacherDashboard;
