// =====================================================
// GET STUDENT FEE BY STUDENT (FILTER-DRIVEN INQUIRY)
// Academic Year -> Department -> Class -> Section -> Student
// Only displays student records after filter is applied.
// Clicking a record opens full submitted vs remainder breakdown.
// =====================================================

import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import {
  getAllStudentFees,
  getStudentFeeDepartmentDropdown,
  getStudentFeeClassDropdown,
  getStudentFeeSectionDropdown,
  getStudentFeeStudentDropdown,
} from "../../Services/studentFeeService";
import { getAllStudentsWithDetails } from "../../Services/studentService";
import { getAllFeeStructures } from "../../Services/feeStructureService";
import { getAllAcademicYear } from "../../Services/academicYearService";
import { sortFeeStructuresByAcademicCalendar } from "./CreateStudentFee";

import "./GetStudentFeeByStudent.css";

const GetStudentFeeByStudent = () => {
  const navigate = useNavigate();

  // Raw data from APIs
  const [students, setStudents] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [defaultAcademicYearId, setDefaultAcademicYearId] = useState("");

  // Cascading dropdown lists
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [studentOptions, setStudentOptions] = useState([]);

  // Filter form selections
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // State flag: only show results after filter is applied
  const [isFilterApplied, setIsFilterApplied] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState(null);

  // Detail breakdown modal
  const [selectedStudentDossier, setSelectedStudentDossier] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // INITIAL DATA LOAD
  // =====================================================

  const loadInitialData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        studentsData,
        feesData,
        structuresData,
        academicYearsData,
        deptData,
      ] = await Promise.all([
        getAllStudentsWithDetails().catch(() => []),
        getAllStudentFees().catch(() => []),
        getAllFeeStructures().catch(() => []),
        getAllAcademicYear().catch(() => []),
        getStudentFeeDepartmentDropdown().catch(() => []),
      ]);

      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setStudentFees(Array.isArray(feesData) ? feesData : []);
      setFeeStructures(Array.isArray(structuresData) ? structuresData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);

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
    } catch (err) {
      setError(err.message || "Failed to load student fee data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString();
  };

  // =====================================================
  // MAPS & LOOKUPS
  // =====================================================

  const academicYearMap = useMemo(() => {
    const map = {};
    academicYears.forEach((ay) => {
      const id = ay.Id ?? ay.id;
      const name = ay.Name ?? ay.name ?? ay.YearName ?? ay.yearName;
      if (id) map[String(id)] = name;
    });
    return map;
  }, [academicYears]);

  const feeStructureMap = useMemo(() => {
    const map = {};
    feeStructures.forEach((fs) => {
      const id = fs.Id ?? fs.id;
      if (id) map[String(id)] = fs;
    });
    return map;
  }, [feeStructures]);

  // =====================================================
  // CASCADING HANDLERS
  // =====================================================

  const handleDepartmentChange = async (e) => {
    const value = e.target.value;
    setSelectedDepartment(value);
    setSelectedClass("");
    setSelectedSection("");
    setSelectedStudent("");
    setClasses([]);
    setSections([]);
    setStudentOptions([]);

    if (!value) return;

    try {
      const data = await getStudentFeeClassDropdown(value);
      setClasses(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClassChange = async (e) => {
    const value = e.target.value;
    setSelectedClass(value);
    setSelectedSection("");
    setSelectedStudent("");
    setSections([]);
    setStudentOptions([]);

    if (!value) return;

    try {
      const data = await getStudentFeeSectionDropdown(value);
      setSections(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSectionChange = async (e) => {
    const value = e.target.value;
    setSelectedSection(value);
    setSelectedStudent("");
    setStudentOptions([]);

    if (!value || !selectedDepartment || !selectedClass) return;

    try {
      const data = await getStudentFeeStudentDropdown(
        selectedDepartment,
        selectedClass,
        value,
      );
      setStudentOptions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    }
  };

  // =====================================================
  // APPLY / RESET FILTERS
  // =====================================================

  const handleApplyFilter = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAppliedFilters({
      academicYearId: selectedAcademicYear,
      departmentId: selectedDepartment,
      classId: selectedClass,
      sectionId: selectedSection,
      studentId: selectedStudent,
      searchTerm: searchTerm.trim(),
    });
    setIsFilterApplied(true);
  };

  const handleResetFilters = () => {
    setSelectedAcademicYear(defaultAcademicYearId);
    setSelectedDepartment("");
    setSelectedClass("");
    setSelectedSection("");
    setSelectedStudent("");
    setSearchTerm("");
    setClasses([]);
    setSections([]);
    setStudentOptions([]);
    setIsFilterApplied(false);
    setAppliedFilters(null);
    setSelectedStudentDossier(null);
  };

  // =====================================================
  // ENRICHED STUDENT DIRECTORY (CORRELATED LEDGER)
  // =====================================================

  const studentFeeDirectory = useMemo(() => {
    const currentAyId = appliedFilters?.academicYearId || selectedAcademicYear;

    return students.map((student) => {
      const studentId = student.Id ?? student.id;
      const classId =
        student.SchoolClassId ??
        student.schoolClassId ??
        student.ClassId ??
        student.classId;
      const deptId = student.DepartmentId ?? student.departmentId;
      const sectionId = student.SectionId ?? student.sectionId;

      // Applicable fee structures for this student's class and academic year
      const applicableStructures = feeStructures.filter((fs) => {
        const fsClassId = fs.ClassId ?? fs.classId;
        const fsAyId = fs.AcademicYearId ?? fs.academicYearId;
        const isActive = fs.IsActive !== false && fs.isActive !== false;
        const matchClass = String(fsClassId) === String(classId);
        const matchYear =
          !currentAyId || String(fsAyId) === String(currentAyId);
        return matchClass && matchYear && isActive;
      });

      // Student fees assigned to this student for this academic year
      const assignedFees = studentFees.filter((sf) => {
        const matchStudent =
          String(sf.StudentId ?? sf.studentId) === String(studentId);
        if (!matchStudent) return false;
        if (!currentAyId) return true;
        const matchedFs =
          feeStructureMap[String(sf.FeeStructureId ?? sf.feeStructureId)];
        const fsAyId = matchedFs?.AcademicYearId ?? matchedFs?.academicYearId;
        return String(fsAyId) === String(currentAyId);
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

      // Remainder fee structures (applicable, not yet assigned)
      const submittedFsIds = new Set(
        assignedFees.map((sf) =>
          String(sf.FeeStructureId ?? sf.feeStructureId),
        ),
      );

      const unassignedStructures = applicableStructures.filter(
        (fs) => !submittedFsIds.has(String(fs.Id ?? fs.id)),
      );

      // Sort remainder fee structures by Academic Calendar order
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

      const effectiveAyId =
        currentAyId ||
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
        sectionId,
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
    appliedFilters,
    selectedAcademicYear,
  ]);

  // =====================================================
  // FILTERED STUDENTS (ONLY COMPUTED AFTER FILTER APPLIED)
  // =====================================================

  const filteredStudents = useMemo(() => {
    if (!isFilterApplied || !appliedFilters) {
      return [];
    }

    return studentFeeDirectory.filter((item) => {
      // 1. Department
      if (
        appliedFilters.departmentId &&
        String(item.departmentId) !== String(appliedFilters.departmentId)
      ) {
        return false;
      }

      // 2. Class
      if (
        appliedFilters.classId &&
        String(item.classId) !== String(appliedFilters.classId)
      ) {
        return false;
      }

      // 3. Section
      if (
        appliedFilters.sectionId &&
        String(item.sectionId) !== String(appliedFilters.sectionId)
      ) {
        return false;
      }

      // 4. Student
      if (
        appliedFilters.studentId &&
        String(item.studentId) !== String(appliedFilters.studentId)
      ) {
        return false;
      }

      // 5. Academic Year (if item has an academic year)
      if (
        appliedFilters.academicYearId &&
        item.academicYearId &&
        String(item.academicYearId) !== String(appliedFilters.academicYearId)
      ) {
        return false;
      }

      // 6. Search Term
      if (appliedFilters.searchTerm) {
        const query = appliedFilters.searchTerm.toLowerCase();
        const matchName = item.studentName.toLowerCase().includes(query);
        const matchAdm = item.admissionNumber.toLowerCase().includes(query);
        if (!matchName && !matchAdm) return false;
      }

      return true;
    });
  }, [studentFeeDirectory, isFilterApplied, appliedFilters]);

  return (
    <div className="get-student-fee-by-student-page">
      <div className="get-student-fee-by-student-container">
        {/* Header */}
        <div className="get-student-fee-by-student-header">
          <div>
            <h2>Student Fee Inquiry & Breakdown</h2>
            <p>
              Filter by Academic Year, Department, Class, Section, or Student.
              Click <strong>Apply Filter</strong> to view student fee records
              and inspect detailed submitted vs remainder fee structures.
            </p>
          </div>

          <div className="get-student-fee-by-student-header-actions">
            <button
              type="button"
              className="btn-header-create"
              onClick={() => navigate("/student-fee/create")}
            >
              + Create Student Fee
            </button>
            <button
              type="button"
              className="btn-header-all"
              onClick={() => navigate("/student-fee/all")}
            >
              View All Students Fee
            </button>
            <button
              type="button"
              className="btn-header-refresh"
              onClick={loadInitialData}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {error && (
          <div className="get-student-fee-by-student-error">{error}</div>
        )}

        {/* Filter Card */}
        <form className="student-fee-filter-card" onSubmit={handleApplyFilter}>
          <div className="filter-card-header">
            <h4>Select Search & Filter Criteria</h4>
            <span className="filter-card-hint">
              Cascading hierarchy: Academic Year → Department → Class → Section
              → Student
            </span>
          </div>

          <div className="filter-card-grid">
            {/* 1. Academic Year */}
            <div className="filter-field">
              <label>Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
              >
                <option value="">All Academic Years</option>
                {academicYears.map((ay) => (
                  <option key={ay.Id ?? ay.id} value={ay.Id ?? ay.id}>
                    {ay.Name ?? ay.name ?? ay.YearName ?? ay.yearName}
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Department */}
            <div className="filter-field">
              <label>Department</label>
              <select
                value={selectedDepartment}
                onChange={handleDepartmentChange}
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id ?? dept.Id} value={dept.id ?? dept.Id}>
                    {dept.text ?? dept.Text ?? dept.name ?? dept.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Class */}
            <div className="filter-field">
              <label>Class</label>
              <select
                value={selectedClass}
                onChange={handleClassChange}
                disabled={!selectedDepartment}
              >
                <option value="">All Classes</option>
                {classes.map((cls) => (
                  <option key={cls.id ?? cls.Id} value={cls.id ?? cls.Id}>
                    {cls.text ?? cls.Text ?? cls.name ?? cls.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* 4. Section */}
            <div className="filter-field">
              <label>Section</label>
              <select
                value={selectedSection}
                onChange={handleSectionChange}
                disabled={!selectedClass}
              >
                <option value="">All Sections</option>
                {sections.map((sec) => (
                  <option key={sec.id ?? sec.Id} value={sec.id ?? sec.Id}>
                    {sec.text ?? sec.Text ?? sec.name ?? sec.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* 5. Student */}
            <div className="filter-field">
              <label>Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                disabled={!selectedSection}
              >
                <option value="">All Students in Section</option>
                {studentOptions.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.text}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Search & Actions Row */}
          <div className="filter-card-bottom-row">
            <div className="filter-search-wrapper">
              <input
                type="text"
                placeholder="Search by Student Name or Admission No..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="filter-search-clear"
                  onClick={() => setSearchTerm("")}
                >
                  ✕
                </button>
              )}
            </div>

            <div className="filter-button-group">
              <button type="submit" className="btn-apply-filter">
                🔍 Apply Filter
              </button>

              {(selectedDepartment ||
                selectedClass ||
                selectedSection ||
                selectedStudent ||
                searchTerm ||
                isFilterApplied) && (
                <button
                  type="button"
                  className="btn-reset-filter"
                  onClick={handleResetFilters}
                >
                  Reset
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Loading */}
        {loading && (
          <div className="get-student-fee-by-student-loading">
            Loading student fee records...
          </div>
        )}

        {/* Before Filter Applied State */}
        {!loading && !isFilterApplied && (
          <div className="filter-pending-notice">
            <div className="notice-icon">🔍</div>
            <h3>Apply Filters to View Student Fee Records</h3>
            <p>
              Select your desired Department, Class, Section, or search by
              Student Name / Admission No. above and click{" "}
              <strong>Apply Filter</strong> to view student fee records.
            </p>
          </div>
        )}

        {/* After Filter Applied: Empty State */}
        {!loading && isFilterApplied && filteredStudents.length === 0 && (
          <div className="get-student-fee-by-student-empty">
            No matching student fee records found for the applied filters.
          </div>
        )}

        {/* After Filter Applied: Results Table */}
        {!loading && isFilterApplied && filteredStudents.length > 0 && (
          <div className="student-fee-results-section">
            <div className="student-fee-count-bar">
              Showing <strong>{filteredStudents.length}</strong> matching
              student record(s)
            </div>

            <div className="student-fee-table-wrapper">
              <table className="student-fee-directory-table">
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
                          color:
                            item.totalRemaining > 0 ? "#dc2626" : "#16a34a",
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
                          {item.remainderList &&
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
          </div>
        )}

        {/* =================================================== */}
        {/* STUDENT BREAKDOWN DETAIL MODAL */}
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
                    <strong>Dept:</strong>{" "}
                    {selectedStudentDossier.departmentName}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Class:</strong> {selectedStudentDossier.className}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Section:</strong>{" "}
                    {selectedStudentDossier.sectionName}
                  </span>
                  <span>•</span>
                  <span>
                    <strong>Academic Year:</strong>{" "}
                    {selectedStudentDossier.academicYearName}
                  </span>
                </div>
              </div>

              {/* KPI Summary Cards Grid */}
              <div className="breakdown-kpi-grid">
                <div className="breakdown-kpi-card kpi-total">
                  <span className="breakdown-kpi-label">
                    Total Fee Structure
                  </span>
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
                          <th style={{ textAlign: "right" }}>
                            Remaining Amount
                          </th>
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
                              <code className="invoice-code">
                                {sf.invoiceNo}
                              </code>
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                fontWeight: "600",
                              }}
                            >
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
                            academicYearId:
                              selectedStudentDossier.academicYearId,
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
                                      studentId:
                                        selectedStudentDossier.studentId,
                                      academicYearId:
                                        selectedStudentDossier.academicYearId,
                                      departmentId:
                                        selectedStudentDossier.departmentId,
                                      classId: selectedStudentDossier.classId,
                                      sectionId:
                                        selectedStudentDossier.sectionId,
                                      feeStructureIds: [rf.feeStructureId],
                                      autoSelectFeeStructureId:
                                        rf.feeStructureId,
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
    </div>
  );
};

export default GetStudentFeeByStudent;
