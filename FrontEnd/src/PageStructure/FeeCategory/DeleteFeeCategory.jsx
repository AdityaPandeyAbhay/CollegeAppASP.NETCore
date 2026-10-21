// =====================================================
// DELETE FEE CATEGORY
// =====================================================

import { useState, useEffect } from "react";

import {
  getFeeCategoryById,
  getAllFeeCategories,
  getFeeCategoryDropdown,
  updateFeeCategory,
  deleteFeeCategory,
} from "../../Services/feeCategoryService";

import "./DeleteFeeCategory.css";

const DeleteFeeCategory = () => {
  const [id, setId] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingDropdown, setLoadingDropdown] = useState(false);

  const [category, setCategory] = useState(null);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
  // LOAD CATEGORY DETAILS
  // =====================================================

  const loadCategoryDetails = async (selectedId) => {
    setError("");
    setMessage("");
    setCategory(null);

    if (!selectedId) {
      setError("Please select a Fee Category.");
      return;
    }

    const numericId = Number(selectedId);

    if (!Number.isInteger(numericId) || numericId <= 0) {
      setError("Please select a valid Fee Category.");
      return;
    }

    try {
      setLoading(true);

      const data = await getFeeCategoryById(numericId);

      if (!data) {
        setError("Fee Category not found.");
        return;
      }

      setCategory(data);
    } catch (err) {
      setError(err.message || "Fee Category not found.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // SELECT CATEGORY FROM DROPDOWN
  // =====================================================

  const handleCategorySelect = (e) => {
    const selected = e.target.value;
    setId(selected);
    setError("");
    setMessage("");

    if (!selected) {
      setCategory(null);
      return;
    }

    loadCategoryDetails(selected);
  };

  const handleSearch = () => {
    loadCategoryDetails(id);
  };

  // =====================================================
  // DELETE (DEACTIVATE)
  // =====================================================

  const handleDelete = async () => {
    if (!category) {
      setError("Please select a Fee Category first.");
      return;
    }

    const categoryName =
      category.categoryName || category.CategoryName || "this category";

    const confirmed = window.confirm(
      `Are you sure you want to delete "${categoryName}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setMessage("");

      const categoryId = Number(category.id ?? category.Id);

      // Step 1: Attempt permanent delete first
      try {
        await deleteFeeCategory(categoryId);
        setMessage(`Fee Category "${categoryName}" was permanently deleted.`);
      } catch (deleteErr) {
        // Step 2: If permanent delete fails because it is referenced in another table, deactivate it!
        console.warn(
          "Permanent delete failed (record in use), deactivating instead:",
          deleteErr,
        );

        await updateFeeCategory(categoryId, {
          id: categoryId,
          Id: categoryId,
          categoryName: category.categoryName ?? category.CategoryName,
          description: (category.description ?? category.Description) || null,
          isActive: false,
          createdBy: category.createdBy ?? category.CreatedBy ?? null,
          CreatedBy: category.createdBy ?? category.CreatedBy ?? null,
          createdDate: category.createdDate ?? category.CreatedDate ?? null,
          CreatedDate: category.createdDate ?? category.CreatedDate ?? null,
        });

        setMessage(
          `Fee Category "${categoryName}" is used in other records and has been deactivated instead of permanently deleted.`,
        );
      }

      setCategory(null);
      setId("");

      // Reload dropdown
      await loadCategoryOptions();
    } catch (err) {
      setError(err.message || "Failed to delete or deactivate Fee Category.");
    } finally {
      setDeleting(false);
    }
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {
    setId("");
    setCategory(null);
    setError("");
    setMessage("");
  };

  return (
    <div className="fee-category-delete-container">
      <div className="fee-category-delete-card">
        <div className="fee-category-delete-header">
          <h2>Delete Fee Category</h2>
          <p>Select category from dropdown to deactivate</p>
        </div>

        {message && (
          <div className="fee-category-delete-success">{message}</div>
        )}

        {error && <div className="fee-category-delete-error">{error}</div>}

        <div className="fee-category-delete-search">
          <div className="fee-category-delete-input-group">
            <label htmlFor="fee-category-delete-select">Category Name</label>

            <select
              id="fee-category-delete-select"
              value={id}
              onChange={handleCategorySelect}
              disabled={loadingDropdown || loading || deleting}
              className="fee-category-delete-select"
            >
              <option value="">
                {loadingDropdown
                  ? "Loading categories..."
                  : categoryOptions.length === 0
                    ? "No categories available"
                    : "-- Select Category Name --"}
              </option>
              {categoryOptions.map((cat, index) => {
                const catId = cat.id ?? cat.Id ?? index;
                const catName =
                  cat.categoryName ??
                  cat.CategoryName ??
                  cat.text ??
                  cat.Text ??
                  cat.name;
                const isActive = Boolean(cat.isActive ?? cat.IsActive ?? true);
                if (!catName) return null;
                return (
                  <option key={`${catId}-${catName}`} value={catId}>
                    {catName}
                    {!isActive ? " (Inactive)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={handleSearch}
            disabled={loading || !id}
            className="fee-category-delete-search-btn"
          >
            {loading ? "Searching..." : "Search"}
          </button>

          <button
            onClick={handleClear}
            className="fee-category-delete-clear-btn"
          >
            Clear
          </button>
        </div>

        {category && (
          <div className="fee-category-delete-result">
            <h3>Fee Category Found</h3>

            <div className="fee-category-delete-details">
              <div>
                <label>ID</label>
                <p>{category.id ?? category.Id}</p>
              </div>

              <div>
                <label>Category Name</label>
                <p>
                  <strong>
                    {category.categoryName ?? category.CategoryName}
                  </strong>
                </p>
              </div>

              <div>
                <label>Description</label>
                <p>{category.description ?? category.Description ?? "-"}</p>
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
            </div>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="fee-category-delete-btn"
            >
              {deleting ? "Deactivating..." : "Delete Fee Category"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteFeeCategory;
