// src/PageStructure/nonTeachingStaffService/UpdateNonTeachingStaff/UpdateNonTeachingStaff.jsx

import { useEffect, useState } from "react";
import {
  getNonTeachingStaffByCode,
  getNonTeachingStaffDropdown,
  updateNonTeachingStaff,
} from "../../../Services/nonTeachingStaffService";
import {
  compressImageFile,
  readPdfAsBase64,
  openPhotoInNewTab,
  openPdfInNewTab,
} from "../../../Utils/fileHelper";
import "./UpdateNonTeachingStaff.css";

const UpdateNonTeachingStaff = () => {
  // =====================================================
  // SEARCH STATE
  // =====================================================
  const [code, setCode] = useState("");
  const [staffDropdown, setStaffDropdown] = useState([]);
  const [loadingDropdown, setLoadingDropdown] = useState(true);

  // =====================================================
  // STAFF STATE & FORM
  // =====================================================
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // =====================================================
  // PHOTO & PDF STATE
  // =====================================================
  const [photoCompressing, setPhotoCompressing] = useState(false);
  const [selectedPhotoName, setSelectedPhotoName] = useState("");
  const [pdfProcessing, setPdfProcessing] = useState(false);
  const [selectedPdfName, setSelectedPdfName] = useState("");

  // =====================================================
  // SANITIZATION & VALUE HELPERS
  // =====================================================
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

  const getRoleName = (item) => {
    const r =
      item?.roleName ||
      item?.RoleName ||
      item?.role ||
      item?.Role ||
      item?.userRole ||
      item?.UserRole;
    if (!r || typeof r !== "string" || r.trim().toLowerCase() === "string") {
      return "Non-Teaching Staff";
    }
    return r.trim();
  };

  // =====================================================
  // LOAD STAFF DROPDOWN
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
  const searchStaffByCode = async (staffCode) => {
    const cleanCode = staffCode?.trim();
    if (!cleanCode) {
      setError("Please enter Staff Code.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");
      setStaff(null);

      const response = await getNonTeachingStaffByCode(cleanCode);
      const staffData = response?.data || response;

      if (!staffData) {
        setError("Staff not found.");
        return;
      }

      setStaff(staffData);

      const photoVal = getPhoto(staffData);
      const pdfVal = getPdf(staffData);
      setSelectedPhotoName(photoVal ? "Current Photo Attached" : "");
      setSelectedPdfName(
        staffData.educationFileName ||
          staffData.EducationFileName ||
          (pdfVal ? "Current Document.pdf" : ""),
      );

      setCode(staffData.staffCode || staffData.StaffCode || cleanCode);
    } catch (err) {
      console.error("GET STAFF BY CODE ERROR:", err);
      setError(err.message || "Unable to fetch staff.");
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // MANUAL SEARCH & DROPDOWN CHANGE
  // =====================================================
  const handleSearch = async (e) => {
    e.preventDefault();
    await searchStaffByCode(code);
  };

  const handleDropdownChange = async (e) => {
    const selectedValue = e.target.value;
    setError("");
    setSuccess("");
    setStaff(null);

    if (!selectedValue) {
      setCode("");
      return;
    }

    const selectedItem = staffDropdown.find((item) => {
      const itemCode = item.code ?? item.staffCode ?? item.id;
      return String(itemCode) === String(selectedValue);
    });

    const staffCode =
      selectedItem?.code ?? selectedItem?.staffCode ?? selectedValue;
    setCode(staffCode);
    await searchStaffByCode(staffCode);
  };

  // =====================================================
  // HANDLE INPUT CHANGES
  // =====================================================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setStaff((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleActiveChange = (e) => {
    setStaff((prev) => ({
      ...prev,
      isActive: e.target.checked,
    }));
  };

  // =====================================================
  // PHOTO & PDF HANDLERS
  // =====================================================
  const handlePhotoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file (JPG, PNG, WebP).");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Photo file size must be less than 10 MB.");
      e.target.value = "";
      return;
    }
    try {
      setPhotoCompressing(true);
      setError("");
      const compressed = await compressImageFile(file);
      setStaff((prev) => ({ ...prev, photo: compressed, Photo: compressed }));
      setSelectedPhotoName(file.name);
    } catch (err) {
      console.error("Photo processing error:", err);
      setError("Failed to process selected image.");
    } finally {
      setPhotoCompressing(false);
    }
  };

  const handleRemovePhoto = () => {
    setStaff((prev) => ({ ...prev, photo: "", Photo: "" }));
    setSelectedPhotoName("");
    const input = document.getElementById("update-nts-photo-file");
    if (input) input.value = "";
  };

  const handlePdfFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      file.type !== "application/pdf" &&
      !file.name?.toLowerCase().endsWith(".pdf")
    ) {
      setError("Please select a valid PDF file.");
      e.target.value = "";
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("PDF file size must be less than 15 MB.");
      e.target.value = "";
      return;
    }
    try {
      setPdfProcessing(true);
      setError("");
      const base64Pdf = await readPdfAsBase64(file);
      setStaff((prev) => ({
        ...prev,
        educationPdf: base64Pdf,
        EducationPdf: base64Pdf,
        educationFileName: file.name,
        EducationFileName: file.name,
      }));
      setSelectedPdfName(file.name);
    } catch (err) {
      console.error("PDF processing error:", err);
      setError("Failed to process selected PDF.");
    } finally {
      setPdfProcessing(false);
    }
  };

  const handleRemovePdf = () => {
    setStaff((prev) => ({
      ...prev,
      educationPdf: "",
      EducationPdf: "",
      educationFileName: "",
      EducationFileName: "",
    }));
    setSelectedPdfName("");
    const input = document.getElementById("update-nts-pdf-file");
    if (input) input.value = "";
  };

  // =====================================================
  // UPDATE STAFF
  // =====================================================
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!staff) {
      setError("Please search or select staff first.");
      return;
    }

    if (!code.trim()) {
      setError("Staff code is required.");
      return;
    }

    try {
      setUpdating(true);

      const updateData = {
        firstName: staff.firstName?.trim() || "",
        middleName: staff.middleName?.trim() || "",
        lastName: staff.lastName?.trim() || "",
        dateOfBirth: staff.dateOfBirth || null,
        gender: staff.gender?.trim() || "",
        email: staff.email?.trim() || "",
        phoneNumber: staff.phoneNumber?.trim() || "",
        alternatePhoneNumber: staff.alternatePhoneNumber?.trim() || "",
        address: staff.address?.trim() || "",
        designation: staff.designation?.trim() || "",
        qualification: staff.qualification?.trim() || "",
        salary:
          staff.salary === "" ||
          staff.salary === null ||
          staff.salary === undefined
            ? null
            : Number(staff.salary),
        joiningDate: staff.joiningDate || null,
        isActive:
          staff.isActive === undefined || staff.isActive === null
            ? true
            : Boolean(staff.isActive),
        fatherName: staff.fatherName?.trim() || staff.FatherName?.trim() || "",
        motherName: staff.motherName?.trim() || staff.MotherName?.trim() || "",
        photo: staff.photo || staff.Photo || null,
        educationPdf: staff.educationPdf || staff.EducationPdf || null,
        educationFileName:
          staff.educationFileName || staff.EducationFileName || "",
        FatherName: staff.fatherName?.trim() || staff.FatherName?.trim() || "",
        MotherName: staff.motherName?.trim() || staff.MotherName?.trim() || "",
        Photo: staff.photo || staff.Photo || null,
        EducationPdf: staff.educationPdf || staff.EducationPdf || null,
        EducationFileName:
          staff.educationFileName || staff.EducationFileName || "",
      };

      await updateNonTeachingStaff(code.trim(), updateData);
      setSuccess("Non-teaching staff updated successfully.");

      // Refresh updated data
      const refreshedResponse = await getNonTeachingStaffByCode(code.trim());
      const refreshedStaff = refreshedResponse?.data || refreshedResponse;
      if (refreshedStaff) {
        setStaff(refreshedStaff);
      }

      await loadStaffDropdown();
    } catch (err) {
      console.error("UPDATE STAFF ERROR:", err);
      setError(err.message || "Unable to update staff.");
    } finally {
      setUpdating(false);
    }
  };

  // =====================================================
  // CLEAR / RESET
  // =====================================================
  const handleClear = () => {
    setCode("");
    setStaff(null);
    setError("");
    setSuccess("");
    setSelectedPhotoName("");
    setSelectedPdfName("");
  };

  const formatDateForInput = (date) => {
    if (!date) return "";
    try {
      return new Date(date).toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  const currentPhoto = getPhoto(staff);
  const currentPdf = getPdf(staff);

  // =====================================================
  // RENDER
  // =====================================================
  return (
    <div className="nts-update-page">
      <div className="nts-update-container">
        {/* HEADER */}
        <div className="nts-update-header">
          <h2>Update Non-Teaching Staff</h2>
          <p>Select staff from dropdown or enter Staff Code manually.</p>
        </div>

        {/* STAFF SELECTION */}
        <div className="nts-update-selection">
          {/* DROPDOWN */}
          <div className="nts-selection-group">
            <label htmlFor="staffDropdown">Select Staff</label>
            <select
              id="staffDropdown"
              value={code}
              onChange={handleDropdownChange}
              disabled={loadingDropdown || loading || updating}
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
                    {itemCode} - {itemText}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="nts-or">OR</div>

          {/* MANUAL CODE */}
          <div className="nts-selection-group">
            <label htmlFor="staffCode">Enter Staff Code</label>
            <div className="nts-code-search">
              <input
                id="staffCode"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Enter Staff Code"
                disabled={loading || updating}
              />
              <button
                type="button"
                onClick={handleSearch}
                disabled={loading || updating}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>

          {/* RESET */}
          <div className="nts-selection-group nts-clear-container">
            <label>Reset Search</label>
            <button
              type="button"
              className="nts-clear-button"
              onClick={handleClear}
              disabled={loading || updating}
            >
              Clear
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {error && <div className="nts-update-error">{error}</div>}
        {success && <div className="nts-update-success">{success}</div>}

        {/* STAFF DETAILS / UPDATE FORM */}
        {staff && (
          <form className="nts-update-form" onSubmit={handleUpdate}>
            {/* TOP INFO BAR */}
            <div className="nts-update-info">
              <div>
                <span>Staff Code</span>
                <strong>{staff.staffCode || staff.StaffCode || code}</strong>
              </div>
              <div>
                <span>Role / User Type</span>
                <div>
                  <span className="nts-role-badge">{getRoleName(staff)}</span>
                </div>
              </div>
              <div>
                <span>User ID</span>
                <strong>{staff.userId || staff.UserId || "-"}</strong>
              </div>
            </div>

            {/* PHOTO CARD BANNER & CONTROLS */}
            <div className="nts-photo-card-banner">
              {currentPhoto ? (
                <img
                  src={currentPhoto}
                  alt={staff.firstName}
                  className="nts-detail-photo"
                  onClick={() =>
                    openPhotoInNewTab(
                      currentPhoto,
                      `${staff.firstName || ""} ${staff.lastName || ""}`.trim(),
                    )
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
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: "0 0 6px 0", color: "#1e293b" }}>
                  {staff.firstName} {staff.middleName || ""} {staff.lastName}
                </h4>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <label
                    htmlFor="update-nts-photo-file"
                    className="teacher-preview-btn"
                    style={{ cursor: "pointer" }}
                  >
                    📷 {currentPhoto ? "Change Photo" : "Upload Photo"}
                  </label>
                  <input
                    id="update-nts-photo-file"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoFileChange}
                    style={{ display: "none" }}
                    disabled={updating || photoCompressing}
                  />
                  {currentPhoto && (
                    <button
                      type="button"
                      className="teacher-remove-btn"
                      onClick={handleRemovePhoto}
                    >
                      ✕ Remove Photo
                    </button>
                  )}
                  {photoCompressing && (
                    <span style={{ fontSize: "12px", color: "#2563eb" }}>
                      Compressing photo...
                    </span>
                  )}
                  {selectedPhotoName && (
                    <span style={{ fontSize: "12px", color: "#15803d" }}>
                      ✓ {selectedPhotoName}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* FORM GRID */}
            <div className="nts-update-grid">
              {/* FIRST NAME */}
              <div className="nts-form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={staff.firstName || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* MIDDLE NAME */}
              <div className="nts-form-group">
                <label htmlFor="middleName">Middle Name</label>
                <input
                  id="middleName"
                  type="text"
                  name="middleName"
                  value={staff.middleName || ""}
                  onChange={handleChange}
                />
              </div>

              {/* LAST NAME */}
              <div className="nts-form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={staff.lastName || ""}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* FATHER NAME */}
              <div className="nts-form-group">
                <label htmlFor="fatherName">Father's Name</label>
                <input
                  id="fatherName"
                  type="text"
                  name="fatherName"
                  value={staff.fatherName ?? staff.FatherName ?? ""}
                  onChange={handleChange}
                  placeholder="Enter father's name"
                />
              </div>

              {/* MOTHER NAME */}
              <div className="nts-form-group">
                <label htmlFor="motherName">Mother's Name</label>
                <input
                  id="motherName"
                  type="text"
                  name="motherName"
                  value={staff.motherName ?? staff.MotherName ?? ""}
                  onChange={handleChange}
                  placeholder="Enter mother's name"
                />
              </div>

              {/* DATE OF BIRTH */}
              <div className="nts-form-group">
                <label htmlFor="dateOfBirth">Date of Birth</label>
                <input
                  id="dateOfBirth"
                  type="date"
                  name="dateOfBirth"
                  value={formatDateForInput(staff.dateOfBirth)}
                  onChange={(e) =>
                    setStaff((prev) => ({
                      ...prev,
                      dateOfBirth: e.target.value,
                    }))
                  }
                />
              </div>

              {/* GENDER */}
              <div className="nts-form-group">
                <label htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  name="gender"
                  value={staff.gender || ""}
                  onChange={handleChange}
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* EMAIL */}
              <div className="nts-form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={staff.email || ""}
                  onChange={handleChange}
                />
              </div>

              {/* PHONE */}
              <div className="nts-form-group">
                <label htmlFor="phoneNumber">Phone Number</label>
                <input
                  id="phoneNumber"
                  type="text"
                  name="phoneNumber"
                  value={staff.phoneNumber || ""}
                  onChange={handleChange}
                />
              </div>

              {/* ALTERNATE PHONE */}
              <div className="nts-form-group">
                <label htmlFor="alternatePhoneNumber">
                  Alternate Phone Number
                </label>
                <input
                  id="alternatePhoneNumber"
                  type="text"
                  name="alternatePhoneNumber"
                  value={staff.alternatePhoneNumber || ""}
                  onChange={handleChange}
                />
              </div>

              {/* DESIGNATION */}
              <div className="nts-form-group">
                <label htmlFor="designation">Designation</label>
                <input
                  id="designation"
                  type="text"
                  name="designation"
                  value={staff.designation || ""}
                  onChange={handleChange}
                />
              </div>

              {/* QUALIFICATION */}
              <div className="nts-form-group">
                <label htmlFor="qualification">Qualification</label>
                <input
                  id="qualification"
                  type="text"
                  name="qualification"
                  value={staff.qualification || ""}
                  onChange={handleChange}
                />
              </div>

              {/* SALARY */}
              <div className="nts-form-group">
                <label htmlFor="salary">Salary</label>
                <input
                  id="salary"
                  type="number"
                  name="salary"
                  value={staff.salary ?? ""}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                />
              </div>

              {/* JOINING DATE */}
              <div className="nts-form-group">
                <label htmlFor="joiningDate">Joining Date</label>
                <input
                  id="joiningDate"
                  type="date"
                  name="joiningDate"
                  value={formatDateForInput(staff.joiningDate)}
                  onChange={(e) =>
                    setStaff((prev) => ({
                      ...prev,
                      joiningDate: e.target.value,
                    }))
                  }
                />
              </div>

              {/* EDUCATION PDF */}
              <div className="nts-form-group nts-update-address">
                <label>Combined Education Documents (PDF)</label>
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >
                  {currentPdf ? (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "10px",
                        background: "#ffffff",
                        padding: "10px 14px",
                        borderRadius: "6px",
                        border: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <span style={{ fontSize: "20px" }}>📄</span>
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "600",
                            color: "#1e293b",
                          }}
                        >
                          {staff.educationFileName ||
                            staff.EducationFileName ||
                            selectedPdfName ||
                            "Education_Documents.pdf"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button
                          type="button"
                          className="nts-view-pdf-btn"
                          onClick={() =>
                            openPdfInNewTab(
                              currentPdf,
                              `${staff.firstName || ""} ${staff.lastName || ""} Education Documents`.trim(),
                            )
                          }
                        >
                          🔗 View PDF ↗
                        </button>
                        <button
                          type="button"
                          className="teacher-remove-btn"
                          onClick={handleRemovePdf}
                        >
                          ✕ Remove PDF
                        </button>
                      </div>
                    </div>
                  ) : (
                    <span style={{ fontSize: "13px", color: "#64748b" }}>
                      📂 No educational document currently attached.
                    </span>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    <label
                      htmlFor="update-nts-pdf-file"
                      className="teacher-preview-btn"
                      style={{ cursor: "pointer" }}
                    >
                      📄{" "}
                      {currentPdf
                        ? "Re-upload / Replace PDF"
                        : "Upload Education PDF"}
                    </label>
                    <input
                      id="update-nts-pdf-file"
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={handlePdfFileChange}
                      style={{ display: "none" }}
                      disabled={updating || pdfProcessing}
                    />
                    {pdfProcessing && (
                      <span style={{ fontSize: "12px", color: "#2563eb" }}>
                        Processing PDF...
                      </span>
                    )}
                    {selectedPdfName && currentPdf && (
                      <span style={{ fontSize: "12px", color: "#15803d" }}>
                        ✓ Ready: {selectedPdfName}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ADDRESS */}
              <div className="nts-form-group nts-update-address">
                <label htmlFor="address">Address</label>
                <textarea
                  id="address"
                  name="address"
                  rows="4"
                  value={staff.address || ""}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </div>

              {/* ACTIVE */}
              <div className="nts-form-group nts-update-active">
                <label htmlFor="isActive">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={staff.isActive ?? true}
                    onChange={handleActiveChange}
                  />
                  <span>Active</span>
                </label>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="nts-form-actions">
              <button
                type="submit"
                className="nts-update-button"
                disabled={updating}
              >
                {updating ? "Updating..." : "Update Staff"}
              </button>
              <button
                type="button"
                className="nts-cancel-button"
                onClick={handleClear}
                disabled={updating}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateNonTeachingStaff;
