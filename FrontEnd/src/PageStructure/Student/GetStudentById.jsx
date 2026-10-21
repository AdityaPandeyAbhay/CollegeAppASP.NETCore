// =====================================================
// GET STUDENT BY ID / CODE
// UI Aligned with GetTeacherByCode
// =====================================================

import { useState, useEffect } from "react";
import {
  getStudentById,
  getAllStudents,
  openPhotoInNewTab,
  isStudentSoftDeleted,
} from "../../Services/studentService";
import { getStudentAcademicHistory } from "../../Services/studentPromotionService";
import "./GetStudentById.css";

const GetStudentById = () => {
  const [query, setQuery] = useState("");
  const [student, setStudent] = useState(null);
  const [studentsList, setStudentsList] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [loadingList, setLoadingList] = useState(false);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Academic History
  const [academicHistory, setAcademicHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  // Load all students for the dropdown picker
  useEffect(() => {
    loadStudentsList();
  }, []);

  const loadStudentsList = async () => {
    try {
      setLoadingList(true);
      const data = await getAllStudents(false);
      setStudentsList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load students for dropdown:", err);
    } finally {
      setLoadingList(false);
    }
  };

  // Fetch student by ID or Admission Number
  const fetchStudent = async (identifier) => {
    if (!identifier || !String(identifier).trim()) {
      const msg = "Please enter or select a Student ID or Admission Number.";
      setError(msg);
      showPopup("error", msg);
      return;
    }

    const cleanId = String(identifier).trim();
    setError("");
    setMessage("");
    setStudent(null);
    setAcademicHistory([]);

    try {
      setSearching(true);
      // 1. Try finding in loaded list by ID or Admission Number
      let found = studentsList.find(
        (s) =>
          String(s.Id) === cleanId ||
          String(s.id) === cleanId ||
          String(s.AdmissionNumber || "").toLowerCase() ===
            cleanId.toLowerCase(),
      );

      // 2. If not found in memory list, call getStudentById API
      if (!found) {
        found = await getStudentById(cleanId, false);
      }

      if (!found) {
        throw new Error(
          `Student with ID or Admission Number "${cleanId}" not found.`,
        );
      }

      const resolvedStudentId = found.Id ?? found.id ?? cleanId;
      setStudent(found);
      setSelectedStudentId(String(resolvedStudentId));
      setQuery(String(resolvedStudentId));

      // Fetch Academic Year Progression History
      loadAcademicHistory(resolvedStudentId);

      const fullName = [found.FirstName, found.MiddleName, found.LastName]
        .filter(Boolean)
        .join(" ");

      const successMsg = `Student "${fullName || cleanId}" found successfully.`;
      setMessage(successMsg);
      showPopup("success", successMsg);
    } catch (err) {
      const errorMsg = err?.message || "Student record not found.";
      setError(errorMsg);
      showPopup("error", errorMsg);
    } finally {
      setSearching(false);
    }
  };

  const loadAcademicHistory = async (studentId) => {
    try {
      setLoadingHistory(true);
      const res = await getStudentAcademicHistory(studentId);
      const historyList = Array.isArray(res) ? res : res?.data || [];
      setAcademicHistory(historyList);
    } catch (err) {
      console.warn("Failed to load academic history:", err);
      setAcademicHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleDropdownSelect = async (e) => {
    const sId = e.target.value;
    setSelectedStudentId(sId);
    if (sId) {
      setQuery(sId);
      await fetchStudent(sId);
    }
  };

  const handleManualSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      const msg = "Please enter Student ID or Admission Number.";
      setError(msg);
      showPopup("error", msg);
      return;
    }
    await fetchStudent(query.trim());
  };

  const getFullName = () => {
    if (!student) return "";
    return [student.FirstName, student.MiddleName, student.LastName]
      .filter(Boolean)
      .join(" ");
  };

  const isDeleted = student ? isStudentSoftDeleted(student) : false;
  const isActive = student
    ? !isDeleted && Boolean(student.IsActive ?? student.isActive ?? true)
    : false;

  return (
    <div className="student-id-page">
      {/* ================= TOAST POPUP ================= */}
      {popup.show && (
        <div className={`student-id-popup student-id-popup-${popup.type}`}>
          <div className="student-id-popup-icon">
            {popup.type === "success" ? "✓" : "!"}
          </div>
          <div className="student-id-popup-content">
            <strong>{popup.type === "success" ? "Success" : "Notice"}</strong>
            <span>{popup.message}</span>
          </div>
          <button
            type="button"
            onClick={closePopup}
            className="student-id-popup-close"
          >
            ×
          </button>
        </div>
      )}

      <div className="student-id-container">
        {/* ================= HEADER ================= */}
        <div className="student-id-header">
          <h1>Get Student By ID / Code</h1>
          <p>
            Search and inspect student details using student ID, Admission
            Number, or dropdown selector.
          </p>
        </div>

        {/* ================= SELECTOR / SEARCH CARD ================= */}
        <div className="student-id-selector-card">
          <div className="student-id-picker-group">
            <label
              htmlFor="student-picker-dropdown"
              className="student-id-picker-label"
            >
              Select Student (Active & Inactive):
            </label>
            <select
              id="student-picker-dropdown"
              className="student-id-select-dropdown"
              value={selectedStudentId}
              onChange={handleDropdownSelect}
              disabled={loadingList || searching}
            >
              <option value="">
                {loadingList
                  ? "⏳ Loading students list..."
                  : `-- Choose a Student (${studentsList.length} registered) --`}
              </option>
              {studentsList.map((s) => {
                const name =
                  [s.FirstName, s.MiddleName, s.LastName]
                    .filter(Boolean)
                    .join(" ") || "Unnamed Student";
                const adm = s.AdmissionNumber || "No Adm";
                const sId = s.Id ?? s.id;
                const active =
                  !isStudentSoftDeleted(s) &&
                  Boolean(s.IsActive ?? s.isActive ?? true);
                return (
                  <option key={sId} value={sId}>
                    {name} (Adm: {adm} | ID: #{sId}) - [
                    {active ? "Active" : "Inactive"}]
                  </option>
                );
              })}
            </select>
          </div>

          <div className="student-id-divider">
            <span>OR SEARCH BY ID / ADMISSION NUMBER</span>
          </div>

          <form
            className="student-id-search-form"
            onSubmit={handleManualSearch}
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Student ID or Admission Number (e.g. 101, ADM2025001)"
              disabled={searching}
            />
            <button type="submit" disabled={searching}>
              {searching ? "Searching..." : "Search Student"}
            </button>
          </form>
        </div>

        {/* ================= MESSAGES ================= */}
        {message && <div className="student-id-message success">{message}</div>}
        {error && <div className="student-id-message error">{error}</div>}

        {/* ================= STUDENT DETAILS CARD ================= */}
        {student && (
          <div className="student-id-card">
            <div className="student-id-card-header">
              <h2>Student Details</h2>
              <span
                className={`student-status-pill ${isActive ? "active" : "inactive"}`}
              >
                ● {isActive ? "Active" : "Inactive"}
              </span>
            </div>

            {/* Photo & Identity Banner */}
            <div className="student-photo-card-banner">
              {student.Photo ? (
                <img
                  src={student.Photo}
                  alt={getFullName()}
                  className="student-detail-photo"
                  onClick={() =>
                    openPhotoInNewTab(student.Photo, getFullName())
                  }
                  title="Click to view full photo in new tab"
                />
              ) : (
                <div className="student-detail-photo-placeholder">👤</div>
              )}
              <div className="student-banner-meta">
                <h3>{getFullName() || "Student Profile"}</h3>
                <div className="student-banner-tags">
                  <span className="banner-badge">ID: #{student.Id}</span>
                  <span className="banner-badge">
                    Adm No: {student.AdmissionNumber || "-"}
                  </span>
                  <span className="banner-badge">
                    Roll: {student.RollNumber || student.rollNumber || "-"}
                  </span>
                  <span className="banner-badge">
                    {student.ClassName ||
                      `Class ${student.SchoolClassId || "-"}`}{" "}
                    {student.SectionName ? `(${student.SectionName})` : ""}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="student-id-grid">
              <div>
                <label>Student ID</label>
                <p>{student.Id}</p>
              </div>

              <div>
                <label>Admission Number</label>
                <p>{student.AdmissionNumber || "-"}</p>
              </div>

              <div>
                <label>Roll Number</label>
                <p>{student.RollNumber || student.rollNumber || "-"}</p>
              </div>

              <div>
                <label>Full Name</label>
                <p>{getFullName() || "-"}</p>
              </div>

              <div>
                <label>Father's Name</label>
                <p>{student.FatherName || student.fatherName || "-"}</p>
              </div>

              <div>
                <label>Mother's Name</label>
                <p>{student.MotherName || student.motherName || "-"}</p>
              </div>

              <div>
                <label>Department</label>
                <p>
                  {student.DepartmentName ||
                    (student.DepartmentId
                      ? `Dept #${student.DepartmentId}`
                      : "-")}
                </p>
              </div>

              <div>
                <label>Class</label>
                <p>
                  {student.ClassName ||
                    (student.SchoolClassId
                      ? `Class #${student.SchoolClassId}`
                      : "-")}
                </p>
              </div>

              <div>
                <label>Section</label>
                <p>
                  {student.SectionName ||
                    (student.SectionId ? `Section #${student.SectionId}` : "-")}
                </p>
              </div>

              <div>
                <label>Academic Year</label>
                <p>
                  {student.AcademicYearName ||
                    (student.AcademicYearId
                      ? `Year #${student.AcademicYearId}`
                      : "-")}
                </p>
              </div>

              <div>
                <label>Date of Birth</label>
                <p>
                  {student.DOB
                    ? new Date(student.DOB).toLocaleDateString("en-IN")
                    : "-"}
                </p>
              </div>

              <div>
                <label>Gender</label>
                <p>{student.Gender || "-"}</p>
              </div>

              <div>
                <label>Blood Group</label>
                <p>{student.BloodGroup || "-"}</p>
              </div>

              <div>
                <label>Aadhaar Number</label>
                <p>{student.AadhaarNumber || "-"}</p>
              </div>

              <div>
                <label>Email</label>
                <p>{student.Email || "-"}</p>
              </div>

              <div>
                <label>Phone Number</label>
                <p>{student.PhoneNumber || "-"}</p>
              </div>

              <div>
                <label>Alternate Phone</label>
                <p>{student.AlternatePhoneNumber || "-"}</p>
              </div>

              <div>
                <label>Religion / Category</label>
                <p>
                  {[student.Religion, student.Category]
                    .filter(Boolean)
                    .join(" / ") || "-"}
                </p>
              </div>

              <div className="student-id-full">
                <label>Residential Address</label>
                <p>{student.Address || "-"}</p>
              </div>
            </div>

            {/* Academic Progression & Year History */}
            <div className="student-academic-history-section">
              <div className="history-section-header">
                <h3>Academic Progression & Multi-Year History</h3>
                <span className="history-count-badge">
                  {academicHistory.length} Academic Year
                  {academicHistory.length !== 1 ? "s" : ""}
                </span>
              </div>

              {loadingHistory ? (
                <div className="history-loading">
                  <div className="history-spinner"></div>
                  <span>Loading academic history records...</span>
                </div>
              ) : academicHistory.length === 0 ? (
                <div className="history-empty">
                  <span>
                    No multi-year academic progression history recorded yet.
                  </span>
                </div>
              ) : (
                <div className="history-timeline-list">
                  {academicHistory.map((item, index) => {
                    const isCurrent =
                      item.isCurrentYear || item.status === "Active";
                    return (
                      <div
                        key={item.id || index}
                        className={`history-card ${isCurrent ? "history-card-current" : "history-card-past"}`}
                      >
                        <div className="history-card-header">
                          <span className="history-year-title">
                            {item.academicYearName}
                          </span>
                          {isCurrent ? (
                            <span className="current-year-tag">
                              Current Academic Year
                            </span>
                          ) : (
                            <span className="past-year-tag">Previous Year</span>
                          )}
                        </div>
                        <div className="history-details-grid">
                          <div>
                            <span className="hd-label">Class & Section</span>
                            <strong>
                              {item.className} &bull; {item.sectionName}
                            </strong>
                          </div>
                          <div>
                            <span className="hd-label">Roll Number</span>
                            <span className="hd-val">
                              {item.rollNumber || "-"}
                            </span>
                          </div>
                          <div>
                            <span className="hd-label">Enrollment Status</span>
                            <span
                              className={`status-pill status-${(item.status || "active").toLowerCase()}`}
                            >
                              {item.status || "Active"}
                            </span>
                          </div>
                          <div>
                            <span className="hd-label">Enrollment Date</span>
                            <span className="hd-val">
                              {item.enrollmentDate
                                ? new Date(
                                    item.enrollmentDate,
                                  ).toLocaleDateString("en-IN")
                                : "-"}
                            </span>
                          </div>
                        </div>
                        {item.remarks && (
                          <div className="history-remarks">
                            <span className="hd-label">Remarks:</span>{" "}
                            {item.remarks}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetStudentById;
