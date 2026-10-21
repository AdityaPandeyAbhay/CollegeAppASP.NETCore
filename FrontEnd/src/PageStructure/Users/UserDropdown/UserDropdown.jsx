import { useEffect, useState } from "react";

import { getUserDropdown } from "../../../Services/userService";
import {
  isAdminRole,
  isOperatorRole,
  isRestrictedForOperator,
  isSuperAdminRecord,
  getUsername,
} from "../../../Utils/auth";

import "./UserDropdown.css";

const UserDropdown = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUserDropdown();
      let rawUsers = response?.data || [];
      const loggedInUsername = getUsername();

      if (isOperatorRole()) {
        rawUsers = rawUsers.filter(
          (u) => !isRestrictedForOperator(u, loggedInUsername, [], []),
        );
      } else if (isAdminRole()) {
        rawUsers = rawUsers.filter((u) => !isSuperAdminRecord(u, [], []));
      }

      setUsers(rawUsers);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="user-dropdown-page">
      <div className="user-dropdown-card">
        <h1>User Dropdown</h1>

        <p>Select a user.</p>

        {error && <div className="user-dropdown-error">{error}</div>}

        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          disabled={loading}
        >
          <option value="">
            {loading ? "Loading users..." : "Select User"}
          </option>

          {users.map((user) => (
            <option key={user.id || user.code} value={user.id || user.code}>
              {user.text}
            </option>
          ))}
        </select>

        {selectedUser && (
          <p className="selected-user">User selected successfully.</p>
        )}
      </div>
    </div>
  );
};

export default UserDropdown;
