import { useEffect, useState } from "react";
import { updateUser } from "@/services";
import { EditUserModalProps } from "@/types/auth";

export function useEditUserForm({
  editingUser,
  roles,
  onUpdateUser,
  setEditingUser,
}: EditUserModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changePassword, setChangePassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingUser) {
      setUsername(editingUser.name);
      setEmail(editingUser.email);
      setSelectedRole(editingUser.role?.name || "");
      setPassword("");
      setConfirmPassword("");
      setChangePassword(false);
      setError(null);
    }
  }, [editingUser]);

  const validateForm = () => {
    if (!username.trim()) {
      setError("Username cannot be empty");
      return false;
    }
    if (!email.trim()) {
      setError("Email cannot be empty");
      return false;
    }
    if (changePassword) {
      if (!password.trim()) {
        setError("Password cannot be empty");
        return false;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    }
    if (!selectedRole) {
      setError("Please select a role");
      return false;
    }
    return true;
  };

  const handleUpdateUser = async () => {
    if (!editingUser || !validateForm()) return;

    setError(null);
    setLoading(true);

    try {
      const selectedRoleObject = roles.find(
        (role) => role.name === selectedRole
      );
      const updated = await updateUser({
        id: editingUser.id,
        username,
        email,
        roleName: selectedRole,
        ...(changePassword && { password }),
      });

      onUpdateUser({ ...updated, role: selectedRoleObject || null });
      setEditingUser(null);
    } catch (err) {
      console.error(err);
      setError("Failed to update user. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    selectedRole,
    setSelectedRole,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    changePassword,
    setChangePassword,
    loading,
    error,
    setError,
    handleUpdateUser,
  };
}
