// Get JWT token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Get logged-in username
export const getUsername = () => {
  return localStorage.getItem("username");
};

// Decode JWT token payload
export const getTokenPayload = () => {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    const decodedPayload = atob(
      payload.replace(/-/g, "+").replace(/_/g, "/")
    );

    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Invalid JWT token:", error);
    return null;
  }
};

// Get logged-in user's role
export const getRole = () => {
  const payload = getTokenPayload();

  return (
    payload?.role ||
    payload?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
    payload?.Role ||
    localStorage.getItem("role") ||
    localStorage.getItem("userRole") ||
    null
  );
};

// Check if current logged-in user is Super Admin
export const isSuperAdminRole = () => {
  const role = getRole();
  if (!role) return false;
  const normalized = String(role).toLowerCase().replace(/[\s_-]+/g, "");
  return normalized === "superadmin";
};

// Check if current logged-in user is Admin (regular Admin, not Super Admin)
export const isAdminRole = () => {
  const role = getRole();
  if (!role) return false;
  const normalized = String(role).toLowerCase().replace(/[\s_-]+/g, "");
  return normalized === "admin";
};

// Check if current logged-in user is Operator
export const isOperatorRole = () => {
  const role = getRole();
  if (!role) return false;
  const normalized = String(role).toLowerCase().replace(/[\s_-]+/g, "");
  return normalized === "operator";
};

// Check if current logged-in user is Office Employee
export const isOfficeEmployeeRole = () => {
  const role = getRole();
  if (!role) return false;
  const normalized = String(role).toLowerCase().replace(/[\s_-]+/g, "");
  return normalized === "officeemployee" || normalized === "officestaff";
};

// Check if current logged-in user is Student
export const isStudentRole = () => {
  const role = getRole();
  if (!role) return false;
  const normalized = String(role).toLowerCase().replace(/[\s_-]+/g, "");
  return normalized === "student";
};

// Check if current logged-in user is Teacher
export const isTeacherRole = () => {
  const role = getRole();
  if (!role) return false;
  const normalized = String(role).toLowerCase().replace(/[\s_-]+/g, "");
  return normalized === "teacher";
};

// Check if current logged-in user has Profile Card feature
// Rule: Profile concept is applied to Operator, Office Employee, Student, and Teacher (NEVER Admin or Super Admin)
export const hasProfileFeature = () => {
  return (
    isOperatorRole() ||
    isOfficeEmployeeRole() ||
    isStudentRole() ||
    isTeacherRole()
  );
};

// Helper to check if a specific user record / data belongs to Super Admin
export const isSuperAdminRecord = (user, rolesList = [], userTypesList = []) => {
  if (!user) return false;

  // 1. Check direct role or userType strings
  const directRole = String(
    user.role || user.Role || user.roleName || user.RoleName || ""
  ).toLowerCase().replace(/[\s_-]+/g, "");
  if (directRole === "superadmin") return true;

  const directType = String(
    user.userType || user.UserType || user.typeName || user.TypeName || ""
  ).toLowerCase().replace(/[\s_-]+/g, "");
  if (directType === "superadmin") return true;

  // 2. Check roleIds against rolesList
  const roleIds = user.roleIds || user.RoleIds;
  if (Array.isArray(roleIds) && rolesList.length > 0) {
    const hasSuperAdminRole = roleIds.some((rId) => {
      const matched = rolesList.find(
        (r) => String(r.id ?? r.Id) === String(rId)
      );
      const name = String(matched?.text || matched?.Text || matched?.name || matched?.Name || "").toLowerCase().replace(/[\s_-]+/g, "");
      return name === "superadmin";
    });
    if (hasSuperAdminRole) return true;
  }

  // 3. Check userTypeId against userTypesList
  const userTypeId = user.userTypeId ?? user.UserTypeId;
  if (userTypeId && userTypesList.length > 0) {
    const matchedType = userTypesList.find(
      (t) => String(t.id ?? t.Id) === String(userTypeId)
    );
    const typeName = String(matchedType?.text || matchedType?.Text || matchedType?.name || matchedType?.Name || "").toLowerCase().replace(/[\s_-]+/g, "");
    if (typeName === "superadmin") return true;
  }

  // 4. Check username
  const uname = String(user.username || user.Username || "").toLowerCase();
  if (uname === "superadmin") return true;

  return false;
};

// Helper to check if a specific user record belongs to Admin or Super Admin
export const isAdminOrSuperAdminRecord = (user, rolesList = [], userTypesList = []) => {
  if (!user) return false;
  if (isSuperAdminRecord(user, rolesList, userTypesList)) return true;

  const directRole = String(
    user.role || user.Role || user.roleName || user.RoleName || ""
  ).toLowerCase().replace(/[\s_-]+/g, "");
  if (directRole === "admin" || directRole === "superadmin") return true;

  const directType = String(
    user.userType || user.UserType || user.typeName || user.TypeName || ""
  ).toLowerCase().replace(/[\s_-]+/g, "");
  if (directType === "admin" || directType === "superadmin") return true;

  const roleIds = user.roleIds || user.RoleIds;
  if (Array.isArray(roleIds) && rolesList.length > 0) {
    const hasAdminRole = roleIds.some((rId) => {
      const matched = rolesList.find((r) => String(r.id ?? r.Id) === String(rId));
      const name = String(matched?.text || matched?.Text || matched?.name || matched?.Name || "").toLowerCase().replace(/[\s_-]+/g, "");
      return name === "admin" || name === "superadmin";
    });
    if (hasAdminRole) return true;
  }

  const userTypeId = user.userTypeId ?? user.UserTypeId;
  if (userTypeId && userTypesList.length > 0) {
    const matchedType = userTypesList.find((t) => String(t.id ?? t.Id) === String(userTypeId));
    const typeName = String(matchedType?.text || matchedType?.Text || matchedType?.name || matchedType?.Name || "").toLowerCase().replace(/[\s_-]+/g, "");
    if (typeName === "admin" || typeName === "superadmin") return true;
  }

  const uname = String(user.username || user.Username || "").toLowerCase();
  if (uname === "admin" || uname === "superadmin") return true;

  return false;
};

// Helper to check if a user is an Operator
export const isOperatorRecord = (user, rolesList = [], userTypesList = []) => {
  if (!user) return false;
  const directRole = String(
    user.role || user.Role || user.roleName || user.RoleName || user.designation || user.Designation || ""
  ).toLowerCase().replace(/[\s_-]+/g, "");
  if (directRole === "operator") return true;

  const directType = String(
    user.userType || user.UserType || user.typeName || user.TypeName || ""
  ).toLowerCase().replace(/[\s_-]+/g, "");
  if (directType === "operator") return true;

  const roleIds = user.roleIds || user.RoleIds;
  if (Array.isArray(roleIds) && rolesList.length > 0) {
    const hasOp = roleIds.some((rId) => {
      const matched = rolesList.find((r) => String(r.id ?? r.Id) === String(rId));
      const name = String(matched?.text || matched?.Text || matched?.name || matched?.Name || "").toLowerCase().replace(/[\s_-]+/g, "");
      return name === "operator";
    });
    if (hasOp) return true;
  }

  const userTypeId = user.userTypeId ?? user.UserTypeId;
  if (userTypeId && userTypesList.length > 0) {
    const matchedType = userTypesList.find((t) => String(t.id ?? t.Id) === String(userTypeId));
    const typeName = String(matchedType?.text || matchedType?.Text || matchedType?.name || matchedType?.Name || "").toLowerCase().replace(/[\s_-]+/g, "");
    if (typeName === "operator") return true;
  }

  return false;
};

// Helper to check if a user record is restricted for an Operator
// Rule: Operator cannot see Admin, Super Admin, OR Operator accounts
export const isRestrictedForOperator = (targetUser, loggedInUsername, rolesList = [], userTypesList = []) => {
  if (!targetUser) return false;

  // 1. Cannot see Admin or Super Admin
  if (isAdminOrSuperAdminRecord(targetUser, rolesList, userTypesList)) return true;

  // 2. Cannot see Operator accounts
  if (isOperatorRecord(targetUser, rolesList, userTypesList)) {
    return true;
  }

  return false;
};

// Get logged-in user's UserId
export const getUserId = () => {
  const payload = getTokenPayload();

  return payload?.UserId || payload?.nameid || null;
};

// Save authentication information
export const saveAuth = (username, token) => {
  localStorage.setItem("username", username);
  localStorage.setItem("token", token);
};

// Clear authentication information
export const clearAuth = () => {
  localStorage.removeItem("username");
  localStorage.removeItem("token");
};

// Check whether user is logged in
export const isAuthenticated = () => {
  const token = getToken();
  return !!token;
};