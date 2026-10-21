// =====================================================
// GET STUDENT BY NAME
// UI Aligned with GetTeacherByName
// =====================================================

import { useState } from "react";
import {
  getStudentByName,
  getAllStudentsWithDetails,
  openPhotoInNewTab,
  isStudentSoftDeleted,
} from "../../Services/studentService";
import "./GetStudentByName.css";

const GetStudentByName = () => {
  const [name, setName] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [popup, setPopup] = useState({ show: false, type: "", message: "" });

  const showPopup = (type, text) => {
    setPopup({ show: true, type, message: text });
    setTimeout(() => {
      setPopup({ show: false, type: "", message: "" });
    }, 4500);
  };

  const closePopup = () => {
    setPopup({ show: false, type: "", message: "" });
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setStudents([]);
    setMessage("");
    setError("");

    if (!name.trim()) {
      const msg = "Student name is required.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    const query = name.trim().toLowerCase();

    try {
      setLoading(true);

      // 1. Try getStudentByName API
      let results = [];
      try {
        const apiRes = await getStudentByName(query);
        results = Array.isArray(apiRes) ? apiRes : [apiRes].filter(Boolean);
      } catch (apiErr) {
        console.warn(
          "Direct getStudentByName failed, falling back to all students:",
          apiErr,
        );
      }

      // 2. Fallback: Search in enriched getAllStudentsWithDetails
      if (results.length === 0) {
        const all = await getAllStudentsWithDetails(false);
        results = all.filter((s) => {
          const fullName = [s.FirstName, s.MiddleName, s.LastName]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          return fullName.includes(query);
        });
      }

      if (!results || results.length === 0) {
        throw new Error(`No students found matching name "${name.trim()}".`);
      }

      setStudents(results);
      const successMsg = `Found ${results.length} student${results.length > 1 ? "s" : ""} matching "${name.trim()}".`;
      setMessage(successMsg);
      showPopup("success", successMsg);
    } catch (err) {
      const errorMsg = err?.message || "Failed to find students.";
      setError(errorMsg);
      showPopup("error", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getFullName = (s) => {
    return [s.FirstName, s.MiddleName, s.LastName].filter(Boolean).join(" ");
    if (!s) return "";
    const composed = [
      s.FirstName || s.firstName,
      s.MiddleName || s.middleName,
      s.LastName || s.lastName,
    ]
      .filter(Boolean)
      .join(" ");
    return (
      composed ||
      s.StudentName ||
      s.studentName ||
      s.Name ||
      s.name ||
      "Student"
    );
  };

  return (
    <div className="student-name-page">
      {/* ================= TOAST POPUP ================= */}
      {popup.show && (
        <div className={`student-name-popup student-name-popup-${popup.type}`}>
          <div className="student-name-popup-icon">
            {popup.type === "success" ? "✓" : "!"}
          </div>
          <div className="student-name-popup-content">
            <strong>{popup.type === "success" ? "Success" : "Notice"}</strong>
            <span>{popup.message}</span>
          </div>
          <button
            type="button"
            onClick={closePopup}
            className="student-name-popup-close"
          >
            ×
          </button>
        </div>
      )}

      <div className="student-name-container">
        {/* ================= HEADER ================= */}
        <div className="student-name-header">
          <h1>Get Student By Name</h1>
          <p>
            Search student information across all departments and classes using
            first, middle, or last name.
          </p>
        </div>

        {/* ================= SEARCH FORM ================= */}
        <form className="student-name-search-form" onSubmit={handleSearch}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter student first, middle or last name (e.g. John, Sharma, Priya)"
          />
          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* ================= MESSAGES ================= */}
        {message && (
          <div className="student-name-message success">{message}</div>
        )}
        {error && <div className="student-name-message error">{error}</div>}

        {/* ================= RESULTS TABLE ================= */}
        {students.length > 0 && (
          <div className="student-name-table-wrapper">
            <table className="student-name-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Photo</th>
                  <th>Admission No.</th>
                  <th>Roll No.</th>
                  <th>Student Name</th>
                  <th>Father Name</th>
                  <th>Mother Name</th>
                  <th>Class & Section</th>
                  <th>Academic Year</th>
                  <th>Gender</th>
                  <th>Date of Birth</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student, index) => {
                  const fullName = getFullName(student) || "Student";
                  const isDeleted = isStudentSoftDeleted(student);
                  const isPromoted =
                    student.IsPromoted === true ||
                    student.isPromoted === true ||
                    String(
                      student.Status || student.status || "",
                    ).toLowerCase() === "promoted";

                  const isActive =
                    !isDeleted &&
                    !isPromoted &&
                    Boolean(student.IsActive ?? student.isActive ?? true) &&
                    String(
                      student.Status || student.status || "active",
                    ).toLowerCase() !== "inactive";

                  const statusText = isPromoted
                    ? "Promoted"
                    : isActive
                      ? "Active"
                      : "Inactive";

                  const statusClass = isPromoted
                    ? "promoted"
                    : isActive
                      ? "active"
                      : "inactive";

                  const admNo =
                    student.AdmissionNumber ||
                    student.admissionNumber ||
                    student.AdmissionNo ||
                    student.admissionNo ||
                    "-";
                  const rollNo =
                    student.RollNumber ||
                    student.rollNumber ||
                    student.RollNo ||
                    student.rollNo ||
                    "-";
                  const fatherName =
                    student.FatherName || student.fatherName || "-";
                  const motherName =
                    student.MotherName || student.motherName || "-";
                  const className =
                    student.ClassName ||
                    student.className ||
                    (student.SchoolClassId || student.schoolClassId
                      ? `Class ${student.SchoolClassId || student.schoolClassId}`
                      : "-");
                  const secName =
                    student.SectionName ||
                    student.sectionName ||
                    (student.SectionId || student.sectionId
                      ? `Sec ${student.SectionId || student.sectionId}`
                      : "");
                  const classSec = secName
                    ? `${className} - ${secName}`
                    : className;
                  const yearName =
                    student.AcademicYearName ||
                    student.academicYearName ||
                    (student.AcademicYearId || student.academicYearId
                      ? `Year ${student.AcademicYearId || student.academicYearId}`
                      : "-");
                  const gender = student.Gender || student.gender || "-";
                  const dobVal =
                    student.DOB ||
                    student.dob ||
                    student.DateOfBirth ||
                    student.dateOfBirth;
                  const email = student.Email || student.email || "-";
                  const phone =
                    student.PhoneNumber ||
                    student.phoneNumber ||
                    student.Phone ||
                    student.phone ||
                    "-";
                  const photo = student.Photo || student.photo;

                  return (
                    <tr key={student.Id ?? student.id ?? admNo ?? index}>
                      <td>{index + 1}</td>
                      <td>
                        {photo ? (
                          <img
                            src={photo}
                            alt={fullName}
                            className="student-avatar-thumb"
                            onClick={() => openPhotoInNewTab(photo, fullName)}
                            title="Click to view full photo in new tab"
                          />
                        ) : (
                          <div className="student-avatar-placeholder">👤</div>
                        )}
                      </td>
                      <td>
                        <strong className="adm-badge">{admNo}</strong>
                      </td>
                      <td>{rollNo}</td>
                      <td>
                        <span className="student-name-text">{fullName}</span>
                      </td>
                      <td>{fatherName}</td>
                      <td>{motherName}</td>
                      <td>
                        <span className="class-badge">{classSec}</span>
                      </td>
                      <td>{yearName}</td>
                      <td>{gender}</td>
                      <td>
                        {dobVal
                          ? new Date(dobVal).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                      <td>{email}</td>
                      <td>{phone}</td>
                      <td>
                        <span
                          className={`student-status ${statusClass}`}
                          title={
                            isPromoted
                              ? "Student has been promoted from this academic year and class"
                              : statusText
                          }
                        >
                          {statusText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetStudentByName;
