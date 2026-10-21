// =====================================================
// UPDATE TEACHER ASSIGNMENT
// =====================================================

import { useEffect, useState } from "react";

import {
  getTeacherAssignmentById,
  updateTeacherAssignment,
  getAllTeacherAssignments,
} from "../../../Services/teacherAssignmentService";

import { getTeacherDropdown } from "../../../Services/teacherService";

import { getAllClass } from "../../../Services/classService";

import { getAllSection } from "../../../Services/sectionService";

import { getAllSubject } from "../../../Services/subjectService";

import { getAcademicYearDropdown } from "../../../Services/academicYearService";

import { getDepartmentDropdown } from "../../../Services/departmentService";

import "./UpdateTeacherAssignment.css";

const UpdateTeacherAssignment = () => {
  const [id, setId] = useState("");

  const [teachers, setTeachers] = useState([]);

  const [departments, setDepartments] = useState([]);

  const [classes, setClasses] = useState([]);

  const [sections, setSections] = useState([]);

  const [subjects, setSubjects] = useState([]);

  const [academicYears, setAcademicYears] = useState([]);

  const [formData, setFormData] = useState({
    TeacherId: "",
    DepartmentId: "",
    SchoolClassId: "",
    SectionId: "",
    SubjectId: "",
    AcademicYearId: "",
    IsClassTeacher: false,
    IsActive: true,
  });

  const [recordFound, setRecordFound] = useState(false);

  const [searching, setSearching] = useState(false);

  const [updating, setUpdating] = useState(false);

  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // ===================================================
  // LOAD DROPDOWNS
  // ===================================================

  useEffect(() => {
    const loadDropdowns = async () => {
      setLoadingDropdowns(true);

      try {
        const [
          teacherData,
          departmentData,
          classData,
          sectionData,
          subjectData,
          academicYearData,
        ] = await Promise.all([
          getTeacherDropdown(),
          getDepartmentDropdown(),
          getAllClass(),
          getAllSection(),
          getAllSubject(),
          getAcademicYearDropdown(),
        ]);

        setTeachers(Array.isArray(teacherData) ? teacherData : []);

        setDepartments(Array.isArray(departmentData) ? departmentData : []);

        setClasses(Array.isArray(classData) ? classData : []);

        setSections(Array.isArray(sectionData) ? sectionData : []);

        setSubjects(Array.isArray(subjectData) ? subjectData : []);

        setAcademicYears(
          Array.isArray(academicYearData) ? academicYearData : [],
        );
      } catch (err) {
        setError(err?.message || "Failed to load dropdown data.");
      } finally {
        setLoadingDropdowns(false);
      }
    };

    loadDropdowns();
  }, []);

  // ===================================================
  // SEARCH ASSIGNMENT
  // ===================================================

  const handleSearch = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setRecordFound(false);

    if (id === null || id === undefined || String(id).trim() === "") {
      setError("Teacher assignment ID is required.");

      return;
    }

    setSearching(true);

    try {
      const data = await getTeacherAssignmentById(id);

      if (!data) {
        throw new Error("Teacher assignment not found.");
      }

      setFormData({
        TeacherId: data.TeacherId ?? data.teacherId ?? "",

        DepartmentId: data.DepartmentId ?? data.departmentId ?? "",

        SchoolClassId: data.SchoolClassId ?? data.schoolClassId ?? "",

        SectionId: data.SectionId ?? data.sectionId ?? "",

        SubjectId: data.SubjectId ?? data.subjectId ?? "",

        AcademicYearId: data.AcademicYearId ?? data.academicYearId ?? "",

        IsClassTeacher: data.IsClassTeacher ?? data.isClassTeacher ?? false,

        IsActive: data.IsActive ?? data.isActive ?? true,
      });

      setRecordFound(true);
    } catch (err) {
      setError(err?.message || "Teacher assignment not found.");
    } finally {
      setSearching(false);
    }
  };

  // ===================================================
  // HANDLE CHANGE
  // ===================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ===================================================
  // UPDATE
  // ===================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setUpdating(true);

    try {
      // Validate: A teacher can only be assigned as Class Teacher to ONE class and section per Academic Year
      if (formData.IsClassTeacher) {
        try {
          const allAssignments = await getAllTeacherAssignments();
          const list = Array.isArray(allAssignments)
            ? allAssignments
            : allAssignments?.data || [];
          const existingCT = list.find((a) => {
            const aId = a.id ?? a.Id;
            const tId = a.teacherId ?? a.TeacherId;
            const isCT = a.isClassTeacher ?? a.IsClassTeacher;
            const aYearId = a.academicYearId ?? a.AcademicYearId;
            const isActive = a.isActive ?? a.IsActive ?? true;

            return (
              String(aId) !== String(id) &&
              String(tId) === String(formData.TeacherId) &&
              Boolean(isCT) &&
              Boolean(isActive) &&
              String(aYearId) === String(formData.AcademicYearId)
            );
          });

          if (existingCT) {
            const errMsg =
              "This teacher is already assigned as Class Teacher for another class and section in this Academic Year. In the same academic year, a teacher can only be assigned to a single class and section as Class Teacher.";
            setError(errMsg);
            setUpdating(false);
            return;
          }
        } catch (checkErr) {
          console.warn(
            "Could not check duplicate class teacher in UpdateTeacherAssignment:",
            checkErr,
          );
        }
      }

      await updateTeacherAssignment(id, formData);

      setMessage("Teacher assignment updated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to update teacher assignment.");
    } finally {
      setUpdating(false);
    }
  };

  // ===================================================
  // LOADING
  // ===================================================

  if (loadingDropdowns) {
    return (
      <div className="teacher-assignment-page">
        <div className="teacher-assignment-container">
          <div className="teacher-assignment-loading">Loading form data...</div>
        </div>
      </div>
    );
  }

  // ===================================================
  // UI
  // ===================================================

  return (
    <div className="teacher-assignment-page">
      <div className="teacher-assignment-container">
        <div className="teacher-assignment-header">
          <h2>Update Teacher Assignment</h2>

          <p>Search an assignment and update its details.</p>
        </div>

        {/* =================================================
            SEARCH
        ================================================= */}

        <form className="assignment-search-form" onSubmit={handleSearch}>
          <div className="assignment-search-field">
            <label>Assignment ID</label>

            <input
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter assignment ID"
              min="1"
            />
          </div>

          <button type="submit" disabled={searching}>
            {searching ? "Searching..." : "Find Assignment"}
          </button>
        </form>

        {/* =================================================
            SUCCESS
        ================================================= */}

        {message && <div className="teacher-assignment-success">{message}</div>}

        {/* =================================================
            ERROR
        ================================================= */}

        {error && <div className="teacher-assignment-error">{error}</div>}

        {/* =================================================
            UPDATE FORM
        ================================================= */}

        {recordFound && (
          <form className="teacher-assignment-form" onSubmit={handleUpdate}>
            <div className="teacher-assignment-grid">
              {/* =================================================
                  TEACHER
              ================================================= */}

              <div className="teacher-assignment-field">
                <label>
                  Teacher
                  <span>*</span>
                </label>

                <select
                  name="TeacherId"
                  value={formData.TeacherId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Teacher</option>

                  {teachers.map((teacher) => (
                    <option
                      key={teacher.id ?? teacher.Id}
                      value={teacher.id ?? teacher.Id}
                    >
                      {teacher.text ?? teacher.Text ?? ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* =================================================
                  DEPARTMENT
              ================================================= */}

              <div className="teacher-assignment-field">
                <label>
                  Department
                  <span>*</span>
                </label>

                <select
                  name="DepartmentId"
                  value={formData.DepartmentId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Department</option>

                  {departments.map((item) => (
                    <option key={item.Id ?? item.id} value={item.Id ?? item.id}>
                      {item.DepartmentName ??
                        item.departmentName ??
                        item.Name ??
                        item.name ??
                        item.Text ??
                        item.text ??
                        item.Code ??
                        item.code ??
                        ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* =================================================
                  CLASS
              ================================================= */}

              <div className="teacher-assignment-field">
                <label>
                  Class
                  <span>*</span>
                </label>

                <select
                  name="SchoolClassId"
                  value={formData.SchoolClassId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Class</option>

                  {classes.map((item) => (
                    <option key={item.Id ?? item.id} value={item.Id ?? item.id}>
                      {item.Name ??
                        item.name ??
                        item.ClassName ??
                        item.className ??
                        item.Code ??
                        item.code ??
                        ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* =================================================
                  SECTION
              ================================================= */}

              <div className="teacher-assignment-field">
                <label>
                  Section
                  <span>*</span>
                </label>

                <select
                  name="SectionId"
                  value={formData.SectionId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Section</option>

                  {sections.map((item) => (
                    <option key={item.Id ?? item.id} value={item.Id ?? item.id}>
                      {item.Name ??
                        item.name ??
                        item.SectionName ??
                        item.sectionName ??
                        item.Code ??
                        item.code ??
                        ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* =================================================
                  SUBJECT
              ================================================= */}

              <div className="teacher-assignment-field">
                <label>
                  Subject
                  <span>*</span>
                </label>

                <select
                  name="SubjectId"
                  value={formData.SubjectId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Subject</option>

                  {subjects.map((item) => (
                    <option key={item.Id ?? item.id} value={item.Id ?? item.id}>
                      {item.Name ??
                        item.name ??
                        item.SubjectName ??
                        item.subjectName ??
                        item.Code ??
                        item.code ??
                        ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* =================================================
                  ACADEMIC YEAR
              ================================================= */}

              <div className="teacher-assignment-field">
                <label>
                  Academic Year
                  <span>*</span>
                </label>

                <select
                  name="AcademicYearId"
                  value={formData.AcademicYearId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Academic Year</option>

                  {academicYears.map((item) => (
                    <option key={item.Id ?? item.id} value={item.Id ?? item.id}>
                      {item.Name ??
                        item.name ??
                        item.YearName ??
                        item.yearName ??
                        item.Text ??
                        item.text ??
                        ""}
                    </option>
                  ))}
                </select>
              </div>
              {/* =================================================
    CLASS TEACHER
================================================= */}

              <div className="teacher-assignment-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="IsClassTeacher"
                    checked={formData.IsClassTeacher}
                    onChange={handleChange}
                  />

                  <span>Class Teacher</span>
                </label>
              </div>

              {/* =================================================
                  ACTIVE
              ================================================= */}

              <div className="teacher-assignment-checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="IsActive"
                    checked={formData.IsActive}
                    onChange={handleChange}
                  />

                  <span>Active Assignment</span>
                </label>
              </div>
            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="teacher-assignment-actions">
              <button type="submit" disabled={updating}>
                {updating ? "Updating..." : "Update Assignment"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateTeacherAssignment;
