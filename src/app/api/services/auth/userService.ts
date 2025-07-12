import { toast } from "sonner"; // Import toast for notifications

// Get the base URL from environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""; // Fallback for safety

// Throw error if not configured in production
if (process.env.NODE_ENV === "production" && !API_BASE_URL) {
  throw new Error("NEXT_PUBLIC_API_BASE_URL is not defined in production environment.");
}

export async function fetchUsersAndRoles() {
  try {
    const [usersRes, rolesRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/auth/users`),
      fetch(`${API_BASE_URL}/api/auth/roles`),
    ]);

    if (!usersRes.ok || !rolesRes.ok) {
      const usersError = usersRes.ok ? null : await usersRes.json();
      const rolesError = rolesRes.ok ? null : await rolesRes.json();

      throw new Error(
        `Failed to fetch users or roles: ${usersError?.error || usersRes.statusText} | ${rolesError?.error || rolesRes.statusText}`
      );
    }

    const usersData = await usersRes.json();
    const rolesData = await rolesRes.json();

    return { usersData, rolesData };
  } catch (error) {
    console.error("fetchUsersAndRoles error:", error);
    throw error;
  }
}

export async function deleteUserById(userId: number) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId }),
    });

    if (!response.ok) {
      const data = await response.json();
      toast.error(`Failed to delete user: ${data.error || response.statusText}`);
      return false;
    }

    toast.success("User deleted successfully!");
    return true;
  } catch (error) {
    toast.error("Failed to delete user.");
    console.error(error);
    return false;
  }
}

export async function createUser(userData: {
  username: string;
  email: string;
  password: string;
  roleName: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || "Failed to create user");
  }

  return await response.json();
}

export async function updateUser(userData: {
  id: number;
  username: string;
  email: string;
  password?: string;
  roleName: string;
}) {
  const response = await fetch(`${API_BASE_URL}/api/auth/users`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const { error } = await response.json();
    throw new Error(error || "Failed to update user");
  }

  return await response.json();
}