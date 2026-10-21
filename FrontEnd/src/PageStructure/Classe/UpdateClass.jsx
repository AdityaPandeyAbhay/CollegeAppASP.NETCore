// =====================================================
// UPDATE CLASS
// =====================================================

import { useEffect, useState } from "react";


import {
  getClassByCode,
  updateClass,
} from "../../Services/classService";

import {
  getDepartmentDropdown,
} from "../../Services/departmentService";
import "./UpdateClass.css";

const UpdateClass = () => {

  const [code, setCode] =
    useState("");

  const [classId, setClassId] =
    useState(null);

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

  const [searchLoading, setSearchLoading] =
    useState(false);

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
  // FIND CLASS
  // ===================================================

  const handleFind = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    if (!code.trim()) {

      setError(
        "Please enter class code."
      );

      return;

    }

    try {

      setSearchLoading(true);

      const data =
        await getClassByCode(
          code
        );

      if (!data) {

        throw new Error(
          "Class not found."
        );

      }

      setClassId(
        data.Id
      );

      setFormData({

        DepartmentId:
          data.DepartmentId ?? "",

        ClassCode:
          data.ClassCode ?? "",

        ClassName:
          data.ClassName ?? "",

        Description:
          data.Description ?? "",

        DisplayOrder:
          data.DisplayOrder ?? 1,

        IsActive:
          data.IsActive ?? true,

      });

    } catch (err) {

      setError(
        err.message ||
        "Class not found."
      );

      setClassId(null);

    } finally {

      setSearchLoading(false);

    }

  };

  // ===================================================
  // CHANGE
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
  // UPDATE
  // ===================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");

    if (!classId) {

      setError(
        "Please search and load a class first."
      );

      return;

    }

    try {

      setLoading(true);

      await updateClass(
        classId,
        formData
      );

      setSuccess(
        "Class updated successfully."
      );

      setCode(
        formData.ClassCode
      );

    } catch (err) {

      setError(
        err.message ||
        "Failed to update class."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="update-class-page">

      <div className="update-class-container">

        <div className="update-class-header">

          <h1>
            Update Class
          </h1>

          <p>
            Search a class by code and update its details
          </p>

        </div>

        {/* SEARCH */}

        <form
          className="update-class-search"
          onSubmit={handleFind}
        >

          <input
            type="text"
            value={code}
            onChange={(e) =>
              setCode(e.target.value)
            }
            placeholder="Enter class code"
          />

          <button
            type="submit"
            disabled={searchLoading}
          >
            {searchLoading
              ? "Loading..."
              : "Find Class"}
          </button>

        </form>

        {error && (
          <div className="update-class-error">
            {error}
          </div>
        )}

        {success && (
          <div className="update-class-success">
            {success}
          </div>
        )}

        {/* FORM */}

        {classId && (

          <form
            className="update-class-form"
            onSubmit={handleSubmit}
          >

            {/* DEPARTMENT */}

            <div className="update-class-field">

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

            <div className="update-class-field">

              <label>
                Class Code
                <span>*</span>
              </label>

              <input
                type="text"
                name="ClassCode"
                value={formData.ClassCode}
                onChange={handleChange}
                maxLength={20}
                required
              />

            </div>

            {/* CLASS NAME */}

            <div className="update-class-field">

              <label>
                Class Name
                <span>*</span>
              </label>

              <input
                type="text"
                name="ClassName"
                value={formData.ClassName}
                onChange={handleChange}
                maxLength={100}
                required
              />

            </div>

            {/* DISPLAY ORDER */}

            <div className="update-class-field">

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

            {/* DESCRIPTION */}

            <div className="update-class-field update-class-full">

              <label>
                Description
              </label>

              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                rows="4"
              />

            </div>

            {/* ACTIVE */}

            <div className="update-class-active">

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

            {/* BUTTON */}

            <div className="update-class-actions">

              <button
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Updating..."
                  : "Update Class"}
              </button>

            </div>

          </form>

        )}

      </div>

    </div>

  );

};

export default UpdateClass;