// =====================================================
// CREATE SECTION
// =====================================================

import { useEffect, useState } from "react";

import {
  createSection,
} from "../../Services/sectionService";

import {
  getClassDropdown,
} from "../../Services/classService";

import "./CreateSection.css";

const CreateSection = () => {

  const [classes, setClasses] =
    useState([]);

  const [formData, setFormData] = useState({

    SchoolClassId: "",
    SectionCode: "",
    SectionName: "",
    DisplayOrder: 1,
    Capacity: 1,
    RoomNumber: "",
    Description: "",
    IsActive: true,

  });

  const [loading, setLoading] =
    useState(false);

  const [classLoading, setClassLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ===================================================
  // LOAD CLASSES
  // ===================================================

  useEffect(() => {

    const loadClasses = async () => {

      try {

        setClassLoading(true);

        const data =
          await getClassDropdown();

        setClasses(
          Array.isArray(data)
            ? data
            : []
        );

      } catch (error) {

        setError(
          error.message ||
          "Failed to load classes."
        );

      } finally {

        setClassLoading(false);

      }

    };

    loadClasses();

  }, []);


  // ===================================================
  // HANDLE CHANGE
  // ===================================================

  const handleChange = (event) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;


    setFormData((previous) => ({

      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,

    }));

  };


  // ===================================================
  // SUBMIT
  // ===================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");
    setLoading(true);


    try {

      await createSection(
        formData
      );


      setSuccess(
        "Section created successfully."
      );


      setFormData({

        SchoolClassId: "",
        SectionCode: "",
        SectionName: "",
        DisplayOrder: 1,
        Capacity: 1,
        RoomNumber: "",
        Description: "",
        IsActive: true,

      });

    } catch (error) {

      setError(
        error.message ||
        "Failed to create section."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="create-section-page">

      <div className="create-section-container">


        <div className="create-section-header">

          <h1>
            Create Section
          </h1>

          <p>
            Create a new section for a class
          </p>

        </div>


        {error && (

          <div className="create-section-error">
            {error}
          </div>

        )}


        {success && (

          <div className="create-section-success">
            {success}
          </div>

        )}


        <form
          className="create-section-form"
          onSubmit={handleSubmit}
        >


          <div className="create-section-form-group">

            <label htmlFor="SchoolClassId">
              Class
            </label>

            <select
              id="SchoolClassId"
              name="SchoolClassId"
              value={formData.SchoolClassId}
              onChange={handleChange}
              disabled={classLoading || loading}
              required
            >

              <option value="">
                {classLoading
                  ? "Loading classes..."
                  : "Select Class"}
              </option>

              {classes.map((item) => (

                <option
                  key={item.id}
                  value={item.id}
                >

                  {item.text}

                  {item.code
                    ? ` (${item.code})`
                    : ""}

                </option>

              ))}

            </select>

          </div>


          <div className="create-section-form-row">


            <div className="create-section-form-group">

              <label htmlFor="SectionCode">
                Section Code
              </label>

              <input
                type="text"
                id="SectionCode"
                name="SectionCode"
                value={formData.SectionCode}
                onChange={handleChange}
                maxLength={20}
                placeholder="Enter section code"
                disabled={loading}
                required
              />

            </div>


            <div className="create-section-form-group">

              <label htmlFor="SectionName">
                Section Name
              </label>

              <input
                type="text"
                id="SectionName"
                name="SectionName"
                value={formData.SectionName}
                onChange={handleChange}
                maxLength={50}
                placeholder="Enter section name"
                disabled={loading}
                required
              />

            </div>


          </div>


          <div className="create-section-form-row">


            <div className="create-section-form-group">

              <label htmlFor="DisplayOrder">
                Display Order
              </label>

              <input
                type="number"
                id="DisplayOrder"
                name="DisplayOrder"
                value={formData.DisplayOrder}
                onChange={handleChange}
                min="0"
                disabled={loading}
              />

            </div>


            <div className="create-section-form-group">

              <label htmlFor="Capacity">
                Capacity
              </label>

              <input
                type="number"
                id="Capacity"
                name="Capacity"
                value={formData.Capacity}
                onChange={handleChange}
                min="1"
                max="500"
                disabled={loading}
                required
              />

            </div>


          </div>


          <div className="create-section-form-group">

            <label htmlFor="RoomNumber">
              Room Number
            </label>

            <input
              type="text"
              id="RoomNumber"
              name="RoomNumber"
              value={formData.RoomNumber}
              onChange={handleChange}
              maxLength={20}
              placeholder="Enter room number"
              disabled={loading}
            />

          </div>


          <div className="create-section-form-group">

            <label htmlFor="Description">
              Description
            </label>

            <textarea
              id="Description"
              name="Description"
              value={formData.Description}
              onChange={handleChange}
              maxLength={200}
              rows="4"
              placeholder="Enter description"
              disabled={loading}
            />

          </div>


          <div className="create-section-checkbox">

            <input
              type="checkbox"
              id="IsActive"
              name="IsActive"
              checked={formData.IsActive}
              onChange={handleChange}
              disabled={loading}
            />

            <label htmlFor="IsActive">
              Active
            </label>

          </div>


          <button
            type="submit"
            className="create-section-submit"
            disabled={
              loading ||
              classLoading
            }
          >

            {loading
              ? "Creating..."
              : "Create Section"}

          </button>


        </form>

      </div>

    </div>

  );

};

export default CreateSection;