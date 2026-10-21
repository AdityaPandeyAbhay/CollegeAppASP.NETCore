// =====================================================
// PUBLISH RESULT BATCH
// =====================================================

import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  getExamDropdown,
  getAllResultBatches,
  getResultBatchById,
  publishResultBatch,
} from "../../../Services/resultService";

import "./PublishResultBatch.css";

const PublishResultBatch = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [resultBatches, setResultBatches] = useState([]);

  const [selectedExamId, setSelectedExamId] = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState("");

  const [batch, setBatch] = useState(null);

  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);
  const [loadingBatch, setLoadingBatch] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD EXAMS
  // =====================================================

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoadingExams(true);
      setError("");

      const response = await getExamDropdown();
      const data = response?.data || response?.Data || response || [];
      setExams(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load exams.");
    } finally {
      setLoadingExams(false);
    }
  };

  // =====================================================
  // HANDLE ROUTE STATE (REDIRECTED FROM ALL OR UPDATE PAGE)
  // =====================================================

  useEffect(() => {
    if (location.state?.batchId) {
      const bId = String(location.state.batchId);
      const eId = location.state.examId ? String(location.state.examId) : "";

      if (eId) {
        setSelectedExamId(eId);
        loadBatchesForExam(eId, bId);
      } else {
        setSelectedBatchId(bId);
        fetchBatchDetails(bId);
      }
    }
  }, [location.state]);

  const loadBatchesForExam = async (examId, autoSelectBatchId = "") => {
    try {
      setLoadingBatches(true);
      setError("");

      const allBatches = await getAllResultBatches();
      const list = Array.isArray(allBatches) ? allBatches : [];

      // Filter for this exam; include unpublished batches or the currently selected batch
      const filtered = list.filter((item) => {
        const itemExamId = String(item.examId ?? item.ExamId);
        const isTarget =
          autoSelectBatchId &&
          String(item.id ?? item.Id) === String(autoSelectBatchId);
        const isPub = Boolean(item.isPublished ?? item.IsPublished);
        return itemExamId === String(examId) && (!isPub || isTarget);
      });

      setResultBatches(filtered);

      if (autoSelectBatchId) {
        setSelectedBatchId(String(autoSelectBatchId));
        await fetchBatchDetails(autoSelectBatchId);
      }
    } catch (err) {
      setError(err.message || "Failed to load result batches.");
    } finally {
      setLoadingBatches(false);
    }
  };

  const fetchBatchDetails = async (batchId) => {
    try {
      setLoadingBatch(true);
      setError("");

      const response = await getResultBatchById(Number(batchId));
      const data = response?.data || response?.Data || response;
      setBatch(data);
    } catch (err) {
      setError(err.message || "Failed to load result batch details.");
    } finally {
      setLoadingBatch(false);
    }
  };

  // =====================================================
  // EXAM CHANGE
  // =====================================================

  const handleExamChange = async (e) => {
    const examId = e.target.value;

    setSelectedExamId(examId);
    setSelectedBatchId("");
    setResultBatches([]);
    setBatch(null);
    setMessage("");
    setError("");

    if (!examId) return;

    await loadBatchesForExam(examId);
  };

  // =====================================================
  // RESULT BATCH CHANGE
  // =====================================================

  const handleBatchChange = async (e) => {
    const batchId = e.target.value;

    setSelectedBatchId(batchId);
    setBatch(null);
    setMessage("");
    setError("");

    if (!batchId) return;

    await fetchBatchDetails(batchId);
  };

  // =====================================================
  // INITIATE PUBLISH
  // =====================================================

  const handleInitiatePublish = () => {
    setMessage("");
    setError("");

    if (!selectedBatchId) {
      setError("Please select a result batch.");
      return;
    }

    if (!batch) {
      setError("Result batch information not found.");
      return;
    }

    if (batch.isPublished || batch.IsPublished) {
      setError("This result batch is already published.");
      return;
    }

    setShowConfirmModal(true);
  };

  // =====================================================
  // CONFIRM & EXECUTE PUBLISH
  // =====================================================

  const handleConfirmPublish = async () => {
    setShowConfirmModal(false);

    try {
      setPublishing(true);
      setError("");
      setMessage("");

      await publishResultBatch(Number(selectedBatchId));

      setBatch((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          isPublished: true,
          IsPublished: true,
        };
      });

      setPopup({
        isOpen: true,
        type: "success",
        title: "Published Successfully",
        message:
          "Result batch published successfully. Students can now view their examination results.",
      });
    } catch (err) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Publication Failed",
        message: err.message || "Failed to publish result batch.",
      });
    } finally {
      setPublishing(false);
    }
  };

  const handleClosePopupAndRedirect = () => {
    setPopup({ ...popup, isOpen: false });
    if (popup.type === "success") {
      navigate("/result-batch/all");
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setSelectedExamId("");
    setSelectedBatchId("");
    setResultBatches([]);
    setBatch(null);
    setMessage("");
    setError("");
  };

  // =====================================================
  // HELPER
  // =====================================================

  const getValue = (lower, upper) => {
    return batch?.[lower] ?? batch?.[upper];
  };

  const isPublished = batch?.isPublished ?? batch?.IsPublished ?? false;

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="publish-result-container">
      <div className="publish-result-card">
        {/* =================================================
            HEADER
            ================================================= */}

        <div className="publish-result-header">
          <h2>Publish Result Batch</h2>

          <p>
            Select an exam and unpublished result batch to review details and
            publish the results.
          </p>
        </div>

        {/* =================================================
            MESSAGE
            ================================================= */}

        {message && <div className="publish-result-success">{message}</div>}

        {error && <div className="publish-result-error">{error}</div>}

        {/* =================================================
            FORM (NO IDs SHOWN)
            ================================================= */}

        <div className="publish-result-form">
          {/* EXAM */}
          <div className="publish-result-field">
            <label>
              Exam <span>*</span>
            </label>

            <select
              value={selectedExamId}
              onChange={handleExamChange}
              disabled={loadingExams || loadingBatches || publishing}
            >
              <option value="">
                {loadingExams ? "Loading Exams..." : "-- Select Exam --"}
              </option>

              {exams.map((exam) => (
                <option key={exam.id ?? exam.Id} value={exam.id ?? exam.Id}>
                  {exam.text ?? exam.Text ?? exam.examName ?? exam.ExamName}
                </option>
              ))}
            </select>
          </div>

          {/* RESULT BATCH */}
          <div className="publish-result-field">
            <label>
              Result Batch <span>*</span>
            </label>

            <select
              value={selectedBatchId}
              onChange={handleBatchChange}
              disabled={!selectedExamId || loadingBatches || publishing}
            >
              <option value="">
                {!selectedExamId
                  ? "-- Select Exam First --"
                  : loadingBatches
                    ? "Loading Result Batches..."
                    : resultBatches.length === 0
                      ? "-- No Unpublished Batches Found --"
                      : "-- Select Result Batch --"}
              </option>

              {resultBatches.map((item) => {
                const year =
                  item.academicYear ?? item.AcademicYear ?? "Academic Year";
                const cls = item.className ?? item.ClassName ?? "Class";
                const sec = item.sectionName ?? item.SectionName ?? "Section";
                const isPub = Boolean(item.isPublished ?? item.IsPublished);

                return (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {year} - {cls} - {sec}
                    {isPub ? " (Already Published)" : ""}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* =================================================
            LOADING
            ================================================= */}

        {loadingBatch && (
          <div className="publish-result-loading">
            Loading result batch details...
          </div>
        )}

        {/* =================================================
            BATCH DETAILS (STRICTLY NO IDs SHOWN)
            ================================================= */}

        {batch && !loadingBatch && (
          <div className="publish-result-details">
            <div className="publish-result-details-header">
              <h3>Result Batch Details</h3>
            </div>

            <div className="publish-result-details-grid">
              <div className="publish-result-detail-item">
                <span>Academic Year</span>
                <strong>
                  {getValue("academicYear", "AcademicYear") || "-"}
                </strong>
              </div>

              <div className="publish-result-detail-item">
                <span>Class</span>
                <strong>{getValue("className", "ClassName") || "-"}</strong>
              </div>

              <div className="publish-result-detail-item">
                <span>Section</span>
                <strong>{getValue("sectionName", "SectionName") || "-"}</strong>
              </div>

              <div className="publish-result-detail-item">
                <span>Exam</span>
                <strong>{getValue("examName", "ExamName") || "-"}</strong>
              </div>

              <div className="publish-result-detail-item">
                <span>Status</span>
                <strong
                  className={
                    isPublished ? "published-status" : "unpublished-status"
                  }
                >
                  {isPublished ? "Published" : "Not Published"}
                </strong>
              </div>

              <div className="publish-result-detail-item">
                <span>Created Date</span>
                <strong>
                  {getValue("createdDate", "CreatedDate")
                    ? new Date(
                        getValue("createdDate", "CreatedDate"),
                      ).toLocaleDateString()
                    : "-"}
                </strong>
              </div>
            </div>
          </div>
        )}

        {/* =================================================
            ACTIONS
            ================================================= */}

        {batch && !loadingBatch && (
          <div className="publish-result-actions">
            <button
              type="button"
              className="publish-result-reset-btn"
              onClick={handleReset}
              disabled={publishing}
            >
              Reset
            </button>

            <button
              type="button"
              className="publish-result-btn"
              onClick={handleInitiatePublish}
              disabled={publishing || isPublished}
            >
              {publishing
                ? "Publishing..."
                : isPublished
                  ? "Already Published"
                  : "Publish Result"}
            </button>
          </div>
        )}
      </div>

      {/* =================================================
          CONFIRMATION POPUP MODAL
          ================================================= */}

      {showConfirmModal && (
        <div className="result-modal-overlay">
          <div className="result-modal-card warning">
            <div className="result-modal-icon warning">⚠</div>

            <h3>Confirm Publication</h3>

            <p>
              Are you sure you want to publish the results for{" "}
              <strong>{getValue("examName", "ExamName")}</strong> (
              {getValue("className", "ClassName")} -{" "}
              {getValue("sectionName", "SectionName")})?
              <br />
              Once published, all students in this batch will be able to view
              their results.
            </p>

            <div className="result-modal-actions">
              <button
                type="button"
                className="result-modal-btn cancel"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="result-modal-btn confirm"
                onClick={handleConfirmPublish}
              >
                Yes, Publish Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================
          RESULT POPUP MODAL
          ================================================= */}

      {popup.isOpen && (
        <div className="result-modal-overlay">
          <div className={`result-modal-card ${popup.type}`}>
            <div className={`result-modal-icon ${popup.type}`}>
              {popup.type === "success" ? "✓" : "✕"}
            </div>

            <h3>{popup.title}</h3>

            <p>{popup.message}</p>

            <button
              type="button"
              className="result-modal-btn confirm"
              onClick={handleClosePopupAndRedirect}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublishResultBatch;
