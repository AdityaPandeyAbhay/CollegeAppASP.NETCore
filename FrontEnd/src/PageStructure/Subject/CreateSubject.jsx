// =====================================================
// CREATE SUBJECT
// =====================================================

import { useEffect, useState } from "react";

import {
  createSubject,
} from "../../Services/subjectService";

import {
  getDepartmentDropdown,
} from "../../Services/departmentService";

import "./CreateSubject.css";


const CreateSubject = () => {

  // ===================================================
  // FORM STATE
  // ===================================================

  const [formData, setFormData] = useState({

    DepartmentId: "",
    SubjectCode: "",
    SubjectName: "",
    Description: "",
    TheoryMarks: 0,
    PracticalMarks: 0,
    IsOptional: false,
    IsActive: true,

  });


  // ===================================================
  // DEPARTMENT DROPDOWN
  // ===================================================

  const [departments, setDepartments] = useState([]);


  // ===================================================
  // UI STATE
  // ===================================================

  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(true);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");


  // ===================================================
  // LOAD DEPARTMENTS
  // ===================================================

  useEffect(() => {

    const loadDepartments = async () => {

      try {

        setDropdownLoading(true);

        const data =
          await getDepartmentDropdown();

        setDepartments(
          Array.isArray(data) ? data : []
        );

      } catch (err) {

        setError(
          err.message ||
          "Failed to load departments."
        );

      } finally {

        setDropdownLoading(false);

      }

    };


    loadDepartments();

  }, []);


  // ===================================================
  // HANDLE INPUT
  // ===================================================

  const handleChange = (e) => {

    const {
      name,
      value,
      type,
      checked,
    } = e.target;


    setFormData((prev) => ({

      ...prev,

      [name]:
        type === "checkbox"
          ? checked
          : value,

    }));

  };


  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (!formData.DepartmentId) {

      setError(
        "Please select Department."
      );

      return;

    }


    if (!formData.SubjectCode.trim()) {

      setError(
        "Subject code is required."
      );

      return;

    }


    if (!formData.SubjectName.trim()) {

      setError(
        "Subject name is required."
      );

      return;

    }


    try {

      setLoading(true);


      const payload = {

        DepartmentId:
          Number(formData.DepartmentId),

        SubjectCode:
          formData.SubjectCode.trim(),

        SubjectName:
          formData.SubjectName.trim(),

        Description:
          formData.Description.trim() || null,

        TheoryMarks:
          Number(formData.TheoryMarks),

        PracticalMarks:
          Number(formData.PracticalMarks),

        IsOptional:
          formData.IsOptional,

        IsActive:
          formData.IsActive,

      };


      await createSubject(payload);


      setSuccess(
        "Subject created successfully."
      );


      setFormData({

        DepartmentId: "",
        SubjectCode: "",
        SubjectName: "",
        Description: "",
        TheoryMarks: 0,
        PracticalMarks: 0,
        IsOptional: false,
        IsActive: true,

      });

    } catch (err) {

      setError(
        err.message ||
        "Failed to create subject."
      );

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // RESET
  // ===================================================

  const handleReset = () => {

    setFormData({

      DepartmentId: "",
      SubjectCode: "",
      SubjectName: "",
      Description: "",
      TheoryMarks: 0,
      PracticalMarks: 0,
      IsOptional: false,
      IsActive: true,

    });

    setError("");
    setSuccess("");

  };


  return (

    <div className="subject-create-page">

      <div className="subject-create-container">

        <div className="subject-create-header">

          <h2>
            Create Subject
          </h2>

          <p>
            Add a new subject to a department.
          </p>

        </div>


        {error && (

          <div className="subject-create-error">
            {error}
          </div>

        )}


        {success && (

          <div className="subject-create-success">
            {success}
          </div>

        )}


        <form
          className="subject-create-form"
          onSubmit={handleSubmit}
        >

          {/* Department */}

          <div className="subject-create-field">

            <label>
              Department
              <span>*</span>
            </label>

            <select
              name="DepartmentId"
              value={formData.DepartmentId}
              onChange={handleChange}
              disabled={dropdownLoading || loading}
            >

              <option value="">
                {dropdownLoading
                  ? "Loading departments..."
                  : "Select Department"}
              </option>

              {departments.map((department) => (

                <option
                  key={department.id ?? department.Id}
                  value={department.id ?? department.Id}
                >
                  {department.text ?? department.Text}
                  {department.code ?? department.Code
                    ? ` (${department.code ?? department.Code})`
                    : ""}
                </option>

              ))}

            </select>

          </div>


          {/* Subject Code */}

          <div className="subject-create-field">

            <label>
              Subject Code
              <span>*</span>
            </label>

            <input
              type="text"
              name="SubjectCode"
              value={formData.SubjectCode}
              onChange={handleChange}
              maxLength={20}
              placeholder="Enter subject code"
              disabled={loading}
            />

          </div>


          {/* Subject Name */}

          <div className="subject-create-field">

            <label>
              Subject Name
              <span>*</span>
            </label>

            <input
              type="text"
              name="SubjectName"
              value={formData.SubjectName}
              onChange={handleChange}
              maxLength={100}
              placeholder="Enter subject name"
              disabled={loading}
            />

          </div>


          {/* Description */}

          <div className="subject-create-field subject-create-full">

            <label>
              Description
            </label>

            <textarea
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              maxLength={250}
              rows="4"
              placeholder="Enter subject description"
              disabled={loading}
            />

          </div>


          {/* Theory Marks */}

          <div className="subject-create-field">

            <label>
              Theory Marks
            </label>

            <input
              type="number"
              name="TheoryMarks"
              value={formData.TheoryMarks}
              onChange={handleChange}
              min="0"
              max="100"
              disabled={loading}
            />

          </div>


          {/* Practical Marks */}

          <div className="subject-create-field">

            <label>
              Practical Marks
            </label>

            <input
              type="number"
              name="PracticalMarks"
              value={formData.PracticalMarks}
              onChange={handleChange}
              min="0"
              max="100"
              disabled={loading}
            />

          </div>


          {/* Optional */}

          <div className="subject-create-checkbox-field">

            <label>

              <input
                type="checkbox"
                name="IsOptional"
                checked={formData.IsOptional}
                onChange={handleChange}
                disabled={loading}
              />

              <span>
                Is Optional Subject
              </span>

            </label>

          </div>


          {/* Active */}

          <div className="subject-create-checkbox-field">

            <label>

              <input
                type="checkbox"
                name="IsActive"
                checked={formData.IsActive}
                onChange={handleChange}
                disabled={loading}
              />

              <span>
                Is Active
              </span>

            </label>

          </div>


          {/* Buttons */}

          <div className="subject-create-actions">

            <button
              type="submit"
              className="subject-create-submit"
              disabled={loading}
            >

              {loading
                ? "Creating..."
                : "Create Subject"}

            </button>


            <button
              type="button"
              className="subject-create-reset"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>

          </div>

        </form>

      </div>

    </div>

  );

};


export default CreateSubject;