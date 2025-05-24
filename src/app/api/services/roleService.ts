import type { RoleType } from "@/types/user";

export async function fetchRoles(): Promise<RoleType[]> {
  const res = await fetch("/api/routes/auth/roles");
  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
}

export async function createRole(roleName: string): Promise<RoleType> {
  const res = await fetch("/api/routes/auth/roles", {
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

export async function updateRole(id: number, data: { name: string }): Promise<RoleType> {
  // Get existing role first to preserve status
  const existingRole = await fetch(`/api/routes/auth/roles?id=${id}`).then(res => {
    if (!res.ok) throw new Error("Failed to fetch role details");
    return res.json();
  });
  
  // PUT expects full body with id + all data fields
  const res = await fetch("/api/routes/auth/roles", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      id,
      name: data.name,
      status: existingRole.status // Preserve existing status
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
    const response = await fetch("/api/routes/auth/roles", {
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