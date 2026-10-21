
// =====================================================
// NON-PUBLISHED NOTICE DROPDOWN
// =====================================================

import { useEffect, useState } from "react";

import {
  getNonPublishedNoticeDropdown,
} from "../../Services/noticeService";

import "./GetNonPublishedNoticeDropdown.css";


// =====================================================
// EXTRACT API DATA
// =====================================================

const extractData = (response) => {

  // Direct array
  if (Array.isArray(response)) {
    return response;
  }

  // APIResponse Data
  if (Array.isArray(response?.Data)) {
    return response.Data;
  }

  // APIResponse data
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  // Result
  if (Array.isArray(response?.Result)) {
    return response.Result;
  }

  if (Array.isArray(response?.result)) {
    return response.result;
  }

  return [];
};


// =====================================================
// COMPONENT
// =====================================================

const GetNonPublishedNoticeDropdown = () => {

  const [notices, setNotices] =
    useState([]);

  const [selectedId, setSelectedId] =
    useState("");

  const [loading, setLoading] =
    useState(true);

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
        "Notice Dropdown API Response:",
        response
      );


      const data =
        extractData(response);


      console.log(
        "Extracted Notice Dropdown:",
        data
      );


      setNotices(data);

    } catch (err) {

      console.error(
        "Notice dropdown error:",
        err
      );

      setError(
        err?.message ||
        "Failed to load notice dropdown."
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
  // UI
  // ===================================================

  return (

    <div className="notice-dropdown-page">

      <div className="notice-dropdown-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="notice-dropdown-header">

          <h1>
            Non-Published Notice Dropdown
          </h1>

          <p>
            Select one of the currently
            available draft notices.
          </p>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="notice-dropdown-error">

            {error}

          </div>

        )}


        {/* =================================================
            DROPDOWN
        ================================================= */}

        <div className="notice-dropdown-form-group">

          <label htmlFor="notice-dropdown">

            Select Notice

          </label>


          <select
            id="notice-dropdown"
            value={selectedId}
            onChange={(e) =>
              setSelectedId(
                e.target.value
              )
            }
            disabled={loading}
          >

            <option value="">

              {loading
                ? "Loading..."
                : "Select Notice"}

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

        </div>


        {/* =================================================
            SELECTED DATA
        ================================================= */}

        {selectedId && (

          <div className="notice-dropdown-selected">

            <span>
              Selected Notice ID
            </span>

            <strong>
              {selectedId}
            </strong>

          </div>

        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!loading &&
          notices.length === 0 &&
          !error && (

            <div className="notice-dropdown-empty">

              No non-published notices found.

            </div>

          )}


        {/* =================================================
            COUNT
        ================================================= */}

        {!loading &&
          notices.length > 0 && (

            <div className="notice-dropdown-count">

              Total draft notices:{" "}

              <strong>
                {notices.length}
              </strong>

            </div>

          )}

      </div>

    </div>

  );

};


export default GetNonPublishedNoticeDropdown;

