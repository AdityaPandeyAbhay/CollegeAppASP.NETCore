// =====================================================
// UPDATE EXAM
// =====================================================

import { useState, useEffect } from "react";

import {
  getExamById,
  updateExam,
  getAllExams,
  getExamDropdown,
} from "../../../Services/resultService";

import "./UpdateExam.css";

const UpdateExam = () => {
  const [id, setId] = useState("");
  const [examOptions, setExamOptions] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);

  const [formData, setFormData] = useState({
    Id: "",
    ExamName: "",
    Description: "",
    IsActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD EXAM OPTIONS
  // =====================================================

  useEffect(() => {
    loadExamOptions();
  }, []);

  const loadExamOptions = async () => {
    try {
      setLoadingExams(true);
      let data = [];
      try {
        data = await getAllExams();
      } catch (err) {
        console.warn("getAllExams failed, fallback to getExamDropdown:", err);
        data = await getExamDropdown();
      }

      const list = Array.isArray(data) ? data : [];
      setExamOptions(list);
    } catch (err) {
      console.warn("Failed to load exam options:", err);
      setExamOptions([]);
    } finally {
      setLoadingExams(false);
    }
  };

  // =====================================================
  // SELECT EXAM FROM DROPDOWN
  // =====================================================

  const handleExamSelect = async (e) => {
    const selectedId = e.target.value;
    setId(selectedId);
    setMessage("");
    setError("");

    if (!selectedId) {
      setFormData({
        Id: "",
        ExamName: "",
        Description: "",
        IsActive: true,
      });
      return;
    }

    await fetchExamDetails(selectedId);
  };

  const fetchExamDetails = async (examId) => {
    try {
      setLoading(true);
      setError("");

      const response = await getExamById(Number(examId));

      const exam = response?.data || response?.Data || response;

      if (!exam) {
        setError("Exam not found.");
        return;
      }

      setFormData({
        Id: exam.id ?? exam.Id,
        ExamName: exam.examName ?? exam.ExamName ?? "",
        Description: exam.description ?? exam.Description ?? "",
        IsActive: exam.isActive ?? exam.IsActive ?? true,
      });
    } catch (err) {
      setError(err?.message || "Exam not found.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SEARCH / REFRESH
  // =====================================================

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    setMessage("");
    setError("");

    if (!id) {
      setError("Please select an exam from the dropdown.");
      return;
    }

    await fetchExamDetails(id);
  };

  // =====================================================
  // HANDLE FORM
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleIsActive = () => {
    setFormData((prev) => ({
      ...prev,
      IsActive: !prev.IsActive,
    }));
  };

  // =====================================================
  // UPDATE
  // =====================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.Id) {
      setError("Please select an exam first.");
      return;
    }

    if (!formData.ExamName.trim()) {
      setError("Exam name is required.");
      return;
    }

    try {
      setSaving(true);

      await updateExam(Number(formData.Id), {
        Id: Number(formData.Id),
        ExamName: formData.ExamName.trim(),
        Description: formData.Description.trim(),
        IsActive: formData.IsActive,
      });

      setMessage("Exam updated successfully.");

      // Refresh exam list so dropdown reflects any name change
      await loadExamOptions();
    } catch (err) {
      setError(err?.message || "Failed to update exam.");
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="update-exam-page">
      <div className="update-exam-card">
        <div className="update-exam-header">
          <h2>Update Exam</h2>

          <p>Select an exam from the dropdown and update its information</p>
        </div>

        <form className="update-exam-search" onSubmit={handleSearch}>
          <div>
            <label htmlFor="update-exam-select">Select Exam</label>

            <select
              id="update-exam-select"
              value={id}
              onChange={handleExamSelect}
              disabled={loadingExams || loading || saving}
            >
              <option value="">
                {loadingExams
                  ? "Loading exams..."
                  : examOptions.length === 0
                    ? "No exams available"
                    : "-- Select Exam from Dropdown --"}
              </option>

              {examOptions.map((item) => {
                const examId = item.id ?? item.Id;
                const examName =
                  item.examName ??
                  item.ExamName ??
                  item.text ??
                  item.Text ??
                  `Exam #${examId}`;
                const isActive = Boolean(
                  item.isActive ?? item.IsActive ?? true,
                );

                return (
                  <option key={examId} value={examId}>
                    {examName} 
                    {isActive === false ? " - Inactive" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <button type="submit" disabled={loading || loadingExams || !id}>
            {loading ? "Loading..." : "Search"}
          </button>
        </form>

        {message && <div className="update-exam-success">{message}</div>}

        {error && <div className="update-exam-error">{error}</div>}

        {formData.Id && (
          <form className="update-exam-form" onSubmit={handleUpdate}>
            <div className="update-exam-form-group">
              <label>
                Exam Name <span>*</span>
              </label>

              <input
                type="text"
                name="ExamName"
                value={formData.ExamName}
                onChange={handleChange}
                maxLength={100}
                placeholder="Enter exam name"
              />
            </div>

            <div className="update-exam-form-group">
              <label>Description</label>

              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                maxLength={500}
                rows="4"
                placeholder="Enter exam description"
              />
            </div>

            <div className="update-exam-form-group">
              <label className="update-exam-label">Status</label>
              <div
                className={`update-exam-checkbox-wrapper ${formData.IsActive ? "checked" : ""}`}
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
                  id="updateIsActive"
                  name="IsActive"
                  checked={formData.IsActive}
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
                <div
                  className={`update-exam-custom-checkbox ${formData.IsActive ? "active" : ""}`}
                >
                  {formData.IsActive && <span>✓</span>}
                </div>
                <span
                  className={`update-exam-status-text ${formData.IsActive ? "active" : "inactive"}`}
                >
                  {formData.IsActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="update-exam-save"
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Exam"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateExam;
