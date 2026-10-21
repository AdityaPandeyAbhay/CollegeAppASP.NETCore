// =====================================================
// UPDATE ACADEMIC YEAR PAGE
// =====================================================

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  getAllAcademicYear,
  updateAcademicYear,
} from "../../Services/academicYearService";
import "./UpdateAcademicYear.css";

const UpdateAcademicYear = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // ===================================================
  // STATE
  // ===================================================

  const [academicYears, setAcademicYears] = useState([]);
  const [loadingDropdown, setLoadingDropdown] = useState(true);
  const [selectedId, setSelectedId] = useState("");

  const [formData, setFormData] = useState({
    yearName: "",
    startDate: "",
    endDate: "",
    isCurrent: false,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  // Helper to format ISO date to YYYY-MM-DD for date inputs
  const toInputDate = (dateString) => {
    if (!dateString) return "";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().split("T")[0];
    } catch (_) {
      return "";
    }
  };

  // ===================================================
  // LOAD DROPDOWN
  // ===================================================

  const loadAcademicYears = async (preserveSelectedId = null) => {
    try {
      setLoadingDropdown(true);
      const data = await getAllAcademicYear();
      const list = Array.isArray(data) ? data : [];
      setAcademicYears(list);

      // Check if arriving from location state or preserving selection
      const targetId =
        preserveSelectedId ??
        location.state?.academicYearId ??
        (location.state?.yearName
          ? list.find(
              (y) =>
                (y.yearName ?? y.YearName)?.toLowerCase() ===
                location.state.yearName?.toLowerCase(),
            )?.id
          : null);

      if (targetId) {
        populateFormById(targetId, list);
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

  // Populate form with selected year data
  const populateFormById = (id, list = academicYears) => {
    setSelectedId(String(id));
    const selected = list.find((y) => String(y.id ?? y.Id) === String(id));

    if (selected) {
      setFormData({
        yearName: selected.yearName ?? selected.YearName ?? "",
        startDate: toInputDate(selected.startDate ?? selected.StartDate),
        endDate: toInputDate(selected.endDate ?? selected.EndDate),
        isCurrent: Boolean(selected.isCurrent ?? selected.IsCurrent),
        isActive: Boolean(selected.isActive ?? selected.IsActive),
      });
      setMessage("");
    } else {
      setFormData({
        yearName: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        isActive: true,
      });
    }
  };

  const handleSelectChange = (e) => {
    const id = e.target.value;
    setSelectedId(id);
    if (!id) {
      setFormData({
        yearName: "",
        startDate: "",
        endDate: "",
        isCurrent: false,
        isActive: true,
      });
      return;
    }
    populateFormById(id);
  };

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
  // SUBMIT UPDATE
  // ===================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!selectedId) {
      showMessage("error", "Please select an Academic Year to update.");
      return;
    }

    if (!formData.yearName.trim()) {
      showMessage("error", "Academic Year Name is required.");
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

      await updateAcademicYear(selectedId, {
        Id: Number(selectedId),
        YearName: formData.yearName.trim(),
        StartDate: new Date(formData.startDate).toISOString(),
        EndDate: new Date(formData.endDate).toISOString(),
        IsCurrent: Boolean(formData.isCurrent),
        IsActive: Boolean(formData.isActive),
      });

      showMessage("success", "Academic Year updated successfully.");
      await loadAcademicYears(selectedId);
    } catch (error) {
      showMessage(
        "error",
        error.message || "Failed to update academic year. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="academic-year-page">
      {/* POPUP MODAL */}
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
        {/* HEADER */}
        <div className="academic-year-header">
          <div>
            <h1>Update Academic Year</h1>
            <p>
              Select an academic year to modify its name, dates, or active
              status.
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

        {/* SELECTOR */}
        <div className="academic-year-select-section">
          <div className="academic-year-form-group">
            <label htmlFor="academicYearSelect">
              Select Academic Year to Update <span>*</span>
            </label>
            <select
              id="academicYearSelect"
              value={selectedId}
              onChange={handleSelectChange}
              disabled={loadingDropdown || loading}
            >
              <option value="">-- Select Academic Year from Dropdown --</option>
              {academicYears.map((item) => {
                const id = item.id ?? item.Id;
                const name = item.yearName ?? item.YearName ?? "";
                const isCurr = item.isCurrent ?? item.IsCurrent;
                const isAct = item.isActive ?? item.IsActive;

                return (
                  <option key={id} value={id}>
                    {name} {isCurr ? "★ (Current)" : ""}{" "}
                    {!isAct ? "[Inactive]" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* EDIT FORM */}
        {selectedId ? (
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
                        ? "Currently active for general transactions and operations."
                        : "Not set as current academic year."}
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
                        ? "Active and available across the application."
                        : "Archived/disabled from active selection."}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="academic-year-form-actions">
              <button
                type="submit"
                className="academic-year-btn academic-year-btn-primary"
                disabled={loading}
              >
                {loading ? "Updating..." : "Save Changes"}
              </button>

              <button
                type="button"
                className="academic-year-btn academic-year-btn-secondary"
                onClick={() => populateFormById(selectedId)}
                disabled={loading}
              >
                Reset Values
              </button>
            </div>
          </form>
        ) : (
          <div className="academic-year-select-prompt">
            <p>
              Please select an academic year from the dropdown above to load its
              details.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateAcademicYear;
