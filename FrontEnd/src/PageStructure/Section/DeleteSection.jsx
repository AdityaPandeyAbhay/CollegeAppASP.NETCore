// =====================================================
// DELETE SECTION
// =====================================================

import { useState } from "react";

import {
  getSectionByCode,
  deleteSection,
} from "../../Services/sectionService";

import {
  getClassDropdown,
} from "../../Services/classService";

import "./DeleteSection.css";

const DeleteSection = () => {

  const [code, setCode] =
    useState("");

  const [section, setSection] =
    useState(null);

  const [loading, setLoading] =
    useState(false);

  const [deleting, setDeleting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  // ===================================================
  // FIND SECTION
  // ===================================================

  const handleSearch = async (event) => {

    event.preventDefault();

    setError("");
    setSuccess("");
    setSection(null);


    const searchCode =
      code.trim();


    if (!searchCode) {

      setError(
        "Section code is required."
      );

      return;

    }


    try {

      setLoading(true);


      // -----------------------------------------------
      // GET SECTION
      // -----------------------------------------------

      const sectionResponse =
        await getSectionByCode(
          searchCode
        );


      console.log(
        "SECTION BY CODE:",
        sectionResponse
      );


      // -----------------------------------------------
      // HANDLE RESPONSE
      // -----------------------------------------------

      const sectionData =
        sectionResponse?.Data ??
        sectionResponse?.data ??
        sectionResponse;


      if (!sectionData) {

        throw new Error(
          "Section not found."
        );

      }


      // -----------------------------------------------
      // GET CLASS DROPDOWN
      // -----------------------------------------------

      const classResponse =
        await getClassDropdown();


      const classData =
        Array.isArray(classResponse)
          ? classResponse
          : [];


      console.log(
        "CLASS DROPDOWN:",
        classData
      );


      // -----------------------------------------------
      // SCHOOL CLASS ID
      // -----------------------------------------------

      const schoolClassId =
        sectionData?.SchoolClassId ??
        sectionData?.schoolClassId;


      console.log(
        "SCHOOL CLASS ID:",
        schoolClassId
      );


      // -----------------------------------------------
      // FIND CLASS
      // -----------------------------------------------

      const selectedClass =
        classData.find(
          (item) => {

            const classId =
              item?.id ??
              item?.Id;

            return (
              Number(classId) ===
              Number(schoolClassId)
            );

          }
        );


      console.log(
        "SELECTED CLASS:",
        selectedClass
      );


      // -----------------------------------------------
      // CLASS NAME
      // -----------------------------------------------

      const className =
        sectionData?.ClassName ||
        sectionData?.className ||
        selectedClass?.text ||
        selectedClass?.Text ||
        "-";


      // -----------------------------------------------
      // FINAL SECTION
      // -----------------------------------------------

      const finalSection = {

        ...sectionData,

        ClassName:
          className,

        SectionCode:
          sectionData?.SectionCode ??
          sectionData?.sectionCode ??
          searchCode,

        SectionName:
          sectionData?.SectionName ??
          sectionData?.sectionName ??
          "",

        Capacity:
          sectionData?.Capacity ??
          sectionData?.capacity ??
          0,

        RoomNumber:
          sectionData?.RoomNumber ??
          sectionData?.roomNumber ??
          "",

        IsActive:
          sectionData?.IsActive ??
          sectionData?.isActive ??
          false,

      };


      console.log(
        "FINAL SECTION:",
        finalSection
      );


      setSection(
        finalSection
      );


    } catch (error) {

      console.error(
        "Get Section By Code Error:",
        error
      );

      setError(
        error?.message ||
        "Section not found."
      );

    } finally {

      setLoading(false);

    }

  };


  // ===================================================
  // DELETE
  // ===================================================

  const handleDelete = async () => {

    if (!section) {

      return;

    }


    const sectionCode =
      section.SectionCode ??
      section.sectionCode ??
      code.trim();


    if (!sectionCode) {

      setError(
        "Section code is required."
      );

      return;

    }


    const confirmed =
      window.confirm(
        `Are you sure you want to delete section "${section.SectionName}"?`
      );


    if (!confirmed) {

      return;

    }


    try {

      setDeleting(true);

      setError("");
      setSuccess("");


      await deleteSection(
        sectionCode
      );


      setSuccess(
        "Section deleted successfully."
      );

      setSection(null);
      setCode("");


    } catch (error) {

      console.error(
        "Delete Section Error:",
        error
      );

      setError(
        error?.message ||
        "Failed to delete section."
      );

    } finally {

      setDeleting(false);

    }

  };


  return (

    <div className="delete-section-page">

      <div className="delete-section-container">


        <div className="delete-section-header">

          <h1>
            Delete Section
          </h1>

          <p>
            Search a section before deleting it
          </p>

        </div>


        <form
          className="delete-section-search"
          onSubmit={handleSearch}
        >

          <input
            type="text"
            value={code}
            onChange={(event) =>
              setCode(event.target.value)
            }
            placeholder="Enter section code"
            disabled={loading || deleting}
          />

          <button
            type="submit"
            disabled={
              loading ||
              deleting
            }
          >

            {loading
              ? "Searching..."
              : "Find Section"}

          </button>

        </form>


        {error && (

          <div className="delete-section-error">

            {error}

          </div>

        )}


        {success && (

          <div className="delete-section-success">

            {success}

          </div>

        )}


        {loading && (

          <div className="delete-section-loading">

            <div className="delete-section-spinner"></div>

            <span>
              Loading section...
            </span>

          </div>

        )}


        {!loading &&
          section && (

            <div className="delete-section-card">


              <div className="delete-section-card-header">

                <h2>
                  Section Details
                </h2>

              </div>


              <div className="delete-section-details">


                <div>

                  <span>
                    Class
                  </span>

                  <strong>
                    {section.ClassName || "-"}
                  </strong>

                </div>


                <div>

                  <span>
                    Section Code
                  </span>

                  <strong>
                    {section.SectionCode || "-"}
                  </strong>

                </div>


                <div>

                  <span>
                    Section Name
                  </span>

                  <strong>
                    {section.SectionName || "-"}
                  </strong>

                </div>


                <div>

                  <span>
                    Capacity
                  </span>

                  <strong>
                    {section.Capacity ?? 0}
                  </strong>

                </div>


                <div>

                  <span>
                    Room Number
                  </span>

                  <strong>
                    {section.RoomNumber || "-"}
                  </strong>

                </div>


                <div>

                  <span>
                    Status
                  </span>

                  <strong>
                    {section.IsActive
                      ? "Active"
                      : "Inactive"}
                  </strong>

                </div>


              </div>


              <button
                type="button"
                className="delete-section-button"
                onClick={handleDelete}
                disabled={deleting}
              >

                {deleting
                  ? "Deleting..."
                  : "Delete Section"}

              </button>


            </div>

          )}

      </div>

    </div>

  );

};

export default DeleteSection;