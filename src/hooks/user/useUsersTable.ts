"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  fetchUsersAndRoles,
  deleteUserById,
} from "@/app/api/services/userService";
import { UserType } from "@/types/user";
import { RoleType } from "@/types/role";

const ITEMS_PER_PAGE = 10;

export function useUsersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [users, setUsers] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { usersData, rolesData } = await fetchUsersAndRoles();
      setUsers(usersData);
      setRoles(rolesData);
      toast.success("Users loaded successfully!", { duration: 2000 });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load users. Please try again.", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const totalPages = Math.ceil(users.length / ITEMS_PER_PAGE);
  const paginatedUsers = users.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddUser = (newUser: UserType) => {
    setUsers((prev) => [...prev, newUser]);
    toast.success(`User "${newUser.name}" created successfully`, {
      description: `Assigned role: ${newUser.role?.name || "Unknown"}`,
      duration: 2000,
    });
  };

  const handleUpdateUser = (updatedUser: UserType) => {
    setUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    toast.success(`User "${updatedUser.name}" updated successfully`, {
      description: `Role updated to: ${updatedUser.role?.name || "Unknown"}`,
      duration: 2000,
    });
    setEditingUser(null);
  };

  const handleDeleteClick = (user: UserType) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    setIsLoading(true);
    try {
      const success = await deleteUserById(userToDelete.id);
      if (success) {
        setUsers((prev) => prev.filter((user) => user.id !== userToDelete.id));
        toast.success(`User "${userToDelete.name}" deleted successfully`, {
          description: `User with email "${userToDelete.email}" has been permanently removed.`,
          duration: 2000,
        });
      } else {
        toast.error(
          `Failed to delete user "${userToDelete.name}". Please try again.`,
          {
            description:
              "There was an issue deleting the user from the system.",
            duration: 3000,
          }
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete user. Please try again.", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    }
  };

  const handleEditClick = (user: UserType) => {
    setEditingUser(user);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return {
    users,
    roles,
    editingUser,
    setEditingUser,
    userToDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isLoading,
    currentPage,
    totalPages,
    paginatedUsers,
    handleAddUser,
    handleUpdateUser,
    handleDeleteClick,
    handleDeleteConfirm,
    handleEditClick,
    handlePrevious,
    handleNext,
  };
}
