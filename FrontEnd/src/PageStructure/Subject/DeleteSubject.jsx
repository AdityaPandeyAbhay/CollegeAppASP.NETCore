
// =====================================================
// DELETE SUBJECT
// =====================================================

import { useState } from "react";

import {
  getSubjectByCode,
  deleteSubject,
} from "../../Services/subjectService";

import {
  getDepartmentDropdown,
} from "../../Services/departmentService";

import "./DeleteSubject.css";


const DeleteSubject = () => {

  const [code, setCode] = useState("");

  const [subject, setSubject] = useState(null);

  const [departmentName, setDepartmentName] = useState("-");

  const [loading, setLoading] = useState(false);

  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // ===================================================
  // SEARCH
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setSubject(null);

    setDepartmentName("-");

    setError("");

    setSuccess("");


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
      // CHECK DIRECT DEPARTMENT NAME
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
        // GET DEPARTMENT ID FROM SUBJECT
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
                (item) => {

                  const itemId =
                    item.id ??
                    item.Id ??
                    item.code ??
                    item.Code;


                  return (
                    String(itemId) ===
                    String(departmentId)
                  );

                }
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
  // DELETE
  // ===================================================

  const handleDelete = async () => {

    if (!subject) {

      setError(
        "Please search a subject first."
      );

      return;

    }


    const subjectCode =
      subject.subjectCode ??
      subject.SubjectCode;


    if (!subjectCode) {

      setError(
        "Subject code is required."
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete subject "${subjectCode}"?`
      );


    if (!confirmed) {

      return;

    }


    try {

      setDeleting(true);

      setError("");

      setSuccess("");


      await deleteSubject(
        subjectCode
      );


      setSuccess(
        "Subject deleted successfully."
      );


      setSubject(null);

      setDepartmentName("-");

      setCode("");

    } catch (err) {

      setError(
        err.message ||
        "Failed to delete subject."
      );

    } finally {

      setDeleting(false);

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

    setSuccess("");

  };


  // ===================================================
  // UI
  // ===================================================

  return (

    <div className="subject-delete-page">

      <div className="subject-delete-container">


        {/* ============================================
            HEADER
        ============================================ */}

        <div className="subject-delete-header">

          <h2>
            Delete Subject
          </h2>

          <p>
            Search subject by code before deleting.
          </p>

        </div>


        {/* ============================================
            SEARCH
        ============================================ */}

        <form
          className="subject-delete-search"
          onSubmit={handleSearch}
        >

          <div className="subject-delete-input-group">

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
              disabled={
                loading ||
                deleting
              }
            />

          </div>


          {/* SEARCH */}

          <button
            type="submit"
            disabled={
              loading ||
              deleting
            }
          >

            {loading
              ? "Searching..."
              : "Search"}

          </button>


          {/* CLEAR */}

          <button
            type="button"
            className="subject-delete-clear"
            onClick={handleClear}
            disabled={
              loading ||
              deleting
            }
          >

            Clear

          </button>

        </form>


        {/* ============================================
            ERROR
        ============================================ */}

        {error && (

          <div className="subject-delete-error">

            {error}

          </div>

        )}


        {/* ============================================
            SUCCESS
        ============================================ */}

        {success && (

          <div className="subject-delete-success">

            {success}

          </div>

        )}


        {/* ============================================
            SUBJECT DETAILS
        ============================================ */}

        {subject && (

          <div className="subject-delete-result">

            <h3>
              Subject Details
            </h3>


            <div className="subject-delete-details">


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


            </div>


            {/* ========================================
                WARNING
            ======================================== */}

            <div className="subject-delete-warning">

              Warning: deleting this subject may fail if
              related records have database restrictions.

            </div>


            {/* ========================================
                DELETE BUTTON
            ======================================== */}

            <button
              type="button"
              className="subject-delete-button"
              onClick={handleDelete}
              disabled={deleting}
            >

              {deleting
                ? "Deleting..."
                : "Delete Subject"}

            </button>


          </div>

        )}

      </div>

    </div>

  );

};


export default DeleteSubject;

