// =====================================================
// CREATE CLASS
// =====================================================

import { useEffect, useState } from "react";

import {
  createClass,
} from "../../Services/classService";

import {
  getDepartmentDropdown,
} from "../../Services/departmentService";

import "./CreateClass.css";

const CreateClass = () => {

  const [departments, setDepartments] =
    useState([]);

  const [formData, setFormData] =
    useState({
      DepartmentId: "",
      ClassCode: "",
      ClassName: "",
      Description: "",
      DisplayOrder: 1,
      IsActive: true,
    });

  const [loading, setLoading] =
    useState(false);

  const [departmentLoading, setDepartmentLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ===================================================
  // LOAD DEPARTMENTS
  // ===================================================

  useEffect(() => {

    const loadDepartments = async () => {

      try {

        setDepartmentLoading(true);
        setError("");

        const data =
          await getDepartmentDropdown();

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

      } finally {

        setDepartmentLoading(false);

      }

    };

    loadDepartments();

  }, []);

  // ===================================================
  // INPUT CHANGE
  // ===================================================

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;

    setFormData(
      (previous) => ({
        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : value,
      })
    );

  };

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    try {

      setLoading(true);

      await createClass(
        formData
      );

      setSuccess(
        "Class created successfully."
      );

      setFormData({
        DepartmentId: "",
        ClassCode: "",
        ClassName: "",
        Description: "",
        DisplayOrder: 1,
        IsActive: true,
      });

    } catch (err) {

      setError(
        err.message ||
        "Failed to create class."
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
      DepartmentId: "",
      ClassCode: "",
      ClassName: "",
      Description: "",
      DisplayOrder: 1,
      IsActive: true,
    });

    setError("");
    setSuccess("");

  };

  return (

    <div className="create-class-page">

      <div className="create-class-container">

        <div className="create-class-header">

          <h1>Create Class</h1>

          <p>
            Add a new school class
          </p>

        </div>

        {error && (
          <div className="create-class-error">
            {error}
          </div>
        )}

        {success && (
          <div className="create-class-success">
            {success}
          </div>
        )}

        <form
          className="create-class-form"
          onSubmit={handleSubmit}
        >

          {/* DEPARTMENT */}

          <div className="create-class-field">

            <label>
              Department
              <span>*</span>
            </label>

            <select
              name="DepartmentId"
              value={formData.DepartmentId}
              onChange={handleChange}
              disabled={departmentLoading}
              required
            >

              <option value="">
                {departmentLoading
                  ? "Loading departments..."
                  : "Select Department"}
              </option>

              {departments.map(
                (department) => (

                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.text}
                    {department.code
                      ? ` (${department.code})`
                      : ""}
                  </option>

                )
              )}

            </select>

          </div>

          {/* CLASS CODE */}

          <div className="create-class-field">

            <label>
              Class Code
              <span>*</span>
            </label>

            <input
              type="text"
              name="ClassCode"
              value={formData.ClassCode}
              onChange={handleChange}
              placeholder="Enter class code"
              maxLength={20}
              required
            />

          </div>

          {/* CLASS NAME */}

          <div className="create-class-field">

            <label>
              Class Name
              <span>*</span>
            </label>

            <input
              type="text"
              name="ClassName"
              value={formData.ClassName}
              onChange={handleChange}
              placeholder="Enter class name"
              maxLength={100}
              required
            />

          </div>

          {/* DESCRIPTION */}

          <div className="create-class-field create-class-full">

            <label>
              Description
            </label>

            <textarea
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              placeholder="Enter class description"
              rows="4"
            />

          </div>

          {/* DISPLAY ORDER */}

          <div className="create-class-field">

            <label>
              Display Order
            </label>

            <input
              type="number"
              name="DisplayOrder"
              value={formData.DisplayOrder}
              onChange={handleChange}
              min="0"
            />

          </div>

          {/* ACTIVE */}

          <div className="create-class-active">

            <label>

              <input
                type="checkbox"
                name="IsActive"
                checked={formData.IsActive}
                onChange={handleChange}
              />

              <span>
                Active
              </span>

            </label>

          </div>

          {/* BUTTONS */}

          <div className="create-class-actions">

            <button
              type="submit"
              className="create-class-submit"
              disabled={loading}
            >

              {loading
                ? "Creating..."
                : "Create Class"}

            </button>

            <button
              type="button"
              className="create-class-reset"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>

          </div>

        </form>

      </div>

    </div>

  );

};

export default CreateClass;