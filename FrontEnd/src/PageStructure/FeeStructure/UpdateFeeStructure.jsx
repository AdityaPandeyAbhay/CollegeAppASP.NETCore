// =====================================================
// UPDATE FEE STRUCTURE
// =====================================================

import { useEffect, useState } from "react";

import {
  getAllFeeStructures,
  getFeeStructureById,
  updateFeeStructure,
} from "../../Services/feeStructureService";

import { getAcademicYearDropdown } from "../../Services/academicYearService";
import { getDepartmentDropdown } from "../../Services/departmentService";
import { getClassDropdown } from "../../Services/classService";
import { getFeeCategoryDropdown } from "../../Services/feeCategoryService";
import FeePopupModal from "./FeePopupModal";

import "./UpdateFeeStructure.css";

const UpdateFeeStructure = () => {
  const [id, setId] = useState("");

  // All fee structures
  const [structures, setStructures] = useState([]);

  // Dropdowns for form fields and filters
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [feeCategories, setFeeCategories] = useState([]);

  // Search & Filter controls
  const [filterSearch, setFilterSearch] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Track if filter / search has been applied by user
  const [filterApplied, setFilterApplied] = useState(false);

  // Popup Modal State for success or failure feedback
  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    AcademicYearId: "",
    DepartmentId: "",
    ClassId: "",
    FeeCategoryId: "",
    Amount: "",
    DueDate: "",
    Description: "",
    IsActive: true,
  });

  const [recordLoaded, setRecordLoaded] = useState(false);
  const [searching, setSearching] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadDropdownsAndStructures();
  }, []);

  const loadDropdownsAndStructures = async () => {
    setDropdownLoading(true);

    try {
      const [
        allStructures,
        academicYearData,
        departmentData,
        classData,
        feeCategoryData,
      ] = await Promise.all([
        getAllFeeStructures().catch(() => []),
        getAcademicYearDropdown().catch(() => []),
        getDepartmentDropdown().catch(() => []),
        getClassDropdown().catch(() => []),
        getFeeCategoryDropdown().catch(() => []),
      ]);

      setStructures(Array.isArray(allStructures) ? allStructures : []);
      setAcademicYears(Array.isArray(academicYearData) ? academicYearData : []);
      setDepartments(Array.isArray(departmentData) ? departmentData : []);
      setClasses(Array.isArray(classData) ? classData : []);
      setFeeCategories(Array.isArray(feeCategoryData) ? feeCategoryData : []);
    } catch (err) {
      setError(err.message || "Failed to load dropdown data.");
    } finally {
      setDropdownLoading(false);
    }
  };

  const loadStructureDetails = async (selectedId) => {
    setError("");
    setMessage("");
    setRecordLoaded(false);

    if (!selectedId) {
      setError("Please select a Fee Structure.");
      return;
    }

    setSearching(true);

    try {
      const data = await getFeeStructureById(selectedId);

      if (!data) {
        setError("Fee Structure not found.");
        return;
      }

      setFormData({
        AcademicYearId: data.AcademicYearId ?? "",
        DepartmentId: data.DepartmentId ?? "",
        ClassId: data.ClassId ?? "",
        FeeCategoryId: data.FeeCategoryId ?? "",
        Amount: data.Amount ?? "",
        DueDate: data.DueDate ? String(data.DueDate).substring(0, 10) : "",
        Description: data.Description ?? "",
        IsActive: Boolean(data.IsActive ?? true),
      });

      setRecordLoaded(true);

      // Scroll smoothly down to the edit form
      setTimeout(() => {
        const formElement = document.getElementById(
          "fee-structure-edit-form-section",
        );
        if (formElement) {
          formElement.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      setError(err.message || "Fee Structure not found.");
    } finally {
      setSearching(false);
    }
  };

  const handleSelectRecord = (recordId) => {
    setId(recordId);
    loadStructureDetails(recordId);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "DepartmentId") {
      setFormData((prev) => {
        const currentClassBelongs = classes.some(
          (c) =>
            String(c.id ?? c.Id) === String(prev.ClassId) &&
            String(c.departmentId ?? c.DepartmentId) === String(value),
        );
        return {
          ...prev,
          DepartmentId: value,
          ClassId: currentClassBelongs ? prev.ClassId : "",
        };
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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

  const toggleIsActive = () => {
    setFormData((prev) => ({
      ...prev,
      IsActive: !prev.IsActive,
    }));
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
    setRecordLoaded(false);
    setMessage("");
    setError("");
  };

  const handleCancelEdit = () => {
    setId("");
    setRecordLoaded(false);
    setMessage("");
    setError("");
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");
    setUpdating(true);

    try {
      const payload = {
        academicYearId: Number(formData.AcademicYearId),
        departmentId: Number(formData.DepartmentId),
        classId: Number(formData.ClassId),
        feeCategoryId: Number(formData.FeeCategoryId),
        amount: Number(formData.Amount),
        dueDate: formData.DueDate,
        description: formData.Description.trim() || null,
        isActive: Boolean(formData.IsActive),
      };

      await updateFeeStructure(id, payload);

      setMessage("Fee Structure updated successfully.");
      setPopup({
        show: true,
        type: "success",
        title: "Updated Successfully!",
        message: "Fee Structure has been updated successfully.",
      });

      // Refresh structures records table and keep filter applied so user sees update
      const freshStructures = await getAllFeeStructures();
      setStructures(Array.isArray(freshStructures) ? freshStructures : []);
      setFilterApplied(true);
    } catch (err) {
      const errMsg = err.message || "Failed to update Fee Structure.";
      setError(errMsg);
      setPopup({
        show: true,
        type: "error",
        title: "Update Failed",
        message: errMsg,
      });
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString();
  };

  // Filter classes by selected department for filter box
  const availableFilterClasses = filterDept
    ? classes.filter(
        (c) => String(c.departmentId ?? c.DepartmentId) === String(filterDept),
      )
    : classes;

  // Filter classes by selected department for edit form
  const availableFormClasses = formData.DepartmentId
    ? classes.filter(
        (c) =>
          String(c.departmentId ?? c.DepartmentId) ===
          String(formData.DepartmentId),
      )
    : [];

  // Filter structures list for direct table display
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

  const selectedStructure = structures.find((s) => String(s.Id) === String(id));

  return (
    <div className="fee-structure-update-container">
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

      <div className="fee-structure-update-card">
        {/* HEADER WITH TOP RIGHT SEARCH BAR AND REFRESH */}
        <div className="fee-structure-update-header">
          <div>
            <h2>Update Fee Structure</h2>
            <p>
              Search or apply filters to view records, then click any record to
              edit details.
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
              onClick={loadDropdownsAndStructures}
              disabled={dropdownLoading}
            >
              {dropdownLoading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* FILTERS AREA (NO SEARCH BAR INSIDE FILTER GRID) */}
        <div className="fee-update-filter-box">
          <div className="fee-update-filter-header">
            <span className="fee-update-filter-title">Filter Options</span>
          </div>

          <div className="fee-update-filter-grid">
            <div className="fee-update-filter-item">
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

            <div className="fee-update-filter-item">
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

            <div className="fee-update-filter-item">
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

            <div className="fee-update-filter-item">
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

            <div className="fee-update-filter-item">
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

          <div className="fee-update-filter-actions">
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
                className="fee-update-clear-btn"
                onClick={handleResetFilters}
              >
                Clear Filters
              </button>
            </div>

            {filterApplied && (
              <span className="fee-update-count-text">
                Found {filteredStructures.length} matching Fee Structure records
              </span>
            )}
          </div>
        </div>

        {/* FEEDBACK MESSAGES */}
        {message && (
          <div className="fee-structure-update-success">{message}</div>
        )}

        {error && <div className="fee-structure-update-error">{error}</div>}

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
          <div className="fee-update-table-section">
            <div className="fee-update-table-header">
              <h3>Available Fee Structures</h3>
              <span className="fee-update-instruction">
                Click on any row or click <strong>"Edit"</strong> to update
                details
              </span>
            </div>

            {dropdownLoading ? (
              <div className="fee-structure-loading">
                Loading Fee Structures...
              </div>
            ) : filteredStructures.length === 0 ? (
              <div className="fee-structure-empty-table">
                No Fee Structure records found matching the applied filters.
              </div>
            ) : (
              <div className="fee-update-table-wrapper">
                <table className="fee-update-table">
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
                          className={isSelected ? "fee-row-selected" : ""}
                          onClick={() => handleSelectRecord(item.Id)}
                          title="Click to edit this Fee Structure"
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
                                  ? "fee-status-active"
                                  : "fee-status-inactive"
                              }
                            >
                              {item.IsActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`fee-table-select-btn ${
                                isSelected ? "selected" : ""
                              }`}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectRecord(item.Id);
                              }}
                            >
                              {isSelected ? "Editing" : "Edit"}
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

        {searching && (
          <div className="fee-structure-loading">
            Loading Fee Structure details...
          </div>
        )}

        {/* EDIT FORM - APPEARS DIRECTLY WHEN A RECORD IS CLICKED */}
        {recordLoaded && (
          <div
            id="fee-structure-edit-form-section"
            className="fee-structure-edit-form-card"
          >
            <div className="fee-edit-form-header">
              <div>
                <h3>Editing Fee Structure (ID: {id})</h3>
                {selectedStructure && (
                  <p className="fee-edit-form-subtitle">
                    {selectedStructure.ClassName || "Class"} -{" "}
                    {selectedStructure.FeeCategoryName || "Category"} [
                    {selectedStructure.AcademicYearName || "Year"}]
                  </p>
                )}
              </div>

              <button
                type="button"
                className="fee-edit-cancel-top-btn"
                onClick={handleCancelEdit}
              >
                Close Form
              </button>
            </div>

            <form onSubmit={handleUpdate} className="fee-structure-edit-form">
              <div className="fee-structure-update-grid">
                <div className="fee-structure-update-group">
                  <label>Academic Year *</label>
                  <select
                    name="AcademicYearId"
                    value={formData.AcademicYearId}
                    onChange={handleChange}
                    disabled={dropdownLoading || updating}
                    required
                  >
                    <option value="">Select Academic Year</option>
                    {academicYears.map((item) => (
                      <option
                        key={item.id ?? item.Id}
                        value={item.id ?? item.Id}
                      >
                        {item.text ?? item.Text ?? item.name ?? item.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fee-structure-update-group">
                  <label>Department *</label>
                  <select
                    name="DepartmentId"
                    value={formData.DepartmentId}
                    onChange={handleChange}
                    disabled={dropdownLoading || updating}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((item) => (
                      <option
                        key={item.id ?? item.Id}
                        value={item.id ?? item.Id}
                      >
                        {item.text ?? item.Text ?? item.name ?? item.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fee-structure-update-group">
                  <label>Class *</label>
                  <select
                    name="ClassId"
                    value={formData.ClassId}
                    onChange={handleChange}
                    disabled={
                      dropdownLoading || updating || !formData.DepartmentId
                    }
                    required
                  >
                    <option value="">
                      {formData.DepartmentId
                        ? availableFormClasses.length === 0
                          ? "No classes in this department"
                          : "Select Class"
                        : "-- Select Department First --"}
                    </option>
                    {availableFormClasses.map((item) => (
                      <option
                        key={item.id ?? item.Id}
                        value={item.id ?? item.Id}
                      >
                        {item.text ?? item.Text ?? item.name ?? item.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fee-structure-update-group">
                  <label>Fee Category *</label>
                  <select
                    name="FeeCategoryId"
                    value={formData.FeeCategoryId}
                    onChange={handleChange}
                    disabled={dropdownLoading || updating}
                    required
                  >
                    <option value="">Select Fee Category</option>
                    {feeCategories.map((item) => (
                      <option
                        key={item.id ?? item.Id}
                        value={item.id ?? item.Id}
                      >
                        {item.text ?? item.Text ?? item.name ?? item.Name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="fee-structure-update-group">
                  <label>Amount (₹) *</label>
                  <input
                    type="number"
                    name="Amount"
                    value={formData.Amount}
                    onChange={handleChange}
                    min="0.01"
                    step="0.01"
                    disabled={updating}
                    required
                  />
                </div>

                <div className="fee-structure-update-group">
                  <label>Due Date *</label>
                  <input
                    type="date"
                    name="DueDate"
                    value={formData.DueDate}
                    onChange={handleChange}
                    disabled={updating}
                    required
                  />
                </div>

                {/* IS ACTIVE CHECKBOX WITH GREEN TICK */}
                <div className="fee-structure-update-group full-width">
                  <label>Status</label>
                  <div
                    className="fee-structure-checkbox-wrapper"
                    onClick={toggleIsActive}
                    role="checkbox"
                    aria-checked={formData.IsActive}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === " " || e.key === "Enter") {
                        e.preventDefault();
                        toggleIsActive();
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      name="IsActive"
                      checked={formData.IsActive}
                      onChange={handleChange}
                      style={{ display: "none" }}
                    />

                    <div
                      className={`fee-structure-custom-checkbox ${
                        formData.IsActive ? "active" : "inactive"
                      }`}
                    >
                      {formData.IsActive ? (
                        <span className="fee-structure-green-tick">✓</span>
                      ) : null}
                    </div>

                    <span
                      className={`fee-structure-status-text ${
                        formData.IsActive ? "active" : "inactive"
                      }`}
                    >
                      {formData.IsActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className="fee-structure-update-group full-width">
                  <label>Description</label>
                  <textarea
                    name="Description"
                    value={formData.Description}
                    onChange={handleChange}
                    rows="4"
                    disabled={updating}
                    placeholder="Enter description..."
                  />
                </div>
              </div>

              <div className="fee-structure-update-actions">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="fee-edit-cancel-btn"
                  disabled={updating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating || dropdownLoading}
                  className="fee-structure-submit-btn"
                >
                  {updating ? "Updating..." : "Update Fee Structure"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateFeeStructure;
