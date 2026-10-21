import { useEffect, useState } from "react";

import {
  getUserByName,
  getUserTypeDropdown,
  getRoleDropdown,
} from "../../../Services/userService";
import {
  isAdminRole,
  isSuperAdminRecord,
  isOperatorRole,
  isRestrictedForOperator,
  getUsername,
} from "../../../Utils/auth";

import "./GetUserByName.css";

const GetUserByName = () => {
  const [name, setName] = useState("");
  const [user, setUser] = useState(null);
  const [userTypes, setUserTypes] = useState([]);
  const [roles, setRoles] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD USER TYPES + ROLES
  // =====================================================

  useEffect(() => {
    const loadDropdowns = async () => {
      try {
        setLoadingTypes(true);

        const [typeResponse, roleResponse] = await Promise.all([
          getUserTypeDropdown(),
          getRoleDropdown(),
        ]);

        setUserTypes(
          Array.isArray(typeResponse) ? typeResponse : typeResponse?.data || [],
        );
        setRoles(
          Array.isArray(roleResponse) ? roleResponse : roleResponse?.data || [],
        );
      } catch (err) {
        console.error("Failed to load dropdowns:", err);
      } finally {
        setLoadingTypes(false);
      }
    };

    loadDropdowns();
  }, []);

  // =====================================================
  // GET USER TYPE NAME
  // =====================================================

  const getUserTypeName = (userTypeId, targetUser = null) => {
    if (targetUser) {
      if (
        typeof targetUser.userTypeName === "string" &&
        targetUser.userTypeName.trim()
      )
        return targetUser.userTypeName.trim();
      if (
        typeof targetUser.UserTypeName === "string" &&
        targetUser.UserTypeName.trim()
      )
        return targetUser.UserTypeName.trim();
      if (
        typeof targetUser.userType === "string" &&
        targetUser.userType.trim() &&
        isNaN(targetUser.userType)
      )
        return targetUser.userType.trim();
      if (
        typeof targetUser.UserType === "string" &&
        targetUser.UserType.trim() &&
        isNaN(targetUser.UserType)
      )
        return targetUser.UserType.trim();
    }

    const typeId =
      userTypeId ??
      targetUser?.userTypeId ??
      targetUser?.UserTypeId ??
      targetUser?.typeId ??
      targetUser?.TypeId;
    if (typeId === null || typeId === undefined || typeId === "") {
      return "N/A";
    }

    const userType = userTypes.find(
      (item) =>
        String(
          item.id ??
            item.Id ??
            item.code ??
            item.Code ??
            item.value ??
            item.Value,
        ) === String(typeId),
    );

    return (
      userType?.text ||
      userType?.Text ||
      userType?.name ||
      userType?.Name ||
      (String(typeId) === "5"
        ? "Student"
        : String(typeId) === "3"
          ? "Teacher"
          : String(typeId) === "4"
            ? "Non Teaching Staff"
            : String(typeId) === "1"
              ? "Super Admin"
              : String(typeId) === "2"
                ? "Admin"
                : "N/A")
    );
  };

  // =====================================================
  // GET ROLE NAME(S)
  // =====================================================

  const getRoleNames = (roleIds, targetUser = null) => {
    if (targetUser) {
      if (typeof targetUser.role === "string" && targetUser.role.trim())
        return targetUser.role.trim();
      if (typeof targetUser.Role === "string" && targetUser.Role.trim())
        return targetUser.Role.trim();
      if (typeof targetUser.roleName === "string" && targetUser.roleName.trim())
        return targetUser.roleName.trim();
      if (typeof targetUser.RoleName === "string" && targetUser.RoleName.trim())
        return targetUser.RoleName.trim();
      if (
        Array.isArray(targetUser.roleNames) &&
        targetUser.roleNames.length > 0
      )
        return targetUser.roleNames.join(", ");
      if (
        Array.isArray(targetUser.RoleNames) &&
        targetUser.RoleNames.length > 0
      )
        return targetUser.RoleNames.join(", ");
      if (Array.isArray(targetUser.roles) && targetUser.roles.length > 0) {
        const names = targetUser.roles
          .map((r) =>
            typeof r === "string" ? r : r?.name || r?.text || r?.roleName || "",
          )
          .filter(Boolean);
        if (names.length > 0) return names.join(", ");
      }
      if (Array.isArray(targetUser.Roles) && targetUser.Roles.length > 0) {
        const names = targetUser.Roles.map((r) =>
          typeof r === "string" ? r : r?.name || r?.text || r?.roleName || "",
        ).filter(Boolean);
        if (names.length > 0) return names.join(", ");
      }
    }

    const rawIds =
      roleIds ??
      targetUser?.roleIds ??
      targetUser?.RoleIds ??
      targetUser?.roleId ??
      targetUser?.RoleId;
    if (!rawIds) {
      const uTypeId = targetUser?.userTypeId ?? targetUser?.UserTypeId;
      if (String(uTypeId) === "5") return "Student";
      if (String(uTypeId) === "3") return "Teacher";
      return "Not Assigned";
    }

    const ids = Array.isArray(rawIds) ? rawIds : [rawIds];
    if (ids.length === 0) {
      const uTypeId = targetUser?.userTypeId ?? targetUser?.UserTypeId;
      if (String(uTypeId) === "5") return "Student";
      if (String(uTypeId) === "3") return "Teacher";
      return "Not Assigned";
    }

    const matched = ids
      .map((roleId) => {
        const found = roles.find(
          (r) =>
            String(r.id ?? r.Id ?? r.code ?? r.Code ?? r.value ?? r.Value) ===
            String(roleId),
        );
        return (
          found?.text ||
          found?.Text ||
          found?.name ||
          found?.Name ||
          (String(roleId) === "5"
            ? "Student"
            : String(roleId) === "3"
              ? "Teacher"
              : String(roleId) === "4"
                ? "Other Non Teaching Staff"
                : String(roleId) === "6"
                  ? "Operator"
                  : String(roleId) === "7"
                    ? "Office Staff"
                    : `Role #${roleId}`)
        );
      })
      .filter(Boolean);

    return matched.length > 0 ? matched.join(", ") : "Not Assigned";
  };

  // =====================================================
  // SEARCH USER
  // =====================================================

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Please enter username.");
      setUser(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setUser(null);

      const response = await getUserByName(name.trim());
      const fetchedUser =
        response &&
        typeof response === "object" &&
        !Array.isArray(response) &&
        response.data !== undefined
          ? response.data
          : response;

      if (
        !fetchedUser ||
        (typeof fetchedUser === "object" &&
          Object.keys(fetchedUser).length === 0)
      ) {
        setError("User not found.");
        return;
      }

      // Check if logged-in user is Operator and target is restricted
      if (
        isOperatorRole() &&
        isRestrictedForOperator(fetchedUser, getUsername(), roles, userTypes)
      ) {
        setError("User not found.");
        setUser(null);
        return;
      }

      // Check if logged-in user is Admin and target is Super Admin
      if (isAdminRole() && isSuperAdminRecord(fetchedUser, roles, userTypes)) {
        setError(
          "Access Denied: You do not have permission to view Super Admin records.",
        );
        setUser(null);
        return;
      }

      setUser(fetchedUser);
    } catch (err) {
      setError(err.message || "User not found.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="get-user-name-page">
      <div className="get-user-name-card">
        {/* HEADER */}
        <h1>Find User By Name</h1>
        <p>Search a user using username.</p>

        {/* SEARCH FORM */}
        <form className="get-user-name-form" onSubmit={handleSearch}>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter username"
          />

          <button type="submit" disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </form>

        {/* ERROR */}
        {error && <div className="get-user-name-error">{error}</div>}

        {/* USER DETAILS */}
        {user && (
          <div className="get-user-name-result">
            <h2>User Details</h2>

            {/* USER ID */}
            <div className="get-user-name-row">
              <strong>User ID</strong>
              <span>{user.id || user.Id || "N/A"}</span>
            </div>

            {/* USERNAME */}
            <div className="get-user-name-row">
              <strong>Username</strong>
              <span>{user.username || user.Username || "N/A"}</span>
            </div>

            {/* USER TYPE */}
            <div className="get-user-name-row">
              <strong>User Type</strong>
              <span>
                {loadingTypes
                  ? "Loading..."
                  : getUserTypeName(user.userTypeId ?? user.UserTypeId, user)}
              </span>
            </div>

            {/* ROLE */}
            <div className="get-user-name-row">
              <strong>Assigned Role</strong>
              <span>
                <span className="user-role-badge">
                  {loadingTypes
                    ? "Loading..."
                    : getRoleNames(user.roleIds ?? user.RoleIds, user)}
                </span>
              </span>
            </div>

            {/* STATUS */}
            <div className="get-user-name-row">
              <strong>Status</strong>
              <span
                className={
                  (user.isActive ?? user.IsActive)
                    ? "user-name-status-active"
                    : "user-name-status-inactive"
                }
              >
                {(user.isActive ?? user.IsActive) ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GetUserByName;
