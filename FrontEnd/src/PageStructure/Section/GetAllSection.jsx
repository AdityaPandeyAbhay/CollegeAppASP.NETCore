// =====================================================
// GET ALL SECTION
// =====================================================

import { useEffect, useState } from "react";

import {
  getAllSection,
} from "../../Services/sectionService";

import {
  getClassDropdown,
} from "../../Services/classService";

import "./GetAllSection.css";

const GetAllSection = () => {

  const [sections, setSections] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ===================================================
  // LOAD SECTIONS
  // ===================================================

  const loadSections = async () => {

    try {

      setLoading(true);
      setError("");

      // -----------------------------------------------
      // GET BOTH DATA
      // -----------------------------------------------

      const sectionData = await getAllSection();

      const classData = await getClassDropdown();

      console.log("SECTION API DATA:", sectionData);
      console.log("CLASS DROPDOWN DATA:", classData);


      // -----------------------------------------------
      // CREATE CLASS MAP
      // -----------------------------------------------

      const classMap = new Map();

      if (Array.isArray(classData)) {

        classData.forEach((item) => {

          const classId =
            item.id ??
            item.Id;

          const classText =
            item.text ??
            item.Text ??
            item.name ??
            item.Name ??
            "-";

          if (
            classId !== null &&
            classId !== undefined
          ) {

            classMap.set(
              Number(classId),
              classText
            );

          }

        });

      }


      console.log(
        "CLASS MAP:",
        classMap
      );


      // -----------------------------------------------
      // ENRICH SECTIONS
      // -----------------------------------------------

      const sectionList =
        Array.isArray(sectionData)
          ? sectionData
          : [];


      const finalSections =
        sectionList.map((item) => {

          const schoolClassId =
            item.SchoolClassId ??
            item.schoolClassId;


          const apiClassName =
            item.ClassName ??
            item.className ??
            item.SchoolClass?.ClassName ??
            item.schoolClass?.className ??
            "";


          const dropdownClassName =
            classMap.get(
              Number(schoolClassId)
            ) || "";


          return {

            ...item,

            ClassName:
              apiClassName ||
              dropdownClassName ||
              "-",

          };

        });


      console.log(
        "FINAL SECTION DATA:",
        finalSections
      );


      setSections(finalSections);

    } catch (error) {

      console.error(
        "Get All Section Error:",
        error
      );

      setError(
        error?.message ||
        "Failed to load sections."
      );

      setSections([]);

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {

    loadSections();

  }, []);


  // ===================================================
  // RENDER
  // ===================================================

  return (

    <div className="get-all-section-page">

      <div className="get-all-section-container">


        {/* =============================================
            HEADER
        ============================================= */}

        <div className="get-all-section-header">

          <div>

            <h1>
              All Sections
            </h1>

            <p>
              View all class sections
            </p>

          </div>


          <button
            className="get-all-section-refresh"
            onClick={loadSections}
            disabled={loading}
          >

            {loading
              ? "Loading..."
              : "Refresh"}

          </button>

        </div>


        {/* =============================================
            ERROR
        ============================================= */}

        {error && (

          <div className="get-all-section-error">

            {error}

          </div>

        )}


        {/* =============================================
            LOADING
        ============================================= */}

        {loading ? (

          <div className="get-all-section-loading">

            <div className="get-all-section-spinner"></div>

            <span>
              Loading sections...
            </span>

          </div>

        ) : sections.length === 0 ? (

          <div className="get-all-section-empty">

            No sections found.

          </div>

        ) : (

          /* ===========================================
             TABLE
          =========================================== */

          <div className="get-all-section-table-wrapper">

            <table className="get-all-section-table">

              <thead>

                <tr>

                  <th>#</th>

                  <th>Class</th>

                  <th>Section Code</th>

                  <th>Section Name</th>

                  <th>Display Order</th>

                  <th>Capacity</th>

                  <th>Room</th>

                  <th>Description</th>

                  <th>Status</th>

                </tr>

              </thead>


              <tbody>

                {sections.map(
                  (item, index) => (

                    <tr
                      key={
                        item.Id ??
                        item.id ??
                        index
                      }
                    >

                      <td>
                        {index + 1}
                      </td>


                      {/* CLASS */}

                      <td>

                        <strong>
                          {
                            item.ClassName ||
                            item.className ||
                            "-"
                          }
                        </strong>

                      </td>


                      {/* SECTION CODE */}

                      <td>

                        <span className="get-all-section-code">

                          {
                            item.SectionCode ??
                            item.sectionCode ??
                            "-"
                          }

                        </span>

                      </td>


                      {/* SECTION NAME */}

                      <td>

                        {
                          item.SectionName ??
                          item.sectionName ??
                          "-"
                        }

                      </td>


                      {/* DISPLAY ORDER */}

                      <td>

                        {
                          item.DisplayOrder ??
                          item.displayOrder ??
                          0
                        }

                      </td>


                      {/* CAPACITY */}

                      <td>

                        {
                          item.Capacity ??
                          item.capacity ??
                          0
                        }

                      </td>


                      {/* ROOM */}

                      <td>

                        {
                          item.RoomNumber ??
                          item.roomNumber ??
                          "-"
                        }

                      </td>


                      {/* DESCRIPTION */}

                      <td>

                        {
                          item.Description ??
                          item.description ??
                          "-"
                        }

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            (
                              item.IsActive ??
                              item.isActive
                            )
                              ? "get-all-section-status active"
                              : "get-all-section-status inactive"
                          }
                        >

                          {
                            (
                              item.IsActive ??
                              item.isActive
                            )
                              ? "Active"
                              : "Inactive"
                          }

                        </span>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* =============================================
            TOTAL
        ============================================= */}

        {!loading &&
          sections.length > 0 && (

            <div className="get-all-section-footer">

              Total Sections:

              <strong>
                {" "}
                {sections.length}
              </strong>

            </div>

          )}

      </div>

    </div>

  );

};

export default GetAllSection;