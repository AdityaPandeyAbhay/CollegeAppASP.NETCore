// =====================================================
// GET FEE STRUCTURE BY ID
// =====================================================

import { useState } from "react";

import { getFeeStructureById } from "../../Services/feeStructureService";

import "./GetFeeStructureById.css";

const GetFeeStructureById = () => {
  const [id, setId] = useState("");
  const [feeStructure, setFeeStructure] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();

    setError("");
    setFeeStructure(null);

    if (!id.trim()) {
      setError("Fee Structure ID is required.");
      return;
    }

    setLoading(true);

    try {
      const data = await getFeeStructureById(id);

      setFeeStructure(data);
    } catch (err) {
      setError(err.message || "Fee Structure not found.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "-";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return date;
    }

    return parsed.toLocaleDateString();
  };

  return (
    <div className="fee-structure-id-container">
      <div className="fee-structure-id-card">
        <h2>Get Fee Structure By ID</h2>

        <form className="fee-structure-id-search" onSubmit={handleSearch}>
          <div>
            <label>Fee Structure ID</label>

            <input
              type="number"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Enter ID"
              min="1"
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {error && <div className="fee-structure-error">{error}</div>}

        {feeStructure && (
          <div className="fee-structure-details">
            <h3>Fee Structure Details</h3>

            <div className="fee-structure-details-grid">
              <div>
                <strong>ID</strong>
                <span>{feeStructure.Id ?? feeStructure.id}</span>
              </div>

              <div>
                <strong>Academic Year</strong>
                <span>
                  {feeStructure.AcademicYearName ||
                    feeStructure.academicYearName ||
                    "-"}
                </span>
              </div>

              <div>
                <strong>Department</strong>
                <span>
                  {feeStructure.DepartmentName ||
                    feeStructure.departmentName ||
                    "-"}
                </span>
              </div>

              <div>
                <strong>Class</strong>
                <span>
                  {feeStructure.ClassName || feeStructure.className || "-"}
                </span>
              </div>

              <div>
                <strong>Fee Category</strong>
                <span>
                  {feeStructure.FeeCategoryName ||
                    feeStructure.feeCategoryName ||
                    "-"}
                </span>
              </div>

              <div>
                <strong>Amount</strong>
                <span>
                  ₹
                  {Number(
                    feeStructure.Amount ?? feeStructure.amount ?? 0,
                  ).toFixed(2)}
                </span>
              </div>

              <div>
                <strong>Due Date</strong>
                <span>
                  {formatDate(feeStructure.DueDate ?? feeStructure.dueDate)}
                </span>
              </div>

              <div>
                <strong>Status</strong>
                <span>
                  {(feeStructure.IsActive ?? feeStructure.isActive)
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              <div className="full-width">
                <strong>Description</strong>
                <span>
                  {feeStructure.Description || feeStructure.description || "-"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetFeeStructureById;
