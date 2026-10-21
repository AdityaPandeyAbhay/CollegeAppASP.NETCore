// =====================================================
// GET FEE CATEGORY BY NAME
// =====================================================

import { useState, useEffect } from "react";

import {
  getFeeCategoryByName,
  getAllFeeCategories,
  getFeeCategoryDropdown,
} from "../../Services/feeCategoryService";

import "./GetFeeCategoryByName.css";

const GetFeeCategoryByName = () => {
  const [name, setName] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryOptions, setCategoryOptions] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingDropdown, setLoadingDropdown] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD CATEGORIES DROPDOWN
  // =====================================================
  useEffect(() => {
    loadCategoryOptions();
  }, []);

  const loadCategoryOptions = async () => {
    try {
      setLoadingDropdown(true);
      let data = [];
      try {
        data = await getAllFeeCategories();
      } catch {
        data = await getFeeCategoryDropdown();
      }

      const list = Array.isArray(data) ? data : [];
      setCategoryOptions(list);
    } catch (err) {
      console.warn("Failed to load fee category options:", err);
      setCategoryOptions([]);
    } finally {
      setLoadingDropdown(false);
    }
  };

  // =====================================================
  // SEARCH
  // =====================================================

  const performSearch = async (categoryNameToSearch) => {
    const query = (categoryNameToSearch ?? name).trim();
    setError("");
    setCategories([]);

    if (!query) {
      setError("Please select a Category Name.");
      return;
    }

    try {
      setLoading(true);

      const data = await getFeeCategoryByName(query);

      const result = Array.isArray(data) ? data : data ? [data] : [];

      if (result.length === 0) {
        setError("No Fee Category found.");
        return;
      }

      setCategories(result);
    } catch (err) {
      setError(err.message || "Fee Category not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    performSearch(name);
  };

  const handleCategorySelect = (e) => {
    const selected = e.target.value;
    setName(selected);
    setError("");

    if (!selected) {
      setCategories([]);
      return;
    }

    performSearch(selected);
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {
    setName("");
    setCategories([]);
    setError("");
  };

  return (
    <div className="fee-category-name-container">
      <div className="fee-category-name-card">
        <div className="fee-category-name-header">
          <h2>Get Fee Category By Name</h2>
          <p>Select fee category from dropdown to view details</p>
        </div>

        <div className="fee-category-name-search">
          <div className="fee-category-name-input-group">
            <label htmlFor="fee-category-name-select">Category Name</label>

            <select
              id="fee-category-name-select"
              value={name}
              onChange={handleCategorySelect}
              disabled={loadingDropdown}
              className="fee-category-name-select"
            >
              <option value="">
                {loadingDropdown
                  ? "Loading categories..."
                  : categoryOptions.length === 0
                    ? "No categories available"
                    : "Select Category Name"}
              </option>
              {categoryOptions.map((cat, index) => {
                const catName =
                  cat.categoryName ??
                  cat.CategoryName ??
                  cat.text ??
                  cat.Text ??
                  cat.name;
                const catId = cat.id ?? cat.Id ?? index;
                const isActive = Boolean(cat.isActive ?? cat.IsActive ?? true);
                if (!catName) return null;
                return (
                  <option key={`${catId}-${catName}`} value={catName}>
                    {catName}
                    {!isActive ? " (Inactive)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="fee-category-name-buttons">
            <button
              onClick={handleSearch}
              disabled={loading || !name}
              className="fee-category-name-search-btn"
            >
              {loading ? "Searching..." : "Search"}
            </button>

            <button
              onClick={handleClear}
              className="fee-category-name-clear-btn"
            >
              Clear
            </button>
          </div>
        </div>

        {error && <div className="fee-category-name-error">{error}</div>}

        {categories.length > 0 && (
          <div className="fee-category-name-results">
            <h3>Search Results</h3>

            <div className="fee-category-name-table-wrapper">
              <table className="fee-category-name-table">
                <thead>
                  <tr>
                    <th>S.No.</th>
                    <th>Category Name</th>
                    <th>Description</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {categories.map((category, index) => {
                    const isActive = Boolean(
                      category.isActive ?? category.IsActive,
                    );

                    return (
                      <tr key={category.id ?? category.Id ?? index}>
                        <td>{index + 1}</td>

                        <td>
                          <strong>
                            {category.categoryName ?? category.CategoryName}
                          </strong>
                        </td>

                        <td>
                          {category.description ?? category.Description ?? "-"}
                        </td>

                        <td>
                          <span
                            className={
                              isActive
                                ? "fee-category-status-active"
                                : "fee-category-status-inactive"
                            }
                          >
                            {isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetFeeCategoryByName;
