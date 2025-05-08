"use client";

import {
  Table,
  TableBody,
  TableCaption,
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
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import RolesPanel from "../widget/auth/RolesPanel";
import { useState } from "react";

const roles = [
  {
    id: 1,
    name: "Admin",
    status: "active",
    permissions: [
      { name: "Manage Users", active: true },
      { name: "View Reports", active: true },
      { name: "Delete Records", active: false },
    ],
  },
  {
    id: 2,
    name: "Encoder",
    status: "inactive",
    permissions: [
      { name: "Input Data", active: true },
      { name: "Edit Data", active: true },
      { name: "View Reports", active: false },
    ],
  },
];

const ITEMS_PER_PAGE = 15

export default function RolesTable() {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(roles.length / ITEMS_PER_PAGE)
  const paginatedRoles = roles.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  return (
    <>
      <RolesPanel />
      <Table>
          <TableHeader>
          <TableRow>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Active Permissions</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.map((role) => (
            <TableRow key={role.id}>
              <TableCell>{role.name}</TableCell>
              <TableCell>
                <Badge variant={role.status === "active" ? "default" : "destructive"}>
                  {role.status.charAt(0).toUpperCase() + role.status.slice(1)}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">
                  {
                    role.permissions.filter((permission) => permission.active).length
                  }
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>Total Roles: {roles.length}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious onClick={handlePrevious} className={currentPage === 1 ? "pointer-events-none opacity-50" : ""} />
              </PaginationItem>
              <PaginationItem>
                Page {currentPage} of {totalPages}
              </PaginationItem>
              <PaginationItem>
                <PaginationNext onClick={handleNext} className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
          
    </>
  );
}
