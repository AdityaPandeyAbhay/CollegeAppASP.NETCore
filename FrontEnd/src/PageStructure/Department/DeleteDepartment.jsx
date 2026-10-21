// =====================================================
// DELETE DEPARTMENT PAGE
// =====================================================

import { useEffect, useState } from "react";

import {
  getDepartmentDropdown,
  deleteDepartment,
} from "../../Services/departmentService";

import "./DeleteDepartment.css";


const DeleteDepartment = () => {

  // ===================================================
  // STATE
  // ===================================================

  const [departments, setDepartments] = useState([]);

  const [selectedCode, setSelectedCode] = useState("");

  const [selectedDepartment, setSelectedDepartment] =
    useState(null);

  const [loading, setLoading] = useState(false);

  const [loadingDropdown, setLoadingDropdown] =
    useState(true);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [showPopup, setShowPopup] = useState(false);


  // ===================================================
  // LOAD DROPDOWN
  // ===================================================

  const loadDepartments = async () => {

    try {

      setLoadingDropdown(true);

      const data =
        await getDepartmentDropdown();

      setDepartments(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      showMessage(
        "error",
        error.message ||
        "Failed to load departments."
      );

    } finally {

      setLoadingDropdown(false);

    }

  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {

    loadDepartments();

  }, []);


  // ===================================================
  // SHOW MESSAGE
  // ===================================================

  const showMessage = (type, text) => {

    setMessageType(type);

    setMessage(text);

    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
    }, 3000);

  };


  // ===================================================
  // SELECT
  // ===================================================

  const handleSelect = (e) => {

    const code = e.target.value;

    setSelectedCode(code);

    setMessage("");

    if (!code) {

      setSelectedDepartment(null);

      return;

    }


    const department =
      departments.find(
        (item) =>
          String(
            item.code ??
            item.Code ??
            item.departmentCode ??
            item.DepartmentCode
          ) === String(code)
      );


    setSelectedDepartment(
      department || null
    );

  };


  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = async () => {

    if (!selectedCode) {

      showMessage(
        "error",
        "Please select a department."
      );

      return;

    }


    const departmentName =
      selectedDepartment?.text ??
      selectedDepartment?.Text ??
      selectedDepartment?.departmentName ??
      selectedDepartment?.DepartmentName ??
      "this department";


    const confirmed = window.confirm(
      `Are you sure you want to delete ${departmentName}?`
    );


    if (!confirmed) {

      return;

    }


    try {

      setLoading(true);

      await deleteDepartment(
        selectedCode
      );


      showMessage(
        "success",
        "Department deleted successfully."
      );


      setSelectedCode("");

      setSelectedDepartment(null);


      // Reload dropdown

      await loadDepartments();

    } catch (error) {

      showMessage(
        "error",
        error.message ||
        "Failed to delete department."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="department-delete-page">

      {/* =================================================
          POPUP
      ================================================= */}

      {showPopup && (

        <div
          className={`department-delete-popup ${
            messageType === "success"
              ? "success"
              : "error"
          }`}
        >

          <div className="department-delete-popup-icon">

            {messageType === "success"
              ? "✓"
              : "✕"}

          </div>

          <div className="department-delete-popup-text">
            {message}
          </div>

          <button
            onClick={() =>
              setShowPopup(false)
            }
          >
            ×
          </button>

        </div>

      )}


      <div className="department-delete-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="department-delete-header">

          <h1>Delete Department</h1>

          <p>
            Select a department and permanently delete it.
          </p>

        </div>


        {/* =================================================
            SELECT
        ================================================= */}

        <div className="department-delete-select-group">

          <label>
            Select Department
          </label>

          <select
            value={selectedCode}
            onChange={handleSelect}
            disabled={
              loadingDropdown ||
              loading
            }
          >

            <option value="">

              {loadingDropdown
                ? "Loading departments..."
                : "-- Select Department --"}

            </option>

            {departments.map(
              (department) => {

                const code =
                  department.code ??
                  department.Code ??
                  department.departmentCode ??
                  department.DepartmentCode;

                const text =
                  department.text ??
                  department.Text ??
                  department.departmentName ??
                  department.DepartmentName;

                return (

                  <option
                    key={code}
                    value={code}
                  >
                    {text} ({code})
                  </option>

                );

              }
            )}

          </select>

        </div>


        {/* =================================================
            DETAILS
        ================================================= */}

        {selectedDepartment && (

          <div className="department-delete-details">

            <div className="department-delete-warning">

              <strong>
                Warning:
              </strong>

              {" "}
              You are about to delete this department.
              This action cannot be undone.

            </div>


            <div className="department-delete-grid">

              <div>

                <label>
                  Department Code
                </label>

                <p>
                  {selectedDepartment.code ??
                    selectedDepartment.Code ??
                    selectedDepartment.departmentCode ??
                    selectedDepartment.DepartmentCode}
                </p>

              </div>


              <div>

                <label>
                  Department Name
                </label>

                <p>
                  {selectedDepartment.text ??
                    selectedDepartment.Text ??
                    selectedDepartment.departmentName ??
                    selectedDepartment.DepartmentName}
                </p>

              </div>

            </div>


            <button
              type="button"
              className="department-delete-button"
              onClick={handleDelete}
              disabled={loading}
            >

              {loading
                ? "Deleting..."
                : "Delete Department"}

            </button>

          </div>

        )}

      </div>

    </div>

  );

};


export default DeleteDepartment;