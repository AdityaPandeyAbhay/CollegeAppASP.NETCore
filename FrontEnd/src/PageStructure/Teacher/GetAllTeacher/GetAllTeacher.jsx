// =====================================================
// GET ALL TEACHERS
// =====================================================

import { useEffect, useState } from "react";

import {
  getAllTeachers,
  isTeacherSoftDeleted,
} from "../../../Services/teacherService";

import {
  getDepartmentDropdown,
} from "../../../Services/departmentService";

import { openPhotoInNewTab, openPdfInNewTab } from "../../../Utils/fileHelper";
import "./GetAllTeacher.css";

const GetAllTeacher = () => {

  // ===================================================
  // STATE
  // ===================================================

  const [teachers, setTeachers] =
    useState([]);

  const [departments, setDepartments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  // ===================================================
  // POPUP
  // ===================================================

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    message: "",
  });

  // ===================================================
  // LOAD DATA
  // ===================================================

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {

    try {

      setLoading(true);
      setError("");

      const [
        teacherResult,
        departmentResult,
      ] = await Promise.all([
        getAllTeachers(),
        getDepartmentDropdown(),
      ]);

      setTeachers(
        Array.isArray(teacherResult)
          ? teacherResult
          : []
      );

      setDepartments(
        Array.isArray(departmentResult)
          ? departmentResult
          : []
      );

    } catch (err) {

      const message =
        err?.message ||
        "Failed to load teachers.";

      setError(message);

      showPopup(
        "error",
        message
      );

    } finally {

      setLoading(false);

    }
  };

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
  // FILTER
  // ===================================================

  const filteredTeachers =
    teachers.filter((teacher) => {
      if (isTeacherSoftDeleted(teacher)) return false;

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

      const searchText =
        search.toLowerCase().trim();

      return (

        String(
          teacher.TeacherCode || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        fullName
          .toLowerCase()
          .includes(searchText) ||

        departmentName
          .toLowerCase()
          .includes(searchText) ||

        String(
          teacher.Gender || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          teacher.Email || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          teacher.PhoneNumber || ""
        )
          .toLowerCase()
          .includes(searchText) ||

        String(
          teacher.Qualification || ""
        )
          .toLowerCase()
          .includes(searchText)
      );

    });

  // ===================================================
  // DATE FORMAT
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
  // RENDER
  // ===================================================

  return (

    <div className="teacher-all-page">

      {/* =================================================
          POPUP
      ================================================= */}

      {popup.show && (

        <div
          className={`teacher-all-popup teacher-all-popup-${popup.type}`}
        >

          <div className="teacher-all-popup-icon">

            {popup.type === "success"
              ? "✓"
              : "!"}

          </div>

          <div className="teacher-all-popup-content">

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
            className="teacher-all-popup-close"
          >
            ×
          </button>

        </div>

      )}

      {/* =================================================
          CONTAINER
      ================================================= */}

      <div className="teacher-all-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="teacher-all-header">

          <div>

            <h1>
              All Teachers
            </h1>

            <p>
              View all teachers registered
              in the system.
            </p>

          </div>

          <button
            type="button"
            className="teacher-refresh-btn"
            onClick={loadData}
            disabled={loading}
          >

            {loading
              ? "Loading..."
              : "Refresh"}

          </button>

        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <div className="teacher-search-box">

          <input
            type="text"
            placeholder="Search by code, name, department, gender, email, phone or qualification..."
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
          />

        </div>

        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="teacher-all-error">
            {error}
          </div>

        )}

        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="teacher-loading">
            Loading teachers...
          </div>

        ) : filteredTeachers.length === 0 ? (

          <div className="teacher-empty">
            No teachers found.
          </div>

        ) : (

          <div className="teacher-table-wrapper">

            <table className="teacher-table">

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
                    Department
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
                    Salary
                  </th>

                  <th>
                    Class Teacher
                  </th>

                  <th>Status</th>

                </tr>

              </thead>

              <tbody>

                {filteredTeachers.map(
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

                        {/* DEPARTMENT NAME */}

                        <td>
                          {departmentName}
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

                          ₹{" "}

                          {Number(
                            teacher.Salary || 0
                          ).toLocaleString(
                            "en-IN"
                          )}

                        </td>

                        <td>

                          <span
                            className={
                              teacher.IsClassTeacher
                                ? "teacher-status active"
                                : "teacher-status inactive"
                            }
                          >

                            {teacher.IsClassTeacher
                              ? "Yes"
                              : "No"}

                          </span>

                        </td>

                        <td>

                          <span
                            className={
                              teacher.IsActive
                                ? "teacher-status active"
                                : "teacher-status inactive"
                            }
                          >

                            {teacher.IsActive
                              ? "Active"
                              : "Inactive"}

                          </span>

                        </td>

                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

        {/* =================================================
            COUNT
        ================================================= */}

        {!loading &&
          filteredTeachers.length > 0 && (

            <div className="teacher-count">

              Showing{" "}

              <strong>
                {filteredTeachers.length}
              </strong>{" "}

              teacher(s)

            </div>

          )}

      </div>

    </div>

  );
};

export default GetAllTeacher;