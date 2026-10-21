// =====================================================
// ALL STUDENT FEES DIRECTORY & BREAKDOWN
// Displays Student Admission No, Name, Department, Class,
// Section, Academic Year, and Fee Status.
// Clicking a student shows their submitted vs remainder fee structures.
// =====================================================

import { useEffect, useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { getAllStudentFees } from "../../Services/studentFeeService";
import { getAllStudentsWithDetails } from "../../Services/studentService";
import { getAllFeeStructures } from "../../Services/feeStructureService";
import { getAllAcademicYear } from "../../Services/academicYearService";
import { getDepartmentDropdown } from "../../Services/departmentService";
import { getClassDropdown } from "../../Services/classService";
import { sortFeeStructuresByAcademicCalendar } from "./CreateStudentFee";
import {
  getMyClassTeacherAssignment,
  getCachedClassTeacherAssignment,
} from "../../Services/classTeacherService";
import { isTeacherRole } from "../../Utils/auth";

import "./GetAllStudentFee.css";

const GetAllStudentFee = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [students, setStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [defaultAcademicYearId, setDefaultAcademicYearId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  // Modal / Detail drawer
  const [selectedStudentDossier, setSelectedStudentDossier] = useState(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        studentsData,
        feesData,
        structuresData,
        academicYearsData,
        deptsData,
        classesData,
      ] = await Promise.all([
        getAllStudentsWithDetails().catch(() => []),
        getAllStudentFees().catch(() => []),
        getAllFeeStructures().catch(() => []),
        getAllAcademicYear().catch(() => []),
        getDepartmentDropdown().catch(() => []),
        getClassDropdown().catch(() => []),
      ]);

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setStudentFees(Array.isArray(feesData) ? feesData : []);
      setFeeStructures(Array.isArray(structuresData) ? structuresData : []);

      const yearList = Array.isArray(academicYearsData)
        ? academicYearsData
        : [];
      setAcademicYears(yearList);

      // Default to latest / last created academic year (highest ID)
      let latestYearId = "";
      if (yearList.length > 0) {
        const sorted = [...yearList].sort((a, b) => {
          const idA = Number(a.Id ?? a.id ?? 0);
          const idB = Number(b.Id ?? b.id ?? 0);
          return idB - idA;
        });
        latestYearId = String(sorted[0].Id ?? sorted[0].id ?? "");
      }

      setDefaultAcademicYearId(latestYearId);
      setSelectedAcademicYear(latestYearId);

      setDepartments(Array.isArray(deptsData) ? deptsData : []);
      setClasses(Array.isArray(classesData) ? classesData : []);

      // If teacher role or redirected from teacher dashboard, pre-select teacher's class
      let targetAy = location.state?.academicYearId;
      let targetDept = location.state?.departmentId;
      let targetClass = location.state?.classId;

      if (!targetClass && isTeacherRole()) {
        try {
          const cachedCT = getCachedClassTeacherAssignment();
          const ctAssignment =
            cachedCT && cachedCT.isClassTeacher
              ? cachedCT
              : await getMyClassTeacherAssignment().catch(() => null);
          if (ctAssignment && ctAssignment.isClassTeacher) {
            targetAy = targetAy || ctAssignment.academicYearId;
            targetDept = targetDept || ctAssignment.departmentId;
            targetClass = targetClass || ctAssignment.classId;
          }
        } catch (_) {}
      }

      if (targetAy) setSelectedAcademicYear(String(targetAy));
      if (targetDept) setSelectedDepartment(String(targetDept));
      if (targetClass) setSelectedClass(String(targetClass));
    } catch (err) {
      setError(err.message || "Failed to load student fee records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return date;
    return parsedDate.toLocaleDateString();
  };

  // Academic Year Map
  const academicYearMap = useMemo(() => {
    const map = {};
    academicYears.forEach((ay) => {
      const id = ay.Id ?? ay.id;
      const name = ay.Name ?? ay.name ?? ay.YearName ?? ay.yearName;
      if (id) map[String(id)] = name;
    });
    return map;
  }, [academicYears]);

  // Fee Structure Map by ID
  const feeStructureMap = useMemo(() => {
    const map = {};
    feeStructures.forEach((fs) => {
      const id = fs.Id ?? fs.id;
      if (id) map[String(id)] = fs;
    });
    return map;
  }, [feeStructures]);

  // Enriched Student Fee Ledger
  const studentFeeDirectory = useMemo(() => {
    return students.map((student) => {
      const studentId = student.Id ?? student.id;
      const classId =
        student.SchoolClassId ??
        student.schoolClassId ??
        student.ClassId ??
        student.classId;
      const deptId = student.DepartmentId ?? student.departmentId;

      // Fee structures applicable to this student's class (filtered by selectedAcademicYear if chosen)
      const applicableStructures = feeStructures.filter((fs) => {
        const fsClassId = fs.ClassId ?? fs.classId;
        const fsAyId = fs.AcademicYearId ?? fs.academicYearId;
        const isActive = fs.IsActive !== false && fs.isActive !== false;
        const matchClass = String(fsClassId) === String(classId);
        const matchYear =
          !selectedAcademicYear ||
          String(fsAyId) === String(selectedAcademicYear);
        return matchClass && matchYear && isActive;
      });

      // Student fees assigned to this student for this academic year
      const assignedFees = studentFees.filter((sf) => {
        const matchStudent =
          String(sf.StudentId ?? sf.studentId) === String(studentId);
        if (!matchStudent) return false;
        if (!selectedAcademicYear) return true;
        const fsId = sf.FeeStructureId ?? sf.feeStructureId;
        const matchedFs = feeStructureMap[String(fsId)];
        const fsAyId = matchedFs?.AcademicYearId ?? matchedFs?.academicYearId;
        return String(fsAyId) === String(selectedAcademicYear);
      });

      // Submitted fee structures
      const submittedList = assignedFees.map((sf) => {
        const fsId = sf.FeeStructureId ?? sf.feeStructureId;
        const matchedFs = feeStructureMap[String(fsId)];
        const feeName =
          matchedFs?.FeeCategoryName ||
          matchedFs?.categoryName ||
          matchedFs?.Description ||
          matchedFs?.description ||
          `Fee Structure #${fsId}`;

        const baseAmount = Number(
          sf.TotalAmount ?? sf.totalAmount ?? sf.Amount ?? sf.amount ?? 0,
        );
        const paidAmount = Number(sf.PaidAmount ?? sf.paidAmount ?? 0);
        const balanceAmount = Number(
          sf.BalanceAmount !== undefined
            ? sf.BalanceAmount
            : sf.balanceAmount !== undefined
              ? sf.balanceAmount
              : Math.max(0, baseAmount - paidAmount),
        );

        const status =
          sf.Status ||
          sf.status ||
          (balanceAmount <= 0
            ? "Paid"
            : paidAmount > 0
              ? "Partial"
              : "Pending");

        return {
          id: sf.Id ?? sf.id,
          feeStructureId: fsId,
          feeName,
          invoiceNo: sf.InvoiceNo ?? sf.invoiceNo ?? "-",
          totalAmount: baseAmount,
          paidAmount,
          balanceAmount,
          dueDate: sf.DueDate ?? sf.dueDate,
          status,
        };
      });

      // Remainder fee structures (applicable for class, not yet assigned)
      const submittedFsIds = new Set(
        assignedFees.map((sf) =>
          String(sf.FeeStructureId ?? sf.feeStructureId),
        ),
      );

      const unassignedStructures = applicableStructures.filter(
        (fs) => !submittedFsIds.has(String(fs.Id ?? fs.id)),
      );

      const sortedRemainder = sortFeeStructuresByAcademicCalendar(
        unassignedStructures.map((fs) => ({
          ...fs,
          text:
            fs.FeeCategoryName ||
            fs.categoryName ||
            fs.Description ||
            fs.description ||
            `Fee Structure #${fs.Id ?? fs.id}`,
        })),
      );

      const remainderList = sortedRemainder.map((fs) => {
        const feeName =
          fs.FeeCategoryName ||
          fs.categoryName ||
          fs.Description ||
          fs.description ||
          `Fee Structure #${fs.Id ?? fs.id}`;
        const amount = Number(fs.Amount ?? fs.amount ?? 0);

        return {
          id: null,
          feeStructureId: fs.Id ?? fs.id,
          feeName,
          invoiceNo: "-",
          totalAmount: amount,
          paidAmount: 0,
          balanceAmount: amount,
          dueDate: fs.DueDate ?? fs.dueDate,
          status: "Pending",
        };
      });

      // Totals
      const totalSubmittedPayable = submittedList.reduce(
        (sum, x) => sum + x.totalAmount,
        0,
      );
      const totalRemainderPayable = remainderList.reduce(
        (sum, x) => sum + x.totalAmount,
        0,
      );
      const totalPayable = totalSubmittedPayable + totalRemainderPayable;

      // Ab tak kul paid fee
      const totalPaid = submittedList.reduce((sum, x) => sum + x.paidAmount, 0);

      // Paid fee me jo paise bakaya reh gya hai (balance remaining on submitted fees)
      const submittedBalance = submittedList.reduce(
        (sum, x) => sum + x.balanceAmount,
        0,
      );

      // Kul bakaya current year fee (submitted balance + remainder unsubmitted fee structures)
      const totalRemaining = submittedBalance + totalRemainderPayable;

      let overallStatus = "Pending";
      if (applicableStructures.length === 0 && submittedList.length === 0) {
        overallStatus = "No Fee Assigned";
      } else if (totalRemaining <= 0 && totalPaid > 0) {
        overallStatus = "Paid";
      } else if (totalPaid > 0) {
        overallStatus = "Partial";
      } else {
        overallStatus = "Pending";
      }

      // Academic Year Name
      const effectiveAyId =
        selectedAcademicYear ||
        applicableStructures[0]?.AcademicYearId ||
        applicableStructures[0]?.academicYearId ||
        "";

      const academicYearName =
        academicYearMap[String(effectiveAyId)] ||
        applicableStructures[0]?.AcademicYearName ||
        applicableStructures[0]?.academicYearName ||
        "-";

      const fullName =
        `${student.FirstName || ""} ${student.LastName || ""}`.trim() ||
        student.StudentName ||
        `Student #${studentId}`;

      return {
        studentId,
        admissionNumber:
          student.AdmissionNumber || student.admissionNumber || "-",
        studentName: fullName,
        departmentId: deptId,
        departmentName: student.DepartmentName || student.departmentName || "-",
        classId,
        className: student.ClassName || student.className || "-",
        sectionId: student.SectionId ?? student.sectionId,
        sectionName: student.SectionName || student.sectionName || "-",
        academicYearId: effectiveAyId,
        academicYearName,
        totalPayable,
        totalPaid,
        submittedBalance,
        totalRemaining,
        overallStatus,
        submittedList,
        remainderList,
      };
    });
  }, [
    students,
    studentFees,
    feeStructures,
    feeStructureMap,
    academicYearMap,
    selectedAcademicYear,
  ]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return studentFeeDirectory.filter((item) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchName = item.studentName.toLowerCase().includes(query);
        const matchAdm = item.admissionNumber.toLowerCase().includes(query);
        if (!matchName && !matchAdm) return false;
      }

      // Department
      if (
        selectedDepartment &&
        String(item.departmentId) !== String(selectedDepartment)
      ) {
        return false;
      }

      // Class
      if (selectedClass && String(item.classId) !== String(selectedClass)) {
        return false;
      }

      // Status
      if (selectedStatus !== "ALL" && item.overallStatus !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [
    studentFeeDirectory,
    searchTerm,
    selectedDepartment,
    selectedClass,
    selectedStatus,
  ]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedAcademicYear("");
    setSelectedDepartment("");
    setSelectedClass("");
    setSelectedStatus("ALL");
  };

  return (
    <div className="get-all-student-fee-page">
      <div className="get-all-student-fee-container">
        {/* Header */}
        <div className="get-all-student-fee-header">
          <div>
            <h2>All Students Fee Directory</h2>
            <p>
              View student admission details, department, class, academic year,
              and fee status. Click any student to view submitted vs remainder
              fee structures.
            </p>
          </div>

          <div className="get-all-student-fee-header-actions">
            <button
              type="button"
              className="get-all-student-fee-create-btn"
              onClick={() => navigate("/student-fee/create")}
            >
              + Create Student Fee
            </button>
            <button
              type="button"
              className="get-all-student-fee-refresh"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && <div className="get-all-student-fee-error">{error}</div>}

        {/* Filters & Search Toolbar */}
        <div className="student-fee-toolbar">
          <div className="student-fee-search-wrapper">
            <input
              type="text"
              placeholder="Search by Student Name or Admission No..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="student-fee-search-input"
            />
            {searchTerm && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => setSearchTerm("")}
              >
                ✕
              </button>
            )}
          </div>

          <div className="student-fee-filter-group">
            {/* Academic Year */}
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="student-fee-filter-select"
            >
              <option value="">All Academic Years</option>
              {academicYears.map((ay) => (
                <option key={ay.Id ?? ay.id} value={ay.Id ?? ay.id}>
                  {ay.Name ?? ay.name ?? ay.YearName ?? ay.yearName}
                </option>
              ))}
            </select>

            {/* Department */}
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value);
                setSelectedClass("");
              }}
              className="student-fee-filter-select"
            >
              <option value="">All Departments</option>
              {departments.map((dept) => (
                <option key={dept.id ?? dept.Id} value={dept.id ?? dept.Id}>
                  {dept.text ?? dept.Text ?? dept.name ?? dept.Name}
                </option>
              ))}
            </select>

            {/* Class */}
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="student-fee-filter-select"
            >
              <option value="">All Classes</option>
              {classes
                .filter(
                  (cls) =>
                    !selectedDepartment ||
                    String(cls.departmentId ?? cls.DepartmentId) ===
                      String(selectedDepartment),
                )
                .map((cls) => (
                  <option key={cls.id ?? cls.Id} value={cls.id ?? cls.Id}>
                    {cls.text ?? cls.Text ?? cls.name ?? cls.Name}
                  </option>
                ))}
            </select>

            {/* Status */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="student-fee-filter-select"
            >
              <option value="ALL">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Partial">Partial</option>
              <option value="Pending">Pending</option>
              <option value="No Fee Assigned">No Fee Assigned</option>
            </select>

            {(searchTerm ||
              selectedAcademicYear ||
              selectedDepartment ||
              selectedClass ||
              selectedStatus !== "ALL") && (
              <button
                type="button"
                className="student-fee-reset-filter-btn"
                onClick={handleResetFilters}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Directory Count Bar */}
        <div className="student-fee-count-bar">
          Showing <strong>{filteredStudents.length}</strong> of{" "}
          <strong>{studentFeeDirectory.length}</strong> Students
        </div>

        {/* Main Students Table */}
        {loading ? (
          <div className="get-all-student-fee-loading">
            Loading student fee ledger directory...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="get-all-student-fee-empty">
            No matching student fee records found for the applied filters.
          </div>
        ) : (
          <div className="get-all-student-fee-table-wrapper">
            <table className="get-all-student-fee-table">
              <thead>
                <tr>
                  <th>Admission No.</th>
                  <th>Student Name</th>
                  <th>Department</th>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Academic Year</th>
                  <th style={{ textAlign: "right" }}>Total Fee (₹)</th>
                  <th style={{ textAlign: "right" }}>Total Paid Fee (₹)</th>
                  <th
                    style={{ textAlign: "right" }}
                    title="Paid fee me jo paise bakaya reh gya hai (Balance on submitted fees)"
                  >
                    Paid Fee Due (₹)
                  </th>
                  <th
                    style={{ textAlign: "right" }}
                    title="Kul bakaya current year fee (Total year balance)"
                  >
                    Total Remaining (₹)
                  </th>
                  <th style={{ textAlign: "center" }}>Status</th>
                  <th style={{ textAlign: "center" }}>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((item) => (
                  <tr
                    key={item.studentId}
                    className="student-fee-row-clickable"
                    onClick={() => setSelectedStudentDossier(item)}
                  >
                    <td>
                      <span className="student-adm-badge">
                        {item.admissionNumber}
                      </span>
                    </td>

                    <td>
                      <strong className="student-dir-name">
                        {item.studentName}
                      </strong>
                    </td>

                    <td>{item.departmentName}</td>
                    <td>{item.className}</td>
                    <td>{item.sectionName}</td>
                    <td>{item.academicYearName}</td>

                    <td style={{ textAlign: "right", fontWeight: "600" }}>
                      ₹{item.totalPayable.toFixed(2)}
                    </td>

                    <td
                      style={{
                        textAlign: "right",
                        color: "#16a34a",
                        fontWeight: "700",
                      }}
                    >
                      ₹{item.totalPaid.toFixed(2)}
                    </td>

                    <td
                      style={{
                        textAlign: "right",
                        color:
                          item.submittedBalance > 0 ? "#e11d48" : "#16a34a",
                        fontWeight: "700",
                      }}
                      title="Paid fee me jo paise bakaya reh gya hai"
                    >
                      ₹{item.submittedBalance.toFixed(2)}
                    </td>

                    <td
                      style={{
                        textAlign: "right",
                        color: item.totalRemaining > 0 ? "#dc2626" : "#16a34a",
                        fontWeight: "700",
                      }}
                      title="Kul bakaya current year fee"
                    >
                      ₹{item.totalRemaining.toFixed(2)}
                    </td>

                    <td style={{ textAlign: "center" }}>
                      <span
                        className={`get-all-student-fee-status status-${item.overallStatus
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {item.overallStatus}
                      </span>
                    </td>

                    <td
                      style={{ textAlign: "center" }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="student-actions-cell">
                        <button
                          type="button"
                          className="student-view-breakdown-btn"
                          onClick={() => setSelectedStudentDossier(item)}
                        >
                          View Breakdown
                        </button>
                        {!isTeacherRole() &&
                          item.remainderList &&
                          item.remainderList.length > 0 && (
                            <button
                              type="button"
                              className="student-quick-create-btn"
                              title={`Create fee on ${item.remainderList.length} remaining fee structure(s)`}
                              onClick={() => {
                                navigate("/student-fee/create", {
                                  state: {
                                    studentId: item.studentId,
                                    academicYearId: item.academicYearId,
                                    departmentId: item.departmentId,
                                    classId: item.classId,
                                    sectionId: item.sectionId,
                                    feeStructureIds: item.remainderList.map(
                                      (rf) => rf.feeStructureId,
                                    ),
                                  },
                                });
                              }}
                            >
                              + Create Fee ({item.remainderList.length})
                            </button>
                          )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =================================================== */}
      {/* STUDENT FEE BREAKDOWN MODAL */}
      {/* =================================================== */}
      {selectedStudentDossier && (
        <div
          className="student-breakdown-backdrop"
          onClick={() => setSelectedStudentDossier(null)}
        >
          <div
            className="student-breakdown-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="student-breakdown-close-x"
              onClick={() => setSelectedStudentDossier(null)}
              aria-label="Close"
            >
              ×
            </button>

            {/* Modal Header */}
            <div className="student-breakdown-header">
              <div className="student-breakdown-title-row">
                <h3>{selectedStudentDossier.studentName}</h3>
                <span className="student-adm-tag">
                  Adm No: {selectedStudentDossier.admissionNumber}
                </span>
              </div>
              <div className="student-breakdown-meta">
                <span>
                  <strong>Dept:</strong> {selectedStudentDossier.departmentName}
                </span>
                <span>•</span>
                <span>
                  <strong>Class:</strong> {selectedStudentDossier.className}
                </span>
                <span>•</span>
                <span>
                  <strong>Section:</strong> {selectedStudentDossier.sectionName}
                </span>
                <span>•</span>
                <span>
                  <strong>Academic Year:</strong>{" "}
                  {selectedStudentDossier.academicYearName}
                </span>
              </div>
            </div>

            {/* KPI Summary Cards */}
            <div className="breakdown-kpi-grid">
              <div className="breakdown-kpi-card kpi-total">
                <span className="breakdown-kpi-label">Total Fee Structure</span>
                <span className="breakdown-kpi-value">
                  ₹{selectedStudentDossier.totalPayable.toFixed(2)}
                </span>
                <span className="breakdown-kpi-sub">
                  Applicable for this Year
                </span>
              </div>

              <div className="breakdown-kpi-card kpi-paid">
                <span className="breakdown-kpi-label">Total Paid Fee</span>
                <span className="breakdown-kpi-value">
                  ₹{selectedStudentDossier.totalPaid.toFixed(2)}
                </span>
                <span className="breakdown-kpi-sub">Ab tak kul paid fee</span>
              </div>

              <div
                className={`breakdown-kpi-card kpi-submitted-due ${
                  selectedStudentDossier.submittedBalance > 0
                    ? "has-pending"
                    : "cleared"
                }`}
              >
                <span className="breakdown-kpi-label">Paid Fee Due</span>
                <span className="breakdown-kpi-value">
                  ₹{selectedStudentDossier.submittedBalance.toFixed(2)}
                </span>
                <span className="breakdown-kpi-sub">
                  Paid fee me jo bakaya hai
                </span>
              </div>

              <div
                className={`breakdown-kpi-card kpi-remaining ${
                  selectedStudentDossier.totalRemaining > 0
                    ? "has-pending"
                    : "cleared"
                }`}
              >
                <span className="breakdown-kpi-label">Total Year Due</span>
                <span className="breakdown-kpi-value">
                  ₹{selectedStudentDossier.totalRemaining.toFixed(2)}
                </span>
                <span className="breakdown-kpi-sub">
                  Kul bakaya current year fee
                </span>
              </div>

              <div className="breakdown-kpi-card kpi-status">
                <span className="breakdown-kpi-label">Overall Status</span>
                <span
                  className={`get-all-student-fee-status status-${selectedStudentDossier.overallStatus
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  {selectedStudentDossier.overallStatus}
                </span>
              </div>
            </div>

            {/* Submitted Fee Structures */}
            <div className="breakdown-table-section">
              <h4 className="breakdown-section-heading heading-submitted">
                ✅ Submitted Fee Structures (
                {selectedStudentDossier.submittedList.length})
              </h4>
              {selectedStudentDossier.submittedList.length === 0 ? (
                <div className="breakdown-empty-note">
                  No fee structures submitted yet for this student.
                </div>
              ) : (
                <div className="breakdown-table-scroll">
                  <table className="breakdown-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Fee Structure</th>
                        <th>Invoice No.</th>
                        <th style={{ textAlign: "right" }}>Payable Amount</th>
                        <th style={{ textAlign: "right" }}>Paid Amount</th>
                        <th style={{ textAlign: "right" }}>Remaining Amount</th>
                        <th>Due Date</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudentDossier.submittedList.map((sf, idx) => (
                        <tr key={sf.id ?? idx}>
                          <td>{idx + 1}</td>
                          <td className="fee-breakdown-name">{sf.feeName}</td>
                          <td>
                            <code className="invoice-code">{sf.invoiceNo}</code>
                          </td>
                          <td style={{ textAlign: "right", fontWeight: "600" }}>
                            ₹{sf.totalAmount.toFixed(2)}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              color: "#16a34a",
                              fontWeight: "600",
                            }}
                          >
                            ₹{sf.paidAmount.toFixed(2)}
                          </td>
                          <td
                            style={{
                              textAlign: "right",
                              color:
                                sf.balanceAmount > 0 ? "#dc2626" : "#16a34a",
                              fontWeight: "600",
                            }}
                          >
                            ₹{sf.balanceAmount.toFixed(2)}
                          </td>
                          <td>{formatDate(sf.dueDate)}</td>
                          <td style={{ textAlign: "center" }}>
                            <span
                              className={`fee-mini-badge status-${sf.status.toLowerCase()}`}
                            >
                              {sf.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Remainder Fee Structures */}
            <div className="breakdown-table-section">
              <div className="breakdown-remainder-header-row">
                <h4 className="breakdown-section-heading heading-remainder">
                  ⏳ Remainder Fee Structures Pending Submission (
                  {selectedStudentDossier.remainderList.length})
                </h4>
                {selectedStudentDossier.remainderList.length > 0 && (
                  <button
                    type="button"
                    className="btn-pay-all-remainders"
                    onClick={() => {
                      navigate("/student-fee/create", {
                        state: {
                          studentId: selectedStudentDossier.studentId,
                          academicYearId: selectedStudentDossier.academicYearId,
                          departmentId: selectedStudentDossier.departmentId,
                          classId: selectedStudentDossier.classId,
                          sectionId: selectedStudentDossier.sectionId,
                          feeStructureIds:
                            selectedStudentDossier.remainderList.map(
                              (rf) => rf.feeStructureId,
                            ),
                        },
                      });
                    }}
                  >
                    + Pay All Remainder Fees (
                    {selectedStudentDossier.remainderList.length})
                  </button>
                )}
              </div>
              {selectedStudentDossier.remainderList.length === 0 ? (
                <div className="breakdown-empty-note all-cleared">
                  🎉 All applicable fee structures have already been submitted
                  for this student!
                </div>
              ) : (
                <div className="breakdown-table-scroll">
                  <table className="breakdown-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Fee Structure</th>
                        <th style={{ textAlign: "right" }}>Pending Amount</th>
                        <th>Due Date</th>
                        <th style={{ textAlign: "center" }}>Status</th>
                        <th style={{ textAlign: "center", width: "130px" }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStudentDossier.remainderList.map((rf, idx) => (
                        <tr key={rf.feeStructureId ?? idx}>
                          <td>{idx + 1}</td>
                          <td className="fee-breakdown-name">{rf.feeName}</td>
                          <td
                            style={{
                              textAlign: "right",
                              color: "#b91c1c",
                              fontWeight: "700",
                            }}
                          >
                            ₹{rf.totalAmount.toFixed(2)}
                          </td>
                          <td>{formatDate(rf.dueDate)}</td>
                          <td style={{ textAlign: "center" }}>
                            <span className="fee-mini-badge status-pending">
                              Pending
                            </span>
                          </td>
                          <td style={{ textAlign: "center" }}>
                            <button
                              type="button"
                              className="btn-pay-single-remainder"
                              title="Create and pay this fee structure for this student"
                              onClick={() => {
                                navigate("/student-fee/create", {
                                  state: {
                                    studentId: selectedStudentDossier.studentId,
                                    academicYearId:
                                      selectedStudentDossier.academicYearId,
                                    departmentId:
                                      selectedStudentDossier.departmentId,
                                    classId: selectedStudentDossier.classId,
                                    sectionId: selectedStudentDossier.sectionId,
                                    feeStructureIds: [rf.feeStructureId],
                                    autoSelectFeeStructureId: rf.feeStructureId,
                                  },
                                });
                              }}
                            >
                              + Pay / Create Fee
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="student-breakdown-actions">
              <button
                type="button"
                className="btn-create-for-student"
                onClick={() => {
                  navigate("/student-fee/create", {
                    state: {
                      studentId: selectedStudentDossier.studentId,
                      academicYearId: selectedStudentDossier.academicYearId,
                      departmentId: selectedStudentDossier.departmentId,
                      classId: selectedStudentDossier.classId,
                      sectionId: selectedStudentDossier.sectionId,
                      feeStructureIds:
                        selectedStudentDossier.remainderList.length > 0
                          ? selectedStudentDossier.remainderList.map(
                              (rf) => rf.feeStructureId,
                            )
                          : [],
                    },
                  });
                }}
              >
                {selectedStudentDossier.remainderList.length > 0
                  ? `+ Create Fee on Remainder Structures (${selectedStudentDossier.remainderList.length})`
                  : "+ Create Fee for Student"}
              </button>

              <button
                type="button"
                className="btn-close-breakdown"
                onClick={() => setSelectedStudentDossier(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GetAllStudentFee;
