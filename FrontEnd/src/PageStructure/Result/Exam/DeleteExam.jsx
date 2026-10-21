// =====================================================
// DELETE EXAM
// =====================================================

import { useState, useEffect } from "react";

import {
  getExamById,
  deleteExam,
  getAllExams,
  getExamDropdown,
} from "../../../Services/resultService";

import "./DeleteExam.css";

const DeleteExam = () => {
  const [id, setId] = useState("");
  const [examOptions, setExamOptions] = useState([]);
  const [loadingExams, setLoadingExams] = useState(false);
  const [exam, setExam] = useState(null);

  const [searching, setSearching] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      setExam(null);
      return;
    }

    await fetchExamDetails(selectedId);
  };

  const fetchExamDetails = async (examId) => {
    try {
      setSearching(true);
      setError("");

      const response = await getExamById(Number(examId));

      const data = response?.data || response?.Data || response;

      if (!data) {
        setError("Exam not found.");
        return;
      }

      setExam(data);
    } catch (err) {
      setError(err?.message || "Exam not found.");
    } finally {
      setSearching(false);
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
  // DELETE
  // =====================================================

  const handleDelete = async () => {
    const examId = exam?.id ?? exam?.Id;
    const examName = exam?.examName ?? exam?.ExamName ?? "this exam";

    if (!examId) {
      setError("Please select an exam first.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete "${examName}" (ID: ${examId})?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);

      setMessage("");
      setError("");

      await deleteExam(Number(examId));

      setMessage(`Exam "${examName}" deleted successfully.`);

      setExam(null);
      setId("");

      // Refresh exam list so deleted exam is removed from dropdown
      await loadExamOptions();
    } catch (err) {
      setError(err?.message || "Failed to delete exam.");
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="delete-exam-page">
      <div className="delete-exam-card">
        <div className="delete-exam-header">
          <h2>Delete Exam</h2>

          <p>Select an exam from the dropdown to review and delete it</p>
        </div>

        <form className="delete-exam-search" onSubmit={handleSearch}>
          <div>
            <label htmlFor="delete-exam-select">Select Exam</label>

            <select
              id="delete-exam-select"
              value={id}
              onChange={handleExamSelect}
              disabled={loadingExams || searching || deleting}
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

          <button type="submit" disabled={searching || loadingExams || !id}>
            {searching ? "Loading..." : "Search"}
          </button>
        </form>

        {message && <div className="delete-exam-success">{message}</div>}

        {error && <div className="delete-exam-error">{error}</div>}

        {exam && (
          <div className="delete-exam-result">
            <h3>Exam Details</h3>

            <div className="delete-exam-details">
              <div>
                <span>Exam ID</span>
                <strong>{exam.id ?? exam.Id}</strong>
              </div>

              <div>
                <span>Exam Name</span>
                <strong>{exam.examName ?? exam.ExamName}</strong>
              </div>

              <div>
                <span>Description</span>
                <strong>{exam.description ?? exam.Description ?? "-"}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong
                  style={{
                    color:
                      (exam.isActive ?? exam.IsActive) ? "#16a34a" : "#dc2626",
                  }}
                >
                  {(exam.isActive ?? exam.IsActive) ? "Active" : "Inactive"}
                </strong>
              </div>
            </div>

            <button
              className="delete-exam-button"
              onClick={handleDelete}
              disabled={deleting}
              
              
            >
              {deleting ? "Deleting..." : "Delete Exam"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteExam;

