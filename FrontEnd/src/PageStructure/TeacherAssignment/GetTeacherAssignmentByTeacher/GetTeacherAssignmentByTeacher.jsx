
// =====================================================
// GET TEACHER ASSIGNMENTS BY TEACHER
// =====================================================

import { useEffect, useState } from "react";

import {
  getTeacherAssignmentsByTeacher,
} from "../../../Services/teacherAssignmentService";

import {
  getTeacherDropdown,
} from "../../../Services/teacherService";

import "./GetTeacherAssignmentByTeacher.css";

const GetTeacherAssignmentByTeacher = () => {

  const [teachers, setTeachers] =
    useState([]);

  const [teacherId, setTeacherId] =
    useState("");

  const [assignments, setAssignments] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [loadingTeachers, setLoadingTeachers] =
    useState(true);

  const [error, setError] =
    useState("");

  // ===================================================
  // LOAD TEACHERS
  // ===================================================

  useEffect(() => {

    const loadTeachers = async () => {

      try {

        const data =
          await getTeacherDropdown();

        setTeachers(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (err) {

        setError(
          err?.message ||
          "Failed to load teachers."
        );

      } finally {

        setLoadingTeachers(false);

      }
    };

    loadTeachers();

  }, []);

  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setAssignments([]);
    setError("");

    if (!teacherId) {

      setError(
        "Please select a teacher."
      );

      return;
    }

    setLoading(true);

    try {

      const data =
        await getTeacherAssignmentsByTeacher(
          teacherId
        );

      setAssignments(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      setError(
        err?.message ||
        "Failed to load teacher assignments."
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
            Teacher Assignments By Teacher
          </h2>

          <p>
            Find all assignments of a teacher.
          </p>

        </div>

        <form
          className="assignment-search-form"
          onSubmit={handleSearch}
        >

          <div className="assignment-search-field">

            <label>
              Teacher
            </label>

            <select
              value={teacherId}
              onChange={(e) =>
                setTeacherId(
                  e.target.value
                )
              }
              disabled={loadingTeachers}
            >

              <option value="">
                {loadingTeachers
                  ? "Loading teachers..."
                  : "Select Teacher"}
              </option>

              {teachers.map((teacher) => (

                <option
                  key={
                    teacher.id ??
                    teacher.Id
                  }
                  value={
                    teacher.id ??
                    teacher.Id
                  }
                >
                  {
                    teacher.text ??
                    teacher.Text ??
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
          teacherId && (
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
                  <th>Subject</th>
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
                        {item.SubjectName ||
                          item.SubjectCode ||
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

export default GetTeacherAssignmentByTeacher;

