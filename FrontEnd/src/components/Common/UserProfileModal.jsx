import React, { useEffect, useState } from "react";
import {
  getUsername,
  getUserId,
  getRole,
  isStudentRole,
} from "../../Utils/auth";
import {
  getAllNonTeachingStaff,
  getSavedStaffExtraFields,
} from "../../Services/nonTeachingStaffService";
import { getAllStudents } from "../../Services/studentService";
import {
  formatFileUrl,
  openPhotoInNewTab,
  openPdfInNewTab,
} from "../../Utils/fileHelper";
import "./UserProfileModal.css";

const UserProfileModal = ({ isOpen, onClose, roleTitle = "Operator" }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const username = getUsername();
  const userId = getUserId();
  const currentRole = getRole() || roleTitle;
  const isStudent =
    isStudentRole() || String(currentRole).toLowerCase().includes("student");

  useEffect(() => {
    if (isOpen) {
      loadProfile();
    }
  }, [isOpen]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const uNameLower = String(username || "")
        .toLowerCase()
        .trim();
      const uIdStr = String(userId || "").trim();

      // If Student, load from student records first
      if (isStudent) {
        const studentRes = await getAllStudents().catch(() => []);
        const studentList = Array.isArray(studentRes)
          ? studentRes
          : studentRes?.data || studentRes?.Data || [];

        const matchedStudent = studentList.find((st) => {
          const sUserId = String(st.userId || st.UserId || "");
          const sAdm = String(st.admissionNumber || st.AdmissionNumber || "")
            .toLowerCase()
            .trim();
          const sRoll = String(st.rollNumber || st.RollNumber || "")
            .toLowerCase()
            .trim();
          const sEmail = String(st.email || st.Email || "")
            .toLowerCase()
            .trim();
          const sCode = String(st.code || st.Code || "")
            .toLowerCase()
            .trim();

          if (uIdStr && sUserId === uIdStr) return true;
          if (
            uNameLower &&
            (sAdm === uNameLower ||
              sRoll === uNameLower ||
              sEmail === uNameLower ||
              sCode === uNameLower)
          )
            return true;
          return false;
        });

        if (matchedStudent) {
          setProfile({
            ...matchedStudent,
            id: matchedStudent.id || matchedStudent.Id || userId || "1",
            staffCode:
              matchedStudent.admissionNumber ||
              matchedStudent.AdmissionNumber ||
              matchedStudent.rollNumber ||
              matchedStudent.RollNumber ||
              username,
            firstName:
              matchedStudent.firstName || matchedStudent.FirstName || username,
            lastName: matchedStudent.lastName || matchedStudent.LastName || "",
            email:
              matchedStudent.email ||
              matchedStudent.Email ||
              `${username}@college.edu`,
            phoneNumber:
              matchedStudent.phoneNumber ||
              matchedStudent.PhoneNumber ||
              matchedStudent.phone ||
              "-",
            department:
              matchedStudent.departmentName ||
              matchedStudent.DepartmentName ||
              matchedStudent.className ||
              matchedStudent.ClassName ||
              "Academics",
            role: "Student",
            isActive:
              matchedStudent.isActive ?? matchedStudent.IsActive ?? true,
          });
          return;
        }
      }

      // Otherwise, load from Non-Teaching Staff (Operator / Office Employee)
      const allStaff = await getAllNonTeachingStaff().catch(() => []);
      const list = Array.isArray(allStaff)
        ? allStaff
        : allStaff?.data || allStaff?.Data || [];

      let matched = list.find((s) => {
        const sUserId = String(s.userId || s.UserId || "");
        const sCode = String(s.staffCode || s.StaffCode || "")
          .toLowerCase()
          .trim();
        const sEmail = String(s.email || s.Email || "")
          .toLowerCase()
          .trim();
        const sPhone = String(s.phoneNumber || s.PhoneNumber || "").trim();

        if (uIdStr && sUserId === uIdStr) return true;
        if (
          uNameLower &&
          (sCode === uNameLower ||
            sEmail === uNameLower ||
            sPhone === uNameLower)
        )
          return true;
        return false;
      });

      const extra =
        getSavedStaffExtraFields(userId) ||
        getSavedStaffExtraFields(username) ||
        {};

      if (!matched) {
        matched = {
          id: userId || "1",
          staffCode: username || `${currentRole.toUpperCase()}-001`,
          firstName: username || currentRole,
          lastName: "",
          email: `${username || "user"}@college.edu`,
          phoneNumber: "+91 9876543210",
          designation: currentRole,
          role: currentRole,
          department: isStudent ? "Academics" : "Administration",
          isActive: true,
          ...extra,
        };
      }

      setProfile(matched);
    } catch (err) {
      console.warn("Could not load user profile:", err);
      setProfile({
        id: userId || "1",
        staffCode: username || (isStudent ? "STU-001" : "STAFF-001"),
        firstName: username || currentRole,
        lastName: "",
        email: `${username || "user"}@college.edu`,
        phoneNumber: "-",
        role: currentRole,
        isActive: true,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const fullName = profile
    ? [
        profile.firstName || profile.FirstName,
        profile.middleName || profile.MiddleName,
        profile.lastName || profile.LastName,
      ]
        .filter(Boolean)
        .join(" ") ||
      profile.staffCode ||
      username ||
      "Staff Member"
    : username || "User";

  const photo = profile?.photo || profile?.Photo || null;
  const staffCode =
    profile?.staffCode || profile?.StaffCode || username || "N/A";
  const email =
    profile?.email || profile?.Email || `${username || "staff"}@college.edu`;
  const phone =
    profile?.phoneNumber || profile?.PhoneNumber || profile?.phone || "-";
  const altPhone =
    profile?.alternatePhoneNumber || profile?.AlternatePhoneNumber || "-";
  const fatherName = profile?.fatherName || profile?.FatherName || "-";
  const motherName = profile?.motherName || profile?.MotherName || "-";
  const address =
    profile?.address || profile?.Address || profile?.residentialAddress || "-";
  const dob = profile?.dob || profile?.DOB || profile?.dateOfBirth;
  const gender = profile?.gender || profile?.Gender || "Not Specified";
  const educationPdf = profile?.educationPdf || profile?.EducationPdf || null;
  const educationFileName =
    profile?.educationFileName ||
    profile?.EducationFileName ||
    "Qualification Document";

  return (
    <div className="user-profile-modal-overlay" onClick={onClose}>
      <div
        className="user-profile-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header Bar */}
        <div className="profile-modal-top-bar">
          <div className="top-bar-left">
            <span className="top-bar-icon">👤</span>
            <h2>{currentRole} Profile Details</h2>
          </div>
          <button
            type="button"
            className="profile-modal-close-btn"
            onClick={onClose}
            title="Close Profile"
          >
            ✕
          </button>
        </div>

        {/* Modal Body Container (75% viewport size layout) */}
        <div className="profile-modal-body">
          {loading ? (
            <div className="profile-modal-loading">
              <div className="spinner"></div>
              <p>Loading your profile details...</p>
            </div>
          ) : (
            <>
              {/* Identity & Photo Banner */}
              <div className="profile-identity-banner">
                <div className="profile-avatar-wrapper">
                  {photo ? (
                    <img
                      src={formatFileUrl(photo)}
                      alt={fullName}
                      className="profile-avatar-circle"
                      onClick={() =>
                        openPhotoInNewTab(formatFileUrl(photo), fullName)
                      }
                      title="Click to view full photograph"
                    />
                  ) : (
                    <div className="profile-avatar-placeholder">
                      {String(fullName).charAt(0).toUpperCase()}
                    </div>
                  )}
                  {photo && (
                    <button
                      type="button"
                      className="avatar-zoom-btn"
                      onClick={() =>
                        openPhotoInNewTab(formatFileUrl(photo), fullName)
                      }
                      title="View Full Photo"
                    >
                      🔍
                    </button>
                  )}
                </div>

                <div className="profile-identity-info">
                  <div className="profile-name-row">
                    <h3>{fullName}</h3>
                    <span className="profile-role-badge">🏷️ {currentRole}</span>
                    <span className="profile-status-badge active">
                      ● Active Account
                    </span>
                  </div>

                  <div className="profile-meta-tags">
                    <span className="meta-tag">
                      <strong>
                        {isStudent ? "Admission/Roll No:" : "Staff Code:"}
                      </strong>{" "}
                      {staffCode}
                    </span>
                    <span className="meta-tag">
                      <strong>Username:</strong> {username}
                    </span>
                    <span className="meta-tag">
                      <strong>User ID:</strong> #
                      {profile?.id || profile?.Id || userId || "1"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Comprehensive Profile Sections Grid */}
              <div className="profile-details-grid">
                {/* 1. Personal Details */}
                <div className="profile-section-card">
                  <h4 className="section-header">
                    <span>📋</span> Personal Information
                  </h4>
                  <div className="section-fields-grid">
                    <div className="field-item">
                      <label>Full Name</label>
                      <p>{fullName}</p>
                    </div>
                    <div className="field-item">
                      <label>
                        {isStudent ? "Admission / Roll No." : "Staff Code"}
                      </label>
                      <p>{staffCode}</p>
                    </div>
                    <div className="field-item">
                      <label>Father&apos;s Name</label>
                      <p>{fatherName}</p>
                    </div>
                    <div className="field-item">
                      <label>Mother&apos;s Name</label>
                      <p>{motherName}</p>
                    </div>
                    <div className="field-item">
                      <label>Date of Birth</label>
                      <p>
                        {dob ? new Date(dob).toLocaleDateString("en-IN") : "-"}
                      </p>
                    </div>
                    <div className="field-item">
                      <label>Gender</label>
                      <p>{gender}</p>
                    </div>
                  </div>
                </div>

                {/* 2. Contact & Address */}
                <div className="profile-section-card">
                  <h4 className="section-header">
                    <span>📞</span> Contact &amp; Communication
                  </h4>
                  <div className="section-fields-grid">
                    <div className="field-item">
                      <label>Email Address</label>
                      <p>{email}</p>
                    </div>
                    <div className="field-item">
                      <label>Primary Phone</label>
                      <p>{phone}</p>
                    </div>
                    <div className="field-item">
                      <label>Alternate Phone</label>
                      <p>{altPhone}</p>
                    </div>
                    <div className="field-item full-width">
                      <label>Residential Address</label>
                      <p>{address}</p>
                    </div>
                  </div>
                </div>

                {/* 3. Role, Department & Documents */}
                <div className="profile-section-card full-span">
                  <h4 className="section-header">
                    <span>🏛️</span>{" "}
                    {isStudent
                      ? "Academic Information"
                      : "Designation & Credentials"}
                  </h4>
                  <div className="section-fields-grid">
                    <div className="field-item">
                      <label>Assigned System Role</label>
                      <p>{currentRole}</p>
                    </div>
                    <div className="field-item">
                      <label>
                        {isStudent ? "Class / Branch" : "Department / Branch"}
                      </label>
                      <p>
                        {profile?.department ||
                          profile?.Department ||
                          profile?.className ||
                          profile?.ClassName ||
                          (isStudent
                            ? "Academics"
                            : "Administration & Operations")}
                      </p>
                    </div>
                    <div className="field-item">
                      <label>Account Status</label>
                      <p className="status-highlight">Active &amp; Verified</p>
                    </div>
                    <div className="field-item">
                      <label>
                        {isStudent
                          ? "Academic Documents"
                          : "Qualification Document (PDF)"}
                      </label>
                      {educationPdf ? (
                        <button
                          type="button"
                          className="view-pdf-btn"
                          onClick={() =>
                            openPdfInNewTab(
                              educationPdf,
                              `${fullName} Document`,
                            )
                          }
                        >
                          📄 View {educationFileName || "Document"}
                        </button>
                      ) : (
                        <p className="text-muted">No Document Attached</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="profile-modal-footer">
          {photo && (
            <button
              type="button"
              className="footer-view-photo-btn"
              onClick={() => openPhotoInNewTab(formatFileUrl(photo), fullName)}
            >
              👁 View Full Photograph ↗
            </button>
          )}
          <button type="button" className="footer-close-btn" onClick={onClose}>
            ✕ Close Profile
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;
