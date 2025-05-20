import { deleteRoleById, fetchRoles } from "@/app/api/services/roleService";
import { RoleType } from "@/types/role";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 10;

export function useRoleTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [roles, setRoles] = useState<RoleType[]>([]);
  const [editingRole, setEditingRole] = useState<RoleType | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allRoles, setAllRoles] = useState<RoleType[]>([]);

  const loadRoles = async () => {
    setIsLoading(true);
    try {
      const data = await fetchRoles();
      setAllRoles(data);
      toast.success("Roles loaded successfully!", {
        duration: 2000,
      });
    } catch (error) {
      console.error(error);
      toast.error("Failed to load roles. Please try again.", {
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
    loadRoles();
  }, []);

  const totalPages = Math.ceil(allRoles.length / ITEMS_PER_PAGE);
  const paginatedRoles = allRoles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle adding a new role
  const handleAddRole = (newRole: RoleType) => {
    setRoles((prev) => [...prev, newRole]);
    toast.success(`Role "${newRole.name}" created successfully`, {
      duration: 2000,
    });
  };

  // Handle updating an existing role
  const handleUpdateRole = (updatedRole: RoleType) => {
    setRoles((prev) =>
      prev.map((role) => (role.id === updatedRole.id ? updatedRole : role))
    );
    toast.success(`Role "${updatedRole.name}" updated successfully`, {
      duration: 2000,
    });
    setEditingRole(null);
  };

  const handleDeleteClick = (role: RoleType) => {
    setRoleToDelete(role);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!roleToDelete) return;

    setIsLoading(true);
    try {
      const success = await deleteRoleById(roleToDelete.id);
      if (success) {
        setRoles((prev) => prev.filter((role) => role.id !== roleToDelete.id));
        toast.success(`Role "${roleToDelete.name}" deleted successfully`, {
          duration: 2000,
          // You could add an "Undo" action here if your backend supports it
          // action: {
          //   label: "Undo",
          //   onClick: () => console.log("Undo Delete"),
          // },
        });
      } else {
        toast.error(
          `Failed to delete role "${roleToDelete.name}. Please try again."`,
          {
            duration: 3000,
          }
        );
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete role. Please try again.", {
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  const handleEditClick = (role: RoleType) => {
    setEditingRole(role);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return {
    roles: paginatedRoles,
    totalRoles: allRoles.length,
    currentPage,
    totalPages,
    isLoading,
    editingRole,
    setEditingRole,
    roleToDelete,
    setRoleToDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    handleAddRole,
    handleUpdateRole,
    handleDeleteClick,
    handleDeleteConfirm,
    handleEditClick,
    handlePrevious,
    handleNext,
  };
}
