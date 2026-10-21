
// =====================================================
// GET TEACHER ASSIGNMENT BY ID
// =====================================================

import { useState } from "react";

import {
  getTeacherAssignmentById,
} from "../../../Services/teacherAssignmentService";

import "./GetTeacherAssignmentById.css";

const GetTeacherAssignmentById = () => {

  const [id, setId] = useState("");

  const [assignment, setAssignment] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setAssignment(null);
    setError("");

    if (!String(id).trim()) {

      setError(
        "Teacher assignment ID is required."
      );

      return;
    }

    setLoading(true);

    try {

      const data =
        await getTeacherAssignmentById(id);

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

  return (
    <div className="teacher-assignment-page">

      <div className="teacher-assignment-container">

        <div className="teacher-assignment-header">

          <h2>
            Get Teacher Assignment By ID
          </h2>

          <p>
            Search a teacher assignment using its ID.
          </p>

        </div>

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

        {error && (
          <div className="teacher-assignment-error">
            {error}
          </div>
        )}

        {assignment && !error && (

          <div className="assignment-detail-card">

            <h3>
              Teacher Assignment Details
            </h3>

            <div className="assignment-detail-grid">

              <div>
                <label>ID</label>
                <p>
                  {assignment.Id ?? "-"}
                </p>
              </div>

              <div>
                <label>Teacher</label>
                <p>
                  {assignment.TeacherName || "-"}
                </p>
              </div>

              <div>
                <label>Teacher Code</label>
                <p>
                  {assignment.TeacherCode || "-"}
                </p>
              </div>

              <div>
                <label>Class</label>
                <p>
                  {assignment.ClassName ||
                    assignment.ClassCode ||
                    "-"}
                </p>
              </div>

              <div>
                <label>Section</label>
                <p>
                  {assignment.SectionName ||
                    assignment.SectionCode ||
                    "-"}
                </p>
              </div>

              <div>
                <label>Subject</label>
                <p>
                  {assignment.SubjectName ||
                    assignment.SubjectCode ||
                    "-"}
                </p>
              </div>

              <div>
                <label>Academic Year</label>
                <p>
                  {assignment.AcademicYearName ||
                    "-"}
                </p>
              </div>

              <div>
                <label>Status</label>
                <p>
                  {assignment.IsActive
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default GetTeacherAssignmentById;

