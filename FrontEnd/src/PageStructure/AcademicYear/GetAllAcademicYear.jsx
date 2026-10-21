// =====================================================
// GET ALL ACADEMIC YEARS PAGE
// =====================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllAcademicYear } from "../../Services/academicYearService";
import { getRole } from "../../Utils/auth";
import "./GetAllAcademicYear.css";

const GetAllAcademicYear = () => {
  const navigate = useNavigate();
  const role = (getRole() || "").toLowerCase();
  const canManage =
    role === "super admin" || role === "superadmin" || role === "admin";

  // ===================================================
  // STATE
  // ===================================================

  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentFilter, setCurrentFilter] = useState("all");

  // ===================================================
  // LOAD DATA
  // ===================================================

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllAcademicYear();
      setAcademicYears(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load academic years.");
      setShowPopup(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return String(dateString);
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch (_) {
      return String(dateString);
    }
  };

  // ===================================================
  // FILTERED LIST
  // ===================================================

  const filteredYears = academicYears.filter((item) => {
    const yearName = (item.yearName ?? item.YearName ?? "").toLowerCase();
    const matchesSearch = yearName.includes(searchTerm.toLowerCase().trim());

    const isActive = item.isActive ?? item.IsActive ?? false;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && isActive) ||
      (statusFilter === "inactive" && !isActive);

    const isCurrent = item.isCurrent ?? item.IsCurrent ?? false;
    const matchesCurrent =
      currentFilter === "all" ||
      (currentFilter === "current" && isCurrent) ||
      (currentFilter === "not_current" && !isCurrent);

    return matchesSearch && matchesStatus && matchesCurrent;
  });

  return (
    <div className="academic-year-list-page">
      {/* ERROR POPUP */}
      {showPopup && error && (
        <div className="academic-year-popup academic-year-popup-error">
          <div className="academic-year-popup-icon">✕</div>
          <div className="academic-year-popup-message">{error}</div>
          <button
            type="button"
            className="academic-year-popup-close"
            onClick={() => setShowPopup(false)}
          >
            ×
          </button>
        </div>
      )}

      <div className="academic-year-list-container">
        {/* HEADER */}
        <div className="academic-year-list-header">
          <div>
            <h1>All Academic Years</h1>
            <p>Manage and monitor institutional academic periods and terms.</p>
          </div>
          <div className="academic-year-header-actions">
            <button
              type="button"
              className="academic-year-btn academic-year-btn-secondary"
              onClick={loadData}
              disabled={loading}
            >
              ↻ Refresh
            </button>
            <button
              type="button"
              className="academic-year-btn academic-year-btn-primary"
              onClick={() => navigate("/academic-year/create")}
            >
              + Create Academic Year
            </button>
            {canManage && (
              <button
                type="button"
                className="academic-year-btn academic-year-btn-primary"
                onClick={() => navigate("/academic-year/create")}
              >
                + Create Academic Year
              </button>
            )}
          </div>
        </div>

        {/* CONTROLS BAR */}
        <div className="academic-year-controls">
          <div className="academic-year-search-box">
            <input
              type="text"
              placeholder="Search by Year Name (e.g. 2025)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="academic-year-search-clear"
                onClick={() => setSearchTerm("")}
              >
                ×
              </button>
            )}
          </div>

          <div className="academic-year-filters">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="academic-year-filter-select"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>

            <select
              value={currentFilter}
              onChange={(e) => setCurrentFilter(e.target.value)}
              className="academic-year-filter-select"
            >
              <option value="all">All Periods</option>
              <option value="current">Current Year Only</option>
              <option value="not_current">Non-Current Years</option>
            </select>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="academic-year-table-wrapper">
          {loading ? (
            <div className="academic-year-state-card">
              <div className="academic-year-spinner"></div>
              <p>Loading academic years...</p>
            </div>
          ) : filteredYears.length === 0 ? (
            <div className="academic-year-state-card">
              <h3>No Academic Years Found</h3>
              <p>
                {searchTerm || statusFilter !== "all" || currentFilter !== "all"
                  ? "No records match your selected filters. Try clearing filters."
                  : "No academic years have been registered yet."}
              </p>
            </div>
          ) : (
            <table className="academic-year-table">
              <thead>
                <tr>
                  <th style={{ width: "60px" }}>#</th>
                  <th>Year Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Is Current</th>
                  <th>Status</th>
                  <th style={{ textAlign: "right", minWidth: "160px" }}>
                    Actions
                  </th>
                  {canManage && (
                    <th style={{ textAlign: "right", minWidth: "160px" }}>
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {filteredYears.map((item, index) => {
                  const id = item.id ?? item.Id;
                  const yearName = item.yearName ?? item.YearName ?? "";
                  const startDate = item.startDate ?? item.StartDate;
                  const endDate = item.endDate ?? item.EndDate;
                  const isCurrent = item.isCurrent ?? item.IsCurrent ?? false;
                  const isActive = item.isActive ?? item.IsActive ?? false;

                  return (
                    <tr key={id ?? yearName ?? index}>
                      <td className="academic-year-index-cell">{index + 1}</td>
                      <td className="academic-year-name-cell">
                        <strong>{yearName}</strong>
                      </td>
                      <td>{formatDate(startDate)}</td>
                      <td>{formatDate(endDate)}</td>
                      <td>
                        {isCurrent ? (
                          <span className="academic-year-badge badge-current">
                            Current
                          </span>
                        ) : (
                          <span className="academic-year-badge badge-muted">
                            No
                          </span>
                        )}
                      </td>
                      <td>
                        {isActive ? (
                          <span className="academic-year-badge badge-active">
                            Active
                          </span>
                        ) : (
                          <span className="academic-year-badge badge-inactive">
                            Inactive
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <div className="academic-year-action-buttons">
                          <button
                            type="button"
                            className="academic-year-action-btn action-edit"
                            onClick={() =>
                              navigate("/academic-year/update", {
                                state: { academicYearId: id, yearName },
                              })
                            }
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="academic-year-action-btn action-delete"
                            onClick={() =>
                              navigate("/academic-year/delete", {
                                state: { yearName },
                              })
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                      {canManage && (
                        <td style={{ textAlign: "right" }}>
                          <div className="academic-year-action-buttons">
                            <button
                              type="button"
                              className="academic-year-action-btn action-edit"
                              onClick={() =>
                                navigate("/academic-year/update", {
                                  state: { academicYearId: id, yearName },
                                })
                              }
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className="academic-year-action-btn action-delete"
                              onClick={() =>
                                navigate("/academic-year/delete", {
                                  state: { yearName },
                                })
                              }
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* SUMMARY FOOTER */}
        {!loading && (
          <div className="academic-year-table-footer">
            <span>
              Showing <strong>{filteredYears.length}</strong> of{" "}
              <strong>{academicYears.length}</strong> academic years
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetAllAcademicYear;
