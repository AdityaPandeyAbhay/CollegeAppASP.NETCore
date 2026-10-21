// src/PageStructure/nonTeachingStaffService/GetNonTeachingStaffByName/GetNonTeachingStaffByName.jsx

import { useState } from "react";
import { getNonTeachingStaffByName } from "../../../Services/nonTeachingStaffService";
import { openPhotoInNewTab, openPdfInNewTab } from "../../../Utils/fileHelper";
import "./GetNonTeachingStaffByName.css";

const GetNonTeachingStaffByName = () => {
  const [name, setName] = useState("");
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setStaff([]);

    if (!name.trim()) {
      setError("Please enter Staff Name.");
      return;
    }

    try {
      setLoading(true);
      const data = await getNonTeachingStaffByName(name.trim());
      const result = Array.isArray(data)
        ? data
        : data?.data
          ? Array.isArray(data.data)
            ? data.data
            : [data.data]
          : [data];

      setStaff(result.filter(Boolean));
    } catch (err) {
      setError(err.message || "Failed to find Non Teaching Staff.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "N/A";
    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  return (
    <div className="nts-name-page">
      <div className="nts-name-container">
        <h2>Get Non Teaching Staff By Name</h2>

        <form className="nts-name-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Enter Staff Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <button type="submit">{loading ? "Searching..." : "Search"}</button>
        </form>

        {error && <div className="nts-name-error">{error}</div>}

        {loading && (
          <div className="nts-name-loading">
            Searching Non Teaching Staff...
          </div>
        )}

        {!loading && !error && staff.length === 0 && name.trim() !== "" && (
          <div className="nts-name-empty">No Non Teaching Staff found.</div>
        )}

        {!loading && staff.length > 0 && (
          <div className="nts-name-results">
            {staff.map((item, index) => {
              const staffFullName = getFullName(item) || "N/A";
              const photoUrl = getPhoto(item);
              const pdfUrl = getPdf(item);
              const fatherName = getFatherName(item);
              const motherName = getMotherName(item);
              const roleName = getRoleName(item);
              const staffCode = item.staffCode || item.StaffCode || "N/A";
              const isActive =
                item.isActive !== undefined
                  ? item.isActive
                  : item.IsActive !== undefined
                    ? item.IsActive
                    : true;

              return (
                <div
                  className="nts-name-card"
                  key={item.id || item.Id || staffCode || index}
                >
                  <h3>{staffFullName}</h3>

                  <div className="nts-photo-card-banner">
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={staffFullName}
                        className="nts-detail-photo"
                        onClick={() =>
                          openPhotoInNewTab(photoUrl, staffFullName)
                        }
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

                  <div className="nts-name-grid">
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
                      <span>{item.userId || item.UserId || "N/A"}</span>
                    </div>

                    <div>
                      <strong>Date of Birth</strong>
                      <span>
                        {formatDate(item.dateOfBirth || item.DateOfBirth)}
                      </span>
                    </div>

                    <div>
                      <strong>Gender</strong>
                      <span>{item.gender || item.Gender || "N/A"}</span>
                    </div>

                    <div>
                      <strong>Email</strong>
                      <span>{item.email || item.Email || "N/A"}</span>
                    </div>

                    <div>
                      <strong>Phone</strong>
                      <span>
                        {item.phoneNumber || item.PhoneNumber || "N/A"}
                      </span>
                    </div>

                    <div>
                      <strong>Alternate Phone</strong>
                      <span>
                        {item.alternatePhoneNumber ||
                          item.AlternatePhoneNumber ||
                          "-"}
                      </span>
                    </div>

                    <div>
                      <strong>Designation</strong>
                      <span>
                        {item.designation || item.Designation || "N/A"}
                      </span>
                    </div>

                    <div>
                      <strong>Qualification</strong>
                      <span>
                        {item.qualification || item.Qualification || "N/A"}
                      </span>
                    </div>

                    <div>
                      <strong>Salary</strong>
                      <span>₹ {item.salary ?? item.Salary ?? 0}</span>
                    </div>

                    <div>
                      <strong>Joining Date</strong>
                      <span>
                        {formatDate(item.joiningDate || item.JoiningDate)}
                      </span>
                    </div>

                    <div>
                      <strong>Status</strong>
                      <span>
                        <span
                          className={
                            isActive ? "all-nts-active" : "all-nts-inactive"
                          }
                        >
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </span>
                    </div>

                    <div className="nts-name-address">
                      <strong>Address</strong>
                      <span>{item.address || item.Address || "-"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default GetNonTeachingStaffByName;
