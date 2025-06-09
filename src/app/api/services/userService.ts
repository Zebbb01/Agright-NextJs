export async function fetchUsersAndRoles() {
  try {
    const [usersRes, rolesRes] = await Promise.all([
      // CORRECTED: Changed /api/routes/auth/users to /api/auth/users
      fetch("/api/auth/users"),
      // CORRECTED: Changed /api/routes/auth/roles to /api/auth/roles
      fetch("/api/auth/roles"),
    ]);

    if (!usersRes.ok || !rolesRes.ok) {
      // It's good practice to get more specific error messages here if possible
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
  if (!confirm("Are you sure you want to delete this user?")) return false;

  try {
    // CORRECTED: Changed /api/routes/auth/users to /api/auth/users
    const response = await fetch("/api/auth/users", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId }),
    });

    if (!response.ok) {
      const data = await response.json();
      alert(`Failed to delete user: ${data.error || response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    alert("Failed to delete user.");
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
  // CORRECTED: Changed /api/routes/auth/users to /api/auth/users
  const response = await fetch("/api/auth/users", {
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

// Edit user
export async function updateUser(userData: {
  id: number;
  username: string;
  email: string;
  password?: string;
  roleName: string;
}) {
  // CORRECTED: Changed /api/routes/auth/users to /api/auth/users
  const response = await fetch("/api/auth/users", {
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