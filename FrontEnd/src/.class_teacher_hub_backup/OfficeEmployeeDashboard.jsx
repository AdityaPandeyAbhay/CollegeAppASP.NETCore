import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import "../Dashboard.css";
import "./OfficeEmployeeDashboard.css";

import { getUsername, getUserId } from "../../Utils/auth";
import {
  getAllNonTeachingStaff,
  getSavedStaffExtraFields,
} from "../../Services/nonTeachingStaffService";
import { formatFileUrl } from "../../Utils/fileHelper";
import UserProfileModal from "../../Components/Common/UserProfileModal";

function OfficeEmployeeDashboard() {
  const username = getUsername();
  const userId = getUserId();
  const navigate = useNavigate();

  // Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [employeePhoto, setEmployeePhoto] = useState(null);
  const [employeeFullName, setEmployeeFullName] = useState("");

  // =====================================================
  // FETCH OFFICE EMPLOYEE PHOTO FOR CIRCULAR AVATAR
  // =====================================================
  useEffect(() => {
    loadEmployeeAvatar();
  }, []);

  const loadEmployeeAvatar = async () => {
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
      setEmployeePhoto(photo);

      const fName = matched
        ? [
            matched.firstName || matched.FirstName,
            matched.lastName || matched.LastName,
          ]
            .filter(Boolean)
            .join(" ")
        : username;
      setEmployeeFullName(fName || "Office Staff");
    } catch (e) {
      console.warn("Could not load employee avatar:", e);
    }
  };

  // =====================================================
  // DROPDOWN STATES WITH LOCAL STORAGE PERSISTENCE
  // =====================================================
  const [studentDropdown, setStudentDropdown] = useState(() => {
    return localStorage.getItem("officeStudentDropdown") === "true";
  });

  const [teacherDropdown, setTeacherDropdown] = useState(() => {
    return localStorage.getItem("officeTeacherDropdown") === "true";
  });

  const [nonTeachingStaffDropdown, setNonTeachingStaffDropdown] = useState(
    () => {
      return localStorage.getItem("officeNonTeachingStaffDropdown") === "true";
    },
  );

  const [studentFeeDropdown, setStudentFeeDropdown] = useState(() => {
    return localStorage.getItem("officeStudentFeeDropdown") === "true";
  });

  const [feeCategoryDropdown, setFeeCategoryDropdown] = useState(() => {
    return localStorage.getItem("officeFeeCategoryDropdown") === "true";
  });

  const [feeStructureDropdown, setFeeStructureDropdown] = useState(() => {
    return localStorage.getItem("officeFeeStructureDropdown") === "true";
  });

  const [studentFeeNestedDropdown, setStudentFeeNestedDropdown] = useState(
    () => {
      return localStorage.getItem("officeStudentFeeNestedDropdown") === "true";
    },
  );

  const [resultDropdown, setResultDropdown] = useState(() => {
    return localStorage.getItem("officeResultDropdown") === "true";
  });

  const [examNestedDropdown, setExamNestedDropdown] = useState(() => {
    return localStorage.getItem("officeExamNestedDropdown") === "true";
  });

  const [resultBatchNestedDropdown, setResultBatchNestedDropdown] = useState(
    () => {
      return localStorage.getItem("officeResultBatchNestedDropdown") === "true";
    },
  );

  const [studentResultNestedDropdown, setStudentResultNestedDropdown] =
    useState(() => {
      return (
        localStorage.getItem("officeStudentResultNestedDropdown") === "true"
      );
    });

  const [resultDetailNestedDropdown, setResultDetailNestedDropdown] = useState(
    () => {
      return (
        localStorage.getItem("officeResultDetailNestedDropdown") === "true"
      );
    },
  );

  const [academicYearDropdown, setAcademicYearDropdown] = useState(() => {
    return localStorage.getItem("officeAcademicYearDropdown") === "true";
  });

  const [departmentDropdown, setDepartmentDropdown] = useState(() => {
    return localStorage.getItem("officeDepartmentDropdown") === "true";
  });

  const [classDropdown, setClassDropdown] = useState(() => {
    return localStorage.getItem("officeClassDropdown") === "true";
  });

  const [sectionDropdown, setSectionDropdown] = useState(() => {
    return localStorage.getItem("officeSectionDropdown") === "true";
  });

  const [subjectDropdown, setSubjectDropdown] = useState(() => {
    return localStorage.getItem("officeSubjectDropdown") === "true";
  });

  const [attendanceDropdown, setAttendanceDropdown] = useState(() => {
    return localStorage.getItem("officeAttendanceDropdown") === "true";
  });

  const [noticeDropdown, setNoticeDropdown] = useState(() => {
    return localStorage.getItem("officeNoticeDropdown") === "true";
  });

  // =====================================================
  // ACCORDION HELPER: CLOSE OTHER TOP-LEVEL DROPDOWNS
  // =====================================================
  const closeOtherTopLevelDropdowns = (currentKey) => {
    const dropdownMap = {
      student: { setter: setStudentDropdown, key: "officeStudentDropdown" },
      teacher: { setter: setTeacherDropdown, key: "officeTeacherDropdown" },
      nonTeachingStaff: {
        setter: setNonTeachingStaffDropdown,
        key: "officeNonTeachingStaffDropdown",
      },
      studentFee: {
        setter: setStudentFeeDropdown,
        key: "officeStudentFeeDropdown",
      },
      result: {
        setter: setResultDropdown,
        key: "officeResultDropdown",
      },
      academicYear: {
        setter: setAcademicYearDropdown,
        key: "officeAcademicYearDropdown",
      },
      department: {
        setter: setDepartmentDropdown,
        key: "officeDepartmentDropdown",
      },
      class: { setter: setClassDropdown, key: "officeClassDropdown" },
      section: { setter: setSectionDropdown, key: "officeSectionDropdown" },
      subject: { setter: setSubjectDropdown, key: "officeSubjectDropdown" },
      attendance: {
        setter: setAttendanceDropdown,
        key: "officeAttendanceDropdown",
      },
      notice: { setter: setNoticeDropdown, key: "officeNoticeDropdown" },
    };

    Object.entries(dropdownMap).forEach(([name, item]) => {
      if (name !== currentKey) {
        item.setter(false);
        localStorage.setItem(item.key, "false");
      }
    });
  };

  // Dropdown toggles
  const toggleStudentDropdown = () => {
    setStudentDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("student");
      localStorage.setItem("officeStudentDropdown", String(newState));
      return newState;
    });
  };

  const toggleTeacherDropdown = () => {
    setTeacherDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("teacher");
      localStorage.setItem("officeTeacherDropdown", String(newState));
      return newState;
    });
  };

  const toggleNonTeachingStaffDropdown = () => {
    setNonTeachingStaffDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("nonTeachingStaff");
      localStorage.setItem("officeNonTeachingStaffDropdown", String(newState));
      return newState;
    });
  };

  const toggleStudentFeeDropdown = () => {
    setStudentFeeDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        closeOtherTopLevelDropdowns("studentFee");
      } else {
        setFeeCategoryDropdown(false);
        localStorage.setItem("officeFeeCategoryDropdown", "false");
        setFeeStructureDropdown(false);
        localStorage.setItem("officeFeeStructureDropdown", "false");
        setStudentFeeNestedDropdown(false);
        localStorage.setItem("officeStudentFeeNestedDropdown", "false");
      }
      localStorage.setItem("officeStudentFeeDropdown", String(newState));
      return newState;
    });
  };

  const toggleFeeCategoryDropdown = () => {
    setFeeCategoryDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        setFeeStructureDropdown(false);
        localStorage.setItem("officeFeeStructureDropdown", "false");
        setStudentFeeNestedDropdown(false);
        localStorage.setItem("officeStudentFeeNestedDropdown", "false");
      }
      localStorage.setItem("officeFeeCategoryDropdown", String(newState));
      return newState;
    });
  };

  const toggleFeeStructureDropdown = () => {
    setFeeStructureDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        setFeeCategoryDropdown(false);
        localStorage.setItem("officeFeeCategoryDropdown", "false");
        setStudentFeeNestedDropdown(false);
        localStorage.setItem("officeStudentFeeNestedDropdown", "false");
      }
      localStorage.setItem("officeFeeStructureDropdown", String(newState));
      return newState;
    });
  };

  const toggleStudentFeeNestedDropdown = () => {
    setStudentFeeNestedDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        setFeeCategoryDropdown(false);
        localStorage.setItem("officeFeeCategoryDropdown", "false");
        setFeeStructureDropdown(false);
        localStorage.setItem("officeFeeStructureDropdown", "false");
      }
      localStorage.setItem("officeStudentFeeNestedDropdown", String(newState));
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
        localStorage.setItem("officeExamNestedDropdown", "false");
        setResultBatchNestedDropdown(false);
        localStorage.setItem("officeResultBatchNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("officeStudentResultNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("officeResultDetailNestedDropdown", "false");
      }
      localStorage.setItem("officeResultDropdown", String(newState));
      return newState;
    });
  };

  const toggleExamNestedDropdown = () => {
    setExamNestedDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        setResultBatchNestedDropdown(false);
        localStorage.setItem("officeResultBatchNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("officeStudentResultNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("officeResultDetailNestedDropdown", "false");
      }
      localStorage.setItem("officeExamNestedDropdown", String(newState));
      return newState;
    });
  };

  const toggleResultBatchNestedDropdown = () => {
    setResultBatchNestedDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        setExamNestedDropdown(false);
        localStorage.setItem("officeExamNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("officeStudentResultNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("officeResultDetailNestedDropdown", "false");
      }
      localStorage.setItem("officeResultBatchNestedDropdown", String(newState));
      return newState;
    });
  };

  const toggleStudentResultNestedDropdown = () => {
    setStudentResultNestedDropdown((prev) => {
      const newState = !prev;
      if (newState) {
        setExamNestedDropdown(false);
        localStorage.setItem("officeExamNestedDropdown", "false");
        setResultBatchNestedDropdown(false);
        localStorage.setItem("officeResultBatchNestedDropdown", "false");
        setResultDetailNestedDropdown(false);
        localStorage.setItem("officeResultDetailNestedDropdown", "false");
      }
      localStorage.setItem(
        "officeStudentResultNestedDropdown",
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
        localStorage.setItem("officeExamNestedDropdown", "false");
        setResultBatchNestedDropdown(false);
        localStorage.setItem("officeResultBatchNestedDropdown", "false");
        setStudentResultNestedDropdown(false);
        localStorage.setItem("officeStudentResultNestedDropdown", "false");
      }
      localStorage.setItem(
        "officeResultDetailNestedDropdown",
        String(newState),
      );
      return newState;
    });
  };

  const toggleAcademicYearDropdown = () => {
    setAcademicYearDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("academicYear");
      localStorage.setItem("officeAcademicYearDropdown", String(newState));
      return newState;
    });
  };

  const toggleDepartmentDropdown = () => {
    setDepartmentDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("department");
      localStorage.setItem("officeDepartmentDropdown", String(newState));
      return newState;
    });
  };

  const toggleClassDropdown = () => {
    setClassDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("class");
      localStorage.setItem("officeClassDropdown", String(newState));
      return newState;
    });
  };

  const toggleSectionDropdown = () => {
    setSectionDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("section");
      localStorage.setItem("officeSectionDropdown", String(newState));
      return newState;
    });
  };

  const toggleSubjectDropdown = () => {
    setSubjectDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("subject");
      localStorage.setItem("officeSubjectDropdown", String(newState));
      return newState;
    });
  };

  const toggleAttendanceDropdown = () => {
    setAttendanceDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("attendance");
      localStorage.setItem("officeAttendanceDropdown", String(newState));
      return newState;
    });
  };

  const toggleNoticeDropdown = () => {
    setNoticeDropdown((prev) => {
      const newState = !prev;
      if (newState) closeOtherTopLevelDropdowns("notice");
      localStorage.setItem("officeNoticeDropdown", String(newState));
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
        {/* EMPLOYEE TITLE & PROFILE CARD */}
        <div className="office-sidebar-profile-header">
          <h2>Office Panel</h2>
          <span className="office-panel-subtitle">{employeeFullName}</span>

          {/* CIRCLE PROFILE BUTTON */}
          <div
            className="office-circle-avatar-container"
            onClick={() => setProfileModalOpen(true)}
            title="Click to view full Office Employee Profile"
          >
            {employeePhoto ? (
              <img
                src={formatFileUrl(employeePhoto)}
                alt={employeeFullName}
                className="office-round-circle-img"
              />
            ) : (
              <div className="office-round-circle-placeholder">
                {String(employeeFullName || username || "E")
                  .charAt(0)
                  .toUpperCase()}
              </div>
            )}
            <span className="avatar-online-dot"></span>
          </div>
          <button
            type="button"
            className="office-view-profile-btn"
            onClick={() => setProfileModalOpen(true)}
          >
            👤 My Profile
          </button>
        </div>

        {/* DASHBOARD LINK */}
        <button onClick={() => navigate("/dashboard/office-employee")}>
          Dashboard
        </button>

        {/* =====================================================
            STUDENTS (READ-ONLY)
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
            <button onClick={() => navigate("/student/all")}>
              All Students
            </button>
            <button onClick={() => navigate("/student/name")}>
              Get Student By Name
            </button>
          </div>
        )}

        {/* =====================================================
            TEACHERS (READ-ONLY)
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
            <button onClick={() => navigate("/teacher/all")}>
              All Teachers
            </button>
            <button onClick={() => navigate("/teacher/code")}>
              Get Teacher By Code
            </button>
            <button onClick={() => navigate("/teacher/name")}>
              Get Teacher By Name
            </button>
          </div>
        )}

        {/* =====================================================
            NON TEACHING STAFF (READ-ONLY)
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
            {/* NESTED FEE STRUCTURE (READ-ONLY) */}
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
                <button onClick={() => navigate("/fee-structure/all")}>
                  All Fee Structures
                </button>
                <button onClick={() => navigate("/fee-structure/class")}>
                  Get Fee Structure By Class
                </button>
                <button onClick={() => navigate("/fee-structure/category")}>
                  Get Fee Structure By Category
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
            {/* NESTED EXAM (READ-ONLY) */}
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
                <button onClick={() => navigate("/exam/all")}>All Exams</button>
              </div>
            )}

            {/* NESTED RESULT BATCH (READ-ONLY) */}
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
                <button onClick={() => navigate("/result-batch/all")}>
                  All Result Batches
                </button>
              </div>
            )}

            {/* NESTED STUDENT RESULT (READ-ONLY) */}
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
                <button onClick={() => navigate("/student-result/student")}>
                  Get Student Result
                </button>
                <button onClick={() => navigate("/student-result/batch")}>
                  Get Batch Result
                </button>
                <button onClick={() => navigate("/student-result/previous")}>
                  Preview / Previous Result
                </button>
              </div>
            )}

            {/* NESTED RESULT DETAIL (READ-ONLY) */}
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
          <span>Attendance &amp; Classes</span>
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
        <div className="office-dashboard-welcome-banner">
          <div className="welcome-text-side">
            <h1>
              Welcome, {employeeFullName || username || "Office Employee"}
            </h1>
            <p>
              Office Staff Control Center - Full access to institutional
              records, student management, attendance, fee collections, and
              examination results.
            </p>
          </div>

          {/* Quick Profile Widget */}
          <div
            className="office-quick-profile-widget"
            onClick={() => setProfileModalOpen(true)}
            title="Click to view Office Employee Profile Card"
          >
            <div className="widget-avatar-circle">
              {employeePhoto ? (
                <img
                  src={formatFileUrl(employeePhoto)}
                  alt={employeeFullName}
                />
              ) : (
                <div className="widget-avatar-placeholder">
                  {String(employeeFullName || username || "E")
                    .charAt(0)
                    .toUpperCase()}
                </div>
              )}
            </div>
            <div className="widget-user-info">
              <strong>{employeeFullName}</strong>
              <span>🏷️ Office Profile ➔</span>
            </div>
          </div>
        </div>

        {/* METRIC OVERVIEW CARDS */}
        <div className="dashboard-cards">
          <div
            className="dashboard-card"
            onClick={() => navigate("/student/all")}
          >
            <h3>Students</h3>
            <p>View All Records</p>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/student-fee/all")}
          >
            <h3>Student Fees</h3>
            <p>Collections &amp; Records</p>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/student-result/upload")}
          >
            <h3>Student Results</h3>
            <p>Upload &amp; Manage</p>
          </div>

          <div
            className="dashboard-card"
            onClick={() => navigate("/attendance/register")}
          >
            <h3>Attendance Register</h3>
            <p>Month-wise View</p>
          </div>

          <div className="dashboard-card" onClick={() => navigate("/notice")}>
            <h3>Notices</h3>
            <p>Published Board</p>
          </div>
        </div>
      </main>

      {/* =====================================================
          OFFICE EMPLOYEE PROFILE MODAL
      ===================================================== */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        roleTitle="Office Employee"
      />
    </div>
  );
}

export default OfficeEmployeeDashboard;
