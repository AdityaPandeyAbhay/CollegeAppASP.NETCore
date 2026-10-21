// =====================================================
// GET ALL DEPARTMENT PAGE
// =====================================================

import { useEffect, useState } from "react";

import {
  getAllDepartment,
} from "../../Services/departmentService";

import "./GetAllDepartment.css";


const GetAllDepartment = () => {

  // ===================================================
  // STATE
  // ===================================================

  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showPopup, setShowPopup] = useState(false);


  // ===================================================
  // GET ALL
  // ===================================================

  const loadDepartments = async () => {

    try {

      setLoading(true);

      setError("");

      const data = await getAllDepartment();

      setDepartments(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      setError(
        err.message ||
        "Failed to load departments."
      );

      setShowPopup(true);

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // USE EFFECT
  // ===================================================

  useEffect(() => {

    loadDepartments();

  }, []);


  return (

    <div className="department-list-page">

      {/* =================================================
          ERROR POPUP
      ================================================= */}

      {showPopup && error && (

        <div className="department-list-popup">

          <div className="department-list-popup-icon">
            ✕
          </div>

          <div>
            {error}
          </div>

          <button
            onClick={() => setShowPopup(false)}
          >
            ×
          </button>

        </div>

      )}


      <div className="department-list-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="department-list-header">

          <div>

            <h1>All Departments</h1>

            <p>
              View all departments available in the system.
            </p>

          </div>


          <button
            className="department-refresh-btn"
            onClick={loadDepartments}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (

          <div className="department-loading">
            Loading departments...
          </div>

        ) : departments.length === 0 ? (

          <div className="department-empty">
            No departments found.
          </div>

        ) : (

          <div className="department-table-wrapper">

            <table className="department-table">

              <thead>

                <tr>

                  <th>S.No.</th>

                  <th>ID</th>

                  <th>Department Code</th>

                  <th>Department Name</th>

                  <th>Description</th>

                  <th>Display Order</th>

                  <th>Status</th>

                  <th>Created By</th>

                  <th>Created Date</th>

                  <th>Updated By</th>

                  <th>Updated Date</th>

                </tr>

              </thead>


              <tbody>

                {departments.map(
                  (department, index) => (

                    <tr
                      key={
                        department.id ??
                        department.Id ??
                        index
                      }
                    >

                      <td>
                        {index + 1}
                      </td>

                      <td>
                        {department.id ??
                          department.Id}
                      </td>

                      <td className="department-code">
                        {department.departmentCode ??
                          department.DepartmentCode}
                      </td>

                      <td className="department-name">
                        {department.departmentName ??
                          department.DepartmentName}
                      </td>

                      <td>
                        {department.description ??
                          department.Description ??
                          "-"}
                      </td>

                      <td>
                        {department.displayOrder ??
                          department.DisplayOrder}
                      </td>

                      <td>

                        {(department.isActive ??
                          department.IsActive) ? (

                          <span className="department-status active">
                            Active
                          </span>

                        ) : (

                          <span className="department-status inactive">
                            Inactive
                          </span>

                        )}

                      </td>

                      <td>
                        {department.createdBy ??
                          department.CreatedBy ??
                          "-"}
                      </td>

                      <td>
                        {department.createdDate ??
                          department.CreatedDate
                          ? new Date(
                              department.createdDate ??
                              department.CreatedDate
                            ).toLocaleString()
                          : "-"}
                      </td>

                      <td>
                        {department.updatedBy ??
                          department.UpdatedBy ??
                          "-"}
                      </td>

                      <td>
                        {department.updatedDate ??
                          department.UpdatedDate
                          ? new Date(
                              department.updatedDate ??
                              department.UpdatedDate
                            ).toLocaleString()
                          : "-"}
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


export default GetAllDepartment;