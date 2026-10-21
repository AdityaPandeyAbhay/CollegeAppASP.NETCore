import { useEffect, useState } from "react";

import {
  getUserTypeDropdown,
  getRoleDropdown,
  getUserDropdown,
  getUserDropdownByUserType,
  getUserDropdownByRole,
  getUserById,
  deleteUser,
} from "../../../Services/userService";
import {
  isAdminRole,
  isSuperAdminRecord,
  isOperatorRole,
  isRestrictedForOperator,
  getUsername,
} from "../../../Utils/auth";

import "./DeleteUser.css";

const DeleteUser = () => {
  // =====================================================
  // STATES
  // =====================================================

  const [userTypes, setUserTypes] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [users, setUsers] = useState([]);

  const [selectedUserType, setSelectedUserType] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState("");
  const [searchId, setSearchId] = useState("");

  const [selectedUser, setSelectedUser] = useState(null);

  const [loadingTypes, setLoadingTypes] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // =====================================================
  // LOAD DROPDOWNS ON MOUNT
  // =====================================================

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      setLoadingTypes(true);
      setError("");

      const [typeResponse, roleResponse, userResponse] = await Promise.all([
        getUserTypeDropdown().catch(() => ({ data: [] })),
        getRoleDropdown().catch(() => ({ data: [] })),
        getUserDropdown().catch(() => ({ data: [] })),
      ]);

      let rawTypes = Array.isArray(typeResponse)
        ? typeResponse
        : typeResponse?.data || [];
      let rawRoles = Array.isArray(roleResponse)
        ? roleResponse
        : roleResponse?.data || [];
      let rawUsers = Array.isArray(userResponse)
        ? userResponse
        : userResponse?.data || [];

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
      setUsers(rawUsers);
    } catch (err) {
      setError(err?.message || "Failed to load dropdowns.");
    } finally {
      setLoadingTypes(false);
    }
  };

  // =====================================================
  // GET HELPER NAMES
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
      setError("");
      setMessage("");
      setSelectedUser(null);

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

      // Safeguard: Operator cannot see/delete Admin, Super Admin, or Operator
      if (
        isOperatorRole() &&
        isRestrictedForOperator(user, getUsername(), roles, userTypes)
      ) {
        setError("User not found.");
        setSelectedUser(null);
        setSelectedUserId("");
        return;
      }

      // Safeguard: deny Admin from viewing/deleting Super Admin
      if (isAdminRole() && isSuperAdminRecord(user, roles, userTypes)) {
        setError(
          "Access Denied: Super Admin accounts cannot be viewed or deleted by Admin.",
        );
        setSelectedUser(null);
        setSelectedUserId("");
        return;
      }

      setSelectedUser(user);
      setSelectedUserId(user.id || user.Id || cleanId);
      setSearchId(user.id || user.Id || cleanId);
    } catch (err) {
      setError(err?.message || "Failed to load user details.");
    } finally {
      setLoadingSearch(false);
    }
  };

  // =====================================================
  // USER TYPE FILTER CHANGE
  // =====================================================

  const handleUserTypeChange = async (e) => {
    const userTypeId = e.target.value;

    setSelectedUserType(userTypeId);
    setSelectedRole("");
    setSelectedUserId("");
    setSelectedUser(null);
    setError("");
    setMessage("");

    if (!userTypeId) {
      setIsFilterActive(false);
      setUsers(allUsers);
      return;
    }

    try {
      setLoadingUsers(true);
      setIsFilterActive(true);

      const response = await getUserDropdownByUserType(Number(userTypeId));
      let userList = Array.isArray(response) ? response : response?.data || [];
      const loggedInUsername = getUsername();

      if (isOperatorRole()) {
        userList = userList.filter(
          (u) =>
            !isRestrictedForOperator(u, loggedInUsername, roles, userTypes),
        );
      } else if (isAdminRole()) {
        userList = userList.filter(
          (u) => !isSuperAdminRecord(u, roles, userTypes),
        );
      }

      setUsers(userList);
    } catch (err) {
      console.error("Filter User Type Error:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // =====================================================
  // ROLE FILTER CHANGE
  // =====================================================

  const handleRoleChange = async (e) => {
    const roleId = e.target.value;

    setSelectedRole(roleId);
    setSelectedUserType("");
    setSelectedUserId("");
    setSelectedUser(null);
    setError("");
    setMessage("");

    if (!roleId) {
      setIsFilterActive(false);
      setUsers(allUsers);
      return;
    }

    try {
      setLoadingUsers(true);
      setIsFilterActive(true);

      const response = await getUserDropdownByRole(Number(roleId));
      let userList = Array.isArray(response) ? response : response?.data || [];
      const loggedInUsername = getUsername();

      if (isOperatorRole()) {
        userList = userList.filter(
          (u) =>
            !isRestrictedForOperator(u, loggedInUsername, roles, userTypes),
        );
      } else if (isAdminRole()) {
        userList = userList.filter(
          (u) => !isSuperAdminRecord(u, roles, userTypes),
        );
      }

      setUsers(userList);
    } catch (err) {
      console.error("Filter Role Error:", err);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const handleClearFilters = () => {
    setSelectedUserType("");
    setSelectedRole("");
    setIsFilterActive(false);
    setUsers(allUsers);
    setSelectedUserId("");
    setSelectedUser(null);
    setMessage("");
    setError("");
  };

  // =====================================================
  // DIRECT USER DROPDOWN SELECT
  // =====================================================

  const handleUserSelect = (e) => {
    const id = e.target.value;

    setSelectedUserId(id);
    setSearchId(id);
    setError("");
    setMessage("");

    if (id) {
      loadUserData(id);
    } else {
      setSelectedUser(null);
    }
  };

  // =====================================================
  // MANUAL SEARCH HANDLER
  // =====================================================

  const handleSearch = () => {
    loadUserData(searchId);
  };

  // =====================================================
  // RELOAD USERS AFTER ACTION
  // =====================================================

  const reloadUserList = async () => {
    try {
      const userResponse = await getUserDropdown().catch(() => ({ data: [] }));
      let rawUsers = Array.isArray(userResponse)
        ? userResponse
        : userResponse?.data || [];
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

      if (selectedUserType) {
        const response = await getUserDropdownByUserType(
          Number(selectedUserType),
        );
        let userList = Array.isArray(response)
          ? response
          : response?.data || [];
        if (isOperatorRole()) {
          userList = userList.filter(
            (u) =>
              !isRestrictedForOperator(u, loggedInUsername, roles, userTypes),
          );
        } else if (isAdminRole()) {
          userList = userList.filter(
            (u) => !isSuperAdminRecord(u, roles, userTypes),
          );
        }
        setUsers(userList);
      } else if (selectedRole) {
        const response = await getUserDropdownByRole(Number(selectedRole));
        let userList = Array.isArray(response)
          ? response
          : response?.data || [];
        if (isOperatorRole()) {
          userList = userList.filter(
            (u) =>
              !isRestrictedForOperator(u, loggedInUsername, roles, userTypes),
          );
        } else if (isAdminRole()) {
          userList = userList.filter(
            (u) => !isSuperAdminRecord(u, roles, userTypes),
          );
        }
        setUsers(userList);
      } else {
        setUsers(rawUsers);
      }
    } catch (err) {
      console.error("Reload error:", err);
    }
  };

  // =====================================================
  // DELETE USER
  // =====================================================

  const handleDelete = async () => {
    if (!selectedUserId) {
      setError("Please select a user.");
      return;
    }

    if (
      isOperatorRole() &&
      isRestrictedForOperator(selectedUser, getUsername(), roles, userTypes)
    ) {
      setError(
        "Access Denied: Operators cannot delete Admin, Super Admin, or Operator accounts.",
      );
      return;
    }

    if (isAdminRole() && isSuperAdminRecord(selectedUser, roles, userTypes)) {
      setError(
        "Access Denied: Super Admin accounts cannot be deleted by Admin.",
      );
      return;
    }

    const usernameDisplay =
      selectedUser?.username || selectedUser?.Username || selectedUserId;
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete user "${usernameDisplay}" (ID: #${selectedUserId})?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setLoadingDelete(true);
      setError("");
      setMessage("");

      await deleteUser(selectedUserId);

      setMessage(`User "${usernameDisplay}" has been deleted successfully.`);

      // Reset selection
      setSelectedUser(null);
      setSelectedUserId("");
      setSearchId("");

      // Reload dropdown list
      await reloadUserList();
    } catch (err) {
      setError(err?.message || "Failed to delete user.");
    } finally {
      setLoadingDelete(false);
    }
  };

  const rawRoleIds = selectedUser
    ? Array.isArray(selectedUser.roleIds ?? selectedUser.RoleIds)
      ? (selectedUser.roleIds ?? selectedUser.RoleIds)
      : (selectedUser.roleIds ?? selectedUser.RoleIds)
        ? [selectedUser.roleIds ?? selectedUser.RoleIds]
        : []
    : [];

  const assignedRoleName =
    rawRoleIds.length > 0 ? getRoleName(rawRoleIds[0]) : "Not Assigned";

  const assignedUserTypeName = selectedUser
    ? getUserTypeName(selectedUser.userTypeId ?? selectedUser.UserTypeId)
    : "N/A";

  return (
    <div className="delete-user-page">
      <div className="delete-user-card">
        {/* HEADER */}
        <div className="delete-user-header">
          <h1>Delete User</h1>
          <p>
            Select a user from the list or filter by type/role to remove them
            from the system.
          </p>
        </div>

        {/* CONTROLS */}
        <div className="delete-user-controls">
          {/* USER SELECTION DROPDOWN */}
          <div className="delete-user-field">
            <label>
              Select User to Delete:
              {isFilterActive && selectedUserType && (
                <span className="delete-filter-badge">
                  Filtered by User Type: {getUserTypeName(selectedUserType)} (
                  {users.length})
                </span>
              )}
              {isFilterActive && selectedRole && (
                <span className="delete-filter-badge">
                  Filtered by Role: {getRoleName(selectedRole)} ({users.length})
                </span>
              )}
            </label>
            <select
              value={selectedUserId}
              onChange={handleUserSelect}
              disabled={loadingTypes || loadingUsers || loadingSearch}
            >
              <option value="">
                {loadingTypes || loadingUsers
                  ? "Loading users..."
                  : isFilterActive
                    ? users.length > 0
                      ? `-- Select from ${users.length} filtered users --`
                      : "-- No users found for this filter (0) --"
                    : `-- Select User directly (${allUsers.length} available) --`}
              </option>
              {users.map((u) => {
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

          <div className="delete-user-divider">
            <span>Filter or Search User</span>
          </div>

          <div className="delete-user-filter-grid">
            {/* USER TYPE DROPDOWN */}
            <div className="delete-user-field">
              <label>Filter by User Type</label>
              <select
                value={selectedUserType}
                onChange={handleUserTypeChange}
                disabled={loadingTypes || loadingUsers}
              >
                <option value="">-- All User Types --</option>
                {userTypes.map((type) => (
                  <option key={type.id ?? type.Id} value={type.id ?? type.Id}>
                    {type.text || type.Text || type.name || type.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* ROLE DROPDOWN */}
            <div className="delete-user-field">
              <label>Filter by Role</label>
              <select
                value={selectedRole}
                onChange={handleRoleChange}
                disabled={loadingTypes || loadingUsers}
              >
                <option value="">-- All Roles --</option>
                {roles.map((r) => (
                  <option key={r.id ?? r.Id} value={r.id ?? r.Id}>
                    {r.text || r.Text || r.name || r.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* SEARCH BY ID */}
            <div className="delete-user-field">
              <label>Search by User ID</label>
              <div className="delete-user-search-box">
                <input
                  type="text"
                  placeholder="Enter User ID..."
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSearch();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSearch}
                  disabled={loadingSearch || !searchId.trim()}
                >
                  {loadingSearch ? "..." : "Search"}
                </button>
              </div>
            </div>
          </div>

          {isFilterActive && (
            <div className="delete-filter-clear-wrapper">
              <button
                type="button"
                className="delete-clear-filter-btn"
                onClick={handleClearFilters}
              >
                ✕ Clear Active Filters (Show All Users)
              </button>
            </div>
          )}
        </div>

        {/* MESSAGES */}
        {message && <div className="delete-user-success">{message}</div>}
        {error && <div className="delete-user-error">{error}</div>}

        {/* SELECTED USER DETAILS */}
        {selectedUser && (
          <div className="delete-user-details-card">
            <h2>User Details to be Deleted</h2>

            <div className="delete-user-row">
              <strong>User ID:</strong>
              <span>#{selectedUser.id || selectedUser.Id || "N/A"}</span>
            </div>

            <div className="delete-user-row">
              <strong>Username (Login):</strong>
              <span>
                {selectedUser.username || selectedUser.Username || "N/A"}
              </span>
            </div>

            <div className="delete-user-row">
              <strong>User Type:</strong>
              <span>{assignedUserTypeName}</span>
            </div>

            <div className="delete-user-row">
              <strong>System Role:</strong>
              <span>{assignedRoleName}</span>
            </div>

            <div className="delete-user-row">
              <strong>Account Status:</strong>
              <span
                className={
                  (selectedUser.isActive ?? selectedUser.IsActive)
                    ? "status-active"
                    : "status-inactive"
                }
              >
                {(selectedUser.isActive ?? selectedUser.IsActive)
                  ? "Active"
                  : "Inactive"}
              </span>
            </div>

            <div className="delete-user-action-row">
              <button
                type="button"
                className="delete-user-btn"
                onClick={handleDelete}
                disabled={loadingDelete}
              >
                {loadingDelete ? "Deleting..." : "Confirm & Delete User"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeleteUser;
