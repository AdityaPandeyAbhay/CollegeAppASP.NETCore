// =====================================================
// DELETE ACADEMIC YEAR PAGE
// =====================================================

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  deleteAcademicYear,
  getAllAcademicYear,
} from "../../Services/academicYearService";
import "./DeleteAcademicYear.css";

const DeleteAcademicYear = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [academicYears, setAcademicYears] = useState([]);
  const [loadingDropdown, setLoadingDropdown] = useState(true);
  const [selectedYearName, setSelectedYearName] = useState("");
  const [selectedYear, setSelectedYear] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Helper date formatter
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return String(dateString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch (_) {
      return String(dateString);
    }
  };

  // ===================================================
  // LOAD DROPDOWN
  // ===================================================

  const loadAcademicYears = async () => {
    try {
      setLoadingDropdown(true);
      const data = await getAllAcademicYear();
      const list = Array.isArray(data) ? data : [];
      setAcademicYears(list);

      const navYearName = location.state?.yearName;
      if (navYearName) {
        const found = list.find(
          (y) =>
            (y.yearName ?? y.YearName)?.toLowerCase() ===
            navYearName.toLowerCase(),
        );
        if (found) {
          const name = found.yearName ?? found.YearName;
          setSelectedYearName(name);
          setSelectedYear(found);
        }
      }
    } catch (err) {
      setMessageType("error");
      setMessage(err.message || "Failed to load academic years.");
      setShowPopup(true);
    } finally {
      setLoadingDropdown(false);
    }
  };

  useEffect(() => {
    loadAcademicYears();
  }, []);

  const handleSelectChange = (e) => {
    const name = e.target.value;
    setSelectedYearName(name);
    setMessage("");

    if (!name) {
      setSelectedYear(null);
      return;
    }

    const found = academicYears.find(
      (y) => (y.yearName ?? y.YearName) === name,
    );
    setSelectedYear(found || null);
  };

  const showMessage = (type, text) => {
    setMessageType(type);
    setMessage(text);
    setShowPopup(true);

    if (type === "success") {
      setTimeout(() => {
        setShowPopup(false);
      }, 4000);
    }
  };

  // ===================================================
  // EXECUTE DELETE
  // ===================================================

  const handleConfirmDelete = async () => {
    if (!selectedYearName) return;

    try {
      setLoading(true);
      setShowConfirmModal(false);

      await deleteAcademicYear(selectedYearName);

      showMessage(
        "success",
        `Academic Year "${selectedYearName}" has been successfully deleted.`,
      );

      setSelectedYearName("");
      setSelectedYear(null);
      await loadAcademicYears();
    } catch (error) {
      showMessage(
        "error",
        error.message || "Failed to delete academic year. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="academic-year-page">
      {/* POPUP NOTIFICATION */}
      {showPopup && (
        <div
          className={`academic-year-popup ${
            messageType === "success"
              ? "academic-year-popup-success"
              : "academic-year-popup-error"
          }`}
        >
          <div className="academic-year-popup-icon">
            {messageType === "success" ? "✓" : "✕"}
          </div>
          <div className="academic-year-popup-message">{message}</div>
          <button
            type="button"
            className="academic-year-popup-close"
            onClick={() => setShowPopup(false)}
          >
            ×
          </button>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {showConfirmModal && (
        <div className="academic-year-modal-overlay">
          <div className="academic-year-modal-card">
            <div className="academic-year-modal-warning-icon">⚠</div>
            <h2>Confirm Deletion</h2>
            <p>
              Are you sure you want to permanently delete the Academic Year{" "}
              <strong>"{selectedYearName}"</strong>? This action cannot be
              undone.
            </p>
            <div className="academic-year-modal-actions">
              <button
                type="button"
                className="academic-year-btn academic-year-btn-danger"
                onClick={handleConfirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes, Delete Academic Year"}
              </button>
              <button
                type="button"
                className="academic-year-btn academic-year-btn-secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="academic-year-container">
        {/* HEADER */}
        <div className="academic-year-header">
          <div>
            <h1>Delete Academic Year</h1>
            <p>Select an academic year to review and remove from the system.</p>
          </div>
          <button
            type="button"
            className="academic-year-btn academic-year-btn-secondary"
            onClick={() => navigate("/academic-year/all")}
          >
            All Academic Years
          </button>
        </div>

        {/* SELECT DROPDOWN */}
        <div className="academic-year-select-section">
          <div className="academic-year-form-group">
            <label htmlFor="deleteYearSelect">
              Select Academic Year to Delete <span>*</span>
            </label>
            <select
              id="deleteYearSelect"
              value={selectedYearName}
              onChange={handleSelectChange}
              disabled={loadingDropdown || loading}
            >
              <option value="">-- Choose Academic Year from Dropdown --</option>
              {academicYears.map((item) => {
                const name = item.yearName ?? item.YearName ?? "";
                const isCurr = item.isCurrent ?? item.IsCurrent;
                const isAct = item.isActive ?? item.IsActive;

                return (
                  <option key={item.id ?? item.Id ?? name} value={name}>
                    {name} {isCurr ? "★ (Current)" : ""}{" "}
                    {!isAct ? "[Inactive]" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* PREVIEW CARD */}
        {selectedYear ? (
          <div className="academic-year-delete-preview">
            <div className="academic-year-warning-banner">
              <strong>Notice:</strong> Please verify the details below before
              confirming deletion. Deleting an academic year may affect
              historical batch records.
            </div>

            <div
              className="academic-year-detail-card"
              style={{ marginTop: "20px" }}
            >
              <div className="academic-year-detail-header">
                <div>
                  <span className="academic-year-detail-title-label">
                    Selected Year
                  </span>
                  <h2 className="academic-year-detail-title">
                    {selectedYear.yearName ?? selectedYear.YearName}
                  </h2>
                </div>
                <div className="academic-year-badge-group">
                  {(selectedYear.isCurrent ?? selectedYear.IsCurrent) ? (
                    <span className="academic-year-badge badge-current">
                      ★ Current Academic Year
                    </span>
                  ) : (
                    <span className="academic-year-badge badge-muted">
                      Not Current
                    </span>
                  )}

                  {(selectedYear.isActive ?? selectedYear.IsActive) ? (
                    <span className="academic-year-badge badge-active">
                      Active
                    </span>
                  ) : (
                    <span className="academic-year-badge badge-inactive">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="academic-year-detail-grid">
                <div className="academic-year-detail-item">
                  <span className="academic-year-detail-label">Start Date</span>
                  <span className="academic-year-detail-value">
                    {formatDate(
                      selectedYear.startDate ?? selectedYear.StartDate,
                    )}
                  </span>
                </div>

                <div className="academic-year-detail-item">
                  <span className="academic-year-detail-label">End Date</span>
                  <span className="academic-year-detail-value">
                    {formatDate(selectedYear.endDate ?? selectedYear.EndDate)}
                  </span>
                </div>

                <div className="academic-year-detail-item">
                  <span className="academic-year-detail-label">
                    Created Date
                  </span>
                  <span className="academic-year-detail-value">
                    {formatDate(
                      selectedYear.createdDate ?? selectedYear.CreatedDate,
                    )}
                  </span>
                </div>
              </div>

              <div className="academic-year-detail-actions">
                <button
                  type="button"
                  className="academic-year-btn academic-year-btn-danger"
                  onClick={() => setShowConfirmModal(true)}
                  disabled={loading}
                >
                  Delete Academic Year
                </button>
                <button
                  type="button"
                  className="academic-year-btn academic-year-btn-secondary"
                  onClick={() => {
                    setSelectedYearName("");
                    setSelectedYear(null);
                  }}
                  disabled={loading}
                >
                  Cancel Selection
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="academic-year-select-prompt">
            <p>
              Please select an academic year from the dropdown above to view its
              details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteAcademicYear;
