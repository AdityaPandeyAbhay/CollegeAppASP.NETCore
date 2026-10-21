// =====================================================
// GET ALL CLASS
// =====================================================

import { useEffect, useState } from "react";

import {
  getAllClass,
  addDepartmentNames,
} from "../../Services/classService";

import "./GetAllClass.css";

const GetAllClass = () => {

  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ===================================================
  // LOAD CLASSES
  // ===================================================

  const loadClasses = async () => {

    try {

      setLoading(true);
      setError("");

      // -----------------------------------------------
      // GET ALL CLASSES
      // -----------------------------------------------

      const data = await getAllClass();

      console.log(
        "Class API response:",
        data
      );


      // -----------------------------------------------
      // ADD DEPARTMENT NAMES
      // -----------------------------------------------

      const classesWithDepartment =
        await addDepartmentNames(data);

      console.log(
        "Classes with departments:",
        classesWithDepartment
      );


      setClasses(
        classesWithDepartment
      );

    } catch (error) {

      console.error(
        "Get All Class Error:",
        error
      );

      setError(
        error?.message ||
        "Failed to load classes."
      );

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // LOAD WHEN PAGE OPENS
  // ===================================================

  useEffect(() => {

    loadClasses();

  }, []);


  // ===================================================
  // DATE FORMAT
  // ===================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    const parsed = new Date(date);

    if (
      Number.isNaN(
        parsed.getTime()
      )
    ) {
      return "-";
    }

    return parsed.toLocaleDateString(
      "en-IN"
    );

  };


  // ===================================================
  // UI
  // ===================================================

  return (

    <div className="get-all-class-page">

      <div className="get-all-class-container">


        {/* =================================================
            HEADER
        ================================================= */}

        <div className="get-all-class-header">

          <div>

            <h1>
              All Classes
            </h1>

            <p>
              View all school classes
            </p>

          </div>


          <button
            className="get-all-class-refresh"
            onClick={loadClasses}
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

          <div className="get-all-class-error">

            {error}

          </div>

        )}


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="get-all-class-loading">

            <div className="get-all-class-spinner"></div>

            <span>
              Loading classes...
            </span>

          </div>


        ) : classes.length === 0 ? (

          <div className="get-all-class-empty">

            No classes found.

          </div>


        ) : (

          <div className="get-all-class-table-wrapper">

            <table className="get-all-class-table">

              <thead>

                <tr>

                  <th>#</th>

                  <th>
                    Class Code
                  </th>

                  <th>
                    Class Name
                  </th>

                  <th>
                    Department
                  </th>

                  <th>
                    Description
                  </th>

                  <th>
                    Display Order
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Created Date
                  </th>

                </tr>

              </thead>


              <tbody>

                {classes.map(
                  (item, index) => (

                    <tr
                      key={
                        item.Id ??
                        index
                      }
                    >

                      <td>
                        {index + 1}
                      </td>


                      <td>

                        <span className="get-all-class-code">

                          {item.ClassCode || "-"}

                        </span>

                      </td>


                      <td>

                        <strong>

                          {item.ClassName || "-"}

                        </strong>

                      </td>


                      <td>

                        {item.DepartmentName || "-"}

                      </td>


                      <td>

                        {item.Description || "-"}

                      </td>


                      <td>

                        {item.DisplayOrder ?? 0}

                      </td>


                      <td>

                        <span
                          className={
                            item.IsActive
                              ? "get-all-class-status active"
                              : "get-all-class-status inactive"
                          }
                        >

                          {item.IsActive
                            ? "Active"
                            : "Inactive"}

                        </span>

                      </td>


                      <td>

                        {formatDate(
                          item.CreatedDate
                        )}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}


        {/* =================================================
            FOOTER
        ================================================= */}

        {!loading &&
          classes.length > 0 && (

            <div className="get-all-class-footer">

              Total Classes:

              <strong>
                {" "}
                {classes.length}
              </strong>

            </div>

          )}

      </div>

    </div>

  );

};

export default GetAllClass;