// =====================================================
// GET CLASS BY NAME
// =====================================================

import { useState } from "react";

import {
  getClassByName,
  addDepartmentNames,
} from "../../Services/classService";

import "./GetClassByName.css";

const GetClassByName = () => {

  const [name, setName] =
    useState("");

  const [classes, setClasses] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [searched, setSearched] =
    useState(false);

  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setError("");
    setClasses([]);
    setSearched(false);

    if (!name.trim()) {

      setError(
        "Please enter class name."
      );

      return;

    }

    try {

      setLoading(true);

      const data =
        await getClassByName(
          name
        );
        const classesWithDepartment =
  await addDepartmentNames(data);

      setClasses(classesWithDepartment);

      setSearched(true);

    } catch (err) {

      setError(
        err.message ||
        "Failed to search classes."
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="get-class-name-page">

      <div className="get-class-name-container">

        <div className="get-class-name-header">

          <h1>
            Get Class By Name
          </h1>

          <p>
            Search classes using class name
          </p>

        </div>

        <form
          className="get-class-name-search"
          onSubmit={handleSearch}
        >

          <input
            type="text"
            value={name}
            onChange={(e) =>
              setName(e.target.value)
            }
            placeholder="Enter class name"
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
          <div className="get-class-name-error">
            {error}
          </div>
        )}

        {searched &&
          classes.length === 0 &&
          !error && (

            <div className="get-class-name-empty">
              No classes found.
            </div>

          )}

        {classes.length > 0 && (

          <div className="get-class-name-results">

            <div className="get-class-name-result-header">

              <h2>
                Search Results
              </h2>

              <span>
                {classes.length} result
                {classes.length !== 1
                  ? "s"
                  : ""}
              </span>

            </div>

            <div className="get-class-name-table-wrapper">

              <table className="get-class-name-table">

                <thead>

                  <tr>

                    <th>#</th>

                    <th>
                      Class Code
                    </th>

                    <th>
                      Class Name
                    </th>

                    <th>
                      Department
                    </th>

                    <th>
                      Display Order
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {classes.map(
                    (item, index) => (

                      <tr
                        key={
                          item.Id ??
                          index
                        }
                      >

                        <td>
                          {index + 1}
                        </td>

                        <td>
                          <span className="get-class-name-code">
                            {item.ClassCode || "-"}
                          </span>
                        </td>

                        <td>
                          <strong>
                            {item.ClassName || "-"}
                          </strong>
                        </td>

                        <td>
                          {item.DepartmentName || "-"}
                        </td>

                        <td>
                          {item.DisplayOrder ?? 0}
                        </td>

                        <td>

                          <span
                            className={
                              item.IsActive
                                ? "get-class-name-status active"
                                : "get-class-name-status inactive"
                            }
                          >
                            {item.IsActive
                              ? "Active"
                              : "Inactive"}
                          </span>

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

    </div>

  );

};

export default GetClassByName;