// =====================================================
// UPDATE DEPARTMENT PAGE
// =====================================================

import { useEffect, useState } from "react";

import {
  getDepartmentDropdown,
  updateDepartment,
} from "../../Services/departmentService";

import "./UpdateDepartment.css";


const UpdateDepartment = () => {

  // ===================================================
  // DROPDOWN
  // ===================================================

  const [departments, setDepartments] = useState([]);

  const [selectedId, setSelectedId] = useState("");


  // ===================================================
  // FORM
  // ===================================================

  const [formData, setFormData] = useState({
    DepartmentCode: "",
    DepartmentName: "",
    Description: "",
    DisplayOrder: 1,
    IsActive: true,
  });


  // ===================================================
  // STATE
  // ===================================================

  const [loading, setLoading] = useState(false);

  const [loadingDropdown, setLoadingDropdown] = useState(true);

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");

  const [showPopup, setShowPopup] = useState(false);


  // ===================================================
  // LOAD DROPDOWN
  // ===================================================

  const loadDropdown = async () => {

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

      setMessageType("error");

      setMessage(
        error.message ||
        "Failed to load departments."
      );

      setShowPopup(true);

    } finally {

      setLoadingDropdown(false);

    }

  };


  // ===================================================
  // INITIAL LOAD
  // ===================================================

  useEffect(() => {

    loadDropdown();

  }, []);


  // ===================================================
  // SELECT DEPARTMENT
  // ===================================================

  const handleDepartmentSelect = (e) => {

    const id = e.target.value;

    setSelectedId(id);

    setMessage("");

    if (!id) {

      setFormData({
        DepartmentCode: "",
        DepartmentName: "",
        Description: "",
        DisplayOrder: 1,
        IsActive: true,
      });

      return;

    }


    const selected =
      departments.find(
        (item) =>
          String(
            item.id ??
            item.Id
          ) === String(id)
      );


    if (selected) {

      setFormData({
        DepartmentCode:
          selected.code ??
          selected.Code ??
          selected.departmentCode ??
          selected.DepartmentCode ??
          "",

        DepartmentName:
          selected.text ??
          selected.Text ??
          selected.departmentName ??
          selected.DepartmentName ??
          "",

        Description:
          selected.description ??
          selected.Description ??
          "",

        DisplayOrder:
          selected.displayOrder ??
          selected.DisplayOrder ??
          1,

        IsActive:
          selected.isActive ??
          selected.IsActive ??
          true,
      });

    }

  };


  // ===================================================
  // INPUT
  // ===================================================

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]:
        name === "DisplayOrder"
          ? value
          : value,
    }));

  };


  // ===================================================
  // ACTIVE CHECKBOX
  // ===================================================

  const handleActiveChange = (e) => {

    setFormData((previous) => ({
      ...previous,
      IsActive: e.target.checked,
    }));

  };


  // ===================================================
  // MESSAGE
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
  // UPDATE
  // ===================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");

    if (!selectedId) {

      showMessage(
        "error",
        "Please select a department."
      );

      return;

    }


    if (!formData.DepartmentCode.trim()) {

      showMessage(
        "error",
        "Department Code is required."
      );

      return;

    }


    if (!formData.DepartmentName.trim()) {

      showMessage(
        "error",
        "Department Name is required."
      );

      return;

    }


    if (
      !formData.DisplayOrder ||
      Number(formData.DisplayOrder) < 1
    ) {

      showMessage(
        "error",
        "Display Order must be greater than 0."
      );

      return;

    }


    try {

      setLoading(true);


      await updateDepartment(
        selectedId,
        {
          DepartmentCode:
            formData.DepartmentCode.trim(),

          DepartmentName:
            formData.DepartmentName.trim(),

          Description:
            formData.Description.trim() || null,

          DisplayOrder:
            Number(formData.DisplayOrder),

          IsActive:
            formData.IsActive,
        }
      );


      showMessage(
        "success",
        "Department updated successfully."
      );


      // Refresh dropdown

      await loadDropdown();

    } catch (error) {

      showMessage(
        "error",
        error.message ||
        "Failed to update department."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="department-update-page">

      {/* =================================================
          POPUP
      ================================================= */}

      {showPopup && (

        <div
          className={`department-update-popup ${
            messageType === "success"
              ? "success"
              : "error"
          }`}
        >

          <div className="department-update-popup-icon">

            {messageType === "success"
              ? "✓"
              : "✕"}

          </div>

          <div className="department-update-popup-text">
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


      <div className="department-update-container">

        <div className="department-update-header">

          <h1>Update Department</h1>

          <p>
            Select a department and update its details.
          </p>

        </div>


        {/* =================================================
            DEPARTMENT SELECT
        ================================================= */}

        <div className="department-update-select-group">

          <label>
            Select Department
          </label>

          <select
            value={selectedId}
            onChange={handleDepartmentSelect}
            disabled={loadingDropdown}
          >

            <option value="">
              {loadingDropdown
                ? "Loading departments..."
                : "-- Select Department --"}
            </option>

            {departments.map(
              (department) => (

                <option
                  key={
                    department.id ??
                    department.Id
                  }
                  value={
                    department.id ??
                    department.Id
                  }
                >

                  {department.text ??
                    department.Text ??
                    department.departmentName ??
                    department.DepartmentName}

                  {" ("}

                  {department.code ??
                    department.Code ??
                    department.departmentCode ??
                    department.DepartmentCode}

                  {")"}

                </option>

              )
            )}

          </select>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        {selectedId && (

          <form
            className="department-update-form"
            onSubmit={handleSubmit}
          >

            <div className="department-update-form-group">

              <label>
                Department Code
                <span>*</span>
              </label>

              <input
                type="text"
                name="DepartmentCode"
                value={formData.DepartmentCode}
                onChange={handleChange}
                maxLength={20}
              />

            </div>


            <div className="department-update-form-group">

              <label>
                Department Name
                <span>*</span>
              </label>

              <input
                type="text"
                name="DepartmentName"
                value={formData.DepartmentName}
                onChange={handleChange}
                maxLength={100}
              />

            </div>


            <div className="department-update-form-group department-update-full">

              <label>
                Description
              </label>

              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                maxLength={500}
                rows={5}
              />

            </div>


            <div className="department-update-form-group">

              <label>
                Display Order
                <span>*</span>
              </label>

              <input
                type="number"
                name="DisplayOrder"
                value={formData.DisplayOrder}
                onChange={handleChange}
                min="1"
              />

            </div>


            <div className="department-update-active-group">

              <label>
                Status
              </label>

              <div className="department-update-checkbox">

                <input
                  type="checkbox"
                  checked={formData.IsActive}
                  onChange={handleActiveChange}
                />

                <span>
                  Active
                </span>

              </div>

            </div>


            {/* =================================================
                BUTTON
            ================================================= */}

            <div className="department-update-buttons">

              <button
                type="submit"
                disabled={loading}
                className="department-update-save"
              >
                {loading
                  ? "Updating..."
                  : "Update Department"}
              </button>


              <button
                type="button"
                className="department-update-cancel"
                onClick={() => {
                  setSelectedId("");
                  setMessage("");
                }}
              >
                Cancel
              </button>

            </div>

          </form>

        )}

      </div>

    </div>

  );

};


export default UpdateDepartment;