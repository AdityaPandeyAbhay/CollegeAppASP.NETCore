// =====================================================
// GET SECTION BY CODE
// =====================================================

import { useState } from "react";

import {
  getSectionByCode,
} from "../../Services/sectionService";

import {
  getClassDropdown,
} from "../../Services/classService";

import "./GetSectionByCode.css";

const GetSectionByCode = () => {

  const [code, setCode] = useState("");

  const [section, setSection] = useState(null);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (event) => {

    event.preventDefault();

    setError("");
    setSection(null);


    const searchCode = code.trim();


    if (!searchCode) {

      setError(
        "Section code is required."
      );

      return;

    }


    try {

      setLoading(true);


      // -----------------------------------------------
      // GET SECTION
      // -----------------------------------------------

      const sectionData =
        await getSectionByCode(
          searchCode
        );


      console.log(
        "SECTION BY CODE:",
        sectionData
      );


      // -----------------------------------------------
      // GET CLASS DROPDOWN
      // -----------------------------------------------

      const classData =
        await getClassDropdown();


      console.log(
        "CLASS DROPDOWN:",
        classData
      );


      // -----------------------------------------------
      // SCHOOL CLASS ID
      // -----------------------------------------------

      const schoolClassId =
        sectionData?.SchoolClassId ??
        sectionData?.schoolClassId;


      console.log(
        "SCHOOL CLASS ID:",
        schoolClassId
      );


      // -----------------------------------------------
      // FIND CLASS
      // -----------------------------------------------

      const selectedClass =
        Array.isArray(classData)
          ? classData.find(
              (item) => {

                const classId =
                  item?.id ??
                  item?.Id;

                return (
                  Number(classId) ===
                  Number(schoolClassId)
                );

              }
            )
          : null;


      console.log(
        "SELECTED CLASS:",
        selectedClass
      );


      // -----------------------------------------------
      // CLASS NAME
      // -----------------------------------------------

      const className =
        sectionData?.ClassName ||
        sectionData?.className ||
        selectedClass?.text ||
        selectedClass?.Text ||
        "-";


      console.log(
        "FINAL CLASS NAME:",
        className
      );


      // -----------------------------------------------
      // FINAL DATA
      // -----------------------------------------------

      setSection({

        ...sectionData,

        ClassName: className,

      });


    } catch (error) {

      console.error(
        "Get Section By Code Error:",
        error
      );

      setError(
        error?.message ||
        "Failed to find section."
      );

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div className="get-section-code-page">

      <div className="get-section-code-container">


        {/* =============================================
            HEADER
        ============================================= */}

        <div className="get-section-code-header">

          <h1>
            Get Section By Code
          </h1>

          <p>
            Search section using section code
          </p>

        </div>


        {/* =============================================
            SEARCH
        ============================================= */}

        <form
          className="get-section-code-search"
          onSubmit={handleSearch}
        >

          <input
            type="text"
            value={code}
            onChange={(event) =>
              setCode(event.target.value)
            }
            placeholder="Enter section code"
            disabled={loading}
          />


          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Searching..."
              : "Search"}

          </button>

        </form>


        {/* =============================================
            ERROR
        ============================================= */}

        {error && (

          <div className="get-section-code-error">

            {error}

          </div>

        )}


        {/* =============================================
            LOADING
        ============================================= */}

        {loading && (

          <div className="get-section-code-loading">

            <div className="get-section-code-spinner"></div>

            <span>
              Loading section...
            </span>

          </div>

        )}


        {/* =============================================
            DETAILS
        ============================================= */}

        {!loading &&
          section && (

            <div className="get-section-code-card">


              <div className="get-section-code-card-header">

                <h2>
                  Section Details
                </h2>

              </div>


              <div className="get-section-code-grid">


                {/* CLASS */}

                <div className="get-section-code-item">

                  <span>
                    Class
                  </span>

                  <strong>
                    {
                      section.ClassName ||
                      "-"
                    }
                  </strong>

                </div>


                {/* SECTION CODE */}

                <div className="get-section-code-item">

                  <span>
                    Section Code
                  </span>

                  <strong>
                    {
                      section.SectionCode ??
                      section.sectionCode ??
                      "-"
                    }
                  </strong>

                </div>


                {/* SECTION NAME */}

                <div className="get-section-code-item">

                  <span>
                    Section Name
                  </span>

                  <strong>
                    {
                      section.SectionName ??
                      section.sectionName ??
                      "-"
                    }
                  </strong>

                </div>


                {/* DISPLAY ORDER */}

                <div className="get-section-code-item">

                  <span>
                    Display Order
                  </span>

                  <strong>
                    {
                      section.DisplayOrder ??
                      section.displayOrder ??
                      0
                    }
                  </strong>

                </div>


                {/* CAPACITY */}

                <div className="get-section-code-item">

                  <span>
                    Capacity
                  </span>

                  <strong>
                    {
                      section.Capacity ??
                      section.capacity ??
                      0
                    }
                  </strong>

                </div>


                {/* ROOM */}

                <div className="get-section-code-item">

                  <span>
                    Room Number
                  </span>

                  <strong>
                    {
                      section.RoomNumber ??
                      section.roomNumber ??
                      "-"
                    }
                  </strong>

                </div>


                {/* DESCRIPTION */}

                <div className="get-section-code-item">

                  <span>
                    Description
                  </span>

                  <strong>
                    {
                      section.Description ??
                      section.description ??
                      "-"
                    }
                  </strong>

                </div>


                {/* STATUS */}

                <div className="get-section-code-item">

                  <span>
                    Status
                  </span>

                  <strong
                    className={
                      (
                        section.IsActive ??
                        section.isActive
                      )
                        ? "active"
                        : "inactive"
                    }
                  >

                    {
                      (
                        section.IsActive ??
                        section.isActive
                      )
                        ? "Active"
                        : "Inactive"
                    }

                  </strong>

                </div>


              </div>

            </div>

          )}

      </div>

    </div>

  );

};

export default GetSectionByCode;