// =====================================================
// GET FEE CATEGORY BY ID
// =====================================================

import { useState } from "react";

import { getFeeCategoryById } from "../../Services/feeCategoryService";

import "./GetFeeCategoryById.css";

const GetFeeCategoryById = () => {
  const [id, setId] = useState("");
  const [category, setCategory] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // SEARCH
  // =====================================================

  const handleSearch = async () => {
    setError("");
    setCategory(null);

    const numericId = Number(id);

    if (!id.trim()) {
      setError("Fee Category ID is required.");
      return;
    }

    if (!Number.isInteger(numericId) || numericId <= 0) {
      setError("Please enter a valid Fee Category ID.");
      return;
    }

    try {
      setLoading(true);

      const data = await getFeeCategoryById(numericId);

      setCategory(data);
    } catch (err) {
      setError(err.message || "Fee Category not found.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {
    setId("");
    setCategory(null);
    setError("");
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleString();
  };

  return (
    <div className="fee-category-id-container">
      <div className="fee-category-id-card">
        <div className="fee-category-id-header">
          <h2>Get Fee Category By ID</h2>
          <p>Search a fee category using its ID</p>
        </div>

        <div className="fee-category-id-search">
          <div className="fee-category-id-input-group">
            <label>Fee Category ID</label>

            <input
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter Fee Category ID"
              min="1"
            />
          </div>

          <div className="fee-category-id-buttons">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="fee-category-id-search-btn"
            >
              {loading ? "Searching..." : "Search"}
            </button>

            <button onClick={handleClear} className="fee-category-id-clear-btn">
              Clear
            </button>
          </div>
        </div>

        {error && <div className="fee-category-id-error">{error}</div>}

        {category && (
          <div className="fee-category-id-result">
            <h3>Fee Category Details</h3>

            <div className="fee-category-id-details">
              <div>
                <label>ID</label>
                <p>{category.id}</p>
              </div>

              <div>
                <label>Category Name</label>
                <p>{category.categoryName}</p>
              </div>

              <div>
                <label>Description</label>
                <p>{category.description || "-"}</p>
              </div>

              <div>
                <label>Status</label>
                <p>
                  <span
                    className={
                      (category.isActive ?? category.IsActive)
                        ? "fee-category-status-active"
                        : "fee-category-status-inactive"
                    }
                  >
                    {(category.isActive ?? category.IsActive)
                      ? "Active"
                      : "Inactive"}
                  </span>
                </p>
              </div>

              <div>
                <label>Created By</label>
                <p>{category.createdBy || "-"}</p>
              </div>

              <div>
                <label>Created Date</label>
                <p>{formatDate(category.createdDate)}</p>
              </div>

              <div>
                <label>Modified By</label>
                <p>{category.modifiedBy || "-"}</p>
              </div>

              <div>
                <label>Modified Date</label>
                <p>{formatDate(category.modifiedDate)}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetFeeCategoryById;
