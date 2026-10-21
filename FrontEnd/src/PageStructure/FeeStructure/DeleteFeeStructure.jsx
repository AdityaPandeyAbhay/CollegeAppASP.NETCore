// =====================================================
// DELETE FEE STRUCTURE
// =====================================================

import { useState, useEffect } from "react";

import {
  getAllFeeStructures,
  getFeeStructureById,
  deleteFeeStructure,
  updateFeeStructure,
} from "../../Services/feeStructureService";

import { getAcademicYearDropdown } from "../../Services/academicYearService";
import { getDepartmentDropdown } from "../../Services/departmentService";
import { getClassDropdown } from "../../Services/classService";
import { getFeeCategoryDropdown } from "../../Services/feeCategoryService";
import FeePopupModal from "./FeePopupModal";

import "./DeleteFeeStructure.css";

const DeleteFeeStructure = () => {
  const [id, setId] = useState("");
  const [structures, setStructures] = useState([]);
  const [feeStructure, setFeeStructure] = useState(null);

  // Dropdowns for search filters
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [feeCategories, setFeeCategories] = useState([]);

  // Search filter states
  const [filterSearch, setFilterSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Track if filter / search has been applied
  const [filterApplied, setFilterApplied] = useState(false);

  // Popup Modal State for success or failure feedback
  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingDropdown(true);
      setError("");

      const [years, depts, cls, cats, allStructures] = await Promise.all([
        getAcademicYearDropdown().catch(() => []),
        getDepartmentDropdown().catch(() => []),
        getClassDropdown().catch(() => []),
        getFeeCategoryDropdown().catch(() => []),
        getAllFeeStructures().catch(() => []),
      ]);

      setAcademicYears(Array.isArray(years) ? years : []);
      setDepartments(Array.isArray(depts) ? depts : []);
      setClasses(Array.isArray(cls) ? cls : []);
      setFeeCategories(Array.isArray(cats) ? cats : []);
      setStructures(Array.isArray(allStructures) ? allStructures : []);
    } catch (err) {
      console.warn("Failed to load initial fee structure options:", err);
      setError("Failed to load Fee Structure options.");
    } finally {
      setLoadingDropdown(false);
    }
  };

  const loadStructures = async () => {
    try {
      const allStructures = await getAllFeeStructures();
      setStructures(Array.isArray(allStructures) ? allStructures : []);
    } catch (err) {
      console.warn("Failed to reload structures:", err);
    }
  };

  // =====================================================
  // LOAD STRUCTURE DETAILS
  // =====================================================

  const loadStructureDetails = async (selectedId) => {
    setError("");
    setMessage("");
    setFeeStructure(null);

    if (!selectedId) {
      setError("Please select a Fee Structure.");
      return;
    }

    setLoading(true);

    try {
      const found = structures.find((s) => String(s.Id) === String(selectedId));

      if (found) {
        setFeeStructure(found);
      }

      const freshData = await getFeeStructureById(selectedId);
      if (freshData) {
        setFeeStructure(freshData);
      } else if (!found) {
        setError("Fee Structure not found.");
      }

      // Scroll smoothly down to details card
      setTimeout(() => {
        const detailsElem = document.getElementById(
          "fee-structure-delete-details-section",
        );
        if (detailsElem) {
          detailsElem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      setError(err.message || "Fee Structure not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRecord = (recordId) => {
    setId(recordId);
    loadStructureDetails(recordId);
  };

  const handleCancelSelect = () => {
    setId("");
    setFeeStructure(null);
    setError("");
    setMessage("");
  };

  const handleApplyFilter = () => {
    setFilterApplied(true);
    setMessage("");
    setError("");
  };

  const handleResetFilters = () => {
    setFilterSearch("");
    setFilterYear("");
    setFilterDept("");
    setFilterClass("");
    setFilterCategory("");
    setFilterStatus("ALL");
    setFilterApplied(false);
    setId("");
    setFeeStructure(null);
    setError("");
    setMessage("");
  };

  // =====================================================
  // SMART DELETE
  // If record is in use, soft-delete (deactivate)
  // Otherwise permanently delete
  // =====================================================

  const handleDelete = async () => {
    if (!feeStructure) {
      setError("Please select a Fee Structure first.");
      return;
    }

    const title = `${feeStructure.ClassName || "Class"} - ${
      feeStructure.FeeCategoryName || "Category"
    } (₹${Number(feeStructure.Amount || 0).toFixed(2)})`;

    const confirmed = window.confirm(
      `Are you sure you want to delete Fee Structure "${title}" (ID: ${feeStructure.Id})?`,
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");
    setMessage("");

    try {
      // Step 1: Attempt permanent delete first
      try {
        await deleteFeeStructure(feeStructure.Id);
        const successMsg = `Fee Structure for "${title}" was permanently deleted.`;
        setMessage(successMsg);
        setPopup({
          show: true,
          type: "success",
          title: "Deleted Successfully!",
          message: successMsg,
        });
      } catch (deleteErr) {
        // Step 2: If permanent delete fails because it is referenced in another table, deactivate it!
        console.warn(
          "Permanent delete failed (record in use), deactivating instead:",
          deleteErr,
        );

        await updateFeeStructure(feeStructure.Id, {
          academicYearId: Number(feeStructure.AcademicYearId),
          departmentId: Number(feeStructure.DepartmentId),
          classId: Number(feeStructure.ClassId),
          feeCategoryId: Number(feeStructure.FeeCategoryId),
          amount: Number(feeStructure.Amount),
          dueDate: feeStructure.DueDate,
          description: feeStructure.Description || null,
          isActive: false,
        });

        const deactivateMsg = `Fee Structure for "${title}" is used in other records and has been deactivated instead of permanently deleted.`;
        setMessage(deactivateMsg);
        setPopup({
          show: true,
          type: "success",
          title: "Deactivated Successfully!",
          message: deactivateMsg,
        });
      }

      setFeeStructure(null);
      setId("");

      // Reload structures records table
      await loadStructures();
      setFilterApplied(true);
    } catch (err) {
      const errMsg =
        err.message || "Failed to delete or deactivate Fee Structure.";
      setError(errMsg);
      setPopup({
        show: true,
        type: "error",
        title: "Delete Failed",
        message: errMsg,
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleFilterDeptChange = (e) => {
    const newDept = e.target.value;
    setFilterDept(newDept);
    if (newDept && filterClass) {
      const belongs = classes.some(
        (c) =>
          String(c.id ?? c.Id) === String(filterClass) &&
          String(c.departmentId ?? c.DepartmentId) === String(newDept),
      );
      if (!belongs) {
        setFilterClass("");
      }
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) {
      return date;
    }
    return parsed.toLocaleDateString();
  };

  // Filter classes by selected department for filter box
  const availableFilterClasses = filterDept
    ? classes.filter(
        (c) => String(c.departmentId ?? c.DepartmentId) === String(filterDept),
      )
    : classes;

  // =====================================================
  // FILTER STRUCTURES FOR DIRECT TABLE DISPLAY
  // =====================================================

  const filteredStructures = structures.filter((item) => {
    if (filterStatus === "ACTIVE" && !item.IsActive) return false;
    if (filterStatus === "INACTIVE" && item.IsActive) return false;

    if (filterYear && String(item.AcademicYearId) !== String(filterYear)) {
      return false;
    }
    if (filterDept && String(item.DepartmentId) !== String(filterDept)) {
      return false;
    }
    if (filterClass && String(item.ClassId) !== String(filterClass)) {
      return false;
    }
    if (
      filterCategory &&
      String(item.FeeCategoryId) !== String(filterCategory)
    ) {
      return false;
    }

    if (filterSearch.trim()) {
      const q = filterSearch.toLowerCase().trim();
      const matches =
        String(item.Id ?? "")
          .toLowerCase()
          .includes(q) ||
        String(item.AcademicYearName ?? "")
          .toLowerCase()
          .includes(q) ||
        String(item.DepartmentName ?? "")
          .toLowerCase()
          .includes(q) ||
        String(item.ClassName ?? "")
          .toLowerCase()
          .includes(q) ||
        String(item.FeeCategoryName ?? "")
          .toLowerCase()
          .includes(q) ||
        String(item.Amount ?? "")
          .toLowerCase()
          .includes(q) ||
        String(item.Description ?? "")
          .toLowerCase()
          .includes(q) ||
        (item.IsActive ? "active" : "inactive").includes(q);

      if (!matches) return false;
    }

    return true;
  });

  return (
    <div className="fee-structure-delete-container">
      {/* POPUP MODAL (SUCCESS / ERROR) */}
      <FeePopupModal
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() =>
          setPopup({ show: false, type: "success", title: "", message: "" })
        }
      />

      <div className="fee-structure-delete-card">
        {/* HEADER WITH TOP RIGHT SEARCH BAR AND REFRESH */}
        <div className="fee-structure-delete-header">
          <div>
            <h2>Delete Fee Structure</h2>
            <p>
              Search or apply filters to view records, then click any record to
              delete or deactivate.
            </p>
          </div>

          <div className="fee-header-right-actions">
            {/* TOP RIGHT SEARCH BAR */}
            <div className="fee-top-search-bar">
              <input
                type="text"
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleApplyFilter();
                  }
                }}
                placeholder="Search across columns..."
                className="fee-top-search-input"
              />
              <button
                type="button"
                className="fee-top-search-btn"
                onClick={handleApplyFilter}
                title="Search"
              >
                Search
              </button>
            </div>

            <button
              type="button"
              className="fee-structure-refresh-btn"
              onClick={loadInitialData}
              disabled={loadingDropdown}
            >
              {loadingDropdown ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* FILTERS AREA (NO SEARCH BAR INSIDE FILTER GRID) */}
        <div className="fee-delete-filter-box">
          <div className="fee-delete-filter-header">
            <span className="fee-delete-filter-title">Filter Options</span>
          </div>

          <div className="fee-delete-filter-grid">
            <div className="fee-delete-filter-item">
              <label>Academic Year</label>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(e.target.value)}
              >
                <option value="">All Academic Years</option>
                {academicYears.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ?? item.Text ?? item.name ?? item.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="fee-delete-filter-item">
              <label>Department</label>
              <select value={filterDept} onChange={handleFilterDeptChange}>
                <option value="">All Departments</option>
                {departments.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ?? item.Text ?? item.name ?? item.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="fee-delete-filter-item">
              <label>Class</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="">
                  {filterDept
                    ? availableFilterClasses.length === 0
                      ? "No classes in this department"
                      : "All Department Classes"
                    : "All Classes"}
                </option>
                {availableFilterClasses.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ?? item.Text ?? item.name ?? item.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="fee-delete-filter-item">
              <label>Fee Category</label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="">All Categories</option>
                {feeCategories.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ?? item.Text ?? item.name ?? item.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="fee-delete-filter-item">
              <label>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All (Active & Inactive)</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>
          </div>

          <div className="fee-delete-filter-actions">
            <div className="fee-filter-action-buttons">
              <button
                type="button"
                className="fee-filter-apply-btn"
                onClick={handleApplyFilter}
              >
                Apply Filters
              </button>
              <button
                type="button"
                className="fee-delete-clear-filters-btn"
                onClick={handleResetFilters}
              >
                Clear Filters
              </button>
            </div>

            {filterApplied && (
              <span className="fee-delete-count-text">
                Found {filteredStructures.length} matching Fee Structure records
              </span>
            )}
          </div>
        </div>

        {/* FEEDBACK MESSAGES */}
        {message && (
          <div className="fee-structure-delete-success">{message}</div>
        )}

        {error && <div className="fee-structure-delete-error">{error}</div>}

        {/* RECORDS TABLE SECTION - SHOWN ONLY AFTER APPLIED FILTER */}
        {!filterApplied ? (
          <div className="fee-filter-prompt-box">
            <p>
              Please use the <strong>search bar</strong> above or select filters
              and click <strong>"Apply Filters"</strong> to view available Fee
              Structures.
            </p>
          </div>
        ) : (
          <div className="fee-delete-table-section">
            <div className="fee-delete-table-header">
              <h3>Available Fee Structures</h3>
              <span className="fee-delete-instruction">
                Click on any row or click <strong>"Delete"</strong> to inspect
                and remove
              </span>
            </div>

            {loadingDropdown ? (
              <div className="fee-structure-delete-loading">
                Loading Fee Structures...
              </div>
            ) : filteredStructures.length === 0 ? (
              <div className="fee-structure-empty-table">
                No Fee Structure records found matching the applied filters.
              </div>
            ) : (
              <div className="fee-delete-table-wrapper">
                <table className="fee-delete-table">
                  <thead>
                    <tr>
                      <th>S.No.</th>
                      <th>Academic Year</th>
                      <th>Department</th>
                      <th>Class</th>
                      <th>Fee Category</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredStructures.map((item, index) => {
                      const isSelected = String(item.Id) === String(id);

                      return (
                        <tr
                          key={item.Id || index}
                          className={
                            isSelected ? "fee-row-selected-delete" : ""
                          }
                          onClick={() => handleSelectRecord(item.Id)}
                          title="Click to select this Fee Structure for deletion"
                        >
                          <td>{index + 1}</td>
                          <td>{item.AcademicYearName || "-"}</td>
                          <td>{item.DepartmentName || "-"}</td>
                          <td>{item.ClassName || "-"}</td>
                          <td>{item.FeeCategoryName || "-"}</td>
                          <td>₹{Number(item.Amount || 0).toFixed(2)}</td>
                          <td>{formatDate(item.DueDate)}</td>
                          <td>
                            <span
                              className={
                                item.IsActive
                                  ? "fee-structure-badge-active"
                                  : "fee-structure-badge-inactive"
                              }
                            >
                              {item.IsActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`fee-table-delete-btn ${
                                isSelected ? "selected" : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectRecord(item.Id);
                              }}
                            >
                              {isSelected ? "Selected" : "Delete"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="fee-structure-delete-loading">
            Loading Fee Structure details...
          </div>
        )}

        {/* DETAILS PREVIEW CARD - APPEARS DIRECTLY WHEN A RECORD IS CLICKED */}
        {feeStructure && (
          <div
            id="fee-structure-delete-details-section"
            className="fee-structure-delete-details-card"
          >
            <div className="fee-delete-card-header">
              <div>
                <h3>Selected Fee Structure (ID: {feeStructure.Id})</h3>
                <p className="fee-delete-card-subtitle">
                  Review the details below before deleting or deactivating.
                </p>
              </div>

              <button
                type="button"
                className="fee-delete-cancel-top-btn"
                onClick={handleCancelSelect}
              >
                Close Preview
              </button>
            </div>

            <div className="fee-structure-delete-grid">
              <div>
                <strong>ID</strong>
                <span>{feeStructure.Id}</span>
              </div>

              <div>
                <strong>Academic Year</strong>
                <span>{feeStructure.AcademicYearName || "-"}</span>
              </div>

              <div>
                <strong>Department</strong>
                <span>{feeStructure.DepartmentName || "-"}</span>
              </div>

              <div>
                <strong>Class</strong>
                <span>{feeStructure.ClassName || "-"}</span>
              </div>

              <div>
                <strong>Fee Category</strong>
                <span>{feeStructure.FeeCategoryName || "-"}</span>
              </div>

              <div>
                <strong>Amount</strong>
                <span>₹{Number(feeStructure.Amount || 0).toFixed(2)}</span>
              </div>

              <div>
                <strong>Due Date</strong>
                <span>{formatDate(feeStructure.DueDate)}</span>
              </div>

              <div>
                <strong>Status</strong>
                <span>
                  <span
                    className={
                      feeStructure.IsActive
                        ? "fee-structure-badge-active"
                        : "fee-structure-badge-inactive"
                    }
                  >
                    {feeStructure.IsActive ? "Active" : "Inactive"}
                  </span>
                </span>
              </div>

              <div className="full-width">
                <strong>Description</strong>
                <span>{feeStructure.Description || "-"}</span>
              </div>
            </div>

            <div className="fee-delete-bottom-actions">
              <button
                type="button"
                className="fee-delete-cancel-btn"
                onClick={handleCancelSelect}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                className="fee-structure-delete-btn"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Processing..." : "Delete Fee Structure"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteFeeStructure;
