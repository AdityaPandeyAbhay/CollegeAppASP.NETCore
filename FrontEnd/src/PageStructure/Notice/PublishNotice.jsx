
// =====================================================
// PUBLISH NOTICE
// =====================================================

import { useEffect, useState } from "react";

import {
  getNonPublishedNoticeDropdown,
  getNonPublishedNoticeById,
  publishNotice,
} from "../../Services/noticeService";

import "./PublishNotice.css";


// =====================================================
// EXTRACT API DATA
// =====================================================

const extractData = (response) => {

  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.Data)) {
    return response.Data;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (response?.Data !== undefined) {
    return response.Data;
  }

  if (response?.data !== undefined) {
    return response.data;
  }

  if (response?.Result !== undefined) {
    return response.Result;
  }

  if (response?.result !== undefined) {
    return response.result;
  }

  return response;
};


// =====================================================
// COMPONENT
// =====================================================

const PublishNotice = () => {

  const [notices, setNotices] =
    useState([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [selectedNotice, setSelectedNotice] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [publishing, setPublishing] =
    useState(false);

  const [loadingDetails, setLoadingDetails] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // ===================================================
  // LOAD DROPDOWN
  // ===================================================

  const loadNotices = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getNonPublishedNoticeDropdown();


      console.log(
        "Publish Dropdown Response:",
        response
      );


      const data =
        extractData(response);


      console.log(
        "Publish Dropdown Data:",
        data
      );


      setNotices(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Publish notice dropdown error:",
        err
      );

      setError(
        err?.message ||
        "Failed to load draft notices."
      );

      setNotices([]);

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {

    loadNotices();

  }, []);


  // ===================================================
  // SELECT NOTICE
  // ===================================================

  const handleSelectNotice = async (e) => {

    const id =
      e.target.value;


    setSelectedId(id);

    setSelectedNotice(null);

    setMessage("");

    setError("");


    if (!id) {
      return;
    }


    try {

      setLoadingDetails(true);


      const response =
        await getNonPublishedNoticeById(id);


      console.log(
        "Selected Notice API Response:",
        response
      );


      const data =
        extractData(response);


      console.log(
        "Selected Notice Data:",
        data
      );


      setSelectedNotice(
        data || null
      );

    } catch (err) {

      console.error(
        "Get selected notice error:",
        err
      );

      setError(
        err?.message ||
        "Failed to load selected notice."
      );

    } finally {

      setLoadingDetails(false);

    }

  };


  // ===================================================
  // PUBLISH NOTICE
  // ===================================================

  const handlePublish = async () => {

    if (!selectedId) {

      setError(
        "Please select a notice first."
      );

      return;

    }


    const confirmed =
      window.confirm(
        "Are you sure you want to publish this notice?"
      );


    if (!confirmed) {
      return;
    }


    try {

      setPublishing(true);

      setError("");

      setMessage("");


      await publishNotice(
        selectedId
      );


      setMessage(
        "Notice published successfully."
      );


      setSelectedId("");

      setSelectedNotice(null);


      // Refresh dropdown
      await loadNotices();

    } catch (err) {

      console.error(
        "Publish notice error:",
        err
      );

      setError(
        err?.message ||
        "Failed to publish notice."
      );

    } finally {

      setPublishing(false);

    }

  };


  // ===================================================
  // FORMAT DATE
  // ===================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }


    const parsedDate =
      new Date(date);


    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return "-";

    }


    return parsedDate.toLocaleString();

  };


  // ===================================================
  // UI
  // =====================================================

  return (

    <div className="notice-publish-page">

      <div className="notice-publish-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="notice-publish-header">

          <h1>
            Publish Notice
          </h1>

          <p>
            Select a draft notice from the
            dropdown and publish it.
          </p>

        </div>


        {/* =================================================
            SUCCESS
        ================================================= */}

        {message && (

          <div className="notice-publish-success">

            {message}

          </div>

        )}


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="notice-publish-error">

            {error}

          </div>

        )}


        {/* =================================================
            SELECT NOTICE
        ================================================= */}

        <div className="notice-publish-form-group">

          <label htmlFor="publish-notice">

            Select Notice

            <span>
              *
            </span>

          </label>


          <select
            id="publish-notice"
            value={selectedId}
            onChange={handleSelectNotice}
            disabled={
              loading ||
              publishing
            }
          >

            <option value="">

              {loading
                ? "Loading draft notices..."
                : "Select a notice"}

            </option>


            {notices.map(
              (notice, index) => (

                <option
                  key={
                    notice?.id ??
                    notice?.Id ??
                    index
                  }
                  value={
                    notice?.id ??
                    notice?.Id ??
                    ""
                  }
                >

                  {notice?.title ??
                   notice?.Title ??
                   "Untitled Notice"}

                </option>

              )
            )}

          </select>


          {!loading &&
            notices.length === 0 && (

              <small className="notice-no-drafts">

                No draft notices are available
                for publishing.

              </small>

            )}

        </div>


        {/* =================================================
            LOADING DETAILS
        ================================================= */}

        {loadingDetails && (

          <div className="notice-publish-loading">

            Loading notice details...

          </div>

        )}


        {/* =================================================
            NOTICE PREVIEW
        ================================================= */}

        {selectedNotice &&
          !loadingDetails && (

            <div className="notice-publish-preview">


              {/* HEADER */}

              <div className="notice-preview-header">

                <h2>

                  {selectedNotice?.title ??
                   selectedNotice?.Title ??
                   "Untitled Notice"}

                </h2>


                <span className="notice-preview-badge">

                  Draft

                </span>

              </div>


              {/* CONTENT */}

              <div className="notice-preview-content">


                {/* ID */}

                <div className="notice-preview-row">

                  <span>
                    Notice ID
                  </span>

                  <strong>

                    {selectedNotice?.id ??
                     selectedNotice?.Id ??
                     "-"}

                  </strong>

                </div>


                {/* CREATED DATE */}

                <div className="notice-preview-row">

                  <span>
                    Created Date
                  </span>

                  <strong>

                    {formatDate(
                      selectedNotice?.createdDate ??
                      selectedNotice?.CreatedDate
                    )}

                  </strong>

                </div>


                {/* DESCRIPTION */}

                <div className="notice-preview-description">

                  <span>
                    Description
                  </span>

                  <p>

                    {selectedNotice?.description ??
                     selectedNotice?.Description ??
                     "-"}

                  </p>

                </div>


                {/* PDF */}

                {(selectedNotice?.pdfFileName ||
                  selectedNotice?.PdfFileName) && (

                  <div className="notice-preview-row">

                    <span>
                      PDF File
                    </span>

                    <strong>

                      {selectedNotice?.pdfFileName ??
                       selectedNotice?.PdfFileName}

                    </strong>

                  </div>

                )}

              </div>


              {/* =================================================
                  PUBLISH BUTTON
              ================================================= */}

              <div className="notice-publish-actions">

                <button
                  type="button"
                  className="notice-publish-btn"
                  onClick={handlePublish}
                  disabled={publishing}
                >

                  {publishing
                    ? "Publishing..."
                    : "Publish Notice"}

                </button>

              </div>

            </div>

          )}

      </div>

    </div>

  );

};


export default PublishNotice;

