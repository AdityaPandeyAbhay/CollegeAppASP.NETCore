import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../Dashboard.css";
import "./AdminDashboard.css";

import { getUsername } from "../../Utils/auth";

function AdminDashboard() {
  const username = getUsername();
  const navigate = useNavigate();

  // =====================================================
  // DROPDOWN STATES WITH LOCAL STORAGE PERSISTENCE
  // =====================================================
  const [userDropdown, setUserDropdown] = useState(() => {
    return localStorage.getItem("adminUserDropdown") === "true";
  });

  const [teacherDropdown, setTeacherDropdown] = useState(() => {
    return localStorage.getItem("adminTeacherDropdown") === "true";
  });

  const [studentDropdown, setStudentDropdown] = useState(() => {
    return localStorage.getItem("adminStudentDropdown") === "true";
  });

  const [nonTeachingStaffDropdown, setNonTeachingStaffDropdown] = useState(
    () => {
      return localStorage.getItem("adminNonTeachingStaffDropdown") === "true";
    },
  );

  const [noticeDropdown, setNoticeDropdown] = useState(() => {
    return localStorage.getItem("adminNoticeDropdown") === "true";
  });

  const [studentFeeDropdown, setStudentFeeDropdown] = useState(() => {
    return localStorage.getItem("adminStudentFeeDropdown") === "true";
  });

  const [feeCategoryDropdown, setFeeCategoryDropdown] = useState(() => {
    return localStorage.getItem("adminFeeCategoryDropdown") === "true";
  });

  const [feeStructureDropdown, setFeeStructureDropdown] = useState(() => {
    return localStorage.getItem("adminFeeStructureDropdown") === "true";
  });

  const [studentFeeNestedDropdown, setStudentFeeNestedDropdown] = useState(
    () => {
      return localStorage.getItem("adminStudentFeeNestedDropdown") === "true";
    },
  );

  const [departmentDropdown, setDepartmentDropdown] = useState(() => {
    return localStorage.getItem("adminDepartmentDropdown") === "true";
  });

  const [classDropdown, setClassDropdown] = useState(() => {
    return localStorage.getItem("adminClassDropdown") === "true";
  });

  const [sectionDropdown, setSectionDropdown] = useState(() => {
    return localStorage.getItem("adminSectionDropdown") === "true";
  });

  const [subjectDropdown, setSubjectDropdown] = useState(() => {
    return localStorage.getItem("adminSubjectDropdown") === "true";
  });

  const [attendanceDropdown, setAttendanceDropdown] = useState(() => {
    return localStorage.getItem("adminAttendanceDropdown") === "true";
  });

  const [academicYearDropdown, setAcademicYearDropdown] = useState(() => {
    return localStorage.getItem("adminAcademicYearDropdown") === "true";
  });

  const [resultDropdown, setResultDropdown] = useState(() => {
    return localStorage.getItem("adminResultDropdown") === "true";
  });

  const [examNestedDropdown, setExamNestedDropdown] = useState(() => {
    return localStorage.getItem("adminExamNestedDropdown") === "true";
  });

  const [resultBatchNestedDropdown, setResultBatchNestedDropdown] = useState(
    () => {
      return localStorage.getItem("adminResultBatchNestedDropdown") === "true";
    },
  );

  const [studentResultNestedDropdown, setStudentResultNestedDropdown] =
    useState(() => {
      return (
        localStorage.getItem("adminStudentResultNestedDropdown") === "true"
      );
    });

  const [resultDetailNestedDropdown, setResultDetailNestedDropdown] = useState(
    () => {
      return localStorage.getItem("adminResultDetailNestedDropdown") === "true";
    },
  );

  // =====================================================
  // ACCORDION HELPER: CLOSE OTHER TOP-LEVEL DROPDOWNS
  // =====================================================
  const closeOtherTopLevelDropdowns = (currentKey) => {
    const dropdownMap = {
      user: { setter: setUserDropdown, key: "adminUserDropdown" },
      teacher: { setter: setTeacherDropdown, key: "adminTeacherDropdown" },
      student: { setter: setStudentDropdown, key: "adminStudentDropdown" },
      nonTeachingStaff: {
        setter: setNonTeachingStaffDropdown,
        key: "adminNonTeachingStaffDropdown",
      },
      notice: { setter: setNoticeDropdown, key: "adminNoticeDropdown" },
      studentFee: {
        setter: setStudentFeeDropdown,
        key: "adminStudentFeeDropdown",
      },
      result: {
        setter: setResultDropdown,
        key: "adminResultDropdown",
      },
      academicYear: {
        setter: setAcademicYearDropdown,
        key: "adminAcademicYearDropdown",
      },
      department: {
        setter: setDepartmentDropdown,
        key: "adminDepartmentDropdown",
      },
      class: { setter: setClassDropdown, key: "adminClassDropdown" },
      section: { setter: setSectionDropdown, key: "adminSectionDropdown" },
      subject: { setter: setSubjectDropdown, key: "adminSubjectDropdown" },
      attendance: {
        setter: setAttendanceDropdown,
        key: "adminAttendanceDropdown",
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
      localStorage.setItem("adminFeeCategoryDropdown", "false");
      setFeeStructureDropdown(false);
      localStorage.setItem("adminFeeStructureDropdown", "false");
      setStudentFeeNestedDropdown(false);
      localStorage.setItem("adminStudentFeeNestedDropdown", "false");
    }

    if (currentKey !== "result") {
      setExamNestedDropdown(false);
      localStorage.setItem("adminExamNestedDropdown", "false");
      setResultBatchNestedDropdown(false);
      localStorage.setItem("adminResultBatchNestedDropdown", "false");
      setStudentResultNestedDropdown(false);
      localStorage.setItem("adminStudentResultNestedDropdown", "false");
      setResultDetailNestedDropdown(false);
      localStorage.setItem("adminResultDetailNestedDropdown", "false");
    }
  };

  // Ensure only one top-level dropdown remains open on initial load
  useEffect(() => {
    const topLevelList = [
      {
        val: userDropdown,
        setter: setUserDropdown,
        storage: "adminUserDropdown",
      },
      {
        val: teacherDropdown,
        setter: setTeacherDropdown,
        storage: "adminTeacherDropdown",
      },
      {
        val: studentDropdown,
        setter: setStudentDropdown,
        storage: "adminStudentDropdown",
      },
      {
        val: nonTeachingStaffDropdown,
        setter: setNonTeachingStaffDropdown,
        storage: "adminNonTeachingStaffDropdown",
      },
      {
        val: noticeDropdown,
        setter: setNoticeDropdown,
        storage: "adminNoticeDropdown",
      },
      {
        val: studentFeeDropdown,
        setter: setStudentFeeDropdown,
        storage: "adminStudentFeeDropdown",
      },
      {
        val: resultDropdown,
        setter: setResultDropdown,
        storage: "adminResultDropdown",
      },
      {
        val: academicYearDropdown,
        setter: setAcademicYearDropdown,
        storage: "adminAcademicYearDropdown",
      },
      {
        val: departmentDropdown,
        setter: setDepartmentDropdown,
        storage: "adminDepartmentDropdown",
      },
      {
        val: classDropdown,
        setter: setClassDropdown,
        storage: "adminClassDropdown",
      },
      {
        val: sectionDropdown,
        setter: setSectionDropdown,
        storage: "adminSectionDropdown",
      },
      {
        val: subjectDropdown,
        setter: setSubjectDropdown,
        storage: "adminSubjectDropdown",
      },
      {
        val: attendanceDropdown,
        setter: setAttendanceDropdown,
        storage: "adminAttendanceDropdown",
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

  // Dropdown toggles
  const toggleUserDropdown = () => {
    setUserDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("user");
      }
      localStorage.setItem("adminUserDropdown", String(newState));
      return newState;
    });
  };

  const toggleTeacherDropdown = () => {
    setTeacherDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("teacher");
      }
      localStorage.setItem("adminTeacherDropdown", String(newState));
      return newState;
    });
  };

  const toggleStudentDropdown = () => {
    setStudentDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("student");
      }
      localStorage.setItem("adminStudentDropdown", String(newState));
      return newState;
    });
  };

  const toggleNonTeachingStaffDropdown = () => {
    setNonTeachingStaffDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("nonTeachingStaff");
      }
      localStorage.setItem("adminNonTeachingStaffDropdown", String(newState));
      return newState;
    });
  };

  const toggleNoticeDropdown = () => {
    setNoticeDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("notice");
      }
      localStorage.setItem("adminNoticeDropdown", String(newState));
      return newState;
    });
  };

  const toggleStudentFeeDropdown = () => {
    setStudentFeeDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("studentFee");
      } else {
        setFeeCategoryDropdown(false);
        localStorage.setItem("adminFeeCategoryDropdown", "false");
        setFeeStructureDropdown(false);
        localStorage.setItem("adminFeeStructureDropdown", "false");
        setStudentFeeNestedDropdown(false);
        localStorage.setItem("adminStudentFeeNestedDropdown", "false");
      }
      localStorage.setItem("adminStudentFeeDropdown", String(newState));
      return newState;
    });
  };

  const toggleFeeCategoryDropdown = () => {
    setFeeCategoryDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setFeeStructureDropdown(false);
        localStorage.setItem("adminFeeStructureDropdown", "false");
        setStudentFeeNestedDropdown(false);
        localStorage.setItem("adminStudentFeeNestedDropdown", "false");
      }
      localStorage.setItem("adminFeeCategoryDropdown", String(newState));
      return newState;
    });
  };

  const toggleFeeStructureDropdown = () => {
    setFeeStructureDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setFeeCategoryDropdown(false);
        localStorage.setItem("adminFeeCategoryDropdown", "false");
        setStudentFeeNestedDropdown(false);
        localStorage.setItem("adminStudentFeeNestedDropdown", "false");
      }
      localStorage.setItem("adminFeeStructureDropdown", String(newState));
      return newState;
    });
  };

  const toggleStudentFeeNestedDropdown = () => {
    setStudentFeeNestedDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setFeeCategoryDropdown(false);
        localStorage.setItem("adminFeeCategoryDropdown", "false");
        setFeeStructureDropdown(false);
        localStorage.setItem("adminFeeStructureDropdown", "false");
      }
      localStorage.setItem("adminStudentFeeNestedDropdown", String(newState));
      return newState;
    });
  };

  const toggleDepartmentDropdown = () => {
    setDepartmentDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("department");
      }
      localStorage.setItem("adminDepartmentDropdown", String(newState));
      return newState;
    });
  };

  const toggleClassDropdown = () => {
    setClassDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("class");
      }
      localStorage.setItem("adminClassDropdown", String(newState));
      return newState;
    });
  };

  const toggleSectionDropdown = () => {
    setSectionDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("section");
      }
      localStorage.setItem("adminSectionDropdown", String(newState));
      return newState;
    });
  };

  const toggleSubjectDropdown = () => {
    setSubjectDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("subject");
      }
      localStorage.setItem("adminSubjectDropdown", String(newState));
      return newState;
    });
  };

  const toggleAttendanceDropdown = () => {
    const nextState = !attendanceDropdown;
    setAttendanceDropdown(nextState);
    localStorage.setItem(
      "adminAttendanceDropdown",
      nextState ? "true" : "false",
    );
    if (nextState) {
      closeOtherTopLevelDropdowns("attendance");
    }
  };

  const toggleResultDropdown = () => {
    setResultDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("result");
      } else {
        setExamNestedDropdown(false);
        localStorage.setItem("adminExamNestedDropdown", "false");
        setResultBatchNestedDropdown(false);
        localStorage.setItem("adminResultBatchNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("adminStudentResultNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("adminResultDetailNestedDropdown", "false");
      }
      localStorage.setItem("adminResultDropdown", String(newState));
      return newState;
    });
  };

  const toggleExamNestedDropdown = () => {
    setExamNestedDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setResultBatchNestedDropdown(false);
        localStorage.setItem("adminResultBatchNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("adminStudentResultNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("adminResultDetailNestedDropdown", "false");
      }
      localStorage.setItem("adminExamNestedDropdown", String(newState));
      return newState;
    });
  };

  const toggleResultBatchNestedDropdown = () => {
    setResultBatchNestedDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setExamNestedDropdown(false);
        localStorage.setItem("adminExamNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("adminStudentResultNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("adminResultDetailNestedDropdown", "false");
      }
      localStorage.setItem("adminResultBatchNestedDropdown", String(newState));
      return newState;
    });
  };

  const toggleStudentResultNestedDropdown = () => {
    setStudentResultNestedDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setExamNestedDropdown(false);
        localStorage.setItem("adminExamNestedDropdown", "false");
        setResultBatchNestedDropdown(false);
        localStorage.setItem("adminResultBatchNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("adminResultDetailNestedDropdown", "false");
      }
      localStorage.setItem(
        "adminStudentResultNestedDropdown",
        String(newState),
      );
      return newState;
    });
  };

  const toggleResultDetailNestedDropdown = () => {
    setResultDetailNestedDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        setExamNestedDropdown(false);
        localStorage.setItem("adminExamNestedDropdown", "false");
        setResultBatchNestedDropdown(false);
        localStorage.setItem("adminResultBatchNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("adminStudentResultNestedDropdown", "false");
      }
      localStorage.setItem("adminResultDetailNestedDropdown", String(newState));
      return newState;
    });
  };

  const toggleAcademicYearDropdown = () => {
    setAcademicYearDropdown((previousState) => {
      const newState = !previousState;
      if (newState) {
        closeOtherTopLevelDropdowns("academicYear");
      }
      localStorage.setItem("adminAcademicYearDropdown", String(newState));
      return newState;
    });
  };

  return (
    <div className="dashboard">
      {/* =====================================================
          SIDEBAR
      ===================================================== */}
      <aside className="dashboard-sidebar">
        {/* SIDEBAR TITLE */}
        <h2>{`Admin Panel ${username ? `- ${username}` : ""}`}</h2>

        {/* DASHBOARD */}
        <button onClick={() => navigate("/dashboard/admin")}>Dashboard</button>

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
        <h1>Welcome, {username || "Admin"}</h1>

        {/* DASHBOARD CARDS */}
        <div className="dashboard-cards">
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

          {/* NON TEACHING STAFF */}
          <div
            className="dashboard-card"
            style={{ cursor: "pointer" }}
            onClick={() => navigate("/non-teaching-staff/all")}
          >
            <h3>Non Teaching Staff</h3>
            <p>0</p>
          </div>

          {/* NOTICES */}
          <div className="dashboard-card">
            <h3>Active Notices</h3>
            <p>0</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
