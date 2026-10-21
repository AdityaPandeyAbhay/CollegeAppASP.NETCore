// src/PageStructure/nonTeachingStaffService/GetNonTeachingStaffDropdown/GetNonTeachingStaffDropdown.jsx

import { useEffect, useState } from "react";
import {
  getNonTeachingStaffDropdown,
  getNonTeachingStaffByCode,
} from "../../../Services/nonTeachingStaffService";
import { openPhotoInNewTab, openPdfInNewTab } from "../../../Utils/fileHelper";
import "./GetNonTeachingStaffDropdown.css";

const GetNonTeachingStaffDropdown = () => {
  const [staffList, setStaffList] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDropdown = async () => {
      try {
        const data = await getNonTeachingStaffDropdown();
        const result = Array.isArray(data) ? data : data?.data || [];
        setStaffList(result);
      } catch (err) {
        setError(err.message || "Failed to load staff.");
      } finally {
        setLoading(false);
      }
    };

    loadDropdown();
  }, []);

  const handleChange = async (e) => {
    const code = e.target.value;
    setSelectedId(code);
    setSelectedStaff(null);

    if (!code) {
      return;
    }

    try {
      setDetailsLoading(true);
      setError("");
      const data = await getNonTeachingStaffByCode(code);
      setSelectedStaff(data?.data || data);
    } catch (err) {
      setError(err.message || "Failed to load staff details.");
    } finally {
      setDetailsLoading(false);
    }
  };

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

  const staffFullName = selectedStaff ? getFullName(selectedStaff) : "";
  const photoUrl = selectedStaff ? getPhoto(selectedStaff) : null;
  const pdfUrl = selectedStaff ? getPdf(selectedStaff) : null;
  const fatherName = selectedStaff ? getFatherName(selectedStaff) : "-";
  const motherName = selectedStaff ? getMotherName(selectedStaff) : "-";
  const roleName = selectedStaff ? getRoleName(selectedStaff) : "Staff";
  const staffCode =
    selectedStaff?.staffCode || selectedStaff?.StaffCode || selectedId;
  const isActive =
    selectedStaff?.isActive !== undefined
      ? selectedStaff.isActive
      : selectedStaff?.IsActive !== undefined
        ? selectedStaff.IsActive
        : true;

  return (
    <div className="nts-dropdown-page">
      <div className="nts-dropdown-container">
        <h2>Non Teaching Staff Dropdown</h2>

        {loading ? (
          <p>Loading staff...</p>
        ) : (
          <div className="nts-dropdown-group">
            <label>Select Staff</label>

            <select value={selectedId} onChange={handleChange}>
              <option value="">-- Select Staff --</option>

              {staffList.map((item) => {
                const code = item.code || item.staffCode || item.id;
                return (
                  <option key={code} value={code}>
                    {item.text || item.name || item.staffCode || item.code}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {error && <div className="nts-dropdown-error">{error}</div>}

        {detailsLoading && (
          <p className="nts-dropdown-loading">Loading staff details...</p>
        )}

        {selectedStaff && (
          <div className="nts-dropdown-card">
            <h3>{staffFullName || selectedStaff.firstName}</h3>

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

            <div className="nts-dropdown-details">
              <div>
                <strong>Role:</strong>
                <span>
                  <span className="nts-role-badge">{roleName}</span>
                </span>
              </div>

              <div>
                <strong>Staff Code:</strong>
                <span>{staffCode}</span>
              </div>

              <div>
                <strong>Father's Name:</strong>
                <span>{fatherName}</span>
              </div>

              <div>
                <strong>Mother's Name:</strong>
                <span>{motherName}</span>
              </div>

              <div>
                <strong>Education Document:</strong>
                <span>
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
                      📄 View Education PDF ↗
                    </button>
                  ) : (
                    "-"
                  )}
                </span>
              </div>

              <div>
                <strong>User ID:</strong>
                <span>
                  {selectedStaff.userId || selectedStaff.UserId || "-"}
                </span>
              </div>

              <div>
                <strong>Date of Birth:</strong>
                <span>
                  {selectedStaff.dateOfBirth || selectedStaff.DateOfBirth
                    ? new Date(
                        selectedStaff.dateOfBirth || selectedStaff.DateOfBirth,
                      ).toLocaleDateString("en-IN")
                    : "-"}
                </span>
              </div>

              <div>
                <strong>Gender:</strong>
                <span>
                  {selectedStaff.gender || selectedStaff.Gender || "-"}
                </span>
              </div>

              <div>
                <strong>Email:</strong>
                <span>{selectedStaff.email || selectedStaff.Email || "-"}</span>
              </div>

              <div>
                <strong>Phone:</strong>
                <span>
                  {selectedStaff.phoneNumber ||
                    selectedStaff.PhoneNumber ||
                    "-"}
                </span>
              </div>

              <div>
                <strong>Alternate Phone:</strong>
                <span>
                  {selectedStaff.alternatePhoneNumber ||
                    selectedStaff.AlternatePhoneNumber ||
                    "-"}
                </span>
              </div>

              <div>
                <strong>Designation:</strong>
                <span>
                  {selectedStaff.designation ||
                    selectedStaff.Designation ||
                    "-"}
                </span>
              </div>

              <div>
                <strong>Qualification:</strong>
                <span>
                  {selectedStaff.qualification ||
                    selectedStaff.Qualification ||
                    "-"}
                </span>
              </div>

              <div>
                <strong>Salary:</strong>
                <span>
                  ₹ {selectedStaff.salary ?? selectedStaff.Salary ?? 0}
                </span>
              </div>

              <div>
                <strong>Joining Date:</strong>
                <span>
                  {selectedStaff.joiningDate || selectedStaff.JoiningDate
                    ? new Date(
                        selectedStaff.joiningDate || selectedStaff.JoiningDate,
                      ).toLocaleDateString("en-IN")
                    : "-"}
                </span>
              </div>

              <div>
                <strong>Status</strong>
                <span>
                  <span
                    className={isActive ? "all-nts-active" : "all-nts-inactive"}
                  >
                    {isActive ? "Active" : "Inactive"}
                  </span>
                </span>
              </div>

              <div style={{ gridColumn: "1 / -1" }}>
                <strong>Address:</strong>
                <span>
                  {selectedStaff.address || selectedStaff.Address || "-"}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetNonTeachingStaffDropdown;
