// =====================================================
// CREATE DEPARTMENT PAGE
// =====================================================

import { useState } from "react";

import { createDepartment } from "../../Services/departmentService";

import "./CreateDepartment.css";


const CreateDepartment = () => {

  // ===================================================
  // FORM STATE
  // ===================================================

  const [formData, setFormData] = useState({
    DepartmentCode: "",
    DepartmentName: "",
    Description: "",
    DisplayOrder: 1,
  });


  // ===================================================
  // MESSAGE STATE
  // ===================================================

  const [message, setMessage] = useState("");

  const [messageType, setMessageType] = useState("");


  // ===================================================
  // LOADING
  // ===================================================

  const [loading, setLoading] = useState(false);


  // ===================================================
  // POPUP
  // ===================================================

  const [showPopup, setShowPopup] = useState(false);


  // ===================================================
  // HANDLE INPUT
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
  // SUBMIT
  // ===================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setMessage("");
    setMessageType("");

    // -----------------------------------------------
    // VALIDATION
    // -----------------------------------------------

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


      await createDepartment({
        DepartmentCode:
          formData.DepartmentCode.trim(),

        DepartmentName:
          formData.DepartmentName.trim(),

        Description:
          formData.Description.trim() || null,

        DisplayOrder:
          Number(formData.DisplayOrder),
      });


      showMessage(
        "success",
        "Department created successfully."
      );


      // ---------------------------------------------
      // RESET FORM
      // ---------------------------------------------

      setFormData({
        DepartmentCode: "",
        DepartmentName: "",
        Description: "",
        DisplayOrder: 1,
      });

    } catch (error) {

      showMessage(
        "error",
        error.message ||
          "Failed to create department."
      );

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // RESET
  // ===================================================

  const handleReset = () => {

    setFormData({
      DepartmentCode: "",
      DepartmentName: "",
      Description: "",
      DisplayOrder: 1,
    });

    setMessage("");
    setMessageType("");

  };


  return (

    <div className="department-create-page">

      {/* =================================================
          POPUP
      ================================================= */}

      {showPopup && (

        <div
          className={`department-popup ${
            messageType === "success"
              ? "department-popup-success"
              : "department-popup-error"
          }`}
        >

          <div className="department-popup-icon">

            {messageType === "success"
              ? "✓"
              : "✕"}

          </div>

          <div className="department-popup-message">
            {message}
          </div>

          <button
            type="button"
            onClick={() => setShowPopup(false)}
          >
            ×
          </button>

        </div>

      )}


      <div className="department-create-container">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="department-page-header">

          <h1>Create Department</h1>

          <p>
            Add a new department to the system.
          </p>

        </div>


        {/* =================================================
            FORM
        ================================================= */}

        <form
          className="department-create-form"
          onSubmit={handleSubmit}
        >

          {/* Department Code */}

          <div className="department-form-group">

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
              placeholder="Enter department code"
            />

          </div>


          {/* Department Name */}

          <div className="department-form-group">

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
              placeholder="Enter department name"
            />

          </div>


          {/* Description */}

          <div className="department-form-group department-full-width">

            <label>
              Description
            </label>

            <textarea
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              maxLength={500}
              rows={5}
              placeholder="Enter department description"
            />

          </div>


          {/* Display Order */}

          <div className="department-form-group">

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
              placeholder="Enter display order"
            />

          </div>


          {/* =================================================
              BUTTONS
          ================================================= */}

          <div className="department-form-buttons">

            <button
              type="submit"
              className="department-btn department-btn-primary"
              disabled={loading}
            >

              {loading
                ? "Creating..."
                : "Create Department"}

            </button>


            <button
              type="button"
              className="department-btn department-btn-secondary"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>

          </div>

        </form>


        {/* =================================================
            NORMAL MESSAGE
        ================================================= */}

        {message && (

          <div
            className={`department-normal-message ${
              messageType === "success"
                ? "success"
                : "error"
            }`}
          >
            {message}
          </div>

        )}

      </div>

    </div>

  );

};


export default CreateDepartment;