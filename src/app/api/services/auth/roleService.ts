import type { RoleType } from "@/types/user";

// Get the base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""; // Fallback for safety

// Throw error if not configured in production
if (process.env.NODE_ENV === "production" && !API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in production environment.");
}

export async function fetchRoles(): Promise<RoleType[]> {
  const res = await fetch(`${API_BASE_URL}/api/auth/roles`);
  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error || "Failed to fetch roles");
  }
  return res.json();
}

export async function createRole(roleName: string): Promise<RoleType> {
  const res = await fetch(`${API_BASE_URL}/api/auth/roles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: roleName, status: 1 }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to create role");
  }

  return res.json();
}

export async function updateRole(
  id: number,
  data: { name: string }
): Promise<RoleType> {
  const existingRole = await fetch(`${API_BASE_URL}/api/auth/roles?id=${id}`).then(async (res) => {
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || "Failed to fetch role details");
    }
    return res.json();
  });

  const res = await fetch(`${API_BASE_URL}/api/auth/roles`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      name: data.name,
      status: existingRole.status,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || "Failed to update role");
  }

  return res.json();
}

export async function deleteRoleById(roleId: number): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/roles`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: roleId }),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || response.statusText);
    }

    return true;
  } catch (error) {
    console.error("Error deleting role:", error);
    throw error;
  }
}