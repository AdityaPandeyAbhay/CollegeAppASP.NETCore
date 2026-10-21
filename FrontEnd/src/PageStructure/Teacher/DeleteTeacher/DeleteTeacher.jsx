// =====================================================
// DELETE TEACHER
// =====================================================

import { useState } from "react";

import {
  getTeacherByCode,
  deleteTeacher,
} from "../../../Services/teacherService";

import {
  getDepartmentDropdown,
} from "../../../Services/departmentService";

import { openPhotoInNewTab, openPdfInNewTab } from "../../../Utils/fileHelper";
import "./DeleteTeacher.css";

const DeleteTeacher = () => {

  // ===================================================
  // STATE
  // ===================================================

  const [code, setCode] =
    useState("");

  const [teacher, setTeacher] =
    useState(null);

  const [departments, setDepartments] =
    useState([]);

  const [searching, setSearching] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");

  const [showConfirmModal, setShowConfirmModal] =
    useState(false);

  // ===================================================
  // POPUP
  // ===================================================

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

      setSearching(true);

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

      setSearching(false);

    }
  };

  // ===================================================
  // DELETE
  // ===================================================

  const handleOpenConfirm = () => {
    if (!teacher) {
      setError("Please search or select a teacher first.");
      return;
    }
    setError("");
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!teacher) {
      return;
    }

    const teacherName = [
      teacher.FirstName,
      teacher.MiddleName,
      teacher.LastName,
    ]
      .filter(Boolean)
      .join(" ");

    try {
      setDeleting(true);

      await deleteTeacher(
        teacher.TeacherCode,
        teacher
      );

      setShowConfirmModal(false);

      const successMessage =
        `Teacher "${teacherName}" deleted successfully (Soft Deleted).`;

      setMessage(successMessage);

      showPopup(
        "success",
        successMessage
      );

      setTeacher(null);
      setCode("");

    } catch (err) {
      const errorMessage =
        err?.message ||
        "Failed to delete teacher.";

      setError(errorMessage);

      showPopup(
        "error",
        errorMessage
      );

    } finally {
      setDeleting(false);
    }
  };

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

    <div className="teacher-delete-page">

      {/* =================================================
          POPUP
      ================================================= */}

      {popup.show && (

        <div
          className={`teacher-delete-popup teacher-delete-popup-${popup.type}`}
        >

          <div className="teacher-delete-popup-icon">

            {popup.type === "success"
              ? "✓"
              : "!"}

          </div>

          <div className="teacher-delete-popup-content">

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
            className="teacher-delete-popup-close"
            onClick={closePopup}
          >
            ×
          </button>

        </div>

      )}

      {/* =================================================
          CONTAINER
      ================================================= */}

      <div className="teacher-delete-container">

        <div className="teacher-delete-header">

          <h1>
            Delete Teacher
          </h1>

          <p>
            Search a teacher by code
            before deleting the record.
          </p>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <form
          className="teacher-delete-search"
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
            disabled={searching}
          >

            {searching
              ? "Searching..."
              : "Search"}

          </button>

        </form>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (

          <div className="teacher-delete-message success">
            {message}
          </div>

        )}

        {error && (

          <div className="teacher-delete-message error">
            {error}
          </div>

        )}

        {/* =================================================
            TEACHER
        ================================================= */}

        {teacher && (

          <div className="teacher-delete-card">

            <div className="teacher-delete-warning">

              <strong>
                Warning
              </strong>

              <span>
                Deleting this teacher will
                Disactive from the system and
                remove the teacher record.
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

            <div className="teacher-delete-details">

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
                  Email
                </label>

                <p>
                  {teacher.Email || "-"}
                </p>

              </div>

              <div>

                <label>
                  Phone
                </label>

                <p>
                  {teacher.PhoneNumber || "-"}
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


            </div>

            <div className="teacher-delete-actions">

              <button
                type="button"
                className="teacher-cancel-delete-btn"
                onClick={() => {

                  setTeacher(null);
                  setCode("");

                }}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="teacher-confirm-delete-btn"
                onClick={handleOpenConfirm}
                disabled={deleting}
              >

                {deleting
                  ? "Deleting..."
                  : "Delete Teacher"}

              </button>

            </div>

          </div>

        )}

      </div>

  {/* ================= CONFIRMATION MODAL POPUP ================= */}
        {showConfirmModal && teacher && (
          <div className="custom-delete-modal-overlay">
            <div className="custom-delete-modal-card">
              <div className="custom-delete-modal-header">
                <div className="custom-delete-warning-icon">⚠️</div>
                <h3>Confirm Teacher Deletion</h3>
              </div>
              <div className="custom-delete-modal-body">
                <p className="custom-delete-confirm-text">
                  Are you sure you want to delete this teacher record?
                </p>
                <div className="custom-delete-info-box">
                  <div className="custom-delete-info-row">
                    <span className="custom-delete-info-label">Name:</span>
                    <span className="custom-delete-info-value">
                      {[teacher.FirstName, teacher.MiddleName, teacher.LastName].filter(Boolean).join(" ") || "—"}
                    </span>
                  </div>
                  <div className="custom-delete-info-row">
                    <span className="custom-delete-info-label">Teacher Code:</span>
                    <span className="custom-delete-info-value">{teacher.TeacherCode || "—"}</span>
                  </div>
                  <div className="custom-delete-info-row">
                    <span className="custom-delete-info-label">Department:</span>
                    <span className="custom-delete-info-value">{teacher.DepartmentName || teacher.departmentName || "—"}</span>
                  </div>
                  <div className="custom-delete-info-row">
                    <span className="custom-delete-info-label">Email:</span>
                    <span className="custom-delete-info-value">{teacher.Email || "—"}</span>
                  </div>
                  <div className="custom-delete-info-row">
                    <span className="custom-delete-info-label">Phone:</span>
                    <span className="custom-delete-info-value">{teacher.PhoneNumber || "—"}</span>
                  </div>
                </div>
                <p className="custom-delete-note">
                  <strong>Note:</strong> This record will be soft deleted. It will be preserved in the system but will no longer appear anywhere in Get All teachers, search results, or dropdowns.
                </p>
              </div>
              <div className="custom-delete-modal-footer">
                <button
                  type="button"
                  className="custom-delete-btn-cancel"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="custom-delete-btn-danger"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete Teacher"}
                </button>
              </div>
            </div>
          </div>
        )}

    </div>

  );
};

export default DeleteTeacher;
