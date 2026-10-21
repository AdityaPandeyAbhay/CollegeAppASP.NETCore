// src/PageStructure/nonTeachingStaffService/DeleteNonTeachingStaff/DeleteNonTeachingStaff.jsx

import { useEffect, useState } from "react";
import {
  getNonTeachingStaffByCode,
  getNonTeachingStaffDropdown,
  deleteNonTeachingStaff,
} from "../../../Services/nonTeachingStaffService";
import { openPhotoInNewTab, openPdfInNewTab } from "../../../Utils/fileHelper";
import "./DeleteNonTeachingStaff.css";

const DeleteNonTeachingStaff = () => {
  // =====================================================
  // SEARCH
  // =====================================================
  const [searchCode, setSearchCode] = useState("");
  const [staffDropdown, setStaffDropdown] = useState([]);
  const [selectedCode, setSelectedCode] = useState("");
  const [loadingDropdown, setLoadingDropdown] = useState(true);

  // =====================================================
  // STAFF STATE
  // =====================================================
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // =====================================================
  // LOAD DROPDOWN
  // =====================================================
  useEffect(() => {
    loadStaffDropdown();
  }, []);

  const loadStaffDropdown = async () => {
    try {
      setLoadingDropdown(true);
      setError("");
      const response = await getNonTeachingStaffDropdown();
      const result = Array.isArray(response) ? response : response?.data || [];
      setStaffDropdown(result);
    } catch (err) {
      console.error("STAFF DROPDOWN ERROR:", err);
      setError(err.message || "Failed to load staff dropdown.");
    } finally {
      setLoadingDropdown(false);
    }
  };

  // =====================================================
  // SEARCH STAFF BY CODE
  // =====================================================
  const searchStaffByCode = async (code) => {
    const cleanCode = code?.trim();

    if (!cleanCode) {
      setError("Please enter Staff Code.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setMessage("");
      setStaff(null);
      setShowConfirm(false);

      const response = await getNonTeachingStaffByCode(cleanCode);
      console.log("GET STAFF RESPONSE:", response);
      const staffData = response?.data || response;

      if (!staffData) {
        setError("Staff not found.");
        return;
      }

      setStaff(staffData);
      setSearchCode(staffData.staffCode || staffData.StaffCode || cleanCode);
      setSelectedCode(staffData.staffCode || staffData.StaffCode || cleanCode);
    } catch (err) {
      console.error("GET STAFF ERROR:", err);
      setError(err.message || "Staff not found.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchByCode = async (e) => {
    e.preventDefault();
    await searchStaffByCode(searchCode);
  };

  const handleStaffDropdownChange = async (e) => {
    const value = e.target.value;
    setError("");
    setMessage("");
    setStaff(null);
    setShowConfirm(false);

    if (!value) {
      setSelectedCode("");
      setSearchCode("");
      return;
    }

    const selectedItem = staffDropdown.find((item) => {
      const itemCode = item.code ?? item.staffCode ?? item.id;
      return String(itemCode) === String(value);
    });

    const staffCode = selectedItem?.code ?? selectedItem?.staffCode ?? value;
    setSelectedCode(staffCode);
    setSearchCode(staffCode);
    await searchStaffByCode(staffCode);
  };

  // =====================================================
  // DELETE
  // =====================================================
  const handleDelete = async () => {
    if (!staff) return;

    const staffCode = staff.staffCode || staff.StaffCode || searchCode;
    if (!staffCode) {
      setError("Staff code is required for deletion.");
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setMessage("");

      await deleteNonTeachingStaff(staffCode, staff);
      const staffName = [
        staff.firstName || staff.FirstName,
        staff.lastName || staff.LastName,
      ]
        .filter(Boolean)
        .join(" ");

      setMessage(
        `Non Teaching Staff "${staffName || staffCode}" deleted successfully (Soft Deleted).`,
      );

      setStaff(null);
      setSearchCode("");
      setSelectedCode("");
      setShowConfirm(false);

      await loadStaffDropdown();
    } catch (err) {
      console.error("DELETE STAFF ERROR:", err);
      setError(err.message || "Failed to delete staff.");
    } finally {
      setDeleting(false);
    }
  };

  const handleClear = () => {
    setSearchCode("");
    setSelectedCode("");
    setStaff(null);
    setError("");
    setMessage("");
    setShowConfirm(false);
  };

  // =====================================================
  // HELPERS
  // =====================================================
  const getFullName = (item) => {
    if (!item) return "";
    return [
      item.firstName || item.FirstName,
      item.middleName || item.MiddleName,
      item.lastName || item.LastName,
    ]
      .filter(Boolean)
      .join(" ")
      .trim();
  };

  const getPhoto = (item) => {
    const p = item?.photo || item?.Photo;
    if (!p || typeof p !== "string") return null;
    const clean = p.trim();
    if (
      clean.toLowerCase() === "string" ||
      clean.toLowerCase() === "null" ||
      clean.toLowerCase() === "undefined" ||
      clean.length < 15
    ) {
      return null;
    }
    return clean;
  };

  const getPdf = (item) => {
    const doc = item?.educationPdf || item?.EducationPdf;
    if (!doc || typeof doc !== "string") return null;
    const clean = doc.trim();
    if (
      clean.toLowerCase() === "string" ||
      clean.toLowerCase() === "null" ||
      clean.toLowerCase() === "undefined" ||
      clean.length < 15
    ) {
      return null;
    }
    return clean;
  };

  const getFatherName = (item) => {
    const val = item?.fatherName || item?.FatherName;
    if (!val || typeof val !== "string") return "-";
    const clean = val.trim();
    if (
      !clean ||
      clean.toLowerCase() === "string" ||
      clean.toLowerCase() === "null" ||
      clean.toLowerCase() === "undefined"
    ) {
      return "-";
    }
    return clean;
  };

  const getMotherName = (item) => {
    const val = item?.motherName || item?.MotherName;
    if (!val || typeof val !== "string") return "-";
    const clean = val.trim();
    if (
      !clean ||
      clean.toLowerCase() === "string" ||
      clean.toLowerCase() === "null" ||
      clean.toLowerCase() === "undefined"
    ) {
      return "-";
    }
    return clean;
  };

  const getRoleName = (item) => {
    return (
      item?.roleName ||
      item?.RoleName ||
      item?.role ||
      item?.Role ||
      item?.userRole ||
      item?.UserRole ||
      "Staff"
    );
  };

  const staffFullName = staff ? getFullName(staff) : "";
  const photoUrl = staff ? getPhoto(staff) : null;
  const pdfUrl = staff ? getPdf(staff) : null;
  const fatherName = staff ? getFatherName(staff) : "-";
  const motherName = staff ? getMotherName(staff) : "-";
  const roleName = staff ? getRoleName(staff) : "Staff";
  const staffCode = staff?.staffCode || staff?.StaffCode || searchCode;
  const isActive =
    staff?.isActive !== undefined
      ? staff.isActive
      : staff?.IsActive !== undefined
        ? staff.IsActive
        : true;

  return (
    <div className="nts-delete-page">
      <div className="nts-delete-container">
        {/* =================================================
            HEADER
        ================================================= */}
        <div className="nts-delete-header">
          <h2>Delete Non Teaching Staff</h2>
          <p>Select staff from dropdown or enter Staff Code.</p>
        </div>

        {/* =================================================
            STAFF SELECTION
        ================================================= */}
        <div className="nts-delete-selection">
          {/* DROPDOWN */}
          <div className="nts-delete-selection-group">
            <label htmlFor="staffDropdown">Select Staff</label>
            <select
              id="staffDropdown"
              value={selectedCode}
              onChange={handleStaffDropdownChange}
              disabled={loadingDropdown || loading || deleting}
            >
              <option value="">
                {loadingDropdown ? "Loading Staff..." : "Select Staff"}
              </option>
              {staffDropdown.map((item) => {
                const itemCode = item.code ?? item.staffCode ?? item.id;
                const itemText =
                  item.text ?? item.name ?? item.staffCode ?? item.code;
                return (
                  <option key={itemCode} value={itemCode}>
                    {itemCode}
                    {" - "}
                    {itemText}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="nts-delete-or">OR</div>

          {/* MANUAL STAFF CODE */}
          <form
            className="nts-delete-code-search"
            onSubmit={handleSearchByCode}
          >
            <div className="nts-delete-selection-group">
              <label htmlFor="searchCode">Enter Staff Code</label>
              <input
                id="searchCode"
                type="text"
                placeholder="Enter Staff Code"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                disabled={loading || deleting}
              />
            </div>
            <button type="submit" disabled={loading || deleting}>
              {loading ? "Searching..." : "Find Staff"}
            </button>
          </form>

          {/* RESET */}
          <div className="nts-delete-selection-group nts-delete-clear-container">
            <label>Reset Search</label>
            <button
              type="button"
              className="nts-delete-clear-button"
              onClick={handleClear}
              disabled={loading || deleting}
            >
              Clear
            </button>
          </div>
        </div>

        {error && <div className="nts-delete-error">{error}</div>}
        {message && <div className="nts-delete-success">{message}</div>}

        {/* =================================================
            STAFF DETAILS CARD
        ================================================= */}
        {staff && (
          <div className="nts-delete-card">
            <div className="nts-delete-card-header">
              <div>
                <h3>{staffFullName}</h3>
                <span>Staff Code: {staffCode}</span>
              </div>
              <span
                className={
                  isActive
                    ? "nts-delete-status active"
                    : "nts-delete-status inactive"
                }
              >
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="nts-photo-card-banner">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={staffFullName}
                  className="nts-detail-photo"
                  onClick={() => openPhotoInNewTab(photoUrl, staffFullName)}
                  title="Click to view full photo"
                />
              ) : (
                <div
                  className="nts-detail-photo-placeholder"
                  title="No photo uploaded"
                >
                  👤
                </div>
              )}
              <div>
                <h4 style={{ margin: "0 0 4px 0", color: "#1e293b" }}>
                  {staffFullName}
                </h4>
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    alignItems: "center",
                    flexWrap: "wrap",
                    marginTop: "4px",
                  }}
                >
                  <span style={{ fontSize: "13px", color: "#64748b" }}>
                    Staff Code: {staffCode}
                  </span>
                  <span className="nts-role-badge">{roleName}</span>
                </div>
              </div>
            </div>

            <div className="nts-delete-details">
              <p>
                <strong>Role:</strong>{" "}
                <span className="nts-role-badge">{roleName}</span>
              </p>

              <p>
                <strong>ID:</strong> {staff.id || staff.Id}
              </p>

              <p>
                <strong>User ID:</strong> {staff.userId || staff.UserId || "-"}
              </p>

              <p>
                <strong>Father's Name:</strong> {fatherName}
              </p>

              <p>
                <strong>Mother's Name:</strong> {motherName}
              </p>

              <p>
                <strong>Education Doc:</strong>{" "}
                {pdfUrl ? (
                  <button
                    type="button"
                    className="nts-view-pdf-btn"
                    onClick={() =>
                      openPdfInNewTab(
                        pdfUrl,
                        `${staffFullName} Education Documents`,
                      )
                    }
                  >
                    📄 View PDF ↗
                  </button>
                ) : (
                  "-"
                )}
              </p>

              <p>
                <strong>Email:</strong> {staff.email || staff.Email || "-"}
              </p>

              <p>
                <strong>Phone:</strong>{" "}
                {staff.phoneNumber || staff.PhoneNumber || "-"}
              </p>

              <p>
                <strong>Alternate Phone:</strong>{" "}
                {staff.alternatePhoneNumber ||
                  staff.AlternatePhoneNumber ||
                  "-"}
              </p>

              <p>
                <strong>Designation:</strong>{" "}
                {staff.designation || staff.Designation || "-"}
              </p>

              <p>
                <strong>Qualification:</strong>{" "}
                {staff.qualification || staff.Qualification || "-"}
              </p>

              <p>
                <strong>Salary:</strong> ₹ {staff.salary ?? staff.Salary ?? 0}
              </p>

              <p>
                <strong>Joining Date:</strong>{" "}
                {staff.joiningDate || staff.JoiningDate
                  ? new Date(
                      staff.joiningDate || staff.JoiningDate,
                    ).toLocaleDateString("en-IN")
                  : "-"}
              </p>

              <p style={{ gridColumn: "1 / -1" }}>
                <strong>Address:</strong>{" "}
                {staff.address || staff.Address || "-"}
              </p>
            </div>

            <button
              className="nts-delete-button"
              onClick={() => setShowConfirm(true)}
              disabled={deleting}
            >
              Delete Staff
            </button>
          </div>
        )}

        {/* =================================================
            CONFIRM POPUP
        ================================================= */}
        {showConfirm && staff && (
          <div className="custom-delete-modal-overlay">
            <div className="custom-delete-modal-card">
              <div className="custom-delete-modal-header">
                <div className="custom-delete-warning-icon">⚠️</div>
                <h3>Confirm Staff Deletion</h3>
              </div>
              <div className="custom-delete-modal-body">
                <p className="custom-delete-confirm-text">
                  Are you sure you want to delete this non-teaching staff
                  record?
                </p>
                <div className="custom-delete-info-box">
                  <div className="custom-delete-info-row">
                    <span className="custom-delete-info-label">Name:</span>
                    <span className="custom-delete-info-value">
                      {staffFullName || "—"}
                    </span>
                  </div>
                  <div className="custom-delete-info-row">
                    <span className="custom-delete-info-label">Role:</span>
                    <span className="custom-delete-info-value">
                      <span className="nts-role-badge">{roleName}</span>
                    </span>
                  </div>
                  <div className="custom-delete-info-row">
                    <span className="custom-delete-info-label">
                      Staff Code:
                    </span>
                    <span className="custom-delete-info-value">
                      {staffCode || "—"}
                    </span>
                  </div>
                  <div className="custom-delete-info-row">
                    <span className="custom-delete-info-label">
                      Designation:
                    </span>
                    <span className="custom-delete-info-value">
                      {staff.designation || staff.Designation || "—"}
                    </span>
                  </div>
                  <div className="custom-delete-info-row">
                    <span className="custom-delete-info-label">Email:</span>
                    <span className="custom-delete-info-value">
                      {staff.email || staff.Email || "—"}
                    </span>
                  </div>
                  <div className="custom-delete-info-row">
                    <span className="custom-delete-info-label">Phone:</span>
                    <span className="custom-delete-info-value">
                      {staff.phoneNumber || staff.PhoneNumber || "—"}
                    </span>
                  </div>
                </div>
                <p className="custom-delete-note">
                  <strong>Note:</strong> This record will be soft deleted. It
                  will be preserved in the system but will no longer appear
                  anywhere in Get All staff, search results, or dropdowns.
                </p>
              </div>
              <div className="custom-delete-modal-footer">
                <button
                  type="button"
                  className="custom-delete-btn-cancel"
                  onClick={() => setShowConfirm(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="custom-delete-btn-danger"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Yes, Delete Staff"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteNonTeachingStaff;
