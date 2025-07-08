"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import RolesPanel from "../widget/auth/role/RolesPanel";
import EditRoleModal from "../widget/auth/role/EditRoleModal";
import { useRoleTable } from "@/hooks/role/useRoleTable";
import { RoleType } from "@/types/user";
import { DataTable } from "@/components/table/data-table";
import { DataTableColumn } from "@/types/data-table";
import { DataTableControls } from "@/components/table/data-table-controls"; // Import the new component

export default function RolesTable() {
  const {
    roles,
    totalRoles,
    currentPage,
    totalPages,
    isLoading,
    editingRole,
    setEditingRole,
    deleteDialogOpen,
    setDeleteDialogOpen,
    roleToDelete,
    handleAddRole,
    handleUpdateRole,
    handleDeleteClick,
    handleDeleteConfirm,
    handleEditClick,
    handlePrevious,
    handleNext,
    searchTerm, // New: from useRoleTable
    setSearchTerm, // New: from useRoleTable
    visibleColumnIds, // New: from useRoleTable
    handleColumnVisibilityChange, // New: from useRoleTable
    displayedColumns, // New: from useRoleTable
  } = useRoleTable();

  // Define all possible columns, including their IDs, searchable, and toggleable properties
  // The actual displayed columns will be filtered by `useRoleTable` based on `visibleColumnIds`
  const allColumns: DataTableColumn<RoleType>[] = [
    {
      id: "name", // Add a unique ID
      header: "Role",
      accessor: "name",
      className: "font-medium",
      searchable: true, // Make this column searchable
      toggleable: true, // Make this column toggleable
    },
    {
      id: "status", // Add a unique ID
      header: "Status",
      accessor: (role) => (
        <Badge variant={role.status === 1 ? "default" : "destructive"}>
          {role.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
      searchable: true, // Make this column searchable (based on the rendered text)
      toggleable: true, // Make this column toggleable
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Manage Roles</h2>
        <RolesPanel
          onAddRole={handleAddRole}
          editingRole={null}
          setEditingRole={setEditingRole}
        />
      </div>

      <EditRoleModal
        editingRole={editingRole}
        setEditingRole={setEditingRole}
        onUpdateRole={handleUpdateRole}
      />

      {/* Add DataTableControls here */}
      <DataTableControls
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        columns={allColumns} // Pass all defined columns
        visibleColumnIds={visibleColumnIds}
        onColumnVisibilityChange={handleColumnVisibilityChange}
      />

      <DataTable<RoleType>
        columns={displayedColumns} // Use the filtered columns from the hook
        data={roles}
        isLoading={isLoading}
        noDataMessage="No roles found. Create your first role to get started."
        pagination={
          totalPages > 1
            ? {
              currentPage,
              totalPages,
              onPreviousPage: handlePrevious,
              onNextPage: handleNext,
              totalItems: totalRoles,
            }
            : undefined
        }
        renderRowActions={(role) => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => handleEditClick(role)}
                className="cursor-pointer"
              >
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(role)}
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
              This action will permanently delete the role:{" "}
              <strong>{roleToDelete?.name}</strong>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleDeleteConfirm}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}