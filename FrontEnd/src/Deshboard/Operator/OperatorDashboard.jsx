import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../Dashboard.css";
import "./OperatorDashboard.css";

import { getUsername, getUserId } from "../../Utils/auth";
import {
  getAllNonTeachingStaff,
  getSavedStaffExtraFields,
} from "../../Services/nonTeachingStaffService";
import { formatFileUrl } from "../../Utils/fileHelper";
import UserProfileModal from "../../components/Common/UserProfileModal";
import SchoolVisionMission from "../../components/Common/SchoolVisionMission";

function OperatorDashboard() {
  const username = getUsername();
  const userId = getUserId();
  const navigate = useNavigate();

  // Profile Modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [operatorPhoto, setOperatorPhoto] = useState(null);
  const [operatorFullName, setOperatorFullName] = useState("");

  // =====================================================
  // FETCH OPERATOR PHOTO FOR ROUND CIRCLE
  // =====================================================
  useEffect(() => {
    loadOperatorAvatar();
  }, []);

  const loadOperatorAvatar = async () => {
    try {
      const allStaff = await getAllNonTeachingStaff();
      const list = Array.isArray(allStaff)
        ? allStaff
        : allStaff?.data || allStaff?.Data || [];

      const uNameLower = String(username || "")
        .toLowerCase()
        .trim();
      const uIdStr = String(userId || "").trim();

      const matched = list.find((s) => {
        const sUserId = String(s.userId || s.UserId || "");
        const sCode = String(s.staffCode || s.StaffCode || "")
          .toLowerCase()
          .trim();
        const sEmail = String(s.email || s.Email || "")
          .toLowerCase()
          .trim();
        const sPhone = String(s.phoneNumber || s.PhoneNumber || "").trim();

        if (uIdStr && sUserId === uIdStr) return true;
        if (
          uNameLower &&
          (sCode === uNameLower ||
            sEmail === uNameLower ||
            sPhone === uNameLower)
        )
          return true;
        return false;
      });

      const extra =
        getSavedStaffExtraFields(userId) ||
        getSavedStaffExtraFields(username) ||
        {};
      const photo = matched?.photo || matched?.Photo || extra?.photo || null;
      setOperatorPhoto(photo);

      const fName = matched
        ? [
            matched.firstName || matched.FirstName,
            matched.lastName || matched.LastName,
          ]
            .filter(Boolean)
            .join(" ")
        : username;
      setOperatorFullName(fName || "Operator");
    } catch (e) {
      console.warn("Could not load operator avatar:", e);
    }
  };

  // =====================================================
  // DROPDOWN STATES WITH LOCAL STORAGE PERSISTENCE
  // =====================================================
  const [userDropdown, setUserDropdown] = useState(() => {
    return localStorage.getItem("operatorUserDropdown") === "true";
  });

  const [teacherDropdown, setTeacherDropdown] = useState(() => {
    return localStorage.getItem("operatorTeacherDropdown") === "true";
  });

  const [studentDropdown, setStudentDropdown] = useState(() => {
    return localStorage.getItem("operatorStudentDropdown") === "true";
  });

  const [nonTeachingStaffDropdown, setNonTeachingStaffDropdown] = useState(
    () => {
      return (
        localStorage.getItem("operatorNonTeachingStaffDropdown") === "true"
      );
    },
  );

  const [noticeDropdown, setNoticeDropdown] = useState(() => {
    return localStorage.getItem("operatorNoticeDropdown") === "true";
  });

  const [feeSettingsDropdown, setFeeSettingsDropdown] = useState(() => {
    return localStorage.getItem("operatorFeeSettingsDropdown") === "true";
  });

  const [feeStructureDropdown, setFeeStructureDropdown] = useState(() => {
    return localStorage.getItem("operatorFeeStructureDropdown") === "true";
  });

  const [departmentDropdown, setDepartmentDropdown] = useState(() => {
    return localStorage.getItem("operatorDepartmentDropdown") === "true";
  });

  const [classDropdown, setClassDropdown] = useState(() => {
    return localStorage.getItem("operatorClassDropdown") === "true";
  });

  const [sectionDropdown, setSectionDropdown] = useState(() => {
    return localStorage.getItem("operatorSectionDropdown") === "true";
  });

  const [subjectDropdown, setSubjectDropdown] = useState(() => {
    return localStorage.getItem("operatorSubjectDropdown") === "true";
  });

  const [attendanceDropdown, setAttendanceDropdown] = useState(() => {
    return localStorage.getItem("operatorAttendanceDropdown") === "true";
  });

  const [academicYearDropdown, setAcademicYearDropdown] = useState(() => {
    return localStorage.getItem("operatorAcademicYearDropdown") === "true";
  });

  const [resultDropdown, setResultDropdown] = useState(() => {
    return localStorage.getItem("operatorResultDropdown") === "true";
  });

  const [examNestedDropdown, setExamNestedDropdown] = useState(() => {
    return localStorage.getItem("operatorExamNestedDropdown") === "true";
  });

  const [resultBatchNestedDropdown, setResultBatchNestedDropdown] = useState(
    () => {
      return (
        localStorage.getItem("operatorResultBatchNestedDropdown") === "true"
      );
    },
  );

  const [studentResultNestedDropdown, setStudentResultNestedDropdown] =
    useState(() => {
      return (
        localStorage.getItem("operatorStudentResultNestedDropdown") === "true"
      );
    });

  const [resultDetailNestedDropdown, setResultDetailNestedDropdown] = useState(
    () => {
      return (
        localStorage.getItem("operatorResultDetailNestedDropdown") === "true"
      );
    },
  );

  // =====================================================
  // ACCORDION HELPER: CLOSE OTHER TOP-LEVEL DROPDOWNS
  // =====================================================
  const closeOtherTopLevelDropdowns = (currentKey) => {
    const dropdownMap = {
      user: { setter: setUserDropdown, key: "operatorUserDropdown" },
      teacher: { setter: setTeacherDropdown, key: "operatorTeacherDropdown" },
      student: { setter: setStudentDropdown, key: "operatorStudentDropdown" },
      nonTeachingStaff: {
        setter: setNonTeachingStaffDropdown,
        key: "operatorNonTeachingStaffDropdown",
      },
      notice: { setter: setNoticeDropdown, key: "operatorNoticeDropdown" },
      feeSettings: {
        setter: setFeeSettingsDropdown,
        key: "operatorFeeSettingsDropdown",
      },
      result: {
        setter: setResultDropdown,
        key: "operatorResultDropdown",
      },
      academicYear: {
        setter: setAcademicYearDropdown,
        key: "operatorAcademicYearDropdown",
      },
      department: {
        setter: setDepartmentDropdown,
        key: "operatorDepartmentDropdown",
      },
      class: { setter: setClassDropdown, key: "operatorClassDropdown" },
      section: { setter: setSectionDropdown, key: "operatorSectionDropdown" },
      subject: { setter: setSubjectDropdown, key: "operatorSubjectDropdown" },
      attendance: {
        setter: setAttendanceDropdown,
        key: "operatorAttendanceDropdown",
      },
    };

    Object.entries(dropdownMap).forEach(([name, item]) => {
      if (name !== currentKey) {
        item.setter(false);
        localStorage.setItem(item.key, "false");
      }
    });

    if (currentKey !== "feeSettings") {
      setFeeStructureDropdown(false);
      localStorage.setItem("operatorFeeStructureDropdown", "false");
    }

    if (currentKey !== "result") {
      setExamNestedDropdown(false);
      localStorage.setItem("operatorExamNestedDropdown", "false");
      setResultBatchNestedDropdown(false);
      localStorage.setItem("operatorResultBatchNestedDropdown", "false");
      setStudentResultNestedDropdown(false);
      localStorage.setItem("operatorStudentResultNestedDropdown", "false");
      setResultDetailNestedDropdown(false);
      localStorage.setItem("operatorResultDetailNestedDropdown", "false");
    }
  };

  // Dropdown toggles
  const toggleUserDropdown = () => {
    setUserDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("user");
      localStorage.setItem("operatorUserDropdown", String(newState));
      return newState;
    });
  };

  const toggleTeacherDropdown = () => {
    setTeacherDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("teacher");
      localStorage.setItem("operatorTeacherDropdown", String(newState));
      return newState;
    });
  };

  const toggleStudentDropdown = () => {
    setStudentDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("student");
      localStorage.setItem("operatorStudentDropdown", String(newState));
      return newState;
    });
  };

  const toggleNonTeachingStaffDropdown = () => {
    setNonTeachingStaffDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("nonTeachingStaff");
      localStorage.setItem(
        "operatorNonTeachingStaffDropdown",
        String(newState),
      );
      return newState;
    });
  };

  const toggleNoticeDropdown = () => {
    setNoticeDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("notice");
      localStorage.setItem("operatorNoticeDropdown", String(newState));
      return newState;
    });
  };

  const toggleFeeSettingsDropdown = () => {
    setFeeSettingsDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        closeOtherTopLevelDropdowns("feeSettings");
      } else {
        setFeeStructureDropdown(false);
        localStorage.setItem("operatorFeeStructureDropdown", "false");
      }
      localStorage.setItem("operatorFeeSettingsDropdown", String(newState));
      return newState;
    });
  };

  const toggleFeeStructureDropdown = () => {
    setFeeStructureDropdown((prev) => {
      const newState = !prev;
      localStorage.setItem("operatorFeeStructureDropdown", String(newState));
      return newState;
    });
  };

  const toggleDepartmentDropdown = () => {
    setDepartmentDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("department");
      localStorage.setItem("operatorDepartmentDropdown", String(newState));
      return newState;
    });
  };

  const toggleClassDropdown = () => {
    setClassDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("class");
      localStorage.setItem("operatorClassDropdown", String(newState));
      return newState;
    });
  };

  const toggleSectionDropdown = () => {
    setSectionDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("section");
      localStorage.setItem("operatorSectionDropdown", String(newState));
      return newState;
    });
  };

  const toggleSubjectDropdown = () => {
    setSubjectDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("subject");
      localStorage.setItem("operatorSubjectDropdown", String(newState));
      return newState;
    });
  };

  const toggleAttendanceDropdown = () => {
    const nextState = !attendanceDropdown;
    setAttendanceDropdown(nextState);
    localStorage.setItem(
      "operatorAttendanceDropdown",
      nextState ? "true" : "false",
    );
    if (nextState) {
      closeOtherTopLevelDropdowns("attendance");
    }
  };

  const toggleAcademicYearDropdown = () => {
    setAcademicYearDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("academicYear");
      localStorage.setItem("operatorAcademicYearDropdown", String(newState));
      return newState;
    });
  };

  const toggleResultDropdown = () => {
    setResultDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        closeOtherTopLevelDropdowns("result");
      } else {
        setExamNestedDropdown(false);
        localStorage.setItem("operatorExamNestedDropdown", "false");
        setResultBatchNestedDropdown(false);
        localStorage.setItem("operatorResultBatchNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("operatorStudentResultNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("operatorResultDetailNestedDropdown", "false");
      }
      localStorage.setItem("operatorResultDropdown", String(newState));
      return newState;
    });
  };

  const toggleExamNestedDropdown = () => {
    setExamNestedDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        setResultBatchNestedDropdown(false);
        localStorage.setItem("operatorResultBatchNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("operatorStudentResultNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("operatorResultDetailNestedDropdown", "false");
      }
      localStorage.setItem("operatorExamNestedDropdown", String(newState));
      return newState;
    });
  };

  const toggleResultBatchNestedDropdown = () => {
    setResultBatchNestedDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        setExamNestedDropdown(false);
        localStorage.setItem("operatorExamNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("operatorStudentResultNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("operatorResultDetailNestedDropdown", "false");
      }
      localStorage.setItem(
        "operatorResultBatchNestedDropdown",
        String(newState),
      );
      return newState;
    });
  };

  const toggleStudentResultNestedDropdown = () => {
    setStudentResultNestedDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        setExamNestedDropdown(false);
        localStorage.setItem("operatorExamNestedDropdown", "false");
        setResultBatchNestedDropdown(false);
        localStorage.setItem("operatorResultBatchNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("operatorResultDetailNestedDropdown", "false");
      }
      localStorage.setItem(
        "operatorStudentResultNestedDropdown",
        String(newState),
      );
      return newState;
    });
  };

  const toggleResultDetailNestedDropdown = () => {
    setResultDetailNestedDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        setExamNestedDropdown(false);
        localStorage.setItem("operatorExamNestedDropdown", "false");
        setResultBatchNestedDropdown(false);
        localStorage.setItem("operatorResultBatchNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("operatorStudentResultNestedDropdown", "false");
      }
      localStorage.setItem(
        "operatorResultDetailNestedDropdown",
        String(newState),
      );
      return newState;
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    navigate("/login");
  };

  return (
    <div className="dashboard">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside className="dashboard-sidebar">
        {/* OPERATOR TITLE & PROFILE CARD */}
        <div className="operator-sidebar-profile-header">
          <h2>Operator Panel</h2>
          <span className="operator-panel-subtitle">{operatorFullName}</span>

          {/* CIRCLE PROFILE BUTTON (Between Dashboard Header & Controls) */}
          <div
            className="operator-circle-avatar-container"
            onClick={() => setProfileModalOpen(true)}
            title="Click to view full 75% Operator Profile"
          >
            {operatorPhoto ? (
              <img
                src={formatFileUrl(operatorPhoto)}
                alt={operatorFullName}
                className="operator-round-circle-img"
              />
            ) : (
              <div className="operator-round-circle-placeholder">
                {String(operatorFullName || username || "O")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <span className="avatar-online-dot"></span>
          </div>
          <button
            type="button"
            className="operator-view-profile-btn"
            onClick={() => setProfileModalOpen(true)}
          >
            👤 My Profile
          </button>
        </div>

        {/* DASHBOARD LINK */}
        <button onClick={() => navigate("/dashboard/operator")}>
          Dashboard
        </button>

        {/* =====================================================
            STUDENTS
        ===================================================== */}
        <button
          className="sidebar-dropdown-button"
          onClick={toggleStudentDropdown}
        >
          <span>Students</span>
          <span className="dropdown-icon">{studentDropdown ? "▲" : "▼"}</span>
        </button>

        {studentDropdown && (
          <div className="sidebar-dropdown-box">
            <button onClick={() => navigate("/student/create")}>
              Create Student
            </button>
            <button onClick={() => navigate("/student/all")}>
              All Students
            </button>
            <button onClick={() => navigate("/student/name")}>
              Get Student By Name
            </button>
            <button onClick={() => navigate("/student/update")}>
              Update Student
            </button>
            <button onClick={() => navigate("/student/delete")}>
              Delete Student
            </button>
            <button onClick={() => navigate("/student/promote")}>
              Promote Students
            </button>
          </div>
        )}

        {/* =====================================================
            TEACHERS
        ===================================================== */}
        <button
          className="sidebar-dropdown-button"
          onClick={toggleTeacherDropdown}
        >
          <span>Teachers</span>
          <span className="dropdown-icon">{teacherDropdown ? "▲" : "▼"}</span>
        </button>

        {teacherDropdown && (
          <div className="sidebar-dropdown-box">
            <button onClick={() => navigate("/teacher/create")}>
              Create Teacher
            </button>
            <button onClick={() => navigate("/teacher/all")}>
              All Teachers
            </button>
            <button onClick={() => navigate("/teacher/code")}>
              Get Teacher By Code
            </button>
            <button onClick={() => navigate("/teacher/name")}>
              Get Teacher By Name
            </button>
            <button onClick={() => navigate("/teacher/update")}>
              Update Teacher
            </button>
            <button onClick={() => navigate("/teacher/delete")}>
              Delete Teacher
            </button>
            <button onClick={() => navigate("/class-teachers")}>
              Class Teachers &amp; Faculty Allocations
            </button>
            <button onClick={() => navigate("/class-teachers/assign")}>
              Assign Teachers to Class
            </button>
            <button onClick={() => navigate("/teacher-assignment/class")}>
              Faculty by Class (GET)
            </button>
          </div>
        )}

        {/* =====================================================
            NON TEACHING STAFF
        ===================================================== */}
        <button
          className="sidebar-dropdown-button"
          onClick={toggleNonTeachingStaffDropdown}
        >
          <span>Non Teaching Staff</span>
          <span className="dropdown-icon">
            {nonTeachingStaffDropdown ? "▲" : "▼"}
          </span>
        </button>

        {nonTeachingStaffDropdown && (
          <div className="sidebar-dropdown-box">
            <button onClick={() => navigate("/non-teaching-staff/create")}>
              Create Non Teaching Staff
            </button>
            <button onClick={() => navigate("/non-teaching-staff/all")}>
              All Non Teaching Staff
            </button>
            <button onClick={() => navigate("/non-teaching-staff/code")}>
              Get Staff By Code
            </button>
            <button onClick={() => navigate("/non-teaching-staff/name")}>
              Get Staff By Name
            </button>
            <button onClick={() => navigate("/non-teaching-staff/dropdown")}>
              Staff Dropdown
            </button>
            <button onClick={() => navigate("/non-teaching-staff/update")}>
              Update Staff
            </button>
            <button onClick={() => navigate("/non-teaching-staff/delete")}>
              Delete Staff
            </button>
          </div>
        )}

        {/* =====================================================
            FEE SETTINGS (FEE CATEGORY & FEE STRUCTURE ONLY)
            (NO STUDENT FEE COLUMN AS PER REQUIREMENT)
        ===================================================== */}
        <button
          className="sidebar-dropdown-button"
          onClick={toggleFeeSettingsDropdown}
        >
          <span>Fee Categories &amp; Structures</span>
          <span className="dropdown-icon">
            {feeSettingsDropdown ? "▲" : "▼"}
          </span>
        </button>

        {feeSettingsDropdown && (
          <div className="sidebar-dropdown-box">
            {/* GET ALL FEE CATEGORIES */}
            <button onClick={() => navigate("/fee-category/all")}>
              All Fee Categories
            </button>

            {/* NESTED FEE STRUCTURE */}
            <button
              className="sidebar-dropdown-button sidebar-nested-dropdown-button"
              onClick={toggleFeeStructureDropdown}
            >
              <span>Fee Structure</span>
              <span className="dropdown-icon">
                {feeStructureDropdown ? "▲" : "▼"}
              </span>
            </button>

            {feeStructureDropdown && (
              <div className="sidebar-nested-dropdown-box">
                <button onClick={() => navigate("/fee-structure/create")}>
                  Create Fee Structure
                </button>
                <button onClick={() => navigate("/fee-structure/all")}>
                  All Fee Structures
                </button>
                <button onClick={() => navigate("/fee-structure/class")}>
                  Get Fee Structure By Class
                </button>
                <button onClick={() => navigate("/fee-structure/category")}>
                  Get Fee Structure By Category
                </button>
                <button onClick={() => navigate("/fee-structure/update")}>
                  Update Fee Structure
                </button>
                <button onClick={() => navigate("/fee-structure/delete")}>
                  Delete Fee Structure
                </button>
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            ATTENDANCE & CLASS TEACHERS
            (OPERATOR: ONLY ASSIGN CLASS TEACHER & VIEW MONTH-WISE ATTENDANCE, NOT TAKE ATTENDANCE)
        ===================================================== */}
        <button
          className="sidebar-dropdown-button"
          onClick={toggleAttendanceDropdown}
        >
          <span>Attendance &amp; Classes</span>
          <span className="dropdown-icon">
            {attendanceDropdown ? "▲" : "▼"}
          </span>
        </button>

        {attendanceDropdown && (
          <div className="sidebar-dropdown-box">
            <button onClick={() => navigate("/class-teachers")}>
              Class Teachers &amp; Faculty Allocations
            </button>
            <button onClick={() => navigate("/class-teachers/assign")}>
              Assign Teachers to Class
            </button>
            <button onClick={() => navigate("/teacher-assignment/class")}>
              Faculty by Class (GET)
            </button>
            <button onClick={() => navigate("/attendance/register")}>
              Attendance Register
            </button>
            <button onClick={() => navigate("/attendance/take")}>
              Take Attendance
            </button>
          </div>
        )}

        {/* =====================================================
            ACADEMIC YEAR (READ ONLY)
        ===================================================== */}
        <button
          className="sidebar-dropdown-button"
          onClick={toggleAcademicYearDropdown}
        >
          <span>Academic Year</span>
          <span className="dropdown-icon">
            {academicYearDropdown ? "▲" : "▼"}
          </span>
        </button>

        {academicYearDropdown && (
          <div className="sidebar-dropdown-box">
            <button onClick={() => navigate("/academic-year/all")}>
              All Academic Years
            </button>
            <button onClick={() => navigate("/academic-year/name")}>
              Get Academic Year By Name
            </button>
          </div>
        )}

        {/* =====================================================
            DEPARTMENTS (READ ONLY)
        ===================================================== */}
        <button
          className="sidebar-dropdown-button"
          onClick={toggleDepartmentDropdown}
        >
          <span>Departments</span>
          <span className="dropdown-icon">
            {departmentDropdown ? "▲" : "▼"}
          </span>
        </button>

        {departmentDropdown && (
          <div className="sidebar-dropdown-box">
            <button onClick={() => navigate("/department/all")}>
              All Departments
            </button>
            <button onClick={() => navigate("/department/code")}>
              Get Department By Code
            </button>
            <button onClick={() => navigate("/department/name")}>
              Get Department By Name
            </button>
          </div>
        )}

        {/* =====================================================
            CLASSES (READ ONLY)
        ===================================================== */}
        <button
          className="sidebar-dropdown-button"
          onClick={toggleClassDropdown}
        >
          <span>Classes</span>
          <span className="dropdown-icon">{classDropdown ? "▲" : "▼"}</span>
        </button>

        {classDropdown && (
          <div className="sidebar-dropdown-box">
            <button onClick={() => navigate("/class/all")}>All Classes</button>
            <button onClick={() => navigate("/class/code")}>
              Get Class By Code
            </button>
            <button onClick={() => navigate("/class/name")}>
              Get Class By Name
            </button>
          </div>
        )}

        {/* =====================================================
            SECTIONS (READ ONLY)
        ===================================================== */}
        <button
          className="sidebar-dropdown-button"
          onClick={toggleSectionDropdown}
        >
          <span>Sections</span>
          <span className="dropdown-icon">{sectionDropdown ? "▲" : "▼"}</span>
        </button>

        {sectionDropdown && (
          <div className="sidebar-dropdown-box">
            <button onClick={() => navigate("/section/all")}>
              All Sections
            </button>
            <button onClick={() => navigate("/section/by-code")}>
              Get Section By Code
            </button>
          </div>
        )}

        {/* =====================================================
            SUBJECTS (READ ONLY)
        ===================================================== */}
        <button
          className="sidebar-dropdown-button"
          onClick={toggleSubjectDropdown}
        >
          <span>Subjects</span>
          <span className="dropdown-icon">{subjectDropdown ? "▲" : "▼"}</span>
        </button>

        {subjectDropdown && (
          <div className="sidebar-dropdown-box">
            <button onClick={() => navigate("/subject/all")}>
              All Subjects
            </button>
            <button onClick={() => navigate("/subject/code")}>
              Get Subject By Code
            </button>
            <button onClick={() => navigate("/subject/name")}>
              Get Subject By Name
            </button>
          </div>
        )}

        {/* =====================================================
            RESULT
        ===================================================== */}
        <button
          className="sidebar-dropdown-button"
          onClick={toggleResultDropdown}
        >
          <span>Result</span>
          <span className="dropdown-icon">{resultDropdown ? "▲" : "▼"}</span>
        </button>

        {resultDropdown && (
          <div className="sidebar-dropdown-box">
            {/* NESTED EXAM */}
            <button
              className="sidebar-dropdown-button sidebar-nested-dropdown-button"
              onClick={toggleExamNestedDropdown}
            >
              <span>Exam</span>
              <span className="dropdown-icon">
                {examNestedDropdown ? "▲" : "▼"}
              </span>
            </button>

            {examNestedDropdown && (
              <div className="sidebar-nested-dropdown-box">
                <button onClick={() => navigate("/exam/create")}>
                  Create Exam
                </button>
                <button onClick={() => navigate("/exam/all")}>All Exams</button>
                <button onClick={() => navigate("/exam/update")}>
                  Update Exam
                </button>
                <button onClick={() => navigate("/exam/delete")}>
                  Delete Exam
                </button>
              </div>
            )}

            {/* NESTED RESULT BATCH */}
            <button
              className="sidebar-dropdown-button sidebar-nested-dropdown-button"
              onClick={toggleResultBatchNestedDropdown}
            >
              <span>Result Batch</span>
              <span className="dropdown-icon">
                {resultBatchNestedDropdown ? "▲" : "▼"}
              </span>
            </button>

            {resultBatchNestedDropdown && (
              <div className="sidebar-nested-dropdown-box">
                <button onClick={() => navigate("/result-batch/create")}>
                  Create Result Batch
                </button>
                <button onClick={() => navigate("/result-batch/all")}>
                  All Result Batches
                </button>
                <button onClick={() => navigate("/result-batch/update")}>
                  Update Result Batch
                </button>
                <button onClick={() => navigate("/result-batch/publish")}>
                  Publish Result Batch
                </button>
              </div>
            )}

            {/* NESTED STUDENT RESULT */}
            <button
              className="sidebar-dropdown-button sidebar-nested-dropdown-button"
              onClick={toggleStudentResultNestedDropdown}
            >
              <span>Student Result</span>
              <span className="dropdown-icon">
                {studentResultNestedDropdown ? "▲" : "▼"}
              </span>
            </button>

            {studentResultNestedDropdown && (
              <div className="sidebar-nested-dropdown-box">
                <button onClick={() => navigate("/student-result/upload")}>
                  Upload Student Result
                </button>
                <button onClick={() => navigate("/student-result/student")}>
                  Get Student Result
                </button>
                <button onClick={() => navigate("/student-result/batch")}>
                  Get Batch Result
                </button>
                <button onClick={() => navigate("/student-result/update")}>
                  Update Student Result
                </button>
                <button onClick={() => navigate("/student-result/previous")}>
                  Preview / Previous Result
                </button>
              </div>
            )}

            {/* NESTED RESULT DETAIL */}
            <button
              className="sidebar-dropdown-button sidebar-nested-dropdown-button"
              onClick={toggleResultDetailNestedDropdown}
            >
              <span>Result Detail</span>
              <span className="dropdown-icon">
                {resultDetailNestedDropdown ? "▲" : "▼"}
              </span>
            </button>

            {resultDetailNestedDropdown && (
              <div className="sidebar-nested-dropdown-box">
                <button onClick={() => navigate("/result-detail/details")}>
                  Get Result Details
                </button>
              </div>
            )}
          </div>
        )}

        {/* =====================================================
            NOTICES
        ===================================================== */}
        <button
          className="sidebar-dropdown-button"
          onClick={toggleNoticeDropdown}
        >
          <span>Notices</span>
          <span className="dropdown-icon">{noticeDropdown ? "▲" : "▼"}</span>
        </button>

        {noticeDropdown && (
          <div className="sidebar-dropdown-box">
            <button onClick={() => navigate("/notice")}>
              All Published Notices
            </button>
            <button onClick={() => navigate("/notice/create")}>
              Create Notice
            </button>
            <button onClick={() => navigate("/notice/publish")}>
              Publish Notice
            </button>
            <button onClick={() => navigate("/notice/non-published")}>
              Non Published Notices
            </button>
            <button onClick={() => navigate("/notice/non-published/id")}>
              Get Non Published By ID
            </button>
          </div>
        )}

        {/* LOGOUT BUTTON IN SIDEBAR */}
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
          MAIN DASHBOARD CONTENT
      ===================================================== */}
      <main className="dashboard-content">
        <div className="operator-dashboard-welcome-banner">
          <div className="welcome-text-side">
            <h1>Welcome, {operatorFullName || username || "Operator"}</h1>
            <p>
              Operator Control Center - Manage academic records, student
              results, departments, staff, and institutional operations.
            </p>
          </div>

          {/* Quick Profile Widget (Between Dashboard Title & Metrics) */}
          <div
            className="operator-quick-profile-widget"
            onClick={() => setProfileModalOpen(true)}
            title="Click to view 75% Operator Profile Card"
          >
            <div className="widget-avatar-circle">
              {operatorPhoto ? (
                <img
                  src={formatFileUrl(operatorPhoto)}
                  alt={operatorFullName}
                />
              ) : (
                <div className="widget-avatar-placeholder">
                  {String(operatorFullName || username || "O")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>
            <div className="widget-user-info">
              <strong>{operatorFullName}</strong>
              <span>🏷️ Operator Profile ➔</span>
            </div>
          </div>
        </div>

        <SchoolVisionMission />
      </main>

      {/* =====================================================
          75% WIDTH & HEIGHT OPERATOR PROFILE MODAL
      ===================================================== */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        roleTitle="Operator"
      />
    </div>
  );
}

export default OperatorDashboard;
