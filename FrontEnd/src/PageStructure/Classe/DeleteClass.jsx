// =====================================================
// DELETE CLASS
// =====================================================

import { useState } from "react";

import {
  getClassByCode,
  deleteClass,
   addDepartmentNames,
} from "../../Services/classService";

import "./DeleteClass.css";

const DeleteClass = () => {

  const [code, setCode] =
    useState("");

  const [classData, setClassData] =
    useState(null);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [deleteLoading, setDeleteLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  // ===================================================
  // FIND CLASS
  // ===================================================

  const handleFind = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");
    setClassData(null);

    if (!code.trim()) {

      setError(
        "Please enter class code."
      );

      return;

    }

    try {

      setSearchLoading(true);

     const data = await getClassByCode(code);

const enrichedData =
  await addDepartmentNames([data]);

setClassData(enrichedData[0]);
    } catch (err) {

      setError(
        err.message ||
        "Class not found."
      );

    } finally {

      setSearchLoading(false);

    }

  };

  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = async () => {

    if (!classData) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete class "${classData.ClassName}" (${classData.ClassCode})?`
      );

    if (!confirmed) {
      return;
    }

    try {

      setDeleteLoading(true);

      setError("");
      setSuccess("");

      await deleteClass(
        classData.ClassCode
      );

      setSuccess(
        "Class deleted successfully."
      );

      setClassData(null);
      setCode("");

    } catch (err) {

      setError(
        err.message ||
        "Failed to delete class."
      );

    } finally {

      setDeleteLoading(false);

    }

  };

  return (

    <div className="delete-class-page">

      <div className="delete-class-container">

        <div className="delete-class-header">

          <h1>
            Delete Class
          </h1>

          <p>
            Search a class by code before deleting
          </p>

        </div>

        {/* SEARCH */}

        <form
          className="delete-class-search"
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
              ? "Searching..."
              : "Find Class"}
          </button>

        </form>

        {error && (
          <div className="delete-class-error">
            {error}
          </div>
        )}

        {success && (
          <div className="delete-class-success">
            {success}
          </div>
        )}

        {/* CLASS DETAILS */}

        {classData && (

          <div className="delete-class-card">

            <div className="delete-class-warning">
              ⚠ Please verify the class details before deleting.
            </div>

            <div className="delete-class-details">

              <div>
                <label>
                  Class Code
                </label>

                <p>
                  {classData.ClassCode || "-"}
                </p>
              </div>

              <div>
                <label>
                  Class Name
                </label>

                <p>
                  {classData.ClassName || "-"}
                </p>
              </div>

              <div>
                <label>
                  Department
                </label>

                <p>
                  {classData.DepartmentName || "-"}
                </p>
              </div>

              <div>
                <label>
                  Status
                </label>

                <p>
                  {classData.IsActive
                    ? "Active"
                    : "Inactive"}
                </p>
              </div>

              <div className="delete-class-description">

                <label>
                  Description
                </label>

                <p>
                  {classData.Description || "-"}
                </p>

              </div>

            </div>

            <button
              type="button"
              className="delete-class-button"
              onClick={handleDelete}
              disabled={deleteLoading}
            >
              {deleteLoading
                ? "Deleting..."
                : "Delete Class"}
            </button>

          </div>

        )}

      </div>

    </div>

  );

};

export default DeleteClass;