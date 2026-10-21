
import React, { useEffect, useState } from "react";

import {
  getNonPublishedNoticeById,
  getNonPublishedNoticeDropdown,
} from "../../Services/noticeService";

import "./GetNonPublishedNoticeById.css";


const GetNonPublishedNoticeById = () => {

  // =====================================================
  // STATES
  // =====================================================

  const [notices, setNotices] = useState([]);

  const [selectedId, setSelectedId] = useState("");

  const [notice, setNotice] = useState(null);

  const [loadingDropdown, setLoadingDropdown] =
    useState(false);

  const [loadingNotice, setLoadingNotice] =
    useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // =====================================================
  // LOAD NON-PUBLISHED NOTICE DROPDOWN
  // =====================================================

  useEffect(() => {

    const loadNotices = async () => {

      try {

        setLoadingDropdown(true);

        setError("");

        const data =
          await getNonPublishedNoticeDropdown();

        const noticeList =
          Array.isArray(data)
            ? data
            : data?.data ||
              data?.Data ||
              [];

        setNotices(noticeList);

      } catch (err) {

        console.error(
          "Error loading notice dropdown:",
          err
        );

        setError(
          err?.message ||
          "Failed to load non-published notices."
        );

      } finally {

        setLoadingDropdown(false);

      }

    };


    loadNotices();

  }, []);


  // =====================================================
  // GET NOTICE BY ID
  // =====================================================

  const handleSearch = async () => {

    setError("");

    setSuccess("");

    setNotice(null);


    if (!selectedId) {

      setError(
        "Please select a non-published notice."
      );

      return;

    }


    try {

      setLoadingNotice(true);


      const data =
        await getNonPublishedNoticeById(
          selectedId
        );


      const noticeData =
        data?.data ||
        data?.Data ||
        data;


      setNotice(noticeData);

      setSuccess(
        "Non-published notice loaded successfully."
      );


    } catch (err) {

      console.error(
        "Error fetching notice:",
        err
      );

      setError(
        err?.message ||
        "Failed to fetch notice."
      );

    } finally {

      setLoadingNotice(false);

    }

  };


  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {

    setSelectedId("");

    setNotice(null);

    setError("");

    setSuccess("");

  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (dateValue) => {

    if (!dateValue) {
      return "-";
    }


    try {

      return new Date(dateValue).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );

    } catch {

      return dateValue;

    }

  };


  return (

    <div className="notice-by-id-page">


      {/* =================================================
          CONTAINER
      ================================================= */}

      <div className="notice-by-id-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="notice-by-id-header">

          <h1>
            Get Non-Published Notice By ID
          </h1>

          <p>
            Select a non-published notice from the
            dropdown to view its details.
          </p>

        </div>


        {/* =================================================
            MESSAGE
        ================================================= */}

        {error && (

          <div className="notice-error-message">
            {error}
          </div>

        )}


        {success && (

          <div className="notice-success-message">
            {success}
          </div>

        )}


        {/* =================================================
            SEARCH SECTION
        ================================================= */}

        <div className="notice-search-section">


          <div className="notice-form-group">

            <label htmlFor="noticeId">

              Select Notice

              <span className="required">
                *
              </span>

            </label>


            <select
              id="noticeId"
              value={selectedId}
              onChange={(e) =>
                setSelectedId(e.target.value)
              }
              disabled={loadingDropdown}
            >

              <option value="">
                {loadingDropdown
                  ? "Loading notices..."
                  : "Select Non-Published Notice"}
              </option>


              {notices.map((item) => (

                <option
                  key={item.id ?? item.Id}
                  value={item.id ?? item.Id}
                >

                  {item.title ??
                    item.Title ??
                    "Untitled Notice"}

                  {" - ID: "}

                  {item.id ?? item.Id}

                </option>

              ))}

            </select>

          </div>


          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="notice-action-buttons">


            <button
              type="button"
              className="notice-search-button"
              onClick={handleSearch}
              disabled={
                loadingNotice ||
                !selectedId
              }
            >

              {loadingNotice
                ? "Loading..."
                : "Get Notice"}

            </button>


            <button
              type="button"
              className="notice-clear-button"
              onClick={handleClear}
            >
              Clear
            </button>


          </div>


        </div>


        {/* =================================================
            NOTICE DETAILS
        ================================================= */}

        {notice && (

          <div className="notice-details-card">


            <div className="notice-details-header">

              <h2>
                Notice Details
              </h2>

              <span className="draft-badge">
                Draft
              </span>

            </div>


            {/* =================================================
                NOTICE ID
            ================================================= */}

            <div className="notice-detail-row">

              <div className="notice-detail-label">
                Notice ID
              </div>

              <div className="notice-detail-value">
                {notice.id ??
                  notice.Id ??
                  "-"}

              </div>

            </div>


            {/* =================================================
                TITLE
            ================================================= */}

            <div className="notice-detail-row">

              <div className="notice-detail-label">
                Title
              </div>

              <div className="notice-detail-value">
                {notice.title ??
                  notice.Title ??
                  "-"}
              </div>

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="notice-detail-row notice-description-row">

              <div className="notice-detail-label">
                Description
              </div>

              <div className="notice-detail-value notice-description">

                {notice.description ??
                  notice.Description ??
                  "-"}

              </div>

            </div>


            {/* =================================================
                PDF FILE NAME
            ================================================= */}

            <div className="notice-detail-row">

              <div className="notice-detail-label">
                PDF File Name
              </div>

              <div className="notice-detail-value">

                {notice.pdfFileName ??
                  notice.PdfFileName ??
                  "-"}

              </div>

            </div>


            {/* =================================================
                PDF PATH
            ================================================= */}

            <div className="notice-detail-row">

              <div className="notice-detail-label">
                PDF Path
              </div>

              <div className="notice-detail-value">

                {notice.pdfPath ??
                  notice.PdfPath ??
                  "-"}

              </div>

            </div>


            {/* =================================================
                CREATED BY
            ================================================= */}

            <div className="notice-detail-row">

              <div className="notice-detail-label">
                Created By
              </div>

              <div className="notice-detail-value">

                {notice.createdBy ??
                  notice.CreatedBy ??
                  "-"}

              </div>

            </div>


            {/* =================================================
                CREATED DATE
            ================================================= */}

            <div className="notice-detail-row">

              <div className="notice-detail-label">
                Created Date
              </div>

              <div className="notice-detail-value">

                {formatDate(
                  notice.createdDate ??
                  notice.CreatedDate
                )}

              </div>

            </div>


            {/* =================================================
                PUBLISHED STATUS
            ================================================= */}

            <div className="notice-detail-row">

              <div className="notice-detail-label">
                Published
              </div>

              <div className="notice-detail-value">

                {(notice.isPublished ??
                  notice.IsPublished)
                  ? "Yes"
                  : "No"}

              </div>

            </div>


            {/* =================================================
                ACTIVE STATUS
            ================================================= */}

            <div className="notice-detail-row">

              <div className="notice-detail-label">
                Active
              </div>

              <div className="notice-detail-value">

                {(notice.isActive ??
                  notice.IsActive)
                  ? "Yes"
                  : "No"}

              </div>

            </div>


          </div>

        )}


      </div>

    </div>

  );

};


export default GetNonPublishedNoticeById;

