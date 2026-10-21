import React, { useEffect, useState } from "react";
import "./Notice.css";

function Notice() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // Backend API URL
  // Change this according to your ASP.NET Core API port
  // =====================================================
  const API_URL = "https://localhost:7164";

  // =====================================================
  // Get All Published Notices
  // =====================================================
  useEffect(() => {
    const fetchNotices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/api/Notice/GetAllPublished`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch notices.");
        }

        const result = await response.json();

        console.log("Notice API Response:", result);

        // APIResponse -> Data
        setNotices(result.data || []);
      } catch (error) {
        console.error("Error fetching notices:", error);

        setError("Unable to load notices. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotices();
  }, []);

  // =====================================================
  // Format Date
  // =====================================================
  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // =====================================================
  // Open PDF
  // =====================================================
  const handleOpenPdf = (pdfPath) => {
    if (!pdfPath) {
      alert("PDF file is not available.");
      return;
    }

    let pdfUrl;

    // If backend already returns complete URL
    if (pdfPath.startsWith("http")) {
      pdfUrl = pdfPath;
    } else {
      // If backend returns /Notices/file.pdf
      pdfUrl = `${API_URL}${pdfPath}`;
    }

    window.open(pdfUrl, "_blank");
  };

  // =====================================================
  // Loading
  // =====================================================
  if (loading) {
    return (
      <div className="notice-page">
        <div className="notice-container">

          <div className="notice-header">
            <h1>Notices</h1>
            <p>Latest college notices and announcements</p>
          </div>

          <div className="notice-loading">
            <div className="loading-spinner"></div>
            <p>Loading notices...</p>
          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // Error
  // =====================================================
  if (error) {
    return (
      <div className="notice-page">
        <div className="notice-container">

          <div className="notice-header">
            <h1>Notices</h1>
            <p>Latest college notices and announcements</p>
          </div>

          <div className="notice-error">
            <div className="error-icon">!</div>

            <h3>Unable to Load Notices</h3>

            <p>{error}</p>
          </div>

        </div>
      </div>
    );
  }

  // =====================================================
  // Main UI
  // =====================================================
  return (
    <div className="notice-page">

      <div className="notice-container">

        {/* ================= HEADER ================= */}
        <div className="notice-header">

          <div>
            <h1>Notices</h1>

            <p>
              Latest college notices and announcements
            </p>
          </div>

          <div className="notice-count">
            {notices.length}{" "}
            {notices.length === 1 ? "Notice" : "Notices"}
          </div>

        </div>


        {/* ================= NOTICE LIST ================= */}

        {notices.length === 0 ? (

          <div className="no-notice">

            <div className="no-notice-icon">
              📋
            </div>

            <h3>No Notices Available</h3>

            <p>
              There are currently no published notices.
            </p>

          </div>

        ) : (

          <div className="notice-list">

            {notices.map((notice) => (

              <div
                className="notice-card"
                key={notice.id}
              >

                {/* ================= PDF ICON ================= */}

                <div className="pdf-document-icon">

                  <div className="pdf-icon-text">
                    PDF
                  </div>

                </div>


                {/* ================= NOTICE CONTENT ================= */}

                <div className="notice-content">

                  <h2 className="notice-title">
                    {notice.title}
                  </h2>

                  {notice.description && (
                    <p className="notice-description">
                      {notice.description}
                    </p>
                  )}

                  <div className="notice-date">

                    <span className="calendar-icon">
                      📅
                    </span>

                    <span>
                      {formatDate(notice.createdDate)}
                    </span>

                  </div>

                </div>


                {/* ================= PDF BUTTON ================= */}

                <div className="notice-action">

                  <button
                    type="button"
                    className="pdf-button"
                    onClick={() =>
                      handleOpenPdf(notice.pdfPath)
                    }
                  >

                    <span className="button-pdf-icon">
                      📄
                    </span>

                    <span>
                      View PDF
                    </span>

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default Notice;