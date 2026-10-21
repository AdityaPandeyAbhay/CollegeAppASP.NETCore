// =====================================================
// GET TEACHER BY NAME
// =====================================================

import { useState } from "react";

import {
  getTeacherByName,
} from "../../../Services/teacherService";

import {
  getDepartmentDropdown,
} from "../../../Services/departmentService";

import {
  getSubjectDropdown,
} from "../../../Services/subjectService";

import { openPhotoInNewTab, openPdfInNewTab } from "../../../Utils/fileHelper";
import "./GetTeacherByName.css";

const GetTeacherByName = () => {

  const [name, setName] =
    useState("");

  const [teachers, setTeachers] =
    useState([]);

  const [departments, setDepartments] =
    useState([]);

  const [subjects, setSubjects] =
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
  // GET SUBJECT NAME
  // ===================================================

  const getSubjectName = (
    subjectId
  ) => {

    if (
      subjectId === null ||
      subjectId === undefined ||
      subjectId === ""
    ) {
      return "-";
    }

    const subject =
      subjects.find(
        (item) =>
          Number(item.id) ===
          Number(subjectId)
      );

    return (
      subject?.text ||
      subject?.name ||
      subject?.Text ||
      subject?.Name ||
      "-"
    );
  };

  // ===================================================
  // GET ALL TEACHER DEPARTMENTS & SUBJECTS
  // ===================================================

  const getTeacherDepartments = (t) => {
    if (!t) return [];
    if (Array.isArray(t.departments) && t.departments.length > 0) {
      return t.departments;
    }
    if (Array.isArray(t.DepartmentNames) && t.DepartmentNames.length > 0) {
      return t.DepartmentNames.map((dName, idx) => {
        const id = Array.isArray(t.DepartmentIds) ? t.DepartmentIds[idx] : idx;
        return {
          id: id ?? idx,
          name: dName,
          isPrimary: idx === 0,
        };
      });
    }
    if (Array.isArray(t.DepartmentIds) && t.DepartmentIds.length > 0) {
      return t.DepartmentIds.map((id, idx) => ({
        id: id,
        name: getDepartmentName(id),
        isPrimary: idx === 0,
      }));
    }
    const primaryId = t.DepartmentId;
    const primaryName = t.DepartmentName || getDepartmentName(primaryId);
    if (primaryName && primaryName !== "-") {
      return [{ id: primaryId, name: primaryName, isPrimary: true }];
    }
    return [];
  };

  const getTeacherSubjects = (t) => {
    if (!t) return [];
    if (Array.isArray(t.subjects) && t.subjects.length > 0) {
      return t.subjects;
    }
    if (Array.isArray(t.SubjectNames) && t.SubjectNames.length > 0) {
      return t.SubjectNames.map((sName, idx) => {
        const id = Array.isArray(t.SubjectIds) ? t.SubjectIds[idx] : idx;
        return {
          id: id ?? idx,
          name: sName,
          isPrimary: idx === 0,
        };
      });
    }
    if (Array.isArray(t.SubjectIds) && t.SubjectIds.length > 0) {
      return t.SubjectIds.map((id, idx) => ({
        id: id,
        name: getSubjectName(id),
        isPrimary: idx === 0,
      }));
    }
    const primaryId = t.SubjectId;
    const primaryName = t.SubjectName || getSubjectName(primaryId);
    if (primaryName && primaryName !== "-") {
      return [{ id: primaryId, name: primaryName, isPrimary: true }];
    }
    return [];
  };

  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setTeachers([]);
    setMessage("");
    setError("");

    if (!name.trim()) {

      const msg =
        "Teacher name is required.";

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
        subjectResult,
      ] = await Promise.all([
        getTeacherByName(
          name.trim()
        ),
        getDepartmentDropdown(),
        getSubjectDropdown(),
      ]);

      const teacherList =
        Array.isArray(result)
          ? result
          : [];

      if (
        teacherList.length === 0
      ) {

        throw new Error(
          "No teacher found with this name."
        );

      }

      setDepartments(
        Array.isArray(departmentResult)
          ? departmentResult
          : []
      );

      setSubjects(
        Array.isArray(subjectResult)
          ? subjectResult
          : subjectResult?.data || []
      );

      setTeachers(
        teacherList
      );

      const successMessage =
        `${teacherList.length} teacher(s) found.`;

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
  // RENDER
  // ===================================================

  return (

    <div className="teacher-name-page">

      {/* =================================================
          POPUP
      ================================================= */}

      {popup.show && (

        <div
          className={`teacher-name-popup teacher-name-popup-${popup.type}`}
        >

          <div className="teacher-name-popup-icon">

            {popup.type === "success"
              ? "✓"
              : "!"}

          </div>

          <div className="teacher-name-popup-content">

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
            className="teacher-name-popup-close"
          >
            ×
          </button>

        </div>

      )}

      <div className="teacher-name-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="teacher-name-header">

          <h1>
            Get Teacher By Name
          </h1>

          <p>
            Search teachers using their
            first, middle or last name.
          </p>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <form
          className="teacher-name-search"
          onSubmit={handleSearch}
        >

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(
                e.target.value
              )
            }
            placeholder="Enter teacher name"
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

          <div className="teacher-name-message success">
            {message}
          </div>

        )}

        {error && (

          <div className="teacher-name-message error">
            {error}
          </div>

        )}

        {/* =================================================
            TABLE
        ================================================= */}

        {teachers.length > 0 && (

          <div className="teacher-name-table-wrapper">

            <table className="teacher-name-table">

              <thead>

                <tr>

                  <th>#</th>
                  <th>Photo</th>
                  <th>Teacher Code</th>

                  <th>Name</th>
                  <th>Father Name</th>
                  <th>Mother Name</th>
                  <th>Education Doc</th>

                  <th>
                    Department(s)
                  </th>

                  <th>
                    Subject(s)
                  </th>

                  <th>
                    Gender
                  </th>

                  <th>
                    Email
                  </th>

                  <th>
                    Phone
                  </th>

                  <th>
                    Qualification
                  </th>

                  <th>
                    Experience
                  </th>

                  <th>
                    Joining Date
                  </th>

                  <th>
                    Class Teacher
                  </th>

                  <th>
                    Active
                  </th>

                </tr>

              </thead>

              <tbody>

                {teachers.map(
                  (teacher, index) => {

                    const fullName = [
                      teacher.FirstName,
                      teacher.MiddleName,
                      teacher.LastName,
                    ]
                      .filter(Boolean)
                      .join(" ");

                    const departmentName =
                      teacher.DepartmentName ||
                      getDepartmentName(
                        teacher.DepartmentId
                      );

                    const teacherDepts = getTeacherDepartments(teacher);
                    const teacherSubjs = getTeacherSubjects(teacher);

                    return (

                      <tr
                        key={
                          teacher.Id ??
                          teacher.TeacherCode ??
                          index
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          {teacher.Photo || teacher.photo ? (
                            <img
                              src={teacher.Photo || teacher.photo}
                              alt={fullName || "Teacher"}
                              className="teacher-avatar-thumb"
                              onClick={() => openPhotoInNewTab(teacher.Photo || teacher.photo, fullName)}
                              title="Click to view full photo"
                            />
                          ) : (
                            <div className="teacher-avatar-placeholder">👤</div>
                          )}
                        </td>

                        <td>
                          <strong>
                            {teacher.TeacherCode || "-"}
                          </strong>
                        </td>

                        <td>
                          {fullName || "-"}
                        </td>

                        <td>
                          {teacher.FatherName || teacher.fatherName || "-"}
                        </td>

                        <td>
                          {teacher.MotherName || teacher.motherName || "-"}
                        </td>

                        <td>
                          {teacher.EducationPdf || teacher.educationPdf ? (
                            <button
                              type="button"
                              className="teacher-view-pdf-btn"
                              onClick={() => openPdfInNewTab(teacher.EducationPdf || teacher.educationPdf, `${fullName} Education Documents`)}
                              title="View Education PDF"
                            >
                              📄 View PDF
                            </button>
                          ) : (
                            "-"
                          )}
                        </td>

                        {/* DEPARTMENT(S) */}
                        <td>
                          {teacherDepts.length > 0 ? (
                            <div className="teacher-pills-wrap">
                              {teacherDepts.map((d, i) => (
                                <span
                                  key={d.id ?? i}
                                  className={`teacher-dept-pill ${d.isPrimary ? "primary" : ""}`}
                                  title={d.isPrimary ? "Primary Department" : "Assigned Department"}
                                >
                                  {d.isPrimary && <span className="teacher-pill-star">★</span>}
                                  {d.name || getDepartmentName(d.id)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            departmentName || "-"
                          )}
                        </td>

                        {/* SUBJECT(S) */}
                        <td>
                          {teacherSubjs.length > 0 ? (
                            <div className="teacher-pills-wrap">
                              {teacherSubjs.map((s, i) => (
                                <span
                                  key={s.id ?? i}
                                  className={`teacher-subject-pill ${s.isPrimary ? "primary" : ""}`}
                                  title={s.isPrimary ? "Primary Subject" : "Assigned Subject"}
                                >
                                  {s.isPrimary && <span className="teacher-pill-star">★</span>}
                                  {s.name || getSubjectName(s.id)}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="teacher-text-muted">-</span>
                          )}
                        </td>

                        <td>
                          {teacher.Gender || "-"}
                        </td>

                        <td>
                          {teacher.Email || "-"}
                        </td>

                        <td>
                          {teacher.PhoneNumber || "-"}
                        </td>

                        <td>
                          {teacher.Qualification || "-"}
                        </td>

                        <td>
                          {teacher.Experience ?? 0}
                        </td>

                        <td>
                          {formatDate(
                            teacher.JoiningDate
                          )}
                        </td>

                        <td>

                          {teacher.IsClassTeacher
                            ? "Yes"
                            : "No"}

                        </td>

                        <td>

                          {teacher.IsActive
                            ? "Active"
                            : "Inactive"}

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );
};

export default GetTeacherByName;