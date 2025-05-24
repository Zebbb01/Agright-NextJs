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
import { DataTable } from "@/components/data-table";
import { DataTableColumn } from "@/types/data-table";
// TableCell and TableRow are no longer needed here

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
  } = useRoleTable();

  const columns: DataTableColumn<RoleType>[] = [
    { header: "Role", accessor: "name", className: "font-medium" },
    {
      header: "Status",
      accessor: (role) => (
        <Badge variant={role.status === 1 ? "default" : "destructive"}>
          {role.status === 1 ? "Active" : "Inactive"}
        </Badge>
      ),
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

      <DataTable<RoleType>
        columns={columns}
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
                totalItems: totalRoles, // Pass total items for footer calculation
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