// =====================================================
// CREATE FEE STRUCTURE
// =====================================================

import { useEffect, useState } from "react";

import { createFeeStructure } from "../../Services/feeStructureService";

import { getAcademicYearDropdown } from "../../Services/academicYearService";

import { getDepartmentDropdown } from "../../Services/departmentService";

import { getClassDropdown } from "../../Services/classService";

import { getFeeCategoryDropdown } from "../../Services/feeCategoryService";
import FeePopupModal from "./FeePopupModal";

import "./CreateFeeStructure.css";

const CreateFeeStructure = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [feeCategories, setFeeCategories] = useState([]);

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

  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Popup Modal State for success or failure feedback
  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    setDropdownLoading(true);
    setError("");

    try {
      const [academicYearData, departmentData, classData, feeCategoryData] =
        await Promise.all([
          getAcademicYearDropdown(),
          getDepartmentDropdown(),
          getClassDropdown(),
          getFeeCategoryDropdown(),
        ]);

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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "DepartmentId" ? { ClassId: "" } : {}),
    }));
  };

  const toggleIsActive = () => {
    setFormData((prev) => ({
      ...prev,
      IsActive: !prev.IsActive,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setLoading(true);

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

      await createFeeStructure(payload);

      setMessage("Fee Structure created successfully.");
      setPopup({
        show: true,
        type: "success",
        title: "Created Successfully!",
        message: "Fee Structure has been created successfully.",
      });

      setFormData({
        AcademicYearId: "",
        DepartmentId: "",
        ClassId: "",
        FeeCategoryId: "",
        Amount: "",
        DueDate: "",
        Description: "",
        IsActive: true,
      });
    } catch (err) {
      const errMsg = err.message || "Failed to create Fee Structure.";
      setError(errMsg);
      setPopup({
        show: true,
        type: "error",
        title: "Creation Failed",
        message: errMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      AcademicYearId: "",
      DepartmentId: "",
      ClassId: "",
      FeeCategoryId: "",
      Amount: "",
      DueDate: "",
      Description: "",
      IsActive: true,
    });

    setMessage("");
    setError("");
  };

  return (
    <div className="fee-structure-create-container">
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

      <div className="fee-structure-create-card">
        <div className="fee-structure-create-header">
          <h2>Create Fee Structure</h2>
          <p>Add a new fee structure for a class.</p>
        </div>

        {dropdownLoading && (
          <div className="fee-structure-loading">Loading dropdown data...</div>
        )}

        {message && <div className="fee-structure-success">{message}</div>}

        {error && <div className="fee-structure-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="fee-structure-form-grid">
            <div className="fee-structure-form-group">
              <label>Academic Year *</label>

              <select
                name="AcademicYearId"
                value={formData.AcademicYearId}
                onChange={handleChange}
                disabled={dropdownLoading || loading}
                required
              >
                <option value="">Select Academic Year</option>

                {academicYears.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ?? item.Text ?? item.name ?? item.Name}
                  </option>
                ))}
              </select>
            </div>

            <div className="fee-structure-form-group">
              <label>Department *</label>

              <select
                name="DepartmentId"
                value={formData.DepartmentId}
                onChange={handleChange}
                disabled={dropdownLoading || loading}
                required
              >
                <option value="">Select Department</option>

                {departments.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ??
                      item.Text ??
                      item.name ??
                      item.Name ??
                      item.DepartmentName}
                  </option>
                ))}
              </select>
            </div>

            <div className="fee-structure-form-group">
              <label>Class *</label>

              <select
                name="ClassId"
                value={formData.ClassId}
                onChange={handleChange}
                disabled={dropdownLoading || loading || !formData.DepartmentId}
                required
              >
                <option value="">
                  {formData.DepartmentId
                    ? classes.filter(
                        (c) =>
                          String(c.departmentId ?? c.DepartmentId) ===
                          String(formData.DepartmentId),
                      ).length === 0
                      ? "No classes found for this department"
                      : "Select Class"
                    : "-- Select Department First --"}
                </option>

                {classes
                  .filter(
                    (item) =>
                      String(item.departmentId ?? item.DepartmentId) ===
                      String(formData.DepartmentId),
                  )
                  .map((item) => (
                    <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                      {item.text ??
                        item.Text ??
                        item.name ??
                        item.Name ??
                        item.ClassName}
                    </option>
                  ))}
              </select>
            </div>

            <div className="fee-structure-form-group">
              <label>Fee Category *</label>

              <select
                name="FeeCategoryId"
                value={formData.FeeCategoryId}
                onChange={handleChange}
                disabled={dropdownLoading || loading}
                required
              >
                <option value="">Select Fee Category</option>

                {feeCategories.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ??
                      item.Text ??
                      item.name ??
                      item.Name ??
                      item.CategoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="fee-structure-form-group">
              <label>Amount *</label>

              <input
                type="number"
                name="Amount"
                value={formData.Amount}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                placeholder="Enter amount"
                disabled={loading}
                required
              />
            </div>

            <div className="fee-structure-form-group">
              <label>Due Date *</label>

              <input
                type="date"
                name="DueDate"
                value={formData.DueDate}
                onChange={handleChange}
                disabled={loading}
                required
              />
            </div>

            <div className="fee-structure-form-group full-width">
              <label>Is Active</label>

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
                  id="fee-structure-is-active"
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

            <div className="fee-structure-form-group full-width">
              <label>Description</label>

              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                placeholder="Enter description"
                rows="4"
                disabled={loading}
              />
            </div>
          </div>

          <div className="fee-structure-form-actions">
            <button
              type="button"
              className="fee-structure-reset-btn"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>

            <button
              type="submit"
              className="fee-structure-submit-btn"
              disabled={loading || dropdownLoading}
            >
              {loading ? "Creating..." : "Create Fee Structure"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFeeStructure;
