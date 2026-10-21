// =====================================================
// CREATE FEE CATEGORY
// =====================================================

import { useState } from "react";

import { createFeeCategory } from "../../Services/feeCategoryService";

import "./CreateFeeCategory.css";

const CreateFeeCategory = () => {
  const [formData, setFormData] = useState({
    categoryName: "",
    description: "",
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // HANDLE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const toggleIsActive = () => {
    setFormData((prev) => ({
      ...prev,
      isActive: !prev.isActive,
    }));
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

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

    try {
      setLoading(true);

      const payload = {
        categoryName: formData.categoryName.trim(),
        description: formData.description.trim() || null,
        isActive: formData.isActive,
      };

      await createFeeCategory(payload);

      setMessage("Fee Category created successfully.");

      setFormData({
        categoryName: "",
        description: "",
        isActive: true,
      });
    } catch (err) {
      setError(err.message || "Failed to create Fee Category.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setFormData({
      categoryName: "",
      description: "",
      isActive: true,
    });

    setMessage("");
    setError("");
  };

  return (
    <div className="fee-category-create-container">
      <div className="fee-category-create-card">
        <div className="fee-category-create-header">
          <h2>Create Fee Category</h2>
          <p>Add a new fee category</p>
        </div>

        {message && (
          <div className="fee-category-create-success">{message}</div>
        )}

        {error && <div className="fee-category-create-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="fee-category-create-form-group">
            <label>
              Category Name <span>*</span>
            </label>

            <input
              type="text"
              name="categoryName"
              value={formData.categoryName}
              onChange={handleChange}
              placeholder="Enter category name"
              maxLength={100}
            />
          </div>

          <div className="fee-category-create-form-group">
            <label>Description</label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter description"
              maxLength={500}
              rows="4"
            />
          </div>

          <div className="fee-category-create-form-group">
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
                id="fee-category-is-active"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
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

          <div className="fee-category-create-buttons">
            <button
              type="submit"
              disabled={loading}
              className="fee-category-create-submit"
            >
              {loading ? "Creating..." : "Create Fee Category"}
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="fee-category-create-reset"
            >
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateFeeCategory;
