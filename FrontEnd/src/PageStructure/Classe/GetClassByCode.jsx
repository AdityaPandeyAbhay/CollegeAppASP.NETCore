// =====================================================
// GET CLASS BY CODE
// =====================================================

import { useState } from "react";

import {
  getClassByCode,
  addDepartmentNames,
} from "../../Services/classService";

import "./GetClassByCode.css";

const GetClassByCode = () => {

  const [code, setCode] =
    useState("");

  const [classData, setClassData] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setError("");
    setClassData(null);

    if (!code.trim()) {

      setError(
        "Please enter class code."
      );

      return;

    }

    try {

      setLoading(true);

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

      setLoading(false);

    }

  };

  return (

    <div className="get-class-code-page">

      <div className="get-class-code-container">

        <div className="get-class-code-header">

          <h1>
            Get Class By Code
          </h1>

          <p>
            Search a class using its class code
          </p>

        </div>

        <form
          className="get-class-code-search"
          onSubmit={handleSearch}
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
            disabled={loading}
          >
            {loading
              ? "Searching..."
              : "Search"}
          </button>

        </form>

        {error && (
          <div className="get-class-code-error">
            {error}
          </div>
        )}

        {classData && (

          <div className="get-class-code-card">

            <div className="get-class-code-card-header">

              <h2>
                Class Details
              </h2>

              <span
                className={
                  classData.IsActive
                    ? "get-class-code-status active"
                    : "get-class-code-status inactive"
                }
              >
                {classData.IsActive
                  ? "Active"
                  : "Inactive"}
              </span>

            </div>

            <div className="get-class-code-grid">

              <div className="get-class-code-item">
                <label>Class Code</label>
                <p>{classData.ClassCode || "-"}</p>
              </div>

              <div className="get-class-code-item">
                <label>Class Name</label>
                <p>{classData.ClassName || "-"}</p>
              </div>

              <div className="get-class-code-item">
                <label>Department</label>
                <p>
                  {classData.DepartmentName || "-"}
                </p>
              </div>

              <div className="get-class-code-item">
                <label>Display Order</label>
                <p>
                  {classData.DisplayOrder ?? 0}
                </p>
              </div>

              <div className="get-class-code-item full">
                <label>Description</label>
                <p>
                  {classData.Description || "-"}
                </p>
              </div>

              <div className="get-class-code-item">
                <label>Created By</label>
                <p>
                  {classData.CreatedBy || "-"}
                </p>
              </div>

              <div className="get-class-code-item">
                <label>Updated By</label>
                <p>
                  {classData.UpdatedBy || "-"}
                </p>
              </div>

            </div>

          </div>

        )}

      </div>

    </div>

  );

};

export default GetClassByCode;