// =====================================================
// GET ALL FEE STRUCTURES
// =====================================================

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAllFeeStructures } from "../../Services/feeStructureService";

import { getAcademicYearDropdown } from "../../Services/academicYearService";

import { getDepartmentDropdown } from "../../Services/departmentService";

import { getClassDropdown } from "../../Services/classService";

import { getFeeCategoryDropdown } from "../../Services/feeCategoryService";
import { isOfficeEmployeeRole } from "../../Utils/auth";

import "./GetAllFeeStructures.css";

const GetAllFeeStructures = () => {
  const navigate = useNavigate();

  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dropdown lists for filter controls
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [feeCategories, setFeeCategories] = useState([]);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError("");

    try {
      const [structuresData, yearData, deptData, classData, catData] =
        await Promise.all([
          getAllFeeStructures(),
          getAcademicYearDropdown().catch(() => []),
          getDepartmentDropdown().catch(() => []),
          getClassDropdown().catch(() => []),
          getFeeCategoryDropdown().catch(() => []),
        ]);

      const rawYears = Array.isArray(yearData) ? yearData : [];
      const rawDepts = Array.isArray(deptData) ? deptData : [];
      const rawClasses = Array.isArray(classData) ? classData : [];
      const rawCats = Array.isArray(catData) ? catData : [];

      setAcademicYears(rawYears);
      setDepartments(rawDepts);
      setClasses(rawClasses);
      setFeeCategories(rawCats);

      // Build maps to ensure no columns are blank
      const yearMap = new Map();
      rawYears.forEach((item) => {
        const id = item.id ?? item.Id;
        const text =
          item.text ??
          item.Text ??
          item.name ??
          item.Name ??
          item.YearName ??
          item.yearName ??
          "";
        if (id !== undefined && id !== null) yearMap.set(Number(id), text);
      });

      const deptMap = new Map();
      rawDepts.forEach((item) => {
        const id = item.id ?? item.Id;
        const text =
          item.text ??
          item.Text ??
          item.name ??
          item.Name ??
          item.DepartmentName ??
          item.departmentName ??
          "";
        if (id !== undefined && id !== null) deptMap.set(Number(id), text);
      });

      const classMap = new Map();
      rawClasses.forEach((item) => {
        const id = item.id ?? item.Id;
        const text =
          item.text ??
          item.Text ??
          item.name ??
          item.Name ??
          item.ClassName ??
          item.className ??
          "";
        if (id !== undefined && id !== null) classMap.set(Number(id), text);
      });

      const catMap = new Map();
      rawCats.forEach((item) => {
        const id = item.id ?? item.Id;
        const text =
          item.text ??
          item.Text ??
          item.name ??
          item.Name ??
          item.CategoryName ??
          item.categoryName ??
          "";
        if (id !== undefined && id !== null) catMap.set(Number(id), text);
      });

      const list = Array.isArray(structuresData) ? structuresData : [];
      const enriched = list.map((item) => {
        const yearId = item.AcademicYearId ?? item.academicYearId;
        const deptId = item.DepartmentId ?? item.departmentId;
        const classId =
          item.ClassId ??
          item.classId ??
          item.SchoolClassId ??
          item.schoolClassId;
        const catId = item.FeeCategoryId ?? item.feeCategoryId;

        return {
          ...item,
          Id: item.Id ?? item.id,
          AcademicYearId: yearId,
          AcademicYearName:
            item.AcademicYearName ||
            item.academicYearName ||
            item.AcademicYear?.YearName ||
            item.academicYear?.yearName ||
            (yearId ? yearMap.get(Number(yearId)) : "") ||
            "-",
          DepartmentId: deptId,
          DepartmentName:
            item.DepartmentName ||
            item.departmentName ||
            item.Department?.DepartmentName ||
            item.department?.departmentName ||
            item.Department?.Name ||
            item.department?.name ||
            (deptId ? deptMap.get(Number(deptId)) : "") ||
            "-",
          ClassId: classId,
          ClassName:
            item.ClassName ||
            item.className ||
            item.SchoolClass?.ClassName ||
            item.schoolClass?.className ||
            (classId ? classMap.get(Number(classId)) : "") ||
            "-",
          FeeCategoryId: catId,
          FeeCategoryName:
            item.FeeCategoryName ||
            item.feeCategoryName ||
            item.FeeCategory?.CategoryName ||
            item.feeCategory?.categoryName ||
            (catId ? catMap.get(Number(catId)) : "") ||
            "-",
          Amount: item.Amount ?? item.amount ?? 0,
          DueDate: item.DueDate ?? item.dueDate,
          Description: item.Description ?? item.description ?? "-",
          IsActive: item.IsActive ?? item.isActive ?? true,
        };
      });

      setFeeStructures(enriched);
    } catch (err) {
      setError(err.message || "Failed to load Fee Structures.");
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (e) => {
    const newDept = e.target.value;
    setSelectedDept(newDept);

    if (newDept && selectedClass) {
      const belongs = classes.some(
        (c) =>
          String(c.id ?? c.Id) === String(selectedClass) &&
          String(c.departmentId ?? c.DepartmentId) === String(newDept),
      );
      if (!belongs) {
        setSelectedClass("");
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedYear("");
    setSelectedDept("");
    setSelectedClass("");
    setSelectedCategory("");
    setSelectedStatus("ALL");
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return date;
    return parsed.toLocaleDateString();
  };

  // Filter classes by selected department
  const availableClasses = selectedDept
    ? classes.filter(
        (c) =>
          String(c.departmentId ?? c.DepartmentId) === String(selectedDept),
      )
    : classes;

  // Filter fee structures based on all user-specified column filters
  const filteredFeeStructures = feeStructures.filter((item) => {
    // Status Filter (defaults to ALL so inactive records are visible)
    if (selectedStatus === "ACTIVE" && !item.IsActive) return false;
    if (selectedStatus === "INACTIVE" && item.IsActive) return false;

    // Academic Year Filter
    if (selectedYear && String(item.AcademicYearId) !== String(selectedYear)) {
      return false;
    }

    // Department Filter
    if (selectedDept && String(item.DepartmentId) !== String(selectedDept)) {
      return false;
    }

    // Class Filter
    if (selectedClass && String(item.ClassId) !== String(selectedClass)) {
      return false;
    }

    // Fee Category Filter
    if (
      selectedCategory &&
      String(item.FeeCategoryId) !== String(selectedCategory)
    ) {
      return false;
    }

    // Search Query (matches any column text)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matches =
        String(item.Id ?? "")
          .toLowerCase()
          .includes(q) ||
        String(item.AcademicYearName ?? "")
          .toLowerCase()
          .includes(q) ||
        String(item.DepartmentName ?? "")
          .toLowerCase()
          .includes(q) ||
        String(item.ClassName ?? "")
          .toLowerCase()
          .includes(q) ||
        String(item.FeeCategoryName ?? "")
          .toLowerCase()
          .includes(q) ||
        String(item.Amount ?? "")
          .toLowerCase()
          .includes(q) ||
        String(item.Description ?? "")
          .toLowerCase()
          .includes(q) ||
        (item.IsActive ? "active" : "inactive").includes(q);

      if (!matches) return false;
    }

    return true;
  });

  return (
    <div className="fee-structure-all-container">
      <div className="fee-structure-all-card">
        {/* HEADER */}
        <div className="fee-structure-all-header">
          <div>
            <h2>All Fee Structures</h2>
            <p>View, search, and filter fee structures by column.</p>
          </div>

          <div className="fee-header-right-actions">
            <div className="fee-top-search-bar">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search across columns..."
                className="fee-top-search-input"
              />
              <button
                type="button"
                className="fee-top-search-btn"
                title="Search"
              >
                Search
              </button>
            </div>

            <button
              className="fee-structure-refresh-btn"
              onClick={loadData}
              disabled={loading}
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* ERROR MESSAGE */}
        {error && <div className="fee-structure-error">{error}</div>}

        {/* COLUMN FILTERS BAR */}
        <div className="fee-structure-search-box">
          <div className="fee-structure-filter-grid">
            {/* ACADEMIC YEAR FILTER */}
            <div className="fee-structure-filter-item">
              <label>Academic Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                <option value="">All Academic Years</option>
                {academicYears.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ??
                      item.Text ??
                      item.name ??
                      item.Name ??
                      item.YearName}
                  </option>
                ))}
              </select>
            </div>

            {/* DEPARTMENT FILTER */}
            <div className="fee-structure-filter-item">
              <label>Department</label>
              <select value={selectedDept} onChange={handleDepartmentChange}>
                <option value="">All Departments</option>
                {departments.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ??
                      item.Text ??
                      item.name ??
                      item.Name ??
                      item.DepartmentName}
                  </option>
                ))}
              </select>
            </div>

            {/* CLASS FILTER */}
            <div className="fee-structure-filter-item">
              <label>Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">
                  {selectedDept ? "All Department Classes" : "All Classes"}
                </option>
                {availableClasses.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ??
                      item.Text ??
                      item.name ??
                      item.Name ??
                      item.ClassName}
                  </option>
                ))}
              </select>
            </div>

            {/* FEE CATEGORY FILTER */}
            <div className="fee-structure-filter-item">
              <label>Fee Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">All Fee Categories</option>
                {feeCategories.map((item) => (
                  <option key={item.id ?? item.Id} value={item.id ?? item.Id}>
                    {item.text ??
                      item.Text ??
                      item.name ??
                      item.Name ??
                      item.CategoryName}
                  </option>
                ))}
              </select>
            </div>

            {/* STATUS FILTER */}
            <div className="fee-structure-filter-item">
              <label>Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All (Active & Inactive)</option>
                <option value="ACTIVE">Active Only</option>
                <option value="INACTIVE">Inactive Only</option>
              </select>
            </div>
          </div>

          <div className="fee-structure-search-actions">
            <span className="fee-structure-count-badge">
              Showing {filteredFeeStructures.length} of {feeStructures.length}{" "}
              records
            </span>

            {(searchQuery ||
              selectedYear ||
              selectedDept ||
              selectedClass ||
              selectedCategory ||
              selectedStatus !== "ALL") && (
              <button
                type="button"
                className="fee-structure-clear-btn"
                onClick={handleResetFilters}
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* CONTENT */}
        {loading ? (
          <div className="fee-structure-loading">Loading Fee Structures...</div>
        ) : feeStructures.length === 0 ? (
          <div className="fee-structure-empty">
            No Fee Structure records found.
          </div>
        ) : filteredFeeStructures.length === 0 ? (
          <div className="fee-structure-empty">
            No matching Fee Structure records found with the applied filters.
          </div>
        ) : (
          <div className="fee-structure-table-wrapper">
            <table className="fee-structure-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Academic Year</th>
                  <th>Department</th>
                  <th>Class</th>
                  <th>Fee Category</th>
                  <th>Amount</th>
                  <th>Due Date</th>
                  <th>Description</th>
                  <th>Status</th>
                  {!isOfficeEmployeeRole() && <th>Actions</th>}
                </tr>
              </thead>

              <tbody>
                {filteredFeeStructures.map((item, index) => (
                  <tr key={item.Id || index}>
                    <td>{index + 1}</td>

                    <td>{item.AcademicYearName || "-"}</td>

                    <td>{item.DepartmentName || "-"}</td>

                    <td>{item.ClassName || "-"}</td>

                    <td>{item.FeeCategoryName || "-"}</td>

                    <td>₹{Number(item.Amount || 0).toFixed(2)}</td>

                    <td>{formatDate(item.DueDate)}</td>

                    <td>{item.Description || "-"}</td>

                    <td>
                      <span
                        className={
                          item.IsActive
                            ? "fee-status-active"
                            : "fee-status-inactive"
                        }
                      >
                        {item.IsActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {!isOfficeEmployeeRole() && (
                      <td>
                        <div className="fee-structure-action-buttons">
                          <button
                            type="button"
                            className="fee-action-edit-btn"
                            onClick={() => navigate("/fee-structure/update")}
                            title="Update Fee Structure"
                          >
                            Update
                          </button>
                          <button
                            type="button"
                            className="fee-action-delete-btn"
                            onClick={() => navigate("/fee-structure/delete")}
                            title="Delete Fee Structure"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetAllFeeStructures;
