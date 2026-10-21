// src/PageStructure/nonTeachingStaffService/GetAllNonTeachingStaff/GetAllNonTeachingStaff.jsx

import { useEffect, useState } from "react";
import {
  getAllNonTeachingStaff,
  isStaffSoftDeleted,
} from "../../../Services/nonTeachingStaffService";
import { openPhotoInNewTab, openPdfInNewTab } from "../../../Utils/fileHelper";
import "./GetAllNonTeachingStaff.css";

const GetAllNonTeachingStaff = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getAllNonTeachingStaff();
      setStaff(Array.isArray(response) ? response : response?.data || []);
    } catch (err) {
      setError(err.message || "Failed to load Non Teaching Staff");
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

  const filteredStaff = staff.filter((item) => {
    if (isStaffSoftDeleted(item)) return false;

    const searchValue = search.toLowerCase().trim();
    if (!searchValue) {
      return true;
    }

    const fullName = getFullName(item).toLowerCase();
    const role = getRoleName(item).toLowerCase();
    const staffCode = (item.staffCode || item.StaffCode || "").toLowerCase();
    const father = getFatherName(item).toLowerCase();
    const mother = getMotherName(item).toLowerCase();
    const email = (item.email || item.Email || "").toLowerCase();
    const phone = (item.phoneNumber || item.PhoneNumber || "").toLowerCase();
    const desig = (item.designation || item.Designation || "").toLowerCase();
    const qual = (item.qualification || item.Qualification || "").toLowerCase();

    return (
      staffCode.includes(searchValue) ||
      fullName.includes(searchValue) ||
      role.includes(searchValue) ||
      (father !== "-" && father.includes(searchValue)) ||
      (mother !== "-" && mother.includes(searchValue)) ||
      email.includes(searchValue) ||
      phone.includes(searchValue) ||
      desig.includes(searchValue) ||
      qual.includes(searchValue)
    );
  });

  return (
    <div className="all-nts-page">
      <div className="all-nts-header">
        <div>
          <h1>All Non Teaching Staff</h1>
          <p>View all Non Teaching Staff</p>
        </div>

        <input
          className="all-nts-search"
          type="text"
          placeholder="Search staff by name, code, role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="all-nts-error">{error}</div>}

      <div className="all-nts-card">
        {loading ? (
          <div className="all-nts-loading">Loading Non Teaching Staff...</div>
        ) : filteredStaff.length === 0 ? (
          <div className="all-nts-empty">No Non Teaching Staff found.</div>
        ) : (
          <div className="all-nts-table-container">
            <table className="all-nts-table">
              <thead>
                <tr>
                  <th>Photo</th>
                  <th>Staff Code</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Father Name</th>
                  <th>Mother Name</th>
                  <th>Education Doc</th>
                  <th>DOB</th>
                  <th>Gender</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Alternate Phone</th>
                  <th>Designation</th>
                  <th>Qualification</th>
                  <th>Salary</th>
                  <th>Joining Date</th>
                  <th>Address</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredStaff.map((item) => {
                  const staffFullName = getFullName(item) || "Staff";
                  const photoUrl = getPhoto(item);
                  const pdfUrl = getPdf(item);
                  const fatherName = getFatherName(item);
                  const motherName = getMotherName(item);
                  const roleName = getRoleName(item);
                  const staffCode = item.staffCode || item.StaffCode || "N/A";
                  const dob = item.dateOfBirth || item.DateOfBirth;
                  const joiningDate = item.joiningDate || item.JoiningDate;
                  const isActive =
                    item.isActive !== undefined
                      ? item.isActive
                      : item.IsActive !== undefined
                        ? item.IsActive
                        : true;

                  return (
                    <tr key={item.id || item.Id || staffCode}>
                      <td>
                        {photoUrl ? (
                          <img
                            src={photoUrl}
                            alt={staffFullName}
                            className="nts-avatar-thumb"
                            onClick={() =>
                              openPhotoInNewTab(photoUrl, staffFullName)
                            }
                            title="Click to view full photo"
                          />
                        ) : (
                          <div
                            className="nts-avatar-placeholder"
                            title="No photo uploaded"
                          >
                            👤
                          </div>
                        )}
                      </td>

                      <td>
                        <strong>{staffCode}</strong>
                      </td>

                      <td>{staffFullName}</td>

                      <td>
                        <span className="nts-role-badge">{roleName}</span>
                      </td>

                      <td>{fatherName}</td>

                      <td>{motherName}</td>

                      <td>
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
                            title="View Education PDF"
                          >
                            📄 View PDF
                          </button>
                        ) : (
                          <span style={{ color: "#94a3b8" }}>-</span>
                        )}
                      </td>

                      <td>
                        {dob ? new Date(dob).toLocaleDateString("en-IN") : "-"}
                      </td>

                      <td>{item.gender || item.Gender || "N/A"}</td>

                      <td>{item.email || item.Email || "N/A"}</td>

                      <td>{item.phoneNumber || item.PhoneNumber || "N/A"}</td>

                      <td>
                        {item.alternatePhoneNumber ||
                          item.AlternatePhoneNumber ||
                          "-"}
                      </td>

                      <td>{item.designation || item.Designation || "N/A"}</td>

                      <td>
                        {item.qualification || item.Qualification || "N/A"}
                      </td>

                      <td>₹ {item.salary ?? item.Salary ?? 0}</td>

                      <td>
                        {joiningDate
                          ? new Date(joiningDate).toLocaleDateString("en-IN")
                          : "N/A"}
                      </td>

                      <td
                        style={{
                          maxWidth: "180px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                        title={item.address || item.Address || ""}
                      >
                        {item.address || item.Address || "-"}
                      </td>

                      <td>
                        <span
                          className={
                            isActive ? "all-nts-active" : "all-nts-inactive"
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

export default GetAllNonTeachingStaff;
