
// =====================================================
// GET SUBJECT BY CODE
// =====================================================

import { useState } from "react";

import {
  getSubjectByCode,
} from "../../Services/subjectService";

import {
  getDepartmentDropdown,
} from "../../Services/departmentService";

import "./GetSubjectByCode.css";


const GetSubjectByCode = () => {

  const [code, setCode] = useState("");

  const [subject, setSubject] = useState(null);

  const [departmentName, setDepartmentName] = useState("-");

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");


  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setSubject(null);

    setDepartmentName("-");

    setError("");


    // =================================================
    // VALIDATION
    // =================================================

    if (!code.trim()) {

      setError(
        "Subject code is required."
      );

      return;

    }


    try {

      setLoading(true);


      // ===============================================
      // GET SUBJECT
      // ===============================================

      const data =
        await getSubjectByCode(
          code.trim()
        );


      setSubject(data);


      // ===============================================
      // IF DEPARTMENT NAME ALREADY EXISTS
      // ===============================================

      const directDepartmentName =
        data?.departmentName ??
        data?.DepartmentName;


      if (directDepartmentName) {

        setDepartmentName(
          directDepartmentName
        );

      } else {

        // =============================================
        // GET DEPARTMENT DROPDOWN
        // =============================================

        const departmentData =
          await getDepartmentDropdown();


        // =============================================
        // GET SUBJECT DEPARTMENT ID
        // =============================================

        const departmentId =
          data?.departmentId ??
          data?.DepartmentId;


        // =============================================
        // FIND DEPARTMENT
        // =============================================

        const department =
          Array.isArray(departmentData)
            ? departmentData.find(
                (item) =>
                  String(
                    item.id ??
                    item.Id ??
                    item.code ??
                    item.Code
                  ) ===
                  String(departmentId)
              )
            : null;


        // =============================================
        // GET DEPARTMENT NAME
        // =============================================

        if (department) {

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


          setDepartmentName(name);

        } else {

          setDepartmentName("-");

        }

      }

    } catch (err) {

      setError(
        err.message ||
        "Subject not found."
      );

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // CLEAR
  // ===================================================

  const handleClear = () => {

    setCode("");

    setSubject(null);

    setDepartmentName("-");

    setError("");

  };


  // ===================================================
  // UI
  // ===================================================

  return (

    <div className="subject-code-page">

      <div className="subject-code-container">


        {/* ============================================
            HEADER
        ============================================ */}

        <div className="subject-code-header">

          <h2>
            Get Subject By Code
          </h2>

          <p>
            Search subject using subject code.
          </p>

        </div>


        {/* ============================================
            SEARCH FORM
        ============================================ */}

        <form
          className="subject-code-search"
          onSubmit={handleSearch}
        >

          <div className="subject-code-input-group">

            <label>
              Subject Code
            </label>

            <input
              type="text"
              value={code}
              onChange={(e) =>
                setCode(e.target.value)
              }
              placeholder="Enter subject code"
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
            className="subject-code-clear"
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

          <div className="subject-code-error">

            {error}

          </div>

        )}


        {/* ============================================
            RESULT
        ============================================ */}

        {subject && (

          <div className="subject-code-result">

            <h3>
              Subject Details
            </h3>


            <div className="subject-code-grid">


              {/* ID */}

              <div>

                <strong>
                  Id
                </strong>

                <span>
                  {subject.id ??
                    subject.Id ??
                    "-"}
                </span>

              </div>


              {/* DEPARTMENT */}

              <div>

                <strong>
                  Department
                </strong>

                <span>
                  {departmentName}
                </span>

              </div>


              {/* SUBJECT CODE */}

              <div>

                <strong>
                  Subject Code
                </strong>

                <span>
                  {subject.subjectCode ??
                    subject.SubjectCode ??
                    "-"}
                </span>

              </div>


              {/* SUBJECT NAME */}

              <div>

                <strong>
                  Subject Name
                </strong>

                <span>
                  {subject.subjectName ??
                    subject.SubjectName ??
                    "-"}
                </span>

              </div>


              {/* THEORY MARKS */}

              <div>

                <strong>
                  Theory Marks
                </strong>

                <span>
                  {subject.theoryMarks ??
                    subject.TheoryMarks ??
                    0}
                </span>

              </div>


              {/* PRACTICAL MARKS */}

              <div>

                <strong>
                  Practical Marks
                </strong>

                <span>
                  {subject.practicalMarks ??
                    subject.PracticalMarks ??
                    0}
                </span>

              </div>


              {/* DESCRIPTION */}

              <div className="subject-code-description">

                <strong>
                  Description
                </strong>

                <span>
                  {subject.description ??
                    subject.Description ??
                    "-"}
                </span>

              </div>


              {/* OPTIONAL */}

              <div>

                <strong>
                  Optional
                </strong>

                <span>
                  {(subject.isOptional ??
                    subject.IsOptional)
                    ? "Yes"
                    : "No"}
                </span>

              </div>


              {/* ACTIVE */}

              <div>

                <strong>
                  Active
                </strong>

                <span>
                  {(subject.isActive ??
                    subject.IsActive)
                    ? "Yes"
                    : "No"}
                </span>

              </div>


            </div>

          </div>

        )}

      </div>

    </div>

  );

};


export default GetSubjectByCode;

