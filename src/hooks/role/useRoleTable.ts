import { deleteRoleById, fetchRoles } from "@/services";
import { RoleType } from "@/types/user";
import { useEffect, useState, useMemo } from "react"; // Import useMemo
import { toast } from "sonner";
import { DataTableColumn } from "@/types/data-table"; // Import DataTableColumn

const ITEMS_PER_PAGE = 10;

export function useRoleTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const [allRoles, setAllRoles] = useState<RoleType[]>([]); // Stores all fetched roles
  const [isLoading, setIsLoading] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleType | null>(null);
  const [roleToDelete, setRoleToDelete] = useState<RoleType | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // New states for search and column visibility
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleColumnIds, setVisibleColumnIds] = useState<string[]>([]);

  // Define columns here so they are accessible for filtering/visibility logic
  const allColumns: DataTableColumn<RoleType>[] = useMemo(
    () => [
      {
        id: "name",
        header: "Role",
        accessor: "name",
        className: "font-medium",
        searchable: true,
        toggleable: true,
      },
      {
        id: "status",
        header: "Status",
        accessor: (role) => (role.status === 1 ? "Active" : "Inactive"), // Accessor for search
        searchable: true,
        toggleable: true,
      },
    ],
    []
  );

  useEffect(() => {
    loadRoles();
  }, []);

  // Set initial visible columns based on `allColumns`
  useEffect(() => {
    setVisibleColumnIds(allColumns.map((col) => col.id).filter(Boolean) as string[]);
  }, [allColumns]);

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

  // Filtered roles based on search term
  const filteredRoles = useMemo(() => {
    if (!searchTerm) {
      return allRoles;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allRoles.filter((role) =>
      allColumns.some((column) => {
        if (column.searchable) {
          const value =
            typeof column.accessor === "function"
              ? column.accessor(role) // Use the accessor function to get the display value
              : (role[column.accessor as keyof RoleType] as string);

          // Convert value to string for comparison, especially for React.ReactNode or numbers
          return String(value).toLowerCase().includes(lowerCaseSearchTerm);
        }
        return false;
      })
    );
  }, [allRoles, searchTerm, allColumns]);

  // Columns to display based on visibility settings
  const displayedColumns = useMemo(() => {
    return allColumns.filter((column) => visibleColumnIds.includes(column.id!));
  }, [allColumns, visibleColumnIds]);

  // Pagination logic now applies to filteredRoles
  const totalRoles = filteredRoles.length;
  const totalPages = Math.ceil(totalRoles / ITEMS_PER_PAGE);
  const paginatedRoles = filteredRoles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Handle adding a new role (add to allRoles and then re-filter/paginate)
  const handleAddRole = (newRole: RoleType) => {
    setAllRoles((prev) => [...prev, newRole]);
    toast.success(`Role "${newRole.name}" created successfully`, {
      duration: 2000,
    });
  };

  // Handle updating an existing role (update in allRoles and then re-filter/paginate)
  const handleUpdateRole = (updatedRole: RoleType) => {
    setAllRoles((prev) =>
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
        setAllRoles((prev) =>
          prev.filter((role) => role.id !== roleToDelete.id)
        ); // Filter from allRoles
        toast.success(`Role "${roleToDelete.name}" deleted successfully`, {
          duration: 2000,
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

  const handleColumnVisibilityChange = (columnId: string, isChecked: boolean) => {
    setVisibleColumnIds((prev) =>
      isChecked ? [...prev, columnId] : prev.filter((id) => id !== columnId)
    );
  };

  // Reset page to 1 when search term or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, visibleColumnIds]);

  return {
    roles: paginatedRoles,
    totalRoles,
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
    searchTerm, // Expose searchTerm
    setSearchTerm, // Expose setSearchTerm
    visibleColumnIds, // Expose visibleColumnIds
    handleColumnVisibilityChange, // Expose handleColumnVisibilityChange
    displayedColumns, // Expose displayedColumns
  };
}