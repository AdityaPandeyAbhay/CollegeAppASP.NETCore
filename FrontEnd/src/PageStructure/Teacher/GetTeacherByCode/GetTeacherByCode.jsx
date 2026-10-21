// =====================================================
// GET TEACHER BY CODE
// =====================================================

import { useState } from "react";

import {
  getTeacherByCode,
} from "../../../Services/teacherService";

import {
  getDepartmentDropdown,
} from "../../../Services/departmentService";

import { openPhotoInNewTab, openPdfInNewTab } from "../../../Utils/fileHelper";
import "./GetTeacherByCode.css";

const GetTeacherByCode = () => {

  const [code, setCode] =
    useState("");

  const [teacher, setTeacher] =
    useState(null);

  const [departments, setDepartments] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: "",
  });

  // ===================================================
  // GET DEPARTMENT NAME
  // ===================================================

  const getDepartmentName = (
    departmentId
  ) => {

    if (
      departmentId === null ||
      departmentId === undefined ||
      departmentId === ""
    ) {
      return "-";
    }

    const department =
      departments.find(
        (item) =>
          Number(item.id) ===
          Number(departmentId)
      );

    return (
      department?.text ||
      department?.Text ||
      "-"
    );
  };

  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setTeacher(null);
    setMessage("");
    setError("");

    if (!code.trim()) {

      const msg =
        "Teacher code is required.";

      setError(msg);

      showPopup(
        "error",
        msg
      );

      return;
    }

    try {

      setLoading(true);

      const [
        result,
        departmentResult,
      ] = await Promise.all([
        getTeacherByCode(
          code.trim()
        ),
        getDepartmentDropdown(),
      ]);

      if (!result) {

        throw new Error(
          "Teacher not found."
        );

      }

      setDepartments(
        Array.isArray(departmentResult)
          ? departmentResult
          : []
      );

      setTeacher(result);

      const successMessage =
        "Teacher found successfully.";

      setMessage(successMessage);

      showPopup(
        "success",
        successMessage
      );

    } catch (err) {

      const errorMessage =
        err?.message ||
        "Teacher not found.";

      setError(errorMessage);

      showPopup(
        "error",
        errorMessage
      );

    } finally {

      setLoading(false);

    }
  };

  // ===================================================
  // POPUP
  // ===================================================

  const showPopup = (
    type,
    popupMessage
  ) => {

    setPopup({
      show: true,
      type,
      message: popupMessage,
    });

    setTimeout(() => {

      setPopup({
        show: false,
        type: "",
        message: "",
      });

    }, 4000);

  };

  const closePopup = () => {

    setPopup({
      show: false,
      type: "",
      message: "",
    });

  };

  // ===================================================
  // DATE
  // ===================================================

  const formatDate = (value) => {

    if (!value) {
      return "-";
    }

    const date =
      new Date(value);

    if (
      Number.isNaN(
        date.getTime()
      )
    ) {
      return value;
    }

    return date.toLocaleDateString();

  };

  // ===================================================
  // FULL NAME
  // ===================================================

  const getFullName = () => {

    if (!teacher) {
      return "-";
    }

    return [
      teacher.FirstName,
      teacher.MiddleName,
      teacher.LastName,
    ]
      .filter(Boolean)
      .join(" ") || "-";
  };

  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div className="teacher-code-page">

      {/* =================================================
          POPUP
      ================================================= */}

      {popup.show && (

        <div
          className={`teacher-code-popup teacher-code-popup-${popup.type}`}
        >

          <div className="teacher-code-popup-icon">

            {popup.type === "success"
              ? "✓"
              : "!"}

          </div>

          <div className="teacher-code-popup-content">

            <strong>

              {popup.type === "success"
                ? "Success"
                : "Error"}

            </strong>

            <span>
              {popup.message}
            </span>

          </div>

          <button
            type="button"
            onClick={closePopup}
            className="teacher-code-popup-close"
          >
            ×
          </button>

        </div>

      )}

      <div className="teacher-code-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="teacher-code-header">

          <h1>
            Get Teacher By Code
          </h1>

          <p>
            Search teacher information
            using teacher code.
          </p>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <form
          className="teacher-code-search"
          onSubmit={handleSearch}
        >

          <input
            type="text"
            value={code}
            onChange={(e) =>
              setCode(
                e.target.value
              )
            }
            placeholder="Enter Teacher Code"
          />

          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Searching..."
              : "Search"}

          </button>

        </form>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (

          <div className="teacher-code-message success">
            {message}
          </div>

        )}

        {error && (

          <div className="teacher-code-message error">
            {error}
          </div>

        )}

        {/* =================================================
            TEACHER DETAILS
        ================================================= */}

        {teacher && (

          <div className="teacher-code-card">

            <div className="teacher-code-card-header">

              <h2>
                Teacher Details
              </h2>

              <span
                className={
                  teacher.IsActive
                    ? "teacher-code-status active"
                    : "teacher-code-status inactive"
                }
              >

                {teacher.IsActive
                  ? "Active"
                  : "Inactive"}

              </span>

            </div>

            <div className="teacher-photo-card-banner">
              {teacher.Photo || teacher.photo ? (
                <img
                  src={teacher.Photo || teacher.photo}
                  alt={getFullName()}
                  className="teacher-detail-photo"
                  onClick={() => openPhotoInNewTab(teacher.Photo || teacher.photo, getFullName())}
                  title="Click to view photo"
                />
              ) : (
                <div className="teacher-detail-photo-placeholder">👤</div>
              )}
              <div>
                <h3 style={{ margin: "0 0 4px 0", color: "#1e293b" }}>{getFullName()}</h3>
                <span style={{ fontSize: "13px", color: "#64748b" }}>Teacher Code: {teacher.TeacherCode || "-"}</span>
              </div>
            </div>

            <div className="teacher-code-grid">

              <div>

                <label>
                  Teacher Code
                </label>

                <p>
                  {teacher.TeacherCode || "-"}
                </p>

              </div>

              <div>

                <label>
                  Teacher Name
                </label>

                <p>
                  {getFullName()}
                </p>

              </div>
              <div>
                <label>Father's Name</label>
                <p>{teacher.FatherName || teacher.fatherName || "-"}</p>
              </div>

              <div>
                <label>Mother's Name</label>
                <p>{teacher.MotherName || teacher.motherName || "-"}</p>
              </div>

              <div>
                <label>Education Document</label>
                <p>
                  {teacher.EducationPdf || teacher.educationPdf ? (
                    <button
                      type="button"
                      className="teacher-view-pdf-btn"
                      onClick={() => openPdfInNewTab(teacher.EducationPdf || teacher.educationPdf, `${getFullName()} Education Documents`)}
                    >
                      📄 View Education PDF ↗
                    </button>
                  ) : (
                    "-"
                  )}
                </p>
              </div>


              {/* DEPARTMENT NAME */}

              <div>

                <label>
                  Department
                </label>

                <p>
                  {teacher.DepartmentName ||
                    getDepartmentName(
                      teacher.DepartmentId
                    )}
                </p>

              </div>

              <div>

                <label>
                  Gender
                </label>

                <p>
                  {teacher.Gender || "-"}
                </p>

              </div>

              <div>

                <label>
                  Date of Birth
                </label>

                <p>
                  {formatDate(
                    teacher.DateOfBirth
                  )}
                </p>

              </div>

              <div>

                <label>
                  Email
                </label>

                <p>
                  {teacher.Email || "-"}
                </p>

              </div>

              <div>

                <label>
                  Phone Number
                </label>

                <p>
                  {teacher.PhoneNumber || "-"}
                </p>

              </div>

              <div>

                <label>
                  Alternate Phone
                </label>

                <p>
                  {teacher.AlternatePhoneNumber ||
                    "-"}
                </p>

              </div>

              <div>

                <label>
                  Qualification
                </label>

                <p>
                  {teacher.Qualification || "-"}
                </p>

              </div>

              <div>

                <label>
                  Experience
                </label>

                <p>
                  {teacher.Experience ?? 0}
                </p>

              </div>

              <div>

                <label>
                  Joining Date
                </label>

                <p>
                  {formatDate(
                    teacher.JoiningDate
                  )}
                </p>

              </div>

              <div>

                <label>
                  Salary
                </label>

                <p>

                  ₹{" "}

                  {Number(
                    teacher.Salary || 0
                  ).toLocaleString(
                    "en-IN"
                  )}

                </p>

              </div>

              <div>

                <label>
                  Class Teacher
                </label>

                <p>
                  {teacher.IsClassTeacher
                    ? "Yes"
                    : "No"}
                </p>

              </div>

              <div className="teacher-code-address">

                <label>
                  Address
                </label>

                <p>
                  {teacher.Address || "-"}
                </p>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );
};

export default GetTeacherByCode;