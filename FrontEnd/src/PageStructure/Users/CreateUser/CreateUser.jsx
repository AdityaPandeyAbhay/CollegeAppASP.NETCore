import { useEffect, useState } from "react";

import {
  createUser,
  getRoleDropdown,
  getUserTypeDropdown,
} from "../../../Services/userService";
import {
  isSuperAdminRole,
  isAdminRole,
  isOperatorRole,
} from "../../../Utils/auth";

import "./CreateUser.css";

const CreateUser = () => {
  const [roles, setRoles] = useState([]);
  const [userTypes, setUserTypes] = useState([]);

  const [formData, setFormData] = useState({
    id: "",
    username: "",
    password: "",
    userTypeId: "",
    roleIds: [],
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [loadingDropdown, setLoadingDropdown] = useState(true);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // =====================================================
  // LOAD DROPDOWNS
  // =====================================================

  useEffect(() => {
    loadDropdowns();
  }, []);

  const loadDropdowns = async () => {
    try {
      setLoadingDropdown(true);
      setError("");

      const [roleResponse, userTypeResponse] = await Promise.all([
        getRoleDropdown().catch(() => []),
        getUserTypeDropdown().catch(() => []),
      ]);

      let rawRoles = Array.isArray(roleResponse)
        ? roleResponse
        : roleResponse?.data || roleResponse?.Data || [];
      let rawUserTypes = Array.isArray(userTypeResponse)
        ? userTypeResponse
        : userTypeResponse?.data || userTypeResponse?.Data || [];

      // Fallback defaults if APIs return empty arrays
      if (rawUserTypes.length === 0) {
        rawUserTypes = [
          { id: 3, name: "Teacher", text: "Teacher" },
          { id: 4, name: "Non Teaching Staff", text: "Non Teaching Staff" },
          { id: 5, name: "Student", text: "Student" },
        ];
      }
      if (rawRoles.length === 0) {
        rawRoles = [
          { id: 3, name: "Teacher", text: "Teacher" },
          {
            id: 4,
            name: "Other Non Teaching Staff",
            text: "Other Non Teaching Staff",
          },
          { id: 5, name: "Student", text: "Student" },
          { id: 6, name: "Operator", text: "Operator" },
          { id: 7, name: "Office Staff", text: "Office Staff" },
        ];
      }

      // If logged in as Super Admin: CAN see Admin (and all other roles) on User Create page only
      if (isSuperAdminRole()) {
        rawRoles = rawRoles.filter((r) => {
          const name = String(r.text || r.Text || r.name || r.Name || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
          return name !== "superadmin" && name !== "superamin";
        });

        rawUserTypes = rawUserTypes.filter((t) => {
          const name = String(t.text || t.Text || t.name || t.Name || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
          return name !== "superadmin" && name !== "superamin";
        });
      } else if (isOperatorRole()) {
        // If logged in as Operator: do not allow creating Admin, Super Admin, or Operator
        rawRoles = rawRoles.filter((r) => {
          const name = String(r.text || r.Text || r.name || r.Name || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
          return (
            name !== "admin" &&
            name !== "amin" &&
            name !== "superadmin" &&
            name !== "superamin" &&
            name !== "operator"
          );
        });

        rawUserTypes = rawUserTypes.filter((t) => {
          const name = String(t.text || t.Text || t.name || t.Name || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
          return (
            name !== "admin" &&
            name !== "amin" &&
            name !== "superadmin" &&
            name !== "superamin" &&
            name !== "operator"
          );
        });
      } else {
        // Regular Admin or other roles: cannot see or create Admin or Super Admin
        rawRoles = rawRoles.filter((r) => {
          const name = String(r.text || r.Text || r.name || r.Name || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
          return (
            name !== "admin" &&
            name !== "amin" &&
            name !== "superadmin" &&
            name !== "superamin"
          );
        });

        rawUserTypes = rawUserTypes.filter((t) => {
          const name = String(t.text || t.Text || t.name || t.Name || "")
            .toLowerCase()
            .replace(/[\s_-]+/g, "");
          return (
            name !== "admin" &&
            name !== "amin" &&
            name !== "superadmin" &&
            name !== "superamin"
          );
        });
      }

      setRoles(rawRoles);
      setUserTypes(rawUserTypes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingDropdown(false);
    }
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
  };

  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    if (formData.roleIds.length === 0) {
      setError("Please select a role.");
      return;
    }

    if (!formData.userTypeId) {
      setError("Please select a user type.");
      return;
    }

    if (isSuperAdminRole()) {
      const selectedRole = roles.find(
        (r) => Number(r.id ?? r.Id) === Number(formData.roleIds[0]),
      );
      const roleName = String(selectedRole?.text || selectedRole?.Text || "")
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
      if (roleName === "superadmin" || roleName === "superamin") {
        setError("Access Denied: Super Admin accounts cannot be created here.");
        return;
      }
    } else if (isOperatorRole()) {
      const selectedRole = roles.find(
        (r) => Number(r.id ?? r.Id) === Number(formData.roleIds[0]),
      );
      const roleName = String(selectedRole?.text || selectedRole?.Text || "")
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
      if (
        roleName === "admin" ||
        roleName === "amin" ||
        roleName === "superadmin" ||
        roleName === "superamin" ||
        roleName === "operator"
      ) {
        setError(
          "Access Denied: Operators cannot create Admin, Super Admin, or Operator accounts.",
        );
        return;
      }
    } else {
      const selectedRole = roles.find(
        (r) => Number(r.id ?? r.Id) === Number(formData.roleIds[0]),
      );
      const roleName = String(selectedRole?.text || selectedRole?.Text || "")
        .toLowerCase()
        .replace(/[\s_-]+/g, "");
      if (
        roleName === "admin" ||
        roleName === "amin" ||
        roleName === "superadmin" ||
        roleName === "superamin"
      ) {
        setError("Access Denied: Only Super Admin can create Admin accounts.");
        return;
      }
    }

    try {
      setLoading(true);

      const shortTimestamp = String(Date.now()).slice(-8);
      const generatedId = `USR_${shortTimestamp}`;
      const userData = {
        id: generatedId,
        Id: generatedId,
        username: formData.username.trim(),
        password: formData.password,
        userTypeId: Number(formData.userTypeId),
        roleIds: formData.roleIds,
        isActive: true,
      };

      await createUser(userData);

      setMessage("User created successfully.");

      setFormData({
        id: "",
        username: "",
        password: "",
        userTypeId: "",
        roleIds: [],
        isActive: true,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-user-page">
      <div className="create-user-card">
        {/* HEADER */}
        <div className="create-user-header">
          <h1>Create User</h1>
          <p>Create a new user in the system</p>
        </div>

        {/* MESSAGES */}
        {message && <div className="create-user-success">{message}</div>}
        {error && <div className="create-user-error">{error}</div>}

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="create-user-form"
          autoComplete="off"
        >
          {/* Hidden inputs to trick aggressive browser autofill */}
          <input
            type="text"
            name="prevent_autofill_username"
            id="prevent_autofill_username"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="off"
          />
          <input
            type="password"
            name="prevent_autofill_password"
            id="prevent_autofill_password"
            style={{ display: "none" }}
            tabIndex={-1}
            autoComplete="new-password"
          />

          <div className="create-user-grid">
            {/* USERNAME */}
            <div className="create-user-form-group">
              <label>
                Username (Login ID) <span className="required-star">*</span>
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                autoComplete="new-username"
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="create-user-form-group">
              <label>
                Password <span className="required-star">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                autoComplete="new-password"
                required
              />
            </div>

            {/* USER TYPE */}
            <div className="create-user-form-group">
              <label>
                User Type <span className="required-star">*</span>
              </label>
              <select
                name="userTypeId"
                value={formData.userTypeId}
                onChange={handleChange}
                required
                disabled={loadingDropdown}
              >
                <option value="">
                  {loadingDropdown ? "Loading..." : "Select User Type"}
                </option>
                {userTypes.map((type) => (
                  <option key={type.id ?? type.Id} value={type.id ?? type.Id}>
                    {type.text || type.Text || type.name || type.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* ROLE */}
            <div className="create-user-form-group">
              <label>
                Role <span className="required-star">*</span>
              </label>
              <select
                value={formData.roleIds[0] || ""}
                onChange={handleRoleChange}
                required
                disabled={loadingDropdown}
              >
                <option value="">
                  {loadingDropdown ? "Loading..." : "Select Role"}
                </option>
                {roles.map((role) => (
                  <option key={role.id ?? role.Id} value={role.id ?? role.Id}>
                    {role.text || role.Text || role.name || role.Name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SUBMIT */}
          <div className="create-user-actions">
            <button
              type="submit"
              className="create-user-button"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateUser;
