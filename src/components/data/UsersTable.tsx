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
// TableRow and TableCell are no longer needed here

export default function UsersTable() {
  const {
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
  } = useUsersTable();

  const columns: DataTableColumn<UserType>[] = [
    { header: "Name", accessor: "name", className: "font-medium" },
    { header: "Email", accessor: "email" },
    {
      header: "Role",
      accessor: (user) => (
        <Badge variant="default">
          {user.role?.name ?? "Unknown Role"}
        </Badge>
      ),
    },
  ];

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

      <DataTable<UserType>
        columns={columns}
        data={paginatedUsers}
        isLoading={isLoading}
        noDataMessage="No users found. Create your first user to get started."
        pagination={
          totalPages > 1
            ? {
                currentPage,
                totalPages,
                onPreviousPage: handlePrevious,
                onNextPage: handleNext,
                totalItems: users.length, // Pass total items for footer calculation
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