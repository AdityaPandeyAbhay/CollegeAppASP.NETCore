
// =====================================================
// GET TEACHER ASSIGNMENTS BY SUBJECT
// =====================================================

import { useEffect, useState } from "react";

import {
  getTeacherAssignmentsBySubject,
} from "../../../Services/teacherAssignmentService";

import {
  getAllSubject,
} from "../../../Services/subjectService";

import "./GetTeacherAssignmentBySubject.css";

const GetTeacherAssignmentBySubject = () => {

  const [subjects, setSubjects] =
    useState([]);

  const [subjectId, setSubjectId] =
    useState("");

  const [assignments, setAssignments] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingSubjects, setLoadingSubjects] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===================================================
  // LOAD SUBJECTS
  // ===================================================

  useEffect(() => {

    const loadSubjects = async () => {

      try {

        const data =
          await getAllSubject();

        setSubjects(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        setError(
          err?.message ||
          "Failed to load subjects."
        );

      } finally {

        setLoadingSubjects(false);

      }
    };

    loadSubjects();

  }, []);

  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setAssignments([]);
    setError("");

    if (!subjectId) {

      setError(
        "Please select a subject."
      );

      return;
    }

    setLoading(true);

    try {

      const data =
        await getTeacherAssignmentsBySubject(
          subjectId
        );

      setAssignments(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      setError(
        err?.message ||
        "Failed to load assignments."
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
            Teacher Assignments By Subject
          </h2>

          <p>
            Find teachers assigned to a subject.
          </p>

        </div>

        <form
          className="assignment-search-form"
          onSubmit={handleSearch}
        >

          <div className="assignment-search-field">

            <label>
              Subject
            </label>

            <select
              value={subjectId}
              onChange={(e) =>
                setSubjectId(
                  e.target.value
                )
              }
              disabled={loadingSubjects}
            >

              <option value="">
                {loadingSubjects
                  ? "Loading subjects..."
                  : "Select Subject"}
              </option>

              {subjects.map((item) => (

                <option
                  key={
                    item.Id ??
                    item.id
                  }
                  value={
                    item.Id ??
                    item.id
                  }
                >
                  {
                    item.Name ??
                    item.name ??
                    item.SubjectName ??
                    item.subjectName ??
                    item.Code ??
                    item.code ??
                    ""
                  }
                </option>

              ))}

            </select>

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

        {assignments.length === 0 &&
          !loading &&
          !error &&
          subjectId && (
            <div className="teacher-assignment-empty">
              No assignments found.
            </div>
          )}

        {assignments.length > 0 && (

          <div className="teacher-assignment-table-wrapper">

            <table className="teacher-assignment-table">

              <thead>

                <tr>
                  <th>#</th>
                  <th>Teacher</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Academic Year</th>
                  <th>Status</th>
                </tr>

              </thead>

              <tbody>

                {assignments.map(
                  (item, index) => (

                    <tr
                      key={
                        item.Id ??
                        item.id ??
                        index
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {item.TeacherName || "-"}
                      </td>

                      <td>
                        {item.ClassName ||
                          item.ClassCode ||
                          "-"}
                      </td>

                      <td>
                        {item.SectionName ||
                          item.SectionCode ||
                          "-"}
                      </td>

                      <td>
                        {item.AcademicYearName ||
                          "-"}
                      </td>

                      <td>
                        {item.IsActive
                          ? "Active"
                          : "Inactive"}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>
  );
};

export default GetTeacherAssignmentBySubject;

