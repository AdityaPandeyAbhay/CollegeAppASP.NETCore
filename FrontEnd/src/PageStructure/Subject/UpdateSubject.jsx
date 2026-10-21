// =====================================================
// UPDATE SUBJECT
// =====================================================

import { useEffect, useState } from "react";

import {
  getSubjectByCode,
  updateSubject,
} from "../../Services/subjectService";

import {
  getDepartmentDropdown,
} from "../../Services/departmentService";

import "./UpdateSubject.css";


const UpdateSubject = () => {

  const [code, setCode] = useState("");

  const [subjectId, setSubjectId] = useState(null);

  const [departments, setDepartments] = useState([]);

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


  const [searched, setSearched] = useState(false);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [updateLoading, setUpdateLoading] =
    useState(false);

  const [dropdownLoading, setDropdownLoading] =
    useState(true);

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
  // SEARCH SUBJECT
  // ===================================================

  const handleSearch = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");
    setSearched(false);


    if (!code.trim()) {

      setError(
        "Subject code is required."
      );

      return;

    }


    try {

      setSearchLoading(true);

      const data =
        await getSubjectByCode(code.trim());


      if (!data) {

        throw new Error(
          "Subject not found."
        );

      }


      setSubjectId(
        data.id ?? data.Id
      );


      setFormData({

        DepartmentId:
          data.departmentId ??
          data.DepartmentId ??
          "",

        SubjectCode:
          data.subjectCode ??
          data.SubjectCode ??
          "",

        SubjectName:
          data.subjectName ??
          data.SubjectName ??
          "",

        Description:
          data.description ??
          data.Description ??
          "",

        TheoryMarks:
          data.theoryMarks ??
          data.TheoryMarks ??
          0,

        PracticalMarks:
          data.practicalMarks ??
          data.PracticalMarks ??
          0,

        IsOptional:
          data.isOptional ??
          data.IsOptional ??
          false,

        IsActive:
          data.isActive ??
          data.IsActive ??
          false,

      });


      setSearched(true);

    } catch (err) {

      setError(
        err.message ||
        "Subject not found."
      );

    } finally {

      setSearchLoading(false);

    }

  };


  // ===================================================
  // HANDLE CHANGE
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
  // UPDATE
  // ===================================================

  const handleUpdate = async (e) => {

    e.preventDefault();

    setError("");
    setSuccess("");


    if (!subjectId) {

      setError(
        "Please search a subject first."
      );

      return;

    }


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

      setUpdateLoading(true);


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


      await updateSubject(
        subjectId,
        payload
      );


      setSuccess(
        "Subject updated successfully."
      );

    } catch (err) {

      setError(
        err.message ||
        "Failed to update subject."
      );

    } finally {

      setUpdateLoading(false);

    }

  };


  // ===================================================
  // CLEAR
  // ===================================================

  const handleClear = () => {

    setCode("");
    setSubjectId(null);
    setSearched(false);

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

    <div className="subject-update-page">

      <div className="subject-update-container">

        <div className="subject-update-header">

          <h2>
            Update Subject
          </h2>

          <p>
            Search a subject by code and update its details.
          </p>

        </div>


        {/* SEARCH */}

        <form
          className="subject-update-search"
          onSubmit={handleSearch}
        >

          <div className="subject-update-search-field">

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
              disabled={searchLoading}
            />

          </div>


          <button
            type="submit"
            disabled={searchLoading}
          >
            {searchLoading
              ? "Searching..."
              : "Search"}
          </button>


          <button
            type="button"
            className="subject-update-clear"
            onClick={handleClear}
            disabled={
              searchLoading ||
              updateLoading
            }
          >
            Clear
          </button>

        </form>


        {error && (

          <div className="subject-update-error">
            {error}
          </div>

        )}


        {success && (

          <div className="subject-update-success">
            {success}
          </div>

        )}


        {/* UPDATE FORM */}

        {searched && (

          <form
            className="subject-update-form"
            onSubmit={handleUpdate}
          >

            <div className="subject-update-field">

              <label>
                Department
                <span>*</span>
              </label>

              <select
                name="DepartmentId"
                value={formData.DepartmentId}
                onChange={handleChange}
                disabled={
                  dropdownLoading ||
                  updateLoading
                }
              >

                <option value="">
                  {dropdownLoading
                    ? "Loading departments..."
                    : "Select Department"}
                </option>

                {departments.map((department) => (

                  <option
                    key={
                      department.id ??
                      department.Id
                    }
                    value={
                      department.id ??
                      department.Id
                    }
                  >
                    {department.text ??
                      department.Text}
                    {department.code ??
                      department.Code
                      ? ` (${
                          department.code ??
                          department.Code
                        })`
                      : ""}
                  </option>

                ))}

              </select>

            </div>


            <div className="subject-update-field">

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
                disabled={updateLoading}
              />

            </div>


            <div className="subject-update-field">

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
                disabled={updateLoading}
              />

            </div>


            <div className="subject-update-field subject-update-full">

              <label>
                Description
              </label>

              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                rows="4"
                disabled={updateLoading}
              />

            </div>


            <div className="subject-update-field">

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
                disabled={updateLoading}
              />

            </div>


            <div className="subject-update-field">

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
                disabled={updateLoading}
              />

            </div>


            <div className="subject-update-checkbox">

              <label>

                <input
                  type="checkbox"
                  name="IsOptional"
                  checked={formData.IsOptional}
                  onChange={handleChange}
                  disabled={updateLoading}
                />

                Is Optional Subject

              </label>

            </div>


            <div className="subject-update-checkbox">

              <label>

                <input
                  type="checkbox"
                  name="IsActive"
                  checked={formData.IsActive}
                  onChange={handleChange}
                  disabled={updateLoading}
                />

                Is Active

              </label>

            </div>


            <div className="subject-update-actions">

              <button
                type="submit"
                className="subject-update-submit"
                disabled={updateLoading}
              >
                {updateLoading
                  ? "Updating..."
                  : "Update Subject"}
              </button>

            </div>

          </form>

        )}

      </div>

    </div>

  );

};


export default UpdateSubject;