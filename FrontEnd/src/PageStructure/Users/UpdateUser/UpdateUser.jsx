import { useEffect, useState } from "react";

import {
  getUserDropdown,
  getUserDropdownByUserType,
  getUserDropdownByRole,
  getRoleDropdown,
  getUserTypeDropdown,
  getUserById,
  updateUser,
} from "../../../Services/userService";
import {
  isAdminRole,
  isSuperAdminRecord,
  isOperatorRole,
  isRestrictedForOperator,
  getUsername,
} from "../../../Utils/auth";

import "./UpdateUser.css";

const UpdateUser = () => {
  // =====================================================
  // STATES
  // =====================================================

  const [userTypes, setUserTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchId, setSearchId] = useState("");

  const [initialRoleName, setInitialRoleName] = useState("N/A");

  const [formData, setFormData] = useState({
    id: "",
    username: "",
    userTypeId: "",
    roleIds: [],
    isActive: true,
  });

  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingFilteredUsers, setLoadingFilteredUsers] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingUpdate, setLoadingUpdate] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD USER TYPES + ROLES + ALL USERS DROPDOWN
  // =====================================================

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      setLoadingTypes(true);
      setError("");

      const [userTypeResponse, roleResponse, userDropdownResponse] =
        await Promise.all([
          getUserTypeDropdown().catch(() => ({ data: [] })),
          getRoleDropdown().catch(() => ({ data: [] })),
          getUserDropdown().catch(() => ({ data: [] })),
        ]);

      let rawTypes = Array.isArray(userTypeResponse)
        ? userTypeResponse
        : userTypeResponse?.data || [];
      let rawRoles = Array.isArray(roleResponse)
        ? roleResponse
        : roleResponse?.data || [];
      let rawUsers = Array.isArray(userDropdownResponse)
        ? userDropdownResponse
        : userDropdownResponse?.data || [];

      const loggedInUsername = getUsername();

      if (isOperatorRole()) {
        rawRoles = rawRoles.filter((r) => {
          const name = String(r.text || r.Text || r.name || r.Name || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
          return (
            name !== "admin" && name !== "superadmin" && name !== "operator"
          );
        });

        rawTypes = rawTypes.filter((t) => {
          const name = String(t.text || t.Text || t.name || t.Name || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
          return (
            name !== "admin" && name !== "superadmin" && name !== "operator"
          );
        });

        rawUsers = rawUsers.filter(
          (u) =>
            !isRestrictedForOperator(u, loggedInUsername, rawRoles, rawTypes),
        );
      } else if (isAdminRole()) {
        rawRoles = rawRoles.filter((r) => {
          const name = String(r.text || r.Text || r.name || r.Name || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
          return name !== "admin" && name !== "superadmin";
        });

        rawTypes = rawTypes.filter((t) => {
          const name = String(t.text || t.Text || t.name || t.Name || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
          return name !== "admin" && name !== "superadmin";
        });

        rawUsers = rawUsers.filter(
          (u) => !isSuperAdminRecord(u, rawRoles, rawTypes),
        );
      }

      setUserTypes(rawTypes);
      setRoles(rawRoles);
      setAllUsers(rawUsers);
    } catch (err) {
      console.error("Dropdown Error:", err);
      setError(err?.message || "Failed to load dropdown data.");
    } finally {
      setLoadingTypes(false);
    }
  };

  // =====================================================
  // GET ROLE NAME
  // =====================================================

  const getRoleName = (roleId) => {
    if (!roleId) return "Not Assigned";
    const role = roles.find(
      (item) =>
        String(
          item.id ??
            item.Id ??
            item.code ??
            item.Code ??
            item.value ??
            item.Value,
        ) === String(roleId),
    );
    return (
      role?.text ||
      role?.Text ||
      role?.name ||
      role?.Name ||
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
  };

  // =====================================================
  // GET USER TYPE NAME
  // =====================================================

  const getUserTypeName = (userTypeId) => {
    if (!userTypeId) return "N/A";
    const userType = userTypes.find(
      (item) =>
        String(
          item.id ??
            item.Id ??
            item.code ??
            item.Code ??
            item.value ??
            item.Value,
        ) === String(userTypeId),
    );
    return (
      userType?.text ||
      userType?.Text ||
      userType?.name ||
      userType?.Name ||
      (String(userTypeId) === "5"
        ? "Student"
        : String(userTypeId) === "3"
          ? "Teacher"
          : String(userTypeId) === "4"
            ? "Non Teaching Staff"
            : String(userTypeId) === "1"
              ? "Super Admin"
              : String(userTypeId) === "2"
                ? "Admin"
                : "N/A")
    );
  };

  // =====================================================
  // LOAD USER DATA BY ID
  // =====================================================

  const loadUserData = async (targetId) => {
    const cleanId = String(targetId || "").trim();

    if (!cleanId) {
      setError("Please select a user or enter User ID.");
      return;
    }

    try {
      setLoadingSearch(true);
      setMessage("");
      setError("");

      const response = await getUserById(cleanId);
      const user =
        response &&
        typeof response === "object" &&
        !Array.isArray(response) &&
        response.data !== undefined
          ? response.data
          : response;

      if (
        !user ||
        (typeof user === "object" && Object.keys(user).length === 0)
      ) {
        setError("User not found.");
        return;
      }

      // Safeguard: Check if logged-in user is Operator and target is restricted
      if (
        isOperatorRole() &&
        isRestrictedForOperator(user, getUsername(), roles, userTypes)
      ) {
        setError("User not found.");
        setFormData({
          id: "",
          username: "",
          userTypeId: "",
          roleIds: [],
          isActive: true,
        });
        setSelectedUserId("");
        setInitialRoleName("N/A");
        return;
      }

      // Safeguard: Check if logged-in user is Admin and target is Super Admin
      if (isAdminRole() && isSuperAdminRecord(user, roles, userTypes)) {
        setError(
          "Access Denied: Super Admin accounts cannot be viewed or edited by Admin.",
        );
        setFormData({
          id: "",
          username: "",
          userTypeId: "",
          roleIds: [],
          isActive: true,
        });
        setSelectedUserId("");
        setInitialRoleName("N/A");
        return;
      }

      const rawRoleIds = Array.isArray(user.roleIds ?? user.RoleIds)
        ? (user.roleIds ?? user.RoleIds)
        : (user.roleIds ?? user.RoleIds)
          ? [user.roleIds ?? user.RoleIds]
          : [];

      const parsedRoleIds = rawRoleIds
        .map((r) => Number(r))
        .filter((r) => !isNaN(r) && r > 0);

      setFormData({
        id: user.id || user.Id || cleanId,
        username: user.username || user.Username || "",
        userTypeId:
          (user.userTypeId ?? user.UserTypeId) != null
            ? String(user.userTypeId ?? user.UserTypeId)
            : "",
        roleIds: parsedRoleIds,
        isActive: user.isActive ?? user.IsActive ?? true,
      });

      setSelectedUserId(user.id || user.Id || cleanId);
      setSearchId(user.id || user.Id || cleanId);

      // Identify Current Assigned Role Name
      if (parsedRoleIds.length > 0) {
        const found = roles.find(
          (r) => Number(r.id ?? r.Id) === Number(parsedRoleIds[0]),
        );
        setInitialRoleName(
          found?.text || found?.Text || `Role #${parsedRoleIds[0]}`,
        );
      } else {
        setInitialRoleName("Not Assigned");
      }
    } catch (err) {
      console.error("Load User Error:", err);
      setError(err?.message || "Failed to load user details.");
    } finally {
      setLoadingSearch(false);
    }
  };

  // =====================================================
  // DIRECT USER DROPDOWN SELECT
  // =====================================================

  const handleUserSelect = (e) => {
    const id = e.target.value;
    setSelectedUserId(id);
    setSearchId(id);
    setMessage("");
    setError("");

    if (id) {
      loadUserData(id);
    } else {
      setFormData({
        id: "",
        username: "",
        userTypeId: "",
        roleIds: [],
        isActive: true,
      });
      setInitialRoleName("N/A");
    }
  };

  // =====================================================
  // USER TYPE FILTER CHANGE
  // =====================================================

  const handleUserTypeChange = async (e) => {
    const userTypeId = e.target.value;

    setSelectedUserType(userTypeId);
    setSelectedRole(""); // Clear role filter when user type is chosen
    setMessage("");
    setError("");

    if (!userTypeId) {
      setIsFilterActive(false);
      setFilteredUsers([]);
      return;
    }

    try {
      setLoadingFilteredUsers(true);
      setIsFilterActive(true);

      const response = await getUserDropdownByUserType(Number(userTypeId));
      let rawFiltered = Array.isArray(response)
        ? response
        : response?.data || [];
      const loggedInUsername = getUsername();

      if (isOperatorRole()) {
        rawFiltered = rawFiltered.filter(
          (u) =>
            !isRestrictedForOperator(u, loggedInUsername, roles, userTypes),
        );
      } else if (isAdminRole()) {
        rawFiltered = rawFiltered.filter(
          (u) => !isSuperAdminRecord(u, roles, userTypes),
        );
      }
      setFilteredUsers(rawFiltered);
    } catch (err) {
      console.error("Filter User Error:", err);
      setFilteredUsers([]);
    } finally {
      setLoadingFilteredUsers(false);
    }
  };

  // =====================================================
  // ROLE FILTER CHANGE
  // =====================================================

  const handleRoleFilterChange = async (e) => {
    const roleId = e.target.value;

    setSelectedRole(roleId);
    setSelectedUserType(""); // Clear user type filter when role is chosen
    setMessage("");
    setError("");

    if (!roleId) {
      setIsFilterActive(false);
      setFilteredUsers([]);
      return;
    }

    try {
      setLoadingFilteredUsers(true);
      setIsFilterActive(true);

      const response = await getUserDropdownByRole(Number(roleId));
      let rawFiltered = Array.isArray(response)
        ? response
        : response?.data || [];
      const loggedInUsername = getUsername();

      if (isOperatorRole()) {
        rawFiltered = rawFiltered.filter(
          (u) =>
            !isRestrictedForOperator(u, loggedInUsername, roles, userTypes),
        );
      } else if (isAdminRole()) {
        rawFiltered = rawFiltered.filter(
          (u) => !isSuperAdminRecord(u, roles, userTypes),
        );
      }
      setFilteredUsers(rawFiltered);
    } catch (err) {
      console.error("Filter Role Error:", err);
      setFilteredUsers([]);
    } finally {
      setLoadingFilteredUsers(false);
    }
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const handleClearFilters = () => {
    setSelectedUserType("");
    setSelectedRole("");
    setIsFilterActive(false);
    setFilteredUsers([]);
    setMessage("");
    setError("");
  };

  // =====================================================
  // MANUAL USER ID INPUT
  // =====================================================

  const handleSearchIdChange = (e) => {
    setSearchId(e.target.value);
    setSelectedUserId("");
    setMessage("");
    setError("");
  };

  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // ROLE CHANGE
  // =====================================================

  const handleRoleChange = (e) => {
    const roleId = Number(e.target.value);

    setFormData((previous) => ({
      ...previous,
      roleIds: roleId ? [roleId] : [],
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // ACTIVE CHECKBOX
  // =====================================================

  const handleActiveChange = (e) => {
    setFormData((previous) => ({
      ...previous,
      isActive: e.target.checked,
    }));

    setMessage("");
    setError("");
  };

  // =====================================================
  // UPDATE USER SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (!formData.id) {
      window.alert("Please select a user first.");
      return;
    }

    if (!formData.username.trim()) {
      window.alert("Username is required.");
      return;
    }

    if (!formData.userTypeId) {
      window.alert("User Type is required.");
      return;
    }

    if (!formData.roleIds || formData.roleIds.length === 0) {
      window.alert("Please select a role.");
      return;
    }

    // Role check for Operator
    if (isOperatorRole()) {
      const selectedRoleObj = roles.find(
        (r) => Number(r.id ?? r.Id) === Number(formData.roleIds[0]),
      );
      const roleName = String(
        selectedRoleObj?.text || selectedRoleObj?.Text || "",
      )
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
      if (
        roleName === "admin" ||
        roleName === "superadmin" ||
        roleName === "operator"
      ) {
        setError(
          "Access Denied: Operators cannot assign Admin, Super Admin, or Operator roles.",
        );
        return;
      }
    }

    // Role check for Admin
    if (isAdminRole()) {
      const selectedRoleObj = roles.find(
        (r) => Number(r.id ?? r.Id) === Number(formData.roleIds[0]),
      );
      const roleName = String(
        selectedRoleObj?.text || selectedRoleObj?.Text || "",
      )
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
      if (roleName === "admin" || roleName === "superadmin") {
        setError(
          "Access Denied: Admins cannot assign Admin or Super Admin roles.",
        );
        return;
      }
    }

    const payload = {
      id: formData.id,
      username: formData.username.trim(),
      userTypeId: Number(formData.userTypeId),
      roleIds: formData.roleIds,
      isActive: formData.isActive,
    };

    try {
      setLoadingUpdate(true);

      await updateUser(payload);

      setMessage("User updated successfully!");

      const updatedRole = getRoleName(formData.roleIds[0]);
      setInitialRoleName(updatedRole);

      // Refresh dropdown lists silently
      try {
        const userDropdownResponse = await getUserDropdown();
        let rawUsers = Array.isArray(userDropdownResponse)
          ? userDropdownResponse
          : userDropdownResponse?.data || [];
        const loggedInUsername = getUsername();
        if (isOperatorRole()) {
          rawUsers = rawUsers.filter(
            (u) =>
              !isRestrictedForOperator(u, loggedInUsername, roles, userTypes),
          );
        } else if (isAdminRole()) {
          rawUsers = rawUsers.filter(
            (u) => !isSuperAdminRecord(u, roles, userTypes),
          );
        }
        setAllUsers(rawUsers);
      } catch {
        // ignore background refresh error
      }
    } catch (err) {
      console.error("Update Error:", err);
      setError(err?.message || "Failed to update user.");
    } finally {
      setLoadingUpdate(false);
    }
  };

  const activeUserList = isFilterActive ? filteredUsers : allUsers;

  return (
    <div className="update-user-page">
      <div className="update-user-card">
        {/* ================= HEADER ================= */}
        <div className="update-user-header">
          <h1>Update User Profile</h1>
          <p>
            Select a user from the dropdown or search by User ID to modify their
            details and role.
          </p>
        </div>

        {/* ================= SEARCH & SELECTION SECTION ================= */}
        <div className="update-user-selection-section">
          {/* USER SELECTION DROPDOWN */}
          <div className="update-user-form-group">
            <label>
              Select User to Edit:
              {isFilterActive && selectedUserType && (
                <span className="filter-badge">
                  Filtered by User Type: {getUserTypeName(selectedUserType)} (
                  {filteredUsers.length})
                </span>
              )}
              {isFilterActive && selectedRole && (
                <span className="filter-badge">
                  Filtered by Role: {getRoleName(selectedRole)} (
                  {filteredUsers.length})
                </span>
              )}
            </label>
            <select
              value={selectedUserId}
              onChange={handleUserSelect}
              disabled={loadingTypes || loadingSearch || loadingFilteredUsers}
            >
              <option value="">
                {loadingTypes || loadingFilteredUsers
                  ? "Loading users..."
                  : isFilterActive
                    ? filteredUsers.length > 0
                      ? `-- Select from ${filteredUsers.length} filtered users --`
                      : "-- No users found for this filter (0) --"
                    : `-- Select User directly (${allUsers.length} available) --`}
              </option>
              {activeUserList.map((u) => {
                const uId = u.id || u.Id;
                const uName =
                  u.text ||
                  u.Text ||
                  u.username ||
                  u.Username ||
                  `User #${uId}`;
                return (
                  <option key={uId} value={uId}>
                    {uName} (ID: #{uId})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="update-user-divider">
            <span>Filter or Search User</span>
          </div>

          <div className="update-user-filter-grid">
            {/* OPTIONAL USER TYPE FILTER */}
            <div className="update-user-form-group">
              <label>Filter by User Type:</label>
              <select
                value={selectedUserType}
                onChange={handleUserTypeChange}
                disabled={loadingTypes || loadingFilteredUsers}
              >
                <option value="">-- All User Types --</option>
                {userTypes.map((t) => (
                  <option key={t.id ?? t.Id} value={t.id ?? t.Id}>
                    {t.text || t.Text || t.name || t.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* OPTIONAL ROLE FILTER */}
            <div className="update-user-form-group">
              <label>Filter by Role:</label>
              <select
                value={selectedRole}
                onChange={handleRoleFilterChange}
                disabled={loadingTypes || loadingFilteredUsers}
              >
                <option value="">-- All Roles --</option>
                {roles.map((r) => (
                  <option key={r.id ?? r.Id} value={r.id ?? r.Id}>
                    {r.text || r.Text || r.name || r.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* MANUAL ID SEARCH */}
            <div className="update-user-form-group">
              <label>Search by User ID:</label>
              <div className="search-input-wrapper">
                <input
                  type="text"
                  placeholder="Enter User ID..."
                  value={searchId}
                  onChange={handleSearchIdChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      loadUserData(searchId);
                    }
                  }}
                />
                <button
                  type="button"
                  className="search-btn"
                  onClick={() => loadUserData(searchId)}
                  disabled={loadingSearch || !searchId.trim()}
                >
                  {loadingSearch ? "..." : "Fetch"}
                </button>
              </div>
            </div>
          </div>

          {isFilterActive && (
            <div className="filter-clear-wrapper">
              <button
                type="button"
                className="clear-filter-btn"
                onClick={handleClearFilters}
              >
                ✕ Clear Active Filters (Show All Users)
              </button>
            </div>
          )}
        </div>

        {/* ================= MESSAGES ================= */}
        {message && <div className="update-user-success">{message}</div>}
        {error && <div className="update-user-error">{error}</div>}

        {/* ================= EDIT FORM ================= */}
        {formData.id && (
          <form onSubmit={handleSubmit} className="update-user-form">
            <div className="update-user-summary-bar">
              <span>
                Editing: <strong>{formData.username || "User"}</strong> (ID: #
                {formData.id})
              </span>
              <span
                className={`summary-badge ${
                  formData.isActive ? "badge-active" : "badge-inactive"
                }`}
              >
                {formData.isActive ? "● Active" : "● Inactive"}
              </span>
            </div>

            <div className="update-user-two-col">
              {/* USERNAME */}
              <div className="update-user-form-group">
                <label>Username (Login ID)</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Enter username"
                  required
                />
              </div>

              {/* USER TYPE */}
              <div className="update-user-form-group">
                <label>User Type</label>
                <select
                  name="userTypeId"
                  value={formData.userTypeId}
                  onChange={handleChange}
                  required
                  disabled={loadingTypes}
                >
                  <option value="">-- Select User Type --</option>
                  {userTypes.map((type) => (
                    <option key={type.id ?? type.Id} value={type.id ?? type.Id}>
                      {type.text || type.Text || type.name || type.Name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* ROLE */}
            <div className="update-user-form-group">
              <label>Assigned System Role</label>
              <select
                value={formData.roleIds[0] || ""}
                onChange={handleRoleChange}
                required
                disabled={loadingTypes}
              >
                <option value="">-- Choose Role --</option>
                {roles.map((role) => (
                  <option key={role.id ?? role.Id} value={role.id ?? role.Id}>
                    {role.text || role.Text || role.name || role.Name}
                  </option>
                ))}
              </select>

              <small className="role-helper-text">
                Current Assigned Role: <strong>{initialRoleName}</strong>
                {formData.roleIds[0] &&
                  getRoleName(formData.roleIds[0]) !== initialRoleName && (
                    <span className="role-change-indicator">
                      {" "}
                      ➔ Changing to:{" "}
                      <strong>{getRoleName(formData.roleIds[0])}</strong>
                    </span>
                  )}
              </small>
            </div>

            {/* ACTIVE STATUS TOGGLE */}
            <div className="update-user-checkbox-group">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleActiveChange}
                />
                <span className="checkbox-label">
                  Account is Active (Allow login & system access)
                </span>
              </label>
            </div>

            {/* SUBMIT BUTTON */}
            <button
              type="submit"
              className="update-user-submit-btn"
              disabled={loadingUpdate}
            >
              {loadingUpdate ? "Updating User..." : "Save & Update User"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default UpdateUser;
