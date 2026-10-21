// =====================================================
// CREATE TEACHER ASSIGNMENT
// =====================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// =====================================================
// TEACHER ASSIGNMENT SERVICE
// =====================================================

import {
  createTeacherAssignment,
  getAllTeacherAssignments,
} from "../../../Services/teacherAssignmentService";

// =====================================================
// TEACHER SERVICE
// =====================================================

import {
  getTeacherDropdown,
  getAllTeachers,
} from "../../../Services/teacherService";

// =====================================================
// DEPARTMENT SERVICE
// =====================================================

import { getDepartmentDropdown } from "../../../Services/departmentService";

// =====================================================
// CLASS SERVICE
// =====================================================

import { getAllClass } from "../../../Services/classService";

// =====================================================
// SECTION SERVICE
// =====================================================

import { getAllSection } from "../../../Services/sectionService";

// =====================================================
// SUBJECT SERVICE
// =====================================================

import { getAllSubject } from "../../../Services/subjectService";

// =====================================================
// ACADEMIC YEAR SERVICE
// =====================================================

import { getAcademicYearDropdown } from "../../../Services/academicYearService";

// =====================================================
// CSS
// =====================================================

import "./CreateTeacherAssignment.css";

const CreateTeacherAssignment = () => {
  const navigate = useNavigate();

  // ===================================================
  // DROPDOWN DATA
  // ===================================================

  const [teachers, setTeachers] = useState([]);

  const [allTeachers, setAllTeachers] = useState([]);

  const [departments, setDepartments] = useState([]);

  const [classes, setClasses] = useState([]);

  const [sections, setSections] = useState([]);

  const [subjects, setSubjects] = useState([]);

  const [academicYears, setAcademicYears] = useState([]);

  // ===================================================
  // FILTERED DATA
  // ===================================================

  const [filteredDepartments, setFilteredDepartments] = useState([]);

  const [filteredClasses, setFilteredClasses] = useState([]);

  const [filteredSections, setFilteredSections] = useState([]);

  const [filteredSubjects, setFilteredSubjects] = useState([]);

  // ===================================================
  // FORM DATA
  // ===================================================

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

  // ===================================================
  // LOADING
  // ===================================================

  const [loading, setLoading] = useState(false);

  const [loadingDropdowns, setLoadingDropdowns] = useState(true);

  // ===================================================
  // MESSAGES
  // ===================================================

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // ===================================================
  // POPUP
  // ===================================================

  const [popup, setPopup] = useState({
    show: false,
    type: "",
    text: "",
  });

  // ===================================================
  // SHOW POPUP
  // ===================================================

  const showPopup = (type, text) => {
    setPopup({
      show: true,
      type,
      text,
    });

    setTimeout(() => {
      setPopup({
        show: false,
        type: "",
        text: "",
      });
    }, 3500);
  };

  // ===================================================
  // LOAD ALL DROPDOWNS
  // ===================================================

  useEffect(() => {
    loadDropdowns();
  }, []);

  // ===================================================
  // LOAD DROPDOWNS
  // ===================================================

  const loadDropdowns = async () => {
    setLoadingDropdowns(true);

    setError("");

    try {
      const [
        teacherData,
        departmentData,
        classData,
        sectionData,
        subjectData,
        academicYearData,
        allTeacherData,
      ] = await Promise.all([
        // ---------------------------------------------
        // TEACHER DROPDOWN
        // ---------------------------------------------

        getTeacherDropdown(),

        // ---------------------------------------------
        // DEPARTMENT DROPDOWN
        // ---------------------------------------------

        getDepartmentDropdown(),

        // ---------------------------------------------
        // ALL CLASSES
        // ---------------------------------------------

        getAllClass(),

        // ---------------------------------------------
        // ALL SECTIONS
        // ---------------------------------------------

        getAllSection(),

        // ---------------------------------------------
        // ALL SUBJECTS
        // ---------------------------------------------

        getAllSubject(),

        // ---------------------------------------------
        // ACADEMIC YEARS
        // ---------------------------------------------

        getAcademicYearDropdown(),

        // ---------------------------------------------
        // FULL TEACHER DATA
        //
        // Needed for DepartmentId.
        //
        // teacherService.jsx is NOT changed.
        // ---------------------------------------------

        getAllTeachers(),
      ]);

      // =================================================
      // TEACHERS
      // =================================================

      setTeachers(Array.isArray(teacherData) ? teacherData : []);

      // =================================================
      // ALL TEACHERS
      // =================================================

      setAllTeachers(Array.isArray(allTeacherData) ? allTeacherData : []);

      // =================================================
      // DEPARTMENTS
      // =================================================

      setDepartments(Array.isArray(departmentData) ? departmentData : []);

      // =================================================
      // CLASSES
      // =================================================

      setClasses(Array.isArray(classData) ? classData : []);

      // =================================================
      // SECTIONS
      // =================================================

      setSections(Array.isArray(sectionData) ? sectionData : []);

      // =================================================
      // SUBJECTS
      // =================================================

      setSubjects(Array.isArray(subjectData) ? subjectData : []);

      // =================================================
      // ACADEMIC YEARS
      // =================================================

      setAcademicYears(Array.isArray(academicYearData) ? academicYearData : []);

      // =================================================
      // RESET FILTERS
      // =================================================

      setFilteredDepartments([]);

      setFilteredClasses([]);

      setFilteredSections([]);

      // -------------------------------------------------
      // IMPORTANT
      //
      // Subject is NOT teacher-assignment based.
      // All subjects are available after loading.
      // -------------------------------------------------

      setFilteredSubjects(Array.isArray(subjectData) ? subjectData : []);
    } catch (err) {
      const errorMessage = err?.message || "Failed to load dropdown data.";

      setError(errorMessage);

      showPopup("error", errorMessage);
    } finally {
      setLoadingDropdowns(false);
    }
  };

  // ===================================================
  // GET COMMON ID
  // ===================================================

  const getId = (item) => {
    if (!item) {
      return null;
    }

    return item.Id ?? item.id ?? item.ID ?? null;
  };

  // ===================================================
  // GET TEACHER ID
  // ===================================================

  const getTeacherId = (teacher) => {
    if (!teacher) {
      return null;
    }

    return teacher.Id ?? teacher.id ?? null;
  };

  // ===================================================
  // GET TEACHER DEPARTMENT ID
  // ===================================================

  const getTeacherDepartmentId = (teacher) => {
    if (!teacher) {
      return null;
    }

    return (
      teacher.DepartmentId ??
      teacher.departmentId ??
      teacher.Department?.Id ??
      teacher.department?.id ??
      null
    );
  };

  // ===================================================
  // GET DEPARTMENT NAME
  // ===================================================

  const getDepartmentName = (item) => {
    if (!item) {
      return "";
    }

    return (
      item.Name ??
      item.name ??
      item.DepartmentName ??
      item.departmentName ??
      item.Text ??
      item.text ??
      item.Code ??
      item.code ??
      ""
    );
  };

  // ===================================================
  // GET CLASS DEPARTMENT ID
  // ===================================================

  const getClassDepartmentId = (item) => {
    if (!item) {
      return null;
    }

    return (
      item.DepartmentId ??
      item.departmentId ??
      item.SchoolDepartmentId ??
      item.schoolDepartmentId ??
      item.Department?.Id ??
      item.department?.id ??
      item.SchoolDepartment?.Id ??
      item.schoolDepartment?.id ??
      null
    );
  };

  // ===================================================
  // GET SECTION CLASS ID
  // ===================================================

  const getSectionClassId = (section) => {
    if (!section) {
      return null;
    }

    return (
      section.SchoolClassId ??
      section.schoolClassId ??
      section.ClassId ??
      section.classId ??
      section.SchoolClass?.Id ??
      section.schoolClass?.id ??
      section.Class?.Id ??
      section.class?.id ??
      null
    );
  };

  // ===================================================
  // FILTER CLASSES BY DEPARTMENT
  // ===================================================

  const filterClassesByDepartment = (departmentId) => {
    if (
      departmentId === null ||
      departmentId === undefined ||
      String(departmentId).trim() === ""
    ) {
      setFilteredClasses([]);

      return;
    }

    const departmentClasses = classes.filter((item) => {
      const classDepartmentId = getClassDepartmentId(item);

      return (
        classDepartmentId !== null &&
        classDepartmentId !== undefined &&
        String(classDepartmentId) === String(departmentId)
      );
    });

    console.log("Selected Department ID:", departmentId);

    console.log("Filtered Classes:", departmentClasses);

    setFilteredClasses(departmentClasses);
  };

  // ===================================================
  // HANDLE TEACHER CHANGE
  // ===================================================

  const handleTeacherChange = (e) => {
    const teacherId = e.target.value;

    // =================================================
    // CLEAR MESSAGES
    // =================================================

    setMessage("");

    setError("");

    // =================================================
    // RESET DEPENDENT FIELDS
    // =================================================

    setFormData((previous) => ({
      ...previous,

      TeacherId: teacherId,

      DepartmentId: "",

      SchoolClassId: "",

      SectionId: "",

      SubjectId: "",
    }));

    // =================================================
    // CLEAR FILTERED DEPARTMENT
    // =================================================

    setFilteredDepartments([]);

    setFilteredClasses([]);

    setFilteredSections([]);

    // =================================================
    // SUBJECT
    //
    // IMPORTANT:
    // Subject does NOT depend on teacher assignment.
    //
    // All subjects are available once teacher is selected.
    // =================================================

    setFilteredSubjects(Array.isArray(subjects) ? subjects : []);

    // =================================================
    // NO TEACHER
    // =================================================

    if (!teacherId || String(teacherId).trim() === "") {
      setFilteredSubjects([]);

      return;
    }

    // =================================================
    // FIND SELECTED TEACHER
    // =================================================

    const selectedTeacher = allTeachers.find(
      (teacher) => String(getTeacherId(teacher)) === String(teacherId),
    );

    // =================================================
    // TEACHER NOT FOUND
    // =================================================

    if (!selectedTeacher) {
      const errorMessage = "Selected teacher details could not be found.";

      setError(errorMessage);

      showPopup("error", errorMessage);

      return;
    }

    // =================================================
    // GET DEPARTMENT ID
    // =================================================

    const teacherDepartmentId = getTeacherDepartmentId(selectedTeacher);

    console.log("Selected Teacher:", selectedTeacher);

    console.log("Teacher Department ID:", teacherDepartmentId);

    // =================================================
    // FILTER DEPARTMENT
    //
    // Teacher DepartmentId
    //          ↓
    // Department Id
    //          ↓
    // Department Name
    // =================================================

    if (
      teacherDepartmentId !== null &&
      teacherDepartmentId !== undefined &&
      String(teacherDepartmentId).trim() !== ""
    ) {
      const matchedDepartments = departments.filter((department) => {
        const departmentId = getId(department);

        return (
          departmentId !== null &&
          departmentId !== undefined &&
          String(departmentId) === String(teacherDepartmentId)
        );
      });

      console.log("Matched Departments:", matchedDepartments);

      setFilteredDepartments(matchedDepartments);

      // =================================================
      // AUTOMATICALLY SELECT DEPARTMENT
      // =================================================

      if (matchedDepartments.length > 0) {
        const selectedDepartmentId = getId(matchedDepartments[0]);

        setFormData((previous) => ({
          ...previous,

          DepartmentId: String(selectedDepartmentId),
        }));

        // =================================================
        // FILTER CLASSES BY DEPARTMENT
        // =================================================

        filterClassesByDepartment(selectedDepartmentId);
      }
    } else {
      setFilteredDepartments([]);

      setFilteredClasses([]);

      console.warn("DepartmentId not found for selected teacher.");
    }
  };

  // ===================================================
  // HANDLE DEPARTMENT CHANGE
  // ===================================================

  const handleDepartmentChange = (e) => {
    const departmentId = e.target.value;

    setMessage("");

    setError("");

    // =================================================
    // RESET CLASS / SECTION / SUBJECT
    // =================================================

    setFormData((previous) => ({
      ...previous,

      DepartmentId: departmentId,

      SchoolClassId: "",

      SectionId: "",

      SubjectId: "",
    }));

    // =================================================
    // CLEAR SECTIONS
    // =================================================

    setFilteredSections([]);

    // =================================================
    // FILTER CLASSES
    //
    // Department
    //    ↓
    // All classes belonging to department
    // =================================================

    filterClassesByDepartment(departmentId);

    // =================================================
    // SUBJECTS
    //
    // Subjects remain available.
    // =================================================

    setFilteredSubjects(formData.TeacherId ? subjects : []);
  };

  // ===================================================
  // HANDLE CLASS CHANGE
  // ===================================================

  const handleClassChange = (e) => {
    const classId = e.target.value;

    setMessage("");

    setError("");

    // =================================================
    // RESET SECTION
    // =================================================

    setFormData((previous) => ({
      ...previous,

      SchoolClassId: classId,

      SectionId: "",
    }));

    // =================================================
    // CLEAR SECTION
    // =================================================

    setFilteredSections([]);

    // =================================================
    // NO CLASS
    // =================================================

    if (!classId || String(classId).trim() === "") {
      return;
    }

    // =================================================
    // FILTER SECTIONS BY CLASS
    //
    // Class
    //   ↓
    // All sections belonging to class
    // =================================================

    const classSections = sections.filter((section) => {
      const sectionClassId = getSectionClassId(section);

      return (
        sectionClassId !== null &&
        sectionClassId !== undefined &&
        String(sectionClassId) === String(classId)
      );
    });

    console.log("Selected Class ID:", classId);

    console.log("Filtered Sections:", classSections);

    setFilteredSections(classSections);
  };

  // ===================================================
  // HANDLE NORMAL CHANGE
  // ===================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((previous) => ({
      ...previous,

      [name]: type === "checkbox" ? checked : value,
    }));

    setMessage("");

    setError("");
  };

  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");

    setError("");

    setLoading(true);

    try {
      // Validate: A teacher can only be assigned as Class Teacher to ONE class and section per Academic Year
      if (formData.IsClassTeacher) {
        try {
          const allAssignments = await getAllTeacherAssignments();
          const list = Array.isArray(allAssignments)
            ? allAssignments
            : allAssignments?.data || [];
          const existingCT = list.find((a) => {
            const tId = a.teacherId ?? a.TeacherId;
            const isCT = a.isClassTeacher ?? a.IsClassTeacher;
            const aYearId = a.academicYearId ?? a.AcademicYearId;
            const isActive = a.isActive ?? a.IsActive ?? true;
            const cId = a.schoolClassId ?? a.SchoolClassId;
            const sId = a.sectionId ?? a.SectionId;

            return (
              String(tId) === String(formData.TeacherId) &&
              Boolean(isCT) &&
              Boolean(isActive) &&
              String(aYearId) === String(formData.AcademicYearId) &&
              !(
                String(cId) === String(formData.SchoolClassId) &&
                String(sId) === String(formData.SectionId)
              )
            );
          });

          if (existingCT) {
            const errMsg =
              "This teacher is already assigned as Class Teacher for another class and section in this Academic Year. In the same academic year, a teacher can only be assigned to a single class and section as Class Teacher.";
            setError(errMsg);
            showPopup("error", errMsg);
            setLoading(false);
            return;
          }
        } catch (checkErr) {
          console.warn(
            "Could not check duplicate class teacher in CreateTeacherAssignment:",
            checkErr,
          );
        }
      }

      await createTeacherAssignment(formData);

      // =================================================
      // SUCCESS
      // =================================================

      const successMessage = "Teacher assignment created successfully.";

      setMessage(successMessage);

      showPopup("success", successMessage);

      // =================================================
      // RESET FORM
      // =================================================

      setFormData({
        TeacherId: "",

        DepartmentId: "",

        SchoolClassId: "",

        SectionId: "",

        SubjectId: "",

        AcademicYearId: "",

        IsClassTeacher: false,

        IsActive: true,
      });

      setFilteredDepartments([]);

      setFilteredClasses([]);

      setFilteredSections([]);

      // Keep all subjects loaded
      // so they are available for
      // the next teacher selection.

      setFilteredSubjects(subjects);
    } catch (err) {
      const errorMessage =
        err?.message || "Failed to create teacher assignment.";

      setError(errorMessage);

      showPopup("error", errorMessage);
    } finally {
      setLoading(false);
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
      {/* =================================================
          POPUP
      ================================================= */}

      {popup.show && (
        <div
          className={`teacher-assignment-popup ${
            popup.type === "success" ? "success" : "error"
          }`}
        >
          <div className="teacher-assignment-popup-icon">
            {popup.type === "success" ? "✓" : "!"}
          </div>

          <div className="teacher-assignment-popup-content">
            <strong>{popup.type === "success" ? "Success" : "Error"}</strong>

            <span>{popup.text}</span>
          </div>

          <button
            type="button"
            onClick={() =>
              setPopup({
                show: false,
                type: "",
                text: "",
              })
            }
          >
            ×
          </button>
        </div>
      )}

      <div className="teacher-assignment-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <div
          className="teacher-assignment-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div>
            <h2>Create Teacher Assignment</h2>
            <p>
              Assign a teacher to a department, class, section, subject and
              academic year.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/teacher-assignment/class")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "9px 16px",
              backgroundColor: "#eff6ff",
              color: "#2563eb",
              border: "1.5px solid #93c5fd",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "13px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            title="View which teachers teach which subjects in any class (GET Filter)"
          >
            🔍 View Faculty by Class (GET)
          </button>
        </div>

        {/* =================================================
            SUCCESS MESSAGE
        ================================================= */}

        {message && <div className="teacher-assignment-success">{message}</div>}

        {/* =================================================
            ERROR MESSAGE
        ================================================= */}

        {error && <div className="teacher-assignment-error">{error}</div>}

        {/* =================================================
            FORM
        ================================================= */}

        <form className="teacher-assignment-form" onSubmit={handleSubmit}>
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
                onChange={handleTeacherChange}
                required
              >
                <option value="">Select Teacher</option>

                {teachers.map((teacher) => (
                  <option
                    key={
                      teacher.id ?? teacher.Id ?? teacher.code ?? teacher.Code
                    }
                    value={teacher.id ?? teacher.Id}
                  >
                    {teacher.text ??
                      teacher.Text ??
                      teacher.TeacherName ??
                      teacher.teacherName ??
                      ""}
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
                onChange={handleDepartmentChange}
                required
                disabled={!formData.TeacherId}
              >
                <option value="">
                  {formData.TeacherId
                    ? filteredDepartments.length > 0
                      ? "Select Department"
                      : "No Department Allocated"
                    : "Select Teacher First"}
                </option>

                {filteredDepartments.map((department) => (
                  <option key={getId(department)} value={getId(department)}>
                    {getDepartmentName(department)}
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
                onChange={handleClassChange}
                required
                disabled={!formData.DepartmentId}
              >
                <option value="">
                  {formData.DepartmentId
                    ? filteredClasses.length > 0
                      ? "Select Class"
                      : "No Class Available"
                    : "Select Department First"}
                </option>

                {filteredClasses.map((item) => (
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
                disabled={!formData.SchoolClassId}
              >
                <option value="">
                  {formData.SchoolClassId
                    ? filteredSections.length > 0
                      ? "Select Section"
                      : "No Section Available"
                    : "Select Class First"}
                </option>

                {filteredSections.map((item) => (
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
                disabled={!formData.TeacherId}
              >
                <option value="">
                  {formData.TeacherId
                    ? filteredSubjects.length > 0
                      ? "Select Subject"
                      : "No Subject Available"
                    : "Select Teacher First"}
                </option>

                {filteredSubjects.map((item) => (
                  <option key={item.Id ?? item.id} value={item.Id ?? item.id}>
                    {item.Name ??
                      item.name ??
                      item.SubjectName ??
                      item.subjectName ??
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
              ACTION
          ================================================= */}

          <div className="teacher-assignment-actions">
            <button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Assignment"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeacherAssignment;
