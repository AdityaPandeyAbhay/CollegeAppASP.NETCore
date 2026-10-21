// =====================================================
// GET FEE STRUCTURE BY CLASS
// =====================================================

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { getFeeStructureByClass } from "../../Services/feeStructureService";

import { getAcademicYearDropdown } from "../../Services/academicYearService";

import { getDepartmentDropdown } from "../../Services/departmentService";

import { getClassDropdown } from "../../Services/classService";

import { getFeeCategoryDropdown } from "../../Services/feeCategoryService";
import { isOfficeEmployeeRole, isTeacherRole } from "../../Utils/auth";
import {
  getMyClassTeacherAssignment,
  getCachedClassTeacherAssignment,
} from "../../Services/classTeacherService";

import "./GetFeeStructureByClass.css";

const GetFeeStructureByClass = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Dropdown options
  const [academicYears, setAcademicYears] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [feeCategories, setFeeCategories] = useState([]);

  // Search parameters
  const [academicYearId, setAcademicYearId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [classId, setClassId] = useState("");

  // Results & UI state
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(true);
  const [error, setError] = useState("");

  // In-table search & filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  async function fetchStructuresForClass(
    targetClassId,
    years = academicYears,
    depts = departments,
    cls = classes,
    cats = feeCategories,
  ) {
    if (!targetClassId) return;
    setLoading(true);
    setError("");
    try {
      const data = await getFeeStructureByClass(targetClassId);
      const list = Array.isArray(data) ? data : [];

      const yearMap = new Map();
      (years || []).forEach((y) => {
        const id = y.id ?? y.Id;
        const text = y.text ?? y.Text ?? y.name ?? y.Name ?? y.YearName ?? "";
        if (id !== undefined && id !== null) yearMap.set(Number(id), text);
      });

      const deptMap = new Map();
      (depts || []).forEach((d) => {
        const id = d.id ?? d.Id;
        const text = d.text ?? d.Text ?? d.name ?? d.Name ?? d.DepartmentName ?? "";
        if (id !== undefined && id !== null) deptMap.set(Number(id), text);
      });

      const classMap = new Map();
      (cls || []).forEach((c) => {
        const id = c.id ?? c.Id;
        const text = c.text ?? c.Text ?? c.name ?? c.Name ?? c.ClassName ?? "";
        if (id !== undefined && id !== null) classMap.set(Number(id), text);
      });

      const catMap = new Map();
      (cats || []).forEach((ct) => {
        const id = ct.id ?? ct.Id;
        const text = ct.text ?? ct.Text ?? ct.name ?? ct.Name ?? ct.CategoryName ?? "";
        if (id !== undefined && id !== null) catMap.set(Number(id), text);
      });

      const enriched = list.map((item) => {
        const yearId = item.AcademicYearId ?? item.academicYearId;
        const deptId = item.DepartmentId ?? item.departmentId;
        const cId = item.ClassId ?? item.classId ?? item.SchoolClassId ?? item.schoolClassId;
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
          DepartmentName:
            item.DepartmentName ||
            item.departmentName ||
            item.Department?.DepartmentName ||
            item.department?.departmentName ||
            item.Department?.Name ||
            item.department?.name ||
            (deptId ? deptMap.get(Number(deptId)) : "") ||
            "-",
          ClassName:
            item.ClassName ||
            item.className ||
            item.SchoolClass?.ClassName ||
            item.schoolClass?.className ||
            (cId ? classMap.get(Number(cId)) : "") ||
            "-",
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
      setError(err.message || "Failed to load Fee Structures for this class.");
      setFeeStructures([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadDropdowns() {
    setDropdownLoading(true);
    try {
      const [yearData, deptData, classData, catData] = await Promise.all([
        getAcademicYearDropdown().catch(() => []),
        getDepartmentDropdown().catch(() => []),
        getClassDropdown().catch(() => []),
        getFeeCategoryDropdown().catch(() => []),
      ]);

      setAcademicYears(Array.isArray(yearData) ? yearData : []);
      setDepartments(Array.isArray(deptData) ? deptData : []);
      const classList = Array.isArray(classData) ? classData : [];
      setClasses(classList);
      setFeeCategories(Array.isArray(catData) ? catData : []);

      // If navigated with state from dashboard or logged in as Teacher
      let targetClassId = location.state?.classId ? String(location.state.classId) : "";
      let targetDeptId = location.state?.departmentId ? String(location.state.departmentId) : "";
      let targetYearId = location.state?.academicYearId ? String(location.state.academicYearId) : "";

      if (!targetClassId && isTeacherRole()) {
        const cached = getCachedClassTeacherAssignment();
        const ctAssignment = cached?.isClassTeacher ? cached : await getMyClassTeacherAssignment().catch(() => null);
        if (ctAssignment?.isClassTeacher && ctAssignment.classId) {
          targetClassId = String(ctAssignment.classId);
          if (ctAssignment.departmentId) targetDeptId = String(ctAssignment.departmentId);
          if (ctAssignment.academicYearId) targetYearId = String(ctAssignment.academicYearId);
        }
      }

      if (targetClassId) {
        setClassId(targetClassId);
        if (targetDeptId) {
          setDepartmentId(targetDeptId);
        }
        if (targetYearId) {
          setAcademicYearId(targetYearId);
        }
        // Auto trigger search for this class
        fetchStructuresForClass(targetClassId, yearData, deptData, classList, catData);
      }
    } catch (err) {
      setError(err.message || "Failed to load dropdown options.");
    } finally {
      setDropdownLoading(false);
    }
  }

  useEffect(() => {
    loadDropdowns();
  }, []);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();

    setError("");
    setFeeStructures([]);

    if (!classId) {
      setError("Please select a Class.");
      return;
    }

    setLoading(true);

    try {
      const data = await getFeeStructureByClass(classId);
      const list = Array.isArray(data) ? data : [];

      // Name maps to guarantee no blank columns
      const yearMap = new Map();
      academicYears.forEach((y) => {
        const id = y.id ?? y.Id;
        const text = y.text ?? y.Text ?? y.name ?? y.Name ?? y.YearName ?? "";
        if (id !== undefined && id !== null) yearMap.set(Number(id), text);
      });

      const deptMap = new Map();
      departments.forEach((d) => {
        const id = d.id ?? d.Id;
        const text =
          d.text ?? d.Text ?? d.name ?? d.Name ?? d.DepartmentName ?? "";
        if (id !== undefined && id !== null) deptMap.set(Number(id), text);
      });

      const classMap = new Map();
      classes.forEach((c) => {
        const id = c.id ?? c.Id;
        const text = c.text ?? c.Text ?? c.name ?? c.Name ?? c.ClassName ?? "";
        if (id !== undefined && id !== null) classMap.set(Number(id), text);
      });

      const catMap = new Map();
      feeCategories.forEach((ct) => {
        const id = ct.id ?? ct.Id;
        const text =
          ct.text ?? ct.Text ?? ct.name ?? ct.Name ?? ct.CategoryName ?? "";
        if (id !== undefined && id !== null) catMap.set(Number(id), text);
      });

      const enriched = list.map((item) => {
        const yearId = item.AcademicYearId ?? item.academicYearId;
        const deptId = item.DepartmentId ?? item.departmentId;
        const cId =
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
          DepartmentName:
            item.DepartmentName ||
            item.departmentName ||
            item.Department?.DepartmentName ||
            item.department?.departmentName ||
            item.Department?.Name ||
            item.department?.name ||
            (deptId ? deptMap.get(Number(deptId)) : "") ||
            "-",
          ClassName:
            item.ClassName ||
            item.className ||
            item.SchoolClass?.ClassName ||
            item.schoolClass?.className ||
            (cId ? classMap.get(Number(cId)) : "") ||
            "-",
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
      setError(err.message || "Failed to load Fee Structures for this class.");
    } finally {
      setLoading(false);
    }
  };

  const handleDepartmentChange = (e) => {
    const newDept = e.target.value;
    setDepartmentId(newDept);
    if (newDept && classId) {
      const belongs = classes.some(
        (c) =>
          String(c.id ?? c.Id) === String(classId) &&
          String(c.departmentId ?? c.DepartmentId) === String(newDept),
      );
      if (!belongs) {
        setClassId("");
      }
    }
  };

  const handleResetFilters = () => {
    setSearchQuery("");
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
  const availableClasses = departmentId
    ? classes.filter(
        (c) =>
          String(c.departmentId ?? c.DepartmentId) === String(departmentId),
      )
    : classes;

  // Filter results by Academic Year, Department (if set), in-table Category, Status, and search query
  const filteredFeeStructures = feeStructures.filter((item) => {
    // If user filtered by Academic Year in search form
    if (
      academicYearId &&
      String(item.AcademicYearId) !== String(academicYearId)
    ) {
      return false;
    }

    // If user filtered by Department in search form
    if (departmentId && String(item.DepartmentId) !== String(departmentId)) {
      return false;
    }

    // Status Filter (defaults to ALL so inactive records are visible)
    if (selectedStatus === "ACTIVE" && !item.IsActive) return false;
    if (selectedStatus === "INACTIVE" && item.IsActive) return false;

    // Fee Category Filter
    if (
      selectedCategory &&
      String(item.FeeCategoryId) !== String(selectedCategory)
    ) {
      return false;
    }

    // Quick text search across all columns
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
    <div className="fee-class-search-container">
      <div className="fee-class-search-card">
        <div className="fee-class-header">
          <div>
            <h2>Fee Structures By Class</h2>
            <p>
              Filter by Academic Year, Department, and Class to view fee
              structures.
            </p>
          </div>

          <button
            type="button"
            className="fee-search-top-right-btn"
            onClick={handleSearch}
            disabled={loading || dropdownLoading || !classId}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* SEARCH FORM WITH ACADEMIC YEAR, DEPARTMENT & CLASS DROPDOWNS */}
        <form className="fee-class-search-form" onSubmit={handleSearch}>
          {/* ACADEMIC YEAR */}
          <div className="fee-class-form-group">
            <label>Academic Year</label>
            <select
              value={academicYearId}
              onChange={(e) => setAcademicYearId(e.target.value)}
              disabled={dropdownLoading || loading}
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

          {/* DEPARTMENT */}
          <div className="fee-class-form-group">
            <label>Department</label>
            <select
              value={departmentId}
              onChange={handleDepartmentChange}
              disabled={dropdownLoading || loading}
            >
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

          {/* CLASS */}
          <div className="fee-class-form-group">
            <label>Class *</label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              disabled={dropdownLoading || loading}
              required
            >
              <option value="">
                {departmentId && availableClasses.length === 0
                  ? "No classes in this department"
                  : "Select Class"}
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

          <button
            type="submit"
            className="fee-class-search-btn"
            disabled={loading || dropdownLoading || !classId}
          >
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* ERROR MESSAGE */}
        {error && <div className="fee-class-error">{error}</div>}

        {/* RESULTS & IN-TABLE FILTERS */}
        {feeStructures.length > 0 && (
          <div className="fee-class-results-section">
            <div className="fee-results-top-bar">
              <h3>Fee Structure Records</h3>
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
            </div>

            {/* COLUMN FILTERS */}
            <div className="fee-class-filter-bar">
              <div className="fee-class-filter-item">
                <label>Fee Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
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

              <div className="fee-class-filter-item">
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

              <div className="fee-class-filter-actions">
                <span className="fee-class-count-badge">
                  Showing {filteredFeeStructures.length} of{" "}
                  {feeStructures.length} records
                </span>

                {(searchQuery ||
                  selectedCategory ||
                  selectedStatus !== "ALL") && (
                  <button
                    type="button"
                    className="fee-class-clear-btn"
                    onClick={handleResetFilters}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>

            {/* TABLE */}
            <div className="fee-class-table-wrapper">
              <table className="fee-class-table">
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
                    {!isOfficeEmployeeRole() && !isTeacherRole() && <th>Actions</th>}
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
                      {!isOfficeEmployeeRole() && !isTeacherRole() && (
                        <td>
                          <div className="fee-class-action-buttons">
                            <button
                              type="button"
                              className="fee-action-edit-btn"
                              onClick={() => navigate("/fee-structure/update")}
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              className="fee-action-delete-btn"
                              onClick={() => navigate("/fee-structure/delete")}
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
          </div>
        )}

        {!loading && classId && feeStructures.length === 0 && !error && (
          <div className="fee-class-empty">
            No Fee Structures found for the selected class.
          </div>
        )}
      </div>
    </div>
  );
};

export default GetFeeStructureByClass;
