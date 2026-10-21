// =====================================================
// DELETE STUDENT FEE
// =====================================================

import { useState, useEffect, useMemo } from "react";

import {
  getAllStudentFees,
  getStudentFeeById,
  deleteStudentFee,
  parseStudentFeeErrorMessage,
} from "../../Services/studentFeeService";
import { getAllStudentsWithDetails } from "../../Services/studentService";
import { getAllFeeStructures } from "../../Services/feeStructureService";
import { getAllAcademicYear } from "../../Services/academicYearService";
import { getDepartmentDropdown } from "../../Services/departmentService";
import { getClassDropdown } from "../../Services/classService";
import FeePopupModal from "../FeeStructure/FeePopupModal";

import "./DeleteStudentFee.css";

const DeleteStudentFee = () => {
  // Direct ID search state
  const [id, setId] = useState("");
  const [studentFee, setStudentFee] = useState(null);

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

  const [loadingInitial, setLoadingInitial] = useState(true);
  const [searching, setSearching] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
      const ayId = String(ay.Id ?? ay.id);
      const name = ay.Name ?? ay.name ?? ay.YearName ?? ay.yearName ?? ayId;
      map[ayId] = name;
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
  // LOAD FEE RECORD FOR DELETION
  // =====================================================

  const loadFeeForDeletion = async (targetId) => {
    setError("");
    setMessage("");
    setStudentFee(null);

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

      const matchedRecord = enrichedFeeRecords.find(
        (r) => String(r.id) === String(fee.Id),
      );

      setStudentFee({
        ...fee,
        StudentName: matchedRecord?.studentName || fee.StudentName || "-",
        AdmissionNumber: matchedRecord?.admissionNumber || "-",
        DepartmentName: matchedRecord?.departmentName || "-",
        ClassName: matchedRecord?.className || "-",
        SectionName: matchedRecord?.sectionName || "-",
        AcademicYearName: matchedRecord?.academicYearName || "-",
        FeeStructureName:
          matchedRecord?.feeStructureName || `Structure #${fee.FeeStructureId}`,
      });

      setId(String(fee.Id));

      // Smooth scroll to deletion preview card
      setTimeout(() => {
        const cardElem = document.getElementById(
          "student-fee-delete-preview-card",
        );
        if (cardElem) {
          cardElem.scrollIntoView({ behavior: "smooth", block: "start" });
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
    if (!id.trim()) {
      setError("Please enter a Student Fee ID to search.");
      return;
    }
    loadFeeForDeletion(id.trim());
  };

  // =====================================================
  // EXECUTE DELETION
  // =====================================================

  const handleDelete = async () => {
    if (!studentFee?.Id) {
      setError("Please select a Student Fee record first.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete Student Fee record #${studentFee.Id} for ${studentFee.StudentName}?`,
    );

    if (!confirmed) return;

    try {
      setDeleting(true);
      setError("");
      setMessage("");

      await deleteStudentFee(studentFee.Id);

      const successMsg = `Student Fee #${studentFee.Id} was deleted successfully.`;
      setMessage(successMsg);
      setPopup({
        show: true,
        type: "success",
        title: "Student Fee Deleted",
        message: successMsg,
      });

      // Remove from in-memory list so table immediately updates
      setAllStudentFees((prev) =>
        prev.filter((f) => String(f.Id ?? f.id) !== String(studentFee.Id)),
      );

      setStudentFee(null);
      setId("");
    } catch (err) {
      const errorMsg = parseStudentFeeErrorMessage(err);
      setError(errorMsg);
      setPopup({
        show: true,
        type: "error",
        title: "Deletion Failed",
        message: errorMsg,
      });
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const value = new Date(date);

    if (Number.isNaN(value.getTime())) {
      return date;
    }

    return value.toLocaleDateString();
  };

  return (
    <div className="delete-student-fee-page">
      <div className="delete-student-fee-container">
        <div className="delete-student-fee-header">
          <h2>Delete Student Fee</h2>
          <p>
            Filter fee records by Academic Year, Department, or Class, or search
            by ID to review and delete.
          </p>
        </div>

        {/* Global Messages */}
        {message && <div className="delete-student-fee-success">{message}</div>}
        {error && <div className="delete-student-fee-error">{error}</div>}

        {/* =================================================== */}
        {/* FILTER & SEARCH TOOLBAR SECTION */}
        {/* =================================================== */}
        <div className="delete-student-fee-toolbar">
          {/* Direct ID Quick Search */}
          <form
            className="delete-student-fee-direct-search"
            onSubmit={handleDirectSearch}
          >
            <div className="direct-search-input-wrap">
              <label>Search by Fee ID:</label>
              <div className="direct-search-controls">
                <input
                  type="number"
                  min="1"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
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
          <div className="delete-student-fee-filters">
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
        <div className="delete-student-fee-directory-wrap">
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
              <table className="delete-fee-directory-table">
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
                    const isSelected =
                      String(item.id) === String(studentFee?.Id);
                    return (
                      <tr
                        key={item.id}
                        className={`directory-row ${
                          isSelected ? "row-selected" : ""
                        }`}
                        onClick={() => loadFeeForDeletion(item.id)}
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
                            className={`delete-select-btn ${
                              isSelected ? "btn-active" : ""
                            }`}
                            onClick={() => loadFeeForDeletion(item.id)}
                          >
                            {isSelected ? "Selected" : "Select to Delete"}
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
        {/* DELETION CONFIRMATION CARD */}
        {/* =================================================== */}
        {studentFee && (
          <div
            id="student-fee-delete-preview-card"
            className="delete-student-fee-card"
          >
            <div className="delete-student-fee-card-header">
              <div className="delete-card-title-wrap">
                <h3>Review Student Fee #{studentFee.Id} For Deletion</h3>
                <span className="delete-student-name">
                  {studentFee.StudentName} (Adm:{" "}
                  {studentFee.AdmissionNumber || "-"})
                </span>
              </div>
              <button
                type="button"
                className="delete-card-dismiss-btn"
                onClick={() => {
                  setStudentFee(null);
                  setId("");
                  setError("");
                }}
              >
                ✕ Cancel Selection
              </button>
            </div>

            <div className="delete-student-fee-details">
              <div>
                <span>Fee Record ID</span>
                <strong>#{studentFee.Id ?? "-"}</strong>
              </div>

              <div>
                <span>Student Name</span>
                <strong>{studentFee.StudentName || "-"}</strong>
              </div>

              <div>
                <span>Admission Number</span>
                <strong>{studentFee.AdmissionNumber || "-"}</strong>
              </div>

              <div>
                <span>Department</span>
                <strong>{studentFee.DepartmentName || "-"}</strong>
              </div>

              <div>
                <span>Class & Section</span>
                <strong>
                  {studentFee.ClassName || "-"}
                  {studentFee.SectionName && studentFee.SectionName !== "-"
                    ? ` (${studentFee.SectionName})`
                    : ""}
                </strong>
              </div>

              <div>
                <span>Academic Year</span>
                <strong>{studentFee.AcademicYearName || "-"}</strong>
              </div>

              <div>
                <span>Fee Structure</span>
                <strong>{studentFee.FeeStructureName || "-"}</strong>
              </div>

              <div>
                <span>Invoice No.</span>
                <strong>{studentFee.InvoiceNo || "-"}</strong>
              </div>

              <div>
                <span>Total Amount</span>
                <strong style={{ fontSize: "16px", color: "#1e293b" }}>
                  ₹{Number(studentFee.TotalAmount || 0).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Paid Amount</span>
                <strong style={{ fontSize: "16px", color: "#16a34a" }}>
                  ₹{Number(studentFee.PaidAmount || 0).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Remaining Balance</span>
                <strong
                  style={{
                    fontSize: "16px",
                    color:
                      Number(studentFee.BalanceAmount || 0) > 0
                        ? "#dc2626"
                        : "#16a34a",
                  }}
                >
                  ₹{Number(studentFee.BalanceAmount || 0).toFixed(2)}
                </strong>
              </div>

              <div>
                <span>Due Date</span>
                <strong>{formatDate(studentFee.DueDate)}</strong>
              </div>

              <div>
                <span>Status</span>
                <span
                  className={`fee-status-pill status-${String(
                    studentFee.Status || "Pending",
                  )
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {studentFee.Status || "-"}
                </span>
              </div>
            </div>

            <div className="delete-student-fee-warning">
              <strong>⚠️ Critical Warning:</strong> Deleting this record will
              permanently erase this fee assignment and its payment ledger. This
              action cannot be reversed.
            </div>

            <div className="delete-student-fee-actions">
              <button
                type="button"
                className="delete-student-fee-cancel"
                onClick={() => {
                  setStudentFee(null);
                  setId("");
                  setError("");
                }}
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="delete-student-fee-delete"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Permanently Delete Student Fee"}
              </button>
            </div>
          </div>
        )}
      </div>

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

export default DeleteStudentFee;
