// =====================================================
// UPDATE FEE CATEGORY
// =====================================================

import { useState, useEffect } from "react";

import {
  getFeeCategoryById,
  getAllFeeCategories,
  getFeeCategoryDropdown,
  updateFeeCategory,
} from "../../Services/feeCategoryService";

import "./UpdateFeeCategory.css";

const UpdateFeeCategory = () => {
  const [id, setId] = useState("");
  const [categoryOptions, setCategoryOptions] = useState([]);
  const [loadingDropdown, setLoadingDropdown] = useState(false);

  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    isActive: true,
  });

  const [categoryLoaded, setCategoryLoaded] = useState(false);

  const [searching, setSearching] = useState(false);
  const [updating, setUpdating] = useState(false);

  const [message, setMessage] = useState("");
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
  // LOAD CATEGORY DETAILS
  // =====================================================

  const loadCategoryDetails = async (selectedId) => {
    setError("");
    setMessage("");
    setCategoryLoaded(false);

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
      setSearching(true);

      const category = await getFeeCategoryById(numericId);

      if (!category) {
        setError("Fee Category not found.");
        return;
      }

      setFormData({
        categoryName: category.categoryName || category.CategoryName || "",
        description: category.description || category.Description || "",
        isActive: Boolean(category.isActive ?? category.IsActive ?? true),
        createdBy: category.createdBy || category.CreatedBy || null,
        createdDate: category.createdDate || category.CreatedDate || null,
      });

      setCategoryLoaded(true);
    } catch (err) {
      setError(err.message || "Fee Category not found.");
    } finally {
      setSearching(false);
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
      setCategoryLoaded(false);
      setFormData({
        categoryName: "",
        description: "",
        isActive: true,
      });
      return;
    }

    loadCategoryDetails(selected);
  };

  const handleSearch = () => {
    loadCategoryDetails(id);
  };

  // =====================================================
  // HANDLE FORM INPUT CHANGES
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleIsActive = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  // =====================================================
  // UPDATE
  // =====================================================

  const handleUpdate = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!id) {
      setError("Please select a Fee Category first.");
      return;
    }

    if (!formData.categoryName.trim()) {
      setError("Category Name is required.");
      return;
    }

    if (formData.categoryName.trim().length > 100) {
      setError("Category Name cannot exceed 100 characters.");
      return;
    }

    if (formData.description.length > 500) {
      setError("Description cannot exceed 500 characters.");
      return;
    }

    const numericId = Number(id);

    try {
      setUpdating(true);

      // Important: include id and Id in payload to prevent EF Core primary key modification error
      const payload = {
        id: numericId,
        Id: numericId,
        categoryName: formData.categoryName.trim(),
        description: formData.description.trim() || null,
        isActive: formData.isActive,
        createdBy: formData.createdBy || null,
        CreatedBy: formData.createdBy || null,
        createdDate: formData.createdDate || null,
        CreatedDate: formData.createdDate || null,
      };

      await updateFeeCategory(numericId, payload);

      setMessage("Fee Category updated successfully.");

      // Refresh category list dropdown
      await loadCategoryOptions();
    } catch (err) {
      setError(err.message || "Failed to update Fee Category.");
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // CLEAR
  // =====================================================

  const handleClear = () => {
    setId("");

    setFormData({
      categoryName: "",
      description: "",
      isActive: true,
      createdBy: null,
      createdDate: null,
    });

    setCategoryLoaded(false);
    setMessage("");
    setError("");
  };

  return (
    <div className="fee-category-update-container">
      <div className="fee-category-update-card">
        <div className="fee-category-update-header">
          <h2>Update Fee Category</h2>
          <p>Select category from dropdown to update its details</p>
        </div>

        {message && (
          <div className="fee-category-update-success">{message}</div>
        )}

        {error && <div className="fee-category-update-error">{error}</div>}

        <div className="fee-category-update-search">
          <div className="fee-category-update-input-group">
            <label htmlFor="fee-category-select">Category Name</label>

            <select
              id="fee-category-select"
              value={id}
              onChange={handleCategorySelect}
              disabled={loadingDropdown || searching || updating}
              className="fee-category-update-select"
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
            type="button"
            onClick={handleSearch}
            disabled={searching || !id}
            className="fee-category-update-search-btn"
          >
            {searching ? "Searching..." : "Search"}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="fee-category-update-clear"
          >
            Clear
          </button>
        </div>

        {categoryLoaded && (
          <form onSubmit={handleUpdate}>
            <div className="fee-category-update-form">
              <div className="fee-category-update-form-group">
                <label>
                  Category Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="categoryName"
                  value={formData.categoryName}
                  onChange={handleChange}
                  maxLength={100}
                  placeholder="Enter category name"
                />
              </div>

              <div className="fee-category-update-form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  maxLength={500}
                  rows="4"
                  placeholder="Enter description"
                />
              </div>

              <div className="fee-category-update-form-group">
                <label>Is Active</label>

                <div
                  className="fee-category-checkbox-wrapper"
                  onClick={toggleIsActive}
                  role="checkbox"
                  aria-checked={formData.isActive}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      toggleIsActive();
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    id="fee-category-update-is-active"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={() => {}}
                    style={{ display: "none" }}
                  />

                  <div
                    className={`fee-category-custom-checkbox ${
                      formData.isActive ? "active" : "inactive"
                    }`}
                  >
                    {formData.isActive ? (
                      <span className="fee-category-green-tick">✓</span>
                    ) : null}
                  </div>

                  <span
                    className={`fee-category-status-text ${
                      formData.isActive ? "active" : "inactive"
                    }`}
                  >
                    {formData.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>

            <div className="fee-category-update-buttons">
              <button
                type="submit"
                disabled={updating}
                className="fee-category-update-submit"
              >
                {updating ? "Updating..." : "Update Fee Category"}
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="fee-category-update-clear"
              >
                Clear
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateFeeCategory;
