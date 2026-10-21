// =====================================================
// UPDATE RESULT BATCH
// =====================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getExamDropdown,
  getAllResultBatches,
} from "../../../Services/resultService";

import {
  getAllClass,
  addDepartmentNames,
} from "../../../Services/classService";

import { getDepartmentDropdown } from "../../../Services/departmentService";

import "./UpdateResultBatch.css";

const UpdateResultBatch = () => {
  const navigate = useNavigate();

  const [exams, setExams] = useState([]);
  const [selectedExamId, setSelectedExamId] = useState("");

  const [allBatches, setAllBatches] = useState([]);
  const [unpublishedBatches, setUnpublishedBatches] = useState([]);
  const [classDepartmentMap, setClassDepartmentMap] = useState({});
  const [departmentMap, setDepartmentMap] = useState({});

  const [loadingExams, setLoadingExams] = useState(false);
  const [loadingBatches, setLoadingBatches] = useState(false);

  const [error, setError] = useState("");

  // ===================================================
  // LOAD EXAMS AND CLASS MAPPING
  // ===================================================

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoadingExams(true);
      setError("");

      const [examData, rawClassData, deptData] = await Promise.all([
        getExamDropdown().catch(() => []),
        getAllClass().catch(() => []),
        getDepartmentDropdown().catch(() => []),
      ]);

      const examList = Array.isArray(examData) ? examData : [];
      setExams(examList);

      // Build DepartmentId -> DepartmentName lookup
      const deptLookup = {};
      const deptList = Array.isArray(deptData) ? deptData : [];
      deptList.forEach((d) => {
        const dId = d.id ?? d.Id;
        const dName =
          d.text ??
          d.Text ??
          d.name ??
          d.Name ??
          d.departmentName ??
          d.DepartmentName ??
          "";
        if (dId !== undefined && dId !== null) {
          deptLookup[String(dId)] = dName;
        }
      });
      setDepartmentMap(deptLookup);

      // Enrich classes with department names
      let enrichedClasses = rawClassData;
      try {
        if (Array.isArray(rawClassData) && rawClassData.length > 0) {
          enrichedClasses = await addDepartmentNames(rawClassData);
        }
      } catch (_) {
        enrichedClasses = rawClassData;
      }

      // Build ClassId -> DepartmentName and ClassName -> DepartmentName mapping
      const mapping = {};
      if (Array.isArray(enrichedClasses)) {
        enrichedClasses.forEach((c) => {
          const cId = c.id ?? c.Id;
          const deptId =
            c.departmentId ??
            c.DepartmentId ??
            c.Department?.id ??
            c.Department?.Id;

          const dept =
            (c.DepartmentName && String(c.DepartmentName).trim() !== ""
              ? String(c.DepartmentName).trim()
              : null) ??
            (c.departmentName && String(c.departmentName).trim() !== ""
              ? String(c.departmentName).trim()
              : null) ??
            (c.Department?.departmentName &&
            String(c.Department.departmentName).trim() !== ""
              ? String(c.Department.departmentName).trim()
              : null) ??
            (c.Department?.DepartmentName &&
            String(c.Department.DepartmentName).trim() !== ""
              ? String(c.Department.DepartmentName).trim()
              : null) ??
            (c.Department?.name && String(c.Department.name).trim() !== ""
              ? String(c.Department.name).trim()
              : null) ??
            (c.Department?.Name && String(c.Department.Name).trim() !== ""
              ? String(c.Department.Name).trim()
              : null) ??
            (deptId !== undefined &&
            deptId !== null &&
            deptLookup[String(deptId)]
              ? deptLookup[String(deptId)]
              : "") ??
            "";

          if (cId !== undefined && cId !== null) {
            mapping[String(cId)] = dept;
          }

          const cName = c.className ?? c.ClassName;
          if (cName && typeof cName === "string" && cName.trim() !== "") {
            mapping[`name_${cName.trim().toLowerCase()}`] = dept;
          }
        });
      }
      setClassDepartmentMap(mapping);
    } catch (err) {
      setError(err?.message || "Failed to load initial data.");
    } finally {
      setLoadingExams(false);
    }
  };

  // ===================================================
  // EXAM CHANGE
  // ===================================================

  const handleExamChange = async (e) => {
    const examId = e.target.value;
    setSelectedExamId(examId);
    setError("");
    setUnpublishedBatches([]);

    if (!examId) return;

    try {
      setLoadingBatches(true);

      // Lazy fallback if class-department map is empty
      if (Object.keys(classDepartmentMap).length === 0) {
        try {
          const [rawClasses, depts] = await Promise.all([
            getAllClass().catch(() => []),
            getDepartmentDropdown().catch(() => []),
          ]);
          const dLookup = {};
          (Array.isArray(depts) ? depts : []).forEach((d) => {
            const dId = d.id ?? d.Id;
            const dName = d.text ?? d.Text ?? d.name ?? d.Name ?? "";
            if (dId !== undefined && dId !== null) dLookup[String(dId)] = dName;
          });
          const enriched = await addDepartmentNames(rawClasses).catch(
            () => rawClasses,
          );
          const cMap = {};
          (Array.isArray(enriched) ? enriched : []).forEach((c) => {
            const cId = c.id ?? c.Id;
            const dId = c.departmentId ?? c.DepartmentId;
            const dept =
              (c.DepartmentName && String(c.DepartmentName).trim()) ||
              (c.departmentName && String(c.departmentName).trim()) ||
              dLookup[String(dId)] ||
              "";
            if (cId !== undefined && cId !== null) cMap[String(cId)] = dept;
            const cName = c.className ?? c.ClassName;
            if (cName)
              cMap[`name_${String(cName).trim().toLowerCase()}`] = dept;
          });
          setDepartmentMap(dLookup);
          setClassDepartmentMap(cMap);
        } catch (_) {}
      }

      const batches = await getAllResultBatches();
      const list = Array.isArray(batches) ? batches : [];
      setAllBatches(list);

      // Filter for this exam and only unpublished batches
      const filtered = list.filter((b) => {
        const bExamId = String(b.examId ?? b.ExamId);
        const isPub = Boolean(b.isPublished ?? b.IsPublished);
        return bExamId === String(examId) && !isPub;
      });

      setUnpublishedBatches(filtered);
    } catch (err) {
      setError(err?.message || "Failed to load result batches.");
    } finally {
      setLoadingBatches(false);
    }
  };

  // ===================================================
  // SELECT UNPUBLISHED BATCH -> REDIRECT TO PUBLISH PAGE
  // ===================================================

  const handleSelectBatch = (batch) => {
    navigate("/result-batch/publish", {
      state: {
        batchId: batch.id ?? batch.Id,
        examId: selectedExamId,
        batchData: {
          ...batch,
          departmentName: getDepartment(batch),
        },
      },
    });
  };

  // ===================================================
  // HELPER FOR DEPARTMENT
  // ===================================================

  const getDepartment = (batch) => {
    // 1. Explicit department name on batch
    const explicit =
      batch.departmentName ??
      batch.DepartmentName ??
      batch.department ??
      batch.Department;
    if (explicit && typeof explicit === "string" && explicit.trim() !== "") {
      return explicit.trim();
    }

    // 2. Department ID on batch
    const batchDeptId =
      batch.departmentId ??
      batch.DepartmentId ??
      batch.Department?.id ??
      batch.Department?.Id;
    if (
      batchDeptId !== undefined &&
      batchDeptId !== null &&
      departmentMap[String(batchDeptId)]
    ) {
      return departmentMap[String(batchDeptId)];
    }

    // 3. ClassId in classDepartmentMap
    const classId = batch.classId ?? batch.ClassId;
    if (
      classId !== undefined &&
      classId !== null &&
      classDepartmentMap[String(classId)]
    ) {
      return classDepartmentMap[String(classId)];
    }

    // 4. ClassName in classDepartmentMap
    const className = batch.className ?? batch.ClassName;
    if (className && typeof className === "string" && className.trim() !== "") {
      const byName =
        classDepartmentMap[`name_${className.trim().toLowerCase()}`];
      if (byName) return byName;
    }

    return "-";
  };

  // ===================================================
  // JSX
  // ===================================================

  return (
    <div className="update-result-batch-page">
      <div className="update-result-batch-card">
        <div className="update-result-batch-header">
          <h2>Update Result Batch</h2>
          <p>
            Select an exam to view its unpublished result batches, then proceed
            to publish and verify all details.
          </p>
        </div>

        {error && <div className="update-result-batch-error">{error}</div>}

        {/* =================================================
            EXAM DROPDOWN (NO IDs SHOWN)
            ================================================= */}

        <div className="update-result-batch-filter">
          <label htmlFor="update-batch-exam-select">Select Exam</label>
          <select
            id="update-batch-exam-select"
            value={selectedExamId}
            onChange={handleExamChange}
            disabled={loadingExams || loadingBatches}
          >
            <option value="">
              {loadingExams ? "Loading Exams..." : "-- Select Exam --"}
            </option>

            {exams.map((exam) => (
              <option key={exam.id ?? exam.Id} value={exam.id ?? exam.Id}>
                {exam.text ?? exam.Text ?? exam.examName ?? exam.ExamName}
              </option>
            ))}
          </select>
        </div>

        {/* =================================================
            UNPUBLISHED BATCHES TABLE (STRICTLY NO IDs SHOWN)
            ================================================= */}

        {loadingBatches && (
          <div className="update-result-batch-loading">
            Loading unpublished result batches...
          </div>
        )}

        {!loadingBatches && selectedExamId && (
          <div className="update-result-batch-content">
            {unpublishedBatches.length === 0 ? (
              <div className="update-result-batch-empty">
                No unpublished result batches found for this exam. All batches
                are published or no batches exist.
              </div>
            ) : (
              <div className="update-result-batch-table-wrapper">
                <div className="update-result-batch-table-title">
                  Unpublished Result Batches ({unpublishedBatches.length})
                </div>

                <table className="update-result-batch-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Academic Year</th>
                      <th>Department</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th>Exam</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {unpublishedBatches.map((batch, index) => (
                      <tr key={batch.id ?? batch.Id ?? index}>
                        <td>{index + 1}</td>

                        <td>
                          {batch.academicYear ?? batch.AcademicYear ?? "-"}
                        </td>

                        <td>{getDepartment(batch)}</td>

                        <td>{batch.className ?? batch.ClassName ?? "-"}</td>

                        <td>{batch.sectionName ?? batch.SectionName ?? "-"}</td>

                        <td>{batch.examName ?? batch.ExamName ?? "-"}</td>

                        <td>
                          <span className="batch-status-pending">
                            Not Published
                          </span>
                        </td>

                        <td>
                          <button
                            type="button"
                            className="update-batch-proceed-btn"
                            onClick={() => handleSelectBatch(batch)}
                          >
                            Proceed to Publish
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {!selectedExamId && !loadingExams && (
          <div className="update-result-batch-placeholder">
            Please select an exam from the dropdown above to display its
            unpublished result batches.
          </div>
        )}
      </div>
    </div>
  );
};

export default UpdateResultBatch;
