import React, { useState, useEffect } from "react";
import {
  createUser,
  getRoleDropdown,
  getUserTypeDropdown,
  getAllUsers,
  getUserByName,
} from "../../Services/userService";
import { isOperatorRole } from "../../Utils/auth";
import "./QuickRegisterUserCard.css";

const QuickRegisterUserCard = ({
  userType: propUserType,
  defaultUserType,
  onUserCreated,
  onUserRegistered,
  targetScrollId,
  title,
  description,
}) => {
  const userType = propUserType || defaultUserType || "Student";
  const notifyUserCreated = (user) => {
    if (typeof onUserCreated === "function") {
      onUserCreated(user);
    }
    if (typeof onUserRegistered === "function") {
      onUserRegistered(user);
    }
  };

  const [userId, setUserId] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [resolvingMeta, setResolvingMeta] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [createdUserRecord, setCreatedUserRecord] = useState(null);

  const [resolvedUserTypeId, setResolvedUserTypeId] = useState(null);
  const [resolvedUserTypeName, setResolvedUserTypeName] = useState("");
  const [resolvedRoleId, setResolvedRoleId] = useState(null);
  const [resolvedRoleName, setResolvedRoleName] = useState("");

  const targetNorm = String(userType || "").trim().toLowerCase();
  const isTeacher = targetNorm.includes("teacher");
  const isStudent = targetNorm.includes("student");
  const isNonTeaching =
    !isTeacher &&
    !isStudent &&
    (targetNorm.includes("staff") || targetNorm.includes("non"));

  const displayType = isTeacher
    ? "Teacher"
    : isStudent
      ? "Student"
      : isNonTeaching
        ? "Non-Teaching Staff"
        : userType;

  // Non-teaching specific roles list & selected role ID
  const [nonTeachingRoles, setNonTeachingRoles] = useState([]);
  const [selectedRoleId, setSelectedRoleId] = useState("");

  const getRoleId = (r) =>
    String(r?.id ?? r?.Id ?? r?.code ?? r?.Code ?? r?.value ?? r?.Value ?? "");
  const getRoleName = (r) => {
    if (!r) return "";
    if (typeof r === "string") return r.trim();
    return String(
      r.roleName ??
        r.RoleName ??
        r.name ??
        r.Name ??
        r.text ??
        r.Text ??
        r.role ??
        r.Role ??
        r.label ??
        r.Label ??
        r.title ??
        r.Title ??
        r.value ??
        r.Value ??
        "",
    ).trim();
  };

  // Helper to test if a role is related to non-teaching staff (excludes student, teacher, superadmin, admin, amin)
  const isNonTeachingRole = (r) => {
    const rawName = getRoleName(r);
    const rName = rawName.toLowerCase().replace(/[\s_-]+/g, "");
    if (!rName) return false;

    // Strict exclusion of student, teacher, faculty, superadmin, admin, amin, administrator
    const excludedExact = [
      "student",
      "teacher",
      "faculty",
      "superadmin",
      "superamin",
      "admin",
      "amin",
      "administrator",
      "systemadmin",
      "principal",
    ];
    if (excludedExact.includes(rName)) return false;

    if (
      rName.includes("admin") ||
      rName.includes("amin") ||
      rName.includes("super") ||
      rName.includes("teacher") ||
      rName.includes("faculty") ||
      rName.includes("student")
    ) {
      return false;
    }

    // Exclude standard admin/superadmin IDs (1, 2) unless explicitly a staff role
    const rId = getRoleId(r);
    if (rId === "1" || rId === "2") {
      const isExplicitStaff =
        rName.includes("operator") ||
        rName.includes("office") ||
        rName.includes("clerk") ||
        rName.includes("accountant") ||
        rName.includes("librarian");
      if (!isExplicitStaff) return false;
    }

    return true;
  };

  // =====================================================
  // DYNAMIC RESOLUTION OF ROLE & USER TYPE
  // =====================================================
  useEffect(() => {
    const resolveRoleAndUserType = async () => {
      try {
        setResolvingMeta(true);
        setError("");

        const [roleRes, userTypeRes] = await Promise.allSettled([
          getRoleDropdown(),
          getUserTypeDropdown(),
        ]);

        const rawRoles =
          roleRes.status === "fulfilled"
            ? Array.isArray(roleRes.value)
              ? roleRes.value
              : roleRes.value?.data || roleRes.value?.Data || []
            : [];

        const rawUserTypes =
          userTypeRes.status === "fulfilled"
            ? Array.isArray(userTypeRes.value)
              ? userTypeRes.value
              : userTypeRes.value?.data || userTypeRes.value?.Data || []
            : [];

        const targetNorm = userType.toLowerCase();

        // 1. Resolve User Type
        let matchedUT = null;
        if (isTeacher) {
          matchedUT = rawUserTypes.find((u) => {
            const label = String(
              u.text ?? u.Text ?? u.name ?? u.Name ?? "",
            ).toLowerCase();
            return label === "teacher" || label.includes("teacher");
          });
        } else if (isStudent) {
          matchedUT = rawUserTypes.find((u) => {
            const label = String(
              u.text ?? u.Text ?? u.name ?? u.Name ?? "",
            ).toLowerCase();
            return label === "student" || label.includes("student");
          });
        } else if (isNonTeaching) {
          matchedUT = rawUserTypes.find((u) => {
            const label = String(
              u.text ?? u.Text ?? u.name ?? u.Name ?? "",
            ).toLowerCase();
            return label.includes("non") || label.includes("staff");
          });
        }

        const utId = isTeacher
          ? 3
          : isStudent
            ? 5
            : matchedUT
              ? (matchedUT.id ??
                matchedUT.Id ??
                matchedUT.code ??
                matchedUT.Code ??
                matchedUT.value ??
                matchedUT.Value)
              : 4;
        const utName = isTeacher
          ? "Teacher"
          : isStudent
            ? "Student"
            : isNonTeaching
              ? "Non-Teaching Staff"
              : (matchedUT?.text ?? matchedUT?.name ?? displayType);

        setResolvedUserTypeId(Number(utId) || (isTeacher ? 3 : isStudent ? 5 : 4));
        setResolvedUserTypeName(utName);

        // 2. Resolve Role(s)
        if (isNonTeaching) {
          const isCurrentOperator = isOperatorRole();

          // Filter roles for Non-Teaching Staff only
          const staffRolesFromApi = rawRoles.filter(isNonTeachingRole);
          let finalStaffRoles = [...staffRolesFromApi];

          // Ensure canonical Non-Teaching Staff roles exist:
          // 1. Operator (ONLY if not logged in as Operator) - DB Role ID 4
          if (!isCurrentOperator) {
            const hasOperator = finalStaffRoles.some((r) =>
              getRoleName(r).toLowerCase().includes("operator"),
            );
            if (!hasOperator) {
              finalStaffRoles.push({
                id: "4",
                Id: 4,
                roleName: "Operator",
                name: "Operator",
                text: "Operator",
              });
            }
          }

          // 2. Office Staff / Office Employee - DB Role ID 5
          const hasOfficeStaff = finalStaffRoles.some((r) => {
            const n = getRoleName(r).toLowerCase();
            return n.includes("office") || n.includes("employee");
          });
          if (!hasOfficeStaff) {
            finalStaffRoles.push({
              id: "5",
              Id: 5,
              roleName: "Office Staff",
              name: "Office Staff",
              text: "Office Staff",
            });
          }

          // 3. Other Non Teaching Staff - DB Role ID 7
          const hasOtherStaff = finalStaffRoles.some((r) => {
            const n = getRoleName(r).toLowerCase();
            return (
              n.includes("other") ||
              n.includes("non teaching") ||
              n.includes("nonteaching") ||
              n === "staff"
            );
          });
          if (!hasOtherStaff) {
            finalStaffRoles.push({
              id: "7",
              Id: 7,
              roleName: "Other Non Teaching Staff",
              name: "Other Non Teaching Staff",
              text: "Other Non Teaching Staff",
            });
          }

          // If current user is Operator, strictly exclude any Operator role
          if (isCurrentOperator) {
            finalStaffRoles = finalStaffRoles.filter((r) => {
              const name = getRoleName(r).toLowerCase();
              const rId = getRoleId(r);
              return !name.includes("operator") && rId !== "6";
            });
          }

          // Re-sort so Operator, Office Staff, Other Non Teaching Staff appear cleanly
          finalStaffRoles.sort((a, b) => {
            const nameA = getRoleName(a).toLowerCase();
            const nameB = getRoleName(b).toLowerCase();
            if (!isCurrentOperator && nameA.includes("operator")) return -1;
            if (!isCurrentOperator && nameB.includes("operator")) return 1;
            if (nameA.includes("office")) return -1;
            if (nameB.includes("office")) return 1;
            if (nameA.includes("other") || nameA.includes("staff")) return -1;
            if (nameB.includes("other") || nameB.includes("staff")) return 1;
            return nameA.localeCompare(nameB);
          });

          // Absolute strict filter to remove any Admin, Amin, SuperAdmin, Teacher, Student
          finalStaffRoles = finalStaffRoles.filter((r) => {
            const n = getRoleName(r)
              .toLowerCase()
              .replace(/[\s_-]+/g, "");
            const rId = getRoleId(r);
            if (
              n.includes("admin") ||
              n.includes("amin") ||
              n.includes("super") ||
              n.includes("teacher") ||
              n.includes("student") ||
              n.includes("faculty")
            ) {
              return false;
            }
            if (
              (rId === "1" || rId === "2") &&
              !n.includes("operator") &&
              !n.includes("office")
            ) {
              return false;
            }
            if (isCurrentOperator && (n.includes("operator") || rId === "6")) {
              return false;
            }
            return true;
          });

          setNonTeachingRoles(finalStaffRoles);

          // Find default/first role for staff
          let defaultStaffRole = finalStaffRoles[0];

          if (defaultStaffRole) {
            const rId = getRoleId(defaultStaffRole);
            const rName = getRoleName(defaultStaffRole);
            setSelectedRoleId(String(rId));
            setResolvedRoleId(Number(rId) || (isCurrentOperator ? 7 : 4));
            setResolvedRoleName(rName);
          } else {
            setSelectedRoleId(isCurrentOperator ? "7" : "4");
            setResolvedRoleId(isCurrentOperator ? 7 : 4);
            setResolvedRoleName(
              isCurrentOperator ? "Office Staff" : "Other Non Teaching Staff",
            );
          }
        } else if (isTeacher) {
          const matchedRole = rawRoles.find((r) => {
            const rName = getRoleName(r).toLowerCase();
            return rName === "teacher" || rName.includes("teacher");
          });
          const rId = matchedRole ? getRoleId(matchedRole) : 3;
          setResolvedRoleId(Number(rId) || 3);
          setResolvedRoleName("Teacher");
          setSelectedRoleId(String(rId || 3));
        } else if (isStudent) {
          const matchedRole = rawRoles.find((r) => {
            const rName = getRoleName(r).toLowerCase();
            return rName === "student" || rName.includes("student");
          });
          const rId = matchedRole ? getRoleId(matchedRole) : 6;
          setResolvedRoleId(Number(rId) || 6);
          setResolvedRoleName("Student");
          setSelectedRoleId(String(rId || 6));
        } else {
          const matchedRole = rawRoles.find((r) => {
            const rName = getRoleName(r).toLowerCase();
            return (rName.includes("office") || rName.includes("staff")) && !rName.includes("teacher") && !rName.includes("student");
          });
          const rId = matchedRole ? getRoleId(matchedRole) : (isOperatorRole() ? 5 : 4);
          const rName = matchedRole ? getRoleName(matchedRole) : (isOperatorRole() ? "Office Staff" : "Staff");
          setResolvedRoleId(Number(rId) || (isOperatorRole() ? 5 : 4));
          setResolvedRoleName(rName || "Staff");
        }
      } catch (err) {
        console.warn("Notice while resolving user metadata:", err);
        // Safe fallbacks: Teacher -> 3, Student -> 6, Non-Teaching -> 5 (Office Staff) or 7 (Other Staff)
        setResolvedUserTypeId(isTeacher ? 3 : isStudent ? 5 : 4);
        setResolvedUserTypeName(isTeacher ? "Teacher" : isStudent ? "Student" : displayType);
        setResolvedRoleId(isTeacher ? 3 : isStudent ? 6 : (isOperatorRole() ? 5 : 4));
        setResolvedRoleName(isTeacher ? "Teacher" : isStudent ? "Student" : displayType);
      } finally {
        setResolvingMeta(false);
      }
    };

    resolveRoleAndUserType();
  }, [userType, displayType, isNonTeaching]);

  // Keep resolvedRoleName in sync when selectedRoleId changes for non-teaching
  useEffect(() => {
    if (isNonTeaching && selectedRoleId && nonTeachingRoles.length > 0) {
      const current = nonTeachingRoles.find(
        (r) => getRoleId(r) === String(selectedRoleId),
      );
      if (current) {
        setResolvedRoleName(getRoleName(current));
        setResolvedRoleId(Number(getRoleId(current)));
      }
    }
  }, [selectedRoleId, isNonTeaching, nonTeachingRoles]);

  // =====================================================
  // SUBMIT USER CREATION
  // =====================================================
  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    const trimmedUsername = username.trim();
    if (!trimmedUsername) {
      setError("Please enter a username or email for this account.");
      return;
    }

    if (isNonTeaching && !selectedRoleId) {
      setError("Please select a role for this Non-Teaching Staff account.");
      return;
    }

    if (!password) {
      setError("Please enter a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (confirmPassword && password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    const activeRoleId = isTeacher
      ? 3
      : isStudent
        ? 6
        : isNonTeaching
          ? Number(selectedRoleId || resolvedRoleId || (isOperatorRole() ? 5 : 4))
          : Number(resolvedRoleId || 4);

    // Strict check: Operators cannot create other Operators (DB Role ID 4)
    if (
      isNonTeaching &&
      isOperatorRole() &&
      (Number(activeRoleId) === 4 ||
        String(selectedRoleId) === "4" ||
        String(resolvedRoleName).toLowerCase().includes("operator"))
    ) {
      setError(
        "Operators are not permitted to create other Operator accounts.",
      );
      return;
    }

    const activeUserTypeId = isTeacher
      ? 3
      : isStudent
        ? 5
        : isNonTeaching
          ? Number(resolvedUserTypeId || 4)
          : Number(resolvedUserTypeId || 4);

    try {
      setLoading(true);

      // Pre-validation: check duplicate usernames against existing users
      try {
        const allUsersRes = await getAllUsers();
        const existingUsers = Array.isArray(allUsersRes)
          ? allUsersRes
          : allUsersRes?.data || allUsersRes?.Data || [];

        if (Array.isArray(existingUsers) && existingUsers.length > 0) {
          const lowerUser = trimmedUsername.toLowerCase();
          const duplicate = existingUsers.find((u) => {
            const uName = String(
              u.username || u.Username || u.name || u.Name || "",
            )
              .trim()
              .toLowerCase();
            return uName === lowerUser;
          });

          if (duplicate) {
            setError(
              `A user with username '${trimmedUsername}' already exists. Please choose a different username.`,
            );
            setLoading(false);
            return;
          }
        }
      } catch (checkErr) {
        console.warn("Notice checking existing users:", checkErr);
      }

      const idPrefix = targetNorm.includes("student")
        ? "STU"
        : targetNorm.includes("teacher")
          ? "TCH"
          : targetNorm.includes("staff") || targetNorm.includes("non")
            ? "NTS"
            : "USR";
      const shortTimestamp = String(Date.now()).slice(-8);
      const generatedId = `${idPrefix}_${shortTimestamp}`;

      const payload = {
        id: generatedId,
        Id: generatedId,
        username: trimmedUsername,
        password: password,
        userTypeId: activeUserTypeId,
        UserTypeId: activeUserTypeId,
        roleIds: [activeRoleId],
        RoleIds: [activeRoleId],
        roleId: activeRoleId,
        RoleId: activeRoleId,
        isActive: true,
        IsActive: true,
      };

      const res = await createUser(payload);
      let createdData =
        res && typeof res === "object" ? res?.data || res?.Data || res : {};

      // Robust extraction of User ID (handles numbers, strings, and object responses)
      let resolvedUserId = null;
      if (typeof res === "number" && res > 0) {
        resolvedUserId = String(res);
      } else if (typeof res?.data === "number" && res.data > 0) {
        resolvedUserId = String(res.data);
      } else if (typeof res?.Data === "number" && res.Data > 0) {
        resolvedUserId = String(res.Data);
      } else if (createdData && typeof createdData === "object") {
        const directId =
          createdData.id ??
          createdData.Id ??
          createdData.userId ??
          createdData.UserId;
        if (
          directId !== null &&
          directId !== undefined &&
          String(directId).trim() !== "" &&
          String(directId) !== "true"
        ) {
          resolvedUserId = String(directId).trim();
        }
      }

      // If resolvedUserId not yet extracted, lookup user by username from backend
      if (!resolvedUserId) {
        try {
          const foundUserRes = await getUserByName(trimmedUsername).catch(
            () => null,
          );
          const foundUser =
            foundUserRes?.data || foundUserRes?.Data || foundUserRes;
          const uId =
            foundUser?.id ??
            foundUser?.Id ??
            foundUser?.userId ??
            foundUser?.UserId;
          if (uId !== null && uId !== undefined && String(uId).trim() !== "") {
            resolvedUserId = String(uId).trim();
            createdData = { ...createdData, ...foundUser };
          }
        } catch (_) {}
      }

      if (!resolvedUserId) {
        try {
          const allURes = await getAllUsers().catch(() => []);
          const allUList = Array.isArray(allURes)
            ? allURes
            : allURes?.data || allURes?.Data || [];
          const lowerName = trimmedUsername.toLowerCase();
          const found = allUList.find((u) => {
            const un = String(
              u.username ?? u.Username ?? u.name ?? u.Name ?? "",
            )
              .trim()
              .toLowerCase();
            return un === lowerName;
          });
          if (found) {
            const uId = found.id ?? found.Id ?? found.userId ?? found.UserId;
            if (uId !== null && uId !== undefined && String(uId).trim() !== "") {
              resolvedUserId = String(uId).trim();
              createdData = { ...createdData, ...found };
            }
          }
        } catch (_) {}
      }

      // Guaranteed fallback to generatedId
      if (!resolvedUserId) {
        resolvedUserId = generatedId;
      }

      const createdId = resolvedUserId;

      const activeRoleObj = isNonTeaching
        ? nonTeachingRoles.find((r) => getRoleId(r) === String(activeRoleId))
        : null;
      const selectedRoleLabel = isTeacher
        ? "Teacher"
        : isStudent
          ? "Student"
          : activeRoleObj
            ? getRoleName(activeRoleObj)
            : resolvedRoleName || displayType;

      const selectedUserTypeLabel = isTeacher
        ? "Teacher"
        : isStudent
          ? "Student"
          : isNonTeaching
            ? "Non-Teaching Staff"
            : resolvedUserTypeName || displayType;

      const fullCreatedUser = {
        ...createdData,
        id: resolvedUserId,
        Id: resolvedUserId,
        code: resolvedUserId,
        Code: resolvedUserId,
        userId: resolvedUserId,
        UserId: resolvedUserId,
        username: trimmedUsername,
        Username: trimmedUsername,
        name: trimmedUsername,
        Name: trimmedUsername,
        text: `${resolvedUserId} - ${trimmedUsername} (${selectedRoleLabel})`,
        Text: `${resolvedUserId} - ${trimmedUsername} (${selectedRoleLabel})`,
        role: selectedRoleLabel,
        Role: selectedRoleLabel,
        roleName: selectedRoleLabel,
        RoleName: selectedRoleLabel,
        roleIds: [activeRoleId],
        RoleIds: [activeRoleId],
        roleId: activeRoleId,
        RoleId: activeRoleId,
        userTypeId: activeUserTypeId,
        UserTypeId: activeUserTypeId,
        userType: selectedUserTypeLabel,
        UserType: selectedUserTypeLabel,
        userTypeName: selectedUserTypeLabel,
        UserTypeName: selectedUserTypeLabel,
      };

      // Store in role lookup cache immediately
      try {
        const raw = localStorage.getItem("school_user_roles_lookup_v1");
        const map = raw ? JSON.parse(raw) : {};
        if (createdId) {
          map[createdId] = selectedRoleLabel;
          map[createdId.toLowerCase()] = selectedRoleLabel;
        }
        if (trimmedUserId) {
          map[trimmedUserId] = selectedRoleLabel;
          map[trimmedUserId.toLowerCase()] = selectedRoleLabel;
        }
        if (generatedId) {
          map[generatedId] = selectedRoleLabel;
          map[generatedId.toLowerCase()] = selectedRoleLabel;
        }
        if (trimmedUsername) {
          map[trimmedUsername] = selectedRoleLabel;
          map[trimmedUsername.toLowerCase()] = selectedRoleLabel;
        }
        if (numericUserId) {
          map[String(numericUserId)] = selectedRoleLabel;
        }
        localStorage.setItem(
          "school_user_roles_lookup_v1",
          JSON.stringify(map),
        );
      } catch (_) {}

      setCreatedUserRecord(fullCreatedUser);
      setSuccessMsg(
        `✓ ${displayType} user account '${trimmedUsername}' (${selectedRoleLabel}) created successfully! Linked to profile below.`,
      );

      // Reset form fields
      setUserId("");
      setUsername("");
      setPassword("");
      setConfirmPassword("");

      // Notify parent component
      notifyUserCreated(fullCreatedUser);

      // Smooth scroll down to profile details
      if (targetScrollId) {
        setTimeout(() => {
          const targetEl = document.getElementById(targetScrollId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }, 350);
      }
    } catch (err) {
      console.error("Failed to create user:", err);
      setError(
        err?.message || "Failed to create user account. Please check inputs.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleScrollToProfile = () => {
    if (targetScrollId) {
      const targetEl = document.getElementById(targetScrollId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  return (
    <div className="quick-user-create-wrapper">
      <div className="quick-user-card">
        {/* Card Header with Step 1 Badge */}
        <div className="quick-user-header">
          <div className="quick-user-title-area">
            <span className="step-badge">STEP 1</span>
            <div>
              <h3 className="quick-user-title">
                Register User Account (Login & Sign-In Credentials)
              </h3>
              <p className="quick-user-subtitle">
                {isNonTeaching
                  ? "Create login credentials and select the staff role below. User Type is automatically locked."
                  : `Create the system login credentials for this ${displayType}. User Type & Role are automatically locked.`}
              </p>
            </div>
          </div>

          {/* User Type & Role Badges (Role column on right side of User Type) */}
          <div className="auto-roles-tag-group">
            <span className="auto-role-tag" title="User Type assigned">
              👤 User Type:{" "}
              <strong>{resolvedUserTypeName || displayType}</strong>
            </span>

            <span
              className="auto-role-tag role"
              title={
                isNonTeaching
                  ? "Selected Role for this staff account"
                  : "Role automatically assigned"
              }
            >
              🏷️ Role:{" "}
              <strong>
                {resolvedRoleName ||
                  (isNonTeaching
                    ? isOperatorRole()
                      ? "Office Staff"
                      : "Operator"
                    : displayType)}
              </strong>
            </span>
          </div>
        </div>

        {/* Success Banner when User Created */}
        {successMsg && (
          <div className="quick-user-success-alert">
            <div className="alert-content">
              <strong>{successMsg}</strong>
              {createdUserRecord && (
                <div className="created-user-summary">
                  <span>
                    User ID: <code>{createdUserRecord.id}</code>
                  </span>
                  <span>
                    Username: <code>{createdUserRecord.username}</code>
                  </span>
                  <span>
                    Role:{" "}
                    <code>{createdUserRecord.role || resolvedRoleName}</code>
                  </span>
                  <span>
                    Status:{" "}
                    <strong className="status-active">Active (Linked)</strong>
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              className="btn-jump-to-profile"
              onClick={handleScrollToProfile}
            >
              Go to Profile Form ⬇
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="quick-user-error-alert">
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* User Creation Form */}
        <form onSubmit={handleCreateUser} className="quick-user-form">
          <div
            className={`quick-user-grid ${isNonTeaching ? "grid-4-cols" : ""}`}
          >
            {/* Username Input */}
            <div className="quick-field">
              <label htmlFor="quick-username">
                Username / Email <span>*</span>
              </label>
              <input
                id="quick-username"
                type="text"
                placeholder={`e.g. ${displayType
                  .toLowerCase()
                  .replace(/\s+/g, "")}.john or email@domain.com`}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading || resolvingMeta}
                autoComplete="off"
                required
              />
              <small className="field-hint">
                This will be used for logging into the portal.
              </small>
            </div>

            {/* Non-Teaching Staff Role Dropdown */}
            {isNonTeaching && (
              <div className="quick-field">
                <label htmlFor="quick-staff-role">
                  Staff Role <span>*</span>
                </label>
                <select
                  id="quick-staff-role"
                  value={selectedRoleId}
                  onChange={(e) => setSelectedRoleId(e.target.value)}
                  disabled={loading || resolvingMeta}
                  required
                >
                  <option value="">
                    {resolvingMeta
                      ? "Loading staff roles..."
                      : nonTeachingRoles.length === 0
                        ? "No staff roles found"
                        : "Select Staff Role"}
                  </option>
                  {nonTeachingRoles.map((role, idx) => {
                    const rId = getRoleId(role);
                    const rName = getRoleName(role);
                    return (
                      <option key={`${rId}-${idx}`} value={rId}>
                        {rName}
                      </option>
                    );
                  })}
                </select>
                <small className="field-hint">
                  Only non-teaching staff roles are shown.
                </small>
              </div>
            )}

            {/* Password Input */}
            <div className="quick-field">
              <label htmlFor="quick-password">
                Password <span>*</span>
              </label>
              <div className="password-input-group">
                <input
                  id="quick-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter secure password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading || resolvingMeta}
                  autoComplete="new-password"
                  required
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
              <small className="field-hint">
                Min. 6 alphanumeric characters.
              </small>
            </div>

            {/* Confirm Password Input */}
            <div className="quick-field">
              <label htmlFor="quick-confirm-password">Confirm Password</label>
              <input
                id="quick-confirm-password"
                type={showPassword ? "text" : "password"}
                placeholder="Re-type password to verify"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading || resolvingMeta}
                autoComplete="new-password"
              />
              <small className="field-hint">Optional verification check.</small>
            </div>
          </div>

          {/* Form Actions */}
          <div className="quick-user-actions">
            <button
              type="submit"
              className="btn-create-user-submit"
              disabled={loading || resolvingMeta}
            >
              {loading ? (
                <span>⏳ Creating Account...</span>
              ) : (
                <span>➕ Create {displayType} User & Proceed ➔</span>
              )}
            </button>

            <button
              type="button"
              className="btn-skip-to-profile"
              onClick={handleScrollToProfile}
              title="Skip this step if the user account already exists in the system"
            >
              Skip to Profile Details (If Account Already Exists) ⬇
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuickRegisterUserCard;
