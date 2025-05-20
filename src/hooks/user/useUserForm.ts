// src/hooks/useUserForm.ts
import { useState } from "react";
import { toast } from "sonner";
import { createUser } from "@/app/api/helper/userHelpers";
import { UserType } from "@/types/user";
import { RoleType } from "@/types/role";

export function useUserForm(roles: RoleType[], onAddUser: (user: UserType) => void) {
  const [open, setOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateForm = () => {
    if (!username.trim()) return setError("Username cannot be empty"), false;
    if (!email.trim()) return setError("Email cannot be empty"), false;
    if (!password.trim()) return setError("Password cannot be empty"), false;
    if (password !== confirmPassword) return setError("Passwords do not match"), false;
    if (!selectedRole) return setError("Please select a role"), false;
    return true;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    setError(null);
    setLoading(true);
    try {
      const newUser = await createUser({ username, email, password, roleName: selectedRole });
      const createdRole = roles.find((role) => role.name === selectedRole);
      const userWithRole: UserType = { ...newUser, role: createdRole || null };

      onAddUser(userWithRole);
      toast.success(`User "${username}" created successfully`, {
        description: `Assigned role: ${createdRole?.name || "Unknown"}`,
        duration: 2000,
      });
      handleClose();
    } catch (err) {
      toast.error("Failed to create user. Please try again.", {
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setSelectedRole("");
    setError(null);
  };

  return {
    open,
    setOpen,
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    selectedRole,
    setSelectedRole,
    loading,
    error,
    handleCreateUser,
    handleClose,
    setError,
  };
}
