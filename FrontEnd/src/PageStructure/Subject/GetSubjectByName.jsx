
// =====================================================
// GET SUBJECT BY NAME
// =====================================================

import { useState } from "react";

import {
  getSubjectByName,
} from "../../Services/subjectService";

import {
  getDepartmentDropdown,
} from "../../Services/departmentService";

import "./GetSubjectByName.css";


const GetSubjectByName = () => {

  const [name, setName] = useState("");

  const [subjects, setSubjects] = useState([]);

  const [departments, setDepartments] = useState({});

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setSubjects([]);

    setDepartments({});

    setError("");


    // =================================================
    // VALIDATION
    // =================================================

    if (!name.trim()) {

      setError(
        "Subject name is required."
      );

      return;

    }


    try {

      setLoading(true);


      // ===============================================
      // GET SUBJECTS
      // ===============================================

      const data =
        await getSubjectByName(
          name.trim()
        );


      const subjectList =
        Array.isArray(data)
          ? data
          : data
            ? [data]
            : [];


      setSubjects(subjectList);


      // ===============================================
      // GET DEPARTMENTS
      // ===============================================

      const departmentData =
        await getDepartmentDropdown();


      // ===============================================
      // CREATE DEPARTMENT MAP
      // ===============================================

      const departmentMap = {};


      if (Array.isArray(departmentData)) {

        departmentData.forEach(
          (department) => {

            const departmentId =
              department.id ??
              department.Id ??
              department.code ??
              department.Code;


            const departmentName =
              department.text ??
              department.Text ??
              department.name ??
              department.Name ??
              department.departmentName ??
              department.DepartmentName ??
              department.code ??
              department.Code ??
              "-";


            if (
              departmentId !== null &&
              departmentId !== undefined
            ) {

              departmentMap[
                String(departmentId)
              ] = departmentName;

            }

          }
        );

      }


      setDepartments(departmentMap);

    } catch (err) {

      setError(
        err.message ||
        "Failed to search subjects."
      );

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // GET DEPARTMENT NAME
  // ===================================================

  const getDepartmentName = (subject) => {

    // ===============================================
    // FIRST: CHECK DIRECT DEPARTMENT NAME
    // ===============================================

    const directName =
      subject.departmentName ??
      subject.DepartmentName;


    if (directName) {

      return directName;

    }


    // ===============================================
    // GET DEPARTMENT ID
    // ===============================================

    const departmentId =
      subject.departmentId ??
      subject.DepartmentId;


    if (
      departmentId !== null &&
      departmentId !== undefined
    ) {

      return (
        departments[String(departmentId)] ??
        "-"
      );

    }


    return "-";

  };


  // ===================================================
  // CLEAR
  // ===================================================

  const handleClear = () => {

    setName("");

    setSubjects([]);

    setDepartments({});

    setError("");

  };


  // ===================================================
  // UI
  // ===================================================

  return (

    <div className="subject-name-page">

      <div className="subject-name-container">


        {/* ============================================
            HEADER
        ============================================ */}

        <div className="subject-name-header">

          <h2>
            Get Subject By Name
          </h2>

          <p>
            Search subjects using subject name.
          </p>

        </div>


        {/* ============================================
            SEARCH FORM
        ============================================ */}

        <form
          className="subject-name-search"
          onSubmit={handleSearch}
        >

          <div className="subject-name-input-group">

            <label>
              Subject Name
            </label>

            <input
              type="text"
              value={name}
              onChange={(e) =>
                setName(e.target.value)
              }
              placeholder="Enter subject name"
            />

          </div>


          {/* SEARCH */}

          <button
            type="submit"
            disabled={loading}
          >

            {loading
              ? "Searching..."
              : "Search"}

          </button>


          {/* CLEAR */}

          <button
            type="button"
            className="subject-name-clear"
            onClick={handleClear}
            disabled={loading}
          >

            Clear

          </button>

        </form>


        {/* ============================================
            ERROR
        ============================================ */}

        {error && (

          <div className="subject-name-error">

            {error}

          </div>

        )}


        {/* ============================================
            EMPTY
        ============================================ */}

        {!loading &&
          !error &&
          name &&
          subjects.length === 0 && (

            <div className="subject-name-empty">

              No subject records found.

            </div>

          )}


        {/* ============================================
            TABLE
        ============================================ */}

        {subjects.length > 0 && (

          <div className="subject-name-table-wrapper">

            <table className="subject-name-table">

              <thead>

                <tr>

                  <th>#</th>

                  <th>Department</th>

                  <th>Subject Code</th>

                  <th>Subject Name</th>

                  <th>Theory</th>

                  <th>Practical</th>

                  <th>Optional</th>

                  <th>Active</th>

                </tr>

              </thead>


              <tbody>

                {subjects.map(
                  (subject, index) => (

                    <tr
                      key={
                        subject.id ??
                        subject.Id ??
                        index
                      }
                    >

                      {/* # */}

                      <td>
                        {index + 1}
                      </td>


                      {/* Department */}

                      <td>

                        {getDepartmentName(
                          subject
                        )}

                      </td>


                      {/* Subject Code */}

                      <td>

                        {subject.subjectCode ??
                          subject.SubjectCode ??
                          "-"}

                      </td>


                      {/* Subject Name */}

                      <td>

                        {subject.subjectName ??
                          subject.SubjectName ??
                          "-"}

                      </td>


                      {/* Theory */}

                      <td>

                        {subject.theoryMarks ??
                          subject.TheoryMarks ??
                          0}

                      </td>


                      {/* Practical */}

                      <td>

                        {subject.practicalMarks ??
                          subject.PracticalMarks ??
                          0}

                      </td>


                      {/* Optional */}

                      <td>

                        {(subject.isOptional ??
                          subject.IsOptional)
                          ? "Yes"
                          : "No"}

                      </td>


                      {/* Active */}

                      <td>

                        {(subject.isActive ??
                          subject.IsActive)
                          ? "Active"
                          : "Inactive"}

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );

};


export default GetSubjectByName;

