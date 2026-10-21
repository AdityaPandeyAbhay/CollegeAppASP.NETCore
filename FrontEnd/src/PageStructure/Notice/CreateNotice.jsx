
// =====================================================
// CREATE NOTICE
// =====================================================

import { useRef, useState } from "react";

import { createNotice } from "../../Services/noticeService";

import "./CreateNotice.css";

const CreateNotice = () => {
  // ===================================================
  // STATE
  // ===================================================

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pdfFile, setPdfFile] = useState(null);

  const [loading, setLoading] = useState(false);

  // Message shown in the normal message area
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Popup message
  const [popup, setPopup] = useState({
    show: false,
    type: "",
    text: "",
  });

  const fileInputRef = useRef(null);

  // ===================================================
  // SHOW POPUP
  // ===================================================

  const showPopup = (type, text) => {
    setPopup({
      show: true,
      type,
      text,
    });

    // Automatically hide after 4 seconds
    setTimeout(() => {
      setPopup({
        show: false,
        type: "",
        text: "",
      });
    }, 4000);
  };

  // ===================================================
  // CLOSE POPUP
  // ===================================================

  const closePopup = () => {
    setPopup({
      show: false,
      type: "",
      text: "",
    });
  };

  // ===================================================
  // FILE CHANGE
  // ===================================================

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    setError("");
    setMessage("");

    if (!file) {
      setPdfFile(null);
      return;
    }

    // PDF validation
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setPdfFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      const errorMessage = "Only PDF files are allowed.";

      setError(errorMessage);
      showPopup("error", errorMessage);

      return;
    }

    // 10 MB validation
    if (file.size > 10 * 1024 * 1024) {
      setPdfFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      const errorMessage =
        "PDF file size cannot exceed 10 MB.";

      setError(errorMessage);
      showPopup("error", errorMessage);

      return;
    }

    setPdfFile(file);
  };

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    // =================================================
    // VALIDATION
    // =================================================

    if (!title.trim()) {
      const errorMessage = "Notice title is required.";

      setError(errorMessage);
      showPopup("error", errorMessage);

      return;
    }

    if (!description.trim()) {
      const errorMessage =
        "Notice description is required.";

      setError(errorMessage);
      showPopup("error", errorMessage);

      return;
    }

    if (!pdfFile) {
      const errorMessage =
        "Please select a PDF file.";

      setError(errorMessage);
      showPopup("error", errorMessage);

      return;
    }

    // =================================================
    // API CALL
    // =================================================

    try {
      setLoading(true);

      await createNotice({
        title,
        description,
        pdfFile,
      });

      const successMessage =
        "Notice created successfully as draft.";

      // Normal message
      setMessage(successMessage);

      // Popup message
      showPopup("success", successMessage);

      // =================================================
      // RESET FORM AFTER SUCCESS
      // =================================================

      setTitle("");
      setDescription("");
      setPdfFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error(
        "Create notice error:",
        err
      );

      const errorMessage =
        err.message ||
        "Failed to create notice.";

      // Normal error message
      setError(errorMessage);

      // Popup error message
      showPopup("error", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // RESET
  // ===================================================

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setPdfFile(null);
    setMessage("");
    setError("");

    closePopup();

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="notice-create-page">

      {/* =================================================
          POPUP MESSAGE
      ================================================= */}

      {popup.show && (
        <div
          className={`notice-popup ${
            popup.type === "success"
              ? "notice-popup-success"
              : "notice-popup-error"
          }`}
        >

          <div className="notice-popup-icon">
            {popup.type === "success" ? "✓" : "!"}
          </div>

          <div className="notice-popup-content">
            <strong>
              {popup.type === "success"
                ? "Success"
                : "Error"}
            </strong>

            <span>{popup.text}</span>
          </div>

          <button
            type="button"
            className="notice-popup-close"
            onClick={closePopup}
            aria-label="Close"
          >
            ×
          </button>

        </div>
      )}

      {/* =================================================
          MAIN CONTAINER
      ================================================= */}

      <div className="notice-create-container">

        <div className="notice-create-header">

          <h1>Create Notice</h1>

          <p>
            Create a new notice. Newly created
            notices will remain unpublished until
            they are published.
          </p>

        </div>

        {/* =================================================
            NORMAL SUCCESS MESSAGE
        ================================================= */}

        {message && (
          <div className="notice-success">
            {message}
          </div>
        )}

        {/* =================================================
            NORMAL ERROR MESSAGE
        ================================================= */}

        {error && (
          <div className="notice-error">
            {error}
          </div>
        )}

        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="notice-create-form"
          onSubmit={handleSubmit}
        >

          {/* TITLE */}

          <div className="notice-form-group">

            <label htmlFor="notice-title">
              Notice Title
              <span>*</span>
            </label>

            <input
              id="notice-title"
              type="text"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
              placeholder="Enter notice title"
              disabled={loading}
              maxLength={250}
            />

          </div>

          {/* DESCRIPTION */}

          <div className="notice-form-group">

            <label htmlFor="notice-description">
              Description
              <span>*</span>
            </label>

            <textarea
              id="notice-description"
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              placeholder="Enter notice description"
              disabled={loading}
              rows={7}
            />

          </div>

          {/* PDF */}

          <div className="notice-form-group">

            <label htmlFor="notice-pdf">
              Notice PDF
              <span>*</span>
            </label>

            <input
              ref={fileInputRef}
              id="notice-pdf"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={loading}
            />

            <small>
              Only PDF files are allowed.
              Maximum size: 10 MB.
            </small>

            {pdfFile && (
              <div className="notice-selected-file">
                <strong>Selected File:</strong>{" "}
                {pdfFile.name}
              </div>
            )}

          </div>

          {/* BUTTONS */}

          <div className="notice-form-actions">

            <button
              type="submit"
              className="notice-btn notice-btn-primary"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create Notice"}
            </button>

            <button
              type="button"
              className="notice-btn notice-btn-secondary"
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

export default CreateNotice;

