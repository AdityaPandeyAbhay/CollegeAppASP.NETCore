import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import "./PageNavigation.css";


function PageNavigation() {

  const location = useLocation();
  const navigate = useNavigate();

  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);


  // =====================================================
  // CHECK BROWSER HISTORY
  // =====================================================

  useEffect(() => {

    const checkHistory = () => {

      /*
        Browser history does not directly tell us
        whether Forward is available.

        We keep our own history state in sessionStorage.
      */

      const historyData =
        JSON.parse(
          sessionStorage.getItem("pageNavigationHistory")
        ) || {
          pages: [],
          index: -1
        };


      const currentPath =
        location.pathname +
        location.search;


      // If current page is not already the last
      // page in our navigation history
      if (
        historyData.pages[
          historyData.index
        ] !== currentPath
      ) {

        // Remove forward history when a completely
        // new page is opened
        const newPages =
          historyData.pages.slice(
            0,
            historyData.index + 1
          );

        newPages.push(currentPath);


        const newData = {
          pages: newPages,
          index: newPages.length - 1
        };


        sessionStorage.setItem(
          "pageNavigationHistory",
          JSON.stringify(newData)
        );


        setCanGoBack(
          newData.index > 0
        );

        setCanGoForward(false);

      } else {

        setCanGoBack(
          historyData.index > 0
        );

        setCanGoForward(
          historyData.index <
          historyData.pages.length - 1
        );

      }

    };


    checkHistory();

  }, [location.pathname, location.search]);


  // =====================================================
  // PREVIOUS
  // =====================================================

  const handlePrevious = () => {

    const historyData =
      JSON.parse(
        sessionStorage.getItem(
          "pageNavigationHistory"
        )
      );

    if (!historyData) {
      return;
    }


    if (historyData.index <= 0) {
      return;
    }


    const newIndex =
      historyData.index - 1;


    const newData = {
      ...historyData,
      index: newIndex
    };


    sessionStorage.setItem(
      "pageNavigationHistory",
      JSON.stringify(newData)
    );


    navigate(
      newData.pages[newIndex]
    );

  };


  // =====================================================
  // NEXT
  // =====================================================

  const handleNext = () => {

    const historyData =
      JSON.parse(
        sessionStorage.getItem(
          "pageNavigationHistory"
        )
      );

    if (!historyData) {
      return;
    }


    if (
      historyData.index >=
      historyData.pages.length - 1
    ) {
      return;
    }


    const newIndex =
      historyData.index + 1;


    const newData = {
      ...historyData,
      index: newIndex
    };


    sessionStorage.setItem(
      "pageNavigationHistory",
      JSON.stringify(newData)
    );


    navigate(
      newData.pages[newIndex]
    );

  };


  // =====================================================
  // DON'T SHOW ON UNKNOWN PAGE
  // =====================================================

  if (!location.pathname) {
    return null;
  }


  // =====================================================
  // DASHBOARD
  // =====================================================

  const isDashboard =
    location.pathname.startsWith(
      "/dashboard/"
    );


  return (

    <div
      className={
        isDashboard
          ? "page-navigation dashboard-navigation"
          : "page-navigation"
      }
    >

      {/* ================= PREVIOUS ================= */}

      <button
        className="page-navigation-button previous-button"
        disabled={!canGoBack}
        onClick={handlePrevious}
        title="Previous Page"
      >

        <span className="navigation-icon">
          ←
        </span>

        <span>
          Prev
        </span>

      </button>


      {/* ================= NEXT ================= */}

      <button
        className="page-navigation-button next-button"
        disabled={!canGoForward}
        onClick={handleNext}
        title="Next Page"
      >

        <span>
          Next
        </span>

        <span className="navigation-icon">
          →
        </span>

      </button>

    </div>

  );

}


export default PageNavigation;