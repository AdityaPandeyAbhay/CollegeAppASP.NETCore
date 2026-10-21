
// =====================================================
// GET ALL SUBJECT
// =====================================================

import { useEffect, useState } from "react";

import {
  getAllSubject,
} from "../../Services/subjectService";

import {
  getDepartmentDropdown,
} from "../../Services/departmentService";

import "./GetAllSubject.css";

const GetAllSubject = () => {

  const [subjects, setSubjects] = useState([]);

  const [departments, setDepartments] = useState({});

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");


  // ===================================================
  // LOAD SUBJECTS + DEPARTMENTS
  // ===================================================

  const loadSubjects = async () => {

    try {

      setLoading(true);

      setError("");


      // ===============================================
      // GET SUBJECTS
      // ===============================================

      const subjectData = await getAllSubject();


      // ===============================================
      // GET DEPARTMENTS
      // ===============================================

      const departmentData =
        await getDepartmentDropdown();


      // ===============================================
      // CREATE DEPARTMENT ID -> NAME MAP
      // ===============================================

      const departmentMap = {};


      if (Array.isArray(departmentData)) {

        departmentData.forEach((department) => {

          const id =
            department.id ??
            department.Id ??
            department.code ??
            department.Code;


          const name =
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
            id !== null &&
            id !== undefined
          ) {

            departmentMap[String(id)] = name;

          }

        });

      }


      setDepartments(departmentMap);


      // ===============================================
      // SET SUBJECTS
      // ===============================================

      setSubjects(
        Array.isArray(subjectData)
          ? subjectData
          : []
      );

    }

    catch (err) {

      setError(
        err.message ||
        "Failed to load subjects."
      );

    }

    finally {

      setLoading(false);

    }

  };


  // ===================================================
  // LOAD ON PAGE OPEN
  // ===================================================

  useEffect(() => {

    loadSubjects();

  }, []);


  // ===================================================
  // GET DEPARTMENT NAME
  // ===================================================

  const getDepartmentName = (subject) => {

    // First try DepartmentName directly from Subject API

    const directName =
      subject.departmentName ??
      subject.DepartmentName;


    if (directName) {

      return directName;

    }


    // ===============================================
    // Get DepartmentId
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
  // LOADING
  // ===================================================

  if (loading) {

    return (

      <div className="subject-all-page">

        <div className="subject-all-container">

          <div className="subject-all-loading">

            Loading subjects...

          </div>

        </div>

      </div>

    );

  }


  // ===================================================
  // PAGE
  // ===================================================

  return (

    <div className="subject-all-page">

      <div className="subject-all-container">


        {/* ============================================
            HEADER
        ============================================ */}

        <div className="subject-all-header">

          <div>

            <h2>All Subjects</h2>

            <p>
              View all subjects.
            </p>

          </div>


          <button
            className="subject-all-refresh"
            onClick={loadSubjects}
          >
            Refresh
          </button>

        </div>


        {/* ============================================
            ERROR
        ============================================ */}

        {error && (

          <div className="subject-all-error">

            {error}

          </div>

        )}


        {/* ============================================
            EMPTY
        ============================================ */}

        {!error &&
          subjects.length === 0 && (

            <div className="subject-all-empty">

              No subject records found.

            </div>

          )}


        {/* ============================================
            TABLE
        ============================================ */}

        {subjects.length > 0 && (

          <div className="subject-all-table-wrapper">

            <table className="subject-all-table">

              <thead>

                <tr>

                  <th>#</th>

                  <th>Department</th>

                  <th>Subject Code</th>

                  <th>Subject Name</th>

                  <th>Description</th>

                  <th>Theory Marks</th>

                  <th>Practical Marks</th>

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
                        subject.Id
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


                      {/* Description */}

                      <td>

                        {subject.description ??
                          subject.Description ??
                          "-"}

                      </td>


                      {/* Theory Marks */}

                      <td>

                        {subject.theoryMarks ??
                          subject.TheoryMarks ??
                          0}

                      </td>


                      {/* Practical Marks */}

                      <td>

                        {subject.practicalMarks ??
                          subject.PracticalMarks ??
                          0}

                      </td>


                      {/* Optional */}

                      <td>

                        {(subject.isOptional ??
                          subject.IsOptional) ? (

                          <span className="subject-badge subject-badge-yes">

                            Yes

                          </span>

                        ) : (

                          <span className="subject-badge subject-badge-no">

                            No

                          </span>

                        )}

                      </td>


                      {/* Active */}

                      <td>

                        {(subject.isActive ??
                          subject.IsActive) ? (

                          <span className="subject-badge subject-badge-active">

                            Active

                          </span>

                        ) : (

                          <span className="subject-badge subject-badge-inactive">

                            Inactive

                          </span>

                        )}

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


export default GetAllSubject;

