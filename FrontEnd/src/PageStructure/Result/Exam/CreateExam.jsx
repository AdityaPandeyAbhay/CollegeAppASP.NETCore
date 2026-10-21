// =====================================================
// CREATE EXAM
// =====================================================

import { useState } from "react";

import { createExam } from "../../../Services/resultService";

import "./CreateExam.css";

const CreateExam = () => {
  const [formData, setFormData] = useState({
    ExamName: "",
    Description: "",
    IsActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =====================================================
  // TOGGLE IS ACTIVE (FEE MODULE STYLE)
  // =====================================================

  const toggleIsActive = () => {
    setFormData((prev) => ({
      ...prev,
      IsActive: !prev.IsActive,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.ExamName.trim()) {
      setError("Exam name is required.");
      return;
    }

    try {
      setLoading(true);

      await createExam({
        ExamName: formData.ExamName.trim(),
        Description: formData.Description.trim(),
        IsActive: formData.IsActive,
      });

      setMessage("Exam created successfully.");

      setFormData({
        ExamName: "",
        Description: "",
        IsActive: true,
      });
    } catch (err) {
      setError(err?.message || "Failed to create exam.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="exam-page">
      <div className="exam-card">
        <div className="exam-header">
          <h2>Create Exam</h2>
          <p>Create a new examination</p>
        </div>

        {message && <div className="exam-success">{message}</div>}

        {error && <div className="exam-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="exam-form-group">
            <label>
              Exam Name <span>*</span>
            </label>

            <input
              type="text"
              name="ExamName"
              value={formData.ExamName}
              onChange={handleChange}
              placeholder="Enter exam name"
              maxLength={100}
            />
          </div>

          <div className="exam-form-group">
            <label>Description</label>

            <textarea
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              placeholder="Enter exam description"
              maxLength={500}
              rows="4"
            />
          </div>

          <div className="exam-form-group">
            <label>Is Active</label>

            <div
              className="exam-checkbox-wrapper"
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
                id="exam-is-active"
                name="IsActive"
                checked={formData.IsActive}
                onChange={handleChange}
                style={{ display: "none" }}
              />

              <div
                className={`exam-custom-checkbox ${
                  formData.IsActive ? "active" : "inactive"
                }`}
              >
                {formData.IsActive ? (
                  <span className="exam-green-tick">✓</span>
                ) : null}
              </div>

              <span
                className={`exam-status-text ${
                  formData.IsActive ? "active" : "inactive"
                }`}
              >
                {formData.IsActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>

          <button type="submit" className="exam-btn primary" disabled={loading}>
            {loading ? "Creating..." : "Create Exam"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
