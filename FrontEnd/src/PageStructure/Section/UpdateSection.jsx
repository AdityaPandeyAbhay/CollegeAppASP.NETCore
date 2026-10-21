// =====================================================
// UPDATE SECTION
// =====================================================

import { useEffect, useState } from "react";

import {
  getSectionByCode,
  updateSection,
} from "../../Services/sectionService";

import {
  getClassDropdown,
} from "../../Services/classService";

import "./UpdateSection.css";

const UpdateSection = () => {

  const [searchCode, setSearchCode] =
    useState("");

  const [sectionId, setSectionId] =
    useState(null);

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

  const [searchLoading, setSearchLoading] =
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

        console.log(
          "CLASS DROPDOWN:",
          data
        );

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
  // FIND SECTION
  // ===================================================

  const handleFind = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");
    setSectionId(null);


    const code =
      searchCode.trim();


    if (!code) {

      setError(
        "Section code is required."
      );

      return;

    }


    try {

      setSearchLoading(true);


      // -----------------------------------------------
      // GET SECTION BY CODE
      // -----------------------------------------------

      const response =
        await getSectionByCode(code);


      console.log(
        "SECTION BY CODE RESPONSE:",
        response
      );


      // -----------------------------------------------
      // HANDLE POSSIBLE RESPONSE WRAPPER
      // -----------------------------------------------

      const data =
        response?.Data ??
        response?.data ??
        response;


      console.log(
        "SECTION DATA:",
        data
      );


      if (!data) {

        throw new Error(
          "Section not found."
        );

      }


      // -----------------------------------------------
      // GET ID
      // -----------------------------------------------

      const id =
        data.Id ??
        data.id;


      console.log(
        "SECTION ID:",
        id
      );


      if (!id) {

        throw new Error(
          "Section ID was not returned by the server."
        );

      }


      // -----------------------------------------------
      // GET SCHOOL CLASS ID
      // -----------------------------------------------

      const schoolClassId =
        data.SchoolClassId ??
        data.schoolClassId;


      console.log(
        "SCHOOL CLASS ID:",
        schoolClassId
      );


      // -----------------------------------------------
      // SET SECTION ID
      // -----------------------------------------------

      setSectionId(id);


      // -----------------------------------------------
      // SET FORM DATA
      // -----------------------------------------------

      setFormData({

        SchoolClassId:
          schoolClassId ?? "",

        SectionCode:
          data.SectionCode ??
          data.sectionCode ??
          "",

        SectionName:
          data.SectionName ??
          data.sectionName ??
          "",

        DisplayOrder:
          data.DisplayOrder ??
          data.displayOrder ??
          1,

        Capacity:
          data.Capacity ??
          data.capacity ??
          1,

        RoomNumber:
          data.RoomNumber ??
          data.roomNumber ??
          "",

        Description:
          data.Description ??
          data.description ??
          "",

        IsActive:
          data.IsActive ??
          data.isActive ??
          true,

      });


    } catch (error) {

      console.error(
        "Get Section By Code Error:",
        error
      );

      setError(
        error?.message ||
        "Section not found."
      );

      setSectionId(null);

    } finally {

      setSearchLoading(false);

    }

  };


  // ===================================================
  // UPDATE
  // ===================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");


    if (!sectionId) {

      setError(
        "Please search and select a section first."
      );

      return;

    }


    try {

      setLoading(true);


      await updateSection(
        sectionId,
        formData
      );


      setSuccess(
        "Section updated successfully."
      );

    } catch (error) {

      setError(
        error.message ||
        "Failed to update section."
      );

    } finally {

      setLoading(false);

    }

  };


  const selectedClass =
    classes.find(
      (item) =>
        Number(
          item.id ??
          item.Id
        ) ===
        Number(
          formData.SchoolClassId
        )
    );


  return (

    <div className="update-section-page">

      <div className="update-section-container">


        <div className="update-section-header">

          <h1>
            Update Section
          </h1>

          <p>
            Search a section and update its details
          </p>

        </div>


        {/* =================================================
            SEARCH
        ================================================= */}

        <form
          className="update-section-search"
          onSubmit={handleFind}
        >

          <input
            type="text"
            value={searchCode}
            onChange={(event) =>
              setSearchCode(
                event.target.value
              )
            }
            placeholder="Enter section code"
            disabled={searchLoading}
          />

          <button
            type="submit"
            disabled={
              searchLoading ||
              classLoading
            }
          >

            {searchLoading
              ? "Searching..."
              : "Find Section"}

          </button>

        </form>


        {error && (

          <div className="update-section-error">

            {error}

          </div>

        )}


        {success && (

          <div className="update-section-success">

            {success}

          </div>

        )}


        {sectionId && (

          <form
            className="update-section-form"
            onSubmit={handleSubmit}
          >


            {/* =================================================
                CURRENT CLASS
            ================================================= */}

            <div className="update-section-current-class">

              <span>
                Current Class
              </span>

              <strong>
                {selectedClass?.text ||
                 selectedClass?.Text ||
                 "-"}
              </strong>

            </div>


            {/* =================================================
                CLASS DROPDOWN
            ================================================= */}

            <div className="update-section-form-group">

              <label htmlFor="SchoolClassId">
                Change Class
              </label>

              <select
                id="SchoolClassId"
                name="SchoolClassId"
                value={formData.SchoolClassId}
                onChange={handleChange}
                disabled={
                  loading ||
                  classLoading
                }
                required
              >

                <option value="">
                  {classLoading
                    ? "Loading classes..."
                    : "Select Class"}
                </option>

                {classes.map((item) => (

                  <option
                    key={
                      item.id ??
                      item.Id
                    }
                    value={
                      item.id ??
                      item.Id
                    }
                  >

                    {
                      item.text ??
                      item.Text ??
                      ""
                    }

                    {
                      item.code ??
                      item.Code
                        ? ` (${
                            item.code ??
                            item.Code
                          })`
                        : ""
                    }

                  </option>

                ))}

              </select>

            </div>


            {/* =================================================
                CODE / NAME
            ================================================= */}

            <div className="update-section-form-row">

              <div className="update-section-form-group">

                <label>
                  Section Code
                </label>

                <input
                  type="text"
                  name="SectionCode"
                  value={formData.SectionCode}
                  onChange={handleChange}
                  maxLength={20}
                  disabled={loading}
                  required
                />

              </div>


              <div className="update-section-form-group">

                <label>
                  Section Name
                </label>

                <input
                  type="text"
                  name="SectionName"
                  value={formData.SectionName}
                  onChange={handleChange}
                  maxLength={50}
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* =================================================
                ORDER / CAPACITY
            ================================================= */}

            <div className="update-section-form-row">

              <div className="update-section-form-group">

                <label>
                  Display Order
                </label>

                <input
                  type="number"
                  name="DisplayOrder"
                  value={formData.DisplayOrder}
                  onChange={handleChange}
                  min="0"
                  disabled={loading}
                />

              </div>


              <div className="update-section-form-group">

                <label>
                  Capacity
                </label>

                <input
                  type="number"
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


            {/* =================================================
                ROOM
            ================================================= */}

            <div className="update-section-form-group">

              <label>
                Room Number
              </label>

              <input
                type="text"
                name="RoomNumber"
                value={formData.RoomNumber}
                onChange={handleChange}
                maxLength={20}
                disabled={loading}
              />

            </div>


            {/* =================================================
                DESCRIPTION
            ================================================= */}

            <div className="update-section-form-group">

              <label>
                Description
              </label>

              <textarea
                name="Description"
                value={formData.Description}
                onChange={handleChange}
                rows="4"
                disabled={loading}
              />

            </div>


            {/* =================================================
                ACTIVE
            ================================================= */}

            <div className="update-section-checkbox">

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
              className="update-section-submit"
              disabled={loading}
            >

              {loading
                ? "Updating..."
                : "Update Section"}

            </button>


          </form>

        )}

      </div>

    </div>

  );

};

export default UpdateSection;