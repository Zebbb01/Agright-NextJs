import type { RoleType } from "@/types/user";

export async function fetchRoles(): Promise<RoleType[]> {
  // CORRECTED: Changed /api/routes/auth/roles to /api/auth/roles
  const res = await fetch("/api/auth/roles");
  if (!res.ok) {
    const errorData = await res.json(); // Attempt to parse error as JSON
    throw new Error(errorData.error || "Failed to fetch roles");
  }
  return res.json();
}

export async function createRole(roleName: string): Promise<RoleType> {
  // CORRECTED: Changed /api/routes/auth/roles to /api/auth/roles
  const res = await fetch("/api/auth/roles", {
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
  // CORRECTED: Changed /api/routes/auth/roles to /api/auth/roles
  // Get existing role first to preserve status
  const existingRole = await fetch(`/api/auth/roles?id=${id}`).then(async (res) => {
    if (!res.ok) {
      const errorData = await res.json(); // Attempt to parse error as JSON
      throw new Error(errorData.error || "Failed to fetch role details");
    }
    return res.json();
  });

  // PUT expects full body with id + all data fields
  // CORRECTED: Changed /api/routes/auth/roles to /api/auth/roles
  const res = await fetch("/api/auth/roles", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      name: data.name,
      status: existingRole.status, // Preserve existing status
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
    // CORRECTED: Changed /api/routes/auth/roles to /api/auth/roles
    const response = await fetch("/api/auth/roles", {
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