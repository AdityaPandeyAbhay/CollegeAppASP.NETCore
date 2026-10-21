// =====================================================
// GET ACADEMIC YEAR BY NAME PAGE
// =====================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAcademicYearByName,
  getAllAcademicYear,
} from "../../Services/academicYearService";
import { getRole } from "../../Utils/auth";
import "./GetAcademicYearByName.css";

const GetAcademicYearByName = () => {
  const navigate = useNavigate();
  const role = (getRole() || "").toLowerCase();
  const canManage =
    role === "super admin" || role === "superadmin" || role === "admin";

  // ===================================================
  // STATE
  // ===================================================

  const [yearNameInput, setYearNameInput] = useState("");
  const [availableYears, setAvailableYears] = useState([]);
  const [loadingDropdown, setLoadingDropdown] = useState(true);

  const [academicYear, setAcademicYear] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // ===================================================
  // LOAD DROPDOWN OPTIONS
  // ===================================================

  const loadOptions = async () => {
    try {
      setLoadingDropdown(true);
      const data = await getAllAcademicYear();
      setAvailableYears(Array.isArray(data) ? data : []);
    } catch (_) {
      // Non-critical, user can still type manually
    } finally {
      setLoadingDropdown(false);
    }
  };

  useEffect(() => {
    loadOptions();
  }, []);

  // Format date helper
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
  // SEARCH HANDLER
  // ===================================================

  const executeSearch = async (nameToSearch) => {
    const term = (nameToSearch ?? yearNameInput).trim();
    if (!term) {
      setMessage("Please enter or select an Academic Year Name.");
      setShowPopup(true);
      return;
    }

    try {
      setLoading(true);
      setMessage("");
      setAcademicYear(null);

      const data = await getAcademicYearByName(term);
      setAcademicYear(data);
    } catch (error) {
      setMessage(error.message || `No Academic Year found matching "${term}".`);
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleDropdownSelect = (e) => {
    const selected = e.target.value;
    setYearNameInput(selected);
    if (selected) {
      executeSearch(selected);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch();
  };

  const handleReset = () => {
    setYearNameInput("");
    setAcademicYear(null);
    setMessage("");
  };

  return (
    <div className="academic-year-lookup-page">
      {/* POPUP NOTIFICATION */}
      {showPopup && message && (
        <div className="academic-year-popup academic-year-popup-error">
          <div className="academic-year-popup-icon">✕</div>
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

      <div className="academic-year-lookup-container">
        {/* HEADER */}
        <div className="academic-year-lookup-header">
          <div>
            <h1>Get Academic Year By Name</h1>
            <p>
              Query full academic year records by selecting or entering the year
              name.
            </p>
          </div>
          <button
            type="button"
            className="academic-year-btn academic-year-btn-secondary"
            onClick={() => navigate("/academic-year/all")}
          >
            All Academic Years
          </button>
        </div>

        {/* SEARCH FORM */}
        <div className="academic-year-search-panel">
          {/* Dropdown Quick Selector */}
          <div className="academic-year-form-group">
            <label htmlFor="yearSelect">Select From Existing Years</label>
            <select
              id="yearSelect"
              value={yearNameInput}
              onChange={handleDropdownSelect}
              disabled={loadingDropdown}
            >
              <option value="">-- Choose Academic Year from List --</option>
              {availableYears.map((y) => {
                const name = y.yearName ?? y.YearName ?? "";
                const isCurr = y.isCurrent ?? y.IsCurrent;
                return (
                  <option key={y.id ?? y.Id ?? name} value={name}>
                    {name} {isCurr ? "(Current)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="academic-year-divider-text">or enter manually</div>

          {/* Manual Text Search */}
          <form
            className="academic-year-search-input-row"
            onSubmit={handleSubmit}
          >
            <div className="academic-year-form-group" style={{ flex: 1 }}>
              <label htmlFor="manualYearName">Year Name</label>
              <input
                id="manualYearName"
                type="text"
                placeholder="e.g. 2025-2026"
                value={yearNameInput}
                onChange={(e) => setYearNameInput(e.target.value)}
              />
            </div>
            <div className="academic-year-search-buttons">
              <button
                type="submit"
                className="academic-year-btn academic-year-btn-primary"
                disabled={loading}
              >
                {loading ? "Searching..." : "Search"}
              </button>
              <button
                type="button"
                className="academic-year-btn academic-year-btn-secondary"
                onClick={handleReset}
                disabled={loading}
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {/* RESULT CARD */}
        {academicYear && (
          <div className="academic-year-detail-card">
            <div className="academic-year-detail-header">
              <div>
                <span className="academic-year-detail-title-label">
                  Academic Year
                </span>
                <h2 className="academic-year-detail-title">
                  {academicYear.yearName ?? academicYear.YearName}
                </h2>
              </div>
              <div className="academic-year-badge-group">
                {(academicYear.isCurrent ?? academicYear.IsCurrent) ? (
                  <span className="academic-year-badge badge-current">
                    ★ Current Academic Year
                  </span>
                ) : (
                  <span className="academic-year-badge badge-muted">
                    Not Current
                  </span>
                )}

                {(academicYear.isActive ?? academicYear.IsActive) ? (
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
                  {formatDate(academicYear.startDate ?? academicYear.StartDate)}
                </span>
              </div>

              <div className="academic-year-detail-item">
                <span className="academic-year-detail-label">End Date</span>
                <span className="academic-year-detail-value">
                  {formatDate(academicYear.endDate ?? academicYear.EndDate)}
                </span>
              </div>

              <div className="academic-year-detail-item">
                <span className="academic-year-detail-label">Created Date</span>
                <span className="academic-year-detail-value">
                  {formatDate(
                    academicYear.createdDate ?? academicYear.CreatedDate,
                  )}
                </span>
              </div>

              <div className="academic-year-detail-item">
                <span className="academic-year-detail-label">Last Updated</span>
                <span className="academic-year-detail-value">
                  {formatDate(
                    academicYear.updatedDate ?? academicYear.UpdatedDate,
                  )}
                </span>
              </div>
            </div>

            {canManage && (
              <div className="academic-year-detail-actions">
                <button
                  type="button"
                  className="academic-year-btn academic-year-btn-primary"
                  onClick={() =>
                    navigate("/academic-year/update", {
                      state: {
                        academicYearId: academicYear.id ?? academicYear.Id,
                        yearName:
                          academicYear.yearName ?? academicYear.YearName,
                      },
                    })
                  }
                >
                  Edit This Year
                </button>

                <button
                  type="button"
                  className="academic-year-btn academic-year-btn-danger"
                  onClick={() =>
                    navigate("/academic-year/delete", {
                      state: {
                        yearName:
                          academicYear.yearName ?? academicYear.YearName,
                      },
                    })
                  }
                >
                  Delete This Year
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetAcademicYearByName;
