import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../Dashboard.css";
import "./SuperAdminDashboard.css";

import { getUsername } from "../../Utils/auth";

function SuperAdminDashboard() {
  const username = getUsername();

  const navigate = useNavigate();

  // =====================================================
  // USERS DROPDOWN STATE
  // =====================================================

  const [userDropdown, setUserDropdown] = useState(() => {
    return localStorage.getItem("superAdminUserDropdown") === "true";
  });

  // =====================================================
  // TEACHER DROPDOWN STATE
  // =====================================================

  const [teacherDropdown, setTeacherDropdown] = useState(() => {
    return localStorage.getItem("superAdminTeacherDropdown") === "true";
  });

  // =====================================================
  // STUDENT DROPDOWN STATE
  // =====================================================

  const [studentDropdown, setStudentDropdown] = useState(() => {
    return localStorage.getItem("superAdminStudentDropdown") === "true";
  });

  // =====================================================
  // NON TEACHING STAFF DROPDOWN STATE
  // =====================================================

  const [nonTeachingStaffDropdown, setNonTeachingStaffDropdown] = useState(
    () => {
      return (
        localStorage.getItem("superAdminNonTeachingStaffDropdown") === "true"
      );
    },
  );

  // =====================================================
  // NOTICE DROPDOWN STATE
  // =====================================================

  const [noticeDropdown, setNoticeDropdown] = useState(() => {
    return localStorage.getItem("superAdminNoticeDropdown") === "true";
  });

  // =====================================================
  // STUDENT FEE DROPDOWN STATE
  // =====================================================

  const [studentFeeDropdown, setStudentFeeDropdown] = useState(() => {
    return localStorage.getItem("superAdminStudentFeeDropdown") === "true";
  });

  // =====================================================
  // FEE CATEGORY NESTED DROPDOWN STATE
  // =====================================================

  const [feeCategoryDropdown, setFeeCategoryDropdown] = useState(() => {
    return localStorage.getItem("superAdminFeeCategoryDropdown") === "true";
  });

  // =====================================================
  // FEE STRUCTURE NESTED DROPDOWN STATE
  // =====================================================

  const [feeStructureDropdown, setFeeStructureDropdown] = useState(() => {
    return localStorage.getItem("superAdminFeeStructureDropdown") === "true";
  });

  // =====================================================
  // STUDENT FEE RECORD NESTED DROPDOWN STATE
  // =====================================================

  const [studentFeeNestedDropdown, setStudentFeeNestedDropdown] = useState(
    () => {
      return (
        localStorage.getItem("superAdminStudentFeeNestedDropdown") === "true"
      );
    },
  );

  // =====================================================
  // DEPARTMENT DROPDOWN STATE
  // =====================================================

  const [departmentDropdown, setDepartmentDropdown] = useState(() => {
    return localStorage.getItem("superAdminDepartmentDropdown") === "true";
  });

  // =====================================================
  // CLASS DROPDOWN STATE
  // =====================================================

  const [classDropdown, setClassDropdown] = useState(() => {
    return localStorage.getItem("superAdminClassDropdown") === "true";
  });

  // =====================================================
  // SECTION DROPDOWN STATE
  // =====================================================

  const [sectionDropdown, setSectionDropdown] = useState(() => {
    return localStorage.getItem("superAdminSectionDropdown") === "true";
  });

  // =====================================================
  // SUBJECT DROPDOWN STATE
  // =====================================================

  const [subjectDropdown, setSubjectDropdown] = useState(() => {
    return localStorage.getItem("superAdminSubjectDropdown") === "true";
  });

  // =====================================================
  // ATTENDANCE DROPDOWN STATE
  // =====================================================

  const [attendanceDropdown, setAttendanceDropdown] = useState(() => {
    return localStorage.getItem("superAdminAttendanceDropdown") === "true";
  });

  // =====================================================
  // ACADEMIC YEAR DROPDOWN STATE
  // =====================================================

  const [academicYearDropdown, setAcademicYearDropdown] = useState(() => {
    return localStorage.getItem("superAdminAcademicYearDropdown") === "true";
  });

  // =====================================================
  // RESULT DROPDOWN STATE
  // =====================================================

  const [resultDropdown, setResultDropdown] = useState(() => {
    return localStorage.getItem("superAdminResultDropdown") === "true";
  });

  // =====================================================
  // EXAM NESTED DROPDOWN STATE
  // =====================================================

  const [examNestedDropdown, setExamNestedDropdown] = useState(() => {
    return localStorage.getItem("superAdminExamNestedDropdown") === "true";
  });

  // =====================================================
  // RESULT BATCH NESTED DROPDOWN STATE
  // =====================================================

  const [resultBatchNestedDropdown, setResultBatchNestedDropdown] = useState(
    () => {
      return (
        localStorage.getItem("superAdminResultBatchNestedDropdown") === "true"
      );
    },
  );

  // =====================================================
  // STUDENT RESULT NESTED DROPDOWN STATE
  // =====================================================

  const [studentResultNestedDropdown, setStudentResultNestedDropdown] =
    useState(() => {
      return (
        localStorage.getItem("superAdminStudentResultNestedDropdown") === "true"
      );
    });

  // =====================================================
  // RESULT DETAIL NESTED DROPDOWN STATE
  // =====================================================

  const [resultDetailNestedDropdown, setResultDetailNestedDropdown] = useState(
    () => {
      return (
        localStorage.getItem("superAdminResultDetailNestedDropdown") === "true"
      );
    },
  );

  // =====================================================
  // ACCORDION HELPER: CLOSE OTHER TOP-LEVEL DROPDOWNS
  // =====================================================

  const closeOtherTopLevelDropdowns = (currentKey) => {
    const dropdownMap = {
      user: { setter: setUserDropdown, key: "superAdminUserDropdown" },
      teacher: { setter: setTeacherDropdown, key: "superAdminTeacherDropdown" },
      student: { setter: setStudentDropdown, key: "superAdminStudentDropdown" },
      nonTeachingStaff: {
        setter: setNonTeachingStaffDropdown,
        key: "superAdminNonTeachingStaffDropdown",
      },
      notice: { setter: setNoticeDropdown, key: "superAdminNoticeDropdown" },
      studentFee: {
        setter: setStudentFeeDropdown,
        key: "superAdminStudentFeeDropdown",
      },
      result: {
        setter: setResultDropdown,
        key: "superAdminResultDropdown",
      },
      academicYear: {
        setter: setAcademicYearDropdown,
        key: "superAdminAcademicYearDropdown",
      },
      department: {
        setter: setDepartmentDropdown,
        key: "superAdminDepartmentDropdown",
      },
      class: { setter: setClassDropdown, key: "superAdminClassDropdown" },
      section: { setter: setSectionDropdown, key: "superAdminSectionDropdown" },
      subject: { setter: setSubjectDropdown, key: "superAdminSubjectDropdown" },
      attendance: {
        setter: setAttendanceDropdown,
        key: "superAdminAttendanceDropdown",
      },
    };

    Object.entries(dropdownMap).forEach(([name, item]) => {
      if (name !== currentKey) {
        item.setter(false);
        localStorage.setItem(item.key, "false");
      }
    });

    if (currentKey !== "studentFee") {
      setFeeCategoryDropdown(false);
      localStorage.setItem("superAdminFeeCategoryDropdown", "false");
      setFeeStructureDropdown(false);
      localStorage.setItem("superAdminFeeStructureDropdown", "false");
      setStudentFeeNestedDropdown(false);
      localStorage.setItem("superAdminStudentFeeNestedDropdown", "false");
    }

    if (currentKey !== "result") {
      setExamNestedDropdown(false);
      localStorage.setItem("superAdminExamNestedDropdown", "false");
      setResultBatchNestedDropdown(false);
      localStorage.setItem("superAdminResultBatchNestedDropdown", "false");
      setStudentResultNestedDropdown(false);
      localStorage.setItem("superAdminStudentResultNestedDropdown", "false");
      setResultDetailNestedDropdown(false);
      localStorage.setItem("superAdminResultDetailNestedDropdown", "false");
    }
  };

  // Ensure only one top-level dropdown remains open on initial load
  useEffect(() => {
    const topLevelList = [
      {
        val: userDropdown,
        setter: setUserDropdown,
        storage: "superAdminUserDropdown",
      },
      {
        val: teacherDropdown,
        setter: setTeacherDropdown,
        storage: "superAdminTeacherDropdown",
      },
      {
        val: studentDropdown,
        setter: setStudentDropdown,
        storage: "superAdminStudentDropdown",
      },
      {
        val: nonTeachingStaffDropdown,
        setter: setNonTeachingStaffDropdown,
        storage: "superAdminNonTeachingStaffDropdown",
      },
      {
        val: noticeDropdown,
        setter: setNoticeDropdown,
        storage: "superAdminNoticeDropdown",
      },
      {
        val: studentFeeDropdown,
        setter: setStudentFeeDropdown,
        storage: "superAdminStudentFeeDropdown",
      },
      {
        val: resultDropdown,
        setter: setResultDropdown,
        storage: "superAdminResultDropdown",
      },
      {
        val: academicYearDropdown,
        setter: setAcademicYearDropdown,
        storage: "superAdminAcademicYearDropdown",
      },
      {
        val: departmentDropdown,
        setter: setDepartmentDropdown,
        storage: "superAdminDepartmentDropdown",
      },
      {
        val: classDropdown,
        setter: setClassDropdown,
        storage: "superAdminClassDropdown",
      },
      {
        val: sectionDropdown,
        setter: setSectionDropdown,
        storage: "superAdminSectionDropdown",
      },
      {
        val: subjectDropdown,
        setter: setSubjectDropdown,
        storage: "superAdminSubjectDropdown",
      },
      {
        val: attendanceDropdown,
        setter: setAttendanceDropdown,
        storage: "superAdminAttendanceDropdown",
      },
    ];

    let foundOpen = false;
    topLevelList.forEach((item) => {
      if (item.val) {
        if (!foundOpen) {
          foundOpen = true;
        } else {
          item.setter(false);
          localStorage.setItem(item.storage, "false");
        }
      }
    });
  }, []);

  // =====================================================
  // USERS DROPDOWN TOGGLE
  // =====================================================

  const toggleUserDropdown = () => {
    setUserDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("user");
      }
      localStorage.setItem("superAdminUserDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // TEACHER DROPDOWN TOGGLE
  // =====================================================

  const toggleTeacherDropdown = () => {
    setTeacherDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("teacher");
      }
      localStorage.setItem("superAdminTeacherDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // STUDENT DROPDOWN TOGGLE
  // =====================================================

  const toggleStudentDropdown = () => {
    setStudentDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("student");
      }
      localStorage.setItem("superAdminStudentDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // NON TEACHING STAFF DROPDOWN TOGGLE
  // =====================================================

  const toggleNonTeachingStaffDropdown = () => {
    setNonTeachingStaffDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("nonTeachingStaff");
      }
      localStorage.setItem(
        "superAdminNonTeachingStaffDropdown",
        String(newState),
      );
      return newState;
    });
  };

  // =====================================================
  // NOTICE DROPDOWN TOGGLE
  // =====================================================

  const toggleNoticeDropdown = () => {
    setNoticeDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("notice");
      }
      localStorage.setItem("superAdminNoticeDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // STUDENT FEE DROPDOWN TOGGLE
  // =====================================================

  const toggleStudentFeeDropdown = () => {
    setStudentFeeDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("studentFee");
      } else {
        setFeeCategoryDropdown(false);
        localStorage.setItem("superAdminFeeCategoryDropdown", "false");
        setFeeStructureDropdown(false);
        localStorage.setItem("superAdminFeeStructureDropdown", "false");
        setStudentFeeNestedDropdown(false);
        localStorage.setItem("superAdminStudentFeeNestedDropdown", "false");
      }
      localStorage.setItem("superAdminStudentFeeDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // FEE CATEGORY NESTED DROPDOWN TOGGLE
  // =====================================================

  const toggleFeeCategoryDropdown = () => {
    setFeeCategoryDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setFeeStructureDropdown(false);
        localStorage.setItem("superAdminFeeStructureDropdown", "false");
        setStudentFeeNestedDropdown(false);
        localStorage.setItem("superAdminStudentFeeNestedDropdown", "false");
      }
      localStorage.setItem("superAdminFeeCategoryDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // FEE STRUCTURE NESTED DROPDOWN TOGGLE
  // =====================================================

  const toggleFeeStructureDropdown = () => {
    setFeeStructureDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setFeeCategoryDropdown(false);
        localStorage.setItem("superAdminFeeCategoryDropdown", "false");
        setStudentFeeNestedDropdown(false);
        localStorage.setItem("superAdminStudentFeeNestedDropdown", "false");
      }
      localStorage.setItem("superAdminFeeStructureDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // STUDENT FEE RECORD NESTED DROPDOWN TOGGLE
  // =====================================================

  const toggleStudentFeeNestedDropdown = () => {
    setStudentFeeNestedDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setFeeCategoryDropdown(false);
        localStorage.setItem("superAdminFeeCategoryDropdown", "false");
        setFeeStructureDropdown(false);
        localStorage.setItem("superAdminFeeStructureDropdown", "false");
      }
      localStorage.setItem(
        "superAdminStudentFeeNestedDropdown",
        String(newState),
      );
      return newState;
    });
  };

  // =====================================================
  // DEPARTMENT DROPDOWN TOGGLE
  // =====================================================

  const toggleDepartmentDropdown = () => {
    setDepartmentDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("department");
      }
      localStorage.setItem("superAdminDepartmentDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // CLASS DROPDOWN TOGGLE
  // =====================================================

  const toggleClassDropdown = () => {
    setClassDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("class");
      }
      localStorage.setItem("superAdminClassDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // SECTION DROPDOWN TOGGLE
  // =====================================================

  const toggleSectionDropdown = () => {
    setSectionDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("section");
      }
      localStorage.setItem("superAdminSectionDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // SUBJECT DROPDOWN TOGGLE
  // =====================================================

  const toggleSubjectDropdown = () => {
    setSubjectDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("subject");
      }
      localStorage.setItem("superAdminSubjectDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // ATTENDANCE DROPDOWN TOGGLE
  // =====================================================

  const toggleAttendanceDropdown = () => {
    const nextState = !attendanceDropdown;
    setAttendanceDropdown(nextState);
    localStorage.setItem(
      "superAdminAttendanceDropdown",
      nextState ? "true" : "false",
    );
    if (nextState) {
      closeOtherTopLevelDropdowns("attendance");
    }
  };

  // =====================================================
  // RESULT DROPDOWN TOGGLE
  // =====================================================

  const toggleResultDropdown = () => {
    setResultDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("result");
      } else {
        setExamNestedDropdown(false);
        localStorage.setItem("superAdminExamNestedDropdown", "false");
        setResultBatchNestedDropdown(false);
        localStorage.setItem("superAdminResultBatchNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("superAdminStudentResultNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("superAdminResultDetailNestedDropdown", "false");
      }
      localStorage.setItem("superAdminResultDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // EXAM NESTED DROPDOWN TOGGLE
  // =====================================================

  const toggleExamNestedDropdown = () => {
    setExamNestedDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setResultBatchNestedDropdown(false);
        localStorage.setItem("superAdminResultBatchNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("superAdminStudentResultNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("superAdminResultDetailNestedDropdown", "false");
      }
      localStorage.setItem("superAdminExamNestedDropdown", String(newState));
      return newState;
    });
  };

  // =====================================================
  // RESULT BATCH NESTED DROPDOWN TOGGLE
  // =====================================================

  const toggleResultBatchNestedDropdown = () => {
    setResultBatchNestedDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setExamNestedDropdown(false);
        localStorage.setItem("superAdminExamNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("superAdminStudentResultNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("superAdminResultDetailNestedDropdown", "false");
      }
      localStorage.setItem(
        "superAdminResultBatchNestedDropdown",
        String(newState),
      );
      return newState;
    });
  };

  // =====================================================
  // STUDENT RESULT NESTED DROPDOWN TOGGLE
  // =====================================================

  const toggleStudentResultNestedDropdown = () => {
    setStudentResultNestedDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setExamNestedDropdown(false);
        localStorage.setItem("superAdminExamNestedDropdown", "false");
        setResultBatchNestedDropdown(false);
        localStorage.setItem("superAdminResultBatchNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("superAdminResultDetailNestedDropdown", "false");
      }
      localStorage.setItem(
        "superAdminStudentResultNestedDropdown",
        String(newState),
      );
      return newState;
    });
  };

  // =====================================================
  // RESULT DETAIL NESTED DROPDOWN TOGGLE
  // =====================================================

  const toggleResultDetailNestedDropdown = () => {
    setResultDetailNestedDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setExamNestedDropdown(false);
        localStorage.setItem("superAdminExamNestedDropdown", "false");
        setResultBatchNestedDropdown(false);
        localStorage.setItem("superAdminResultBatchNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("superAdminStudentResultNestedDropdown", "false");
      }
      localStorage.setItem(
        "superAdminResultDetailNestedDropdown",
        String(newState),
      );
      return newState;
    });
  };

  // =====================================================
  // ACADEMIC YEAR DROPDOWN TOGGLE
  // =====================================================

  const toggleAcademicYearDropdown = () => {
    setAcademicYearDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("academicYear");
      }
      localStorage.setItem("superAdminAcademicYearDropdown", String(newState));
      return newState;
    });
  };

  return (
    <div className="dashboard">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <aside className="dashboard-sidebar">
        {/* =====================================================
            SIDEBAR TITLE
        ===================================================== */}

        <h2>{`Super Admin ${username}`}</h2>

        {/* =====================================================
            DASHBOARD
        ===================================================== */}

        <button onClick={() => navigate("/dashboard/superadmin")}>
          Dashboard
        </button>

        {/* =====================================================
            USERS
        ===================================================== */}

        <button
          className="sidebar-dropdown-button"
          onClick={toggleUserDropdown}
        >
          <span>Users</span>

          <span className="dropdown-icon">{userDropdown ? "▲" : "▼"}</span>
        </button>

        {userDropdown && (
          <div className="sidebar-dropdown-box">
            <button onClick={() => navigate("/user/create")}>
              Create User
            </button>

            <button onClick={() => navigate("/user/all")}>All Users</button>

            <button onClick={() => navigate("/user/id")}>Get User By ID</button>

            <button onClick={() => navigate("/user/name")}>
              Get User By Name
            </button>

            <button onClick={() => navigate("/user/update")}>
              Update User
            </button>

            <button onClick={() => navigate("/user/delete")}>
              Delete User
            </button>
          </div>
        )}

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
            STUDENT FEE
        ===================================================== */}

        <button
          className="sidebar-dropdown-button"
          onClick={toggleStudentFeeDropdown}
        >
          <span>Student Fee</span>

          <span className="dropdown-icon">
            {studentFeeDropdown ? "▲" : "▼"}
          </span>
        </button>

        {studentFeeDropdown && (
          <div className="sidebar-dropdown-box">
            {/* NESTED FEE CATEGORY */}
            <button
              className="sidebar-dropdown-button sidebar-nested-dropdown-button"
              onClick={toggleFeeCategoryDropdown}
            >
              <span>Fee Category</span>

              <span className="dropdown-icon">
                {feeCategoryDropdown ? "▲" : "▼"}
              </span>
            </button>

            {feeCategoryDropdown && (
              <div className="sidebar-nested-dropdown-box">
                <button onClick={() => navigate("/fee-category/create")}>
                  Create Fee Category
                </button>

                <button onClick={() => navigate("/fee-category/all")}>
                  All Fee Categories
                </button>

                <button onClick={() => navigate("/fee-category/name")}>
                  Get Fee Category By Name
                </button>

                <button onClick={() => navigate("/fee-category/update")}>
                  Update Fee Category
                </button>

                <button onClick={() => navigate("/fee-category/delete")}>
                  Delete Fee Category
                </button>
              </div>
            )}

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

            {/* NESTED STUDENT FEE */}
            <button
              className="sidebar-dropdown-button sidebar-nested-dropdown-button"
              onClick={toggleStudentFeeNestedDropdown}
            >
              <span>Student Fee</span>

              <span className="dropdown-icon">
                {studentFeeNestedDropdown ? "▲" : "▼"}
              </span>
            </button>

            {studentFeeNestedDropdown && (
              <div className="sidebar-nested-dropdown-box">
                <button onClick={() => navigate("/student-fee/create")}>
                  Create Student Fee
                </button>

                <button onClick={() => navigate("/student-fee/all")}>
                  All Student Fees
                </button>

                <button onClick={() => navigate("/student-fee/student")}>
                  Get Fee By Student
                </button>

                <button onClick={() => navigate("/student-fee/update")}>
                  Update Student Fee
                </button>

                <button onClick={() => navigate("/student-fee/delete")}>
                  Delete Student Fee
                </button>
              </div>
            )}
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
            ACADEMIC YEAR
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
            <button onClick={() => navigate("/academic-year/create")}>
              Create Academic Year
            </button>

            <button onClick={() => navigate("/academic-year/all")}>
              All Academic Years
            </button>

            <button onClick={() => navigate("/academic-year/name")}>
              Get Academic Year By Name
            </button>

            <button onClick={() => navigate("/academic-year/update")}>
              Update Academic Year
            </button>

            <button onClick={() => navigate("/academic-year/delete")}>
              Delete Academic Year
            </button>
          </div>
        )}

        {/* =====================================================
            DEPARTMENTS
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
            <button onClick={() => navigate("/department/create")}>
              Create Department
            </button>

            <button onClick={() => navigate("/department/all")}>
              All Departments
            </button>

            <button onClick={() => navigate("/department/code")}>
              Get Department By Code
            </button>

            <button onClick={() => navigate("/department/name")}>
              Get Department By Name
            </button>

            <button onClick={() => navigate("/department/update")}>
              Update Department
            </button>

            <button onClick={() => navigate("/department/delete")}>
              Delete Department
            </button>
          </div>
        )}

        {/* =====================================================
            CLASSES
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
            <button onClick={() => navigate("/class/create")}>
              Create Class
            </button>

            <button onClick={() => navigate("/class/all")}>All Classes</button>

            <button onClick={() => navigate("/class/code")}>
              Get Class By Code
            </button>

            <button onClick={() => navigate("/class/name")}>
              Get Class By Name
            </button>

            <button onClick={() => navigate("/class/update")}>
              Update Class
            </button>

            <button onClick={() => navigate("/class/delete")}>
              Delete Class
            </button>
          </div>
        )}

        {/* =====================================================
            SECTIONS
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
            <button onClick={() => navigate("/section/create")}>
              Create Section
            </button>

            <button onClick={() => navigate("/section/all")}>
              All Sections
            </button>

            <button onClick={() => navigate("/section/by-code")}>
              Get Section By Code
            </button>

            <button onClick={() => navigate("/section/update")}>
              Update Section
            </button>

            <button onClick={() => navigate("/section/delete")}>
              Delete Section
            </button>
          </div>
        )}

        {/* =====================================================
            SUBJECTS
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
            <button onClick={() => navigate("/subject/create")}>
              Create Subject
            </button>

            <button onClick={() => navigate("/subject/all")}>
              All Subjects
            </button>

            <button onClick={() => navigate("/subject/code")}>
              Get Subject By Code
            </button>

            <button onClick={() => navigate("/subject/name")}>
              Get Subject By Name
            </button>

            <button onClick={() => navigate("/subject/update")}>
              Update Subject
            </button>

            <button onClick={() => navigate("/subject/delete")}>
              Delete Subject
            </button>
          </div>
        )}

        {/* =====================================================
            ATTENDANCE & CLASS TEACHERS
        ===================================================== */}

        <button
          className="sidebar-dropdown-button"
          onClick={toggleAttendanceDropdown}
        >
          <span>Attendance & Classes</span>

          <span className="dropdown-icon">
            {attendanceDropdown ? "▲" : "▼"}
          </span>
        </button>

        {attendanceDropdown && (
          <div className="sidebar-dropdown-box">
            <button onClick={() => navigate("/class-teachers")}>
              Class Teachers
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
      </aside>

      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}

      <main className="dashboard-content">
        <h1>Welcome, {username || "Super Admin"}</h1>

        {/* =====================================================
            DASHBOARD CARDS
        ===================================================== */}

        <div className="dashboard-cards">
          {/* ADMINS */}

          <div className="dashboard-card">
            <h3>Admins</h3>
            <p>0</p>
          </div>

          {/* TEACHERS */}

          <div className="dashboard-card">
            <h3>Teachers</h3>
            <p>0</p>
          </div>

          {/* STUDENTS */}

          <div className="dashboard-card">
            <h3>Students</h3>
            <p>0</p>
          </div>

          {/* STAFF */}

          <div
            className="dashboard-card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/non-teaching-staff/all")}
          >
            <h3>Non Teaching Staff</h3>
            <p>0</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default SuperAdminDashboard;
