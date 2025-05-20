"use client";

import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
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
import { useRoleTable } from "@/hooks/role/useRoleTable"; // ✅ Import your hook

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

      {isLoading && roles.length === 0 ? (
        <div className="text-center py-8">Loading roles...</div>
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6">
                    No roles found. Create your first role to get started.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell className="font-medium">{role.name}</TableCell>
                    <TableCell>
                      <Badge
                        variant={role.status === 1 ? "default" : "destructive"}
                      >
                        {role.status === 1 ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
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
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={3} className="text-muted-foreground">
                  Total Roles: {totalRoles}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>

          {/* Pagination */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={handlePrevious} />
              </PaginationItem>
              <PaginationItem>
                Page {currentPage} of {totalPages}
              </PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={handleNext} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will permanently delete the role:{" "}
              <strong>{roleToDelete?.name}</strong>
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
