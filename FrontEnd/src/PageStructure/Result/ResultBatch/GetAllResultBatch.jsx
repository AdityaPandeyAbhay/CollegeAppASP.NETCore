// =====================================================
// GET ALL RESULT BATCH
// =====================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAllResultBatches } from "../../../Services/resultService";
import { isOfficeEmployeeRole } from "../../../Utils/auth";

import "./GetAllResultBatch.css";

const GetAllResultBatch = () => {
  const navigate = useNavigate();

  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ===================================================
  // LOAD
  // ===================================================

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllResultBatches();

      setBatches(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.message || "Failed to load result batches.");
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // REDIRECT TO PUBLISH PAGE (DO NOT PUBLISH DIRECTLY)
  // ===================================================

  const handleGoToPublish = (batch) => {
    navigate("/result-batch/publish", {
      state: {
        batchId: batch.id ?? batch.Id,
        examId: batch.examId ?? batch.ExamId,
        batchData: batch,
      },
    });
  };

  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatDate = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString();
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loading) {
    return (
      <div className="result-batch-list-page">
        <div className="result-batch-loading">Loading result batches...</div>
      </div>
    );
  }

  // ===================================================
  // JSX
  // ===================================================

  return (
    <div className="result-batch-list-page">
      <div className="result-batch-list-card">
        <div className="result-batch-list-header">
          <div>
            <h2>Result Batches</h2>
            <p>View all created result batches and manage their publication.</p>
          </div>

          <button className="result-refresh-button" onClick={loadBatches}>
            Refresh
          </button>
        </div>

        {error && <div className="result-list-error">{error}</div>}

        {success && <div className="result-list-success">{success}</div>}

        {batches.length === 0 ? (
          <div className="result-empty">No result batches found.</div>
        ) : (
          <div className="result-table-wrapper">
            <table className="result-batch-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Academic Year</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Exam</th>
                  <th>Status</th>
                  <th>Created Date</th>
                  {!isOfficeEmployeeRole() && <th>Action</th>}
                </tr>
              </thead>

              <tbody>
                {batches.map((batch, index) => {
                  const isPublished = Boolean(
                    batch.isPublished ?? batch.IsPublished,
                  );

                  return (
                    <tr key={batch.id ?? batch.Id ?? index}>
                      <td>{index + 1}</td>

                      <td>{batch.academicYear ?? batch.AcademicYear ?? "-"}</td>

                      <td>{batch.className ?? batch.ClassName ?? "-"}</td>

                      <td>{batch.sectionName ?? batch.SectionName ?? "-"}</td>

                      <td>{batch.examName ?? batch.ExamName ?? "-"}</td>

                      <td>
                        {isPublished ? (
                          <span className="result-status published">
                            Published
                          </span>
                        ) : (
                          <span className="result-status pending">
                            Not Published
                          </span>
                        )}
                      </td>

                      <td>
                        {formatDate(batch.createdDate ?? batch.CreatedDate)}
                      </td>

                      {!isOfficeEmployeeRole() && (
                        <td>
                          {isPublished ? (
                            <span className="already-published">Published</span>
                          ) : (
                            <button
                              className="publish-button"
                              onClick={() => handleGoToPublish(batch)}
                            >
                              Publish
                            </button>
                          )}
                        </td>
                      )}
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

export default GetAllResultBatch;
