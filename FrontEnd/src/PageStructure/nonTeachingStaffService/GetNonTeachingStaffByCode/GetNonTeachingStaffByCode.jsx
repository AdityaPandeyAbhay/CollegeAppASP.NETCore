// src/PageStructure/nonTeachingStaffService/GetNonTeachingStaffByCode/GetNonTeachingStaffByCode.jsx

import { useState } from "react";
import { getNonTeachingStaffByCode } from "../../../Services/nonTeachingStaffService";
import { openPhotoInNewTab, openPdfInNewTab } from "../../../Utils/fileHelper";
import "./GetNonTeachingStaffByCode.css";

const GetNonTeachingStaffByCode = () => {
  const [code, setCode] = useState("");
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setStaff(null);

    if (!code.trim()) {
      setError("Please enter Staff Code.");
      return;
    }

    try {
      setLoading(true);
      const data = await getNonTeachingStaffByCode(code.trim());
      setStaff(data?.data || data);
    } catch (err) {
      setError(err.message || "Staff not found.");
    } finally {
      setLoading(false);
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

  const staffFullName = staff ? getFullName(staff) : "";
  const photoUrl = staff ? getPhoto(staff) : null;
  const pdfUrl = staff ? getPdf(staff) : null;
  const fatherName = staff ? getFatherName(staff) : "-";
  const motherName = staff ? getMotherName(staff) : "-";
  const roleName = staff ? getRoleName(staff) : "Staff";
  const staffCode = staff?.staffCode || staff?.StaffCode || code;

  return (
    <div className="nts-code-page">
      <div className="nts-code-container">
        <h2>Get Non Teaching Staff By Code</h2>

        <form className="nts-code-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter Staff Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />

          <button type="submit">{loading ? "Searching..." : "Search"}</button>
        </form>

        {error && <div className="nts-code-error">{error}</div>}

        {staff && (
          <div className="nts-code-card">
            <h3>{staffFullName}</h3>

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

            <div className="nts-code-grid">
              <div>
                <strong>Role</strong>
                <span>
                  <span className="nts-role-badge">{roleName}</span>
                </span>
              </div>

              <div>
                <strong>Staff Code</strong>
                <span>{staffCode}</span>
              </div>

              <div>
                <strong>Father's Name</strong>
                <span>{fatherName}</span>
              </div>

              <div>
                <strong>Mother's Name</strong>
                <span>{motherName}</span>
              </div>

              <div>
                <strong>Education Document</strong>
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
                <strong>User ID</strong>
                <span>{staff.userId || staff.UserId || "-"}</span>
              </div>

              <div>
                <strong>Date of Birth</strong>
                <span>
                  {staff.dateOfBirth || staff.DateOfBirth
                    ? new Date(
                        staff.dateOfBirth || staff.DateOfBirth,
                      ).toLocaleDateString("en-IN")
                    : "-"}
                </span>
              </div>

              <div>
                <strong>Gender</strong>
                <span>{staff.gender || staff.Gender || "-"}</span>
              </div>

              <div>
                <strong>Email</strong>
                <span>{staff.email || staff.Email || "-"}</span>
              </div>

              <div>
                <strong>Phone</strong>
                <span>{staff.phoneNumber || staff.PhoneNumber || "-"}</span>
              </div>

              <div>
                <strong>Alternate Phone</strong>
                <span>
                  {staff.alternatePhoneNumber ||
                    staff.AlternatePhoneNumber ||
                    "-"}
                </span>
              </div>

              <div>
                <strong>Designation</strong>
                <span>{staff.designation || staff.Designation || "-"}</span>
              </div>

              <div>
                <strong>Qualification</strong>
                <span>{staff.qualification || staff.Qualification || "-"}</span>
              </div>

              <div>
                <strong>Salary</strong>
                <span>₹ {staff.salary ?? staff.Salary ?? 0}</span>
              </div>

              <div>
                <strong>Joining Date</strong>
                <span>
                  {staff.joiningDate || staff.JoiningDate
                    ? new Date(
                        staff.joiningDate || staff.JoiningDate,
                      ).toLocaleDateString("en-IN")
                    : "N/A"}
                </span>
              </div>

              <div>
                <strong>Status</strong>
                <span>
                  <span
                    className={
                      (
                        staff.isActive !== undefined
                          ? staff.isActive
                          : staff.IsActive !== undefined
                            ? staff.IsActive
                            : true
                      )
                        ? "all-nts-active"
                        : "all-nts-inactive"
                    }
                  >
                    {(
                      staff.isActive !== undefined
                        ? staff.isActive
                        : staff.IsActive !== undefined
                          ? staff.IsActive
                          : true
                    )
                      ? "Active"
                      : "Inactive"}
                  </span>
                </span>
              </div>

              <div className="nts-code-address">
                <strong>Address</strong>
                <span>{staff.address || staff.Address || "-"}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetNonTeachingStaffByCode;
