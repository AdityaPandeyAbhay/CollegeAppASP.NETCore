// =====================================================
// GET RESULT BATCH BY ID
// =====================================================

import { useState } from "react";

import {
  getResultBatchById,
} from "../../../Services/resultService";

import "./GetResultBatchById.css";

const GetResultBatchById = () => {

  const [id, setId] = useState("");

  const [batch, setBatch] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setError("");
    setBatch(null);

    if (!id || Number(id) <= 0) {
      setError(
        "Result Batch ID is required."
      );
      return;
    }

    try {

      setLoading(true);

      const data =
        await getResultBatchById(
          Number(id)
        );

      setBatch(data);

    } catch (err) {

      setError(
        err?.message ||
          "Result batch not found."
      );

    } finally {

      setLoading(false);

    }
  };

  // ===================================================
  // CLEAR
  // ===================================================

  const handleClear = () => {
    setId("");
    setBatch(null);
    setError("");
  };

  // ===================================================
  // JSX
  // ===================================================

  return (
    <div className="get-result-batch-page">

      <div className="get-result-batch-card">

        <div className="get-result-batch-header">

          <h2>
            Get Result Batch By ID
          </h2>

          <p>
            Search for a result batch using its ID.
          </p>

        </div>

        {error && (
          <div className="get-result-error">
            {error}
          </div>
        )}

        <form
          className="result-search-form"
          onSubmit={handleSearch}
        >

          <div className="result-search-group">

            <label>
              Result Batch ID
            </label>

            <input
              type="number"
              min="1"
              value={id}
              onChange={(e) =>
                setId(e.target.value)
              }
              placeholder="Enter Result Batch ID"
            />

          </div>

          <div className="result-search-actions">

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Searching..."
                : "Search"}
            </button>

            <button
              type="button"
              className="clear-result-button"
              onClick={handleClear}
            >
              Clear
            </button>

          </div>

        </form>

        {/* ========================================= */}
        {/* RESULT */}
        {/* ========================================= */}

        {batch && (

          <div className="result-batch-details">

            <h3>
              Result Batch Details
            </h3>

            <div className="result-details-grid">

              <div>
                <strong>ID</strong>
                <span>
                  {batch.id ??
                    batch.Id ??
                    "-"}
                </span>
              </div>

              <div>
                <strong>Academic Year</strong>
                <span>
                  {batch.academicYear ??
                    batch.AcademicYear ??
                    "-"}
                </span>
              </div>

              <div>
                <strong>Class</strong>
                <span>
                  {batch.className ??
                    batch.ClassName ??
                    "-"}
                </span>
              </div>

              <div>
                <strong>Section</strong>
                <span>
                  {batch.sectionName ??
                    batch.SectionName ??
                    "-"}
                </span>
              </div>

              <div>
                <strong>Exam</strong>
                <span>
                  {batch.examName ??
                    batch.ExamName ??
                    "-"}
                </span>
              </div>

              <div>
                <strong>Status</strong>
                <span>
                  {(batch.isPublished ??
                    batch.IsPublished)
                    ? "Published"
                    : "Not Published"}
                </span>
              </div>

              <div>
                <strong>Created Date</strong>
                <span>
                  {batch.createdDate ??
                    batch.CreatedDate
                      ? new Date(
                          batch.createdDate ??
                            batch.CreatedDate
                        ).toLocaleString()
                      : "-"}
                </span>
              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
};

export default GetResultBatchById;