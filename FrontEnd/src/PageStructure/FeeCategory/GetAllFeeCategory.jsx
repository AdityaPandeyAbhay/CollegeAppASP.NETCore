// =====================================================
// GET ALL FEE CATEGORIES
// =====================================================

import { useEffect, useState, useMemo } from "react";
import { getAllFeeCategories } from "../../Services/feeCategoryService";
import "./GetAllFeeCategory.css";

const GetAllFeeCategory = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // =====================================================
  // LOAD DATA
  // =====================================================
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getAllFeeCategories();
      const list = Array.isArray(data) ? data : [];
      setCategories(list);
    } catch (err) {
      setError(err.message || "Failed to load Fee Categories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // =====================================================
  // SEARCH FILTER ACROSS ALL DISPLAYED COLUMNS AND ROWS
  // =====================================================
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    const term = searchTerm.toLowerCase().trim();

    return categories.filter((category, index) => {
      const sNo = String(index + 1);
      const catName = String(
        category.categoryName || category.CategoryName || "",
      ).toLowerCase();
      const desc = String(
        category.description || category.Description || "",
      ).toLowerCase();
      const isActive = category.isActive ?? category.IsActive;
      const statusText = isActive ? "active" : "inactive";
      const idStr = String(category.id ?? category.Id ?? "");

      return (
        sNo.includes(term) ||
        catName.includes(term) ||
        desc.includes(term) ||
        statusText.includes(term) ||
        idStr.includes(term)
      );
    });
  }, [categories, searchTerm]);

  return (
    <div className="fee-category-all-container">
      <div className="fee-category-all-card">
        {/* HEADER */}
        <div className="fee-category-all-header">
          <div>
            <h2>All Fee Categories</h2>
            <p>View all fee categories</p>
          </div>

          <button onClick={loadCategories} className="fee-category-all-refresh">
            🔄 Refresh
          </button>
        </div>

        {/* SEARCH BAR & CONTROLS */}
        <div className="fee-category-search-bar-wrapper">
          <div className="fee-category-search-input-group">
            <span className="fee-category-search-icon">🔍</span>
            <input
              type="text"
              className="fee-category-search-input"
              placeholder="Search across all columns (Category Name, Description, Status, S.No)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="fee-category-search-clear-btn"
                onClick={() => setSearchTerm("")}
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          <div className="fee-category-search-meta">
            <span className="fee-category-count-badge">
              Showing {filteredCategories.length} of {categories.length}{" "}
              categories
            </span>
            {searchTerm && (
              <button
                type="button"
                className="fee-category-clear-all-btn"
                onClick={() => setSearchTerm("")}
              >
                Reset Search
              </button>
            )}
          </div>
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="fee-category-all-loading">
            Loading Fee Categories...
          </div>
        )}

        {/* ERROR STATE */}
        {error && <div className="fee-category-all-error">{error}</div>}

        {/* EMPTY STATE (NO DATA IN DB) */}
        {!loading && !error && categories.length === 0 && (
          <div className="fee-category-all-empty">No Fee Categories found.</div>
        )}

        {/* NO SEARCH RESULTS STATE */}
        {!loading &&
          !error &&
          categories.length > 0 &&
          filteredCategories.length === 0 && (
            <div className="fee-category-all-empty">
              <p>
                No fee categories found matching <strong>"{searchTerm}"</strong>
                .
              </p>
              <button
                type="button"
                className="fee-category-clear-all-btn"
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </button>
            </div>
          )}

        {/* TABLE */}
        {!loading && !error && filteredCategories.length > 0 && (
          <div className="fee-category-all-table-wrapper">
            <table className="fee-category-all-table">
              <thead>
                <tr>
                  <th>S.No.</th>
                  <th>Category Name</th>
                  <th>Description</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category, index) => {
                  const isActive = category.isActive ?? category.IsActive;
                  return (
                    <tr key={category.id ?? category.Id ?? index}>
                      <td>{index + 1}</td>

                      <td>
                        <strong>
                          {category.categoryName ||
                            category.CategoryName ||
                            "-"}
                        </strong>
                      </td>

                      <td>
                        {category.description || category.Description || "-"}
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
        )}
      </div>
    </div>
  );
};

export default GetAllFeeCategory;
