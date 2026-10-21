// =====================================================
// GET ALL EXAM
// =====================================================

import { useEffect, useState } from "react";

import { getAllExams } from "../../../Services/resultService";

import "./GetAllExam.css";

const GetAllExam = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD EXAMS
  // =====================================================

  const loadExams = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getAllExams();

      const data = Array.isArray(response)
        ? response
        : response?.data || response?.Data || [];

      setExams(data);
    } catch (err) {
      setError(err?.message || "Failed to load exams.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleString();
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <div className="all-exam-page">
      <div className="all-exam-card">
        <div className="all-exam-header">
          <div>
            <h2>All Exams</h2>
            <p>View all examinations</p>
          </div>

          <button
            className="all-exam-refresh"
            onClick={loadExams}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && <div className="all-exam-error">{error}</div>}

        {loading ? (
          <div className="all-exam-loading">Loading exams...</div>
        ) : exams.length === 0 ? (
          <div className="all-exam-empty">No exam records found.</div>
        ) : (
          <div className="all-exam-table-wrapper">
            <table className="all-exam-table">
              <thead>
                <tr>
                  
                  <th>Exam Name</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th>Created Date</th>
                </tr>
              </thead>

              <tbody>
                {exams.map((exam, index) => {
                  const examId = exam.id ?? exam.Id;
                  const examName = exam.examName ?? exam.ExamName ?? "";
                  const description =
                    exam.description ?? exam.Description ?? "-";
                  const isActive = exam.isActive ?? exam.IsActive;
                  const createdDate = exam.createdDate ?? exam.CreatedDate;

                  return (
                    <tr key={examId ?? index}>
                     

                      <td>
                        <strong>{examName}</strong>
                      </td>

                      <td>{description || "-"}</td>

                      <td>
                        <span
                          className={
                            isActive
                              ? "exam-status active"
                              : "exam-status inactive"
                          }
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>{formatDate(createdDate)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetAllExam;
