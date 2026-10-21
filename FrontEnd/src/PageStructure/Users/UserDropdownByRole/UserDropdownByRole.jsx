import { useEffect, useState } from "react";

import {
  getRoleDropdown,
  getUserDropdownByRole,
} from "../../../Services/userService";
import {
  isAdminRole,
  isOperatorRole,
  isRestrictedForOperator,
  isSuperAdminRecord,
  getUsername,
} from "../../../Utils/auth";

import "./UserDropdownByRole.css";

const UserDropdownByRole = ({
  onUserChange,
  initialRoleId = "",
  initialUserId = "",
}) => {
  const [roles, setRoles] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedRole, setSelectedRole] = useState(initialRoleId);
  const [selectedUser, setSelectedUser] = useState(initialUserId);

  const [loadingRoles, setLoadingRoles] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");

  // =====================================================
  // LOAD ROLES
  // =====================================================

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);
      setError("");

      const response = await getRoleDropdown();
      let rawRoles = response?.data || [];

      if (isOperatorRole()) {
        rawRoles = rawRoles.filter((r) => {
          const name = String(r.text || r.Text || r.name || r.Name || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
          return (
            name !== "admin" && name !== "superadmin" && name !== "operator"
          );
        });
      } else if (isAdminRole()) {
        rawRoles = rawRoles.filter((r) => {
          const name = String(r.text || r.Text || r.name || r.Name || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
          return name !== "admin" && name !== "superadmin";
        });
      }

      setRoles(rawRoles);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Unable to load roles.",
      );
    } finally {
      setLoadingRoles(false);
    }
  };

  // =====================================================
  // LOAD USERS BY ROLE
  // =====================================================

  const loadUsersByRole = async (roleId) => {
    if (!roleId) {
      setUsers([]);
      return;
    }

    try {
      setLoadingUsers(true);
      setError("");

      const response = await getUserDropdownByRole(roleId);
      let rawUsers = response?.data || [];
      const loggedInUsername = getUsername();

      if (isOperatorRole()) {
        rawUsers = rawUsers.filter(
          (u) => !isRestrictedForOperator(u, loggedInUsername, roles, []),
        );
      } else if (isAdminRole()) {
        rawUsers = rawUsers.filter((u) => !isSuperAdminRecord(u, roles, []));
      }

      setUsers(rawUsers);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || "Unable to load users.",
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  // =====================================================
  // ROLE CHANGE
  // =====================================================

  const handleRoleChange = async (e) => {
    const roleId = e.target.value;

    setSelectedRole(roleId);

    setSelectedUser("");

    setUsers([]);

    setError("");

    // Tell parent that user has been cleared
    if (onUserChange) {
      onUserChange("");
    }

    if (!roleId) {
      return;
    }

    await loadUsersByRole(roleId);
  };

  // =====================================================
  // USER CHANGE
  // =====================================================

  const handleUserChange = (e) => {
    const userId = e.target.value;

    setSelectedUser(userId);

    // Send UserId to parent
    if (onUserChange) {
      onUserChange(userId);
    }
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="user-role-dropdown-component">
      {error && <div className="user-role-dropdown-error">{error}</div>}

      {/* =================================================
          ROLE
      ================================================= */}

      <div className="user-role-group">
        <label>Role</label>

        <select
          value={selectedRole}
          onChange={handleRoleChange}
          disabled={loadingRoles}
        >
          <option value="">
            {loadingRoles ? "Loading roles..." : "Select Role"}
          </option>

          {roles.map((role) => (
            <option key={role.id} value={role.id}>
              {role.text}
            </option>
          ))}
        </select>
      </div>

      {/* =================================================
          USER
      ================================================= */}

      {selectedRole && (
        <div className="user-role-group">
          <label>User</label>

          <select
            value={selectedUser}
            onChange={handleUserChange}
            disabled={loadingUsers}
          >
            <option value="">
              {loadingUsers ? "Loading users..." : "Select User"}
            </option>

            {users.map((user) => (
              <option key={user.id || user.code} value={user.code}>
                {user.text}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* =================================================
          NO USERS
      ================================================= */}

      {selectedRole && !loadingUsers && users.length === 0 && (
        <div className="no-role-users">No users found for this role.</div>
      )}
    </div>
  );
};

export default UserDropdownByRole;
