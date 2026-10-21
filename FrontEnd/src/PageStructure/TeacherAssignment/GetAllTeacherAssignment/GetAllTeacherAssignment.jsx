// =====================================================
// GET ALL TEACHER ASSIGNMENTS
// =====================================================

import { useEffect, useState } from "react";

import {
  getAllTeacherAssignments,
} from "../../../Services/teacherAssignmentService";

import "./GetAllTeacherAssignment.css";

const GetAllTeacherAssignment = () => {

  const [assignments, setAssignments] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =====================================================
  // LOAD DATA
  // =====================================================

  useEffect(() => {
    loadAssignments();
  }, []);


  const loadAssignments = async () => {

    setLoading(true);
    setError("");

    try {

      const response = await getAllTeacherAssignments();

      console.log(
        "GET ALL TEACHER ASSIGNMENTS RESPONSE:",
        response
      );

      // =================================================
      // SERVICE ALREADY NORMALIZES THE RESPONSE
      // =================================================

      let assignmentData = [];

      if (Array.isArray(response)) {

        assignmentData = response;

      } else if (Array.isArray(response?.Data)) {

        assignmentData = response.Data;

      } else if (Array.isArray(response?.data)) {

        assignmentData = response.data;

      } else if (Array.isArray(response?.Data?.Data)) {

        assignmentData = response.Data.Data;

      } else if (Array.isArray(response?.data?.data)) {

        assignmentData = response.data.data;

      }

      console.log(
        "FINAL ASSIGNMENT DATA:",
        assignmentData
      );

      setAssignments(assignmentData);

    } catch (err) {

      console.error(
        "GET ALL TEACHER ASSIGNMENTS ERROR:",
        err
      );

      setError(
        err?.message ||
        "Failed to load teacher assignments."
      );

      setAssignments([]);

    } finally {

      setLoading(false);

    }
  };


  // =====================================================
  // GET VALUE HELPER
  // =====================================================

  const getValue = (...values) => {

    for (const value of values) {

      if (
        value !== undefined &&
        value !== null &&
        String(value).trim() !== ""
      ) {

        return value;

      }

    }

    return "-";
  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatDate = (date) => {

    if (!date) {
      return "-";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {

      return date;

    }

    return parsedDate.toLocaleDateString();

  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {

    return (

      <div className="teacher-assignment-all-page">

        <div className="teacher-assignment-all-container">

          <div className="teacher-assignment-all-message">

            Loading teacher assignments...

          </div>

        </div>

      </div>

    );
  }


  // =====================================================
  // UI
  // =====================================================

  return (

    <div className="teacher-assignment-all-page">

      <div className="teacher-assignment-all-container">


        {/* =================================================
            TITLE
        ================================================= */}

        <h2 className="teacher-assignment-all-title">

          All Teacher Assignments

        </h2>


        {/* =================================================
            ERROR
        ================================================= */}

        {error && (

          <div className="teacher-assignment-all-message teacher-assignment-all-error">

            {error}

          </div>

        )}


        {/* =================================================
            EMPTY
        ================================================= */}

        {!error &&
          assignments.length === 0 && (

            <div className="teacher-assignment-all-message teacher-assignment-all-empty">

              No teacher assignments found.

            </div>

          )}


        {/* =================================================
            TABLE
        ================================================= */}

        {assignments.length > 0 && (

          <div className="teacher-assignment-all-table-wrapper">

            <table className="teacher-assignment-all-table">


              {/* =================================================
                  TABLE HEADER
              ================================================= */}

              <thead>

                <tr>

                  <th>#</th>

                  <th>Teacher</th>

                  <th>Class</th>

                  <th>Section</th>

                  <th>Subject</th>

                  <th>Academic Year</th>

                  <th>Status</th>

                  <th>Created Date</th>

                </tr>

              </thead>


              {/* =================================================
                  TABLE BODY
              ================================================= */}

              <tbody>

                {assignments.map(
                  (assignment, index) => {


                    // =================================================
                    // TEACHER NAME
                    // =================================================

                    const teacherName =
                      getValue(

                        assignment.TeacherName,

                        assignment.teacherName,

                        assignment.Teacher?.Name,

                        assignment.teacher?.name,

                        assignment.Teacher?.Text,

                        assignment.teacher?.text

                      );


                    // =================================================
                    // TEACHER CODE
                    // =================================================

                    const teacherCode =
                      getValue(

                        assignment.TeacherCode,

                        assignment.teacherCode,

                        assignment.Teacher?.Code,

                        assignment.teacher?.code

                      );


                    // =================================================
                    // CLASS
                    // =================================================

                    const className =
                      getValue(

                        assignment.ClassName,

                        assignment.className,

                        assignment.SchoolClassName,

                        assignment.schoolClassName,

                        assignment.SchoolClass?.Name,

                        assignment.schoolClass?.name,

                        assignment.SchoolClass?.ClassName,

                        assignment.schoolClass?.className,

                        assignment.ClassCode,

                        assignment.classCode

                      );


                    // =================================================
                    // SECTION
                    // =================================================

                    const sectionName =
                      getValue(

                        assignment.SectionName,

                        assignment.sectionName,

                        assignment.Section?.Name,

                        assignment.section?.name,

                        assignment.Section?.SectionName,

                        assignment.section?.sectionName,

                        assignment.SectionCode,

                        assignment.sectionCode

                      );


                    // =================================================
                    // SUBJECT
                    // =================================================

                    const subjectName =
                      getValue(

                        assignment.SubjectName,

                        assignment.subjectName,

                        assignment.Subject?.Name,

                        assignment.subject?.name,

                        assignment.Subject?.SubjectName,

                        assignment.subject?.subjectName,

                        assignment.SubjectCode,

                        assignment.subjectCode

                      );


                    // =================================================
                    // ACADEMIC YEAR
                    // =================================================
                    //
                    // BACKEND DTO:
                    //
                    // public string AcademicYear { get; set; }
                    //
                    // BACKEND SERVICE:
                    //
                    // AcademicYear = x.AcademicYear.YearName
                    //
                    // JSON:
                    //
                    // "academicYear": "2026-2027"
                    //
                    // =================================================

                    const academicYearName =
                      getValue(

                        assignment.AcademicYear,

                        assignment.academicYear,

                        assignment.AcademicYearName,

                        assignment.academicYearName,

                        assignment.AcademicYear?.YearName,

                        assignment.academicYear?.YearName,

                        assignment.academicYear?.yearName,

                        assignment.AcademicYear?.Name,

                        assignment.academicYear?.name,

                        assignment.AcademicYear?.Year,

                        assignment.academicYear?.year

                      );


                    // =================================================
                    // STATUS
                    // =================================================

                    const isActive =
                      assignment.IsActive ??
                      assignment.isActive ??
                      false;


                    // =================================================
                    // CREATED DATE
                    // =================================================

                    const createdDate =
                      assignment.CreatedDate ??
                      assignment.createdDate;


                    // =================================================
                    // ROW
                    // =================================================

                    return (

                      <tr
                        key={
                          assignment.Id ??
                          assignment.id ??
                          index
                        }
                      >


                        {/* =================================================
                            RECORD NUMBER
                        ================================================= */}

                        <td>

                          {index + 1}

                        </td>


                        {/* =================================================
                            TEACHER
                        ================================================= */}

                        <td>

                          <strong>

                            {teacherName}

                          </strong>


                          {teacherCode !== "-" && (

                            <small>

                              {teacherCode}

                            </small>

                          )}

                        </td>


                        {/* =================================================
                            CLASS
                        ================================================= */}

                        <td>

                          {className}

                        </td>


                        {/* =================================================
                            SECTION
                        ================================================= */}

                        <td>

                          {sectionName}

                        </td>


                        {/* =================================================
                            SUBJECT
                        ================================================= */}

                        <td>

                          {subjectName}

                        </td>


                        {/* =================================================
                            ACADEMIC YEAR
                        ================================================= */}

                        <td>

                          {academicYearName}

                        </td>


                        {/* =================================================
                            STATUS
                        ================================================= */}

                        <td>

                          <span
                            className={
                              isActive
                                ? "teacher-assignment-status-active"
                                : "teacher-assignment-status-inactive"
                            }
                          >

                            {isActive
                              ? "Active"
                              : "Inactive"}

                          </span>

                        </td>


                        {/* =================================================
                            CREATED DATE
                        ================================================= */}

                        <td>

                          {formatDate(createdDate)}

                        </td>


                      </tr>

                    );

                  }
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </div>

  );

};


export default GetAllTeacherAssignment;