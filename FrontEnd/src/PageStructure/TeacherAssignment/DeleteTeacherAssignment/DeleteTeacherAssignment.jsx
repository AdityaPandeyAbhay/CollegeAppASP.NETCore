
// =====================================================
// DELETE TEACHER ASSIGNMENT
// =====================================================

import { useState } from "react";

import {
  getTeacherAssignmentById,
  deleteTeacherAssignment,
} from "../../../Services/teacherAssignmentService";

import "./DeleteTeacherAssignment.css";

const DeleteTeacherAssignment = () => {

  const [id, setId] = useState("");

  const [assignment, setAssignment] = useState(null);

  const [loading, setLoading] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [message, setMessage] = useState("");

  // ===================================================
  // HELPER FUNCTIONS
  // ===================================================

  const getValue = (...values) => {
    for (const value of values) {
      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {
        return value;
      }
    }

    return "-";
  };

  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setAssignment(null);
    setMessage("");
    setError("");

    // ---------------------------------------------------
    // VALIDATE ID
    // ---------------------------------------------------

    if (
      id === null ||
      id === undefined ||
      String(id).trim() === ""
    ) {
      setError("Teacher assignment ID is required.");
      return;
    }

    const assignmentId = String(id).trim();

    setLoading(true);

    try {

      // -------------------------------------------------
      // GET ASSIGNMENT BY ID
      // -------------------------------------------------

      const data =
        await getTeacherAssignmentById(assignmentId);

      if (!data) {
        throw new Error(
          "Teacher assignment not found."
        );
      }

      // -------------------------------------------------
      // STORE RESPONSE
      // -------------------------------------------------

      setAssignment(data);

    } catch (err) {

      setError(
        err?.message ||
        "Teacher assignment not found."
      );

    } finally {

      setLoading(false);

    }
  };

  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = async () => {

    if (!assignment) {
      return;
    }

    // ---------------------------------------------------
    // CONFIRM DELETE
    // ---------------------------------------------------

    const confirmed =
      window.confirm(
        "Are you sure you want to delete this teacher assignment?"
      );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setMessage("");
    setError("");

    try {

      // -------------------------------------------------
      // GET ID FROM RESPONSE
      // -------------------------------------------------

      const assignmentId = getValue(
        assignment.Id,
        assignment.id,
        id
      );

      if (
        assignmentId === "-" ||
        assignmentId === ""
      ) {
        throw new Error(
          "Teacher assignment ID is missing."
        );
      }

      // -------------------------------------------------
      // DELETE
      // -------------------------------------------------

      await deleteTeacherAssignment(
        assignmentId
      );

      // -------------------------------------------------
      // SUCCESS
      // -------------------------------------------------

      setMessage(
        "Teacher assignment deleted successfully."
      );

      setAssignment(null);
      setId("");

    } catch (err) {

      setError(
        err?.message ||
        "Failed to delete teacher assignment."
      );

    } finally {

      setDeleting(false);

    }
  };

  // ===================================================
  // DISPLAY VALUES
  // ===================================================

  const teacherName = assignment
    ? getValue(
        assignment.TeacherName,
        assignment.teacherName,
        assignment.Teacher?.TeacherName,
        assignment.Teacher?.Name,
        [
          assignment.Teacher?.FirstName,
          assignment.Teacher?.MiddleName,
          assignment.Teacher?.LastName,
        ]
          .filter(Boolean)
          .join(" ")
      )
    : "-";

  const teacherCode = assignment
    ? getValue(
        assignment.TeacherCode,
        assignment.teacherCode,
        assignment.Teacher?.TeacherCode,
        assignment.Teacher?.Code
      )
    : "-";

  const departmentName = assignment
    ? getValue(
        assignment.DepartmentName,
        assignment.departmentName,
        assignment.Department?.DepartmentName,
        assignment.Department?.Name
      )
    : "-";

  const className = assignment
    ? getValue(
        assignment.ClassName,
        assignment.className,
        assignment.ClassCode,
        assignment.classCode,
        assignment.SchoolClassName,
        assignment.schoolClassName,
        assignment.SchoolClass?.ClassName,
        assignment.SchoolClass?.Name,
        assignment.SchoolClass?.ClassCode
      )
    : "-";

  const sectionName = assignment
    ? getValue(
        assignment.SectionName,
        assignment.sectionName,
        assignment.SectionCode,
        assignment.sectionCode,
        assignment.Section?.SectionName,
        assignment.Section?.Name,
        assignment.Section?.SectionCode
      )
    : "-";

  const subjectName = assignment
    ? getValue(
        assignment.SubjectName,
        assignment.subjectName,
        assignment.SubjectCode,
        assignment.subjectCode,
        assignment.Subject?.SubjectName,
        assignment.Subject?.Name,
        assignment.Subject?.SubjectCode
      )
    : "-";

  const academicYear = assignment
    ? getValue(
        assignment.AcademicYearName,
        assignment.academicYearName,
        assignment.AcademicYear,
        assignment.academicYear,
        assignment.AcademicYear?.YearName,
        assignment.AcademicYear?.yearName,
        assignment.AcademicYear?.Name
      )
    : "-";

  const isActive = assignment
    ? assignment.IsActive ??
      assignment.isActive ??
      false
    : false;

  // ===================================================
  // RETURN JSX
  // ===================================================

  return (
    <div className="teacher-assignment-page">

      <div className="teacher-assignment-container">

        {/* =================================================
            HEADER
            ================================================= */}

        <div className="teacher-assignment-header">

          <h2>
            Delete Teacher Assignment
          </h2>

          <p>
            Search an assignment before deleting it.
          </p>

        </div>

        {/* =================================================
            SUCCESS MESSAGE
            ================================================= */}

        {message && (
          <div className="teacher-assignment-success">
            {message}
          </div>
        )}

        {/* =================================================
            ERROR MESSAGE
            ================================================= */}

        {error && (
          <div className="teacher-assignment-error">
            {error}
          </div>
        )}

        {/* =================================================
            SEARCH FORM
            ================================================= */}

        <form
          className="assignment-search-form"
          onSubmit={handleSearch}
        >

          <div className="assignment-search-field">

            <label>
              Assignment ID
            </label>

            <input
              type="number"
              value={id}
              onChange={(e) =>
                setId(e.target.value)
              }
              placeholder="Enter assignment ID"
              min="1"
            />

          </div>

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
            ASSIGNMENT DETAILS
            ================================================= */}

        {assignment && (

          <div className="delete-assignment-card">

            <h3>
              Assignment Details
            </h3>

            <div className="assignment-detail-grid">

              {/* -------------------------------------------
                  ID
                  ------------------------------------------- */}

              <div>
                <label>
                  ID
                </label>

                <p>
                  {getValue(
                    assignment.Id,
                    assignment.id
                  )}
                </p>
              </div>

              {/* -------------------------------------------
                  TEACHER
                  ------------------------------------------- */}

              <div>
                <label>
                  Teacher
                </label>

                <p>
                  {teacherName}
                </p>
              </div>

              {/* -------------------------------------------
                  TEACHER CODE
                  ------------------------------------------- */}

             

              {/* -------------------------------------------
                  DEPARTMENT
                  ------------------------------------------- */}

              <div>
                <label>
                  Department
                </label>

                <p>
                  {departmentName}
                </p>
              </div>

              {/* -------------------------------------------
                  CLASS
                  ------------------------------------------- */}

              <div>
                <label>
                  Class
                </label>

                <p>
                  {className}
                </p>
              </div>

              {/* -------------------------------------------
                  SECTION
                  ------------------------------------------- */}

              <div>
                <label>
                  Section
                </label>

                <p>
                  {sectionName}
                </p>
              </div>

              {/* -------------------------------------------
                  SUBJECT
                  ------------------------------------------- */}

              <div>
                <label>
                  Subject
                </label>

                <p>
                  {subjectName}
                </p>
              </div>

              {/* -------------------------------------------
                  ACADEMIC YEAR
                  ------------------------------------------- */}

              <div>
                <label>
                  Academic Year
                </label>

                <p>
                  {academicYear}
                </p>
              </div>

              {/* -------------------------------------------
                  STATUS
                  ------------------------------------------- */}

              <div>
                <label>
                  Status
                </label>

                <p
                  className={
                    isActive
                      ? "status-active"
                      : "status-inactive"
                  }
                >
                  {isActive
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>

            </div>

            {/* =================================================
                DELETE BUTTON
                ================================================= */}

            <div className="delete-assignment-actions">

              <button
                type="button"
                className="delete-assignment-button"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete Assignment"}
              </button>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default DeleteTeacherAssignment;

