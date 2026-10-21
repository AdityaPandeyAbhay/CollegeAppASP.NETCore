// =====================================================
// GET DEPARTMENT BY CODE
// =====================================================

import { useState } from "react";

import {
  getDepartmentByCode,
} from "../../Services/departmentService";

import "./GetDepartmentByCode.css";


const GetDepartmentByCode = () => {

  const [code, setCode] = useState("");

  const [department, setDepartment] = useState(null);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [showPopup, setShowPopup] = useState(false);


  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setDepartment(null);
    setMessage("");
    setMessageType("");

    if (!code.trim()) {

      setMessageType("error");
      setMessage("Department code is required.");
      setShowPopup(true);

      return;

    }


    try {

      setLoading(true);

      const data =
        await getDepartmentByCode(
          code.trim()
        );

      setDepartment(data);

    } catch (error) {

      setMessageType("error");

      setMessage(
        error.message ||
        "Department not found."
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

    setCode("");

    setDepartment(null);

    setMessage("");

    setMessageType("");

  };


  return (

    <div className="department-code-page">

      {/* =================================================
          POPUP
      ================================================= */}

      {showPopup && (

        <div className="department-code-popup">

          <div className="department-code-popup-icon">
            ✕
          </div>

          <div className="department-code-popup-text">
            {message}
          </div>

          <button
            onClick={() => setShowPopup(false)}
          >
            ×
          </button>

        </div>

      )}


      <div className="department-code-container">

        <div className="department-code-header">

          <h1>Get Department By Code</h1>

          <p>
            Search a department using its department code.
          </p>

        </div>


        {/* =================================================
            SEARCH FORM
        ================================================= */}

        <form
          className="department-code-search"
          onSubmit={handleSearch}
        >

          <div className="department-code-input-group">

            <label>
              Department Code
            </label>

            <input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value)
              }
              placeholder="Enter department code"
              maxLength={20}
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
            className="department-code-reset"
            onClick={handleReset}
          >
            Reset
          </button>

        </form>


        {/* =================================================
            RESULT
        ================================================= */}

        {department && (

          <div className="department-code-result">

            <h2>Department Details</h2>

            <div className="department-code-grid">

              <div>
                <label>ID</label>
                <p>
                  {department.id ??
                    department.Id}
                </p>
              </div>

              <div>
                <label>Department Code</label>
                <p>
                  {department.departmentCode ??
                    department.DepartmentCode}
                </p>
              </div>

              <div>
                <label>Department Name</label>
                <p>
                  {department.departmentName ??
                    department.DepartmentName}
                </p>
              </div>

              <div>
                <label>Display Order</label>
                <p>
                  {department.displayOrder ??
                    department.DisplayOrder}
                </p>
              </div>

              <div className="department-code-full">
                <label>Description</label>
                <p>
                  {department.description ??
                    department.Description ??
                    "-"}
                </p>
              </div>

              <div>
                <label>Status</label>
                <p>
                  {(department.isActive ??
                    department.IsActive)
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>

              <div>
                <label>Created By</label>
                <p>
                  {department.createdBy ??
                    department.CreatedBy ??
                    "-"}
                </p>
              </div>

              <div>
                <label>Created Date</label>
                <p>
                  {department.createdDate ??
                    department.CreatedDate
                    ? new Date(
                        department.createdDate ??
                        department.CreatedDate
                      ).toLocaleString()
                    : "-"}
                </p>
              </div>

              <div>
                <label>Updated By</label>
                <p>
                  {department.updatedBy ??
                    department.UpdatedBy ??
                    "-"}
                </p>
              </div>

              <div>
                <label>Updated Date</label>
                <p>
                  {department.updatedDate ??
                    department.UpdatedDate
                    ? new Date(
                        department.updatedDate ??
                        department.UpdatedDate
                      ).toLocaleString()
                    : "-"}
                </p>
              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

};


export default GetDepartmentByCode;