"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import UsersPanel from "../widget/auth/user/UsersPanel";
import EditUserModal from "../widget/auth/user/EditUserModal";
import { useUsersTable } from "@/hooks/user/useUsersTable";
import { UserType } from "@/types/user";
import { DataTable } from "@/components/data-table";
import { DataTableColumn } from "@/types/data-table";
import { DataTableControls } from "@/components/data-table-controls"; // Import the new component

export default function UsersTable() {
  const {
    // Keep existing states/handlers
    roles,
    editingUser,
    setEditingUser,
    userToDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    isLoading,
    handleAddUser,
    handleUpdateUser,
    handleDeleteClick,
    handleDeleteConfirm,
    handleEditClick,

    // New states/handlers for search and pagination
    filteredAndPaginatedUsers, // Use the new filtered and paginated data
    totalFilteredUsers, // Total count of filtered users
    currentPage,
    totalPages,
    searchTerm,
    setSearchTerm,
    visibleColumnIds,
    handleColumnVisibilityChange,
    displayedColumns, // Use the new displayed columns
    handlePrevious,
    handleNext,
  } = useUsersTable();

  // Define all possible columns here, including their IDs, searchable, and toggleable properties
  // These will be used by DataTableControls and filtered by useUsersTable for DataTable
  const allColumns: DataTableColumn<UserType>[] = [
    {
      id: "name", // Add unique ID
      header: "Name",
      accessor: "name",
      className: "font-medium",
      searchable: true,
      toggleable: true,
    },
    {
      id: "email", // Add unique ID
      header: "Email",
      accessor: "email",
      searchable: true,
      toggleable: true,
    },
    {
      id: "role", // Add unique ID
      header: "Role",
      accessor: (user) => user.role?.name ?? "Unknown Role", // For search, use the string directly
      // For display, you might still render the Badge within DataTable's column definition if needed
      // but for DataTableControls, the string value is sufficient for header and search
      searchable: true,
      toggleable: true,
    },
  ];

  // Re-define columns array for DataTable to render the Badge,
  // while still using the accessor for search in the hook.
  // This is a common pattern when the search needs the raw value,
  // but the display needs a ReactNode.
  const columnsForDataTable: DataTableColumn<UserType>[] = displayedColumns.map(
    (col) => {
      if (col.id === "role") {
        return {
          ...col,
          accessor: (user) => (
            <Badge variant="default">
              {user.role?.name ?? "Unknown Role"}
            </Badge>
          ),
        };
      }
      return col;
    }
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Users</h2>
        <UsersPanel
          roles={roles}
          onAddUser={handleAddUser}
          editingUser={null}
          setEditingUser={setEditingUser}
        />
      </div>

      <EditUserModal
        editingUser={editingUser}
        setEditingUser={setEditingUser}
        onUpdateUser={handleUpdateUser}
        roles={roles}
      />

      {/* Add DataTableControls here */}
      <DataTableControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        columns={allColumns} // Pass all defined columns to controls for toggling
        visibleColumnIds={visibleColumnIds}
        onColumnVisibilityChange={handleColumnVisibilityChange}
      />

      <DataTable<UserType>
        columns={columnsForDataTable} // Use the adjusted columns for rendering
        data={filteredAndPaginatedUsers} // Use the filtered and paginated data
        isLoading={isLoading}
        noDataMessage="No users found. Create your first user to get started."
        pagination={
          totalPages > 1
            ? {
                currentPage,
                totalPages,
                onPreviousPage: handlePrevious,
                onNextPage: handleNext,
                totalItems: totalFilteredUsers, // Pass total count of filtered users
              }
            : undefined
        }
        renderRowActions={(user) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleEditClick(user)}
                className="cursor-pointer"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(user)}
                className="text-red-600 cursor-pointer focus:text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the user "
              <strong>{userToDelete?.name}</strong>". This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}