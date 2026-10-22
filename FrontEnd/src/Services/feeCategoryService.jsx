// =====================================================
// FEE CATEGORY SERVICE
// =====================================================

import { getToken } from "../Utils/auth";

// =====================================================
// BASE API URL
// =====================================================

const API_URL = "/api/";

// =====================================================
// COMMON HEADERS
// =====================================================

const getHeaders = () => {
  const token = getToken();

  return {
    "Content-Type": "application/json",
    ...(token && {
      Authorization: `Bearer ${token}`,
    }),
  };
};

// =====================================================
// HANDLE RESPONSE
// =====================================================

const handleResponse = async (response) => {
  let data = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Unauthorized. Please login again.");
    }

    if (response.status === 403) {
      throw new Error("You are not authorized to perform this action.");
    }

    if (response.status === 404) {
      throw new Error(
        data?.errors?.[0] || data?.Errors?.[0] || "Fee Category not found.",
      );
    }

    throw new Error(
      data?.errors?.[0] ||
        data?.Errors?.[0] ||
        data?.message ||
        data?.Message ||
        "Something went wrong.",
    );
  }

  return data;
};

// =====================================================
// GET ALL FEE CATEGORIES
// =====================================================

export const getAllFeeCategories = async () => {
  const response = await fetch(`${API_URL}FeeCategory/GetAllFeeCategory`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  return data?.Data ?? data?.data ?? [];
};

// =====================================================
// GET FEE CATEGORY BY ID
// =====================================================

export const getFeeCategoryById = async (id) => {
  if (!id && id !== 0) {
    throw new Error("Fee Category ID is required.");
  }

  const response = await fetch(
    `${API_URL}FeeCategory/GetFeeCategoryById/${id}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  return data?.Data ?? data?.data ?? null;
};

// =====================================================
// GET FEE CATEGORY BY NAME
// =====================================================

export const getFeeCategoryByName = async (name) => {
  if (!name || !String(name).trim()) {
    throw new Error("Category Name is required.");
  }

  const response = await fetch(
    `${API_URL}FeeCategory/GetFeeCategoryByName/${encodeURIComponent(
      String(name).trim(),
    )}`,
    {
      method: "GET",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  return data?.Data ?? data?.data ?? [];
};

// =====================================================
// CREATE FEE CATEGORY
// =====================================================

export const createFeeCategory = async (feeCategoryData) => {
  if (!feeCategoryData) {
    throw new Error("Fee Category data is required.");
  }

  const categoryName = String(
    feeCategoryData.categoryName ?? feeCategoryData.CategoryName ?? "",
  ).trim();

  // If a category with this name was soft-deleted (inactive), reactivate it!
  try {
    const all = await getAllFeeCategories();
    const existing = (Array.isArray(all) ? all : []).find(
      (c) =>
        (c.categoryName ?? c.CategoryName ?? "").toLowerCase().trim() ===
        categoryName.toLowerCase(),
    );

    if (existing) {
      const isExistingActive = Boolean(existing.isActive ?? existing.IsActive);

      if (isExistingActive) {
        throw new Error("Fee Category already exists.");
      }

      // Found an inactive/soft-deleted category with the same name:
      // Reactivate and update its details!
      const existingId = Number(existing.id ?? existing.Id);
      const updatePayload = {
        id: existingId,
        Id: existingId,
        categoryName: categoryName,
        description:
          feeCategoryData.description ?? feeCategoryData.Description ?? null,
        isActive:
          feeCategoryData.isActive !== undefined
            ? Boolean(feeCategoryData.isActive)
            : true,
      };

      await updateFeeCategory(existingId, updatePayload);
      return { ...existing, ...updatePayload };
    }
  } catch (checkErr) {
    if (checkErr.message === "Fee Category already exists.") {
      throw checkErr;
    }
    console.warn("Soft-delete reactivation check:", checkErr);
  }

  const response = await fetch(`${API_URL}FeeCategory/CreateFeeCategory`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(feeCategoryData),
  });

  const data = await handleResponse(response);

  return data?.Data ?? data?.data ?? null;
};

// =====================================================
// GET FEE CATEGORY DROPDOWN
// =====================================================

export const getFeeCategoryDropdown = async () => {
  const response = await fetch(`${API_URL}FeeCategory/Dropdown`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = await handleResponse(response);

  const dropdownData = data?.Data ?? data?.data ?? [];

  return dropdownData
    .filter((item) => (item.isActive ?? item.IsActive) !== false)
    .map((item) => ({
      id: item.id ?? item.Id,
      code: item.code ?? item.Code ?? null,
      text: item.text ?? item.Text,
      isActive: item.isActive ?? item.IsActive ?? true,
    }));
};

// =====================================================
// UPDATE FEE CATEGORY
// =====================================================

export const updateFeeCategory = async (id, feeCategoryData) => {
  if (!id && id !== 0) {
    throw new Error("Fee Category ID is required.");
  }

  if (!feeCategoryData) {
    throw new Error("Fee Category data is required.");
  }

  const numericId = Number(id);

  const payload = {
    id: numericId,
    Id: numericId,
    ...feeCategoryData,
    id: numericId,
    Id: numericId,
  };

  const response = await fetch(
    `${API_URL}FeeCategory/UpdateFeeCategory/${numericId}`,
    {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(payload),
    },
  );

  const data = await handleResponse(response);

  return data?.Data ?? data?.data ?? false;
};

// =====================================================
// DELETE FEE CATEGORY
// =====================================================

export const deleteFeeCategory = async (id) => {
  if (!id && id !== 0) {
    throw new Error("Fee Category ID is required.");
  }

  const response = await fetch(
    `${API_URL}FeeCategory/DeleteFeeCategory/${id}`,
    {
      method: "DELETE",
      headers: getHeaders(),
    },
  );

  const data = await handleResponse(response);

  return data?.Data ?? data?.data ?? false;
};
