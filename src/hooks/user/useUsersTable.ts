"use client";

import { useEffect, useState, useMemo } from "react"; // Import useMemo
import { toast } from "sonner";
import {
  fetchUsersAndRoles,
  deleteUserById,
} from "@/services";
import { UserType, RoleType } from "@/types/user";
import { DataTableColumn } from "@/types/data-table"; // Import DataTableColumn

const ITEMS_PER_PAGE = 10;

export function useUsersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [allUsers, setAllUsers] = useState<UserType[]>([]); // Stores all fetched users
  const [roles, setRoles] = useState<RoleType[]>([]); // Roles data
  const [isLoading, setIsLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [userToDelete, setUserToDelete] = useState<UserType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // New states for search and column visibility
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);

  // Define all columns with their properties for search and toggleability
  const allColumns: DataTableColumn<UserType>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Name",
        accessor: "name",
        className: "font-medium",
        searchable: true,
        toggleable: true,
      },
      {
        id: "email",
        header: "Email",
        accessor: "email",
        searchable: true,
        toggleable: true,
      },
      {
        id: "role",
        header: "Role",
        // The accessor here is for searching purposes.
        // It should return a string value that can be compared with the search term.
        accessor: (user) => user.role?.name ?? "Unknown Role",
        searchable: true,
        toggleable: true,
      },
    ],
    []
  );

  useEffect(() => {
    loadUsers();
  }, []);

  // Set initial visible columns based on `allColumns`
  useEffect(() => {
    setVisibleColumnIds(
      allColumns.map((col) => col.id).filter(Boolean) as string[]
    );
  }, [allColumns]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { usersData, rolesData } = await fetchUsersAndRoles();
      setAllUsers(usersData); // Set all fetched users
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

  // Filtered users based on search term
  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return allUsers;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allUsers.filter((user) =>
      allColumns.some((column) => {
        if (column.searchable) {
          const value =
            typeof column.accessor === "function"
              ? column.accessor(user)
              : (user[column.accessor as keyof UserType] as string);

          return String(value).toLowerCase().includes(lowerCaseSearchTerm);
        }
        return false;
      })
    );
  }, [allUsers, searchTerm, allColumns]);

  // Columns to display based on visibility settings
  const displayedColumns = useMemo(() => {
    return allColumns.filter((column) => visibleColumnIds.includes(column.id!));
  }, [allColumns, visibleColumnIds]);

  // Pagination logic now applies to filteredUsers
  const totalFilteredUsers = filteredUsers.length;
  const totalPages = Math.ceil(totalFilteredUsers / ITEMS_PER_PAGE);
  const filteredAndPaginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAddUser = (newUser: UserType) => {
    setAllUsers((prev) => [...prev, newUser]); // Add to allUsers
    toast.success(`User "${newUser.name}" created successfully`, {
      description: `Assigned role: ${newUser.role?.name || "Unknown"}`,
      duration: 2000,
    });
  };

  const handleUpdateUser = (updatedUser: UserType) => {
    setAllUsers((prev) =>
      prev.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    ); // Update in allUsers
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
        setAllUsers((prev) => prev.filter((user) => user.id !== userToDelete.id)); // Filter from allUsers
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

  const handleColumnVisibilityChange = (
    columnId: string,
    isChecked: boolean
  ) => {
    setVisibleColumnIds((prev) =>
      isChecked ? [...prev, columnId] : prev.filter((id) => id !== columnId)
    );
  };

  // Reset page to 1 when search term or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, visibleColumnIds]);

  return {
    users: allUsers, // Expose allUsers if needed elsewhere, though usually paginated/filtered is sufficient
    roles,
    editingUser,
    setEditingUser,
    userToDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isLoading,
    currentPage,
    totalPages,
    filteredAndPaginatedUsers, // Expose the processed data for DataTable
    totalFilteredUsers, // Expose total count for pagination footer
    handleAddUser,
    handleUpdateUser,
    handleDeleteClick,
    handleDeleteConfirm,
    handleEditClick,
    handlePrevious,
    handleNext,
    searchTerm, // Expose searchTerm
    setSearchTerm, // Expose setSearchTerm
    visibleColumnIds, // Expose visibleColumnIds
    handleColumnVisibilityChange, // Expose handleColumnVisibilityChange
    displayedColumns, // Expose displayedColumns
  };
}