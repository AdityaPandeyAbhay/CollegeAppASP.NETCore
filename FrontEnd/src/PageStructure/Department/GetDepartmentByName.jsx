// =====================================================
// GET DEPARTMENT BY NAME
// =====================================================

import { useState } from "react";

import {
  getDepartmentByName,
} from "../../Services/departmentService";

import "./GetDepartmentByName.css";


const GetDepartmentByName = () => {

  const [name, setName] = useState("");

  const [departments, setDepartments] = useState([]);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [showPopup, setShowPopup] = useState(false);


  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setDepartments([]);

    setMessage("");

    if (!name.trim()) {

      setMessage(
        "Department name is required."
      );

      setShowPopup(true);

      return;

    }


    try {

      setLoading(true);

      const data =
        await getDepartmentByName(
          name.trim()
        );

      setDepartments(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      setMessage(
        error.message ||
        "No department found."
      );

      setShowPopup(true);

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // RESET
  // ===================================================

  const handleReset = () => {

    setName("");

    setDepartments([]);

    setMessage("");

  };


  return (

    <div className="department-name-page">

      {/* =================================================
          POPUP
      ================================================= */}

      {showPopup && (

        <div className="department-name-popup">

          <div className="department-name-popup-icon">
            ✕
          </div>

          <div className="department-name-popup-text">
            {message}
          </div>

          <button
            onClick={() => setShowPopup(false)}
          >
            ×
          </button>

        </div>

      )}


      <div className="department-name-container">

        <div className="department-name-header">

          <h1>Get Department By Name</h1>

          <p>
            Search departments using department name.
          </p>

        </div>


        {/* =================================================
            SEARCH
        ================================================= */}

        <form
          className="department-name-search"
          onSubmit={handleSearch}
        >

          <div className="department-name-input-group">

            <label>
              Department Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter department name"
            />

          </div>


          <button
            type="submit"
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>


          <button
            type="button"
            className="department-name-reset"
            onClick={handleReset}
          >
            Reset
          </button>

        </form>


        {/* =================================================
            RESULT
        ================================================= */}

        {!loading &&
          departments.length > 0 && (

            <div className="department-name-results">

              <h2>
                Search Results
              </h2>

              <div className="department-name-table-wrapper">

                <table className="department-name-table">

                  <thead>

                    <tr>

                      <th>S.No.</th>

                      <th>ID</th>

                      <th>Code</th>

                      <th>Department Name</th>

                      <th>Description</th>

                      <th>Display Order</th>

                      <th>Status</th>

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

                          <td className="department-name-code">
                            {department.departmentCode ??
                              department.DepartmentCode}
                          </td>

                          <td className="department-name-title">
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

                              <span className="department-name-active">
                                Active
                              </span>

                            ) : (

                              <span className="department-name-inactive">
                                Inactive
                              </span>

                            )}

                          </td>

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>

          )}


        {!loading &&
          name &&
          departments.length === 0 && (

            <div className="department-name-empty">
              No departments found.
            </div>

          )}

      </div>

    </div>

  );

};


export default GetDepartmentByName;