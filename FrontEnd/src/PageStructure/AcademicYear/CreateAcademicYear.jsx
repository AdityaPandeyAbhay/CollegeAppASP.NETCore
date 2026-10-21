// =====================================================
// CREATE ACADEMIC YEAR PAGE
// =====================================================

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAcademicYear } from "../../Services/academicYearService";
import "./CreateAcademicYear.css";

const CreateAcademicYear = () => {
  const navigate = useNavigate();

  // ===================================================
  // FORM STATE
  // ===================================================

  const [formData, setFormData] = useState({
    yearName: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    isActive: true,
  });

  // ===================================================
  // UI STATE
  // ===================================================

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  // ===================================================
  // HANDLE INPUT CHANGES
  // ===================================================

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleIsCurrent = () => {
    setFormData((prev) => ({
      ...prev,
      isCurrent: !prev.isCurrent,
    }));
  };

  const toggleIsActive = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  // ===================================================
  // SHOW MESSAGE
  // ===================================================

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
  // SUBMIT
  // ===================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    // Validations
    if (!formData.yearName.trim()) {
      showMessage("error", "Academic Year Name is required (e.g., 2025-2026).");
      return;
    }

    if (!formData.startDate) {
      showMessage("error", "Start Date is required.");
      return;
    }

    if (!formData.endDate) {
      showMessage("error", "End Date is required.");
      return;
    }

    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      showMessage("error", "Start Date must be earlier than End Date.");
      return;
    }

    try {
      setLoading(true);

      await createAcademicYear({
        YearName: formData.yearName.trim(),
        StartDate: new Date(formData.startDate).toISOString(),
        EndDate: new Date(formData.endDate).toISOString(),
        IsCurrent: Boolean(formData.isCurrent),
        IsActive: Boolean(formData.isActive),
      });

      showMessage("success", "Academic Year created successfully.");

      // Reset form
      setFormData({
        yearName: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        isActive: true,
      });
    } catch (error) {
      showMessage(
        "error",
        error.message || "Failed to create academic year. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // RESET
  // ===================================================

  const handleReset = () => {
    setFormData({
      yearName: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
      isActive: true,
    });
    setMessage("");
    setMessageType("");
  };

  return (
    <div className="academic-year-page">
      {/* =================================================
          POPUP MODAL / TOAST
      ================================================= */}

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

      <div className="academic-year-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="academic-year-header">
          <div>
            <h1>Create Academic Year</h1>
            <p>
              Define a new academic calendar period with start and end dates.
            </p>
          </div>
          <button
            type="button"
            className="academic-year-btn academic-year-btn-secondary"
            onClick={() => navigate("/academic-year/all")}
          >
            View All Years
          </button>
        </div>

        {/* =================================================
            FORM
        ================================================= */}

        <form className="academic-year-form" onSubmit={handleSubmit}>
          {/* Year Name */}
          <div className="academic-year-form-group">
            <label htmlFor="yearName">
              Academic Year Name <span>*</span>
            </label>
            <input
              id="yearName"
              type="text"
              name="yearName"
              value={formData.yearName}
              onChange={handleChange}
              maxLength={20}
              placeholder="e.g. 2025-2026"
              required
            />
            <small className="academic-year-hint">
              Typically formatted as YYYY-YYYY (e.g., 2025-2026).
            </small>
          </div>

          <div className="academic-year-form-row">
            {/* Start Date */}
            <div className="academic-year-form-group">
              <label htmlFor="startDate">
                Start Date <span>*</span>
              </label>
              <input
                id="startDate"
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            {/* End Date */}
            <div className="academic-year-form-group">
              <label htmlFor="endDate">
                End Date <span>*</span>
              </label>
              <input
                id="endDate"
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="academic-year-form-row">
            {/* Is Current Checkbox */}
            <div className="academic-year-form-group">
              <label>Current Academic Year</label>
              <div
                className="academic-year-checkbox-card"
                onClick={toggleIsCurrent}
                role="checkbox"
                aria-checked={formData.isCurrent}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    toggleIsCurrent();
                  }
                }}
              >
                <div
                  className={`academic-year-custom-checkbox ${
                    formData.isCurrent ? "checked" : ""
                  }`}
                >
                  {formData.isCurrent ? "✓" : ""}
                </div>
                <div>
                  <div className="academic-year-checkbox-title">
                    Mark as Current Academic Year
                  </div>
                  <div className="academic-year-checkbox-subtitle">
                    {formData.isCurrent
                      ? "This year will be active for current ongoing operations."
                      : "Not designated as the currently active year."}
                  </div>
                </div>
              </div>
            </div>

            {/* Is Active Checkbox */}
            <div className="academic-year-form-group">
              <label>Status</label>
              <div
                className="academic-year-checkbox-card"
                onClick={toggleIsActive}
                role="checkbox"
                aria-checked={formData.isActive}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === " " || e.key === "Enter") {
                    e.preventDefault();
                    toggleIsActive();
                  }
                }}
              >
                <div
                  className={`academic-year-custom-checkbox ${
                    formData.isActive ? "checked" : ""
                  }`}
                >
                  {formData.isActive ? "✓" : ""}
                </div>
                <div>
                  <div className="academic-year-checkbox-title">
                    {formData.isActive ? "Active" : "Inactive"}
                  </div>
                  <div className="academic-year-checkbox-subtitle">
                    {formData.isActive
                      ? "Available for selection in batch and course assignments."
                      : "Disabled and archived from active selections."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* =================================================
              ACTION BUTTONS
          ================================================= */}

          <div className="academic-year-form-actions">
            <button
              type="submit"
              className="academic-year-btn academic-year-btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Academic Year"}
            </button>

            <button
              type="button"
              className="academic-year-btn academic-year-btn-secondary"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateAcademicYear;
