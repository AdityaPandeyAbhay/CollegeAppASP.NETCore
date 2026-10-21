// =====================================================
// UPDATE STUDENT FEE
// =====================================================

import { useEffect, useState, useMemo } from "react";

import {
  getAllStudentFees,
  getStudentFeeById,
  updateStudentFee,
  getStudentFeeClassDropdown,
  getStudentFeeSectionDropdown,
  getStudentFeeStudentDropdown,
  parseStudentFeeErrorMessage,
} from "../../Services/studentFeeService";
import { getAllStudentsWithDetails } from "../../Services/studentService";
import { getAllFeeStructures } from "../../Services/feeStructureService";
import { getAllAcademicYear } from "../../Services/academicYearService";
import { getDepartmentDropdown } from "../../Services/departmentService";
import { getClassDropdown } from "../../Services/classService";
import FeePopupModal from "../FeeStructure/FeePopupModal";

import "./UpdateStudentFee.css";

const UpdateStudentFee = () => {
  // Direct ID search state
  const [searchId, setSearchId] = useState("");

  // Master datasets
  const [allStudentFees, setAllStudentFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [defaultAcademicYearId, setDefaultAcademicYearId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);

  // Filter toolbar states
  const [filterSearch, setFilterSearch] = useState("");
  const [filterAcademicYear, setFilterAcademicYear] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Form dependent dropdowns
  const [formClasses, setFormClasses] = useState([]);
  const [formSections, setFormSections] = useState([]);
  const [formStudents, setFormStudents] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    Id: "",
    DepartmentId: "",
    ClassId: "",
    SectionId: "",
    StudentId: "",
    FeeStructureId: "",
    Discount: 0,
    Fine: 0,
    PaidAmount: 0,
    DueDate: "",
  });

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState(false);
  const [selectedRecordSummary, setSelectedRecordSummary] = useState(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [popup, setPopup] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  });

  // =====================================================
  // LOAD MASTER DATA ON MOUNT
  // =====================================================

  const loadInitialData = async () => {
    try {
      setLoadingInitial(true);
      setError("");

      const [
        feesData,
        studentsData,
        structuresData,
        academicYearsData,
        departmentsData,
        classesData,
      ] = await Promise.all([
        getAllStudentFees().catch(() => []),
        getAllStudentsWithDetails().catch(() => []),
        getAllFeeStructures().catch(() => []),
        getAllAcademicYear().catch(() => []),
        getDepartmentDropdown().catch(() => []),
        getClassDropdown().catch(() => []),
      ]);

      const feesArr = Array.isArray(feesData) ? feesData : [];
      const studentsArr = Array.isArray(studentsData) ? studentsData : [];
      const structuresArr = Array.isArray(structuresData) ? structuresData : [];
      const ayArr = Array.isArray(academicYearsData) ? academicYearsData : [];
      const deptArr = Array.isArray(departmentsData) ? departmentsData : [];
      const clsArr = Array.isArray(classesData) ? classesData : [];

      setAllStudentFees(feesArr);
      setStudents(studentsArr);
      setFeeStructures(structuresArr);
      setAcademicYears(ayArr);
      setDepartments(deptArr);
      setClasses(clsArr);

      // Default Academic Year to latest created
      if (ayArr.length > 0) {
        const sorted = [...ayArr].sort((a, b) => {
          const idA = Number(a.Id ?? a.id ?? 0);
          const idB = Number(b.Id ?? b.id ?? 0);
          return idB - idA;
        });
        const latestId = String(sorted[0]?.Id ?? sorted[0]?.id ?? "");
        setDefaultAcademicYearId(latestId);
        setFilterAcademicYear(latestId);
      }
    } catch (err) {
      setError(err.message || "Failed to load master student fee data.");
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Quick lookup maps
  const studentMap = useMemo(() => {
    const map = {};
    students.forEach((s) => {
      const sId = String(s.Id ?? s.id ?? s.StudentId ?? s.studentId);
      map[sId] = s;
    });
    return map;
  }, [students]);

  const feeStructureMap = useMemo(() => {
    const map = {};
    feeStructures.forEach((fs) => {
      const fsId = String(fs.Id ?? fs.id);
      map[fsId] = fs;
    });
    return map;
  }, [feeStructures]);

  const academicYearMap = useMemo(() => {
    const map = {};
    academicYears.forEach((ay) => {
      const id = String(ay.Id ?? ay.id);
      const name = ay.Name ?? ay.name ?? ay.YearName ?? ay.yearName ?? id;
      map[id] = name;
    });
    return map;
  }, [academicYears]);

  // =====================================================
  // ENRICHED STUDENT FEE DIRECTORY
  // =====================================================

  const enrichedFeeRecords = useMemo(() => {
    return allStudentFees.map((fee) => {
      const feeId = fee.Id ?? fee.id;
      const sId = String(fee.StudentId ?? fee.studentId ?? "");
      const fsId = String(fee.FeeStructureId ?? fee.feeStructureId ?? "");

      const student = studentMap[sId];
      const structure = feeStructureMap[fsId];

      const studentName = student
        ? `${student.FirstName || ""} ${student.LastName || ""}`.trim() ||
          student.StudentName ||
          student.studentName ||
          `Student #${sId}`
        : fee.StudentName || `Student #${sId}`;

      const admissionNumber =
        student?.AdmissionNumber ||
        student?.admissionNumber ||
        fee.AdmissionNumber ||
        "-";

      const deptId =
        student?.DepartmentId ??
        student?.departmentId ??
        structure?.DepartmentId ??
        structure?.departmentId ??
        "";
      const deptName =
        student?.DepartmentName ||
        student?.departmentName ||
        structure?.DepartmentName ||
        structure?.departmentName ||
        "-";

      const clsId =
        student?.ClassId ??
        student?.classId ??
        structure?.ClassId ??
        structure?.classId ??
        "";
      const clsName =
        student?.ClassName ||
        student?.className ||
        structure?.ClassName ||
        structure?.className ||
        "-";

      const secId = student?.SectionId ?? student?.sectionId ?? "";
      const secName = student?.SectionName || student?.sectionName || "-";

      const ayId = structure?.AcademicYearId ?? structure?.academicYearId ?? "";
      const ayName =
        academicYearMap[String(ayId)] ||
        structure?.AcademicYearName ||
        structure?.academicYearName ||
        "-";

      const feeName =
        structure?.FeeCategoryName ||
        structure?.categoryName ||
        structure?.Description ||
        structure?.description ||
        structure?.Name ||
        `Fee Structure #${fsId}`;

      const totalAmount = Number(
        fee.TotalAmount ?? fee.totalAmount ?? fee.Amount ?? fee.amount ?? 0,
      );
      const paidAmount = Number(fee.PaidAmount ?? fee.paidAmount ?? 0);
      const balanceAmount = Number(
        fee.BalanceAmount !== undefined
          ? fee.BalanceAmount
          : fee.balanceAmount !== undefined
            ? fee.balanceAmount
            : Math.max(0, totalAmount - paidAmount),
      );

      const status =
        fee.Status ||
        fee.status ||
        (balanceAmount <= 0 ? "Paid" : paidAmount > 0 ? "Partial" : "Pending");

      return {
        id: feeId,
        studentId: sId,
        studentName,
        admissionNumber,
        departmentId: deptId,
        departmentName: deptName,
        classId: clsId,
        className: clsName,
        sectionId: secId,
        sectionName: secName,
        academicYearId: ayId,
        academicYearName: ayName,
        feeStructureId: fsId,
        feeStructureName: feeName,
        invoiceNo: fee.InvoiceNo ?? fee.invoiceNo ?? "-",
        discount: Number(fee.Discount ?? fee.discount ?? 0),
        fine: Number(fee.Fine ?? fee.fine ?? 0),
        totalAmount,
        paidAmount,
        balanceAmount,
        dueDate: fee.DueDate ? String(fee.DueDate).substring(0, 10) : "",
        status,
        rawFee: fee,
      };
    });
  }, [allStudentFees, studentMap, feeStructureMap, academicYearMap]);

  // =====================================================
  // FILTERED STUDENT FEE DIRECTORY
  // =====================================================

  const filteredFeeRecords = useMemo(() => {
    return enrichedFeeRecords.filter((item) => {
      // Search
      if (filterSearch.trim()) {
        const query = filterSearch.toLowerCase().trim();
        const matchId = String(item.id).toLowerCase().includes(query);
        const matchName = item.studentName.toLowerCase().includes(query);
        const matchAdm = item.admissionNumber.toLowerCase().includes(query);
        const matchInv = item.invoiceNo.toLowerCase().includes(query);
        const matchFeeName = item.feeStructureName
          .toLowerCase()
          .includes(query);
        if (!matchId && !matchName && !matchAdm && !matchInv && !matchFeeName) {
          return false;
        }
      }

      // Academic Year
      if (
        filterAcademicYear &&
        String(item.academicYearId) !== String(filterAcademicYear)
      ) {
        return false;
      }

      // Department
      if (
        filterDepartment &&
        String(item.departmentId) !== String(filterDepartment)
      ) {
        return false;
      }

      // Class
      if (filterClass && String(item.classId) !== String(filterClass)) {
        return false;
      }

      // Status
      if (filterStatus !== "ALL") {
        if (item.status.toLowerCase() !== filterStatus.toLowerCase()) {
          return false;
        }
      }

      return true;
    });
  }, [
    enrichedFeeRecords,
    filterSearch,
    filterAcademicYear,
    filterDepartment,
    filterClass,
    filterStatus,
  ]);

  const handleResetFilters = () => {
    setFilterSearch("");
    setFilterAcademicYear(defaultAcademicYearId);
    setFilterDepartment("");
    setFilterClass("");
    setFilterStatus("ALL");
  };

  // =====================================================
  // LOAD FEE RECORD FOR EDITING
  // =====================================================

  const loadFeeForEditing = async (targetId) => {
    setError("");
    setMessage("");
    setFound(false);

    if (!targetId) {
      setError("Please select or enter a valid Student Fee ID.");
      return;
    }

    try {
      setSearching(true);

      const fee = await getStudentFeeById(targetId);
      if (!fee || !fee.Id) {
        setError(`Student Fee record with ID ${targetId} not found.`);
        return;
      }

      const sId = String(fee.StudentId ?? fee.studentId ?? "");
      const student = studentMap[sId];

      const deptId = student?.DepartmentId ?? student?.departmentId ?? "";
      const clsId = student?.ClassId ?? student?.classId ?? "";
      const secId = student?.SectionId ?? student?.sectionId ?? "";

      // Load cascading dropdowns for form
      if (deptId) {
        try {
          const clsData = await getStudentFeeClassDropdown(deptId);
          setFormClasses(Array.isArray(clsData) ? clsData : []);
        } catch {
          setFormClasses([]);
        }
      } else {
        setFormClasses([]);
      }

      if (clsId) {
        try {
          const secData = await getStudentFeeSectionDropdown(clsId);
          setFormSections(Array.isArray(secData) ? secData : []);
        } catch {
          setFormSections([]);
        }
      } else {
        setFormSections([]);
      }

      if (deptId && clsId && secId) {
        try {
          const stuData = await getStudentFeeStudentDropdown(
            deptId,
            clsId,
            secId,
          );
          setFormStudents(Array.isArray(stuData) ? stuData : []);
        } catch {
          setFormStudents([]);
        }
      } else {
        setFormStudents([]);
      }

      const matchedRecord = enrichedFeeRecords.find(
        (r) => String(r.id) === String(fee.Id),
      );
      setSelectedRecordSummary(matchedRecord || null);

      setFormData({
        Id: fee.Id ?? "",
        DepartmentId: deptId,
        ClassId: clsId,
        SectionId: secId,
        StudentId: sId,
        FeeStructureId: fee.FeeStructureId ?? "",
        Discount: fee.Discount ?? 0,
        Fine: fee.Fine ?? 0,
        PaidAmount: fee.PaidAmount ?? 0,
        DueDate: fee.DueDate ? String(fee.DueDate).substring(0, 10) : "",
      });

      setSearchId(String(fee.Id));
      setFound(true);

      // Smooth scroll to edit form
      setTimeout(() => {
        const formElem = document.getElementById(
          "student-fee-edit-form-section",
        );
        if (formElem) {
          formElem.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }, 100);
    } catch (err) {
      setError(parseStudentFeeErrorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const handleDirectSearch = (e) => {
    e.preventDefault();
    if (!searchId.trim()) {
      setError("Please enter a Student Fee ID to search.");
      return;
    }
    loadFeeForEditing(searchId.trim());
  };

  // =====================================================
  // FORM FIELD CHANGES & LIVE COMPUTATIONS
  // =====================================================

  const handleFormChange = async (e) => {
    const { name, value } = e.target;

    setMessage("");
    setError("");

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "DepartmentId") {
      setFormClasses([]);
      setFormSections([]);
      setFormStudents([]);

      setFormData((prev) => ({
        ...prev,
        DepartmentId: value,
        ClassId: "",
        SectionId: "",
        StudentId: "",
      }));

      if (value) {
        try {
          const data = await getStudentFeeClassDropdown(value);
          setFormClasses(Array.isArray(data) ? data : []);
        } catch (err) {
          setError(err.message);
        }
      }
    }

    if (name === "ClassId") {
      setFormSections([]);
      setFormStudents([]);

      setFormData((prev) => ({
        ...prev,
        ClassId: value,
        SectionId: "",
        StudentId: "",
      }));

      if (value) {
        try {
          const data = await getStudentFeeSectionDropdown(value);
          setFormSections(Array.isArray(data) ? data : []);
        } catch (err) {
          setError(err.message);
        }
      }
    }

    if (name === "SectionId") {
      setFormStudents([]);

      setFormData((prev) => ({
        ...prev,
        SectionId: value,
        StudentId: "",
      }));

      if (value && formData.DepartmentId && formData.ClassId) {
        try {
          const data = await getStudentFeeStudentDropdown(
            formData.DepartmentId,
            formData.ClassId,
            value,
          );
          setFormStudents(Array.isArray(data) ? data : []);
        } catch (err) {
          setError(err.message);
        }
      }
    }
  };

  // Compute live amounts for preview
  const liveCalculation = useMemo(() => {
    const matchedFs = feeStructureMap[String(formData.FeeStructureId)];
    const baseAmount = Number(matchedFs?.Amount ?? matchedFs?.amount ?? 0);
    const discount = Number(formData.Discount || 0);
    const fine = Number(formData.Fine || 0);
    const netTotal = Math.max(0, baseAmount - discount + fine);
    const paid = Number(formData.PaidAmount || 0);
    const balance = Math.max(0, netTotal - paid);

    return {
      baseAmount,
      discount,
      fine,
      netTotal,
      paid,
      balance,
    };
  }, [
    formData.FeeStructureId,
    formData.Discount,
    formData.Fine,
    formData.PaidAmount,
    feeStructureMap,
  ]);

  // =====================================================
  // SUBMIT UPDATE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.Id) {
      setError("Please search or select a Student Fee record first.");
      return;
    }

    try {
      setLoading(true);

      await updateStudentFee(formData.Id, {
        StudentId: Number(formData.StudentId),
        FeeStructureId: Number(formData.FeeStructureId),
        Discount: Number(formData.Discount || 0),
        Fine: Number(formData.Fine || 0),
        PaidAmount: Number(formData.PaidAmount || 0),
        DueDate: formData.DueDate,
      });

      const successMsg = `Student Fee #${formData.Id} updated successfully.`;
      setMessage(successMsg);
      setPopup({
        show: true,
        type: "success",
        title: "Fee Record Updated",
        message: successMsg,
      });

      // Reload all student fees to reflect latest data in directory
      const updatedFees = await getAllStudentFees().catch(() => []);
      if (Array.isArray(updatedFees)) {
        setAllStudentFees(updatedFees);
      }
    } catch (err) {
      const errorMsg = parseStudentFeeErrorMessage(err);
      setError(errorMsg);
      setPopup({
        show: true,
        type: "error",
        title: "Update Failed",
        message: errorMsg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-student-fee-page">
      <div className="update-student-fee-container">
        {/* Header */}
        <div className="update-student-fee-header">
          <h2>Update Student Fee</h2>
          <p>
            Filter fee records by Academic Year, Department, or Class, then
            select a fee record to update.
          </p>
        </div>

        {/* Global Messages */}
        {message && <div className="update-student-fee-success">{message}</div>}
        {error && <div className="update-student-fee-error">{error}</div>}

        {/* =================================================== */}
        {/* FILTER & SEARCH TOOLBAR SECTION */}
        {/* =================================================== */}
        <div className="update-student-fee-toolbar">
          {/* Direct ID Quick Search */}
          <form
            className="update-student-fee-direct-search"
            onSubmit={handleDirectSearch}
          >
            <div className="direct-search-input-wrap">
              <label>Search by Fee ID:</label>
              <div className="direct-search-controls">
                <input
                  type="number"
                  min="1"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Enter Fee ID (e.g. 10)"
                />
                <button type="submit" disabled={searching}>
                  {searching ? "Searching..." : "Find by ID"}
                </button>
              </div>
            </div>
          </form>

          {/* Filters Divider */}
          <div className="toolbar-section-label">
            <span>Or Filter & Select From Records Directory:</span>
          </div>

          {/* Directory Filter Bar */}
          <div className="update-student-fee-filters">
            {/* Search Input */}
            <div className="filter-item filter-search-box">
              <label>Search Records</label>
              <div className="filter-input-wrap">
                <input
                  type="text"
                  placeholder="Student, Adm No, Invoice, Fee..."
                  value={filterSearch}
                  onChange={(e) => setFilterSearch(e.target.value)}
                />
                {filterSearch && (
                  <button
                    type="button"
                    className="filter-clear-btn"
                    onClick={() => setFilterSearch("")}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Academic Year */}
            <div className="filter-item">
              <label>Academic Year</label>
              <select
                value={filterAcademicYear}
                onChange={(e) => setFilterAcademicYear(e.target.value)}
              >
                <option value="">All Academic Years</option>
                {academicYears.map((ay) => (
                  <option key={ay.Id ?? ay.id} value={ay.Id ?? ay.id}>
                    {ay.Name ?? ay.name ?? ay.YearName ?? ay.yearName}
                  </option>
                ))}
              </select>
            </div>

            {/* Department */}
            <div className="filter-item">
              <label>Department</label>
              <select
                value={filterDepartment}
                onChange={(e) => {
                  setFilterDepartment(e.target.value);
                  setFilterClass("");
                }}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id ?? dept.Id} value={dept.id ?? dept.Id}>
                    {dept.text ?? dept.Text ?? dept.name ?? dept.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Class */}
            <div className="filter-item">
              <label>Class</label>
              <select
                value={filterClass}
                onChange={(e) => setFilterClass(e.target.value)}
              >
                <option value="">All Classes</option>
                {classes
                  .filter(
                    (cls) =>
                      !filterDepartment ||
                      String(cls.departmentId ?? cls.DepartmentId) ===
                        String(filterDepartment),
                  )
                  .map((cls) => (
                    <option key={cls.id ?? cls.Id} value={cls.id ?? cls.Id}>
                      {cls.text ?? cls.Text ?? cls.name ?? cls.Name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Status */}
            <div className="filter-item">
              <label>Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Pending">Pending</option>
              </select>
            </div>

            {/* Reset */}
            {(filterSearch ||
              filterAcademicYear !== defaultAcademicYearId ||
              filterDepartment ||
              filterClass ||
              filterStatus !== "ALL") && (
              <div className="filter-item filter-reset-wrap">
                <button
                  type="button"
                  className="filter-reset-btn"
                  onClick={handleResetFilters}
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* =================================================== */}
        {/* RECORDS DIRECTORY TABLE */}
        {/* =================================================== */}
        <div className="update-student-fee-directory-wrap">
          <div className="directory-count-bar">
            Showing <strong>{filteredFeeRecords.length}</strong> of{" "}
            <strong>{enrichedFeeRecords.length}</strong> student fee records
          </div>

          {loadingInitial ? (
            <div className="directory-loading">
              Loading student fee directory...
            </div>
          ) : filteredFeeRecords.length === 0 ? (
            <div className="directory-empty">
              No student fee records found matching your filters.
            </div>
          ) : (
            <div className="directory-table-scroll">
              <table className="update-fee-directory-table">
                <thead>
                  <tr>
                    <th>Fee ID</th>
                    <th>Adm No.</th>
                    <th>Student Name</th>
                    <th>Dept / Class</th>
                    <th>Academic Year</th>
                    <th>Fee Structure</th>
                    <th style={{ textAlign: "right" }}>Total (₹)</th>
                    <th style={{ textAlign: "right" }}>Paid (₹)</th>
                    <th style={{ textAlign: "right" }}>Balance (₹)</th>
                    <th>Due Date</th>
                    <th style={{ textAlign: "center" }}>Status</th>
                    <th style={{ textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFeeRecords.map((item) => {
                    const isSelected = String(item.id) === String(formData.Id);
                    return (
                      <tr
                        key={item.id}
                        className={`directory-row ${
                          isSelected ? "row-selected" : ""
                        }`}
                        onClick={() => loadFeeForEditing(item.id)}
                      >
                        <td>
                          <span className="fee-id-badge">#{item.id}</span>
                        </td>
                        <td>
                          <span className="adm-badge">
                            {item.admissionNumber}
                          </span>
                        </td>
                        <td>
                          <strong className="student-name-text">
                            {item.studentName}
                          </strong>
                        </td>
                        <td>
                          {item.departmentName} - {item.className}
                          {item.sectionName !== "-"
                            ? ` (${item.sectionName})`
                            : ""}
                        </td>
                        <td>{item.academicYearName}</td>
                        <td>{item.feeStructureName}</td>
                        <td style={{ textAlign: "right", fontWeight: "600" }}>
                          ₹{item.totalAmount.toFixed(2)}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            color: "#16a34a",
                            fontWeight: "700",
                          }}
                        >
                          ₹{item.paidAmount.toFixed(2)}
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            color:
                              item.balanceAmount > 0 ? "#dc2626" : "#16a34a",
                            fontWeight: "700",
                          }}
                        >
                          ₹{item.balanceAmount.toFixed(2)}
                        </td>
                        <td>{item.dueDate || "-"}</td>
                        <td style={{ textAlign: "center" }}>
                          <span
                            className={`fee-status-pill status-${item.status
                              .toLowerCase()
                              .replace(/\s+/g, "-")}`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td
                          style={{ textAlign: "center" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            className={`edit-fee-btn ${
                              isSelected ? "btn-active" : ""
                            }`}
                            onClick={() => loadFeeForEditing(item.id)}
                          >
                            {isSelected ? "Editing" : "Edit Fee"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* =================================================== */}
        {/* EDIT FORM SECTION */}
        {/* =================================================== */}
        {found && (
          <div
            id="student-fee-edit-form-section"
            className="student-fee-edit-card"
          >
            <div className="edit-card-header">
              <div className="edit-card-title-wrap">
                <h3>Edit Student Fee #{formData.Id}</h3>
                {selectedRecordSummary && (
                  <span className="edit-student-target">
                    {selectedRecordSummary.studentName} (Adm:{" "}
                    {selectedRecordSummary.admissionNumber})
                  </span>
                )}
              </div>
              <button
                type="button"
                className="edit-card-dismiss-btn"
                onClick={() => setFound(false)}
              >
                ✕ Close Form
              </button>
            </div>

            {/* Live Financial Summary Banner */}
            <div className="live-financial-summary">
              <div className="live-stat">
                <span className="live-stat-label">Base Fee</span>
                <span className="live-stat-val">
                  ₹{liveCalculation.baseAmount.toFixed(2)}
                </span>
              </div>
              <div className="live-stat">
                <span className="live-stat-label">Discount</span>
                <span className="live-stat-val">
                  -₹{liveCalculation.discount.toFixed(2)}
                </span>
              </div>
              <div className="live-stat">
                <span className="live-stat-label">Fine</span>
                <span className="live-stat-val">
                  +₹{liveCalculation.fine.toFixed(2)}
                </span>
              </div>
              <div className="live-stat stat-total">
                <span className="live-stat-label">Net Payable</span>
                <span className="live-stat-val">
                  ₹{liveCalculation.netTotal.toFixed(2)}
                </span>
              </div>
              <div className="live-stat stat-paid">
                <span className="live-stat-label">Paid Amount</span>
                <span className="live-stat-val">
                  ₹{liveCalculation.paid.toFixed(2)}
                </span>
              </div>
              <div
                className={`live-stat ${
                  liveCalculation.balance > 0 ? "stat-balance" : "stat-cleared"
                }`}
              >
                <span className="live-stat-label">Remaining Balance</span>
                <span className="live-stat-val">
                  ₹{liveCalculation.balance.toFixed(2)}
                </span>
              </div>
            </div>

            <form className="update-student-fee-form" onSubmit={handleSubmit}>
              <div className="update-student-fee-grid">
                {/* Department */}
                <div className="update-student-fee-field">
                  <label>Department</label>
                  <select
                    name="DepartmentId"
                    value={formData.DepartmentId}
                    onChange={handleFormChange}
                  >
                    <option value="">Select Department</option>
                    {departments.map((item) => (
                      <option
                        key={item.id ?? item.Id}
                        value={item.id ?? item.Id}
                      >
                        {item.text ?? item.Text ?? item.name ?? item.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Class */}
                <div className="update-student-fee-field">
                  <label>Class</label>
                  <select
                    name="ClassId"
                    value={formData.ClassId}
                    onChange={handleFormChange}
                    disabled={!formData.DepartmentId}
                  >
                    <option value="">Select Class</option>
                    {formClasses.map((item) => (
                      <option
                        key={item.id ?? item.Id}
                        value={item.id ?? item.Id}
                      >
                        {item.text ?? item.Text ?? item.name ?? item.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div className="update-student-fee-field">
                  <label>Section</label>
                  <select
                    name="SectionId"
                    value={formData.SectionId}
                    onChange={handleFormChange}
                    disabled={!formData.ClassId}
                  >
                    <option value="">Select Section</option>
                    {formSections.map((item) => (
                      <option
                        key={item.id ?? item.Id}
                        value={item.id ?? item.Id}
                      >
                        {item.text ?? item.Text ?? item.name ?? item.Name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Student */}
                <div className="update-student-fee-field">
                  <label>Student *</label>
                  <select
                    name="StudentId"
                    value={formData.StudentId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Student</option>
                    {formStudents.length > 0
                      ? formStudents.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.text}
                          </option>
                        ))
                      : students.map((s) => {
                          const sId = s.Id ?? s.id ?? s.StudentId;
                          const sName =
                            `${s.FirstName || ""} ${s.LastName || ""}`.trim() ||
                            s.StudentName;
                          return (
                            <option key={sId} value={sId}>
                              {sName} ({s.AdmissionNumber || "No Adm"})
                            </option>
                          );
                        })}
                  </select>
                </div>

                {/* Fee Structure */}
                <div className="update-student-fee-field update-student-fee-full">
                  <label>Fee Structure *</label>
                  <select
                    name="FeeStructureId"
                    value={formData.FeeStructureId}
                    onChange={handleFormChange}
                    required
                  >
                    <option value="">Select Fee Structure</option>
                    {feeStructures
                      .filter((fs) => {
                        if (!formData.ClassId) return true;
                        return (
                          String(fs.ClassId ?? fs.classId) ===
                          String(formData.ClassId)
                        );
                      })
                      .map((item) => {
                        const fsId = item.Id ?? item.id;
                        const fsName =
                          item.FeeCategoryName ||
                          item.categoryName ||
                          item.Description ||
                          item.description ||
                          `Structure #${fsId}`;
                        const amount = item.Amount ?? item.amount ?? 0;
                        return (
                          <option key={fsId} value={fsId}>
                            {fsName} - ₹{Number(amount).toFixed(2)}
                          </option>
                        );
                      })}
                  </select>
                </div>

                {/* Discount */}
                <div className="update-student-fee-field">
                  <label>Discount (₹)</label>
                  <input
                    type="number"
                    name="Discount"
                    value={formData.Discount}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Fine */}
                <div className="update-student-fee-field">
                  <label>Fine (₹)</label>
                  <input
                    type="number"
                    name="Fine"
                    value={formData.Fine}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                  />
                </div>

                {/* Paid Amount */}
                <div className="update-student-fee-field">
                  <label>Paid Amount (₹) *</label>
                  <input
                    type="number"
                    name="PaidAmount"
                    value={formData.PaidAmount}
                    onChange={handleFormChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </div>

                {/* Due Date */}
                <div className="update-student-fee-field">
                  <label>Due Date *</label>
                  <input
                    type="date"
                    name="DueDate"
                    value={formData.DueDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="update-student-fee-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setFound(false)}
                >
                  Cancel
                </button>
                <button type="submit" disabled={loading}>
                  {loading ? "Updating..." : "Save & Update Fee"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Result Popup Modal */}
      <FeePopupModal
        show={popup.show}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => setPopup((prev) => ({ ...prev, show: false }))}
      />
    </div>
  );
};

export default UpdateStudentFee;
