
// =====================================================
// GET NON-PUBLISHED NOTICES
// =====================================================

import { useEffect, useState } from "react";

import {
  getNonPublishedNotices,
} from "../../Services/noticeService";

import "./GetNonPublishedNotice.css";


// =====================================================
// EXTRACT API DATA
// =====================================================

const extractData = (response) => {

  // Direct array
  if (Array.isArray(response)) {
    return response;
  }

  // ASP.NET / APIResponse
  if (Array.isArray(response?.Data)) {
    return response.Data;
  }

  // lowercase data
  if (Array.isArray(response?.data)) {
    return response.data;
  }

  // Sometimes data is inside result
  if (Array.isArray(response?.result)) {
    return response.result;
  }

  if (Array.isArray(response?.Result)) {
    return response.Result;
  }

  return [];
};


// =====================================================
// COMPONENT
// =====================================================

const GetNonPublishedNotice = () => {

  const [notices, setNotices] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ===================================================
  // LOAD NOTICES
  // ===================================================

  const loadNotices = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getNonPublishedNotices();


      console.log(
        "Non-Published Notices API Response:",
        response
      );


      const noticeData =
        extractData(response);


      console.log(
        "Extracted Notices:",
        noticeData
      );


      setNotices(noticeData);

    } catch (err) {

      console.error(
        "Get non-published notices error:",
        err
      );

      setError(
        err?.message ||
        "Failed to load non-published notices."
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

    <div className="notice-list-page">

      <div className="notice-list-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="notice-list-header">

          <div>

            <h1>
              Non-Published Notices
            </h1>

            <p>
              These notices are currently saved
              as drafts and can be published.
            </p>

          </div>


          <button
            type="button"
            className="notice-refresh-btn"
            onClick={loadNotices}
            disabled={loading}
          >

            {loading
              ? "Loading..."
              : "Refresh"}

          </button>

        </div>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="notice-list-error">

            {error}

          </div>

        )}


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="notice-list-loading">

            Loading notices...

          </div>


        ) : notices.length === 0 ? (

          <div className="notice-empty">

            No non-published notices found.

          </div>


        ) : (

          /* =================================================
             TABLE
          ================================================= */

          <div className="notice-table-wrapper">

            <table className="notice-table">

              <thead>

                <tr>

                  <th>
                    ID
                  </th>

                  <th>
                    Title
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    PDF File
                  </th>

                  <th>
                    Created Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {notices.map(
                  (notice, index) => (

                    <tr
                      key={
                        notice?.id ??
                        notice?.Id ??
                        index
                      }
                    >

                      {/* ID */}

                      <td>

                        {notice?.id ??
                         notice?.Id ??
                         "-"}

                      </td>


                      {/* TITLE */}

                      <td className="notice-title-cell">

                        {notice?.title ??
                         notice?.Title ??
                         "-"}

                      </td>


                      {/* DESCRIPTION */}

                      <td className="notice-description-cell">

                        {notice?.description ??
                         notice?.Description ??
                         "-"}

                      </td>


                      {/* PDF */}

                      <td>

                        {notice?.pdfFileName ??
                         notice?.PdfFileName ??
                         notice?.pdfFile ??
                         notice?.PdfFile ??
                         "-"}

                      </td>


                      {/* CREATED DATE */}

                      <td>

                        {formatDate(
                          notice?.createdDate ??
                          notice?.CreatedDate
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );

};


export default GetNonPublishedNotice;

