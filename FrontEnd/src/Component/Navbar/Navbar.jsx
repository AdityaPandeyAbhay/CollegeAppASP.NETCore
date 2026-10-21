import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

import {
  getRole,
  getUsername,
  getUserId,
  hasProfileFeature,
} from "../../Utils/auth";
import roleRoutes from "../../Utils/roleRoutes";
import {
  getAllNonTeachingStaff,
  getSavedStaffExtraFields,
} from "../../Services/nonTeachingStaffService";
import { getAllStudents } from "../../Services/studentService";
import { formatFileUrl } from "../../Utils/fileHelper";
import UserProfileModal from "../../Components/Common/UserProfileModal";

import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [userPhoto, setUserPhoto] = useState(null);

  const token = localStorage.getItem("token");
  const username = getUsername();
  const userId = getUserId();
  const role = getRole();
  const showProfile = hasProfileFeature();

  const dashboardRoute = role
    ? roleRoutes[role] ||
      roleRoutes[
        String(role)
          .toLowerCase()
          .replace(/[\s_-]+/g, "")
      ]
    : null;

  // Fetch user avatar photo when logged in (ONLY for Operator, Office Employee, or Student)
  useEffect(() => {
    if (token && showProfile) {
      loadUserPhoto();
    } else {
      setUserPhoto(null);
    }
  }, [token, username, userId, showProfile]);

  const loadUserPhoto = async () => {
    try {
      const uNameLower = String(username || "")
        .toLowerCase()
        .trim();
      const uIdStr = String(userId || "").trim();

      // 1. Try Non-Teaching Staff (Operator / Office Employee)
      const allStaff = await getAllNonTeachingStaff().catch(() => []);
      const staffList = Array.isArray(allStaff)
        ? allStaff
        : allStaff?.data || allStaff?.Data || [];

      const matchedStaff = staffList.find((s) => {
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

      if (matchedStaff) {
        const extra =
          getSavedStaffExtraFields(userId) ||
          getSavedStaffExtraFields(username) ||
          {};
        const photo =
          matchedStaff?.photo || matchedStaff?.Photo || extra?.photo || null;
        if (photo) {
          setUserPhoto(photo);
          return;
        }
      }

      // 2. Try Students
      const allStudentsRes = await getAllStudents().catch(() => []);
      const studentList = Array.isArray(allStudentsRes)
        ? allStudentsRes
        : allStudentsRes?.data || allStudentsRes?.Data || [];

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

        if (uIdStr && sUserId === uIdStr) return true;
        if (
          uNameLower &&
          (sAdm === uNameLower || sRoll === uNameLower || sEmail === uNameLower)
        )
          return true;
        return false;
      });

      if (matchedStudent) {
        const photo = matchedStudent?.photo || matchedStudent?.Photo || null;
        setUserPhoto(photo);
        return;
      }

      setUserPhoto(null);
    } catch (e) {
      console.warn("Could not load user photo for navbar:", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setMenuOpen(false);
    navigate("/login");
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const location = useLocation();
  const rawPath = (location.pathname || "").toLowerCase().trim();
  const isDashboard = rawPath.startsWith("/dashboard");

  return (
    <>
      <nav
        className={`navbar ${isDashboard ? "navbar-dashboard" : "navbar-public"}`}
      >
        {/* ================= LOGO ================= */}
        <div className="navbar-logo">
          <Link to="/" onClick={closeMenu} className="navbar-brand-link">
            <img
              src="/assets/logo-emblem.png"
              alt="Apna School Logo"
              className="navbar-brand-logo-img"
            />
            <div className="navbar-brand-text">
              <span className="navbar-brand-main">APNA SCHOOL</span>
              <span className="navbar-brand-sub">PUBLIC SCHOOL</span>
            </div>
          </Link>
        </div>

        {/* ================= MOBILE MENU BUTTON ================= */}
        <button
          type="button"
          className="menu-button"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        {/* ================= NAVIGATION ================= */}
        <div className={`navbar-links ${menuOpen ? "menu-open" : ""}`}>
          <Link to="/" onClick={closeMenu}>
            Home
          </Link>

          <Link to="/about" onClick={closeMenu}>
            About Us
          </Link>

          <Link to="/contact" onClick={closeMenu}>
            Contact Us
          </Link>

          <Link to="/notice" onClick={closeMenu}>
            Notice
          </Link>

          {/* ================= LOGIN ================= */}
          {!token && (
            <Link className="login-button" to="/login" onClick={closeMenu}>
              Login
            </Link>
          )}

          {/* ================= LOGGED IN ================= */}
          {token && (
            <>
              {dashboardRoute && (
                <Link
                  className="dashboard-link"
                  to={dashboardRoute}
                  onClick={closeMenu}
                >
                  {username || "Dashboard"}
                </Link>
              )}

              {/* CIRCULAR PHOTO BUTTON (ONLY for Operator, Office Employee, or Student) */}
              {showProfile && (
                <div
                  className="navbar-profile-avatar-btn"
                  onClick={() => {
                    setProfileModalOpen(true);
                    closeMenu();
                  }}
                  title={`Click to view ${role || "User"} Profile`}
                >
                  {userPhoto ? (
                    <img
                      src={formatFileUrl(userPhoto)}
                      alt={username || "User"}
                      className="navbar-round-avatar-img"
                    />
                  ) : (
                    <div className="navbar-round-avatar-placeholder">
                      {String(username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  )}
                  <span className="navbar-online-badge"></span>
                </div>
              )}

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </nav>

      {/* 75% PROFILE MODAL (ONLY FOR OPERATOR, OFFICE EMPLOYEE, STUDENT) */}
      {showProfile && (
        <UserProfileModal
          isOpen={profileModalOpen}
          onClose={() => setProfileModalOpen(false)}
          roleTitle={role || "User"}
        />
      )}
    </>
  );
}

export default Navbar;
