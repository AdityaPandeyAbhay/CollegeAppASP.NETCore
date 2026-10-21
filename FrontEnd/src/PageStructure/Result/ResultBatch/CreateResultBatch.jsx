// =====================================================
// CREATE RESULT BATCH
// =====================================================

import { useEffect, useState } from "react";

import {
  createResultBatch,
  getAllResultBatches,
  getExamDropdown,
} from "../../../Services/resultService";

import {
  getAcademicYearDropdown,
  getAllAcademicYear,
} from "../../../Services/academicYearService";

import { getDepartmentDropdown } from "../../../Services/departmentService";

import { getClassDropdown } from "../../../Services/classService";

import { getAllSection } from "../../../Services/sectionService";

import "./CreateResultBatch.css";

const CreateResultBatch = () => {
  // ===================================================
  // FORM
  // ===================================================

  const [formData, setFormData] = useState({
    AcademicYearId: "",
    DepartmentId: "",
    ClassId: "",
    ExamId: "",
  });

  // ===================================================
  // DROPDOWNS & DETECTED SECTIONS
  // ===================================================

  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [sectionsForClass, setSectionsForClass] = useState([]);
  const [exams, setExams] = useState([]);

  // ===================================================
  // UI & POPUP
  // ===================================================

  const [loading, setLoading] = useState(false);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingSections, setLoadingSections] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [popup, setPopup] = useState({
    isOpen: false,
    type: "success", // "success" | "warning" | "error"
    title: "",
    message: "",
  });

  // ===================================================
  // LOAD INITIAL DROPDOWNS
  // ===================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setError("");

      const [yearDataResult, departmentData, examData, sectionData] =
        await Promise.allSettled([
          getAllAcademicYear(),
          getDepartmentDropdown(),
          getExamDropdown(),
          getAllSection(),
        ]);

      let rawYearList = [];
      if (
        yearDataResult.status === "fulfilled" &&
        Array.isArray(yearDataResult.value) &&
        yearDataResult.value.length > 0
      ) {
        rawYearList = yearDataResult.value;
      } else {
        try {
          const dropdownYears = await getAcademicYearDropdown();
          rawYearList = Array.isArray(dropdownYears) ? dropdownYears : [];
        } catch (_) {
          rawYearList = [];
        }
      }

      // Sort descending so the most recently created academic year appears first
      const sortedYears = [...rawYearList].sort((a, b) => {
        const dateA = a.createdDate ?? a.CreatedDate;
        const dateB = b.createdDate ?? b.CreatedDate;
        if (dateA && dateB) {
          const diff = new Date(dateB).getTime() - new Date(dateA).getTime();
          if (diff !== 0) return diff;
        }
        const idA = Number(a.id ?? a.Id ?? 0);
        const idB = Number(b.id ?? b.Id ?? 0);
        return idB - idA;
      });

      setAcademicYears(sortedYears);

      // By default select the most recently created academic year (not first created)
      if (sortedYears.length > 0) {
        const mostRecentYear = sortedYears[0];
        const defaultYearId = String(mostRecentYear.id ?? mostRecentYear.Id);
        setFormData((prev) => ({
          ...prev,
          AcademicYearId: prev.AcademicYearId || defaultYearId,
        }));
      }

      const departmentList =
        departmentData.status === "fulfilled" &&
        Array.isArray(departmentData.value)
          ? departmentData.value
          : [];
      const examList =
        examData.status === "fulfilled" && Array.isArray(examData.value)
          ? examData.value
          : [];
      const sectionList =
        sectionData.status === "fulfilled" && Array.isArray(sectionData.value)
          ? sectionData.value
          : [];

      setDepartments(departmentList);
      setExams(examList);
      setAllSections(sectionList);
    } catch (err) {
      setError(err?.message || "Failed to load dropdown data.");
    }
  };

  // ===================================================
  // GET SECTION CLASS ID HELPER
  // ===================================================

  const getSectionClassId = (section) => {
    if (!section) return null;
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
  // HANDLE CHANGE
  // ===================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");

    // Department changed
    if (name === "DepartmentId") {
      setFormData((previous) => ({
        ...previous,
        DepartmentId: value,
        ClassId: "",
      }));

      setClasses([]);
      setSectionsForClass([]);

      if (value) {
        loadClasses(value);
      }
    }

    // Class changed: filter sections to ONLY those belonging to the selected class
    if (name === "ClassId") {
      setFormData((previous) => ({
        ...previous,
        ClassId: value,
      }));

      if (value) {
        filterSectionsForClass(value);
      } else {
        setSectionsForClass([]);
      }
    }
  };

  // ===================================================
  // LOAD CLASSES BY DEPARTMENT
  // ===================================================

  const loadClasses = async (departmentId) => {
    try {
      setLoadingClasses(true);
      setError("");

      const data = await getClassDropdown(Number(departmentId));

      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      setClasses([]);
      setError(err?.message || "Failed to load classes.");
    } finally {
      setLoadingClasses(false);
    }
  };

  // ===================================================
  // FILTER SECTIONS FOR SELECTED CLASS
  // ===================================================

  const filterSectionsForClass = async (classId) => {
    try {
      setLoadingSections(true);
      setError("");

      let sourceSections = allSections;

      if (!sourceSections || sourceSections.length === 0) {
        const freshSections = await getAllSection();
        sourceSections = Array.isArray(freshSections) ? freshSections : [];
        setAllSections(sourceSections);
      }

      const filtered = sourceSections.filter((section) => {
        const sClassId = getSectionClassId(section);
        return sClassId !== null && String(sClassId) === String(classId);
      });

      setSectionsForClass(filtered);
    } catch (err) {
      setSectionsForClass([]);
      setError(err?.message || "Failed to load sections for selected class.");
    } finally {
      setLoadingSections(false);
    }
  };

  // ===================================================
  // SUBMIT (CREATE BATCHES FOR ALL SECTIONS OF CLASS)
  // ===================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!formData.AcademicYearId) {
      setError("Academic Year is required.");
      return;
    }

    if (!formData.DepartmentId) {
      setError("Department is required.");
      return;
    }

    if (!formData.ClassId) {
      setError("Class is required.");
      return;
    }

    if (!formData.ExamId) {
      setError("Exam is required.");
      return;
    }

    if (!sectionsForClass || sectionsForClass.length === 0) {
      setError(
        "No sections found for this Class. A result batch must apply to at least one section. Please add sections to this class first.",
      );
      return;
    }

    try {
      setLoading(true);

      // 1. Fetch existing batches to check for duplicates
      let existingBatches = [];
      try {
        const fetched = await getAllResultBatches();
        if (Array.isArray(fetched)) {
          existingBatches = fetched;
        }
      } catch (err) {
        console.warn("Could not fetch existing batches before create:", err);
      }

      const createdSections = [];
      const skippedSections = [];
      const failedSections = [];

      // 2. Loop through every section of the class
      for (const section of sectionsForClass) {
        const secId = Number(section.id ?? section.Id);
        const secName = getSectionText(section);

        const duplicate = existingBatches.find(
          (b) =>
            Number(b.academicYearId ?? b.AcademicYearId) ===
              Number(formData.AcademicYearId) &&
            Number(b.classId ?? b.ClassId) === Number(formData.ClassId) &&
            Number(b.sectionId ?? b.SectionId) === secId &&
            Number(b.examId ?? b.ExamId) === Number(formData.ExamId),
        );

        if (duplicate) {
          skippedSections.push(secName);
          continue;
        }

        try {
          await createResultBatch({
            AcademicYearId: Number(formData.AcademicYearId),
            ClassId: Number(formData.ClassId),
            SectionId: secId,
            ExamId: Number(formData.ExamId),
            Students: [],
          });
          createdSections.push(secName);
        } catch (subErr) {
          failedSections.push({
            section: secName,
            error: subErr?.message || "Creation error",
          });
        }
      }

      // 3. Inform user of the outcome
      if (createdSections.length > 0) {
        let msg = `Result batch created successfully for ${createdSections.length} section(s): ${createdSections.join(", ")}.`;
        if (skippedSections.length > 0) {
          msg += ` (${skippedSections.join(", ")} already had a batch for this exam).`;
        }

        setPopup({
          isOpen: true,
          type: "success",
          title: "Result Batches Created",
          message: msg,
        });

        // Reset form but retain default most recently created academic year
        const defaultYearId =
          academicYears.length > 0
            ? String(academicYears[0].id ?? academicYears[0].Id)
            : "";

        setFormData({
          AcademicYearId: defaultYearId,
          DepartmentId: "",
          ClassId: "",
          ExamId: "",
        });

        setClasses([]);
        setSectionsForClass([]);
      } else if (skippedSections.length > 0 && failedSections.length === 0) {
        setPopup({
          isOpen: true,
          type: "warning",
          title: "Batches Already Exist",
          message: `Result batches already exist for all sections of this Class (${skippedSections.join(", ")}) for the selected Exam.`,
        });
      } else {
        const firstError =
          failedSections[0]?.error || "Failed to create result batches.";
        setPopup({
          isOpen: true,
          type: "error",
          title: "Creation Failed",
          message: firstError,
        });
      }
    } catch (err) {
      setPopup({
        isOpen: true,
        type: "error",
        title: "Creation Failed",
        message: err?.message || "Failed to create result batch.",
      });
    } finally {
      setLoading(false);
    }
  };

  // ===================================================
  // RESET
  // ===================================================

  const handleReset = () => {
    const defaultYearId =
      academicYears.length > 0
        ? String(academicYears[0].id ?? academicYears[0].Id)
        : "";

    setFormData({
      AcademicYearId: defaultYearId,
      DepartmentId: "",
      ClassId: "",
      ExamId: "",
    });

    setClasses([]);
    setSectionsForClass([]);

    setError("");
    setSuccess("");
  };

  // ===================================================
  // DISPLAY HELPERS (NO IDs SHOWN)
  // ===================================================

  const getId = (item) => {
    if (!item) return "";
    return String(item.id ?? item.Id ?? "");
  };

  const getAcademicYearText = (item) => {
    if (!item) return "";
    return (
      item.yearName ||
      item.YearName ||
      item.text ||
      item.Text ||
      item.name ||
      item.Name ||
      ""
    ).trim();
  };

  const getDepartmentText = (item) => {
    if (!item) return "";
    return (
      item.departmentName ||
      item.DepartmentName ||
      item.text ||
      item.Text ||
      item.name ||
      item.Name ||
      ""
    ).trim();
  };

  const getClassText = (item) => {
    if (!item) return "";
    return (
      item.className ||
      item.ClassName ||
      item.text ||
      item.Text ||
      item.name ||
      item.Name ||
      item.classCode ||
      item.ClassCode ||
      ""
    ).trim();
  };

  const getSectionText = (item) => {
    if (!item) return "";
    return (
      item.sectionName ||
      item.SectionName ||
      item.text ||
      item.Text ||
      item.name ||
      item.Name ||
      item.sectionCode ||
      item.SectionCode ||
      ""
    ).trim();
  };

  const getExamText = (item) => {
    if (!item) return "";
    return (
      item.examName ||
      item.ExamName ||
      item.text ||
      item.Text ||
      item.name ||
      item.Name ||
      ""
    ).trim();
  };

  const getText = (item) =>
    (
      item?.sectionName ||
      item?.SectionName ||
      item?.text ||
      item?.Text ||
      item?.yearName ||
      item?.YearName ||
      item?.departmentName ||
      item?.DepartmentName ||
      item?.className ||
      item?.ClassName ||
      item?.examName ||
      item?.ExamName ||
      item?.name ||
      item?.Name ||
      item?.sectionCode ||
      item?.SectionCode ||
      ""
    ).trim();

  // ===================================================
  // JSX
  // ===================================================

  return (
    <div className="create-result-batch-page">
      <div className="create-result-batch-card">
        <div className="result-batch-header">
          <h2>Create Result Batch</h2>

          <p>
            Select Academic Year, Department, Class, and Exam. The result batch
            will automatically be created and applied to{" "}
            <strong>all sections</strong> belonging to the selected Class.
          </p>
        </div>

        {error && <div className="result-error">{error}</div>}

        {success && <div className="result-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          {/* =============================== */}
          {/* ACADEMIC YEAR */}
          {/* =============================== */}

          <div className="result-form-group">
            <label>
              Academic Year
              <span>*</span>
            </label>

            <select
              name="AcademicYearId"
              value={formData.AcademicYearId}
              onChange={handleChange}
            >
              <option value="">-- Select Academic Year --</option>

              {academicYears.map((item) => (
                <option key={getId(item)} value={getId(item)}>
                  {getAcademicYearText(item)}
                </option>
              ))}
            </select>
          </div>

          {/* =============================== */}
          {/* DEPARTMENT */}
          {/* =============================== */}

          <div className="result-form-group">
            <label>
              Department
              <span>*</span>
            </label>

            <select
              name="DepartmentId"
              value={formData.DepartmentId}
              onChange={handleChange}
            >
              <option value="">-- Select Department --</option>

              {departments.map((item) => (
                <option key={getId(item)} value={getId(item)}>
                  {getDepartmentText(item)}
                </option>
              ))}
            </select>
          </div>

          {/* =============================== */}
          {/* CLASS */}
          {/* =============================== */}

          <div className="result-form-group">
            <label>
              Class
              <span>*</span>
            </label>

            <select
              name="ClassId"
              value={formData.ClassId}
              onChange={handleChange}
              disabled={!formData.DepartmentId || loadingClasses}
            >
              <option value="">
                {loadingClasses
                  ? "Loading classes..."
                  : !formData.DepartmentId
                    ? "-- Select Department First --"
                    : "-- Select Class --"}
              </option>

              {classes.map((item) => (
                <option key={getId(item)} value={getId(item)}>
                  {getClassText(item)}
                </option>
              ))}
            </select>

            {!formData.DepartmentId && (
              <small>Please select a Department first.</small>
            )}
          </div>

          {/* =============================== */}
          {/* TARGET SECTIONS PREVIEW (AUTO APPLIED) */}
          {/* =============================== */}

          {formData.ClassId && (
            <div className="result-form-group target-sections-group">
              <label>Target Sections (Applied Automatically)</label>
              {loadingSections ? (
                <div className="target-sections-loading">
                  Loading sections for selected class...
                </div>
              ) : sectionsForClass.length > 0 ? (
                <div className="target-sections-card">
                  <div className="target-sections-header">
                    <span className="sections-count-tag">
                      {sectionsForClass.length} Section
                      {sectionsForClass.length > 1 ? "s" : ""} Found
                    </span>
                    <small>
                      Result batch will be created and applied for every section
                      listed below:
                    </small>
                  </div>
                  <div className="sections-badges-wrap">
                    {sectionsForClass.map((sec) => (
                      <span key={getId(sec)} className="section-badge-item">
                        ✓ {getSectionText(sec)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="target-sections-empty-warning">
                  ⚠️ No sections found for this class. Please assign sections to
                  this class first.
                </div>
              )}
            </div>
          )}

          {/* =============================== */}
          {/* EXAM */}
          {/* =============================== */}

          <div className="result-form-group">
            <label>
              Exam
              <span>*</span>
            </label>

            <select
              name="ExamId"
              value={formData.ExamId}
              onChange={handleChange}
            >
              <option value="">-- Select Exam --</option>

              {exams.map((item) => (
                <option key={getId(item)} value={getId(item)}>
                  {getExamText(item)}
                </option>
              ))}
            </select>
          </div>

          {/* =============================== */}
          {/* BUTTONS */}
          {/* =============================== */}

          <div className="result-form-actions">
            <button
              type="submit"
              className="result-primary-button"
              disabled={
                loading || (formData.ClassId && sectionsForClass.length === 0)
              }
            >
              {loading
                ? "Creating Batches..."
                : sectionsForClass.length > 1
                  ? `Create Result Batch for ${sectionsForClass.length} Sections`
                  : "Create Result Batch"}
            </button>

            <button
              type="button"
              className="result-secondary-button"
              onClick={handleReset}
              disabled={loading}
            >
              Reset
            </button>
          </div>
        </form>
      </div>

      {/* =============================== */}
      {/* POPUP MODAL DIALOG */}
      {/* =============================== */}

      {popup.isOpen && (
        <div className="result-modal-overlay">
          <div className={`result-modal-card ${popup.type}`}>
            <div className={`result-modal-icon ${popup.type}`}>
              {popup.type === "success" && "✓"}
              {popup.type === "warning" && "⚠"}
              {popup.type === "error" && "✕"}
            </div>

            <h3>{popup.title}</h3>

            <p>{popup.message}</p>

            <button
              type="button"
              className="result-modal-btn"
              onClick={() => setPopup({ ...popup, isOpen: false })}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateResultBatch;
